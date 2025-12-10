(function () {
    try {
        const url = window.location.href;

        // 1. Identify Platform
        const getPlatform = (url) => {
            if (url.includes("linkedin.com")) return "LinkedIn";
            if (url.includes("github.com")) return "GitHub";
            return "Web";
        };

        // 2. Extract Metadata (Crucial for Company/Person Name & Summary)
        const getMetadata = () => {
            const title = document.title || "";
            const description = document.querySelector('meta[name="description"]')?.content || "";
            return `Page Title: ${title}\nSummary: ${description}\n`;
        };

        // 3. Smart Content Cleaner
        const getCleanContent = () => {
            // Clone body to avoid breaking the page
            const clone = document.body.cloneNode(true);

            // Define garbage tags that confuse LLMs
            const selectorsToRemove = [
                'script', 'style', 'noscript', 'iframe', 'svg',
                'nav', 'footer', 'header', // Remove standard nav/footers
                '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]', // ARIA roles
                '.ad', '.ads', '.popup', '#cookie-banner', '.menu', '.sidebar' // Common class names for noise
            ];

            // Aggressive cleaning
            clone.querySelectorAll(selectorsToRemove.join(',')).forEach(el => el.remove());

            // Get text and collapse whitespace (Newlines -> Spaces)
            let text = clone.innerText;

            // Remove excessive whitespace (tabs, double spaces, triple newlines)
            return text.replace(/\s+/g, ' ').trim();
        };

        const platform = getPlatform(url);
        const metadata = getMetadata();
        const mainContent = getCleanContent();

        // 4. Structure the output strictly for the LLM
        // We combine them into one prompt-ready string, but keep raw data available
        const llmContext = `
        SOURCE URL: ${url}
        PLATFORM: ${platform}
        ${metadata}
        --- MAIN CONTENT ---
        ${mainContent.substring(0, 15000)} 
        `; // Cap at 15k chars to prevent token overflow

        let data = {
            success: true,
            url: url,
            platform: platform,
            // The 'clean_context' is what you actually send to OpenAI/Claude
            clean_context: llmContext,
            // Metrics
            char_count: llmContext.length
        };

        console.log(`[Scraper] Successfully prepared ${data.char_count} chars of context.`);
        return data;

    } catch (e) {
        console.error("[Scraper Error]:", e);
        return {
            success: false,
            error: e.toString(),
            url: window.location.href,
            clean_context: "" // Fail safe
        };
    }
})();