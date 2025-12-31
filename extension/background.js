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
    // Get content - support both property names
    const pageContent = pageData.clean_context || pageData.full_text || "";

    // Build job-specific context if available
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

    return `You are a specialized cold email writer helping job seekers land interviews.
Your main job is to write compelling, personalized cold emails for the SENDER to the RECIPIENT (hiring manager/company).

**Key Requirements:**
- Make the email personal and concise (3-4 paragraphs max)
- Reference specific details from the job posting to show genuine interest
- Connect the sender's skills/experience directly to job requirements
- Be professional but warm and conversational
- Include a soft call-to-action (request for a brief chat, coffee meeting, etc.)
    
---

## SENDER's Resume/Profile:
${resume || "Not provided - use generic introduction"}

---

## RECIPIENT's Information (from the webpage being viewed):
Platform: ${pageData.platform || "Unknown"}
URL: ${pageData.url || "Unknown"}
${jobContext}

## Full Webpage Content:
${pageContent.substring(0, 8000)}

## Additional Instructions from the SENDER:
${personalNote || "None"}

---

## Task:
Write a cold email FROM the sender TO the recipient (the company/hiring manager from the job posting). The email should:
1. Address the recipient appropriately (use company name if specific person unknown)
2. Open with a hook that shows you've researched their company/role
3. Briefly introduce the sender with 2-3 most relevant qualifications
4. Connect sender's experience to specific job requirements mentioned
5. Show genuine enthusiasm for the role/company
6. End with a clear but soft call-to-action

**Output Format:**
Provide ONLY the email body, no subject line. Start directly with the greeting (e.g., "Hi [Hiring Team/Name]," or "Dear [Name],").`
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
