/**
 * KisanBaba CSV Seeder
 * -------------------
 * Processes large historical Mandi CSVs into Supabase.
 * Handles 80,000+ records with batch upserts.
 * 
 * Usage: node scripts/csv_seeder.js [CSV_PATH]
 */

import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CSV_FILE = process.argv[2] || "All_Type_of_Report_(All_Grades)_23-03-2026_04-55-08_AM.csv";

async function seedCSV() {
    console.log(`🚀 KisanBaba: Starting Intelligence Ingestion from: ${CSV_FILE}`);
    
    if (!fs.existsSync(CSV_FILE)) {
        console.error("❌ Error: CSV file not found.");
        return;
    }

    const content = fs.readFileSync(CSV_FILE, 'utf8');
    const lines = content.split('\n');
    
    // Skip first two lines (Header info and Column names)
    const dataLines = lines.slice(2);
    const BATCH_SIZE = 500;
    let records = [];
    let syncedCount = 0;
    let errorCount = 0;

    console.log(`📊 Total potential records in file: ${dataLines.length}`);

    for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i].trim();
        if (!line) continue;

        // Note: Simple split might fail if data contains commas in strings
        const cols = line.split(',');
        if (cols.length < 10) continue; 

        try {
            // Raw values from CSV
            const state = cols[0];
            const district = cols[1];
            const mandi = cols[2];
            const commodity = cols[4];
            const dateStr = cols[5]; // Expected format: DD-MM-YYYY
            const arrivalVol = parseFloat(cols[7]);
            const minP = parseInt(cols[9]);
            const modP = parseInt(cols[10]);
            const maxP = parseInt(cols[11]);

            // Validate Date
            if (!dateStr || !dateStr.includes('-')) {
                throw new Error(`Invalid date format: ${dateStr}`);
            }

            const [d, m, y] = dateStr.split('-');
            const isoDate = new Date(`${y}-${m}-${d}`).toISOString();

            records.push({
                state,
                district,
                mandi,
                commodity,
                min_price: isNaN(minP) ? 0 : minP,
                modal_price: isNaN(modP) ? 0 : modP,
                max_price: isNaN(maxP) ? 0 : maxP,
                arrival_volume: isNaN(arrivalVol) ? 0 : arrivalVol,
                recorded_at: isoDate,
                source: "Verified CSV"
            });

            // Batch Upsert every 500 records
            if (records.length >= BATCH_SIZE) {
                const { error } = await supabase.from('mandi_prices').upsert(records, { 
                    onConflict: 'state,district,mandi,commodity,recorded_at' 
                });
                
                if (error) {
                    console.error(`\n❌ DB Sync Error (Batch ${Math.floor(syncedCount/BATCH_SIZE)}):`, error.message);
                } else {
                    syncedCount += records.length;
                    process.stdout.write(`\r   ✅ Success: ${syncedCount} records synced... (Errors: ${errorCount})`);
                }
                records = [];
            }
        } catch (e) {
            errorCount++;
            if (errorCount <= 3) {
                console.error(`\n⚠️ Row ${i+3} skipped: ${e.message} | Content: ${line.substring(0, 50)}...`);
            }
        }
    }

    // Final batch
    if (records.length > 0) {
        const { error } = await supabase.from('mandi_prices').upsert(records);
        if (!error) syncedCount += records.length;
    }

    console.log(`\n\n🏆 Mission Finished at ${new Date().toLocaleTimeString()}`);
    console.log(`✅ Total Synced: ${syncedCount}`);
    console.log(`⚠️ Total Skipped: ${errorCount}`);
    console.log(`🌍 KisanBaba AI dashboard updated.`);
}

seedCSV();
