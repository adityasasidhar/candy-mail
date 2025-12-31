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

// Document label options
const DOC_LABELS = [
    "Resume",
    "Cover Letter",
    "Portfolio",
    "Project Summary",
    "Skills Overview",
    "Other"
];

const MAX_DOCUMENTS = 5;

// Elements
const providerSelect = document.getElementById("provider");
const modelSelect = document.getElementById("model");
const apiKeyInput = document.getElementById("apiKey");
const apiKeyLabel = document.getElementById("apiKeyLabel");
const personalNote = document.getElementById("personalNote");
const saveBtn = document.getElementById("saveBtn");
const statusDiv = document.getElementById("status");
const documentsContainer = document.getElementById("documentsContainer");
const emptyState = document.getElementById("emptyState");
const docCountSpan = document.getElementById("docCount");
const addDocumentWrapper = document.getElementById("addDocumentWrapper");
const documentFileInput = document.getElementById("documentFile");

// Documents array
let documents = [];

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
    // Load saved settings from sync storage
    const syncSettings = await chrome.storage.sync.get(["apiKey", "provider", "model", "personalNote"]);

    // Load documents from local storage (larger limit)
    const localSettings = await chrome.storage.local.get(["documents"]);

    if (syncSettings.provider) {
        providerSelect.value = syncSettings.provider;
    }
    updateProviderUI();

    if (syncSettings.model) {
        modelSelect.value = syncSettings.model;
    }
    if (syncSettings.apiKey) {
        apiKeyInput.value = syncSettings.apiKey;
    }
    if (syncSettings.personalNote) {
        personalNote.value = syncSettings.personalNote;
    }

    // Load documents
    if (localSettings.documents && Array.isArray(localSettings.documents)) {
        documents = localSettings.documents;
    }

    renderDocuments();
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

// Render documents list
function renderDocuments() {
    // Update count
    docCountSpan.textContent = `${documents.length}/${MAX_DOCUMENTS}`;

    // Toggle empty state
    emptyState.style.display = documents.length === 0 ? "block" : "none";

    // Toggle add button
    if (documents.length >= MAX_DOCUMENTS) {
        addDocumentWrapper.classList.add("disabled");
    } else {
        addDocumentWrapper.classList.remove("disabled");
    }

    // Clear existing cards (except empty state)
    const existingCards = documentsContainer.querySelectorAll(".document-card");
    existingCards.forEach(card => card.remove());

    // Render each document
    documents.forEach((doc, index) => {
        const card = createDocumentCard(doc, index);
        documentsContainer.insertBefore(card, emptyState);
    });
}

// Create a document card element
function createDocumentCard(doc, index) {
    const card = document.createElement("div");
    card.className = "document-card";
    card.dataset.index = index;

    // Icon based on file type
    const icon = getFileIcon(doc.name);

    // Label select options
    const labelOptions = DOC_LABELS.map(label =>
        `<option value="${label}" ${doc.label === label ? 'selected' : ''}>${label}</option>`
    ).join("");

    card.innerHTML = `
        <div class="doc-icon">${icon}</div>
        <div class="doc-info">
            <div class="doc-name" title="${doc.name}">${doc.name}</div>
            <div class="doc-meta">
                <select class="doc-label-select" data-index="${index}">
                    ${labelOptions}
                </select>
                <span>${formatSize(doc.content.length)} chars</span>
            </div>
        </div>
        <button class="doc-delete" data-index="${index}">Remove</button>
    `;

    // Add event listeners
    const labelSelect = card.querySelector(".doc-label-select");
    labelSelect.addEventListener("change", (e) => {
        documents[index].label = e.target.value;
    });

    const deleteBtn = card.querySelector(".doc-delete");
    deleteBtn.addEventListener("click", () => {
        removeDocument(index);
    });

    return card;
}

// Get file icon based on extension
function getFileIcon(filename) {
    if (filename.endsWith(".pdf")) return "📕";
    if (filename.endsWith(".docx") || filename.endsWith(".doc")) return "📘";
    if (filename.endsWith(".txt")) return "📄";
    return "📋";
}

// Format character count
function formatSize(chars) {
    if (chars > 1000) {
        return (chars / 1000).toFixed(1) + "k";
    }
    return chars;
}

// Remove document
function removeDocument(index) {
    documents.splice(index, 1);
    renderDocuments();
    showStatus("Document removed", "success");
}

// Handle file upload
documentFileInput.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Check limit
    const availableSlots = MAX_DOCUMENTS - documents.length;
    if (availableSlots <= 0) {
        showStatus(`Maximum ${MAX_DOCUMENTS} documents allowed`, "error");
        return;
    }

    const filesToProcess = files.slice(0, availableSlots);
    if (files.length > availableSlots) {
        showStatus(`Only adding ${availableSlots} file(s) - limit reached`, "loading");
    }

    showStatus(`Processing ${filesToProcess.length} file(s)...`, "loading");

    try {
        for (const file of filesToProcess) {
            let text = "";

            if (file.name.endsWith(".pdf")) {
                text = await extractPdfText(file);
            } else if (file.name.endsWith(".docx")) {
                text = await extractDocxText(file);
            } else if (file.name.endsWith(".txt")) {
                text = await file.text();
            } else {
                showStatus(`Unsupported file type: ${file.name}`, "error");
                continue;
            }

            // Add document
            documents.push({
                name: file.name,
                label: guessLabel(file.name),
                content: text.trim()
            });
        }

        renderDocuments();
        showStatus(`${filesToProcess.length} document(s) added successfully!`, "success");
    } catch (err) {
        showStatus("Failed to extract: " + err.message, "error");
    }

    // Reset file input
    documentFileInput.value = "";
});

// Guess label based on filename
function guessLabel(filename) {
    const lower = filename.toLowerCase();
    if (lower.includes("resume") || lower.includes("cv")) return "Resume";
    if (lower.includes("cover")) return "Cover Letter";
    if (lower.includes("portfolio")) return "Portfolio";
    if (lower.includes("project")) return "Project Summary";
    if (lower.includes("skill")) return "Skills Overview";
    return "Other";
}

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
    const syncSettings = {
        provider: providerSelect.value,
        model: modelSelect.value,
        apiKey: apiKeyInput.value.trim(),
        personalNote: personalNote.value.trim()
    };

    if (!syncSettings.apiKey) {
        showStatus("Please enter an API key.", "error");
        return;
    }

    try {
        // Save API settings to sync storage
        await chrome.storage.sync.set(syncSettings);

        // Save documents to local storage (larger limit)
        await chrome.storage.local.set({ documents: documents });

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
