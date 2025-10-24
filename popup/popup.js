const intervalInput = document.getElementById('interval-input');
const toggleButton = document.getElementById('toggle-button');
const statusText = document.getElementById('status-text');

let activeTabId = null;
let isRunning = false;
let activeInterval = 10;

function sendMessage(message) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }
            resolve(response);
        });
    });
}

async function getActiveTab() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }

            resolve(tabs[0]);
        });
    });
}

function updateUi() {
    intervalInput.value = activeInterval;

    if (isRunning) {
        toggleButton.textContent = chrome.i18n.getMessage('stopButton');
        toggleButton.classList.add('stop');
        statusText.textContent = chrome.i18n.getMessage('statusOn', [activeInterval]);
    } else {
        toggleButton.textContent = chrome.i18n.getMessage('startButton');
        toggleButton.classList.remove('stop');
        statusText.textContent = chrome.i18n.getMessage('statusOff');
    }
}

async function loadState() {
    try {
        const state = await sendMessage({type: 'get_state', tabId: activeTabId});
        if (state && state.active) {
            isRunning = true;
            activeInterval = state.interval;
        } else {
            isRunning = false;
        }
    } catch (error) {
        console.error('Failed to load state', error);
        isRunning = false;
    } finally {
        updateUi();
    }
}

function validateInterval(value) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
        throw new Error(chrome.i18n.getMessage('errorInterval'));
    }

    return parsed;
}

async function handleToggleClick() {
    toggleButton.disabled = true;
    try {
        if (!activeTabId) {
            throw new Error(chrome.i18n.getMessage('errorActiveTab'));
        }

        if (isRunning) {
            const response = await sendMessage({type: 'stop', tabId: activeTabId});
            if (!response?.success) {
                throw new Error(response?.error || chrome.i18n.getMessage('errorStop'));
            }
            isRunning = false;
        } else {
            const interval = validateInterval(intervalInput.value.trim());
            const response = await sendMessage({
                type: 'start',
                tabId: activeTabId,
                interval
            });
            if (!response?.success) {
                throw new Error(response?.error || chrome.i18n.getMessage('errorStart'));
            }
            isRunning = true;
            activeInterval = interval;
        }
        updateUi();
    } catch (error) {
        console.error(error);
        await loadState();
        updateUi();
        statusText.textContent = error.message;
    } finally {
        toggleButton.disabled = false;
    }
}

async function init() {
    document.getElementById('interval-input-label').textContent = chrome.i18n.getMessage('refreshIntervalLabel');
    document.getElementById('popupTitle').textContent = chrome.i18n.getMessage('popupTitle');

    try {
        const tab = await getActiveTab();
        if (!tab) {
            statusText.textContent = chrome.i18n.getMessage('errorNoActiveTab');
            toggleButton.disabled = true;
            return;
        }

        activeTabId = tab.id;
        await loadState();
    } catch (error) {
        console.error('Initialization failed', error);
        statusText.textContent = error.message;
        toggleButton.disabled = true;
    }
}

toggleButton.addEventListener('click', handleToggleClick);

init();
