// YouTube Transcript Summarizer Content Script
class YouTubeTranscriptSummarizer {
  constructor() {
    this.sidebar = null;
    this.summarizeButton = null;
    this.currentVideoId = null;
    this.transcript = '';
    this.settings = {
      aiPlatform: 'chatgpt',
      customPrompt: 'Summarize this YouTube video: [transcript]'
    };
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.observePageChanges();
    this.setupExtension();
  }

  async loadSettings() {
    const result = await chrome.storage.local.get(['aiPlatform', 'customPrompt', 'apiKeys']);
    this.settings = {
      aiPlatform: result.aiPlatform || 'chatgpt',
      customPrompt: result.customPrompt || 'Summarize this YouTube video: [transcript]',
      apiKeys: result.apiKeys || {}
    };
  }

  observePageChanges() {
    // Observer for URL changes in YouTube SPA
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        if (url.includes('/watch')) {
          setTimeout(() => this.setupExtension(), 1000);
        } else {
          this.cleanup();
        }
      }
    }).observe(document, { subtree: true, childList: true });
  }

  setupExtension() {
    if (!window.location.href.includes('/watch')) return;
    
    this.currentVideoId = this.getVideoId();
    if (!this.currentVideoId) return;

    this.createSummarizeButton();
    this.createSidebar();
  }

  getVideoId() {
    const url = new URL(window.location.href);
    return url.searchParams.get('v');
  }

  createSummarizeButton() {
    // Remove existing button
    const existingButton = document.getElementById('transcript-summarize-btn');
    if (existingButton) existingButton.remove();

    // Find the area below the video player
    const target = document.querySelector('#above-the-fold') || 
                   document.querySelector('#primary-inner') ||
                   document.querySelector('#player-theater-container');
    
    if (!target) {
      setTimeout(() => this.createSummarizeButton(), 1000);
      return;
    }

    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'transcript-summarize-btn';
    buttonContainer.className = 'transcript-button-container';
    
    const button = document.createElement('button');
    button.className = 'transcript-summarize-button';
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
      </svg>
      Summarize Video
    `;
    button.addEventListener('click', () => this.handleSummarizeClick());

    buttonContainer.appendChild(button);
    target.appendChild(buttonContainer);
  }

  createSidebar() {
    // Remove existing sidebar
    const existingSidebar = document.getElementById('transcript-sidebar');
    if (existingSidebar) existingSidebar.remove();

    const sidebar = document.createElement('div');
    sidebar.id = 'transcript-sidebar';
    sidebar.className = 'transcript-sidebar hidden';
    
    sidebar.innerHTML = `
      <div class="sidebar-header">
        <h3>Video Transcript & Summary</h3>
        <button class="close-sidebar" id="close-sidebar">×</button>
      </div>
      <div class="sidebar-content">
        <div class="tab-container">
          <button class="tab-button active" data-tab="transcript">Transcript</button>
          <button class="tab-button" data-tab="summary">Summary</button>
        </div>
        <div class="tab-content">
          <div id="transcript-tab" class="tab-pane active">
            <div class="transcript-content">
              <div id="transcript-loading" class="loading">Loading transcript...</div>
              <div id="transcript-text" class="transcript-text hidden"></div>
              <div id="transcript-error" class="error hidden">
                <p>Could not load transcript. This might be because:</p>
                <ul>
                  <li>The video doesn't have captions enabled</li>
                  <li>Captions are auto-generated and restricted</li>
                  <li>The video is private or restricted</li>
                </ul>
                <button id="copy-url-btn" class="action-button">Copy Video URL</button>
              </div>
            </div>
          </div>
          <div id="summary-tab" class="tab-pane">
            <div id="summary-content">
              <div id="summary-placeholder" class="placeholder">
                Click "Generate Summary" to create an AI summary of this video.
              </div>
              <div id="summary-loading" class="loading hidden">Generating summary...</div>
              <div id="summary-text" class="summary-text hidden"></div>
              <div id="summary-error" class="error hidden"></div>
              <button id="generate-summary-btn" class="action-button">Generate Summary</button>
            </div>
          </div>
        </div>
        <div class="sidebar-actions">
          <button id="copy-transcript-btn" class="action-button secondary hidden">Copy Transcript</button>
          <button id="copy-summary-btn" class="action-button secondary hidden">Copy Summary</button>
        </div>
      </div>
    `;

    document.body.appendChild(sidebar);
    this.sidebar = sidebar;
    this.setupSidebarEvents();
  }

  setupSidebarEvents() {
    // Close sidebar
    document.getElementById('close-sidebar').addEventListener('click', () => {
      this.sidebar.classList.add('hidden');
    });

    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Generate summary
    document.getElementById('generate-summary-btn').addEventListener('click', () => {
      this.generateSummary();
    });

    // Copy buttons
    document.getElementById('copy-transcript-btn').addEventListener('click', () => {
      this.copyToClipboard(this.transcript);
    });

    document.getElementById('copy-summary-btn').addEventListener('click', () => {
      const summaryText = document.getElementById('summary-text').textContent;
      this.copyToClipboard(summaryText);
    });

    document.getElementById('copy-url-btn').addEventListener('click', () => {
      this.copyToClipboard(window.location.href);
    });
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
  }

  async handleSummarizeClick() {
    this.sidebar.classList.remove('hidden');
    await this.loadTranscript();
  }

  async loadTranscript() {
    const loadingEl = document.getElementById('transcript-loading');
    const textEl = document.getElementById('transcript-text');
    const errorEl = document.getElementById('transcript-error');
    const copyBtn = document.getElementById('copy-transcript-btn');

    // Reset states
    loadingEl.classList.remove('hidden');
    textEl.classList.add('hidden');
    errorEl.classList.add('hidden');
    copyBtn.classList.add('hidden');

    try {
      const transcript = await this.fetchTranscript();
      if (transcript) {
        this.transcript = transcript;
        textEl.textContent = transcript;
        textEl.classList.remove('hidden');
        copyBtn.classList.remove('hidden');
      } else {
        throw new Error('No transcript available');
      }
    } catch (error) {
      console.error('Error loading transcript:', error);
      errorEl.classList.remove('hidden');
    }

    loadingEl.classList.add('hidden');
  }

  async fetchTranscript() {
    try {
      // Try to get transcript from YouTube's API
      const response = await fetch(`https://www.youtube.com/api/timedtext?lang=en&v=${this.currentVideoId}`);
      if (response.ok) {
        const xmlText = await response.text();
        return this.parseTranscriptXML(xmlText);
      }

      // Fallback: try to scrape from page
      return await this.scrapeTranscriptFromPage();
    } catch (error) {
      console.error('Error fetching transcript:', error);
      return null;
    }
  }

  parseTranscriptXML(xmlText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const textElements = xmlDoc.getElementsByTagName('text');
    
    let transcript = '';
    for (let element of textElements) {
      transcript += element.textContent + ' ';
    }
    
    return transcript.trim();
  }

  async scrapeTranscriptFromPage() {
    // Try to find transcript in the page
    const transcriptButtons = document.querySelectorAll('button[aria-label*="transcript" i], button[aria-label*="caption" i]');
    
    if (transcriptButtons.length > 0) {
      // Click the transcript button and wait for content
      transcriptButtons[0].click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Look for transcript content
      const transcriptItems = document.querySelectorAll('[data-purpose="video-description-content"] div, .ytd-transcript-segment-renderer');
      if (transcriptItems.length > 0) {
        return Array.from(transcriptItems)
          .map(item => item.textContent)
          .join(' ')
          .trim();
      }
    }
    
    return null;
  }

  async generateSummary() {
    if (!this.transcript) {
      alert('Please load the transcript first');
      return;
    }

    const loadingEl = document.getElementById('summary-loading');
    const textEl = document.getElementById('summary-text');
    const errorEl = document.getElementById('summary-error');
    const placeholderEl = document.getElementById('summary-placeholder');
    const copyBtn = document.getElementById('copy-summary-btn');
    const generateBtn = document.getElementById('generate-summary-btn');

    // Reset states
    placeholderEl.classList.add('hidden');
    loadingEl.classList.remove('hidden');
    textEl.classList.add('hidden');
    errorEl.classList.add('hidden');
    copyBtn.classList.add('hidden');
    generateBtn.disabled = true;

    try {
      const summary = await this.callAIService();
      textEl.textContent = summary;
      textEl.classList.remove('hidden');
      copyBtn.classList.remove('hidden');
    } catch (error) {
      console.error('Error generating summary:', error);
      errorEl.textContent = `Error: ${error.message}`;
      errorEl.classList.remove('hidden');
    }

    loadingEl.classList.add('hidden');
    generateBtn.disabled = false;
  }

  async callAIService() {
    const { aiPlatform, apiKeys, customPrompt } = this.settings;
    const prompt = customPrompt.replace('[transcript]', this.transcript);

    if (!apiKeys[aiPlatform]) {
      throw new Error(`Please set up your ${aiPlatform.toUpperCase()} API key in the extension settings`);
    }

    switch (aiPlatform) {
      case 'chatgpt':
        return await this.callOpenAI(prompt, apiKeys.chatgpt);
      case 'gemini':
        return await this.callGemini(prompt, apiKeys.gemini);
      case 'claude':
        return await this.callClaude(prompt, apiKeys.claude);
      default:
        throw new Error('Invalid AI platform selected');
    }
  }

  async callOpenAI(prompt, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async callGemini(prompt, apiKey) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  async callClaude(prompt, apiKey) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      // Show temporary feedback
      const originalText = event.target.textContent;
      event.target.textContent = 'Copied!';
      setTimeout(() => {
        event.target.textContent = originalText;
      }, 2000);
    });
  }

  cleanup() {
    if (this.sidebar) {
      this.sidebar.remove();
      this.sidebar = null;
    }
    
    const button = document.getElementById('transcript-summarize-btn');
    if (button) {
      button.remove();
    }
  }
}

// Initialize the extension when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new YouTubeTranscriptSummarizer();
  });
} else {
  new YouTubeTranscriptSummarizer();
}