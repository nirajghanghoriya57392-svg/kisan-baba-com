/**
 * KisanBaba Retail Price Scraper (All India Level)
 * Target: Department of Consumer Affairs (Price Monitoring Division)
 * Schedule: Run daily at 7:00 PM IST
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_URL = 'https://fcainfoweb.nic.in/Reports/DB/Dailyprices.aspx';
const OUTPUT_FILE = path.join(__dirname, '../src/data/retail_prices.json');

async function scrapeRetailPrices() {
  console.log(`🚀 Starting Daily Retail Scrape: ${new Date().toISOString()}`);
  
  try {
    // Note: We use https with native fetch (Node 18+)
    // In production, consider adding 'cheerio' for cleaner parsing
    const response = await fetch(TARGET_URL);
    const html = await response.text();

    console.log("✅ Data Received from DCA portal. Parsing...");

    // Simplified Regex-based parsing (Robust against layout shifts if structure holds)
    // Looking for GridView rows <tr>...<td class="commodity">...</td>...</tr>
    const records = [];
    
    // Pattern to match commodity rows in the DCA DailyPrices table
    // Adjust indices based on the table structure found during research
    const rows = html.match(/<tr[\s\S]*?<\/tr>/g);
    
    if (rows) {
      rows.forEach(row => {
        const cols = row.match(/<td[\s\S]*?>(.*?)<\/td>/g);
        if (cols && cols.length >= 4) {
          const commodity = cleanText(cols[1]);
          const unit = cleanText(cols[2]);
          const retailPrice = parseFloat(cleanText(cols[3])) || 0;
          const wholesalePrice = parseFloat(cleanText(cols[4])) || 0;

          if (commodity && retailPrice > 0) {
            records.push({
              commodity,
              unit,
              retailPrice,
              wholesalePrice
            });
          }
        }
      });
    }

    if (records.length === 0) {
      throw new Error("No valid price records found in the HTML table.");
    }

    const output = {
      lastUpdated: new Date().toISOString(),
      source: "Department of Consumer Affairs (Price Monitoring Division)",
      records
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
    console.log(`🎯 Success! Scraped ${records.length} commodities. Data saved to ${OUTPUT_FILE}`);

  } catch (error) {
    console.error("❌ Scraper Failed:", error.message);
    process.exit(1);
  }
}

function cleanText(htmlTag) {
  if (!htmlTag) return "";
  return htmlTag
    .replace(/<.*?>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, "") // Remove NBSP
    .trim();
}

// Execution
scrapeRetailPrices();
