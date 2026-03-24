/**
 * KisanBaba RSS Feed Utility for Authentic Govt Updates (PIB)
 */

const AGRI_KEYWORDS = ["MSP", "Minimum Support Price", "Agriculture", "Kisan", "Farmer", "Mandi", "Crop", "CCEA", "Cabinet", "Agmarknet"];

/**
 * Fetch and parse latest agriculture policy news from PIB (Press Information Bureau)
 * @param {string} lang - 'en' or 'hi'
 * @returns {Promise<Array>} - List of news items
 */
export async function fetchAgriNews(lang = 'en') {
    const cacheKey = `kisanbaba_news_${lang}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 3600000) return parsed.data; // 1 hour cache
    }

    try {
        // Using our Vite proxy to bypass CORS
        const langCode = lang === 'hi' ? '2' : '1';
        const regId = lang === 'hi' ? '3' : '1';
        const url = `/api/pib/RssMain.aspx?ModId=6&Lang=${langCode}&Regid=${regId}`;

        const response = await fetch(url);
        const text = await response.text();
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        const items = xmlDoc.querySelectorAll("item");

        const news = [];
        items.forEach(item => {
            const title = item.querySelector("title")?.textContent || "";
            const description = item.querySelector("description")?.textContent || "";
            const link = item.querySelector("link")?.textContent || "";
            const pubDate = item.querySelector("pubDate")?.textContent || "";

            // Simple keyword filter to ensure relevance to agriculture
            const isRelevant = AGRI_KEYWORDS.some(kw => 
                title.toLowerCase().includes(kw.toLowerCase()) || 
                description.toLowerCase().includes(kw.toLowerCase())
            );

            if (isRelevant) {
                news.push({
                    title,
                    description: description.replace(/<[^>]*>?/gm, '').slice(0, 160) + "...",
                    link,
                    date: new Date(pubDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    }),
                    source: "PIB (Govt of India)"
                });
            }
        });

        // If no relevant news found, fallback to top 5 general releases (often relevant anyway)
        const finalData = news.length > 0 ? news : Array.from(items).slice(0, 5).map(item => ({
            title: item.querySelector("title")?.textContent || "",
            description: (item.querySelector("description")?.textContent || "").replace(/<[^>]*>?/gm, '').slice(0, 160) + "...",
            link: item.querySelector("link")?.textContent || "",
            date: new Date(item.querySelector("pubDate")?.textContent || "").toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }),
            source: "PIB (Govt of India)"
        }));

        localStorage.setItem(cacheKey, JSON.stringify({ data: finalData, timestamp: Date.now() }));
        return finalData;

    } catch (error) {
        console.error("PIB RSS Fetch Error:", error);
        return [];
    }
}
