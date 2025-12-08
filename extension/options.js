// Provider configurations (mirrored from background.js)
const PROVIDERS = {
    gemini: {
        name: "Google Gemini",
        models: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"],
        defaultModel: "gemini-2.5-flash",
        keyPlaceholder: "AIza..."
    },
    openai: {
        name: "OpenAI",
        models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
        defaultModel: "gpt-4o-mini",
        keyPlaceholder: "sk-..."
    },
    groq: {
        name: "Groq",
        models: ["llama-3.3-70b-versatile", "mixtral-8x7b-32768", "gemma2-9b-it"],
        defaultModel: "llama-3.3-70b-versatile",
        keyPlaceholder: "gsk_..."
    }
};

// Elements
const providerSelect = document.getElementById("provider");
const modelSelect = document.getElementById("model");
const apiKeyInput = document.getElementById("apiKey");
const apiKeyLabel = document.getElementById("apiKeyLabel");
const resumeTextarea = document.getElementById("resume");
const resumeFile = document.getElementById("resumeFile");
const personalNote = document.getElementById("personalNote");
const saveBtn = document.getElementById("saveBtn");
const statusDiv = document.getElementById("status");

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
    // Load saved settings
    const settings = await chrome.storage.sync.get(["apiKey", "provider", "model", "resume", "personalNote"]);

    if (settings.provider) {
        providerSelect.value = settings.provider;
    }
    updateProviderUI();

    if (settings.model) {
        modelSelect.value = settings.model;
    }
    if (settings.apiKey) {
        apiKeyInput.value = settings.apiKey;
    }
    if (settings.resume) {
        resumeTextarea.value = settings.resume;
    }
    if (settings.personalNote) {
        personalNote.value = settings.personalNote;
    }
});

// Update UI when provider changes
function updateProviderUI() {
    const provider = providerSelect.value;
    const config = PROVIDERS[provider];

    if (!config) return;

    // Update label and placeholder
    apiKeyLabel.textContent = `${config.name} API Key`;
    apiKeyInput.placeholder = config.keyPlaceholder;

    // Update model dropdown
    modelSelect.innerHTML = "";
    config.models.forEach(model => {
        const option = document.createElement("option");
        option.value = model;
        option.textContent = model;
        if (model === config.defaultModel) {
            option.selected = true;
        }
        modelSelect.appendChild(option);
    });
}

providerSelect.addEventListener("change", () => {
    updateProviderUI();
    apiKeyInput.value = ""; // Clear API key when switching providers
});

// Handle file upload
resumeFile.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showStatus("Processing file...", "loading");

    try {
        let text = "";

        if (file.name.endsWith(".pdf")) {
            text = await extractPdfText(file);
        } else if (file.name.endsWith(".docx")) {
            text = await extractDocxText(file);
        } else {
            throw new Error("Unsupported file type");
        }

        resumeTextarea.value = text;
        showStatus("Resume extracted successfully!", "success");
    } catch (err) {
        showStatus("Failed to extract: " + err.message, "error");
    }
});

// Extract text from PDF
async function extractPdfText(file) {
    const arrayBuffer = await file.arrayBuffer();
    pdfjsLib.GlobalWorkerOptions.workerSrc = "vendor/pdf.worker.min.js";
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(" ") + "\n";
    }
    return text.trim();
}

// Extract text from DOCX
async function extractDocxText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
}

// Save settings
saveBtn.addEventListener("click", async () => {
    const settings = {
        provider: providerSelect.value,
        model: modelSelect.value,
        apiKey: apiKeyInput.value.trim(),
        resume: resumeTextarea.value.trim(),
        personalNote: personalNote.value.trim()
    };

    if (!settings.apiKey) {
        showStatus("Please enter an API key.", "error");
        return;
    }

    try {
        await chrome.storage.sync.set(settings);
        showStatus("Settings saved successfully!", "success");
    } catch (err) {
        showStatus("Failed to save: " + err.message, "error");
    }
});

// Show status message
function showStatus(msg, type) {
    statusDiv.textContent = msg;
    statusDiv.className = type;

    if (type === "success") {
        setTimeout(() => {
            statusDiv.className = "";
            statusDiv.textContent = "";
        }, 3000);
    }
}
