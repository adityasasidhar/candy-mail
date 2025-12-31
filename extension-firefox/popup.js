// Firefox compatibility - use browser.* APIs with chrome.* fallback
const api = typeof browser !== 'undefined' ? browser : chrome;

// Elements
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const output = document.getElementById('output');
const statusBadge = document.getElementById('statusBadge');
const btnText = generateBtn.querySelector('.btn-text');

function setStatus(msg, type) {
    statusBadge.textContent = msg;
    statusBadge.className = 'status-badge ' + (type || '');
    statusBadge.style.display = msg ? 'inline-block' : 'none';
}

function setLoading(isLoading) {
    generateBtn.disabled = isLoading;
    generateBtn.classList.toggle('loading', isLoading);
    btnText.textContent = isLoading ? "Generating..." : "Generate Email";
}

generateBtn.addEventListener('click', async () => {
    output.value = "";
    setStatus("Analyzing page...", "loading");
    setLoading(true);

    try {
        const tabs = await api.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];

        if (!tab) {
            setStatus("No active tab", "error");
            setLoading(false);
            return;
        }

        const response = await api.runtime.sendMessage({ action: "generate_email", tabId: tab.id });

        setLoading(false);

        if (response && response.email) {
            setStatus("Draft Ready", "loading");
            output.value = response.email;
            setTimeout(() => setStatus("", ""), 3000);
        } else if (response && response.error) {
            setStatus("Error: " + response.error, "error");
        } else {
            setStatus("Unknown Error", "error");
        }

    } catch (e) {
        setStatus("Error: " + e.message, "error");
        setLoading(false);
    }
});

copyBtn.addEventListener('click', () => {
    if (!output.value) return;
    navigator.clipboard.writeText(output.value).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "Copied!";
        setTimeout(() => copyBtn.textContent = originalText, 2000);
    });
});
