import { fetchAgriNews } from './src/utils/rss.js';

async function test() {
    console.log("Testing PIB RSS Fetch...");
    const news = await fetchAgriNews('en');
    console.log("Fetched News Count:", news.length);
    if (news.length > 0) {
        console.log("First Item:", news[0]);
    } else {
        console.log("No news fetched. Check proxy/network.");
    }
}

test();
