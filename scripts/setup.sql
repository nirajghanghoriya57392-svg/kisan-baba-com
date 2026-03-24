-- KisanBaba Master Schema Initalization
-- Run this in your Supabase SQL Editor to enable Intelligence Syncing

CREATE TABLE IF NOT EXISTS public.mandi_prices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    market TEXT NOT NULL,
    commodity TEXT NOT NULL,
    min_price BIGINT DEFAULT 0,
    max_price BIGINT DEFAULT 0,
    modal_price BIGINT DEFAULT 0,
    arrival_quantity NUMERIC DEFAULT 0,
    recorded_at TIMESTAMPTZ NOT NULL,
    source TEXT DEFAULT 'API',
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Crucial: This constraint allows the scripts to overwrite old data instead of creating duplicates
    CONSTRAINT unique_mandi_record UNIQUE (market, commodity, recorded_at)
);

-- Enable RLS (Allow read access to anyone, write via service/anon key)
ALTER TABLE public.mandi_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.mandi_prices
    FOR SELECT USING (true);

CREATE POLICY "Allow anon upsert access" ON public.mandi_prices
    FOR ALL USING (true) WITH CHECK (true);
