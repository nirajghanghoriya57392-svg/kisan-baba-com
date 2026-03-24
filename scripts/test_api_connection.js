const API_KEY = "5735b2db658097d4da96323cfc00329a";
const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";

async function test() {
    const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=5`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.log(`Status: ${response.status}`);
            const text = await response.text();
            console.log(`Response: ${text.substring(0, 500)}`);
            return;
        }
        const data = await response.json();
        console.log("SUCCESS");
        console.log(`Total Records: ${data.total}`);
        console.log("Sample Record:", JSON.stringify(data.records[0], null, 2));
        
        // Get unique crops and markets summary if possible
        const summaryUrl = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=100`;
        const res2 = await fetch(summaryUrl);
        const data2 = await res2.json();
        const crops = new Set(data2.records.map(r => r.commodity));
        const markets = new Set(data2.records.map(r => r.market));
        console.log(`Crops in last 100 records: ${Array.from(crops).join(', ')}`);
        console.log(`Markets in last 100 records: ${markets.size}`);
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
}

test();
