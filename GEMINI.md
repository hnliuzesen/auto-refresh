# GEMINI.md

## Project Overview

This project is a Chrome browser extension called "Auto Refresh". It allows users to automatically refresh a web page at
a specified interval.

The extension is built with standard web technologies: JavaScript, HTML, and CSS. It does not use any external
frameworks or libraries.

The core components are:

* **`manifest.json`**: Defines the extension's properties, permissions, and components.
* **`background.js`**: The service worker that manages the extension's state, including the refresh interval for each
  tab. It uses `chrome.storage.local` to persist this state.
* **`popup/`**: Contains the UI for the extension's popup, allowing users to start/stop the refresh and set the
  interval.
    * `popup.html`: The structure of the popup.
    * `popup.js`: The logic for the popup UI, which communicates with the background script.
* **`scripts/content.js`**: A content script injected into web pages. It receives messages from the background script to
  start or stop the `window.location.reload()` timer.
* **`_locales/`**: Contains internationalization (i18n) strings for English and Chinese.

## Building and Running

This is a simple browser extension with no build process. To run it:

1. Open Google Chrome and navigate to `chrome://extensions`.
2. Enable "Developer mode".
3. Click "Load unpacked".
4. Select the `/home/liuzesen/Code/web/auto-refresh` directory.

The extension will then be installed and ready to use.

## Development Conventions

* The code is written in plain JavaScript (ES6+).
* Asynchronous operations are handled using Promises and `async/await`.
* State is managed in the `background.js` service worker and stored per-tab in `chrome.storage.local`.
* Communication between the popup, background script, and content scripts is done via `chrome.runtime.sendMessage` and
  `chrome.tabs.sendMessage`.
* The code is not formatted with any particular linter, but follows a consistent style.
