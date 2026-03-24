import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

function parseAgmarknetLine(line) {
    // Basic CSV parser that handles quotes
    const results = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
            results.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    results.push(current.trim());
    return results;
}

function isValidDate(str) {
    return /^\d{2}-\d{2}-\d{4}$/.test(str);
}

async function seedMandiPrices(csvPath) {
    console.log(`🚀 Mandi Storage Agent: Parsing intelligence from ${csvPath}...`);

    if (!fs.existsSync(csvPath)) {
        console.error("❌ Intelligence source not found!");
        return;
    }

    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n');
    
    let headerIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("State,District,Market")) {
            headerIndex = i;
            break;
        }
    }

    if (headerIndex === -1) {
        console.error("❌ Invalid CSV format.");
        return;
    }

    const rawRecords = [];
    let skipped = 0;

    for (let i = headerIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const row = parseAgmarknetLine(line);
        if (row.length < 10) continue;

        // Base indices for Agmarknet "All Type" report:
        // 0: State, 1: District, 2: Market, 3: Group, 4: Commodity, 5: Date
        let dateIdx = 5;
        let commIdx = 4;
        let marketIdx = 2;

        // Robustness: If index 5 is not a date, maybe there was an extra comma in Market
        if (!isValidDate(row[dateIdx])) {
            // Check if index 6 is the date instead
            if (isValidDate(row[6])) {
                dateIdx = 6;
                commIdx = 5;
                // Market probably spanned indices 2 and 3
            } else {
                skipped++;
                continue;
            }
        }

        const dateRaw = row[dateIdx];
        const commodity = row[commIdx];
        const market = row[marketIdx];
        
        // Modal price is usually 5 columns after Date (5, 6, 7, 8, 9, 10)
        // Date(5), MSP(6), Qty(7), Unit(8), Min(9), Modal(10)
        const modalPrice = parseFloat(row[dateIdx + 5]);

        if (dateRaw && commodity && market && !isNaN(modalPrice)) {
            const dateParts = dateRaw.split('-');
            const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

            rawRecords.push({
                state: row[0],
                district: row[1],
                market: market, // We could join row[2]+row[3] if date was at 6, but usually market index is stable
                commodity_group: row[dateIdx - 2],
                commodity: commodity,
                recorded_at: formattedDate,
                arrival_quantity: parseFloat(row[dateIdx + 2]) || 0,
                arrival_unit: row[dateIdx + 3],
                min_price: parseFloat(row[dateIdx + 4]) || 0,
                modal_price: modalPrice,
                max_price: parseFloat(row[dateIdx + 6]) || 0,
                price_unit: (row[dateIdx + 7] || "").trim(),
                source: "Agmarknet Master (Robust)"
            });
        } else {
            skipped++;
        }
    }

    console.log(`📦 Prepared ${rawRecords.length} records. (${skipped} skipped). Syncing...`);

    const BATCH_SIZE = 1000;
    for (let i = 0; i < rawRecords.length; i += BATCH_SIZE) {
        const batch = rawRecords.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('mandi_prices').upsert(batch, {
            onConflict: 'market,commodity,recorded_at'
        });

        if (error) console.error(`❌ Batch ${i} Error: ${error.message}`);
        else process.stdout.write(`✅ Progress: ${Math.round((i + batch.length) / rawRecords.length * 100)}%...\r`);
    }

    console.log(`\n🏆 Mission Complete: ${rawRecords.length} records in storage.`);
}

const targetFile = process.argv[2] || 'c:/Users/CEO/Downloads/All_Type_of_Report_(All_Grades)_23-03-2026_04-55-08_AM.csv';
seedMandiPrices(targetFile);
