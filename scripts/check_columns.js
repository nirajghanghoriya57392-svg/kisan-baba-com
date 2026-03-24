import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSchema() {
    console.log("🔍 Checking mandi_prices schema...");
    const { data, error } = await supabase.from('mandi_prices').select('*').limit(1);
    
    if (error) {
        console.error("❌ Error fetching data:", error.message);
        return;
    }
    
    if (data && data.length > 0) {
        console.log("✅ Sample record found. Columns:");
        console.log(Object.keys(data[0]).join(', '));
    } else {
        console.log("⚠️ No records found or table structure is empty.");
    }
}

checkSchema();
