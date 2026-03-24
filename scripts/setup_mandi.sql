-- Create Mandi Prices Table for Agmarknet Data
CREATE TABLE IF NOT EXISTS public.mandi_prices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    market TEXT NOT NULL,
    commodity_group TEXT,
    commodity TEXT NOT NULL,
    recorded_at DATE NOT NULL,
    arrival_quantity NUMERIC,
    arrival_unit TEXT,
    min_price NUMERIC,
    modal_price NUMERIC,
    max_price NUMERIC,
    price_unit TEXT,
    source TEXT DEFAULT 'Agmarknet Report',
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_mandi_price UNIQUE (market, commodity, recorded_at)
);

-- Enable Row Level Security
ALTER TABLE public.mandi_prices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read access" ON public.mandi_prices FOR SELECT USING (true);
CREATE POLICY "Allow service_role full access" ON public.mandi_prices FOR ALL USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mandi_prices_commodity ON public.mandi_prices(commodity);
CREATE INDEX IF NOT EXISTS idx_mandi_prices_recorded_at ON public.mandi_prices(recorded_at);
CREATE INDEX IF NOT EXISTS idx_mandi_prices_market ON public.mandi_prices(market);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
