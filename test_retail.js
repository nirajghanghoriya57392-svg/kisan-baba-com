import { fetchCityRetailData } from './src/utils/api.js';

async function testRetailData() {
  console.log("🧪 Testing Retail Data Integration...");
  
  const testCases = ["Tomato", "Onion", "Potato", "Wheat", "Unknown"];
  
  for (const crop of testCases) {
    const data = await fetchCityRetailData(crop, "Madhya Pradesh");
    console.log(`\nCrop: ${crop}`);
    console.log(`- City: ${data.city}`);
    console.log(`- Retail Price: ${data.retailPriceKg || 'Calculated'}`);
    console.log(`- Source: ${data.source}`);
  }
}

testRetailData();
