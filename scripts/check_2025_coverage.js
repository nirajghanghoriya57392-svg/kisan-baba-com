import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkDateCoverage() {
    console.log("📅 Checking data coverage for 2025...");
    
    const { data: minMax, error: minMaxError } = await supabase
        .from('mandi_prices')
        .select('recorded_at')
        .order('recorded_at', { ascending: true });

    if (minMaxError) {
        console.error("❌ Error fetching dates:", minMaxError.message);
        return;
    }

    if (minMax.length === 0) {
        console.log("⚠️ No data in mandi_prices.");
        return;
    }

    const firstDate = minMax[0].recorded_at;
    const lastDate = minMax[minMax.length - 1].recorded_at;
    console.log(`📊 Date Range: ${firstDate} to ${lastDate}`);

    // Count records per month in 2025
    const months = {};
    minMax.forEach(r => {
        const date = new Date(r.recorded_at);
        if (date.getFullYear() === 2025) {
            const month = date.getMonth() + 1; // 1-indexed
            months[month] = (months[month] || 0) + 1;
        }
    });

    console.log("📅 2025 Monthly Breakdown:");
    for (let m = 1; m <= 12; m++) {
        console.log(`Month ${m}: ${months[m] || 0} records`);
    }
}

checkDateCoverage();
