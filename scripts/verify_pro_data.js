import { fetchBenchmarkHubData, fetchCityRetailData, calculateMarketHeatmap } from './src/utils/api.js';

async function verify() {
  console.log("--- Testing 'प्याज' (Onion) ---");
  const benchmark = await fetchBenchmarkHubData("प्याज");
  console.log("Benchmark:", benchmark ? benchmark.hubName : "FAILED");

  const retail = await fetchCityRetailData("प्याज", "Maharashtra");
  console.log("Retail (Primary):", retail && retail.primary ? retail.primary.city : "FAILED");

  const heatmap = await calculateMarketHeatmap("Maharashtra", "प्याज", 2000);
  console.log("Heatmap Length:", heatmap.length);
  
  if (benchmark && retail && heatmap.length > 0) {
    console.log("SUCCESS: All Pro features mapped correctly via normalization.");
  } else {
    console.log("FAILURE: Mismatch detected.");
  }
}

verify();
