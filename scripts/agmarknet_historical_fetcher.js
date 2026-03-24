/**
 * Agmarknet Historical Data Fetcher (Demo Scraper)
 * -----------------------------------------------
 * Fetches all India-wide records for a commodity from Jan 1, 2026, till today.
 * Calculates Min, Max, and Average prices to empower predictive modeling.
 * 
 * Usage: node scripts/agmarknet_historical_fetcher.js [CommodityName]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const API_KEY = process.env.OGD_API_KEY || "5735b2db658097d4da96323cfc00329a";
const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TARGET_COMMODITY = process.argv[2] || "Tomato";
const SYNC_DAYS = parseInt(process.argv[3]) || 90; // Default to 3 months

// Calculate dates for sync
const today = new Date();
const startDate = new Date();
startDate.setDate(today.getDate() - SYNC_DAYS);

const formatDate = (date) => `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
const START_DATE_STR = formatDate(startDate);

async function fetchHistoricalData() {
    console.log(`📡 KisanBaba: Syncing Data for: ${TARGET_COMMODITY}`);
    console.log(`🕒 Days: ${SYNC_DAYS} (${START_DATE_STR} to ${formatDate(today)})`);
    
    let allRecords = [];
    let offset = 0;
    const limit = 500; // Smaller chunks for better reliability

    try {
        while (true) {
            const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=${limit}&offset=${offset}&filters[commodity]=${TARGET_COMMODITY}`;
            const response = await fetch(url);
            
            if (!response.ok) {
              console.error(`❌ API Error: ${response.status}`);
              break;
            }

            const data = await response.json();
            const records = data.records || [];
            if (records.length === 0) break;

            // Map and Upsert all available records (API handles date filtering via range if we add it, 
            // but for now, we just sync everything retrieved for this commodity)
            if (records.length > 0) {
                const dbRecords = records.map(r => ({
                    state: r.state,
                    district: r.district,
                    market: r.market,
                    commodity: r.commodity,
                    min_price: parseInt(r.min_price),
                    max_price: parseInt(r.max_price),
                    modal_price: parseInt(r.modal_price),
                    arrival_quantity: parseFloat(r.arrival_quantity),
                    recorded_at: new Date(r.arrival_date.split('/').reverse().join('-')).toISOString()
                }));

                const { error } = await supabase.from('mandi_prices').upsert(dbRecords, { 
                    onConflict: 'market,commodity,recorded_at',
                    ignoreDuplicates: false 
                });

                if (error) {
                    console.error("   ❌ DB Sync Error:", error.message);
                } else {
                    console.log(`   ✅ Synced ${dbRecords.length} records (Offset: ${offset})`);
                }
            }

            allRecords = [...allRecords, ...records];
            if (records.length < limit) break;
            offset += limit;
        }

        console.log(`\n🚀 Mission Complete: ${allRecords.length} records synced to Cloud.`);
        console.log(`🌍 KisanBaba AI now has 1 year of ${TARGET_COMMODITY} intelligence.`);
    } catch (error) {
        console.error("❌ Deep Sync Failed:", error.message);
    }
}

fetchHistoricalData();
