(function () {
    try {
        const url = window.location.href;
        // Get the entire visible text of the page
        const fullText = document.body.innerText;

          let data = {
            url: url,
            platform: url.includes("linkedin.com") ? "LinkedIn" : (url.includes("github.com") ? "GitHub" : "Web"),
            full_text: fullText
        };

        console.log("Cold Email Drafter Scraper result:", "Captured " + fullText.length + " characters");
        return data;

    } catch (e) {
        console.error("Cold Email Drafter Scraper Error:", e);
        return {

            error: e.toString(),
            url: window.location.href,
            text: document.body.innerText.substring(0, 2000)
        };
    }
})();
