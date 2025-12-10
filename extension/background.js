// Provider Configurations
const PROVIDERS = {
    gemini: {
        name: "Google Gemini",
        models: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"],
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
        models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
        defaultModel: "gpt-4o-mini",
        getEndpoint: () => "https://api.openai.com/v1/chat/completions",
        buildRequest: (apiKey, prompt) => ({
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify({ model: null, messages: [{ role: "user", content: prompt }] })  // model set later
        }),
        parseResponse: (data) => data.choices?.[0]?.message?.content || ""
    },
    groq: {
        name: "Groq",
        models: ["llama-3.3-70b-versatile", "mixtral-8x7b-32768", "gemma2-9b-it"],
        defaultModel: "llama-3.3-70b-versatile",
        getEndpoint: () => "https://api.groq.com/openai/v1/chat/completions",
        buildRequest: (apiKey, prompt) => ({
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify({ model: null, messages: [{ role: "user", content: prompt }] })  // model set later
        }),
        parseResponse: (data) => data.choices?.[0]?.message?.content || ""
    }
};

// Generate email using selected provider
async function generateEmail(pageData, settings) {
    const { apiKey, provider, model, resume, personalNote } = settings;

    if (!apiKey) throw new Error("API key not configured. Please go to Settings.");
    if (!provider || !PROVIDERS[provider]) throw new Error("Invalid provider selected.");

    const providerConfig = PROVIDERS[provider];
    const selectedModel = model || providerConfig.defaultModel;

    const prompt = buildPrompt(pageData, resume, personalNote);
    const endpoint = providerConfig.getEndpoint(selectedModel);
    const { headers, body } = providerConfig.buildRequest(apiKey, prompt);

    // Inject model for OpenAI/Groq style APIs
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
function buildPrompt(pageData, resume, personalNote) {
    return `You are a specialized cold email writer.
     You're main job is to write cold emails for the SENDER to the RECIPIENT. I want you to write a 
     great email for the person to the company and the job description that is being provided to you, I want you to
     take the resume into account while writing the email, make sure you are making the email personal and concise.
     Try to personalize mail by using web page content and mentioning them
    
    ---

    ## SENDER's Resume/Profile:
    ${resume || "Not provided"}

    ---

    ## RECIPIENT's Information (from the webpage being viewed):
    Platform: ${pageData.platform || "Unknown"}
    URL: ${pageData.url || "Unknown"}

    Webpage Content (about the RECIPIENT):
    ${(pageData.full_text || "")}

    ## Additional Instructions from the SENDER:
    ${personalNote || "None"}

    ---

    ## Task:
    Write a cold email FROM the sender TO the recipient. The email should:
    1. Be addressed to the recipient (the person/company from the webpage)
    2. Introduce the sender (based on their resume)
    3. Reference specific details from the recipient's profile/page to show genuine interest
    4. Highlight relevant connections between the sender's background and the recipient
    5. Be concise, professional, and engaging
    6. Have a clear but soft call-to-action

    Provide ONLY the email body, no subject line. Start directly with the greeting (e.g., "Hi [Recipient's Name]," or "Dear [Name],").`;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "generate_email") {
        handleGenerateEmail(request.tabId)
            .then(email => sendResponse({ email }))
            .catch(err => sendResponse({ error: err.message }));
        return true; // Keep channel open for async response
    }
});

// Handle the email generation flow
async function handleGenerateEmail(tabId) {
    // Get user settings
    const settings = await chrome.storage.sync.get(["apiKey", "provider", "model", "resume", "personalNote"]);

    // Inject and execute scraper
    const results = await chrome.scripting.executeScript({
        target: { tabId },
        files: ["content_scripts/scraper.js"]
    });

    if (!results || !results[0] || !results[0].result) {
        throw new Error("Failed to scrape page content.");
    }

    const pageData = results[0].result;

    if (pageData.error) {
        throw new Error("Scraper error: " + pageData.error);
    }

    return await generateEmail(pageData, settings);
}

// Expose PROVIDERS for options page
self.PROVIDERS = PROVIDERS;
