// Provider Configurations
const PROVIDERS = {
    gemini: {
        name: "Google Gemini",
        models: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.5-flash-lite"],
        defaultModel: "gemini-2.5-flash",
        getEndpoint: (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        buildRequest: (apiKey, prompt) => ({
            headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }),
        parseResponse: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    },
    openai: {
        name: "OpenAI",
        models: ["gpt-5.2-pro", "gpt-4.1", "gpt-5.2", "gpt-5-mini", "gpt-5-nano"],
        defaultModel: "gpt-5-nano",
        getEndpoint: () => "https://api.openai.com/v1/chat/completions",
        buildRequest: (apiKey, prompt) => ({
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify({ model: null, messages: [{ role: "user", content: prompt }] })
        }),
        parseResponse: (data) => data.choices?.[0]?.message?.content || ""
    },
    anthropic: {
        name: "Anthropic",
        models: ["claude-sonnet-4-5", "claude-haiku-4-5", "claude-opus-4-5"],
        defaultModel: "claude-haiku-4-5",
        getEndpoint: () => "https://api.anthropic.com/v1/messages",
        buildRequest: (apiKey, prompt) => ({
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
                "anthropic-dangerous-direct-browser-access": "true"
            },
            body: JSON.stringify({
                model: null,
                max_tokens: 1024,
                messages: [{ role: "user", content: prompt }]
            })
        }),
        parseResponse: (data) => data.content?.[0]?.text || ""
    },
    mistral: {
        name: "Mistral AI",
        models: ["mistral-large", "mistral-medium", "mistral-small", "mistral-mini",],
        defaultModel: "mistral-medium",
        getEndpoint: () => "https://api.mistral.ai/v1/chat/completions",
        buildRequest: (apiKey, prompt) => ({
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify({ model: null, messages: [{ role: "user", content: prompt }] })
        }),
        parseResponse: (data) => data.choices?.[0]?.message?.content || ""
    },
    groq: {
        name: "Groq",
        models: ["llama-3.3-70b-versatile", "openai/gpt-oss-20b", "openai/gpt-oss-120b", "meta-llama/llama-4-maverick-17b-128e-instruct", "meta-llama/llama-4-scout-17b-16e-instruct",],
        defaultModel: "openai/gpt-oss-120b",
        getEndpoint: () => "https://api.groq.com/openai/v1/chat/completions",
        buildRequest: (apiKey, prompt) => ({
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify({ model: null, messages: [{ role: "user", content: prompt }] })
        }),
        parseResponse: (data) => data.choices?.[0]?.message?.content || ""
    }
};

// Generate email using selected provider
async function generateEmail(pageData, settings, documents) {
    const { apiKey, provider, model, personalNote } = settings;

    if (!apiKey) throw new Error("API key not configured. Please go to Settings.");
    if (!provider || !PROVIDERS[provider]) throw new Error("Invalid provider selected.");

    const providerConfig = PROVIDERS[provider];
    const selectedModel = model || providerConfig.defaultModel;

    const prompt = buildPrompt(pageData, documents, personalNote);
    const endpoint = providerConfig.getEndpoint(selectedModel);
    const { headers, body } = providerConfig.buildRequest(apiKey, prompt);

    // Inject model for APIs that need it
    let requestBody = JSON.parse(body);
    if (requestBody.model === null) {
        requestBody.model = selectedModel;
    }

    const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || response.statusText || "API request failed";
        throw new Error(`${providerConfig.name} API Error: ${errorMsg}`);
    }

    const data = await response.json();
    return providerConfig.parseResponse(data);
}

// Build the prompt for email generation
function buildPrompt(pageData, documents, personalNote) {
    // Get content - support both property names
    const pageContent = pageData.clean_context || pageData.full_text || "";

    // Build documents context from all uploaded documents
    let documentsContext = "";
    if (documents && documents.length > 0) {
        documentsContext = documents.map(doc =>
            `### ${doc.label}:\n${doc.content}`
        ).join("\n\n");
    } else {
        documentsContext = "Not provided - use generic introduction";
    }
    let jobContext = "";
    if (pageData.job_data && pageData.job_data.title) {
        const jd = pageData.job_data;
        jobContext = `
## Job Listing Details:
- Job Title: ${jd.title || "N/A"}
- Company: ${jd.company || "N/A"}
- Location: ${jd.location || "N/A"}
${jd.salary ? `- Salary: ${jd.salary}` : ""}
${jd.details?.length ? `- Details: ${jd.details.join(", ")}` : ""}

${jd.description ? `Job Description Summary:\n${jd.description.substring(0, 3000)}` : ""}
`;
    }

    return `You are an expert cold email copywriter who has helped thousands of job seekers land interviews at top companies. Your emails have exceptional open and response rates because they feel genuine, specific, and compelling.

## YOUR WRITING PHILOSOPHY:
- **Brevity is power**: 150 words max. Hiring managers skim emails in 10 seconds.
- **Specificity wins**: Generic flattery fails. Reference exact details from their job posting/company.
- **Human first**: Write like a real person, not a template. No corporate jargon.
- **Value-oriented**: Show what YOU bring to THEM, not just what you want.

## AVOID THESE ANTI-PATTERNS (instant delete triggers):
- "I hope this email finds you well"
- "I am writing to express my interest in..."
- "I believe I would be a great fit"
- "Please find my resume attached"
- Starting with "My name is..."
- Listing generic skills without context
- Being overly formal or stiff
- Using em dashes excessively
- Exclamation marks overuse

## WINNING EMAIL STRUCTURE:

**Opening Hook (1-2 sentences):**
Start with something specific that caught your attention - a recent company news, product feature, job requirement, or industry insight. Show you did your homework.

**The Connection (2-3 sentences):**
Bridge your background to their specific needs. Use concrete numbers, project names, or outcomes. "At [Company], I [specific achievement] that [measurable result]."

**The Ask (1 sentence):**
Soft, low-commitment CTA. "Would you be open to a brief chat this week?" or "Happy to share more details if helpful."

**Sign-off:**
Simple. "Best, [Name]" or "Thanks, [Name]"

---

## SENDER'S PROFILE & DOCUMENTS:
${documentsContext}

---

## RECIPIENT INFO (from webpage):
Platform: ${pageData.platform || "Unknown"}
URL: ${pageData.url || "Unknown"}
${jobContext}

## WEBPAGE CONTENT:
${pageContent.substring(0, 8000)}

## SENDER'S ADDITIONAL NOTES:
${personalNote || "None"}

---

## YOUR TASK:
Write a cold email that will make the recipient want to respond. 

**Requirements:**
1. Hook them in the first line with something specific to THEM
2. Connect sender's experience to their EXACT needs (reference the job posting)
3. Include at least one concrete metric or achievement from sender's background
4. Keep it under 150 words
5. Sound like a confident professional, not a desperate job seeker
6. End with a low-friction ask
7. You need not deviate from the job posting
8. Do not make up any information, no lying, no fake achievements and compliments
9. Try to use the job posting as much as possible
10. Do not use any generic or cliched phrases
11. Start with a nice introductions, then move on to the main content

**Output:**
Email body only. Start with a greeting like "Hi [Name/Team]," — no subject line.`
}

// Listen for messages from popup
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "generate_email") {
        handleGenerateEmail(request.tabId)
            .then(email => sendResponse({ email }))
            .catch(err => sendResponse({ error: err.message }));
        return true; // Keep channel open for async response
    }
});

// Listen for keyboard commands
browser.commands.onCommand.addListener(async (command) => {
    if (command === "generate_email") {
        try {
            // Get active tab
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            const tab = tabs[0];
            if (!tab) return;

            // Show badge while generating
            await browser.browserAction.setBadgeText({ text: "..." });
            await browser.browserAction.setBadgeBackgroundColor({ color: "#6366f1" });

            // Generate the email
            const email = await handleGenerateEmail(tab.id);

            // Copy to clipboard
            await navigator.clipboard.writeText(email);

            // Show success badge
            await browser.browserAction.setBadgeText({ text: "✓" });
            await browser.browserAction.setBadgeBackgroundColor({ color: "#22c55e" });
            setTimeout(async () => {
                await browser.browserAction.setBadgeText({ text: "" });
            }, 3000);

        } catch (err) {
            await browser.browserAction.setBadgeText({ text: "!" });
            await browser.browserAction.setBadgeBackgroundColor({ color: "#ef4444" });
            setTimeout(async () => {
                await browser.browserAction.setBadgeText({ text: "" });
            }, 3000);
            console.error("Generate email error:", err);
        }
    }
});

// Handle the email generation flow
async function handleGenerateEmail(tabId) {
    // Get user settings from sync storage
    const settings = await browser.storage.sync.get(["apiKey", "provider", "model", "personalNote"]);

    // Get documents from local storage
    const localData = await browser.storage.local.get(["documents"]);
    const documents = localData.documents || [];

    // Inject and execute scraper (Firefox manifest v2 style)
    const results = await browser.tabs.executeScript(tabId, {
        file: "content_scripts/scraper.js"
    });

    if (!results || !results[0]) {
        throw new Error("Failed to scrape page content.");
    }

    const pageData = results[0];

    if (pageData.error) {
        throw new Error("Scraper error: " + pageData.error);
    }

    return await generateEmail(pageData, settings, documents);
}

// Expose PROVIDERS for options page
self.PROVIDERS = PROVIDERS;
