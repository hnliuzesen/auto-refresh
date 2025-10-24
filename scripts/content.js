let intervalId = null;
let currentInterval = null;

function startAutoRefresh(intervalSeconds) {
    stopAutoRefresh();
    currentInterval = intervalSeconds;
    intervalId = setInterval(() => {
        window.location.reload();
    }, intervalSeconds * 1000);
}

function stopAutoRefresh() {
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
    }
    currentInterval = null;
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'start') {
        startAutoRefresh(message.interval);
    } else if (message.type === 'stop') {
        stopAutoRefresh();
    }
});

chrome.runtime.sendMessage({type: 'content_ready'});
