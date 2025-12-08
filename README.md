# Candy Mail 🍬

> Draft personalized cold emails instantly from any profile or webpage.

**Candy Mail** is a Chrome Extension that uses Google's **Gemini 2.5 Flash** to analyze the webpage you're viewing (like a LinkedIn profile, GitHub user, or company "About" page) and draft a highly personalized cold email based on your resume.

![Candy Mail Logo](extension/logo.png)

## Features

- **🍬 Universal Context**: Works on any website, analyzing the visible text to understand the recipient.
- **📄 Resume Integration**: Upload your PDF or DOCX resume once. It's automatically used to find connection points for every email.
- **📝 Personal Notes**: Add custom instructions like "Keep it casual", "Mention I'm hiring", or "Ask for a coffee chat".
- **🔒 Privacy First**: Your API key, Resume, and Notes are stored **locally** in your browser (`chrome.storage.sync`). Nothing is sent to our servers.
- **⚡ Fast & Free**: Uses the free tier of Google Gemini API.

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

1. **Get an API Key**:
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and get a free Gemini API key.
2. **Configure Extension**:
   - Click the Candy Mail icon 🍬 in your toolbar.
   - Click the **Settings/Gear** icon (or right-click the extension icon > **Options**).
3. **Add Your Details**:
   - Paste your **Gemini API Key**.
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
- **Google Gemini API**: `gemini-2.5-flash` for high-speed, intelligent generation.
- **PDF.js**: Client-side PDF text extraction.
- **Mammoth.js**: Client-side DOCX text extraction.
- **Vanilla JS/CSS**: Lightweight, no-framework implementation.

## License

MIT
