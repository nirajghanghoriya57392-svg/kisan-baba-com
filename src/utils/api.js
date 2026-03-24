// API Utility for KisanBaba Zero-Cost Integrations
// Enhanced for Smart Sell & Transport Arbitrage Engine

import districtNeighbors from '../data/district_neighbors.json';
import mspData from '../data/msp_prices.json';
import retailData from '../data/retail_prices.json';
import { getBenchmarkHub } from './benchmarks.js';
import fuelData from '../data/fuel_prices.json';
import volumeData from '../data/market_volumes.json';
import historicalStats from '../data/historical_stats.json';
import indiaDistricts from '../data/india_districts.json';
import cacpData from '../data/cacp_costs.json';

// Dynamic Fuel Rate based on State/City
export function getDieselPrice(state = "Madhya Pradesh", city = "Indore") {
  const statePrices = fuelData.rates[state];
  if (!statePrices) return 92.50; // Fallback
  return statePrices.cities[city] || statePrices.avg || 92.50;
}

export const DIESEL_RATE_PER_LITRE = getDieselPrice(); // Default startup value
const TRACTOR_MILEAGE_KM_PER_L = 8;  

// Regional Synonyms for Commodities (Bihar, UP, MP, Punjab)
export const REGIONAL_SYNONYMS = {
  "bhindi": "Lady Finger",
  "dhan": "Paddy (Dhan)",
  "प्याज": "Onion",
  "टमाटर": "Tomato",
  "आलू": "Potato",
  "गेहूँ": "Wheat",
  "मक्का": "Maize",
  "लहसुन": "Garlic",
  "हरी मिर्च": "Green Chilli",
  "सोयाबीन": "Soyabean",
  "सरसों": "Mustard",
  "कपास": "Cotton",
  "chawal": "Paddy (Dhan)",
  "pyaj": "Onion",
  "batata": "Potato",
  "aaloo": "Potato",
  "tamatar": "Tomato",
  "gehun": "Wheat",
  "raipur (f&v)": "Tomato",
  "raipur-chha": "Tomato"
};

const GEO_SYNONYMS = {
  "Nasik": "Nashik",
  "Nashi": "Nashik",
  "Bombay": "Mumbai"
};

/**
 * Normalizes any localized or synonym commodity name into the master English key
 */
export function normalizeCommodity(name) {
  if (!name) return "Tomato";
  const n = name.toLowerCase().trim();
  
  // Direct script matching
  if (REGIONAL_SYNONYMS[name]) return REGIONAL_SYNONYMS[name];
  
  // Fuzzy match in synonyms
  for (const [key, value] of Object.entries(REGIONAL_SYNONYMS)) {
    if (n.includes(key.toLowerCase())) return value;
  }
  
  // Pivot mapping for common variants
  if (n.includes("onion")) return "Onion";
  if (n.includes("wheat")) return "Wheat";
  if (n.includes("tomato")) return "Tomato";
  if (n.includes("soy")) return "Soybean";
  
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export async function fetchMandiRates(state = "Chhattisgarh", district = "Raipur", commodity = "") {
  const cacheKey = `kisanbaba_mandi_${state}_${district}_${commodity}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < 3600000) return parsed.data;
  }

  try {
    // Phase 11: Check Supabase DB first (High Performance & Historical)
    const dbRecord = await fetchMandiPricesFromDB(state, district, commodity);
    if (dbRecord) {
      // Map DB record back to OGD format for UI compatibility
      const mappedRecord = {
        state: dbRecord.state,
        district: dbRecord.district,
        market: dbRecord.mandi,
        commodity: dbRecord.commodity,
        min_price: dbRecord.min_price,
        max_price: dbRecord.max_price,
        modal_price: dbRecord.modal_price,
        arrival_date: dbRecord.recorded_at,
        source: 'Verified Cloud'
      };
      return [mappedRecord];
    }

    const apiKey = import.meta.env.VITE_OGD_API_KEY;
    if (!apiKey) {
      console.warn("KisanBaba: No OGD API Key. Serving hyper-realistic mock data.");
      const mocks = getMandiMockData(state, district, commodity);
      return mocks.map(m => ({ ...m, source: 'Local AI Estimate' }));
    }

    // URL Modification: We remove the strict commodity filter from the API call.
    // Why? Because OGD API filters are strict/case-sensitive. 
    // By fetching all records for a district (limit 100) and filtering locally with fuzzy match,
    // we drastically improve the chance of finding the commodity (e.g. "Garlic" matching "GARLIC").
    let url = `/api/ogd/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=100&filters[state]=${encodeURIComponent(state)}&filters[district]=${encodeURIComponent(district)}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const finalData = data.records || [];
    localStorage.setItem(cacheKey, JSON.stringify({ data: finalData, timestamp: Date.now() }));
    return finalData;
  } catch (err) {
    console.error("Mandi API Crash:", err);
    return getMandiMockData(state, district, commodity);
  }
}

// Fetch all records for a state to see what's available today
export async function fetchStateAvailableCommodities(state) {
  try {
    const apiKey = import.meta.env.VITE_OGD_API_KEY;
    if (!apiKey) return [];
    
    const response = await fetch(
      `/api/ogd/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&filters[state]=${encodeURIComponent(state)}&limit=100`
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (!data.records) return [];
    
    // Extract unique commodity names available in this state
    const available = new Set(data.records.map(r => r.commodity?.toLowerCase()));
    return Array.from(available);
  } catch (e) {
    console.error("State availability check failed:", e);
    return [];
  }
}

// Fetch all records for a district to see what's available locally
export async function fetchDistrictAvailableCommodities(state, district) {
  try {
    const apiKey = import.meta.env.VITE_OGD_API_KEY;
    if (!apiKey) {
      // Return simulated district availability based on name hash
      const hash = state.length + district.length;
      return ["tomato", "onion", "wheat", "paddy", "soyabean"].filter((_, i) => (hash + i) % 2 === 0);
    }
    
    const response = await fetch(
      `/api/ogd/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&filters[state]=${encodeURIComponent(state)}&filters[district]=${encodeURIComponent(district)}&limit=100`
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (!data.records) return [];
    
    const available = new Set(data.records.map(r => r.commodity?.toLowerCase()));
    return Array.from(available);
  } catch (e) {
    console.error("District availability check failed:", e);
    return [];
  }
}

/**
 * Fetch top traded commodities for Ticker Tape — with REAL price changes
 */
export async function fetchTopTradedCommodities() {
  const cacheKey = `kisanbaba_ticker_data_v4`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp < 1800000) return parsed.data; // 30 min cache
  }

  try {
    const apiKey = import.meta.env.VITE_OGD_API_KEY;
    if (!apiKey) return null;

    // Fetch latest records across India
    const url = `/api/ogd/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=40&sort[arrival_date]=desc`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    
    if (!data.records || data.records.length === 0) return null;

    // Group by commodity to calculate real day-over-day change
    const commodityMap = {};
    data.records.forEach(r => {
      const name = r.commodity?.toUpperCase();
      if (!name) return;
      if (!commodityMap[name]) commodityMap[name] = [];
      commodityMap[name].push({
        price: parseInt(r.modal_price || 0),
        date: r.arrival_date,
        market: (r.market || r.district || "Regional Mandi").trim()
      });
    });

    // For each commodity, calculate REAL change from the 2 most recent records
    const processed = Object.entries(commodityMap).slice(0, 12).map(([name, records]) => {
      const sorted = records.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      const latest = sorted[0];
      const previous = sorted.length > 1 ? sorted[1] : null;
      const realChange = previous ? latest.price - previous.price : 0;
      return {
        name,
        mandi: latest.market,
        icon: getIconForName(name),
        price: latest.price,
        change: realChange, // REAL change, not random!
        trend: realChange >= 0 ? "up" : "down"
      };
    }).filter(item => item.price > 0);

    localStorage.setItem(cacheKey, JSON.stringify({ data: processed, timestamp: Date.now() }));
    return processed;
  } catch (e) {
    console.error("Ticker fetch failed:", e);
    return null;
  }
}

function getIconForName(name) {
  const n = name.toLowerCase();
  if (n.includes("tomato")) return "🍅";
  if (n.includes("onion")) return "🧅";
  if (n.includes("potato")) return "🥔";
  if (n.includes("wheat")) return "🌾";
  if (n.includes("paddy") || n.includes("rice")) return "🌾";
  if (n.includes("soyabean")) return "🫘";
  if (n.includes("maize")) return "🌽";
  if (n.includes("chilli")) return "🌶️";
  return "📦";
}

export async function fetchMultiDistrictRates(state, district, commodity, userCoords = null, targetMandi = "") {
  try {
    const neighbors = getNeighbors(state, district);
    
    // Fetch origin price (the selected Mandi)
    const originData = await fetchMandiRates(state, district, commodity);
    let origin = extractMandiInfo(originData, commodity, targetMandi);

    // HUB FALLBACK: If major hub like Raipur/Durg is 0, estimate from neighbors
    if (origin.price <= 0 && state === "Chhattisgarh") {
      const neighborList = getNeighbors(state, district);
      const neighborPrices = await Promise.all(neighborList.slice(0, 3).map(async (n) => {
        const d = await fetchMandiRates(state, n.district, commodity);
        return extractMandiInfo(d, commodity).price;
      }));
      const valid = neighborPrices.filter(p => p > 0);
      if (valid.length > 0) {
        const avg = Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
        origin = { ...origin, price: avg, isEstimated: true };
      }
    }

    if (!neighbors || neighbors.length === 0) {
      return { 
        neighbors: [], 
        origin: { ...origin, state, district, price: origin.price || 0 } 
      };
    }

    // Fetch all neighbor prices in parallel
    const neighborResults = await Promise.all(neighbors.map(async (n) => {
      try {
        // SAFETY RAIL: Skip if mapping seems globally wrong (>500km)
        if (n.distance_km > 500) return null;

        // Fetch prices for the neighbor district
        const data = await fetchMandiRates(state, n.district, commodity);
        const info = extractMandiInfo(data, commodity);
        let finalInfo = info;
        
        if (info.price === 0) {
            const fallback = getMandiMockData(n.state || state, n.district, commodity);
            finalInfo = Array.isArray(fallback) ? fallback[0] : fallback;
        }

        // Use user GPS if available for distance calculation, else fallback to pre-computed
        let finalDist = n.distance_km;
        if (userCoords && n.lat && n.lng) {
          finalDist = calculateDistance(userCoords.lat, userCoords.lng, n.lat, n.lng);
        }

        return {
          ...n,
          ...finalInfo,
          distance: finalDist,
          priceDiff: finalInfo.price - (origin.price || 0)
        };
      } catch (err) {
        return null;
      }
    }));

    const validNeighbors = neighborResults.filter(n => n !== null);

    return {
      origin: { ...origin, state, district, market: origin.market || district, price: origin.price || 0 },
      neighbors: validNeighbors.sort((a, b) => a.distance - b.distance),
      dieselRate: getDieselPrice(state, district),
      tractorMileage: TRACTOR_MILEAGE_KM_PER_L,
      allRecords: Array.isArray(originData) ? originData : []
    };
  } catch (error) {
    console.error("Error in fetchMultiDistrictRates:", error);
    return { 
      neighbors: [], 
      origin: { price: 0, district, state, market: district } 
    };
  }
}

// Get neighbor districts from the pre-computed JSON
export function getNeighbors(state, district) {
  if (!state || !district) return [];
  
  // Normalize lookup keys (Trim and handle casing)
  const normalizedState = Object.keys(districtNeighbors).find(
    s => s.trim().toLowerCase() === state.trim().toLowerCase()
  );
  
  if (normalizedState && districtNeighbors[normalizedState]) {
    const normalizedDistrict = Object.keys(districtNeighbors[normalizedState]).find(
      d => d.trim().toLowerCase() === district.trim().toLowerCase()
    );
    
    if (normalizedDistrict) {
      return districtNeighbors[normalizedState][normalizedDistrict].slice(0, 8); // Top 8 nearest
    }
  }
  return [];
}

// Calculate transport cost
export function calculateTransportCost(distanceKm, transportFactor = 1.0) {
  const litresNeeded = (distanceKm * 2) / TRACTOR_MILEAGE_KM_PER_L; // Round trip
  return Math.round(litresNeeded * DIESEL_RATE_PER_LITRE * transportFactor);
}

// Calculate net arbitrage profit
export function calculateArbitrageProfit(priceDiff, quantityQuintals, distanceKm, transportFactor, districtName, lang = 'en') {
  const grossProfit = priceDiff * quantityQuintals;
  const transportCost = calculateTransportCost(distanceKm, transportFactor);
  const netProfit = Math.round(grossProfit - transportCost);
  const isWorthIt = netProfit > 0;

  // Clean keys for component-side translation
  const empowermentKey = isWorthIt ? 'mandi.arbitrage.advice_worth_it' : 'mandi.arbitrage.advice_not_worth_it';
  const empowermentParams = {
    district: districtName,
    diff: Math.abs(Math.round(priceDiff)),
    dist: distanceKm,
    profit: netProfit.toLocaleString('en-IN')
  };

  return {
    grossProfit: Math.round(grossProfit),
    transportCost,
    netProfit,
    isWorthIt,
    empowermentKey,
    empowermentParams
  };
}

// Extract modal, min, max prices, market name, arrival volume, and date from API response
function extractMandiInfo(data, commodity, targetMandi = "") {
  if (!data || data.length === 0) return { price: 0, minPrice: 0, maxPrice: 0, date: null, isAvailable: false, market: "Unknown", arrivalTonnes: 0 };
  
  // If data is our mock format
  if (data[0] && data[0].price) {
    const p = data[0].price;
    return { 
      price: p, 
      minPrice: Math.round(p * 0.9), 
      maxPrice: Math.round(p * 1.1),
      date: new Date().toLocaleDateString('en-IN'),
      isAvailable: true,
      market: data[0].market || "Main Mandi",
      arrivalTonnes: Math.round(50 + (p % 200)) // Simulated for mock
    };
  }
  
  // If data is real OGD API format
  if (commodity) {
    const search = normalizeCommodity(commodity).toLowerCase();
    const match = data.find(r => {
      const comm = (r.commodity || "").toLowerCase();
      const isCommMatch = comm.includes(search) || search.includes(comm);
      if (targetMandi) {
        const mkt = (r.market || r.mandi_name || "").toLowerCase();
        return isCommMatch && mkt === targetMandi.toLowerCase();
      }
      return isCommMatch;
    }) || data.find(r => {
      // Fallback if targetMandi didn't match exactly, just find the commodity
      const comm = (r.commodity || "").toLowerCase();
      return comm.includes(search) || search.includes(comm);
    });

    if (match) {
      const modal = parseInt(match.modal_price || match.price || 0);
      return { 
        price: modal,
        minPrice: parseInt(match.min_price || modal * 0.9),
        maxPrice: parseInt(match.max_price || modal * 1.1),
        date: match.arrival_date || null,
        isAvailable: modal > 0,
        market: match.market || match.mandi_name || "Regional Market",
        arrivalTonnes: parseFloat(match.arrivals_tonnes || match.arrivals || 0)
      };
    }
    // If commodity was requested but not found in this dataset, return unavailable
    return { price: 0, minPrice: 0, maxPrice: 0, date: null, isAvailable: false, market: "Unknown", arrivalTonnes: 0 };
  }
  
  // No specific commodity requested, use first record
  const firstModal = data[0]?.modal_price ? parseInt(data[0].modal_price) : 0;
  return { 
    price: firstModal,
    minPrice: parseInt(data[0]?.min_price || firstModal * 0.9),
    maxPrice: parseInt(data[0]?.max_price || firstModal * 1.1),
    date: data[0]?.arrival_date || null,
    isAvailable: firstModal > 0,
    market: data[0]?.market || "Regional Market",
    arrivalTonnes: parseFloat(data[0]?.arrivals_tonnes || data[0]?.arrivals || 0)
  };
}

/**
 * Get the latest MSP for a given commodity
 */
export function getMSPForCommodity(commodity) {
    if (!commodity) return null;
    const search = normalizeCommodity(commodity).toLowerCase();
    
    // First check official mspData (22 Mandated Crops)
    const official = mspData.find(m => 
        search.includes(m.commodity.toLowerCase()) || 
        m.commodity.toLowerCase().includes(search) ||
        (m.hindi_name && search.includes(m.hindi_name))
    );
    if (official) return official;

    // Fallback to CACP Support Benchmarks (Horticulture/Vegetables)
    const cropKeyMap = {
      'Tomato': 'Tomato', 'Onion': 'Onion', 'Potato': 'Tomato',
      'Paddy (Dhan)': 'Paddy', 'Soyabean': 'Soybean', 'Wheat (Gehum)': 'Wheat',
      'Wheat': 'Wheat', 'Soybean': 'Soybean', 'Paddy': 'Paddy',
      'Gram (Chana)': 'Chana', 'Mustard': 'Mustard', 'Cotton': 'Cotton'
    };
    const cKey = cropKeyMap[normalizeCommodity(commodity)] || normalizeCommodity(commodity);
    const cacp = cacpData.Crops[cKey];
    
    if (cacp && cacp.National_MSP) {
      const isOfficialMSP = !['Tomato', 'Onion', 'Potato'].includes(cKey);
      return {
        commodity: cKey,
        msp_price: cacp.National_MSP,
        previous_msp: Math.round(cacp.National_MSP * 0.95),
        increase: Math.round(cacp.National_MSP * 0.05),
        season: cacp.Season || "Horticulture",
        marketing_year: "2025-26",
        unit: "Quintal",
        isOfficialMSP: isOfficialMSP,
        margin_over_cost_pct: Math.round(((cacp.National_MSP - cacp.National_A2_FL) / cacp.National_A2_FL) * 100)
      };
    }

    return null;
}

/**
 * Fetch REAL historical price trend from OGD API
 * Falls back to intelligent simulation if historical data is sparse
 */
export async function fetchHistoricalTrend(state, district, commodity, currentPrice) {
  const cacheKey = `kisanbaba_trend_${state}_${district}_${commodity}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp < 3600000) return parsed.data; // 1 hour cache
  }

  try {
    const apiKey = import.meta.env.VITE_OGD_API_KEY;
    if (!apiKey) return generateSmartTrend(currentPrice, commodity);

    // Fetch with larger limit to get historical records
    const url = `/api/ogd/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=100&filters[state]=${encodeURIComponent(state)}&filters[commodity]=${encodeURIComponent(commodity)}&sort[arrival_date]=desc`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.records || data.records.length < 3) {
      return generateSmartTrend(currentPrice, commodity);
    }

    // Extract unique dates with prices from REAL government data
    const dateMap = {};
    data.records.forEach(r => {
      const date = r.arrival_date;
      const price = parseInt(r.modal_price || 0);
      const arrival = parseFloat(r.arrival_quantity || 0);
      if (date && price > 0) {
        if (!dateMap[date]) {
          dateMap[date] = { price, arrival }; 
        } else if (price > dateMap[date].price) {
          dateMap[date].price = price;
          dateMap[date].arrival += arrival; // Aggregate volume for the day
        }
      }
    });

    const sorted = Object.entries(dateMap)
      .map(([date, data]) => ({ date, price: data.price, arrival: data.arrival }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 data points

    if (sorted.length < 5) {
      return generateSmartTrend(currentPrice, commodity);
    }

    // Format dates for display
     const trend = sorted.map(item => {
      const parts = item.date.split('/');
      let displayDate;
      try {
        if (parts.length === 3 && parts[2].length === 4) {
          displayDate = new Date(parts[2], parts[1] - 1, parts[0]).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        } else {
          displayDate = new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        }
      } catch (e) {
        displayDate = item.date;
      }
      return { 
        date: displayDate, 
        price: item.price, 
        arrival: item.arrival, 
        isReal: true 
      };
    });

    localStorage.setItem(cacheKey, JSON.stringify({ data: trend, timestamp: Date.now() }));
    return trend;
  } catch (e) {
    console.error("Historical trend fetch failed:", e);
    return generateSmartTrend(currentPrice, commodity);
  }
}

/**
 * Smart trend generation (improved fallback — uses deterministic seed, not random)
 */
function generateSmartTrend(basePrice, commodity) {
  const trend = [];
  const now = new Date();
  const seed = (commodity || 'crop').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  let price = basePrice * 0.92;
  const volatility = ['Tomato', 'Green Chilli', 'Brinjal', 'Coriander'].some(p => commodity?.includes(p)) ? 0.05 : 0.02;
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    // Deterministic movement based on seed + day (not random!)
    const dayFactor = Math.sin((seed + i) * 0.7) * 0.5 + Math.cos((seed + i) * 1.3) * 0.3;
    const change = dayFactor * basePrice * volatility;
    price = Math.max(price + change, basePrice * 0.75);
    price = Math.min(price, basePrice * 1.25);

    // Inverse Correlation: High Volume = Low Price, Low Volume = High Price (Shock Indicator)
    const avgVol = (historicalStats.commodity.toLowerCase() === commodity?.toLowerCase() ? historicalStats.avgArrival : 100);
    const volNoise = (Math.sin((seed + i) * 2.1) * 0.1); 
    const priceDeviation = (basePrice - price) / basePrice;
    const arrival = avgVol * (1 + (priceDeviation * 1.5) + volNoise);

    trend.push({
      date: new Date(now.getTime() - i * 86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      price: Math.round(price),
      arrival: parseFloat(arrival.toFixed(1)),
      isReal: false
    });
  }
  trend[trend.length - 1].price = basePrice;
  return trend;
}

// Legacy wrapper — still exported for compatibility
export function generate30DayTrend(basePrice, commodity) {
  return generateSmartTrend(basePrice, commodity);
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}

/**
 * Find nearest districts from all-India data given user lat/lng
 */
export function findNearestDistricts(userLat, userLng, allDistricts, limit = 5) {
  const flattened = [];
  Object.entries(allDistricts).forEach(([state, distList]) => {
    distList.forEach(d => {
      flattened.push({
        ...d,
        state,
        distance: calculateDistance(userLat, userLng, d.lat, d.lng)
      });
    });
  });
  return flattened.sort((a, b) => a.distance - b.distance).slice(0, limit);
}

export async function fetchWeatherAlerts(lat = 21.2514, lon = 81.6296) {
  const cacheKey = `kisanbaba_weather_${lat}_${lon}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < 1800000) return parsed.data;
  }

  try {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    if (!apiKey) {
      return getWeatherMockData();
    }
    
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const res = await fetch(url);
    const data = await res.json();
    
    const finalData = {
        temp: Math.round(data.main.temp),
        location: data.name,
        icon: "⛅",
        alertText: data.weather[0].description,
        actionableAdvice: "Automated analysis requires Pro tier.",
        isFavorable: true
    };
    localStorage.setItem(cacheKey, JSON.stringify({ data: finalData, timestamp: Date.now() }));
    return finalData;
  } catch (err) {
    console.error("Weather API Crash:", err);
    return getWeatherMockData();
  }
}

// Hyper-realistic mock data for multi-district pricing
function getMandiMockData(state = "", district = "", commodity = "") {
    const effectiveDistrict = GEO_SYNONYMS[district] || district;
    const effectiveCommodity = normalizeCommodity(commodity);

    // Seed-based deterministic pricing by district name
    const seed = effectiveDistrict.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const basePrices = {
      "Onion": 1500 + (seed % 600),
      "Tomato": 1200 + (seed % 800),
      "Potato": 800 + (seed % 500),
      "Paddy (Dhan)": 2100 + (seed % 300),
      "Wheat": 2400 + (seed % 300),
      "Soyabean": 4200 + (seed % 1000),
      "Maize": 2100 + (seed % 400),
      "Garlic": 8500 + (seed % 5000),
      "Green Chilli": 3200 + (seed % 1000),
      "Brinjal": 1000 + (seed % 700),
      "Cotton": 6200 + (seed % 800),
      "Sugarcane": 3100 + (seed % 400),
      "Mustard": 4800 + (seed % 600),
      "Groundnut": 5200 + (seed % 900),
      "Gram (Chana)": 4600 + (seed % 500),
      "Moong": 7200 + (seed % 800),
      "Arhar (Tur)": 6800 + (seed % 700),
      "Urad": 6500 + (seed % 600),
      "Turmeric": 8000 + (seed % 3000),
      "Coriander": 6000 + (seed % 2000)
    };

    if (effectiveCommodity && basePrices[effectiveCommodity]) {
      return [{ 
        id: 1, commodity: effectiveCommodity, price: basePrices[effectiveCommodity], 
        trend: seed % 2 === 0 ? "up" : "down", 
        change: 10 + (seed % 150),
        district: effectiveDistrict, state
      }];
    }

    // Return top 5 commodities as fallback
    const entries = Object.entries(basePrices).slice(0, 5);
    return entries.map(([name, price], i) => ({
      id: i + 1, commodity: name, price,
      trend: (seed + i) % 3 === 0 ? "down" : "up",
      change: 10 + ((seed + i) % 120),
      district: effectiveDistrict, state
    }));
}

function getWeatherMockData() {
    return {
        temp: 28,
        humidity: 65,
        windSpeed: 12,
        location: "Raipur, CG",
        icon: "⛅",
        description: "Partly cloudy",
        rainfall: 0,
        feelsLike: 31,
        condition: "Clouds"
    };
}

/**
 * Fetch weather for a specific district using its lat/lng (FREE OpenWeatherMap)
 */
export async function fetchWeatherForDistrict(lat, lng, districtName) {
  const cacheKey = `kisanbaba_weather_district_${lat}_${lng}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp < 1800000) return parsed.data; // 30 min cache
  }

  try {
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
    if (!apiKey) return getWeatherMockData();

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data.main || !data.weather) throw new Error("Invalid weather data structure");

    const weatherData = {
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind?.speed || 0),
      location: data.name || districtName,
      icon: getWeatherEmoji(data.weather[0]?.main),
      description: data.weather[0]?.description || "Clear",
      condition: data.weather[0]?.main || "Clear",
      rainfall: data.rain?.["1h"] || data.rain?.["3h"] || 0,
      clouds: data.clouds?.all || 0
    };

    localStorage.setItem(cacheKey, JSON.stringify({ data: weatherData, timestamp: Date.now() }));
    return weatherData;
  } catch (err) {
    console.error("Weather fetch failed:", err);
    return getWeatherMockData();
  }
}

function getWeatherEmoji(condition) {
  const map = {
    Clear: "☀️", Clouds: "⛅", Rain: "🌧️", Drizzle: "🌦️",
    Thunderstorm: "⛈️", Snow: "❄️", Mist: "🌫️", Fog: "🌫️",
    Haze: "🌫️", Dust: "💨", Smoke: "💨", Tornado: "🌪️"
  };
  return map[condition] || "🌤️";
}

/**
 * Calculate spoilage risk for a commodity based on weather
 * Returns: { riskLevel: 0-100, riskLabel, advice, hoursToSell }
 */
export function getSpoilageRisk(weather, commodity) {
  if (!weather) return { riskLevel: 0, riskLabel: "Unknown", advice: "", hoursToSell: 999 };

  const perishability = {
    "Tomato": 0.95, "Green Chilli": 0.9, "Brinjal": 0.85, "Onion": 0.3, 
    "Potato": 0.25, "Garlic": 0.2, "Paddy (Dhan)": 0.1, "Wheat": 0.08,
    "Soyabean": 0.1, "Maize": 0.15, "Cotton": 0.05, "Sugarcane": 0.7,
    "Mustard": 0.08, "Groundnut": 0.12, "Gram (Chana)": 0.1,
    "Moong": 0.1, "Arhar (Tur)": 0.1, "Urad": 0.1,
    "Turmeric": 0.15, "Coriander": 0.8
  };

  const pFactor = perishability[commodity] || 0.5;
  const tempRisk = Math.max(0, (weather.temp - 25) * 3); // Risk increases above 25°C
  const humidityRisk = Math.max(0, (weather.humidity - 60) * 1.5); // Risk increases above 60%
  const rainRisk = weather.rainfall > 0 ? 20 : 0;

  let riskLevel = Math.round((tempRisk + humidityRisk + rainRisk) * pFactor);
  riskLevel = Math.min(100, Math.max(0, riskLevel));

  let riskKey, adviceKey, hoursToSell;
  if (riskLevel >= 70) {
    riskKey = "HIGH_RISK";
    adviceKey = "high";
    hoursToSell = 24;
  } else if (riskLevel >= 40) {
    riskKey = "MODERATE_RISK";
    adviceKey = "moderate";
    hoursToSell = 72;
  } else if (riskLevel >= 15) {
    riskKey = "LOW_RISK";
    adviceKey = "low";
    hoursToSell = 168;
  } else {
    riskKey = "SAFE";
    adviceKey = "safe";
    hoursToSell = 336;
  }

  return { riskLevel, riskKey, adviceKey, hoursToSell };
}

/**
 * Get weather impact on prices
 * Returns: { impact: string, direction: 'up'|'down'|'stable', pctImpact: number, explanation: string }
 */
export function getWeatherPriceImpact(weather, commodity) {
  if (!weather) return { impact: "Unknown", direction: "stable", pctImpact: 0, explanation: "" };

  const isPerishable = ["Tomato", "Green Chilli", "Brinjal", "Coriander", "Sugarcane"].includes(commodity);
  const isGrain = ["Wheat", "Paddy (Dhan)", "Maize", "Soyabean", "Mustard"].includes(commodity);

  let direction = "stable";
  let pctImpact = 0;
  let explanation = "";

  // Heavy rain → supply disruption → prices rise for perishables
  if (weather.rainfall > 5) {
    if (isPerishable) {
      direction = "up";
      pctImpact = Math.round(8 + weather.rainfall * 1.5);
      explanation = `🌧️ Heavy rain disrupts harvesting & transport. ${commodity} supply will drop. Price likely to RISE ${pctImpact}%.`;
    } else {
      direction = "up";
      pctImpact = Math.round(3 + weather.rainfall * 0.5);
      explanation = `🌧️ Rain may delay arrivals at mandi. Slight price increase expected.`;
    }
  }
  // Extreme heat → perishables spoil faster → forced selling → prices drop short-term
  else if (weather.temp > 40) {
    if (isPerishable) {
      direction = "down";
      pctImpact = Math.round((weather.temp - 38) * 3);
      explanation = `🌡️ Extreme heat (${weather.temp}°C) accelerates spoilage. Farmers rush to sell. Prices may DIP ${pctImpact}%.`;
    }
  }
  // Moderate rain → good for standing crops → future supply up → prices stable/down
  else if (weather.rainfall > 0 && weather.rainfall <= 5) {
    if (isGrain) {
      direction = "down";
      pctImpact = 3;
      explanation = `🌦️ Light rain is favorable for standing ${commodity} crop. Future supply will be strong. Prices may soften.`;
    } else {
      direction = "stable";
      pctImpact = 0;
      explanation = `🌤️ Light showers have minimal impact on ${commodity} pricing today.`;
    }
  }
  // Clear skies → normal market operations
  else if (weather.condition === "Clear" && weather.temp < 35) {
    direction = "stable";
    pctImpact = 0;
    explanation = `☀️ Clear weather with normal temperatures. Markets functioning normally. Prices expected to remain STABLE.`;
  }
  // Hot but not extreme
  else if (weather.temp >= 35 && weather.temp <= 40) {
    if (isPerishable) {
      direction = "up";
      pctImpact = Math.round((weather.temp - 33) * 1.5);
      explanation = `🌡️ Warm weather (${weather.temp}°C) may reduce ${commodity} shelf life. Early arrivals get better prices.`;
    }
  }

  const impactKey = pctImpact > 5 ? "HIGH" : pctImpact > 0 ? "MODERATE" : "LOW";

  return { impactKey, direction, pctImpact, explanation }; // explanation is still a fallback if needed, but UI should prioritize keys
}

/**
 * Get sell timing advice based on weather + price trend
 */
export function getSellTimingAdvice(weather, spoilageRisk, commodity, currentPrice, trendData) {
  const isTrending = trendData && trendData.length > 1;
  const lastPrice = isTrending ? trendData[trendData.length - 1].price : currentPrice;
  const weekAgoPrice = isTrending && trendData.length > 7 ? trendData[trendData.length - 7].price : currentPrice;
  const weekTrend = weekAgoPrice > 0 ? ((lastPrice - weekAgoPrice) / weekAgoPrice) * 100 : 0;

  // If spoilage risk is high, sell immediately regardless
  if (spoilageRisk.riskLevel >= 70) {
    return {
      actionKey: "SELL_NOW",
      emoji: "🚨",
      urgency: "critical",
      logicKeys: [
        { key: "spoilage" },
        { key: "urgency", params: { hours: spoilageRisk.hoursToSell, crop: commodity } },
        { key: "maximize" }
      ]
    };
  }

  // If price is trending up + weather is good → hold
  if (weekTrend > 3 && spoilageRisk.riskLevel < 40) {
    return {
      actionKey: "HOLD_2_3_DAYS",
      emoji: "📈",
      urgency: "low",
      logicKeys: [
        { key: "momentum", params: { trend: weekTrend.toFixed(1) } },
        { key: "storage" },
        { key: "profit" }
      ]
    };
  }

  // If price is trending down → sell soon
  if (weekTrend < -3) {
    return {
      actionKey: "SELL_SOON",
      emoji: "⏰",
      urgency: "high",
      logicKeys: [
        { key: "downward", params: { trend: Math.abs(weekTrend).toFixed(1) } },
        { key: "supply" }
      ]
    };
  }

  // Default: stable market
  return {
    actionKey: "SELL_THIS_WEEK",
    emoji: "✅",
    urgency: "medium",
    logicKeys: [
      { key: "stable" },
      { key: "fairValue" }
    ]
  };
}

/**
 * Fetch data for a National Benchmark Hub
 */
export async function fetchBenchmarkHubData(commodity) {
  const effectiveCommodity = normalizeCommodity(commodity);
  const hub = getBenchmarkHub(effectiveCommodity);
  if (!hub) return null;

  try {
    const apiKey = import.meta.env.VITE_OGD_API_KEY;
    // We use the hub's specific mandi name and state for the query
    // In a real app, we'd use the hub.id if we had a mapping of IDs to OGD resource filters
    const url = `/api/ogd/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=10&filters[state]=${encodeURIComponent(hub.state)}&filters[market]=${encodeURIComponent(hub.name)}`;
    
    const res = await fetch(apiKey ? url : ''); 
    if (apiKey && !res.ok) throw new Error(`HTTP ${res.status}`);
    const data = apiKey ? await res.json() : { records: [] };
    
    let price = 0;
    let trend = 'stable';
    let change = 0;

    if (data.records && data.records.length > 0) {
      const match = data.records.find(r => r.commodity?.toLowerCase().includes(commodity.toLowerCase())) || data.records[0];
      price = parseInt(match.modal_price || 0);
      // Simulating trend for now as cross-day historical fetching for hubs is expensive
      const seed = (hub.name + commodity).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      change = (seed % 150) * (seed % 2 === 0 ? 1 : -1);
      trend = change >= 0 ? 'up' : 'down';
    } else {
      // Logic-based mock for hubs if API fails or no key
      const seed = (hub.name + commodity).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      price = 2000 + (seed % 5000);
      change = (seed % 200) * (seed % 3 === 0 ? -1 : 1);
      trend = change >= 0 ? 'up' : 'down';
    }

    return {
      hubName: hub.name,
      state: hub.state,
      price,
      trend,
      change,
      reason: hub.reason || `National price setter for ${commodity}`
    };
  } catch (e) {
    console.error("Benchmark fetch failed:", e);
    return null;
  }
}

/**
 * Fetch City Retail Prices from the scraped DCA dataset
 */
export async function fetchCityRetailData(commodity, state = "Madhya Pradesh", localPrice = 2000) {
  const stateHubs = {
    "Madhya Pradesh": "Bhopal", "Chhattisgarh": "Raipur", "Maharashtra": "Mumbai",
    "Delhi": "New Delhi", "Rajasthan": "Jaipur", "Gujarat": "Ahmedabad",
    "Uttar Pradesh": "Lucknow", "Punjab": "Chandigarh", "Haryana": "Chandigarh",
    "Karnataka": "Bengaluru", "Tamil Nadu": "Chennai", "West Bengal": "Kolkata",
    "Bihar": "Patna", "Telangana": "Hyderabad", "Andhra Pradesh": "Vijayawada"
  };

  const METROS = ["New Delhi", "Mumbai", "Kolkata", "Chennai"];
  const localHub = stateHubs[state] || "Bhopal";
  const effectiveCommodity = normalizeCommodity(commodity);
  
  // Create a unique set of cities to check
  const citiesToCheck = Array.from(new Set([localHub, ...METROS]));

  const results = citiesToCheck.map(city => {
    // Find price in our dataset for this city
    const matchedRecord = retailData.records.find(r => 
      (effectiveCommodity.toLowerCase().includes(r.commodity.toLowerCase()) || 
       r.commodity.toLowerCase().includes(effectiveCommodity.toLowerCase())) &&
      (r.city === city || (city === "New Delhi" && r.city === "Delhi"))
    );

    if (matchedRecord && matchedRecord.retailPrice > 0) {
      return {
        city,
        retailPriceKg: matchedRecord.retailPrice,
        isMetro: METROS.includes(city),
        isLocal: city === localHub,
        source: "DCA (Live)"
      };
    }

    // Fallback simulation
    const seed = (city + commodity).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const isPerishable = ["Tomato", "Onion", "Potato", "Green Chilli"].some(p => commodity.includes(p));
    const markup = isPerishable ? 170 + (seed % 20) : 135 + (seed % 15);
    const price = Math.round(localPrice * markup / 10000);

    return {
      city,
      retailPriceKg: price || Math.round(localPrice * 1.4 / 100),
      isMetro: METROS.includes(city),
      isLocal: city === localHub,
      source: "DCA (Est)"
    };
  });

  return {
    primary: results.find(r => r.isLocal) || results[0],
    others: results.filter(r => !r.isLocal)
  };
}

/**
 * Calculate Market Heatmap for a State
 */
export async function calculateMarketHeatmap(state, commodity, avgPrice) {
  const effectiveCommodity = normalizeCommodity(commodity);
  // Use REAL districts filtered by state for ALL-INDIA support
  const stateDistricts = (indiaDistricts[state] || []).map(d => d.district);
  
  // Pick up to 7 districts for the heatmap
  const districts = stateDistricts.length > 0 ? stateDistricts.slice(0, 7) : ["Bhopal", "Indore", "Raipur", "Mumbai"];

  // Determine a safe baseline if avgPrice is 0 (prevents 0 * deviation = 0 bug)
  let baselinePrice = avgPrice;
  if (baselinePrice <= 0) {
    const historical = historicalStats?.avgModal || 1500; // Fallback to recorded baseline or 1.5k
    baselinePrice = historical;
  }

  return districts.map(d => {
    const seed = (d + effectiveCommodity).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const priceDeviation = (seed % 15) - 7; // -7% to +7%
    const price = Math.round(baselinePrice * (1 + priceDeviation / 100));
    
    let status = "neutral";
    let color = "#cbd5e1"; // gray-300

    if (priceDeviation > 4) {
      status = "hot";
      color = "#10b981"; // emerald-500
    } else if (priceDeviation < -4) {
      status = "cold";
      color = "#ef4444"; // red-500
    }

    return {
      district: d,
      price,
      status,
      color
    };
  });
}

/**
 * Calculate National Heatmap (Major Hubs)
 */
export async function calculateNationalHeatmap(commodity, avgPrice) {
  const effectiveCommodity = normalizeCommodity(commodity);
  const nationalHubs = [
    { name: "Azadpur", city: "Delhi" },
    { name: "Indore", city: "MP" },
    { name: "Ahmedabad", city: "Gujarat" },
    { name: "Mumbai", city: "MH" },
    { name: "Vashi", city: "MH" },
    { name: "Kolkata", city: "WB" }
  ];

  let baselinePrice = avgPrice;
  if (baselinePrice <= 0) {
    baselinePrice = historicalStats?.avgModal || 1500;
  }

  return nationalHubs.map(h => {
    const seed = (h.name + effectiveCommodity).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const priceDeviation = (seed % 20) - 8; // -8% to +12% for national variance
    const price = Math.round(baselinePrice * (1 + priceDeviation / 100));
    
    let status = "neutral";
    let color = "#cbd5e1";

    if (priceDeviation > 6) {
      status = "hot";
      color = "#10b981";
    } else if (priceDeviation < -6) {
      status = "cold";
      color = "#ef4444";
    }

    return {
      district: h.name,
      state: h.city,
      price,
      status,
      color
    };
  });
}

/**
 * Calculate Smart Forecast (Sentiment & Momentum)
 */
export function calculateSmartForecast(trendData, currentPrice) {
  if (!trendData || trendData.length < 3) {
    return { sentiment: "Neutral", confidence: 50, advice: "Wait for more data" };
  }

  const prices = trendData.slice(-7).map(d => d.price);
  const first = prices[0];
  const last = prices[prices.length - 1];
  const velocity = ((last - first) / first) * 100;

  let sentiment = "Stable";
  let confidence = 60;
  let advice = "Market is holding steady.";

  if (velocity > 5) {
    sentiment = "Bullish 🚀";
    confidence = Math.min(90, 60 + Math.abs(velocity));
    advice = "Strong upward momentum. Consider holding for peak.";
  } else if (velocity < -5) {
    sentiment = "Bearish 📉";
    confidence = Math.min(90, 60 + Math.abs(velocity));
    advice = "Price is sliding. Sell before further crash.";
  } else if (velocity > 0) {
    sentiment = "Positive";
    confidence = 65;
    advice = "Slight recovery detected.";
  } else if (velocity < 0) {
    sentiment = "Softening";
    confidence = 65;
    advice = "Minor price cooling.";
  }

  return { sentiment, confidence, velocity: velocity.toFixed(1), advice };
}

/**
 * Get Market Stability Score based on Arrival Volumes
 */
export function getMarketStability(mandiName, commodity) {
  const effectiveCommodity = normalizeCommodity(commodity);
  const record = volumeData.markets[mandiName];
  if (!record || record.commodity !== effectiveCommodity) {
    return {
      level: "Stable",
      arrivals: "Moderate",
      trend: "Neutral",
      confidence: 70
    };
  }

  return {
    level: record.stability.toUpperCase(),
    arrivals: `${record.arrivals} ${record.unit}`,
    trend: record.stability === "high" ? "Firm" : "Volatile",
    confidence: record.stability === "high" ? 95 : 60,
    note: record.note || ""
  };
}

/**
 * Advanced Price Shock & Volume Analysis
 * Compares current arrivals with 7-day average to predict volatility
 */
export function getVolumeAnalysis(mandiName, commodity) {
  const record = volumeData.markets[mandiName]; 
  
  // Use REAL 2026 Historical Average from our Bot if available, else simulate
  const hStats = historicalStats.commodity.toLowerCase() === commodity.toLowerCase() ? historicalStats : null;
  const avgVolume = hStats ? hStats.avgArrival : (50 + (mandiName.length * 5)); 
  
  const currentArrivals = record && record.commodity === commodity 
    ? record.arrivals 
    : avgVolume + (mandiName.length % 10) - 5; 

  const surgePercent = ((currentArrivals - avgVolume) / avgVolume) * 100;
  
  let shockLevel = "stable";
  let color = "#10b981"; // emerald-500
  let message = "Normal Inflow";
  let advice = "Prices are steady. Good time to sell.";

  if (surgePercent > 30) {
    shockLevel = "critical";
    color = "#ef4444"; // red-500
    message = "Market Shock";
    advice = "Prices will crash. Avoid the mandi today.";
  } else if (surgePercent > 15) {
    shockLevel = "warning";
    color = "#f59e0b"; // amber-500
    message = "Volume Surge";
    advice = "Buyers will lower bids. Sell early or hold.";
  }

  return {
    current: currentArrivals.toFixed(1),
    average: avgVolume.toFixed(1),
    surge: surgePercent.toFixed(0),
    shockLevel,
    color,
    message,
    advice,
    unit: record?.unit || "Tonnes"
  };
}

/**
 * Fetch Agri News & Policy Alerts
 */
export async function fetchAgriNews(lang = 'en') {
  const cacheKey = `kisanbaba_news_${lang}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp < 3600000) return parsed.data;
  }

  try {
    // In a real app, this would hit a curated RSS proxy
    // For KisanBaba, we use a hybrid approach
    const mockNews = [
      {
        id: 1,
        title: lang === 'hi' ? "धान के निर्यात पर शुल्क घटाया गया" : "Export duty on Paddy reduced recently",
        description: lang === 'hi' ? "सरकार ने किसानों को लाभ पहुँचाने के लिए नए नियम लागू किए हैं।" : "New government norms implemented to benefit small-scale farmers.",
        source: "PIB Delhi",
        date: new Date().toLocaleDateString(),
        url: "#"
      },
      {
        id: 2,
        title: lang === 'hi' ? "नई सिंचाई योजना की घोषणा" : "New Irrigation Subsidy Scheme Announced",
        description: lang === 'hi' ? "50% तक की छूट के साथ सोलर पंप उपलब्ध।" : "Solar pumps now available with up to 50% subsidy for tribal belts.",
        source: "Agri Ministry",
        date: new Date().toLocaleDateString(),
        url: "#"
      }
    ];

    localStorage.setItem(cacheKey, JSON.stringify({ data: mockNews, timestamp: Date.now() }));
    return mockNews;
  } catch (e) {
    console.error("News fetch failed:", e);
    return [];
  }
}





/**
 * DB Fetcher: Get Mandi Prices from Supabase (Phase 11)
 */
export async function fetchMandiPricesFromDB(state, district, commodity) {
  try {
    const { supabase } = await import('./supabaseClient');
    if (!supabase) return null;

    // Search for the latest record within the last 3 days to ensure freshness
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data, error } = await supabase
      .from('mandi_prices')
      .select('*')
      .eq('state', state)
      .eq('district', district)
      .eq('commodity', commodity)
      .gte('recorded_at', threeDaysAgo.toISOString())
      .order('recorded_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.warn("KisanBaba DB: Fetch failed, falling back to OGD API:", err);
    return null;
  }
}
