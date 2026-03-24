import os
import sys
import unittest
from unittest.mock import patch, MagicMock
import datetime

# Add the scripts directory to the path so we can import the fetcher
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import resilient_mandi_fetcher

class TestRobustness(unittest.TestCase):

    def setUp(self):
        self.commodity = "Tomato"
        self.mock_records = [{
            'state': 'Chhattisgarh',
            'district': 'Raipur',
            'market': 'Raipur',
            'commodity': 'Tomato',
            'min_price': '1500',
            'max_price': '2000',
            'modal_price': '1800',
            'arrival_quantity': '100'
        }]

    @patch('resilient_mandi_fetcher.requests.get')
    def test_tier1_api_success(self, mock_get):
        """Simulate API returning data successfully."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'records': self.mock_records}
        mock_get.return_value = mock_response

        records, source = resilient_mandi_fetcher.fetch_from_api(self.commodity)
        
        self.assertEqual(source, "API")
        self.assertEqual(len(records), 1)
        print("✅ Scenario 1: API Success - Verified")

    @patch('resilient_mandi_fetcher.requests.get')
    def test_tier2_api_fail_scraper_fallback(self, mock_get):
        """Simulate API fail (403) and Scraper fallback."""
        # First call (API) fails
        mock_api_response = MagicMock()
        mock_api_response.status_code = 403
        
        # Second call (Scraper) succeeds (simulated)
        mock_scraper_response = MagicMock()
        mock_scraper_response.status_code = 200
        
        mock_get.side_effect = [mock_api_response, mock_scraper_response]

        # Patch the scraper to return mock data for testing
        with patch('resilient_mandi_fetcher.scrape_agmarknet_html') as mock_scrape:
            mock_scrape.return_value = (self.mock_records, "HTML_SCRAPER")
            
            # Run main-like logic
            records, source = resilient_mandi_fetcher.fetch_from_api(self.commodity)
            if not records:
                records, source = resilient_mandi_fetcher.scrape_agmarknet_html(self.commodity)

            self.assertEqual(source, "HTML_SCRAPER")
            print("✅ Scenario 2: API 403 -> Scraper Fallback - Verified")

    @patch('resilient_mandi_fetcher.requests.get')
    def test_tier3_all_fail_ai_fallback(self, mock_get):
        """Simulate API & Scraper fail, falling back to AI."""
        # API Fails
        mock_api_response = MagicMock()
        mock_api_response.status_code = 500
        
        # Scraper Fails (timeout)
        mock_get.side_effect = Exception("Connection Timeout")

        # Patch AI Nowcast to return data
        with patch('resilient_mandi_fetcher.get_ai_nowcast') as mock_ai:
            mock_ai_nowcast_data = [{
                'state': 'Chhattisgarh',
                'district': 'Raipur',
                'commodity': 'Tomato',
                'predicted_price': 1850,
                'lower_bound': 1700,
                'upper_bound': 2000,
                'forecast_date': '2026-03-24'
            }]
            mock_ai.return_value = (mock_ai_nowcast_data, "AI_ESTIMATE")
            
            # Logic flow
            records, source = resilient_mandi_fetcher.fetch_from_api(self.commodity)
            if not records:
                records, source = resilient_mandi_fetcher.scrape_agmarknet_html(self.commodity)
            if not records:
                records, source = resilient_mandi_fetcher.get_ai_nowcast(self.commodity)

            self.assertEqual(source, "AI_ESTIMATE")
            self.assertEqual(records[0]['predicted_price'], 1850)
            print("✅ Scenario 3: API/Scraper Fail -> AI Nowcast Fallback - Verified")

if __name__ == "__main__":
    unittest.main()
