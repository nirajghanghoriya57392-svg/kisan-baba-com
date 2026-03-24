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

async function seedRetailPrices(csvPath) {
    console.log(`🚀 Retail Master: Ingesting DCA Intelligence from ${csvPath}...`);

    if (!fs.existsSync(csvPath)) {
        console.error("❌ CSV File Not Found!");
        return;
    }

    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split(/\r?\n/);
    console.log(`📊 Total lines in file: ${lines.length}`);

    const records = [];
    // Skip header and empty lines
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Basic CSV parser for quotes if any (though DCA usually doesn't have them)
        const row = line.split(',');
        
        if (i < 5) console.log(`🔍 Row ${i} Sample: [${row.join('|')}] (Length: ${row.length})`);
        
        if (row.length < 8) continue;

        // DCA Master Format: id,date,commodity_group,commodity_id,commodity,zone,centre_id,centre,price
        const dateRaw = row[1];
        const commodity = row[4];
        const centre = row[7];
        const price = parseFloat(row[8]);
        
        if (dateRaw && commodity && !isNaN(price) && price > 0) {
            // Convert DD/MM/YYYY to YYYY-MM-DD
            const dateParts = dateRaw.trim().split('/');
            const formattedDate = dateParts.length === 3 
                ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
                : dateRaw.trim();

            records.push({
                state: "National Average", 
                centre: (centre || "DCA Dashboard").trim(),
                commodity: commodity.trim(),
                recorded_at: formattedDate,
                price: price,
                source: "DCA Master (2025)"
            });
        }
    }

    console.log(`📦 Prepared ${records.length} records. Uploading in batches...`);

    if (records.length === 0) {
        console.warn("⚠️ No records to upload. Check column indices and data format.");
        return;
    }

    const BATCH_SIZE = 1000;
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('retail_prices').upsert(batch, {
            onConflict: 'state,centre,commodity,recorded_at'
        });

        if (error) {
            console.error(`❌ Batch ${i} Error: ${error.message}`);
        } else {
            process.stdout.write(`✅ Progress: ${Math.round((i + batch.length) / records.length * 100)}%...\r`);
        }
    }

    console.log("\n🏆 Retail Master: mission complete!");
}

const targetFile = process.argv[2] || 'c:/Users/CEO/Downloads/data.csv';
seedRetailPrices(targetFile);
