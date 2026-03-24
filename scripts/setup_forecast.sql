-- Create Price Forecasts Table
CREATE TABLE IF NOT EXISTS public.price_forecasts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    commodity TEXT NOT NULL,
    forecast_date DATE NOT NULL,
    predicted_price NUMERIC NOT NULL,
    lower_bound NUMERIC,
    upper_bound NUMERIC,
    confidence_level TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_forecast UNIQUE (state, district, commodity, forecast_date)
);

-- Enable RLS
ALTER TABLE public.price_forecasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all read" ON public.price_forecasts FOR SELECT USING (true);
CREATE POLICY "Allow all upsert" ON public.price_forecasts FOR ALL USING (true) WITH CHECK (true);

-- Refresh Cache
NOTIFY pgrst, 'reload schema';
