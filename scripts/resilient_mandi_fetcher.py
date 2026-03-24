import os
import requests
from bs4 import BeautifulSoup
from supabase import createClient, Client
from dotenv import load_dotenv
import json
import datetime
from time import sleep

# Load Credentials
load_dotenv()
SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_ANON_KEY")
OGD_API_KEY = os.environ.get("OGD_API_KEY") or "5735b2db658097d4da96323cfc00329a"

supabase: Client = createClient(SUPABASE_URL, SUPABASE_KEY)

# Config
RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
TIMEOUT = 10

def fetch_from_api(commodity="Tomato"):
    """Tier 1: Fetch from official OGD API."""
    print(f"📡 Tier 1: Trying OGD API for {commodity}...")
    url = f"https://api.data.gov.in/resource/{RESOURCE_ID}?api-key={OGD_API_KEY}&format=json&limit=50&filters[commodity]={commodity}"
    
    try:
        response = requests.get(url, timeout=TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            records = data.get('records', [])
            if records:
                print(f"   ✅ API Success: Found {len(records)} records.")
                return records, "API"
            else:
                print("   ⚠️ API returned empty records.")
        else:
            print(f"   ❌ API Error: {response.status_code}")
    except Exception as e:
        print(f"   ❌ API Request Failed: {str(e)}")
    
    return None, None

def scrape_agmarknet_html(commodity="Tomato"):
    """Tier 2: Scrape from Agmarknet Public Portal."""
    print(f"🌐 Tier 2: Trying HTML Scraper for {commodity}...")
    # This is a simplified scraper targeting the Daily Report Search
    # In a real scenario, we might need a more complex session-based scraper
    # or target a more predictable URL if available.
    url = "https://agmarknet.gov.in/Search_Report/Market_Wise_Daily_Report_Net.aspx"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        # Note: Agmarknet uses ASP.NET Web Forms (__VIEWSTATE, etc.)
        # A robust scraper would need to handle these. 
        # For now, we'll demonstrate the logic of fallback.
        print(f"   🔍 Scraping {url} (Simulated)...")
        # In a real implementation, we'd use Puppeteer/Playwright for this specific ASPX page.
        # But here's the BeautifulSoup skeleton.
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
        if response.status_code == 200:
            # logic to parse table would go here
            # For the demo, if API failed, we might look for last known good data or partial sync
            pass
        
        # simulated successful scrape data
        return None, "HTML_SCRAPER" 
    except Exception as e:
        print(f"   ❌ HTML Scraper Failed: {str(e)}")
    
    return None, None

def get_ai_nowcast(commodity="Tomato", district="Raipur"):
    """Tier 3: Pull AI prediction from Supabase as fallback."""
    print(f"🤖 Tier 3: Trying AI Nowcast (Prophet) for {commodity} in {district}...")
    try:
        # Look for today's forecast in a hypothetical 'daily_forecasts' table
        today_str = datetime.date.today().strftime('%Y-%m-%d')
        query = supabase.table("daily_forecasts") \
            .select("*") \
            .eq("commodity", commodity) \
            .eq("district", district) \
            .eq("forecast_date", today_str) \
            .execute()
        
        if query.data:
            print("   ✅ AI Nowcast retrieved successfully.")
            return query.data, "AI_ESTIMATE"
    except Exception as e:
        print(f"   ❌ AI Fallback Failed: {str(e)}")
    
    return None, None

def sync_to_supabase(records, source):
    """Update Supabase with source tagging."""
    if not records:
        return
    
    print(f"📦 Syncing {len(records)} records from source: {source}...")
    
    processed = []
    for r in records:
        # Map based on API vs Scraper vs AI format
        if source == "API":
            processed.append({
                "state": r['state'],
                "district": r['district'],
                "market": r['market'],
                "commodity": r['commodity'],
                "min_price": float(r['min_price']),
                "max_price": float(r['max_price']),
                "modal_price": float(r['modal_price']),
                "arrival_quantity": float(r['arrival_quantity']),
                "recorded_at": datetime.date.today().isoformat(), # Mark as today for live view
                "data_source": source
            })
        elif source == "AI_ESTIMATE":
            processed.append({
                "state": r['state'],
                "district": r['district'],
                "market": "AI Predicted",
                "commodity": r['commodity'],
                "modal_price": r['predicted_price'],
                "min_price": r['lower_bound'],
                "max_price": r['upper_bound'],
                "recorded_at": r['forecast_date'],
                "data_source": source
            })

    if processed:
        try:
            res = supabase.table("mandi_prices").upsert(processed, on_conflict="market,commodity,recorded_at").execute()
            print(f"   ✅ Successfully synced to 'mandi_prices'.")
        except Exception as e:
            print(f"   ❌ Sync Error: {str(e)}")

def main():
    commodity = "Tomato"
    
    # Try Tier 1: API
    records, source = fetch_from_api(commodity)
    
    # Try Tier 2: HTML (if API fails)
    if not records:
        records, source = scrape_agmarknet_html(commodity)
        
    # Try Tier 3: AI (if both fail)
    if not records:
        records, source = get_ai_nowcast(commodity)
    
    if records:
        sync_to_supabase(records, source)
        print(f"🚀 Mission Complete. Data Source: {source}")
    else:
        print("🚨 CRITICAL: All data acquisition layers failed!")

if __name__ == "__main__":
    main()
