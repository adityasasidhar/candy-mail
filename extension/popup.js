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
    btnText.textContent = isLoading ? "Generating..." : "Draft from Page Context";
}

generateBtn.addEventListener('click', async () => {
    output.value = "";
    setStatus("Analyzing page...", "loading");
    setLoading(true);

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab) {
            setStatus("No active tab", "error");
            setLoading(false);
            return;
        }

        chrome.runtime.sendMessage({ action: "generate_email", tabId: tab.id }, (response) => {
            setLoading(false);
            if (chrome.runtime.lastError) {
                setStatus("Error: " + chrome.runtime.lastError.message, "error");
                return;
            }

            if (response && response.email) {
                setStatus("Draft Ready", "loading"); // Re-using loading style for blue badge, or could add 'success'
                output.value = response.email;
                setTimeout(() => setStatus("", ""), 3000);
            } else if (response && response.error) {
                setStatus("Error: " + response.error, "error");
            } else {
                setStatus("Unknown Error", "error");
            }
        });

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
