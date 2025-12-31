(function () {
    try {
        const url = window.location.href;

        // 1. Identify Platform with Job-specific detection
        const getPlatform = (url) => {
            if (url.includes("linkedin.com/jobs/")) return "LinkedIn Job";
            if (url.includes("linkedin.com/company/")) return "LinkedIn Company";
            if (url.includes("linkedin.com/in/")) return "LinkedIn Profile";
            if (url.includes("linkedin.com")) return "LinkedIn";
            if (url.includes("github.com")) return "GitHub";
            if (url.includes("indeed.com")) return "Indeed Job";
            if (url.includes("glassdoor.com")) return "Glassdoor";
            if (url.includes("jobs.lever.co")) return "Lever Job";
            if (url.includes("boards.greenhouse.io")) return "Greenhouse Job";
            if (url.includes("workday.com")) return "Workday Job";
            if (url.includes("myworkdayjobs.com")) return "Workday Job";
            if (url.includes("careers") || url.includes("jobs") || url.includes("openings")) return "Careers Page";
            return "Web";
        };

        // 2. Enhanced Metadata Extraction
        const getMetadata = () => {
            const title = document.title || "";
            const description = document.querySelector('meta[name="description"]')?.content || "";
            const ogTitle = document.querySelector('meta[property="og:title"]')?.content || "";
            const ogDescription = document.querySelector('meta[property="og:description"]')?.content || "";

            return `Page Title: ${title}    
                    OG Title: ${ogTitle}
                    Description: ${description}
                    OG Description: ${ogDescription}
                    `;
        };

        // 3. LinkedIn Job-Specific Extraction
        const getLinkedInJobData = () => {
            let jobData = {};

            // Job Title
            jobData.title = document.querySelector('.job-details-jobs-unified-top-card__job-title, .topcard__title, h1.t-24')?.textContent?.trim() ||
                document.querySelector('h1')?.textContent?.trim() || "";

            // Company Name
            jobData.company = document.querySelector('.job-details-jobs-unified-top-card__company-name, .topcard__org-name-link, a[data-tracking-control-name="public_jobs_topcard-org-name"]')?.textContent?.trim() ||
                document.querySelector('.jobs-unified-top-card__company-name a')?.textContent?.trim() || "";

            // Location
            jobData.location = document.querySelector('.job-details-jobs-unified-top-card__bullet, .topcard__flavor--bullet')?.textContent?.trim() ||
                document.querySelector('.jobs-unified-top-card__bullet')?.textContent?.trim() || "";

            // Job Description - try multiple selectors
            const descriptionSelectors = [
                '.jobs-description__content',
                '.jobs-box__html-content',
                '.description__text',
                '.show-more-less-html__markup',
                '[data-job-description]',
                '.jobs-description',
                '#job-details'
            ];

            for (const selector of descriptionSelectors) {
                const el = document.querySelector(selector);
                if (el && el.textContent?.trim().length > 100) {
                    jobData.description = el.textContent.trim();
                    break;
                }
            }

            // Employment type, level
            jobData.details = [];
            document.querySelectorAll('.job-details-jobs-unified-top-card__job-insight, .description__job-criteria-item').forEach(el => {
                jobData.details.push(el.textContent?.trim());
            });

            return jobData;
        };

        // 4. Indeed Job Extraction
        const getIndeedJobData = () => {
            let jobData = {};

            jobData.title = document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"], .jobsearch-JobInfoHeader-title, h1.jobsearch-JobInfoHeader-title')?.textContent?.trim() ||
                document.querySelector('h1')?.textContent?.trim() || "";

            jobData.company = document.querySelector('[data-testid="inlineHeader-companyName"], .jobsearch-InlineCompanyRating-companyHeader a, [data-company-name]')?.textContent?.trim() || "";

            jobData.location = document.querySelector('[data-testid="job-location"], .jobsearch-JobInfoHeader-subtitle > div:last-child')?.textContent?.trim() || "";

            jobData.description = document.querySelector('#jobDescriptionText, .jobsearch-jobDescriptionText')?.textContent?.trim() || "";

            jobData.salary = document.querySelector('[data-testid="attribute_snippet_testid"], .jobsearch-JobMetadataHeader-salarySnippet')?.textContent?.trim() || "";

            return jobData;
        };

        // 5. Greenhouse Job Extraction
        const getGreenhouseJobData = () => {
            let jobData = {};

            jobData.title = document.querySelector('.app-title, h1.heading')?.textContent?.trim() ||
                document.querySelector('h1')?.textContent?.trim() || "";

            jobData.company = document.querySelector('.company-name, .logo img')?.alt ||
                document.title.split(' at ')[1]?.split(' - ')[0]?.trim() || "";

            jobData.location = document.querySelector('.location, [class*="location"]')?.textContent?.trim() || "";

            jobData.description = document.querySelector('#content, .content, [class*="description"]')?.textContent?.trim() || "";

            return jobData;
        };

        // 6. Lever Job Extraction
        const getLeverJobData = () => {
            let jobData = {};

            jobData.title = document.querySelector('.posting-headline h2, h1.heading')?.textContent?.trim() ||
                document.querySelector('h2')?.textContent?.trim() || "";

            jobData.company = document.querySelector('.posting-headline .sort-by-time a')?.textContent?.trim() ||
                document.querySelector('[data-qa="header-company-name"]')?.textContent?.trim() || "";

            jobData.location = document.querySelector('.posting-categories .location, .workplaceTypes')?.textContent?.trim() || "";

            // Lever has sections for content
            const sections = [];
            document.querySelectorAll('.posting-section').forEach(section => {
                sections.push(section.textContent?.trim());
            });
            jobData.description = sections.join('\n\n');

            return jobData;
        };

        // 7. Workday Job Extraction
        const getWorkdayJobData = () => {
            let jobData = {};

            jobData.title = document.querySelector('[data-automation-id="jobPostingHeader"], h2[data-automation-id="jobTitle"]')?.textContent?.trim() ||
                document.querySelector('h1, h2')?.textContent?.trim() || "";

            jobData.company = document.querySelector('[data-automation-id="company"]')?.textContent?.trim() || "";

            jobData.location = document.querySelector('[data-automation-id="locations"]')?.textContent?.trim() || "";

            jobData.description = document.querySelector('[data-automation-id="jobPostingDescription"]')?.textContent?.trim() || "";

            return jobData;
        };

        // 8. Generic Job Page Extraction (heuristics for any site)
        const getGenericJobData = () => {
            let jobData = {};

            // Try common patterns for job title
            const titleCandidates = [
                document.querySelector('h1'),
                document.querySelector('[class*="job-title"], [class*="jobTitle"], [class*="position-title"]'),
                document.querySelector('[data-testid*="title"], [data-automation*="title"]')
            ];
            for (const el of titleCandidates) {
                if (el?.textContent?.trim()) {
                    jobData.title = el.textContent.trim();
                    break;
                }
            }

            // Try common patterns for company
            const companyCandidates = [
                document.querySelector('[class*="company"], [class*="employer"], [class*="organization"]'),
                document.querySelector('[data-testid*="company"], [data-automation*="company"]')
            ];
            for (const el of companyCandidates) {
                if (el?.textContent?.trim()) {
                    jobData.company = el.textContent.trim();
                    break;
                }
            }

            // Job description - look for large text blocks
            const descCandidates = [
                document.querySelector('[class*="description"], [class*="job-details"], [class*="responsibilities"]'),
                document.querySelector('[id*="description"], [id*="details"]'),
                document.querySelector('article'),
                document.querySelector('main')
            ];
            for (const el of descCandidates) {
                if (el?.textContent?.trim()?.length > 200) {
                    jobData.description = el.textContent.trim();
                    break;
                }
            }

            return jobData;
        };

        // 9. LinkedIn-Specific Structured Data Extraction
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

        // 10. Extract Key LinkedIn Elements (More Reliable)
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

        // 11. Get Job Data based on platform
        const getJobData = (platform) => {
            switch (platform) {
                case "LinkedIn Job":
                    return getLinkedInJobData();
                case "Indeed Job":
                    return getIndeedJobData();
                case "Greenhouse Job":
                    return getGreenhouseJobData();
                case "Lever Job":
                    return getLeverJobData();
                case "Workday Job":
                    return getWorkdayJobData();
                case "Careers Page":
                    return getGenericJobData();
                default:
                    return null;
            }
        };

        // 12. Improved Content Cleaner with LinkedIn-specific rules
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

        // 13. Build structured job context for AI
        const buildJobContext = (jobData) => {
            if (!jobData || !jobData.title) return "";

            let context = "\n--- JOB LISTING DETAILS ---\n";
            if (jobData.title) context += `Job Title: ${jobData.title}\n`;
            if (jobData.company) context += `Company: ${jobData.company}\n`;
            if (jobData.location) context += `Location: ${jobData.location}\n`;
            if (jobData.salary) context += `Salary: ${jobData.salary}\n`;
            if (jobData.details?.length) context += `Details: ${jobData.details.join(', ')}\n`;
            if (jobData.description) {
                // Trim description to reasonable length
                const desc = jobData.description.substring(0, 5000);
                context += `\nJob Description:\n${desc}\n`;
            }
            return context;
        };

        const platform = getPlatform(url);
        const metadata = getMetadata();
        const structuredData = url.includes("linkedin.com") ? getLinkedInStructuredData() : "";
        const keyInfo = url.includes("linkedin.com") ? getLinkedInKeyInfo() : "";
        const jobData = getJobData(platform);
        const jobContext = buildJobContext(jobData);
        const mainContent = getCleanContent();

        // 14. Improved LLM Context with better structure
        const llmContext = `
SOURCE URL: ${url}
PLATFORM: ${platform}

${metadata}
${keyInfo}
${jobContext}
${structuredData}

--- MAIN CONTENT ---
${mainContent.substring(0, 12000)}
        `.trim();

        let data = {
            success: true,
            url: url,
            platform: platform,
            // IMPORTANT: Support both property names for backwards compatibility
            full_text: llmContext,
            clean_context: llmContext,
            char_count: llmContext.length,
            // Structured job data for enhanced prompting
            job_data: jobData || null,
            // Also provide raw structured data separately if needed
            raw_metadata: {
                title: document.title,
                description: document.querySelector('meta[name="description"]')?.content
            }
        };

        console.log(`[Scraper] Platform: ${platform}, Job Data: ${jobData ? 'Yes' : 'No'}, Context: ${data.char_count} chars`);
        return data;

    } catch (e) {
        console.error("[Scraper Error]:", e);
        return {
            success: false,
            error: e.toString(),
            url: window.location.href,
            full_text: "",
            clean_context: ""
        };
    }
})();