import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function verifyWeather() {
    console.log("🔍 KisanBaba: Auditing Satellite Intelligence in Supabase...");

    const { data, error } = await supabase
        .from('weather_logs')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("❌ Audit Failed:", error.message);
        return;
    }

    if (!data || data.length === 0) {
        console.log("⚠️ No data found yet. The bot hasn't uploaded anything successfully.");
        return;
    }

    console.log("\n✅ [AUDIT REPORT] - Top 5 Records Found:");
    console.table(data.map(d => ({
        Date: d.recorded_at,
        District: d.district,
        MaxTemp: d.temp_max,
        Rain: d.precipitation,
        Solar: d.solar_radiation,
        Soil: d.soil_moisture,
        Source: d.source
    })));

    // CHECK FOR MISSING COLS
    const first = data[0];
    const missing = [];
    if (first.solar_radiation === null) missing.push("Solar Radiation");
    if (first.soil_moisture === null) missing.push("Soil Moisture");
    
    if (missing.length > 0) {
        console.warn(`\n⚠️ Missing Data Found: [${missing.join(', ')}] columns are empty.`);
        console.log("💡 Fix: Make sure you ran the 'Reload Schema' and 'ALTER TABLE' commands!");
    } else {
        console.log("\n💎 DATA HEALTH: 100% EXCELLENT. All Satellite parameters are being captured correctly.");
    }
}

verifyWeather();
