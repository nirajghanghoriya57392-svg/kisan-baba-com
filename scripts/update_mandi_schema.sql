-- Update Mandi Prices Table for Source Tracking
ALTER TABLE public.mandi_prices 
ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'API';

COMMENT ON COLUMN public.mandi_prices.data_source IS 'Source of the price data: API, HTML_SCRAPER, AI_ESTIMATE, or USER_PULSE';

-- Create table for AI Forecasts if it doesn't exist (Tier 3 Fallback)
CREATE TABLE IF NOT EXISTS public.daily_forecasts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    commodity TEXT NOT NULL,
    forecast_date DATE NOT NULL,
    predicted_price NUMERIC NOT NULL,
    lower_bound NUMERIC,
    upper_bound NUMERIC,
    confidence_score NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_forecast UNIQUE (district, commodity, forecast_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_forecasts_district_commodity ON public.daily_forecasts(district, commodity);
CREATE INDEX IF NOT EXISTS idx_forecasts_date ON public.daily_forecasts(forecast_date);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
