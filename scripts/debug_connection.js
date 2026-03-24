import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

console.log("🔍 KisanBaba Connection Debugger");
console.log("--------------------------------");
console.log(`📡 URL: ${url ? "✅ Found" : "❌ Missing"}`);
console.log(`🔑 Key: ${key ? "✅ Found" : "❌ Missing"}`);

if (!url || !key) {
  console.error("❌ ERROR: Supabase keys are missing from .env file.");
  process.exit(1);
}

const supabase = createClient(url, key);

async function debug() {
  console.log("\n📡 Pinging Supabase Server...");
  
  const start = Date.now();
  try {
    const { data, error } = await supabase.from('mandi_prices').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error("❌ SUPABASE REJECTED REQUEST:");
      console.error(`   - Code: ${error.code}`);
      console.error(`   - Message: ${error.message}`);
      console.error(`   - Hint: ${error.hint}`);
      
      if (error.message.includes("fetch")) {
        console.warn("\n⚠️ DIAGNOSIS: This looks like a NETWORK BLOCK (Section 69A). The government may be blocking the connection.");
      }
    } else {
      console.log(`✅ CONNECTION SUCCESSFUL! (Time: ${Date.now() - start}ms)`);
      console.log("🚀 Database is healthy and responding.");
    }
  } catch (err) {
    console.error("❌ CRITICAL NETWORK ERROR:");
    console.error(err);
    console.warn("\n⚠️ DIAGNOSIS: Your internet provider is likely blocking Supabase. Try a VPN or switch to Neon.tech as discussed.");
  }
}

debug();
