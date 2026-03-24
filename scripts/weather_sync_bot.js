/**
 * KisanBaba AI: NASA Satellite Weather Sync Bot
 * --------------------------------------------
 * Connects directly to NASA POWER API to fetch 1 year of climate data for a district.
 * Parameters: Rainfall, Max/Min Temp, Humidity, Wind Speed.
 * 
 * Usage: node scripts/weather_sync_bot.js [State] [District]
 */

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

// Load the National District Database
const districtsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/india_districts.json'), 'utf8'));

const STATES_INPUT = process.argv[2] || "Chhattisgarh";
const STATES_TO_SYNC = STATES_INPUT.split(',').map(s => s.trim());
const TARGET_DISTRICT = process.argv[3];
const IS_DAILY = process.argv.includes('--daily');

async function syncNASAWeather() {
    // Initialize the Live Report File
    const reportPath = path.join(__dirname, 'sync_report.md');
    fs.writeFileSync(reportPath, `# 🛰️ KisanBaba NASA Sync: Live Mission Report\n\n| State | District | Status | Records | Time |\n| :--- | :--- | :--- | :--- | :--- |\n`);

    console.log(`📡 KisanBaba: Starting ${IS_DAILY ? 'DAILY WATCHDOG' : 'NATIONAL'} Mission`);
    
    // Date Logic
    let start = "20250101";
    const today = new Date();
    
    if (IS_DAILY) {
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(today.getDate() - 5);
        start = fiveDaysAgo.toISOString().split('T')[0].replace(/-/g, '');
        console.log(`🕒 Mode: Daily Sync (Last 5 Days)`);
    } else {
        console.log(`🕒 Mode: Historical Sync (Since Jan 2025)`);
    }

    const end = today.toISOString().split('T')[0].replace(/-/g, '');

    for (const stateName of STATES_TO_SYNC) {
        const districts = districtsData[stateName];
        if (!districts) {
            console.warn(`\n⚠️ Skipping State: ${stateName} (Not found in database)`);
            continue;
        }

        const districtsToSync = TARGET_DISTRICT 
            ? districts.filter(d => d.district === TARGET_DISTRICT)
            : districts;

        console.log(`\n🏢 Processing State: ${stateName} (${districtsToSync.length} Districts)`);

        for (const d of districtsToSync) {
            console.log(`   🌍 Syncing District: ${d.district}...`);
            
            const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M_MAX,T2M_MIN,PRECTOTCORR,RH2M,WS2M,ALLSKY_SFC_SW_DWN,GWETTOP,FROST_DAYS,PS,ALLSKY_KT&community=AG&longitude=${d.lng}&latitude=${d.lat}&start=${start}&end=${end}&format=JSON`;

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`NASA API Error ${response.status}: ${errorText.substring(0, 100)}`);
                }
                
                const data = await response.json();
                const properties = data.properties.parameter;
                
                const dates = Object.keys(properties.T2M_MAX);
                const records = dates
                    .map(dateStr => {
                        const formattedDate = `${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)}`;
                        const tMax = properties.T2M_MAX[dateStr];
                        
                        // NASA uses -999 for missing data (usually for "Today" or "Yesterday")
                        if (tMax === -999) return null;

                        return {
                            state: stateName,
                            district: d.district,
                            recorded_at: formattedDate,
                            temp_max: tMax,
                            temp_min: properties.T2M_MIN[dateStr],
                            precipitation: properties.PRECTOTCORR[dateStr],
                            humidity: properties.RH2M[dateStr],
                            wind_speed: properties.WS2M[dateStr],
                            solar_radiation: properties.ALLSKY_SFC_SW_DWN[dateStr],
                            soil_moisture: properties.GWETTOP[dateStr],
                            frost_days: properties.FROST_DAYS?.[dateStr] || 0,
                            surface_pressure: properties.PS?.[dateStr] || 0,
                            clarity_index: properties.ALLSKY_KT?.[dateStr] || 0,
                            source: "NASA Satellite"
                        };
                    })
                    .filter(r => r !== null); // Remove incomplete days

                if (records.length === 0) {
                    console.log(`      ⚠️ No valid data found for these dates.`);
                    continue;
                }

                console.log(`      💎 [FULL SPECTRUM]: Captured ${records.length} valid days. Example Solar=${records[0].solar_radiation}`);

                const BATCH_SIZE = 100;
                for (let i = 0; i < records.length; i += BATCH_SIZE) {
                    const batch = records.slice(i, i + BATCH_SIZE);
                    const { error } = await supabase.from('weather_logs').upsert(batch, {
                        onConflict: 'state,district,recorded_at'
                    });

                    if (error) {
                        console.error(`      ❌ Error: ${error.message}`);
                        break;
                    }
                    process.stdout.write(`      🚀 Progress: ${Math.round((i + batch.length)/records.length * 100)}% complete...\r`);
                }
                process.stdout.write(`      ✅ ${d.district} Synced!                                \n`);

                // --- ADDED: LIVE REPORTING ---
                const reportLine = `| ${stateName} | ${d.district} | ✅ Success | ${records.length} Days | ${new Date().toLocaleTimeString()} |\n`;
                fs.appendFileSync(path.join(__dirname, 'sync_report.md'), reportLine);

            } catch (err) {
                console.error(`      ❌ Failed: ${err.message}`);
                const errorLine = `| ${stateName} | ${d.district} | ❌ FAILED | 0 | ${err.message} |\n`;
                fs.appendFileSync(path.join(__dirname, 'sync_report.md'), errorLine);
            }
        }
    }

    console.log(`\n\n🏆 ALL-DISTRICT NATIONAL MISSION COMPLETE!`);
    console.log(`🌍 KisanBaba AI is now a Climate Master for all selected states.`);
}

syncNASAWeather();
