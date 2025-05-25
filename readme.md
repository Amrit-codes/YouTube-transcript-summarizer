YouTube Transcript Summarizer Chrome Extension
A powerful Chrome extension that enhances your YouTube experience by showing video transcripts and generating AI-powered summaries using ChatGPT, Gemini, or Claude.

🌟 Features
Core Functionality
Transcript Sidebar: Extract and display YouTube video transcripts in an elegant sidebar
Summarize Button: Add a "Summarize Video" button below YouTube videos
AI-Powered Summaries: Generate intelligent summaries using your preferred AI platform
Multiple AI Platforms: Support for ChatGPT (OpenAI), Gemini (Google), and Claude (Anthropic)
Custom Prompts: Define your own summary prompts for personalized results
User Experience
Clean Interface: Modern, responsive design that integrates seamlessly with YouTube
Dark Mode Support: Automatically adapts to your system's dark/light mode preference
Copy Functionality: Easily copy transcripts and summaries to clipboard
Error Handling: Graceful handling of videos without transcripts
Settings Panel: Easy-to-use popup for configuring API keys and preferences
Additional Features
URL Change Detection: Works seamlessly with YouTube's single-page application
Context Menu: Right-click option to quickly summarize videos
Persistent Settings: Your preferences are saved across browser sessions
Mobile Responsive: Adapts to different screen sizes

🚀 Installation
From Source (Development)
Clone or Download this repository to your local machine
Open Chrome Extensions Page:
Go to chrome://extensions/
Enable "Developer mode" (toggle in top right)
Load the Extension:
Click "Load unpacked"
Select the folder containing the extension files
The extension should now appear in your extensions list
Setup API Keys:
Click the extension icon in the toolbar
Choose your preferred AI platform
Enter your API key (see API Setup section below)
Save your settings

🔧 API Setup

You'll need an API key from at least one of these providers:

ChatGPT (OpenAI)
Go to OpenAI Platform
Sign in or create an account
Click "Create new secret key"
Copy the key (starts with sk-)
Paste it in the extension settings
Gemini (Google)
Go to Google AI Studio
Sign in with your Google account
Click "Create API Key"
Copy the key (starts with AIza)
Paste it in the extension settings
Claude (Anthropic)
Go to Anthropic Console
Sign in or create an account
Navigate to API Keys section
Create a new API key
Copy the key (starts with sk-ant-)
Paste it in the extension settings

📖 How to Use
Navigate to YouTube: Go to any YouTube video page
Click Summarize: Look for the "Summarize Video" button below the video
View Transcript: The sidebar will open showing the video transcript
Generate Summary: Click "Generate Summary" to create an AI summary
Copy Content: Use the copy buttons to save transcript or summary
Customize: Access settings via the extension popup to customize prompts

🛠️ File Structure
youtube-transcript-summarizer/
├── manifest.json          # Extension configuration
├── content.js            # Main content script
├── background.js         # Service worker
├── popup.html           # Settings popup
├── styles.css           # Extension styles
├── icons/               # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md           # This file
🔧 Technical Details

Architecture

Manifest V3: Uses the latest Chrome extension architecture
Content Script: Injected into YouTube pages for DOM manipulation
Service Worker: Handles background tasks and extension lifecycle
Chrome Storage: Secure storage for user settings and API keys
Key Technologies
Vanilla JavaScript (ES6+)
Chrome Extensions API
YouTube Data API integration
RESTful API calls to AI services
CSS3 with modern features
Browser Compatibility
Chrome 88+ (Manifest V3 support required)
Chromium-based browsers (Edge, Brave, etc.)
🔒 Privacy & Security
Local Storage: All settings and API keys are stored locally in your browser
No Data Collection: The extension doesn't collect or transmit personal data
Secure API Calls: API keys are never logged or exposed
Minimal Permissions: Only requests necessary permissions for YouTube integration

🐛 Troubleshooting
Common Issues
"Could not load transcript" error:

Video may not have captions enabled
Captions might be auto-generated and restricted
Video could be private or age-restricted
API errors:

Check that your API key is correctly entered
Ensure you have sufficient API credits/quota
Verify the selected AI platform matches your API key
Extension not appearing:

Refresh the YouTube page
Check that you're on a /watch URL
Ensure the extension is enabled in Chrome
Reset Settings
If you encounter persistent issues:

Go to chrome://extensions/
Find "YouTube Transcript Summarizer"
Click "Remove"
Reinstall the extension
Reconfigure your settings

🚀 Future Enhancements
Batch Processing: Summarize multiple videos at once
Export Options: Save summaries as PDF or text files
Language Support: Multi-language transcript and summary support
Integration: Connect with note-taking apps like Notion or Obsidian
Analytics: Track your viewing and learning patterns
Offline Mode: Cache transcripts for offline access

🤝 Contributing
This project was created as part of an internship assessment. If you'd like to contribute:

Fork the repository
Create a feature branch
Make your changes
Test thoroughly
Submit a pull request

📄 License
This project is created for educational and assessment purposes. Please respect the terms of service of YouTube and the AI providers when using this extension.

🆘 Support
If you encounter issues or have questions:

Check the troubleshooting section above
Review your API key setup
Ensure you're using a supported browser version
Check browser console for error messages
Note: This extension requires active API keys from AI providers. Usage may incur costs based on your API provider's pricing structure.

