# Candy Mail Firefox Extension - Source Code

## Overview
This is the source code for the Candy Mail Firefox extension. The extension helps users draft personalized cold emails from any webpage using AI.

## Build Instructions

### Prerequisites
- Operating System: Any (Windows, macOS, Linux)
- No build tools required - this is vanilla JavaScript
- No npm/node required
- No transpilation or bundling used

### Build Steps

1. **Clone or extract the source code**
   ```bash
   unzip candy-mail-source.zip
   cd candy-mail-source
   ```

2. **Create the extension package**
   ```bash
   zip -r candy-mail-firefox.zip extension-firefox/ -x "*.DS_Store"
   ```

That's it! The extension is pure vanilla JavaScript with no build process.

### File Structure
```
extension-firefox/
├── manifest.json          # Extension manifest (hand-written)
├── background.js          # Background service worker (hand-written)
├── popup.html             # Popup UI (hand-written)
├── popup.js               # Popup logic (hand-written)
├── options.html           # Settings page (hand-written)
├── options.js             # Settings logic (hand-written)
├── content_scripts/
│   └── scraper.js         # Page content scraper (hand-written)
├── icons/                 # Extension icons (PNG files)
└── vendor/                # Third-party libraries (see below)
```

## Third-Party Libraries

The following open-source libraries are included in the `vendor/` folder:

### PDF.js (Mozilla)
- **Files**: `pdf.min.js`, `pdf.worker.min.js`
- **Version**: 3.x
- **License**: Apache 2.0
- **Source**: https://github.com/nicmhd/pdfjs-dist
- **Original Source**: https://mozilla.github.io/pdf.js/

### Mammoth.js
- **File**: `mammoth.browser.min.js`
- **Version**: 1.x
- **License**: BSD-2-Clause
- **Source**: https://github.com/mwilliamson/mammoth.js

These libraries are used for extracting text from PDF and DOCX files locally in the browser. They are unmodified from their official distributions.

## No Build Process

All source files (except vendor libraries) are:
- ✅ Hand-written vanilla JavaScript
- ✅ Not transpiled
- ✅ Not minified
- ✅ Not concatenated
- ✅ Not machine-generated

The code is directly readable and can be compared 1:1 with the extension package.

## Testing Locally

1. Open Firefox
2. Navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from the extension-firefox folder

## License

MIT License
