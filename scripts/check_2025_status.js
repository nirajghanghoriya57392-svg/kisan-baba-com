import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCoverage() {
  console.log('🔍 Checking 2025 Cereal coverage in Supabase...');
  
  const { data, error } = await supabase
    .from('mandi_prices')
    .select('recorded_at')
    .eq('commodity_group', 'Cereal')
    .gte('recorded_at', '2025-01-01')
    .lt('recorded_at', '2026-01-01');

  if (error) {
    console.error('Error fetching data:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('❌ No Cereal records found for 2025 in Supabase.');
    return;
  }

  const months = new Set();
  data.forEach(record => {
    const date = new Date(record.recorded_at);
    const month = date.toLocaleString('default', { month: 'long' });
    months.add(month);
  });

  console.log(`✅ Found ${data.length} records across ${months.size} months:`);
  console.log(Array.from(months).sort());
  
  const allMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const missing = allMonths.filter(m => !months.has(m));
  if (missing.length > 0) {
    console.log('⚠️ Missing months:', missing.join(', '));
  } else {
    console.log('🏆 All months of 2025 are covered for Cereals!');
  }
}

checkCoverage();
