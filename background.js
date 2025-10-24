const STORAGE_PREFIX = 'tabState:';

function getStorageKey(tabId) {
    return `${STORAGE_PREFIX}${tabId}`;
}

function getTabState(tabId) {
    return new Promise((resolve) => {
        chrome.storage.local.get(getStorageKey(tabId), (result) => {
            resolve(result[getStorageKey(tabId)] || null);
        });
    });
}

function setTabState(tabId, state) {
    return new Promise((resolve) => {
        chrome.storage.local.set({[getStorageKey(tabId)]: state}, () => resolve());
    });
}

function removeTabState(tabId) {
    return new Promise((resolve) => {
        chrome.storage.local.remove(getStorageKey(tabId), () => resolve());
    });
}

function sendToContent(tabId, message) {
    chrome.tabs.sendMessage(tabId, message, () => {
        if (chrome.runtime.lastError) {
            // Content script might not be ready yet; message will be re-sent on content_ready.
            console.debug(`sendMessage to tab ${tabId} failed:`, chrome.runtime.lastError.message);
        }
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const {type} = message;

    if (type === 'get_state') {
        (async () => {
            const state = await getTabState(message.tabId);
            sendResponse(state || {active: false});
        })();
        return true;
    }

    if (type === 'start') {
        (async () => {
            const {tabId, interval} = message;
            if (!Number.isFinite(interval) || interval < 1) {
                sendResponse({success: false, error: 'Interval must be at least 1 second.'});
                return;
            }

            const state = {active: true, interval, startedAt: Date.now()};
            await setTabState(tabId, state);
            sendToContent(tabId, {type: 'start', interval});
            sendResponse({success: true});
        })();
        return true;
    }

    if (type === 'stop') {
        (async () => {
            const {tabId} = message;
            await removeTabState(tabId);
            sendToContent(tabId, {type: 'stop'});
            sendResponse({success: true});
        })();
        return true;
    }

    if (type === 'content_ready') {
        const tabId = sender.tab?.id;
        if (!tabId) {
            return; // No response needed.
        }
        (async () => {
            const state = await getTabState(tabId);
            if (state?.active) {
                sendToContent(tabId, {type: 'start', interval: state.interval});
            }
        })();
        return false;
    }

    return false;
});

chrome.tabs.onRemoved.addListener((tabId) => {
    removeTabState(tabId);
});
