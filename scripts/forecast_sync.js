import { exec } from 'child_process';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function runForecast(state, district, commodity) {
    console.log(`📡 Satellite Bridge: Running AI Forecast for ${commodity}...`);

    return new Promise((resolve, reject) => {
        // Step 1: Execute Python Prophet Engine
        const cmd = `python scripts/price_predictor.py --state "${state}" --district "${district}" --commodity "${commodity}"`;
        
        exec(cmd, async (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Python Error: ${error.message}`);
                return reject(error);
            }
            if (stderr) console.warn(`⚠️ Warning: ${stderr}`);

            console.log("✅ Prophet Logic Complete. Reading output...");

            // Step 2: Read Generated Forecast JSON
            if (fs.existsSync('prediction_output.json')) {
                const predictions = JSON.parse(fs.readFileSync('prediction_output.json', 'utf8'));
                
                console.log(`💎 Syncing ${predictions.length} forecast points to Supabase...`);

                // Step 3: Upload to Supabase
                const { error: dbError } = await supabase.from('price_forecasts').upsert(predictions, {
                    onConflict: 'state,district,commodity,forecast_date'
                });

                if (dbError) {
                    console.error(`❌ DB Sync Failed: ${dbError.message}`);
                    return reject(dbError);
                }

                console.log(`🏆 Success! KisanBaba AI Forecast updated for ${commodity}.`);
                fs.unlinkSync('prediction_output.json'); // Clean up
                resolve();
            } else {
                console.error("❌ No output found from Prophet engine.");
                reject(new Error("No production output"));
            }
        });
    });
}

// Example: Run for the most critical crop
runForecast("Chhattisgarh", "Raipur", "Tomato");
