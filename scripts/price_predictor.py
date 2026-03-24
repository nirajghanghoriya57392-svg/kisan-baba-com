import os
import pandas as pd
from prophet import Prophet
from supabase import createClient, Client
from dotenv import load_dotenv
import json
import argparse

# Load Credentials
load_dotenv()
url: str = os.environ.get("VITE_SUPABASE_URL")
key: str = os.environ.get("VITE_SUPABASE_ANON_KEY")
supabase: Client = createClient(url, key)

def predict_crop_price(state, district, commodity):
    print(f"🧠 KisanBaba AI: Analyzing {commodity} in {district}, {state}...")

    # 1. Fetch Historical Data from Supabase
    # We target the last 365 days of 'mandi_prices'
    query = supabase.table("mandi_prices") \
        .select("recorded_at, modal_price") \
        .eq("state", state) \
        .eq("district", district) \
        .eq("commodity", commodity) \
        .order("recorded_at") \
        .execute()

    if not query.data or len(query.data) < 10:
        print(f"⚠️ Insufficient data for prediction ({len(query.data)} points found).")
        return None

    # 2. Format for Prophet (ds = date, y = value)
    df = pd.DataFrame(query.data)
    df = df.rename(columns={'recorded_at': 'ds', 'modal_price': 'y'})
    df['ds'] = pd.to_datetime(df['ds'])

    # 3. Model Logic
    m = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        changepoint_prior_scale=0.05
    )
    
    # Add Indian Holiday Seasonality (Optional, but great for deep analysis)
    # m.add_country_holidays(country_name='IN')

    m.fit(df)

    # 4. Forecast 30 days into the future
    future = m.make_future_dataframe(periods=30)
    forecast = m.predict(future)

    # 5. Extract results (Current + Predictions)
    # We only take: ds, yhat (prediction), yhat_lower, yhat_upper
    results = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(45) # Last 15 days + 30 future
    
    # Convert to JSON format for Supabase
    output = []
    for index, row in results.iterrows():
        output.append({
            "state": state,
            "district": district,
            "commodity": commodity,
            "forecast_date": row['ds'].strftime('%Y-%m-%d'),
            "predicted_price": round(row['yhat'], 2),
            "lower_bound": round(row['yhat_lower'], 2),
            "upper_bound": round(row['yhat_upper'], 2),
            "confidence_level": "Medium" # Prophet default
        })

    return output

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--state", default="Chhattisgarh")
    parser.add_argument("--district", default="Raipur")
    parser.add_argument("--commodity", default="Tomato")
    args = parser.parse_args()

    predictions = predict_crop_price(args.state, args.district, args.commodity)
    
    if predictions:
        print(f"✅ Prediction Successful. Generated {len(predictions)} forecast points.")
        # Store in JSON for the Node.js Bridge to pick up
        with open("prediction_output.json", "w") as f:
            json.dump(predictions, f)
