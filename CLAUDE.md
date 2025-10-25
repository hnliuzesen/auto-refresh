# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Auto Refresh is a Chrome browser extension (Manifest V3) that allows users to automatically refresh web pages at specified intervals. The extension is built with vanilla JavaScript, HTML, and CSS with no external dependencies or build process.

## Architecture

The extension uses a three-component message-passing architecture:

**Background Service Worker** (`background.js`):
- Manages per-tab refresh state using `chrome.storage.local` with keys like `tabState:<tabId>`
- Handles message routing between popup and content scripts
- Automatically restores refresh state when content scripts reload (via `content_ready` message)
- Cleans up state when tabs are closed

**Popup UI** (`popup/`):
- User interface for controlling refresh on the current active tab
- Communicates with background script via `chrome.runtime.sendMessage`
- Uses `chrome.i18n` for internationalized strings

**Content Script** (`scripts/content.js`):
- Injected into all pages at `document_idle`
- Manages the actual `setInterval` timer that calls `window.location.reload()`
- Sends `content_ready` message on load to restore state after page navigation
- Receives `start`/`stop` messages from background script

**State Management**:
- State is stored per-tab in `chrome.storage.local` as `{active: boolean, interval: number, startedAt: timestamp}`
- State persists across page navigations within a tab
- State is cleaned up when tabs are closed

## Running/Testing

No build step required. To load the extension:

1. Navigate to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select this directory

To test changes, click the refresh button on `chrome://extensions` after modifying files.

## Internationalization

The extension supports multiple languages via Chrome's i18n system:
- Message definitions in `_locales/{locale}/messages.json`
- Currently supports `en` (English) and `zh_CN` (Simplified Chinese)
- Access messages in code via `chrome.i18n.getMessage('key')`
- `manifest.json` uses `__MSG_key__` format for localized fields
