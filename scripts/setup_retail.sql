-- Create Retail Prices Master Table
CREATE TABLE IF NOT EXISTS public.retail_prices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    state TEXT NOT NULL,
    centre TEXT NOT NULL,
    commodity TEXT NOT NULL,
    recorded_at DATE NOT NULL,
    price NUMERIC NOT NULL,
    source TEXT DEFAULT 'DCA Retail',
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_retail_price UNIQUE (state, centre, commodity, recorded_at)
);

-- Enable RLS
ALTER TABLE public.retail_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all read" ON public.retail_prices FOR SELECT USING (true);
CREATE POLICY "Allow all upsert" ON public.retail_prices FOR ALL USING (true) WITH CHECK (true);

-- Refresh Cache
NOTIFY pgrst, 'reload schema';
