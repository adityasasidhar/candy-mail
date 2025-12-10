(function () {
    try {
        const url = window.location.href;

        // 1. Identify Platform
        const getPlatform = (url) => {
            if (url.includes("linkedin.com/company/")) return "LinkedIn Company";
            if (url.includes("linkedin.com/in/")) return "LinkedIn Profile";
            if (url.includes("linkedin.com")) return "LinkedIn";
            if (url.includes("github.com")) return "GitHub";
            return "Web";
        };

        // 2. Enhanced Metadata Extraction
        const getMetadata = () => {
            const title = document.title || "";
            const description = document.querySelector('meta[name="description"]')?.content || "";
            const ogTitle = document.querySelector('meta[property="og:title"]')?.content || "";
            const ogDescription = document.querySelector('meta[property="og:description"]')?.content || "";

            // LinkedIn often has better data in OG tags
            return `Page Title: ${title}    
                    OG Title: ${ogTitle}
                    Description: ${description}
                    OG Description: ${ogDescription}
                    `;
        };

        // 3. LinkedIn-Specific Structured Data Extraction
        const getLinkedInStructuredData = () => {
            let structuredData = "";

            // Extract JSON-LD (LinkedIn often embeds this)
            const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
            jsonLdScripts.forEach(script => {
                try {
                    const data = JSON.parse(script.textContent);
                    structuredData += `\n--- Structured Data ---\n${JSON.stringify(data, null, 2)}\n`;
                } catch (e) {
                    // Silently fail for invalid JSON
                }
            });

            // LinkedIn sometimes stores data in code tags
            const codeTags = document.querySelectorAll('code[id*="bpr-guid"]');
            codeTags.forEach(code => {
                try {
                    const data = JSON.parse(code.textContent);
                    // Filter for relevant company/profile data
                    if (data.companyName || data.name || data.headline) {
                        structuredData += `\n--- LinkedIn Data ---\n${JSON.stringify(data, null, 2)}\n`;
                    }
                } catch (e) {
                    // Silently fail
                }
            });

            return structuredData;
        };

        // 4. Extract Key LinkedIn Elements (More Reliable)
        const getLinkedInKeyInfo = () => {
            let keyInfo = "\n--- KEY INFORMATION ---\n";

            // Company Page Specific
            const companyName = document.querySelector('h1.org-top-card-summary__title, h1[data-test-id="org-name"]')?.textContent?.trim();
            const companyTagline = document.querySelector('.org-top-card-summary__tagline')?.textContent?.trim();
            const companyIndustry = document.querySelector('.org-top-card-summary__industry')?.textContent?.trim();
            const companyWebsite = document.querySelector('a[data-test-id="about-us__website"]')?.href;

            // Profile Page Specific
            const profileName = document.querySelector('.text-heading-xlarge, h1.inline')?.textContent?.trim();
            const profileHeadline = document.querySelector('.text-body-medium.break-words, .top-card-layout__headline')?.textContent?.trim();
            const profileLocation = document.querySelector('.text-body-small.inline.t-black--light, .top-card__subline-item')?.textContent?.trim();

            if (companyName) keyInfo += `Company Name: ${companyName}\n`;
            if (companyTagline) keyInfo += `Company Tagline: ${companyTagline}\n`;
            if (companyIndustry) keyInfo += `Industry: ${companyIndustry}\n`;
            if (companyWebsite) keyInfo += `Website: ${companyWebsite}\n`;

            if (profileName) keyInfo += `Profile Name: ${profileName}\n`;
            if (profileHeadline) keyInfo += `Headline: ${profileHeadline}\n`;
            if (profileLocation) keyInfo += `Location: ${profileLocation}\n`;

            return keyInfo;
        };

        // 5. Improved Content Cleaner with LinkedIn-specific rules
        const getCleanContent = () => {
            const clone = document.body.cloneNode(true);

            // LinkedIn-specific noise selectors
            const selectorsToRemove = [
                'script', 'style', 'noscript', 'iframe', 'svg',
                'nav', 'footer', 'header',
                '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
                '.ad', '.ads', '.popup', '#cookie-banner', '.menu', '.sidebar',
                // LinkedIn-specific noise
                '.global-nav', '.msg-overlay-container', '.artdeco-modal',
                '.application-outlet', '.feed-shared-update', // Feed noise
                '[data-test-nav-item]', // Navigation items
                '.artdeco-toasts', // Toast notifications
                'aside' // Sidebars
            ];

            clone.querySelectorAll(selectorsToRemove.join(',')).forEach(el => el.remove());

            let text = clone.innerText;

            // LinkedIn has lots of "See more" and "Show more" text
            text = text.replace(/\b(see more|show more|see less|show less)\b/gi, '');

            // Collapse whitespace
            return text.replace(/\s+/g, ' ').trim();
        };

        const platform = getPlatform(url);
        const metadata = getMetadata();
        const structuredData = url.includes("linkedin.com") ? getLinkedInStructuredData() : "";
        const keyInfo = url.includes("linkedin.com") ? getLinkedInKeyInfo() : "";
        const mainContent = getCleanContent();

        // 6. Improved LLM Context with better structure
        const llmContext = `
SOURCE URL: ${url}
PLATFORM: ${platform}

${metadata}
${keyInfo}
${structuredData}

--- MAIN CONTENT ---
${mainContent.substring(0, 12000)}
        `.trim();

        let data = {
            success: true,
            url: url,
            platform: platform,
            clean_context: llmContext,
            char_count: llmContext.length,
            // Also provide raw structured data separately if needed
            raw_metadata: {
                title: document.title,
                description: document.querySelector('meta[name="description"]')?.content
            }
        };

        console.log(`[Scraper] Successfully prepared ${data.char_count} chars of context.`);
        return data;

    } catch (e) {
        console.error("[Scraper Error]:", e);
        return {
            success: false,
            error: e.toString(),
            url: window.location.href,
            clean_context: ""
        };
    }
})();