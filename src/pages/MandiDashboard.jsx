import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, Bar, CartesianGrid } from 'recharts';
import geoTranslations from '../data/geo_translations.json';
import indiaDistricts from '../data/india_districts.json';
import commodities from '../data/mandi_commodities.json';
import cacpData from '../data/cacp_costs.json';
import historicalStats from '../data/historical_stats.json';
import { fetchMultiDistrictRates, calculateArbitrageProfit, generate30DayTrend, fetchHistoricalTrend, getMSPForCommodity, fetchStateAvailableCommodities, fetchDistrictAvailableCommodities, fetchWeatherForDistrict, getSpoilageRisk, getWeatherPriceImpact, getSellTimingAdvice, findNearestDistricts, REGIONAL_SYNONYMS, getVolumeAnalysis, fetchAgriNews } from '../utils/api';
import { speakText, startVoiceRecognition } from '../utils/speech';
// import { fetchAgriNews } from '../utils/rss'; // Deprecated due to CORS/Stability
import InfoTooltip from '../components/InfoTooltip';
import IntelligenceDrawer from '../components/IntelligenceDrawer';
import { Helmet } from 'react-helmet-async';
import './MandiDashboard.css';

export default function MandiDashboard() {
  const { t, i18n } = useTranslation();
  const [selectedState, setSelectedState] = useState("Chhattisgarh");
  const [selectedDistrict, setSelectedDistrict] = useState("Raipur");
  const [selectedMandi, setSelectedMandi] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("Tomato");
  const [harvestQty, setHarvestQty] = useState(20);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trendData, setTrendData] = useState([]);
  const [mspInfo, setMspInfo] = useState(null);
  const [news, setNews] = useState([]);
  const [availableCommodities, setAvailableCommodities] = useState([]);
  const [districtAvailableCommodities, setDistrictAvailableCommodities] = useState([]);
  const [availableMandis, setAvailableMandis] = useState([]);
  const [integrityStats, setIntegrityStats] = useState({ lowPrice: 4, closed: 1, dispute: 2, total: 12 });
  const [weather, setWeather] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [sessionSavings, setSessionSavings] = useState(0);
  const [userCoords, setUserCoords] = useState(null);
  const [nearestDistricts, setNearestDistricts] = useState([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [cacpObject, setCacpObject] = useState(null);
  const [showEduModal, setShowEduModal] = useState(false); // 📖 Economics Modal State
  const [showCriticalModal, setShowCriticalModal] = useState(false); // 🚨 Critical Strategy Modal State
  const [showWeatherEdu, setShowWeatherEdu] = useState(false); // 🌦️ Weather Guide Modal State

  // Friction Variables (Ground Reality)
  const [transportType, setTransportType] = useState('own'); // own=Tractor, rent=Bhada
  const [reportStatus, setReportStatus] = useState({ 
    step: 'idle', // idle, selecting, price_input, success
    category: null,
    userPrice: ""
  });
  const [userReports, setUserReports] = useState([]); // Persistent user-submitted reports
  const [feedbackStatus, setFeedbackStatus] = useState('idle'); // idle, rating, success
  const [userRating, setUserRating] = useState(0);
  const [intelDrawerOpen, setIntelDrawerOpen] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [volumeAnalysis, setVolumeAnalysis] = useState(null);
  const [qualityGrade, setQualityGrade] = useState('B'); // A=High, B=FAQ, C=Low
  const [demoMode, setDemoMode] = useState(false);
  const [demoSource, setDemoSource] = useState('API');

  // Simulate Live Integrity Reports on district/crop change
  useEffect(() => {
    const hash = (selectedDistrict.length * 3) + (selectedCommodity.length * 7);
    setIntegrityStats({
      lowPrice: (hash % 12) + 1,
      closed: (hash % 4),
      dispute: (hash % 6) + 1,
      total: (hash % 18) + 10
    });
  }, [selectedDistrict, selectedCommodity]);

  const displayData = useMemo(() => {
    if (!dashboardData) return null;
    if (!demoMode) return dashboardData;
    return {
      ...dashboardData,
      origin: {
        ...dashboardData.origin,
        data_source: demoSource,
        isEstimated: demoSource === 'AI_ESTIMATE' || demoSource === 'USER_PULSE',
      }
    };
  }, [dashboardData, demoMode, demoSource]);

  const recentReports = useMemo(() => {
    const names = ["Nilesh G.", "Rahul S.", "Amol K.", "Suresh T.", "Vijay P.", "Deepak M."];
    const types = ['low_price', 'closed', 'dispute'];
    const times = [
      { v: 12, u: 'm' },
      { v: 45, u: 'm' },
      { v: 2, u: 'h' },
      { v: 5, u: 'h' },
      { v: 8, u: 'h' }
    ];
    
    const hash = selectedDistrict.length + selectedCommodity.length;
    const baseReports = Array.from({ length: 6 }).map((_, i) => {
      const tUnit = times[(hash + i) % times.length];
      const type = types[(hash * (i + 1)) % types.length];
      const priceGap = type === 'low_price' ? (200 + (hash % 300) + (i * 20)) : null;
      
      return {
        id: `sim-${i}`,
        userName: names[(hash + i) % names.length],
        reportType: type,
        timeAgo: `${tUnit.v}${t(`mandi.priceCard.units.${tUnit.u}`)}`,
        district: selectedDistrict,
        commodity: selectedCommodity,
        verified: i % 2 === 0,
        gap: priceGap
      };
    });

    // Prepend user reports
    return [...userReports, ...baseReports];
  }, [selectedDistrict, selectedCommodity, userReports]);

  // Compute Community Price from reports
  const communityPriceInfo = useMemo(() => {
    const gaps = recentReports.filter(r => r.gap !== null).map(r => r.gap);
    if (gaps.length === 0) return null;
    
    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const modelPrice = displayData?.origin?.price || 0;
    const realPrice = modelPrice > 0 ? (modelPrice - avgGap) : 0;
    const gapPercent = modelPrice > 0 ? (avgGap / modelPrice) * 100 : 0;
    
    return {
      price: Math.max(0, Math.round(realPrice)),
      gap: Math.round(avgGap),
      gapPercent: Math.round(gapPercent),
      isAlert: gapPercent > 15,
      count: integrityStats.total + (userReports.length * 10) // Boosted for demo
    };
  }, [recentReports, displayData, integrityStats.total, userReports]);

  // Compute CACP Data on crop/state change
  useEffect(() => {
    // English/System name formatting mapping for CACP matching
    const cropKeyMap = {
      'Tomato': 'Tomato', 'Onion': 'Onion', 'Potato': 'Tomato', // fallback
      'Paddy (Dhan)': 'Paddy', 'Soyabean': 'Soybean', 'Wheat (Gehum)': 'Wheat',
      'Wheat': 'Wheat', 'Soybean': 'Soybean', 'Paddy': 'Paddy',
      'Gram (Chana)': 'Chana', 'Mustard': 'Mustard', 'Cotton': 'Cotton', 'कपास': 'Cotton',
      'Wheat (Gehum)': 'Wheat', 'Onion (प्याज)': 'Onion'
    };
    const cKey = cropKeyMap[selectedCommodity] || selectedCommodity;
    
    // Check if CACP has this crop
    if (cacpData.Crops[cKey]) {
      const cropData = cacpData.Crops[cKey];
      // Format State string for JSON (e.g., "Madhya Pradesh" -> "Madhya_Pradesh")
      const sKey = selectedState.replace(/ /g, "_");
      
      let stateCosts = cropData.State_Specific?.[sKey];
      
      setCacpObject({
        season: cropData.Season || '',
        a2fl: cropData.National_A2_FL,
        c2: stateCosts ? stateCosts.Cost_Per_Hectare_C2 / stateCosts.Expected_Yield_Q_Per_Ha : cropData.National_C2,
        yieldHa: stateCosts ? stateCosts.Expected_Yield_Q_Per_Ha : 20 // default fallback
      });
    } else {
      setCacpObject(null);
    }
  }, [selectedCommodity, selectedState]);

  const states = useMemo(() => {
    return Object.keys(indiaDistricts).sort((a, b) => {
      const nameA = geoTranslations.states[a] || a;
      const nameB = geoTranslations.states[b] || b;
      return nameA.localeCompare(nameB, i18n.language);
    });
  }, [i18n.language]);

  const districts = useMemo(() => {
    if (!indiaDistricts[selectedState]) return [];
    return indiaDistricts[selectedState]
      .map(d => d.district)
      .sort((a, b) => {
        const nameA = geoTranslations.districts[a] || a;
        const nameB = geoTranslations.districts[b] || b;
        return nameA.localeCompare(nameB, i18n.language);
      });
  }, [selectedState, i18n.language]);

  // Combine static commodities with those available in the API today
  const allAvailableCommodities = useMemo(() => {
    const combined = [...commodities];
    
    availableCommodities.forEach(apiNameRaw => {
        const apiName = apiNameRaw.trim();
        if (!apiName) return;
        
        // Check if already in our static list
        const exists = combined.some(c => 
            c.name.toLowerCase() === apiName.toLowerCase() || 
            (c.nameHi && c.nameHi === apiName)
        );
        
        if (!exists) {
            combined.push({
                id: `api-${apiName}`,
                name: apiName.charAt(0).toUpperCase() + apiName.slice(1),
                nameHi: apiName, // Fallback to raw string
                icon: "🌾",
                category: "Live API"
            });
        }
    });

    return combined;
  }, [availableCommodities]);

  // Load from URL and LocalStorage on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('s');
    const d = params.get('d');
    const c = params.get('c');
    
    if (s && states.includes(s)) setSelectedState(s);
    if (d) setSelectedDistrict(d);
    if (c) setSelectedCommodity(c);

    const savedFavs = localStorage.getItem('kisanbaba_favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
  }, []);

  // Update URL on changes
  useEffect(() => {
    const url = new URL(window.location);
    url.searchParams.set('s', selectedState);
    url.searchParams.set('d', selectedDistrict);
    url.searchParams.set('m', selectedMandi);
    url.searchParams.set('c', selectedCommodity);
    window.history.replaceState({}, '', url);
  }, [selectedState, selectedDistrict, selectedMandi, selectedCommodity]);

  useEffect(() => {
    loadDashboard();
    loadNews();
  }, [selectedState, selectedDistrict, selectedMandi, selectedCommodity, userCoords]);

  useEffect(() => {
    checkAvailability();
    
    // 🌐 LANGUAGE AUTO-SWITCH: Map State to Native Language
    const stateLangMap = {
      'Maharashtra': 'mr',
      'Uttar Pradesh': 'hi',
      'Madhya Pradesh': 'hi',
      'Rajasthan': 'hi',
      'Haryana': 'hi',
      'Bihar': 'hi',
      'Chhattisgarh': 'hi',
      'Jharkhand': 'hi',
      'Uttarakhand': 'hi',
      'Himachal Pradesh': 'hi',
      'Delhi': 'hi',
      'Andhra Pradesh': 'en',
      'Karnataka': 'en',
      'Tamil Nadu': 'en',
      'Telangana': 'en',
      'Kerala': 'en',
      'Gujarat': 'hi', // Fallback to Hindi for states with significant Hindi speakers if local not available
      'Punjab': 'hi',
      'West Bengal': 'en'
    };

    const targetLang = stateLangMap[selectedState] || 'en';
    const hasManualLang = sessionStorage.getItem('kisanbaba_manual_lang') === 'true';

    if (!hasManualLang && i18n.language !== targetLang) {
      i18n.changeLanguage(targetLang);
    }

    // 🧽 AUTO-RESET: When state changes, reset to the first district to avoid "stuck" URL params
    const stateDistricts = indiaDistricts[selectedState];
    if (stateDistricts && stateDistricts.length > 0) {
      // Only reset if current district is not in the new state
      if (!stateDistricts.some(d => d.district === selectedDistrict)) {
        setSelectedDistrict(stateDistricts[0].district);
        setSelectedMandi(""); // Reset mandi when district changes
      }
    }
  }, [selectedState, selectedDistrict]);

  async function checkAvailability() {
    try {
      const available = await fetchStateAvailableCommodities(selectedState);
      setAvailableCommodities(available);
      
      const districtAvailable = await fetchDistrictAvailableCommodities(selectedState, selectedDistrict);
      setDistrictAvailableCommodities(districtAvailable);
    } catch (e) {
      console.error("checkAvailability failed:", e);
    }
  }

  async function loadNews() {
    try {
      const data = await fetchAgriNews(i18n.language === 'hi' ? 'hi' : 'en');
      setNews(data || []);
    } catch (e) {
      console.error("loadNews failed:", e);
    }
  }

  const handleStateChange = (newState) => {
    setSelectedState(newState);
    setSelectedMandi(""); // Reset mandi
    const stateDistricts = indiaDistricts[newState] || [];
    if (stateDistricts.length > 0) {
      setSelectedDistrict(stateDistricts[0].district);
    }
  };

  async function loadDashboard() {
    // SECURITY GUARD: Ensure District belongs to State before calling API
    const stateDistricts = indiaDistricts[selectedState] || [];
    const isValidMatch = stateDistricts.some(d => d.district === selectedDistrict) || selectedState === 'Delhi';
    if (!isValidMatch) return; 

    setLoading(true);
    try {
      const data = await fetchMultiDistrictRates(selectedState, selectedDistrict, selectedCommodity, userCoords, selectedMandi);
      setDashboardData(data);
      
      // Update available mandis from the data
      if (data.allRecords) {
        const uniqueMandis = [...new Set(data.allRecords.map(r => r.market || r.mandi_name))].filter(Boolean);
        setAvailableMandis(uniqueMandis);
        // If current mandi is not in the new list, reset it
        if (selectedMandi && !uniqueMandis.includes(selectedMandi)) {
          setSelectedMandi("");
        }
      }
      const msp = getMSPForCommodity(selectedCommodity);
      setMspInfo(msp);
      
      const vAnalysis = getVolumeAnalysis(selectedDistrict, selectedCommodity);
      setVolumeAnalysis(vAnalysis);

      setLastFetchTime(Date.now());
      if (data.origin.price > 0) {
        // Try REAL historical data first, fallback to smart simulation
        const historicalTrend = await fetchHistoricalTrend(selectedState, selectedDistrict, selectedCommodity, data.origin.price);
        setTrendData(historicalTrend);
      }
      // Fetch weather for selected district (FREE)
      const districtInfo = indiaDistricts[selectedState]?.find(d => d.district === selectedDistrict);
      if (districtInfo) {
        const w = await fetchWeatherForDistrict(districtInfo.lat, districtInfo.lng, selectedDistrict);
        setWeather(w);
      }

      // Calculate Savings Potential for this selection
      if (data.neighbors && data.neighbors.length > 0) {
        let maxProfit = 0;
        data.neighbors.forEach(neighbor => {
          const arb = calculateArbitrageProfit(neighbor.priceDiff, harvestQty, neighbor.distance_km, neighbor.transport_factor, neighbor.district, i18n.language);
          if (arb.isWorthIt && arb.netProfit > maxProfit) {
            maxProfit = arb.netProfit;
          }
        });
        if (maxProfit > 0) {
          setSessionSavings(prev => prev + maxProfit);
        }
      }
    } catch (e) {
      console.error("Dashboard load error:", e);
    }
    setLoading(false);
  }

  const getCommodityIcon = (name) => {
    const c = commodities.find(c => c.name === name);
    return c ? c.icon : "📦";
  };

  const toggleFavorite = () => {
    let newFavs;
    const isFav = favorites.some(f => f.s === selectedState && f.d === selectedDistrict && f.c === selectedCommodity);
    if (isFav) {
      newFavs = favorites.filter(f => !(f.s === selectedState && f.d === selectedDistrict && f.c === selectedCommodity));
    } else {
      newFavs = [...favorites, { s: selectedState, d: selectedDistrict, c: selectedCommodity, icon: getCommodityIcon(selectedCommodity) }];
    }
    setFavorites(newFavs);
    localStorage.setItem('kisanbaba_favorites', JSON.stringify(newFavs));
  };

  const selectFavorite = (f) => {
    setSelectedState(f.s);
    setSelectedDistrict(f.d);
    setSelectedCommodity(f.c);
  };

  const handleGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        
        const nearest = findNearestDistricts(latitude, longitude, indiaDistricts);
        setNearestDistricts(nearest);
        
        if (nearest.length > 0) {
          const top = nearest[0];
          setSelectedState(top.state);
          setSelectedDistrict(top.district);
        }
        setGpsLoading(false);
      },
      (error) => {
        console.error("GPS Error:", error);
        setGpsLoading(false);
        alert("Unable to get your location. Please select manually.");
      }
    );
  };

  const handleVoiceSearch = () => {
    setIsListening(true);
    startVoiceRecognition(
      (text) => {
        const lowerText = text.toLowerCase().trim();
        
        // 1. Check regional synonyms first
        let matchedName = REGIONAL_SYNONYMS[lowerText];
        
        // 2. Check direct commodity names
        if (!matchedName) {
          const match = commodities.find(c => lowerText.includes(c.name.toLowerCase()) || lowerText.includes(c.nameHi?.toLowerCase()));
          if (match) matchedName = match.name;
        }

        if (matchedName) {
          setSelectedCommodity(matchedName);
          speakText(i18n.language === 'hi' ? `${matchedName} चुना गया` : `${matchedName} selected`, i18n.language === 'hi' ? 'hi-IN' : 'en-US');
        } else {
          speakText(i18n.language === 'hi' ? "मुझे यह फसल नहीं मिली" : "Sorry, I couldn't find that crop.", i18n.language === 'hi' ? 'hi-IN' : 'en-US');
        }
      },
      () => setIsListening(false),
      i18n.language === 'hi' ? 'hi-IN' : 'en-IN'
    );
  };

  const handleVoiceCommand = () => {
    setIsListening(true);
    startVoiceRecognition(
      (text) => {
        const lowerText = text.toLowerCase().trim();
        
        if (lowerText.includes('price') || lowerText.includes('rate') || lowerText.includes('भाव')) {
          handleSpeakPrice();
        } else if (lowerText.includes('weather') || lowerText.includes('मौसम')) {
          const wText = i18n.language === 'hi' 
            ? `${selectedDistrict} में मौसम ${weather?.description || 'साफ़'} है।`
            : `The weather in ${selectedDistrict} is ${weather?.description || 'clear'}.`;
          speakText(wText, i18n.language === 'hi' ? 'hi-IN' : 'en-US');
        } else if (lowerText.includes('mandi') || lowerText.includes('मंडी')) {
          setIntelDrawerOpen(true);
          speakText(i18n.language === 'hi' ? "मंडी इंटेलिजेंस खुल रहा है" : "Opening Mandi Intelligence", i18n.language === 'hi' ? 'hi-IN' : 'en-US');
        } else {
          // Fallback to search
          const matched = commodities.find(c => lowerText.includes(c.name.toLowerCase()) || lowerText.includes(c.nameHi?.toLowerCase()));
          if (matched) {
            setSelectedCommodity(matched.name);
            speakText(i18n.language === 'hi' ? `${matched.nameHi} का भाव देखिये` : `Check price for ${matched.name}`, i18n.language === 'hi' ? 'hi-IN' : 'en-US');
          } else {
            speakText(i18n.language === 'hi' ? "दोहराएं?" : "Could you repeat that?", i18n.language === 'hi' ? 'hi-IN' : 'en-US');
          }
        }
      },
      () => setIsListening(false),
      i18n.language === 'hi' ? 'hi-IN' : 'en-IN'
    );
  };

  const handleSpeakPrice = () => {
    if (!displayData) return;
    const text = i18n.language === 'hi' 
      ? `${selectedDistrict} मंडी में ${selectedCommodity} का भाव ${displayData.origin.price} रुपये है।`
      : `The price of ${selectedCommodity} in ${selectedDistrict} Mandi is ${displayData.origin.price} rupees.`;
    speakText(text, i18n.language === 'hi' ? 'hi-IN' : 'en-US');
  };

  const handleShare = () => {
    if (!displayData) return;
    const shareText = `🌾 *Ram Ram Farmer Brothers!* I just found the best price for *${selectedCommodity}* on *KisanBaba.com*!

📍 *${selectedDistrict} Mandi*: ₹${displayData.origin.price}/q
💰 *Arbitrage Profit*: ₹${sessionSavings > 0 ? sessionSavings : 'Great'} potential!
🌦️ *Weather Advice*: ${weather?.description || 'Check live'}

Check yours here: ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  // Advanced SEO Schema Generation
  const generateAdvancedSchema = () => {
    return [
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": `KisanBaba True P&L Agriculture Engine - ${selectedCommodity}`,
        "applicationCategory": "BusinessApplication, AgriculturalApplication",
        "operatingSystem": "Web",
        "description": `Live Mandi rate for ${selectedCommodity} in ${selectedDistrict}. Includes CACP True Break-Even calculations, arbitrage tracking, and micro-climate weather intelligence for Indian farmers.`,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR"
        },
        "author": {
          "@type": "Organization",
          "name": "Antigravity Research & NIRI"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `What is the live Mandi Bhav for ${selectedCommodity} in ${selectedDistrict}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `As of today, the modal (average) auction price for ${selectedCommodity} in ${selectedDistrict} APMC is ₹${displayData?.origin?.price || '...' } per quintal.`
            }
          },
          {
            "@type": "Question",
            "name": `How is the C2 Profit calculated for ${selectedCommodity}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The C2 Profit is calculated using the official Commission for Agricultural Costs and Prices (CACP) dataset, which factors in actual expenses (A2) + imputed family labor (FL) + land and capital interest."
            }
          }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "Dataset",
        "name": `Live AGMARKNET Mandi Rates for ${selectedCommodity} - ${selectedState}`,
        "description": "Daily updated agricultural commodity prices sourced directly from the Ministry of Agriculture, Government of India.",
        "license": "https://data.gov.in/sites/default/files/NDSAP.pdf",
        "creator": {
          "@type": "Organization",
          "name": "data.gov.in"
        }
      }
    ];
  };

  return (
    <div className="mandi-dashboard">
      <div className="launch-badge">Alpha Stage</div>
      
      <Helmet>
        <title>{`${selectedCommodity} Mandi Bhav Today in ${selectedDistrict} | KisanBaba AI`}</title>
      </Helmet>

      {/* LAYER 1: Hyper-Local Scrolling Ticker */}
      <div className="mandi-ticker-wrap">
        <div className="mandi-ticker">
          <span>{t('mandi.hero.ticker', { city: 'INDORE', crop: 'SOYABEAN', price: '5,173', trend: '▲45', targetCity: 'DEWAS', targetPrice: '5,350', alert: i18n.language === 'hi' ? '24 घंटे में बारिश' : 'Rain in 24hrs' })}</span>
          <span>{t('mandi.hero.ticker', { city: 'UJJAIN', crop: 'WHEAT', price: '2,450', trend: '▼10', targetCity: 'INDORE', targetPrice: '2,600', alert: i18n.language === 'hi' ? 'तेज़ हवाएं' : 'High Winds' })}</span>
          <span>{t('mandi.hero.ticker', { city: 'RAIPUR', crop: 'PADDY', price: '2,183', trend: '▲15', targetCity: 'DURG', targetPrice: '2,300', alert: i18n.language === 'hi' ? 'सुरक्षित परिवहन' : 'Safe to transport' })}</span>
          <span>{t('mandi.hero.ticker', { city: 'NASHIK', crop: 'ONION', price: '1,850', trend: '▲120', targetCity: 'MUMBAI', targetPrice: '2,400', alert: i18n.language === 'hi' ? 'भारी मांग' : 'High Demand' })}</span>
          <span>{t('mandi.hero.ticker', { city: 'LUDHIANA', crop: 'MUSTARD', price: '5,050', trend: '▲30', targetCity: 'JALANDHAR', targetPrice: '5,150', alert: i18n.language === 'hi' ? 'आसमान साफ' : 'Clear Sky' })}</span>
          <span>{t('mandi.hero.ticker', { city: 'PATNA', crop: 'POTATO', price: '1,200', trend: '▼20', targetCity: 'HAJIPUR', targetPrice: '1,350', alert: i18n.language === 'hi' ? 'हल्की बारिश' : 'Slight Drizzle' })}</span>
        </div>
      </div>

      {/* LAYER 2: Core Brand (Main Title) */}
      <div className="mandi-hero-v2">
        <div className="ai-branding-tag">
          <span className="ai-pulse"></span>
          KisanBaba AI {t('mandi.hero.aiTag')}
        </div>
        <h1 className="mandi-brand-title">KisanBaba</h1>

        {/* LAYER 3: Universal Equation (The Utility) */}
        <div className="mandi-visual-equation">
          <div className="eq-box">{t('mandi.hero.equation.rate')}</div>
          <div className="eq-symbol">➖</div>
          <div className="eq-box">{t('mandi.hero.equation.transport')}</div>
          <div className="eq-symbol">🟰</div>
          <div className="eq-box result-glow">{t('mandi.hero.equation.netProfit')}</div>
        </div>

        {/* LAYER 4: Authority Footer */}
        <div className="mandi-authority-bar">
          {t('mandi.hero.authority')}
        </div>
      </div>

      {/* Selector Bar */}
      <div className="mandi-selectors">
        <div className="selector-group">
          <label>{t('mandi.selectors.state')}</label>
          <select value={selectedState} onChange={e => handleStateChange(e.target.value)}>
            {states.map(state => (
              <option key={state} value={state}>
                {i18n.language === 'en' ? state : (geoTranslations.states[state] || state)}
              </option>
            ))}
          </select>
        </div>
        <div className="header-control">
          <label>🏘️ {t('mandi.header.district')}</label>
          <select value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)}>
            {districts.map(dist => (
              <option key={dist} value={dist}>
                {i18n.language === 'en' ? dist : (geoTranslations.districts[dist] || dist)}
              </option>
            ))}
          </select>
        </div>
        {availableMandis.length > 1 && (
          <div className="header-control animate-fade-in">
            <label>🏗️ {t('mandi.header.mandi', { defaultValue: 'Select Mandi' })}</label>
            <select value={selectedMandi} onChange={e => setSelectedMandi(e.target.value)}>
              <option value="">{t('mandi.selectors.allMandis', { defaultValue: 'Main Mandi' })}</option>
              {availableMandis.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        )}
        <div className="selector-group">
          <label>{t('mandi.selectors.crop')}</label>
          <div className="selector-row">
             <select value={selectedCommodity} onChange={e => setSelectedCommodity(e.target.value)}>
               {allAvailableCommodities.map(c => {
                 const nameLower = c.name.toLowerCase();
                 const nameHi = c.nameHi ? c.nameHi.toLowerCase() : '';
                 const isInDistrict = districtAvailableCommodities.some(d => d === nameLower || d === nameHi);
                 const isInState = availableCommodities.some(s => s === nameLower || s === nameHi);
                 
                 return (
                   <option key={c.id} value={c.name}>
                     {c.icon} {t(`mandi.crops.${c.name.charAt(0).toLowerCase() + c.name.slice(1).replace(/ /g, '')}.name`, { defaultValue: c.nameHi && i18n.language === 'hi' ? c.nameHi : c.name })} {isInDistrict ? '🏠' : isInState ? '🟢' : ''}
                   </option>
                 );
               })}
             </select>
            <button 
              className={`gps-btn ${gpsLoading ? 'loading' : ''}`} 
              onClick={handleGPS}
              title={t('mandi.selectors.gps')}
            >
              {gpsLoading ? '📡' : '📍'} {t('mandi.selectors.gps')}
            </button>
            <button 
              className={`voice-btn ${isListening ? 'listening' : ''}`} 
              onClick={handleVoiceSearch}
              title={t('mandi.selectors.voice')}
            >
              {isListening ? '🛑' : '🎙️'}
            </button>
          </div>
          <p className="selector-hint">
            <span style={{fontSize:'0.85em', color:'var(--forest-green)', display: 'inline-block', marginTop: '6px', fontWeight: '800'}}>
              🏠 {t('mandi.selectors.hintLocal')} &nbsp;&nbsp; 🟢 {t('mandi.selectors.hintState')}
            </span>
          </p>
        </div>
      </div>

      {/* My Favorites Quick Access */}
      {favorites.length > 0 && (
        <div className="favorites-bar">
          <span className="fav-label">⭐ {t('mandi.radar.myMandis')}:</span>
          <div className="fav-list">
            {favorites.map((f, i) => (
              <button key={i} className="fav-item" onClick={() => selectFavorite(f)}>
                {f.icon} {i18n.language === 'hi' ? (commodities.find(c => c.name === f.c)?.nameHi || f.c) : f.c} ({f.d})
              </button>
            ))}
          </div>
        </div>
      )}

      {nearestDistricts.length > 0 && (
        <div className="mandi-radar">
          <span className="radar-label">📡 {t('mandi.radar.title')}:</span>
          <div className="radar-list">
            {nearestDistricts.map((d, i) => (
              <button 
                key={i} 
                className={`radar-item ${selectedDistrict === d.district ? 'active' : ''}`}
                onClick={() => { setSelectedState(d.state); setSelectedDistrict(d.district); }}
              >
                <span className="radar-dist">{d.distance}km</span>
                <span className="radar-name">{d.district}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="mandi-loading">
          <div className="loading-spinner"></div>
          <p>{t('mandi.stats.fetching')}</p>
        </div>
      )}

      {sessionSavings > 0 && (
        <div className="savings-badge-float">
          <div className="savings-icon">💰</div>
          <div className="savings-content">
            <span className="savings-label">{t('mandi.stats.profitRadar')}</span>
            <span className="savings-value">₹{sessionSavings.toLocaleString('en-IN')} {t('mandi.stats.saved')}</span>
            <button className="wa-share-btn-mini" onClick={handleShare} title={t('mandi.stats.share')}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" style={{width: '24px', filter: 'brightness(0) invert(1)'}} />
            </button>
          </div>
        </div>
      )}

      {displayData && !loading && (
        <>
          {/* Origin Price Hero Card */}
          <div className="origin-price-card">
            <div className="origin-header">
              <span className="origin-icon">{getCommodityIcon(selectedCommodity)}</span>
              <div className="origin-titles">
                <div style={{ fontSize: '0.8rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  {t('mandi.selectors.crop')}
                </div>
                <h2 className="dark-title">
                  {i18n.language === 'hi' ? (commodities.find(c => c.name === selectedCommodity)?.nameHi || selectedCommodity) : selectedCommodity}
                  {displayData.origin.isAvailable && <span className="trading-dot" title="Live Trading Active"></span>}
                  <InfoTooltip 
                    title={t('mandi.infoTools.originPrice.title')}
                    methodology={t('mandi.infoTools.originPrice.methodology')}
                    accuracy={t('mandi.infoTools.originPrice.accuracy')}
                    limitations={t('mandi.infoTools.originPrice.limitations')}
                    source={t('mandi.infoTools.originPrice.source')}
                  />
                </h2>
                
                {/* 🌾 Commodity Status Bar (Phase 8 Refinement) */}
                <div className="commodity-status-bar" style={{ 
                  display: 'flex', 
                  gap: '15px', 
                  marginTop: '10px', 
                  fontSize: '0.9rem', 
                  fontWeight: 'bold',
                  opacity: 0.9
                }}>
                  {(() => {
                    const nameLower = selectedCommodity.toLowerCase();
                    const commodityObj = commodities.find(c => c.name === selectedCommodity);
                    const nameHi = commodityObj?.nameHi ? commodityObj.nameHi.toLowerCase() : '';
                    const isInDistrict = districtAvailableCommodities.some(d => d === nameLower || d === nameHi);
                    const isInState = availableCommodities.some(s => s === nameLower || s === nameHi);
                    
                    return (
                      <>
                        {isInDistrict && (
                          <span style={{ color: 'var(--prosperity-gold)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            🏠 {t('mandi.selectors.hintLocal')}
                          </span>
                        )}
                        {isInState && (
                          <span style={{ color: 'var(--forest-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            🟢 {t('mandi.selectors.hintState')}
                          </span>
                        )}
                        {!isInDistrict && !isInState && (
                          <span style={{ opacity: 0.6 }}>⚖️ {t('mandi.selectors.hint', { defaultValue: 'Market Intelligence Active' })}</span>
                        )}
                      </>
                    );
                  })()}
                </div>

                <p className="dark-subtitle">
                  📍 {selectedState === 'Delhi' ? 
                    (displayData.origin.market && displayData.origin.market !== "Unknown" ? 
                      (displayData.origin.market.toLowerCase().includes('mandi') ? displayData.origin.market : `${displayData.origin.market} Mandi`) 
                      : selectedDistrict) 
                    : t(`geography.districts.${selectedDistrict}`, { defaultValue: selectedDistrict })}
                  {selectedState !== 'Delhi' && displayData.origin.market && displayData.origin.market !== "Unknown" && displayData.origin.market.toLowerCase() !== selectedDistrict.toLowerCase() ? 
                    (displayData.origin.market.toLowerCase().includes('mandi') ? ` (${displayData.origin.market})` : ` (${displayData.origin.market} Mandi)`) 
                    : ''} 
                  — {t(`geography.states.${selectedState}`, { defaultValue: selectedState })}
                </p>
              </div>
              <button 
                className={`voice-btn ${isListening ? 'listening' : ''}`}
                onClick={handleVoiceCommand}
                aria-label="Speak for Live Rate"
              >
                 {isListening ? '🎙️...' : '🎙️'}
              </button>
            </div>
            
            <div 
              className="origin-main-data intel-trigger"
              onClick={() => setIntelDrawerOpen(true)}
              style={{ cursor: 'pointer' }}
            >
              <div className="intel-tap-prompt">
                {t('mandi.intelligence.tapPrompt')}
              </div>
              <div className="origin-price-block">
                <span className="price-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {t('mandi.originPrice.title', { defaultValue: i18n.language === 'hi' ? 'वर्तमान मंडी भाव' : 'Current Market Price' })}
                  {displayData.origin.source && (
                    <span className={`source-tag ${displayData.origin.source.includes('Verified') ? 'real' : 'mock'}`}>
                      {displayData.origin.source}
                    </span>
                  )}
                </span>
                <h1 className="main-price" style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                  ₹{displayData.origin.price?.toLocaleString('en-IN')}
                  <span className="unit">/q</span>
                  
                  {displayData.origin.isEstimated && (
                    <span 
                      className="estimate-badge" 
                      style={{ 
                        fontSize: '0.7rem', 
                        background: displayData.origin.data_source === 'AI_ESTIMATE' ? 'var(--terra-cotta)' : 'var(--prosperity-gold)', 
                        color: 'white', 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontWeight: '900',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}
                    >
                      {displayData.origin.data_source === 'AI_ESTIMATE' 
                        ? (i18n.language === 'hi' ? '🤖 AI पूर्वानुमान' : '🤖 AI Forecast') 
                        : (i18n.language === 'hi' ? '⚡ रियल-टाइम अनुमान' : '⚡ Real-time Estimate')}
                    </span>
                  )}
                  
                  {displayData.origin.data_source === 'HTML_SCRAPER' && (
                    <span 
                      className="source-badge-live" 
                      style={{ 
                        fontSize: '0.7rem', 
                        background: 'var(--forest-green)', 
                        color: 'white', 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontWeight: '900',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                    >
                      {i18n.language === 'hi' ? '🌐 लाइव पोर्टल' : '🌐 Live Portal Data'}
                    </span>
                  )}

                  {displayData.origin.data_source === 'API' && (
                    <span 
                      className="source-badge-official" 
                      style={{ 
                        fontSize: '0.7rem', 
                        background: 'rgba(255,255,255,0.1)', 
                        color: 'var(--leaf-green)', 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontWeight: '900',
                        border: '1px solid var(--leaf-green)'
                      }}
                    >
                      {i18n.language === 'hi' ? '🏛️ सरकारी API' : '🏛️ Govt. API'}
                    </span>
                  )}
                  
                  {/* Phase 10: Yearly Price Range Bar */}
                  {historicalStats && historicalStats.commodity.toLowerCase() === selectedCommodity.toLowerCase() && (
                    <div className="yearly-range-container">
                      <div className="yearly-range-header">
                        <span>{t('mandi.intelligence.labels.yearlyRange')}</span>
                      </div>
                      <div className="yearly-range-bar-wrapper">
                        <div className="yearly-range-bar-track">
                          <div 
                            className="yearly-range-pointer"
                            style={{ 
                              left: `${Math.min(100, Math.max(0, ((displayData.origin.price - historicalStats.absoluteMin) / (historicalStats.absoluteMax - historicalStats.absoluteMin)) * 100))}%`
                            }}
                          >
                            <div className="pointer-glow"></div>
                          </div>
                        </div>
                        <div className="yearly-range-labels">
                          <div className="range-label-item">
                            <span className="label-text">{t('mandi.intelligence.labels.yearlyLow')}</span>
                            <span className="label-price">₹{historicalStats.absoluteMin.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="range-label-item" style={{ textAlign: 'right' }}>
                            <span className="label-text">{t('mandi.intelligence.labels.yearlyHigh')}</span>
                            <span className="label-price">₹{historicalStats.absoluteMax.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {volumeAnalysis && (
                    <div 
                      className={`volume-shock-badge ${volumeAnalysis.shockLevel}`}
                      style={{ 
                        marginLeft: 'auto',
                        background: volumeAnalysis.color, 
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: '900',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: `0 4px 12px ${volumeAnalysis.color}44`,
                        animation: volumeAnalysis.shockLevel === 'critical' ? 'pulse 1.5s infinite' : 'none'
                      }}
                      title={volumeAnalysis.advice}
                    >
                      {volumeAnalysis.shockLevel === 'critical' ? '🔴' : volumeAnalysis.shockLevel === 'warning' ? '🟡' : '🟢'} 
                      {volumeAnalysis.message}
                    </div>
                  )}

                  <button className="speak-btn" onClick={handleSpeakPrice} title="Listen to Price" style={{ background: 'hsla(162, 94%, 50%, 0.2)', padding: '10px', borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer', border: 'none' }}>
                    🔊
                  </button>
                </h1>
                
                <div className="price-range">
                  <span className="range-item min">{t('mandi.priceCard.min')}: ₹{displayData.origin.minPrice?.toLocaleString('en-IN')}</span>
                  <span className="range-item max">{t('mandi.priceCard.max')}: ₹{displayData.origin.maxPrice?.toLocaleString('en-IN')}</span>
                </div>
                {volumeAnalysis && (
                  <div className="arrival-volume-badge v-ticker" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}>
                    <span className="arrival-icon" style={{ fontSize: '1.2rem' }}>📊</span>
                    <span className="arrival-text" style={{ fontSize: '0.90rem' }}>
                      {t('mandi.priceCard.supply', { defaultValue: 'Mandi Inflow' })}: 
                      <strong style={{ margin: '0 5px' }}> {volumeAnalysis.current} {volumeAnalysis.unit} </strong>
                      <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>(Avg: {volumeAnalysis.average})</span>
                    </span>
                    <span className={`supply-tag ${volumeAnalysis.shockLevel === 'critical' ? 'high' : volumeAnalysis.shockLevel === 'warning' ? 'medium' : 'low'}`} 
                          style={{ 
                            marginLeft: 'auto', 
                            background: volumeAnalysis.color, 
                            color: 'white',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontWeight: '800'
                          }}>
                       {volumeAnalysis.surge > 0 ? '+' : ''}{volumeAnalysis.surge}%
                    </span>
                  </div>
                )}
                
                {mspInfo && mspInfo.msp_price > 0 && displayData.origin.price > 0 && (
                  <div className="msp-correlation" style={{ 
                    marginTop: '15px', 
                    padding: '12px 16px', 
                    background: displayData.origin.price >= mspInfo.msp_price ? 'hsla(162, 94%, 50%, 0.1)' : 'hsla(10, 80%, 50%, 0.1)', 
                    border: `2px solid ${displayData.origin.price >= mspInfo.msp_price ? 'var(--forest-green)' : 'var(--terra-cotta)'}`, 
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontSize: '0.9rem', opacity: 0.8, textTransform: 'uppercase', fontWeight: 700 }}>
                         {mspInfo.isOfficialMSP ? t('mandi.priceCard.msp') : (i18n.language === 'hi' ? 'सरकारी सहयोग बेंचमार्क' : 'Govt. Support Benchmark')} ({mspInfo.marketing_year})
                       </span>
                       <span style={{ fontWeight: 900, fontSize: '1.2rem' }}>₹{mspInfo.msp_price}</span>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '950', display: 'flex', alignItems: 'center', gap: '8px', color: displayData.origin.price >= mspInfo.msp_price ? 'var(--forest-green)' : 'var(--terra-cotta)' }}>
                      {displayData.origin.price >= mspInfo.msp_price ? '🚀' : '⚠️'} 
                      {displayData.origin.price >= mspInfo.msp_price ? '+' : '-'}₹{Math.abs(displayData.origin.price - mspInfo.msp_price)}
                      <span style={{ fontSize: '1rem' }}>{displayData.origin.price >= mspInfo.msp_price ? t('footer.msp_gap.above') : t('footer.msp_gap.below')}</span>
                    </div>
                  </div>
                )}

                {communityPriceInfo && communityPriceInfo.count > 0 && (
                   <div className={`community-price-badge ${communityPriceInfo.isAlert ? 'alert-active' : ''}`} style={{
                     marginTop: '15px',
                     padding: '15px',
                     background: communityPriceInfo.isAlert 
                        ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))' 
                        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))',
                     border: communityPriceInfo.isAlert 
                        ? '2px solid #ef4444' 
                        : '1px solid rgba(239, 68, 68, 0.2)',
                     borderRadius: '16px',
                     position: 'relative',
                     overflow: 'hidden',
                     animation: communityPriceInfo.isAlert ? 'pulse-border 2s infinite' : 'none'
                   }}>
                     {communityPriceInfo.isAlert && (
                       <div style={{ 
                         background: '#ef4444', 
                         color: 'white', 
                         fontSize: '0.65rem', 
                         fontWeight: 'bold', 
                         padding: '2px 8px', 
                         borderRadius: '0 0 8px 8px',
                         position: 'absolute',
                         top: 0,
                         left: '50%',
                         transform: 'translateX(-50%)',
                         whiteSpace: 'nowrap',
                         boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                       }}>
                         🚨 {i18n.language === 'hi' ? 'सावधान: मंडी भाव API से कम है' : 'ALERT: BELOW API RATE'}
                       </div>
                     )}
                     <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '3rem', opacity: 0.05 }}>🤝</div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', marginTop: communityPriceInfo.isAlert ? '10px' : '0' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#f87171', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          🔥 {t('footer.report.community_price')}
                        </span>
                        <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#f87171' }}>₹{communityPriceInfo.price.toLocaleString('en-IN')}/q</span>
                     </div>
                     <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>
                        {t('footer.report.community_status', { count: communityPriceInfo.count })}
                     </p>
                     {communityPriceInfo.isAlert && (
                       <div style={{ marginTop: '8px', fontSize: '0.7rem', color: '#fca5a5', fontStyle: 'italic' }}>
                         {i18n.language === 'hi' 
                           ? `व्यापारी सरकारी रेट से ${communityPriceInfo.gapPercent}% कम बोली लगा रहे हैं।` 
                           : `Traders are bidding ${communityPriceInfo.gapPercent}% below Agmarknet benchmark.`}
                       </div>
                     )}
                   </div>
                )}
                <div className="origin-date" style={{ marginTop: '15px', fontSize: '0.9rem', opacity: 0.7 }}>🕒 {displayData.origin.date}</div>
              </div>
            </div>

            {/* Ground Truth Integrity Panel */}
            {lastFetchTime && (
              <div className="integrity-card" style={{ 
                margin: '20px 0', 
                padding: '20px', 
                background: 'var(--card-bg)', 
                borderRadius: '16px', 
                border: '1px solid var(--glass-border)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '1.8rem' }}>🛰️</div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{t('footer.report.title', { defaultValue: 'Mandi Reporter (Live Pulse)' })}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}>{t('footer.report.subtitle', { defaultValue: 'Waze for Farmers: Powered by Consensus Engine' })}</p>
                  </div>
                </div>

                {reportStatus.step === 'idle' && (
                  <button 
                    className="sos-fake-btn" 
                    style={{ width: '100%', padding: '12px', background: 'var(--terra-cotta)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}
                    onClick={() => setReportStatus({ ...reportStatus, step: 'selecting' })}
                  >
                    {t('footer.report.btn')}
                  </button>
                )}
                
                {reportStatus.step === 'selecting' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button className="report-cat-btn" onClick={() => setReportStatus({ step: 'price_input', category: 'low_price' })}>
                       {t('footer.report.categories.low_price')} 
                       <span style={{marginLeft: 'auto', opacity: 0.6, fontSize: '0.8em'}}>({integrityStats.lowPrice} {t('footer.report.reports_count')})</span>
                    </button>
                    <button className="report-cat-btn" onClick={() => setReportStatus({ step: 'success', category: 'closed' })}>
                       {t('footer.report.categories.closed')} 
                       <span style={{marginLeft: 'auto', opacity: 0.6, fontSize: '0.8em'}}>({integrityStats.closed} {t('footer.report.reports_count')})</span>
                    </button>
                    <button className="report-cat-btn" onClick={() => setReportStatus({ step: 'success', category: 'dispute' })}>
                       {t('footer.report.categories.dispute')} 
                       <span style={{marginLeft: 'auto', opacity: 0.6, fontSize: '0.8em'}}>({integrityStats.dispute} {t('footer.report.reports_count')})</span>
                    </button>
                    <button className="report-cat-btn" onClick={() => setReportStatus({ step: 'idle' })} style={{ opacity: 0.7, background: 'transparent', border: '1px solid var(--glass-border)' }}>
                       {i18n.language === 'hi' ? 'रद्द करें' : 'Cancel'}
                    </button>
                  </div>
                )}

                {reportStatus.step === 'price_input' && (
                  <div className="price-report-flow" style={{ padding: '5px' }}>
                    <p style={{ fontSize: '0.9rem', marginBottom: '10px', fontWeight: 'bold' }}>{t('footer.report.how_much')}</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                         type="number" 
                         value={reportStatus.userPrice}
                         onChange={(e) => setReportStatus({ ...reportStatus, userPrice: e.target.value })}
                         placeholder="₹ (e.g. 1500)"
                         style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                      />
                      <button 
                         className="action-btn"
                         onClick={() => {
                           const price = parseInt(reportStatus.userPrice);
                           if (!price) return;
                           const gap = (displayData?.origin?.price || 0) - price;
                           const newReport = {
                             id: Date.now(),
                             userName: i18n.language === 'hi' ? 'आप' : 'You',
                             reportType: 'low_price',
                             timeAgo: `1${t('mandi.priceCard.units.m')}`,
                             district: selectedDistrict,
                             commodity: selectedCommodity,
                             verified: false,
                             gap: gap > 0 ? gap : 0
                           };
                           setUserReports([newReport, ...userReports]);
                           setReportStatus({ step: 'success', category: 'low_price' });
                         }}
                         style={{ background: 'var(--forest-green)', padding: '10px 15px' }}
                      >
                        {t('footer.report.submit_price')}
                      </button>
                    </div>
                  </div>
                )}

                {reportStatus.step === 'success' && (
                  <div style={{ textAlign: 'center', padding: '15px', background: 'hsla(162, 94%, 50%, 0.1)', borderRadius: '12px', color: 'var(--forest-green)', fontWeight: 'bold', border: '1px solid var(--forest-green)' }}>
                    ✅ {t('footer.report.success')}
                    <button 
                       onClick={() => setReportStatus({ step: 'idle', userPrice: '' })}
                       style={{ display: 'block', margin: '10px auto 0', fontSize: '0.8rem', opacity: 0.7, background: 'transparent', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      {i18n.language === 'hi' ? 'एक और रिपोर्ट करें' : 'Report another'}
                    </button>
                  </div>
                )}
                
                <div style={{ marginTop: '15px', fontSize: '0.8rem', opacity: 0.6, borderTop: '1px solid var(--glass-border)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <span 
                    onClick={() => setShowReportsModal(true)} 
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--prosperity-gold)', fontWeight: 'bold' }}
                  >
                    {t('footer.report.stats', { count: integrityStats.total })} 
                    <span style={{fontSize: '0.7rem', opacity: 0.8}}>➔ {t('footer.report.view_btn', { defaultValue: 'View Real-time' })}</span>
                  </span>
                  <span style={{ color: communityPriceInfo?.isAlert ? '#ef4444' : 'inherit', fontWeight: communityPriceInfo?.isAlert ? 'bold' : 'normal' }}>
                    {selectedState === 'Delhi' ? (displayData.origin.market || selectedDistrict) : selectedDistrict} मंडी 
                    {communityPriceInfo?.isAlert 
                       ? (i18n.language === 'hi' ? ' ⚠️ भारी अंतर' : ' ⚠️ HIGH VARIANCE')
                       : ` ${t('footer.report.verified_tag', { defaultValue: 'सत्यापित' })}`
                    }
                  </span>
                </div>
              </div>
            )}
            
            {/* 📊 Real-time Data Status Bar (User Request Fix) */}
            <div className="data-status-bar" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '10px 15px', 
              fontSize: '0.75rem', 
              opacity: 0.6,
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '0 0 16px 16px',
              marginTop: '-20px',
              borderTop: '1px solid var(--glass-border)'
            }}>
              <span>📅 {i18n.language === 'hi' ? 'अपडेट' : 'Update'}: {displayData.origin.date || new Date().toLocaleDateString()}</span>
              <span>⛽ {t('mandi.priceCard.diesel')}: ₹{displayData.dieselRate || 92.5}/L</span>
              <span>🔄 {t('mandi.stats.fetching', { defaultValue: 'Fetched' }).split(' ')[0]} {Math.floor((Date.now() - lastFetchTime) / 60000)} min ago</span>
            </div>

            {!displayData.origin.isAvailable && (
              <div className="no-data-warning" style={{ marginTop: '15px' }}>
                {t('mandi.priceCard.noData')}
              </div>
            )}
          </div>

          {/* Harvest Quantity Slider - Place here at User Request (Below Rate, Above Transport) */}
            {/* DEMO MODE CONTROL PANEL (For Testing Robustness) */}
            <div style={{ 
              marginTop: '40px', 
              padding: '20px', 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: '16px', 
              border: '1px dashed #10b981',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4 style={{ margin: 0, color: '#10b981' }}>🛠️ Robustness Test Panel</h4>
                <button 
                  onClick={() => setDemoMode(!demoMode)}
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '20px', 
                    background: demoMode ? '#059669' : '#334155', 
                    color: 'white',
                    border: 'none',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  {demoMode ? 'SIMULATION: ON' : 'START LIVE TEST'}
                </button>
              </div>
              
              {demoMode && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => setDemoSource('API')} 
                    style={{ padding: '8px 12px', borderRadius: '8px', background: demoSource === 'API' ? '#10b981' : '#1e293b', color: 'white', border: 'none', fontSize: '0.75rem', cursor: 'pointer' }}
                  > Tier 1: Govt API</button>
                  <button 
                    onClick={() => setDemoSource('HTML_SCRAPER')} 
                    style={{ padding: '8px 12px', borderRadius: '8px', background: demoSource === 'HTML_SCRAPER' ? '#10b981' : '#1e293b', color: 'white', border: 'none', fontSize: '0.75rem', cursor: 'pointer' }}
                  > Tier 2: Live Scraper</button>
                  <button 
                    onClick={() => setDemoSource('AI_ESTIMATE')} 
                    style={{ padding: '8px 12px', borderRadius: '8px', background: demoSource === 'AI_ESTIMATE' ? '#f59e0b' : '#1e293b', color: 'white', border: 'none', fontSize: '0.75rem', cursor: 'pointer' }}
                  > Tier 3: AI Forecast</button>
                  <button 
                    onClick={() => setDemoSource('USER_PULSE')} 
                    style={{ padding: '8px 12px', borderRadius: '8px', background: demoSource === 'USER_PULSE' ? '#ef4444' : '#1e293b', color: 'white', border: 'none', fontSize: '0.75rem', cursor: 'pointer' }}
                  > Tier 4: Farmer Pulse</button>
                </div>
              )}
              <p style={{ margin: '10px 0 0', fontSize: '0.7rem', opacity: 0.7 }}>
                * Select a tier above to see how the dashboard badges and data-source indicators automatically adapt to maintain reliability.
              </p>
            </div>

            <div className="harvest-slider-section" style={{
              margin: '20px 0',
              padding: '20px',
              background: 'var(--card-bg)',
              borderRadius: '16px',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <div className="harvest-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontWeight: 'bold' }}>📦 {i18n.language === 'hi' ? 'आपकी कुल पैदावार' : 'Your Harvest Quantity'}</span>
                <span className="harvest-value" style={{ color: 'var(--prosperity-gold)', fontWeight: '900', fontSize: '1.2rem' }}>{harvestQty} {i18n.language === 'hi' ? 'क्विंटल' : 'Quintals'}</span>
              </div>
              <input
                type="range"
                min="1"
                max="200"
                value={harvestQty}
                onChange={e => setHarvestQty(parseInt(e.target.value))}
                className="harvest-range"
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--prosperity-gold)' }}
              />
              <div className="harvest-marks" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.8rem', opacity: 0.6 }}>
                <span>1Q</span><span>50Q</span><span>100Q</span><span>150Q</span><span>200Q</span>
              </div>
            </div>

          {/* Ground Reality / Friction Variables Panel */}
          <div className="friction-variables-panel">
            <h3 className="friction-title">🚜 {t('mandi.selectors.groundReality.title')}</h3>
            <div className="friction-grid">
              
              <div className="friction-control">
                <label>🌾 {t('mandi.selectors.groundReality.qualityLabel')}</label>
                <div className="toggle-group">
                  <button className={`toggle-btn ${qualityGrade === 'A' ? 'active' : ''}`} onClick={() => setQualityGrade('A')}>{t('mandi.priceCard.qualityA')}</button>
                  <button className={`toggle-btn ${qualityGrade === 'B' ? 'active' : ''}`} onClick={() => setQualityGrade('B')}>{t('mandi.priceCard.qualityB')}</button>
                  <button className={`toggle-btn ${qualityGrade === 'C' ? 'active' : ''}`} onClick={() => setQualityGrade('C')}>{t('mandi.priceCard.qualityC')}</button>
                </div>
              </div>

              <div className="friction-control">
                <label>🚛 {t('mandi.selectors.groundReality.transportLabel')}</label>
                <div className="toggle-group">
                  <button className={`toggle-btn ${transportType === 'own' ? 'active' : ''}`} onClick={() => setTransportType('own')}>{t('mandi.priceCard.transportOwn')}</button>
                  <button className={`toggle-btn ${transportType === 'rent' ? 'active' : ''}`} onClick={() => setTransportType('rent')}>{t('mandi.priceCard.transportRent')}</button>
                </div>
              </div>
            </div>
          </div>

          {/* 📊 True Profit & Loss Engine (CACP Integration) */}
          {cacpObject && displayData.origin.price > 0 && (() => {
            let qualityMultiplier = 1;
            if (qualityGrade === 'A') qualityMultiplier = 1.05;
            if (qualityGrade === 'C') qualityMultiplier = 0.88;
            
            const currentPrice = displayData.origin.price * qualityMultiplier;
            const a2fl = cacpObject.a2fl;
            const c2 = cacpObject.c2;
            const criticalLevel = a2fl * 1.1; // Defined Survival Buffer

            const isLoss = currentPrice < a2fl;
            const isSurvival = currentPrice >= a2fl && currentPrice < c2;
            const isTrueProfit = currentPrice >= c2;
            const isCritical = currentPrice < criticalLevel;
            const trueNetMargin = currentPrice - c2;
            
            const plantedHectares = (harvestQty / cacpObject.yieldHa).toFixed(1);
            
            const localDist = 15;
            const dieselPrice = displayData.dieselRate || 94.12;
            const tractorEfficiency = 8; 
            let localTransportCostPerQ = (localDist * 2 / tractorEfficiency) * dieselPrice / harvestQty;
            if (transportType === 'rent') localTransportCostPerQ *= 2.5;
            
            const totalRevenue = Math.round(currentPrice * harvestQty);
            const totalProductionCost = Math.round(c2 * harvestQty);
            const totalTransportCost = Math.round(localTransportCostPerQ * harvestQty);
            const totalC2Cost = totalProductionCost + totalTransportCost;
            
            const corporateNetProfit = totalRevenue - totalC2Cost;
            const roiPercent = totalC2Cost > 0 ? Math.round((corporateNetProfit / totalC2Cost) * 100) : 0;

            return (
              <div className="cacp-intelligence-card" style={{ 
                border: isCritical ? '3px solid var(--terra-cotta)' : '2px solid var(--forest-green)', 
                position: 'relative',
                background: isCritical ? 'hsla(10, 80%, 50%, 0.05)' : 'var(--glass-bg)',
                transition: 'all 0.3s ease'
              }}>
                {isCritical && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '-12px', 
                    left: '20px', 
                    background: 'var(--terra-cotta)', 
                    color: 'white', 
                    fontSize: '0.7rem', 
                    padding: '2px 10px', 
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 10px rgba(239, 68, 68, 0.4)',
                    zIndex: 5
                  }}>
                    {i18n.language === 'hi' ? '🚨 गंभीर नुकसान चेतावनी' : '🚨 CRITICAL LOSS WARNING'}
                  </div>
                )}
                <div style={{ 
                  position: 'absolute', 
                  top: '-12px', 
                  right: '20px', 
                  background: 'var(--forest-green)', 
                  color: 'white', 
                  fontSize: '0.7rem', 
                  padding: '2px 10px', 
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                  {i18n.language === 'hi' ? 'सरकारी बेंचमार्क (MP)' : 'Govt. Benchmark (MP)'}
                </div>
                <div className="cacp-header-flex">
                  <h2 className="section-heading">
                    💼 {t('mandi.cacp.title', { defaultValue: 'Business Intelligence (True P&L)' })}
                    <InfoTooltip 
                      title={t('mandi.infoTools.cacp.title')}
                      methodology={t('mandi.infoTools.cacp.methodology')}
                      accuracy={t('mandi.infoTools.cacp.accuracy')}
                      limitations={t('mandi.infoTools.cacp.limitations')}
                      source={t('mandi.infoTools.cacp.source')}
                    />
                  </h2>
                    {cacpObject.season && (
                      <span className="season-badge">{cacpObject.season}</span>
                    )}
                  </div>
                  {isCritical && (
                    <button 
                      onClick={() => setShowCriticalModal(true)}
                      style={{ 
                        marginTop: '15px', 
                        width: '100%', 
                        padding: '12px', 
                        background: 'var(--terra-cotta)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '12px', 
                        fontWeight: '900', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        fontSize: '0.9rem',
                        animation: 'pulse-ai 2s infinite'
                      }}
                    >
                      💡 {i18n.language === 'hi' ? 'अब क्या करें? (आपातकालीन योजना)' : 'WHAT TO DO? (EMERGENCY PLAN)'} ➔
                    </button>
                  )}
                
                {/* Break-Even Barometer */}
                <div className="cacp-barometer-section">
                  <div className="barometer-header">
                    <span>{t('mandi.cacp.barometerTitle', { defaultValue: 'True Break-Even Barometer' })}</span>
                    <span className={`barometer-status ${isTrueProfit ? 'profit' : isSurvival ? 'survival' : 'loss'}`}>
                      {isTrueProfit ? t('mandi.cacp.statusProfit', { defaultValue: 'C2 Profitable' }) : isSurvival ? t('mandi.cacp.statusSurvival', { defaultValue: 'A2+FL Survival' }) : t('mandi.cacp.statusLoss', { defaultValue: 'Net Loss' })}
                    </span>
                  </div>
                  
                  <div className="barometer-track">
                     <div className="barometer-fill" style={{ width: `${Math.min(100, (currentPrice / (c2 * 1.5)) * 100)}%`, background: isTrueProfit ? 'var(--forest-green)' : isSurvival ? 'var(--prosperity-gold)' : 'var(--terra-cotta)' }}></div>
                      <div className="barometer-marker a2fl" style={{ left: `${(a2fl / (c2 * 1.5)) * 100}%` }}>
                        <span className="marker-label" style={{ bottom: '20px', background: 'var(--prosperity-gold)', color: 'var(--elite-navy)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem' }}>
                          MIN: ₹{Math.round(a2fl)}
                        </span>
                      </div>
                      <div className="barometer-marker critical" style={{ left: `${(criticalLevel / (c2 * 1.5)) * 100}%`, zIndex: 10 }}>
                        <div style={{ width: '4px', height: '24px', background: 'var(--terra-cotta)', borderRadius: '2px' }}></div>
                        <span className="marker-label" style={{ bottom: '45px', background: 'var(--terra-cotta)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
                          CRITICAL: ₹{Math.round(criticalLevel)}
                        </span>
                      </div>
                      <div className="barometer-marker c2" style={{ left: `${(c2 / (c2 * 1.5)) * 100}%` }}>
                        <span className="marker-label" style={{ top: '20px', background: 'var(--forest-green)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem' }}>
                          BREAKEVEN: ₹{Math.round(c2)}
                        </span>
                      </div>
                  </div>
                  <p className="cacp-insight">
                    {isTrueProfit 
                      ? t('mandi.cacp.adviceHold', { price: `₹${Math.round(currentPrice)}`, margin: `+₹${Math.round(trueNetMargin)}`, defaultValue: `At ₹${Math.round(currentPrice)}/q, you cover all comprehensive costs (C2) with a net margin of +₹${Math.round(trueNetMargin)}/q.` })
                      : isSurvival
                      ? t('mandi.cacp.adviceSurvival', { price: `₹${Math.round(currentPrice)}`, c2: `₹${Math.round(c2)}`, defaultValue: `At ₹${Math.round(currentPrice)}/q, you cover cash costs but fail to meet your C2 Comprehensive Cost (₹${Math.round(c2)}). You are subsidizing the market with family labor. ⚠️ HOLD.` })
                      : t('mandi.cacp.adviceLoss', { price: `₹${Math.round(currentPrice)}`, a2fl: `₹${Math.round(a2fl)}`, defaultValue: `At ₹${Math.round(currentPrice)}/q, you are below exact A2+FL survival costs (₹${Math.round(a2fl)}). Extreme Loss Warning.` })
                    }
                  </p>
                </div>

                {/* Zero-Effort Corporate P&L Statement */}
                <div className="cacp-corporate-pl">
                  <div className="pl-header">
                     <span>📉 {t('mandi.cacp.plTitle')}</span>
                     <span className="pl-area">{t('mandi.cacp.estArea', { area: plantedHectares })}</span>
                  </div>
                  <div className="pl-grid">
                    <div className="pl-row">
                      <span>{t('mandi.cacp.grossRevenue', { defaultValue: 'Gross Revenue' })} ({harvestQty}q)</span>
                      <span className="val-positive">₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="pl-row">
                      <span>{t('mandi.cacp.productionCost', { defaultValue: 'Production Cost' })} ({selectedState})</span>
                      <span className="val-negative">-₹{totalProductionCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pl-row">
                      <span>{t('mandi.cacp.transportCost', { defaultValue: 'Local Transport' })} ({transportType === 'rent' ? t('mandi.priceCard.transportRent') : t('mandi.priceCard.transportOwn')})</span>
                      <span className="val-negative">-₹{totalTransportCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pl-divider"></div>
                    <div className={`pl-row net-row ${corporateNetProfit >= 0 ? 'profit' : 'loss'}`}>
                      <span>{t('mandi.cacp.netCorporateProfit')}</span>
                      <span className="net-profit-val">
                        {corporateNetProfit >= 0 ? '+' : '-'}₹{Math.abs(corporateNetProfit).toLocaleString('en-IN')} 
                        <span className="roi-badge">
                          {corporateNetProfit >= 0 ? '+' : '-'}{roiPercent}% {t('mandi.cacp.roi')}
                        </span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Economics Educational Button */}
                  <button className="learn-economics-btn" onClick={() => setShowEduModal(true)}>
                    {t('mandi.cacp.learnEconomicsBtn')}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* 🌦️ Weather-Price Intelligence Card */}
          {weather && (() => {
            const spoilage = getSpoilageRisk(weather, selectedCommodity);
            const priceImpact = getWeatherPriceImpact(weather, selectedCommodity);
            const sellAdvice = getSellTimingAdvice(weather, spoilage, selectedCommodity, displayData.origin.price, trendData);
            return (
              <div className="weather-intelligence-card">
                <h2 className="section-heading">
                  🌦️ {t('mandi.weather.title')}
                  <InfoTooltip 
                    title={t('mandi.infoTools.weather.title', { defaultValue: i18n.language === 'hi' ? 'मौसम और मंडी भाव का मेल' : 'Weather & Price Biology' })}
                    methodology={t('mandi.infoTools.weather.methodology', { defaultValue: 'Integrates IMD local weather with crop spoilage biology to predict short-term holding feasibility and price impact.' })}
                    accuracy={t('mandi.infoTools.weather.accuracy', { defaultValue: 'Short-term weather is typically > 90% accurate; crop biology impact is generalized.' })}
                    limitations={t('mandi.infoTools.weather.limitations', { defaultValue: 'Does not account for local indoor storage capabilities or micro-climates.' })}
                    source={t('mandi.infoTools.weather.source', { defaultValue: 'OpenWeather API & KisanBaba Spoilage Matrix' })}
                  />
                </h2>
                <div className="weather-grid">
                  {/* Current Weather */}
                  <div className="weather-current">
                    <div className="weather-icon-big">{weather.icon}</div>
                    <div className="weather-stats">
                      <div className="weather-temp">{weather.temp}°C</div>
                      <div className="weather-desc">{weather.description}</div>
                      <div className="weather-details">
                        <span>💧 {weather.humidity}%</span>
                        <span>💨 {weather.windSpeed} km/h</span>
                        {weather.rainfall > 0 && <span>🌧️ {weather.rainfall}mm</span>}
                      </div>
                    </div>
                  </div>

                  {/* Price Impact */}
                  <div className={`weather-impact-box impact-${priceImpact.direction}`}>
                    <div className="impact-header">
                      <span className="impact-badge">{t(`mandi.weather.impactLabels.${priceImpact.impactKey}`)}</span>
                      {priceImpact.pctImpact > 0 && (
                        <span className={`impact-pct ${priceImpact.direction}`}>
                          {priceImpact.direction === 'up' ? '📈' : '📉'} {priceImpact.pctImpact}%
                        </span>
                      )}
                    </div>
                    <p className="impact-explanation">{priceImpact.explanation}</p>
                  </div>

                  {/* Spoilage Risk Meter */}
                  <div className="spoilage-meter">
                    <div className="spoilage-header">
                      <span>🫙 {t('mandi.weather.spoilage')} — {i18n.language === 'hi' ? (availableCommodities.find(c => c.name === selectedCommodity)?.nameHi || selectedCommodity) : selectedCommodity}</span>
                      <span className="spoilage-label">{t(`mandi.weather.riskLabels.${spoilage.riskKey}`)}</span>
                    </div>
                    <div className="spoilage-bar-track">
                      <div 
                        className={`spoilage-bar-fill risk-${spoilage.riskLevel >= 70 ? 'high' : spoilage.riskLevel >= 40 ? 'moderate' : 'low'}`}
                        style={{ width: `${spoilage.riskLevel}%` }}
                      />
                    </div>
                    <p className="spoilage-advice">{t(`mandi.weather.advice.${spoilage.adviceKey}`, { temp: weather.temp, humidity: weather.humidity })}</p>
                  </div>

                  {/* Sell Timing Advisor */}
                  <div className={`sell-timing-card urgency-${sellAdvice.urgency}`}>
                    <div className="sell-timing-header">
                      <span className="sell-emoji">{sellAdvice.emoji}</span>
                      <span className="sell-action">{t(`mandi.sellAdvice.actions.${sellAdvice.actionKey}`)}</span>
                    </div>
                    <p className="sell-reason">{t(`mandi.sellAdvice.logic.${sellAdvice.logicKeys[0].key}`, sellAdvice.logicKeys[0].params)}</p>
                  </div>
                </div>

                {/* Mentor Logic Explorer (World Class Mentorship) */}
                {sellAdvice.logicKeys && (
                  <div className="advice-logic-explorer">
                    <div className="logic-header">
                      <span className="logic-icon">💡</span>
                      <div className="logic-titles">
                        <h3>{t('mandi.weather.logicTitle')}</h3>
                        <p>{t('mandi.weather.reasoning')}</p>
                      </div>
                    </div>
                    <div className="logic-grid">
                      {sellAdvice.logicKeys.map((item, idx) => (
                        <div key={idx} className="logic-step">
                          <span className="step-num">{idx + 1}</span>
                          <p>{t(`mandi.sellAdvice.logic.${item.key}`, item.params)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weather Educational Button - "Business Card" Footer Style */}
                <button className="learn-weather-btn" onClick={() => setShowWeatherEdu(true)} style={{
                  width: 'calc(100% + 40px)', // Flush to card edges (card has 20px padding)
                  margin: '15px -20px -20px -20px',
                  padding: '14px',
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: 'none',
                  borderTop: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: '0 0 16px 16px',
                  color: '#38bdf8',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s'
                }}>
                  📖 {t('mandi.weather.eduModal.title', { defaultValue: 'Weather & Market Guide' })}
                </button>
              </div>
            );
          })()}

          {/* Adjoining District Arbitrage Cards */}
          <div className="arbitrage-section">
            <h2 className="section-heading">
              🏪 {t('mandi.arbitrage.title')}
              <InfoTooltip 
                title={t('mandi.infoTools.arbitrage.title')}
                methodology={t('mandi.infoTools.arbitrage.methodology')}
                accuracy={t('mandi.infoTools.arbitrage.accuracy')}
                limitations={t('mandi.infoTools.arbitrage.limitations')}
                source={t('mandi.infoTools.arbitrage.source')}
              />
            </h2>
            <div className="arbitrage-grid">
              {displayData.neighbors.length === 0 && (
                <div className="no-neighbors">No adjoining districts found within 150km radius.</div>
              )}
              {displayData.neighbors.map((neighbor, i) => {
                let adjustedTransFactor = neighbor.transport_factor;
                if (transportType === 'rent') adjustedTransFactor *= 2.5; // Rental is much more expensive
                
                // Adjust neighbor price based on user's quality
                let neighborTargetPrice = neighbor.price;
                if (qualityGrade === 'A') neighborTargetPrice *= 1.05;
                if (qualityGrade === 'C') neighborTargetPrice *= 0.88;
                
                // Recalculate price diff with adjusted target price vs adjusted origin price
                let originCurrentPrice = displayData.origin.price;
                if (qualityGrade === 'A') originCurrentPrice *= 1.05;
                if (qualityGrade === 'C') originCurrentPrice *= 0.88;
                
                const adjustedDiff = neighborTargetPrice - originCurrentPrice;

                // Generate a clean target parameter strictly using the District structure for translation verbablity
                // Fix double "Mandi Mandi" by ensuring we just use the clean name
                const cleanTargetMarket = neighbor.market && neighbor.market.toLowerCase() !== neighbor.district.toLowerCase() 
                    ? (neighbor.market.toLowerCase().includes('mandi') ? neighbor.market : `${neighbor.market} Mandi`) 
                    : neighbor.district;

                const arb = calculateArbitrageProfit(
                  adjustedDiff, harvestQty, neighbor.distance_km, adjustedTransFactor, `${neighbor.district} Mandi`, i18n.language
                );
                return (
                  <div key={i} className={`arbitrage-card ${arb.isWorthIt ? 'worth-it' : 'not-worth'}`}>
                    <div className="arb-card-header">
                      <div className="arb-main-info">
                        <h3>{t(`geography.districts.${neighbor.district}`, { defaultValue: neighbor.district })} {neighbor.market && neighbor.market.toLowerCase() !== neighbor.district.toLowerCase() ? `(${neighbor.market.toLowerCase().includes('mandi') ? neighbor.market : neighbor.market + ' ' + t('mandi.priceCard.mandiSuffix')})` : ''}</h3>
                        <div className="arb-state-district-tags">
                          <span className="arb-state-tag">{t(`geography.states.${neighbor.state}`, { defaultValue: neighbor.state })}</span>
                        </div>
                      </div>
                      <div className="arb-distance-badge">📏 {neighbor.distance_km} km</div>
                    </div>
                    
                    <div className="arb-pricing-grid">
                      <div className="price-box">
                        <span className="pb-label">{t('mandi.priceCard.modal')}</span>
                        <span className="pb-value">₹{Math.round(neighbor.price)?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="price-box">
                        <span className="pb-label">{t('mandi.priceCard.min')}</span>
                        <span className="pb-value">₹{Math.round(neighbor.minPrice)?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="price-box">
                        <span className="pb-label">{t('mandi.priceCard.max')}</span>
                        <span className="pb-value">₹{Math.round(neighbor.maxPrice)?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="arb-status-row">
                      <div className={`arb-gap ${adjustedDiff >= 0 ? 'positive' : 'negative'}`}>
                        {adjustedDiff >= 0 ? '▲' : '▼'} ₹{Math.abs(Math.round(adjustedDiff))} {t('mandi.arbitrage.gap')}
                      </div>
                      <div className="arb-update-date">🕒 {neighbor.date || 'Live'} </div>
                    </div>

                    <div className="arb-financials">
                      <div className="fin-row">
                        <span>{t('mandi.arbitrage.extraEarning')}</span>
                        <span className={arb.grossProfit >= 0 ? 'text-green' : 'text-red'}>
                          {arb.grossProfit >= 0 ? '+' : '-'}₹{Math.abs(arb.grossProfit).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="fin-row">
                        <span>{t('mandi.arbitrage.transportCost')}</span>
                        <span className="text-red">-₹{arb.transportCost.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="fin-divider"></div>
                      <div className={`fin-row net-row ${arb.isWorth_it ? 'profit' : 'loss'}`}>
                        <span>{t('mandi.arbitrage.netProfit')}</span>
                        <span className="net-profit-val">₹{arb.netProfit.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className={`arb-verdict-banner ${arb.isWorthIt ? 'success' : 'fail'}`}>
                      <span className="arb-empowerment-text">
                        {t(arb.empowermentKey, arb.empowermentParams)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 30-Day Trend Chart */}
          {trendData.length > 0 && (
            <div className="trend-section">
              <div className="trend-header-row">
                <h2 className="section-heading">
                  📊 {t('mandi.trend.title')} — {i18n.language === 'hi' ? (commodities.find(c => c.name === selectedCommodity)?.nameHi || selectedCommodity) : selectedCommodity} in {displayData.origin.market && !displayData.origin.market.toLowerCase().includes('unknown') && displayData.origin.market.toLowerCase() !== selectedDistrict.toLowerCase() ? `${displayData.origin.market} ${t('mandi.priceCard.mandiSuffix', { defaultValue: 'Mandi' })}` : (i18n.language === 'hi' ? (geoTranslations.districts[selectedDistrict] || selectedDistrict) : selectedDistrict)}
                  <InfoTooltip 
                    title={t('mandi.infoTools.trend.title')}
                    methodology={t('mandi.infoTools.trend.methodology')}
                    accuracy={t('mandi.infoTools.trend.accuracy')}
                    limitations={t('mandi.infoTools.trend.limitations')}
                    source={t('mandi.infoTools.trend.source')}
                  />
                </h2>
                <span className={`data-source-badge ${trendData[0]?.isReal ? 'real' : 'simulated'}`}>
                  {trendData[0]?.isReal ? `✅ ${t('mandi.trend.realData')}` : `📐 ${t('mandi.trend.estimate')}`}
                </span>
              </div>
              <p className="trend-subtitle">
                {trendData[0]?.isReal 
                  ? t('mandi.trend.realSubtitle', { count: trendData.length })
                  : t('mandi.trend.simSubtitle')}
              </p>
              <div className="trend-chart-container">
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={trendData} margin={{ top: 20, right: 40, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#047857" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#047857" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    
                    {/* Primary Y-Axis (Price) */}
                    <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 10, fill: '#10b981' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} tickFormatter={v => `₹${v}`} />
                    
                    {/* Secondary Y-Axis (Arrival Volume) */}
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#f59e0b' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} tickFormatter={v => `${v}t`} />
                    
                    <Tooltip 
                      contentStyle={{ background: 'rgba(15,23,42,0.95)', border: 'none', borderRadius: '16px', color: '#f8fafc', padding: '15px', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
                      formatter={(v, name) => {
                        if (name === 'price') return [`₹${Math.round(v).toLocaleString('en-IN')}/q`, i18n.language === 'hi' ? 'बाजार भाव' : 'Market Price'];
                        return [`${v} Tonnes`, i18n.language === 'hi' ? 'आवक (सप्लाई)' : 'Arrival (Supply)'];
                      }}
                    />
                    
                    {/* Bars for Arrival Volume */}
                    <Bar yAxisId="right" dataKey="arrival" fill="#f59e0b" fillOpacity={0.15} radius={[4, 4, 0, 0]} barSize={20} />
                    
                    {/* Area for Price Trend */}
                    <Area yAxisId="left" type="monotone" dataKey="price" stroke="#047857" strokeWidth={4} fill="url(#trendGradient)" dot={false} activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="trend-momentum-badge">
                <span className={`momentum-icon ${trendData[trendData.length-1].price >= trendData[0].price ? 'up' : 'down'}`}>
                   {trendData[trendData.length-1].price >= trendData[0].price ? '📈' : '📉'}
                </span>
                {t('mandi.trend.momentum')}: {trendData[trendData.length-1].price >= trendData[0].price ? t('mandi.trend.bullish') : t('mandi.trend.bearish')}
              </div>
            </div>
          )}

          {/* Live News Section */}
          {news.length > 0 && (
            <div className="news-tracker-section">
              <h2 className="section-heading">🗞️ {t('mandi.news.title')}</h2>
              <div className="news-scroll">
                {news.map((item, i) => (
                  <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="news-card">
                    <div className="news-date">{item.date}</div>
                    <h3 className="news-title">{item.title}</h3>
                    <p className="news-desc">{item.description}</p>
                    <div className="news-footer">{t('mandi.news.source')}: {item.source}</div>
                  </a>
                ))}
              </div>
            </div>
          )}

        </>
      )}

      <div className="internal-linking-section" style={{ marginTop: '50px', padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }}>
         <h3 style={{ marginBottom: '20px' }}>📖 {i18n.language === 'hi' ? `${selectedCommodity} के बारे में और जानें` : `Master ${selectedCommodity} Cultivation`}</h3>
         <div className="link-pills" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
           <button className="link-pill">🌱 {i18n.language === 'hi' ? 'खाद कैलकुलेटर' : 'Fertilizer Calculator'}</button>
           <button className="link-pill">🚜 {i18n.language === 'hi' ? 'आधुनिक खेती गाइड' : 'Modern Farming Guide'}</button>
           <button className="link-pill">🌧️ {i18n.language === 'hi' ? 'मौसम रडार' : 'Weather Radar'}</button>
         </div>
      </div>
      

      {/* Full Screen Mandi Economics Educational Modal */}
      {showEduModal && (
        <div className="edu-modal-overlay" onClick={() => setShowEduModal(false)}>
          <div className="edu-modal-content" onClick={e => e.stopPropagation()}>
            <div className="edu-modal-header">
              <h2>📖 {t('mandi.cacp.eduModal.title')}</h2>
              <button className="close-btn" onClick={() => setShowEduModal(false)}>×</button>
            </div>
            
            <div className="edu-modal-body">
              <div className="edu-concept-card">
                <h3>{t('mandi.cacp.eduModal.a2_title')}</h3>
                <p>{t('mandi.cacp.eduModal.a2_desc')}</p>
              </div>

              <div className="edu-concept-card">
                <h3>{t('mandi.cacp.eduModal.a2fl_title')}</h3>
                <p>{t('mandi.cacp.eduModal.a2fl_desc')}</p>
              </div>

              <div className="edu-concept-card highlight">
                <h3>{t('mandi.cacp.eduModal.c2_title')}</h3>
                <p>{t('mandi.cacp.eduModal.c2_desc')}</p>
              </div>

              <div className="edu-concept-card">
                <h3>{t('mandi.cacp.eduModal.msp_title')}</h3>
                <p>{t('mandi.cacp.eduModal.msp_desc')}</p>
              </div>
            </div>

            <button className="action-btn w-full" onClick={() => setShowEduModal(false)} style={{marginTop: '20px'}}>
              {t('mandi.cacp.eduModal.close')}
            </button>
          </div>
        </div>
      )}

      {/* 🚨 Critical Strategy Modal (Emergency Plan) */}
      {showCriticalModal && (
        <div className="edu-modal-overlay" onClick={() => setShowCriticalModal(false)}>
          <div className="edu-modal-content rural-modal" onClick={e => e.stopPropagation()} style={{ borderTop: '8px solid var(--terra-cotta)', maxWidth: '600px' }}>
            <div className="edu-modal-header">
              <h2>🚨 {i18n.language === 'hi' ? 'आपातकालीन रणनीति: गंभीर नुकसान से बचें' : 'Emergency Strategy: Avoid Critical Loss'}</h2>
              <button className="close-btn" onClick={() => setShowCriticalModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ background: 'hsla(10, 80%, 50%, 0.1)', padding: '15px', borderRadius: '12px', border: '1px solid var(--terra-cotta)', marginBottom: '20px' }}>
                 <h3 style={{ color: 'var(--terra-cotta)', marginTop: 0 }}>{i18n.language === 'hi' ? 'यह खतरनाक स्थिति क्यों है?' : 'Why is this a Danger Zone?'}</h3>
                 <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>
                   {i18n.language === 'hi' 
                     ? 'वर्तमान मंडी भाव आपकी "A2+FL" (नकद खर्च) लागत के बहुत करीब है। इसका मतलब है कि आप अपनी मेहनत (पारिवारिक श्रम) और जमीन के किराए का मूल्य खो रहे हैं।' 
                     : 'The current Mandi rate is dangerously close to your "A2+FL" (Cash Expense) cost. This means you are losing the value of your own family labor and land interest.'}
                 </p>
              </div>

              <h4>🛠️ {i18n.language === 'hi' ? 'आपकी आपातकालीन कार्य योजना (Action Plan)' : 'Your Emergency Action Plan'}</h4>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px', listStyleType: 'none' }}>
                <li style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                  <strong>📍 {i18n.language === 'hi' ? 'आर्बिट्राज (Arbitrage) देखें:' : 'Check Arbitrage:'}</strong> 
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
                    {i18n.language === 'hi' ? 'ऊपर दिए गए "नज़दीकी मंडी" कार्ड देखें। क्या 50-100 किमी दूर बेहतर दर मिल रही है?' : 'Check the "Nearby Mandis" cards above. Is there a better rate 50-100km away?'}
                  </p>
                </li>
                <li style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                  <strong>⏳ {i18n.language === 'hi' ? 'इंतज़ार करें (Wait):' : 'Wait & Hold:'}</strong> 
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
                    {i18n.language === 'hi' ? 'यदि आपकी फसल खराब होने वाली नहीं है, तो 7-10 दिन रुकें। आवक कम होने पर भाव बढ़ सकते हैं।' : 'If your crop is not highly perishable, wait for 7-10 days. Rates often recover once the peak arrival surge ends.'}
                  </p>
                </li>
                <li style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                  <strong>🏛️ {i18n.language === 'hi' ? 'सरकारी खरीद (Procurement):' : 'Government Support:'}</strong> 
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
                    {i18n.language === 'hi' ? 'नज़दीकी सहकारी समिति या सरकारी खरीद केंद्र (MSP Center) पर भाव पता करें।' : 'Check for local cooperatives or Government MSP procurement centers (if applicable).'}
                  </p>
                </li>
              </ul>

              <div style={{ marginTop: '25px', padding: '15px', background: 'var(--elite-navy)', color: 'white', borderRadius: '12px', fontSize: '0.85rem' }}>
                <strong>{i18n.language === 'hi' ? 'याद रखें:' : 'Remember:'}</strong> {i18n.language === 'hi' ? 'भाव आपके नियंत्रण में नहीं हैं, लेकिन बिक्री का समय और स्थान आपके हाथ में है।' : 'Price is not in your control, but the time and place of sale are your decisions.'}
              </div>
            </div>
            <button className="huge-button" onClick={() => setShowCriticalModal(false)} style={{ background: 'var(--terra-cotta)', marginTop: '20px', width: '100%', padding: '15px', fontSize: '1rem' }}>
              {i18n.language === 'hi' ? 'समझ गया, वापस जाएँ' : 'Understood, Go Back'}
            </button>
          </div>
        </div>
      )}

      {/* 🌦️ Weather Intelligence Guide Modal */}
      {showWeatherEdu && (
        <div className="edu-modal-overlay" onClick={() => setShowWeatherEdu(false)}>
          <div className="edu-modal-content" onClick={e => e.stopPropagation()}>
            <div className="edu-modal-header">
              <h2>🌦️ {t('mandi.weather.eduModal.title')}</h2>
              <button className="close-btn" onClick={() => setShowWeatherEdu(false)}>×</button>
            </div>
            <div className="edu-modal-body">
              <div className="edu-section">
                <h3>{t('mandi.weather.eduModal.impact_title')}</h3>
                <p>{t('mandi.weather.eduModal.impact_desc')}</p>
              </div>
              <div className="edu-section">
                <h3>{t('mandi.weather.eduModal.spoilage_title')}</h3>
                <p>{t('mandi.weather.eduModal.spoilage_desc')}</p>
              </div>
              <div className="edu-section">
                <h3>{t('mandi.weather.eduModal.logic_title')}</h3>
                <p>{t('mandi.weather.eduModal.logic_desc')}</p>
              </div>
            </div>
            <button className="action-btn w-full" onClick={() => setShowWeatherEdu(false)} style={{marginTop: '20px', background: '#38bdf8'}}>
              {t('mandi.weather.eduModal.close')}
            </button>
          </div>
        </div>
      )}

      {/* 🛡️ Real-time Mandi Integrity Activity Modal */}
      {showReportsModal && (
        <div className="edu-modal-overlay" onClick={() => setShowReportsModal(false)}>
          <div className="edu-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="edu-modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>
                🛡️ {selectedDistrict} {t('footer.report.recent_title', { defaultValue: 'Activity Feed' })}
              </h2>
              <button className="close-btn" onClick={() => setShowReportsModal(false)}>×</button>
            </div>
            
            <div className="edu-modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '5px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentReports.map(report => (
                  <div key={report.id} style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    padding: '12px', 
                    borderRadius: '12px',
                    borderLeft: `4px solid ${report.reportType === 'low_price' ? 'var(--terra-cotta)' : report.reportType === 'closed' ? '#64748b' : 'var(--prosperity-gold)'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <strong style={{ fontSize: '0.9rem' }}>{report.userName}</strong>
                      <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{report.timeAgo} {t('mandi.priceCard.ago', { defaultValue: 'ago' })}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: report.reportType === 'low_price' ? 'var(--terra-cotta)' : 'inherit' }}>
                        {t(`footer.report.categories.${report.reportType}`)}
                      </span> 
                      • {i18n.language === 'hi' ? (commodities.find(c => c.name === report.commodity)?.nameHi || report.commodity) : report.commodity}
                      {report.verified && (
                        <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          ✓ {t('footer.report.verified_tag', { defaultValue: 'Verified' })}
                        </span>
                      )}
                    </div>
                    {report.gap && (
                       <div style={{ 
                         marginTop: '8px', 
                         padding: '8px', 
                         background: 'rgba(239, 68, 68, 0.05)', 
                         borderRadius: '6px', 
                         fontSize: '0.8rem',
                         color: '#f87171',
                         border: '1px dashed rgba(239, 68, 68, 0.2)'
                       }}>
                         ⚠️ {t('footer.report.gap_message', { name: report.userName, gap: report.gap })}
                       </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button className="action-btn w-full" onClick={() => setShowReportsModal(false)} style={{marginTop: '20px', background: 'var(--forest-green)'}}>
              {t('mandi.cacp.eduModal.close')}
            </button>
          </div>
        </div>
      )}

      {/* 🚀 Advanced Intelligence Layer (Slide-up Bottom Sheet) */}
      <IntelligenceDrawer
        isOpen={intelDrawerOpen}
        onClose={() => setIntelDrawerOpen(false)}
        commodity={selectedCommodity}
        localPrice={dashboardData?.origin?.price || 0}
        state={selectedState}
        district={selectedDistrict}
        trendData={trendData}
      />
    </div>
  );
}
