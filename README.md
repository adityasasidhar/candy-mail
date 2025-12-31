# Candy Mail 🍬

> Draft personalized cold emails instantly from any profile or webpage.

**Candy Mail** is a Chrome Extension that uses AI to analyze the webpage you're viewing (like a LinkedIn profile, GitHub user, or company "About" page) and draft a highly personalized cold email based on your resume.

Supports **Google Gemini**, **OpenAI**, **Anthropic**, **Mistral AI**, and **Groq** APIs.

![Candy Mail Logo](extension/logo.png)

## Features

- **🍬 Universal Context**: Works on any website, analyzing the visible text to understand the recipient.
- **🤖 Multi-Provider Support**: Choose between Gemini, OpenAI, Anthropic, Mistral, or Groq for email generation.
- **📄 Resume Integration**: Upload your PDF or DOCX resume once. It's automatically used to find connection points for every email.
- **📝 Personal Notes**: Add custom instructions like "Keep it casual", "Mention I'm looking for a job", or "Ask for a coffee chat".
- **🔒 Privacy First**: Your API key, Resume, and Notes are stored **locally** in your browser (`chrome.storage.sync`). Nothing is sent to our servers.

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/adityasasidhar/emails-are-getting-cold.git
   ```
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top right corner).
4. Click **Load unpacked**.
5. Select the `extension` directory inside the cloned folder.

## Setup

1. **Get an API Key** (choose one):
   - [Google AI Studio](https://aistudio.google.com/app/apikey) - Gemini API (free tier available)
   - [OpenAI Platform](https://platform.openai.com/api-keys) - OpenAI API
   - [Anthropic Console](https://console.anthropic.com/) - Claude API
   - [Mistral AI Console](https://console.mistral.ai/) - Mistral API
   - [Groq Console](https://console.groq.com/keys) - Groq API (free tier available)
2. **Configure Extension**:
   - Click the Candy Mail icon 🍬 in your toolbar.
   - Click the **Settings/Gear** icon (or right-click the extension icon > **Options**).
3. **Add Your Details**:
   - Select your **LLM Provider** (Gemini, OpenAI, Anthropic, Mistral, or Groq).
   - Paste your **API Key** for the selected provider.
   - Choose your preferred **Model**.
   - Upload your **Resume** (PDF/DOCX) or paste the text directly.
   - (Optional) Add a **Personal Note** to customize the tone/goal (e.g., "I am looking for SDE intern roles").
4. Click **Save**.

## Usage

1. Navigate to any profile page (LinkedIn, GitHub, Twitter, Company Team Page, etc.).
2. Click the **Candy Mail** icon 🍬.
3. Click **Draft from Page Context**.
4. Watch as the AI analyzes the page content + your resume to generate a personalized email.
5. Click **Copy to Clipboard** and send!

## Tech Stack

- **Manifest V3**: Modern Chrome Extension architecture.
- **Multi-Provider LLM**: Gemini, OpenAI, Anthropic, Mistral, and Groq API support.
- **PDF.js**: Client-side PDF text extraction.
- **Mammoth.js**: Client-side DOCX text extraction.
- **Vanilla JS/CSS**: Lightweight, no-framework implementation.

## License

MIT
