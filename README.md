# Candy Mail 🍬

> Draft personalized cold emails instantly from any profile or webpage.

**Candy Mail** is a browser extension that uses AI to analyze the webpage you're viewing (like a LinkedIn profile, GitHub user, or company page) and draft a highly personalized cold email based on your resume and context documents.

Available for **Chrome** and **Firefox**. Supports **Google Gemini**, **OpenAI**, **Anthropic**, **Mistral AI**, and **Groq** APIs.

---

## ✨ Features

### Core Functionality
- **🌐 Universal Context**: Works on any website - LinkedIn profiles, GitHub users, company pages, job postings, and more.
- **🤖 Multi-Provider AI**: Choose between 5 leading AI providers:
  - Google Gemini (gemini-2.5-flash, gemini-2.5-pro)
  - OpenAI (gpt-5.2-pro, gpt-5-nano, gpt-4.1)
  - Anthropic (claude-sonnet-4-5, claude-haiku-4-5)
  - Mistral AI (mistral-large, mistral-medium)
  - Groq (llama-4, gpt-oss-120b)

### Document Support
- **📄 Multi-Document Upload**: Upload up to 5 documents (PDF/DOCX) - resume, portfolio, cover letter, etc.
- **🏷️ Document Labels**: Categorize each document for better context (Resume, Portfolio, Project Summary, etc.)
- **📝 Personal Notes**: Add custom instructions like "Keep it casual" or "Mention I'm looking for internships".

### User Experience
- **⌨️ Keyboard Shortcuts**:
  - `Alt+C` - Open extension popup
  - `Alt+G` - Generate email and copy to clipboard instantly
- **📊 Progress Indicator**: Animated progress bar showing generation status
- **📜 Email History**: Saves last 50 generated emails with timestamps
- **🎯 Better Error Messages**: Contextual error handling with troubleshooting tips

### Privacy & Security
- **🔒 100% Local Storage**: API keys, documents, and history stored locally in your browser
- **🚫 No Servers**: Nothing is sent to our servers - only direct API calls to your chosen AI provider
- **🔐 Secure**: Uses `chrome.storage` / `browser.storage` for encrypted local storage

---

## 📥 Installation

### Chrome / Edge / Brave
1. Download the extension from our [website](https://adityasasidhar.github.io/emails-are-getting-cold/) or clone this repo
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `extension` folder

### Firefox
1. **Install from Mozilla Add-ons**: [addons.mozilla.org/firefox/addon/candymail](https://addons.mozilla.org/en-US/firefox/addon/candymail/)
2. Click **Add to Firefox**
3. Done! The extension is ready to use.

---

## ⚙️ Setup

1. **Get an API Key** (choose one):
   | Provider | Link | Notes |
   |----------|------|-------|
   | Google Gemini | [AI Studio](https://aistudio.google.com/app/apikey) | Free tier available |
   | OpenAI | [Platform](https://platform.openai.com/api-keys) | Pay-as-you-go |
   | Anthropic | [Console](https://console.anthropic.com/) | Pay-as-you-go |
   | Mistral AI | [Console](https://console.mistral.ai/) | Free tier available |
   | Groq | [Console](https://console.groq.com/keys) | Free tier available |

2. **Configure Extension**:
   - Click the Candy Mail icon 🍬 in your toolbar
   - Click the **Settings** icon (gear) to open options
   - Select your **AI Provider** and paste your **API Key**
   - Choose your preferred **Model**
   - Upload your **Documents** (resume, portfolio, etc.)
   - (Optional) Add a **Personal Note** for tone customization

3. Click **Save**

---

## 🚀 Usage

### Using the Popup
1. Navigate to any profile page (LinkedIn, GitHub, job posting, etc.)
2. Click the **Candy Mail** icon 🍬
3. Click **Generate Email**
4. Watch the progress bar as AI analyzes the page
5. Copy the generated email or edit it directly
6. Check the **History** tab to reuse previous emails

### Using Keyboard Shortcuts
- Press `Alt+G` on any page to instantly generate an email and copy it to your clipboard
- Press `Alt+C` to open the popup

---

## 🛠️ Tech Stack

- **Browser Extensions**: Manifest V3 (Chrome) / Manifest V2 (Firefox)
- **AI Integration**: Multi-provider support with unified API handling
- **PDF.js**: Mozilla's PDF text extraction library
- **Mammoth.js**: DOCX to text conversion
- **Vanilla JS/CSS**: Lightweight, no-framework implementation
- **Apple-Inspired UI**: Dark theme with modern aesthetics

---

## 📁 Project Structure

```
├── extension/              # Chrome extension
│   ├── manifest.json
│   ├── background.js       # AI API calls & keyboard shortcuts
│   ├── popup.html/js       # Main UI with history & progress
│   ├── options.html/js     # Settings page
│   ├── content_scripts/    # Page content scraper
│   └── vendor/             # PDF.js, Mammoth.js
├── extension-firefox/      # Firefox extension (Manifest V2)
├── website/                # Landing page
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

---

## 📄 License

MIT License - feel free to use, modify, and distribute.

---

## 🔗 Links

- **Website**: [candy-mail.vercel.app](https://candy-mail.vercel.app/)
- **GitHub**: [github.com/adityasasidhar/candy-mail](https://github.com/adityasasidhar/candy-mail)

---

Made with 🍬 by [Aditya Sasidhar](https://github.com/adityasasidhar)
