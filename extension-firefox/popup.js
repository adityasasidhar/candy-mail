// Firefox compatibility - use browser.* APIs
const api = typeof browser !== 'undefined' ? browser : chrome;

// Elements
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const regenerateBtn = document.getElementById('regenerateBtn');
const output = document.getElementById('output');
const btnText = generateBtn.querySelector('.btn-text');
const settingsBtn = document.getElementById('settingsBtn');

// Progress elements
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressStatus = document.getElementById('progressStatus');
const progressPercent = document.getElementById('progressPercent');

// Error elements
const errorContainer = document.getElementById('errorContainer');
const errorTitle = document.getElementById('errorTitle');
const errorMessage = document.getElementById('errorMessage');
const errorHelp = document.getElementById('errorHelp');

// Tab elements
const tabs = document.querySelectorAll('.tab');
const generateSection = document.getElementById('generateSection');
const historySection = document.getElementById('historySection');
const historyList = document.getElementById('historyList');
const historyEmpty = document.getElementById('historyEmpty');
const historyCount = document.getElementById('historyCount');
const clearHistoryContainer = document.getElementById('clearHistoryContainer');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// State
let currentPageUrl = '';
let emailHistory = [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadHistory();
    updateHistoryCount();

    // Get current tab URL
    const tabs = await api.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
        currentPageUrl = tabs[0].url;
    }
});

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;

        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        if (tabName === 'generate') {
            generateSection.classList.add('active');
            historySection.classList.remove('active');
        } else {
            generateSection.classList.remove('active');
            historySection.classList.add('active');
            renderHistory();
        }
    });
});

// Settings button
settingsBtn.addEventListener('click', () => {
    api.runtime.openOptionsPage();
});

// Progress management
function showProgress() {
    progressContainer.classList.add('active');
    errorContainer.classList.remove('active');
    updateProgress(0, 'Initializing...');
}

function updateProgress(percent, status) {
    progressFill.style.width = percent + '%';
    progressFill.classList.remove('indeterminate');
    progressStatus.textContent = status;
    progressPercent.textContent = percent + '%';
}

function setIndeterminate(status) {
    progressFill.classList.add('indeterminate');
    progressStatus.textContent = status;
    progressPercent.textContent = '';
}

function hideProgress() {
    progressContainer.classList.remove('active');
}

// Error handling
const ERROR_MESSAGES = {
    'API key not configured': {
        title: 'API Key Missing',
        message: 'Please configure your API key in Settings before generating emails.',
        help: '<a href="#" id="openSettings">Open Settings</a> to add your API key.'
    },
    'Invalid provider': {
        title: 'Invalid Provider',
        message: 'The selected LLM provider is not valid. Please select a valid provider in Settings.',
        help: '<a href="#" id="openSettings">Open Settings</a> to configure your provider.'
    },
    'Failed to scrape': {
        title: 'Page Read Error',
        message: 'Unable to read the content of this page. This might happen on restricted pages or internal browser pages.',
        help: 'Try navigating to a regular webpage like a LinkedIn profile or company page.'
    },
    'rate limit': {
        title: 'Rate Limited',
        message: 'You\'ve made too many requests. Please wait a moment before trying again.',
        help: 'Wait 30-60 seconds and try again, or consider upgrading your API plan.'
    },
    'quota': {
        title: 'API Quota Exceeded',
        message: 'Your API quota has been exhausted for this billing period.',
        help: 'Check your API provider dashboard for quota details and billing options.'
    },
    'unauthorized': {
        title: 'Authentication Failed',
        message: 'Your API key appears to be invalid or expired.',
        help: '<a href="#" id="openSettings">Open Settings</a> to update your API key.'
    },
    'network': {
        title: 'Connection Error',
        message: 'Unable to connect to the AI service. Check your internet connection.',
        help: 'Make sure you\'re connected to the internet and try again.'
    }
};

function showError(errorText) {
    errorContainer.classList.add('active');
    hideProgress();

    // Find matching error template
    let errorData = {
        title: 'Something Went Wrong',
        message: errorText,
        help: 'If this persists, try refreshing the page or checking your settings.'
    };

    const lowerError = errorText.toLowerCase();
    for (const [key, data] of Object.entries(ERROR_MESSAGES)) {
        if (lowerError.includes(key.toLowerCase())) {
            errorData = data;
            break;
        }
    }

    errorTitle.textContent = errorData.title;
    errorMessage.textContent = errorData.message;
    errorHelp.innerHTML = errorData.help;

    // Add click handler for settings link
    const settingsLink = errorHelp.querySelector('#openSettings');
    if (settingsLink) {
        settingsLink.addEventListener('click', (e) => {
            e.preventDefault();
            api.runtime.openOptionsPage();
        });
    }
}

function hideError() {
    errorContainer.classList.remove('active');
}

// Loading state
function setLoading(isLoading) {
    generateBtn.disabled = isLoading;
    generateBtn.classList.toggle('loading', isLoading);
    btnText.textContent = isLoading ? "Generating..." : "Generate Email";
}

// Generate email
async function generateEmail() {
    output.value = "";
    hideError();
    showProgress();
    setLoading(true);

    try {
        updateProgress(10, 'Getting current page...');
        const tabsList = await api.tabs.query({ active: true, currentWindow: true });
        const tab = tabsList[0];

        if (!tab) {
            throw new Error('No active tab found');
        }

        updateProgress(20, 'Analyzing page content...');

        // Simulate progress while waiting for response
        let progressValue = 20;
        const progressInterval = setInterval(() => {
            if (progressValue < 85) {
                progressValue += Math.random() * 10;
                updateProgress(Math.min(85, Math.round(progressValue)), 'Generating personalized email...');
            } else {
                setIndeterminate('Waiting for AI response...');
            }
        }, 500);

        const response = await api.runtime.sendMessage({ action: "generate_email", tabId: tab.id });
        clearInterval(progressInterval);

        setLoading(false);

        if (response && response.email) {
            updateProgress(100, 'Complete!');
            setTimeout(hideProgress, 500);
            output.value = response.email;

            // Save to history
            await saveToHistory({
                email: response.email,
                url: tab.url,
                title: tab.title || 'Unknown Page',
                timestamp: Date.now()
            });
            updateHistoryCount();

        } else if (response && response.error) {
            showError(response.error);
        } else {
            showError('Unknown error occurred. Please try again.');
        }

    } catch (e) {
        showError(e.message);
        setLoading(false);
    }
}

generateBtn.addEventListener('click', generateEmail);
regenerateBtn.addEventListener('click', generateEmail);

// Copy functionality
copyBtn.addEventListener('click', () => {
    if (!output.value) return;
    navigator.clipboard.writeText(output.value).then(() => {
        copyBtn.textContent = "Copied!";
        copyBtn.classList.add('success');
        setTimeout(() => {
            copyBtn.textContent = "Copy";
            copyBtn.classList.remove('success');
        }, 2000);
    });
});

// History management
async function loadHistory() {
    const data = await api.storage.local.get(['emailHistory']);
    emailHistory = data.emailHistory || [];
}

async function saveToHistory(item) {
    emailHistory.unshift(item);
    // Keep only last 50 emails
    if (emailHistory.length > 50) {
        emailHistory = emailHistory.slice(0, 50);
    }
    await api.storage.local.set({ emailHistory });
}

async function deleteFromHistory(index) {
    emailHistory.splice(index, 1);
    await api.storage.local.set({ emailHistory });
    renderHistory();
    updateHistoryCount();
}

async function clearHistory() {
    if (confirm('Are you sure you want to clear all email history?')) {
        emailHistory = [];
        await api.storage.local.set({ emailHistory });
        renderHistory();
        updateHistoryCount();
    }
}

function updateHistoryCount() {
    historyCount.textContent = emailHistory.length > 0 ? `(${emailHistory.length})` : '';
}

function renderHistory() {
    // Clear existing items (except empty state)
    const existingItems = historyList.querySelectorAll('.history-item');
    existingItems.forEach(item => item.remove());

    if (emailHistory.length === 0) {
        historyEmpty.style.display = 'block';
        clearHistoryContainer.style.display = 'none';
        return;
    }

    historyEmpty.style.display = 'none';
    clearHistoryContainer.style.display = 'block';

    emailHistory.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';

        const timeAgo = formatTimeAgo(item.timestamp);
        const preview = item.email.substring(0, 100).replace(/\n/g, ' ') + '...';
        const sourceName = extractSourceName(item.url, item.title);

        div.innerHTML = `
            <div class="history-meta">
                <span class="history-source">${sourceName}</span>
                <span class="history-time">${timeAgo}</span>
            </div>
            <div class="history-preview">${preview}</div>
            <div class="history-actions">
                <button class="history-btn use-btn" data-index="${index}">Use</button>
                <button class="history-btn copy-btn" data-index="${index}">Copy</button>
                <button class="history-btn delete" data-index="${index}">Delete</button>
            </div>
        `;

        historyList.insertBefore(div, historyEmpty);
    });

    // Add event listeners
    historyList.querySelectorAll('.use-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            output.value = emailHistory[index].email;
            document.querySelectorAll('.tab')[0].click(); // Switch to generate tab
        });
    });

    historyList.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            navigator.clipboard.writeText(emailHistory[index].email);
            e.target.textContent = 'Copied!';
            setTimeout(() => e.target.textContent = 'Copy', 1500);
        });
    });

    historyList.querySelectorAll('.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            deleteFromHistory(index);
        });
    });
}

clearHistoryBtn.addEventListener('click', clearHistory);

// Helpers
function formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';

    return new Date(timestamp).toLocaleDateString();
}

function extractSourceName(url, title) {
    try {
        const hostname = new URL(url).hostname.replace('www.', '');
        if (title && title.length < 40) {
            return title;
        }
        return hostname;
    } catch {
        return title || 'Unknown';
    }
}
