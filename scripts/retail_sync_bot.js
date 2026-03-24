import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

const TARGET_URL = 'https://fcainfoweb.nic.in/Reports/DB/Dailyprices.aspx';

async function syncRetailPrices() {
    console.log(`🚀 Retail Watchdog: Starting Daily Mission [DCA Portal]`);

    try {
        // Step 1: Fetch the Daily Data
        // NOTE: In production, we might need a more advanced fetch if ViewState is required.
        // For now, we simulate the standard DCA request.
        const response = await fetch(TARGET_URL);
        const html = await response.text();

        console.log("✅ Connection established with DCA Portal.");

        // Step 2: Parse (Targeting the 'GridView' rows)
        const records = [];
        const rows = html.match(/<tr[\s\S]*?<\/tr>/g) || [];

        rows.forEach(row => {
            const cols = row.match(/<td[\s\S]*?>(.*?)<\/td>/g);
            if (cols && cols.length >= 5) {
                const commodity = cleanText(cols[1]);
                const unit = cleanText(cols[2]);
                const retailPrice = parseFloat(cleanText(cols[3])) || 0;
                
                if (commodity && retailPrice > 0 && !isNaN(retailPrice)) {
                    records.push({
                        state: "National Average", // Daily portal shows national average/sampled centers
                        centre: "DCA Dashboard", 
                        commodity,
                        recorded_at: new Date().toISOString().split('T')[0],
                        price: retailPrice,
                        source: "DCA Live Bot"
                    });
                }
            }
        });

        if (records.length === 0) {
            console.warn("⚠️ No data parsed. DCA Portal might be in maintenance or structure changed.");
            return;
        }

        console.log(`💎 Captured ${records.length} Commodity prices. Upserting to Supabase...`);

        // Step 3: Upsert to Supabase
        const { error } = await supabase.from('retail_prices').upsert(records, {
            onConflict: 'state,centre,commodity,recorded_at'
        });

        if (error) throw error;

        console.log("🏆 Retail Watchdog: Success! Prices updated in Supabase.");

    } catch (err) {
        console.error(`❌ Retail Watchdog Failed: ${err.message}`);
    }
}

function cleanText(htmlTag) {
    if (!htmlTag) return "";
    return htmlTag.replace(/<.*?>/g, "").replace(/&nbsp;/g, "").trim();
}

syncRetailPrices();
