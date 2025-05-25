// Background service worker for YouTube Transcript Summarizer
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings on first install
    chrome.storage.local.set({
      aiPlatform: 'chatgpt',
      customPrompt: 'Summarize this YouTube video in 3-5 key points: [transcript]',
      apiKeys: {}
    });
    
    // Open welcome page or settings
    chrome.tabs.create({
      url: chrome.runtime.getURL('popup.html')
    });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Only work on YouTube watch pages
  if (tab.url && tab.url.includes('youtube.com/watch')) {
    // Inject content script if not already injected
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    }).catch(() => {
      // Script might already be injected, that's okay
    });
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    // Return current settings
    chrome.storage.local.get(['aiPlatform', 'customPrompt', 'apiKeys']).then(result => {
      sendResponse(result);
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'saveSettings') {
    // Save settings
    chrome.storage.local.set(request.settings).then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});

// Optional: Add context menu for quick access
chrome.contextMenus.create({
  id: 'summarize-video',
  title: 'Summarize this YouTube video',
  contexts: ['page'],
  documentUrlPatterns: ['https://www.youtube.com/watch*']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'summarize-video') {
    // Inject and execute content script
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // Trigger the summarize functionality
        const event = new CustomEvent('triggerSummarize');
        document.dispatchEvent(event);
      }
    });
  }
});