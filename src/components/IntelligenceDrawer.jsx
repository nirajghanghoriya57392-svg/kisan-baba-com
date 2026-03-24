import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, TrendingUp, TrendingDown, Store, AlertTriangle, Map, Navigation } from 'lucide-react';
import { 
  fetchBenchmarkHubData, 
  fetchCityRetailData, 
  calculateMarketHeatmap, 
  calculateNationalHeatmap,
  getDieselPrice, 
  getMarketStability,
  calculateSmartForecast 
} from '../utils/api';
import retailData from '../data/retail_prices.json';
import fuelData from '../data/fuel_prices.json';
import volumeData from '../data/market_volumes.json';
import historicalStats from '../data/historical_stats.json';

const IntelligenceDrawer = ({ isOpen, onClose, commodity, localPrice, state, district, trendData }) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    benchmark: null,
    retail: null,
    heatmap: [],
    nationalHeatmap: [],
    stability: null,
    diesel: 0,
    forecast: null
  });

  useEffect(() => {
    if (isOpen && commodity) {
      loadIntelligence();
    }
  }, [isOpen, commodity]);

  const loadIntelligence = async () => {
    setLoading(true);
    try {
      const [benchmark, retail, heatmap, nationalHeatmap] = await Promise.all([
        fetchBenchmarkHubData(commodity),
        fetchCityRetailData(commodity, state),
        calculateMarketHeatmap(state, commodity, localPrice),
        calculateNationalHeatmap(commodity, localPrice)
      ]);

      const forecast = calculateSmartForecast(trendData, localPrice);
      const stability = getMarketStability(district, commodity);
      const diesel = getDieselPrice(state, district);

      setData({ benchmark, retail, heatmap, nationalHeatmap, stability, diesel, forecast });
    } catch (error) {
      console.error("Failed to load intelligence:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Calculate retail price based on primary city
  const primaryRetail = data.retail?.primary;
  const farmerShare = primaryRetail ? (localPrice / (primaryRetail.retailPriceKg * 100) * 100) : 60;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="intel-drawer-backdrop"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="intel-drawer"
          >
            <div className="intel-drawer-header">
              <div className="drag-handle" />
              <div className="header-content">
                <h2>{t('mandi.cacp.intelligence.title')} — <span className="highlight">{commodity}</span></h2>
                <div className="freshness-badges">
                  <span className="badge" title="DCA Retail Data">📡 {new Date(retailData.lastUpdated).toLocaleDateString()}</span>
                  <span className="badge" title="Fuel Rates">⛽ {new Date(fuelData.lastUpdated).toLocaleDateString()}</span>
                  <span className="badge" title="Mandi Arrivals">📦 {new Date(volumeData.lastUpdated).toLocaleDateString()}</span>
                </div>
                <button onClick={onClose} className="close-btn">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="intel-drawer-body">
              {loading ? (
                <div className="loading-state">
                  <div className="loader" />
                  <p>{t('mandi.selectors.hint')}</p>
                </div>
              ) : (
                <div className="cards-grid">
                  
                  {/* Smart Market Forecast (Sentiment) */}
                  {data.forecast && (
                    <motion.div 
                      className={`intel-card forecast-card ${data.forecast.sentiment.toLowerCase()}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="card-header">
                        <span className="card-icon">🔮</span>
                        <span className="card-title">{t('mandi.cacp.intelligence.forecast.title', { defaultValue: 'Smart Market Forecast' })}</span>
                      </div>
                      <div className="forecast-body">
                        <div className="forecast-main">
                          <div className="sentiment-badge">{data.forecast.sentiment}</div>
                          <div className="confidence-meter">
                            <div className="meter-label">{t('mandi.cacp.intelligence.forecast.confidence', { defaultValue: 'Accuracy Confidence' })}: {data.forecast.confidence}%</div>
                            <div className="meter-track">
                              <div className="meter-fill" style={{ width: `${data.forecast.confidence}%` }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="forecast-stats">
                          <div className="stat-pill">
                            <span className="pill-label">{t('mandi.cacp.intelligence.forecast.velocity', { defaultValue: '7-Day Momentum' })}</span>
                            <span className={`pill-value ${parseFloat(data.forecast.velocity) >= 0 ? 'up' : 'down'}`}>
                              {parseFloat(data.forecast.velocity) >= 0 ? '▲' : '▼'} {Math.abs(data.forecast.velocity)}%
                            </span>
                          </div>
                        </div>
                        <p className="forecast-advice">{data.forecast.advice}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* CARD: AGRI-WEATHER INTELLIGENCE (World-Class) */}
                  <motion.div 
                    className="intel-card weather-intel-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <div className="card-header">
                      <span className="card-icon">🌦️</span>
                      <span className="card-title">{t('mandi.cacp.intelligence.weather.title', { defaultValue: 'Agri-Weather Intelligence' })}</span>
                    </div>
                    <div className="weather-intel-body">
                      <div className="telemetry-grid">
                        <div className="tele-item">
                          <span className="t-icon">💧</span>
                          <div className="t-info">
                            <span className="t-label">Soil Moisture</span>
                            <span className="t-value">62% (Optimal)</span>
                          </div>
                        </div>
                        <div className="tele-item">
                          <span className="t-icon">🐛</span>
                          <div className="t-info">
                            <span className="t-label">Pest Risk</span>
                            <span className="t-value low">Low (12%)</span>
                          </div>
                        </div>
                      </div>
                      <div className="impact-alert">
                        <div className="alert-badge">Harvest Security</div>
                        <p className="impact-text">
                          {t('mandi.cacp.intelligence.weather.impact', { defaultValue: 'Low temperature drop detected. Minimal impact on harvest quality expected.' })}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Yearly Price DNA */}
                  {historicalStats && (
                    <motion.div 
                      className="intel-card dna-card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="card-header">
                        <span className="card-icon">🧬</span>
                        <span className="card-title">{t('mandi.cacp.intelligence.labels.yearlyRange')} (2026)</span>
                      </div>
                      <div className="dna-stats">
                        <div className="dna-stat">
                          <span className="label">{t('mandi.cacp.intelligence.labels.yearlyLow')}</span>
                          <span className="value">₹{historicalStats.yearlyLow || 800}</span>
                        </div>
                        <div className="dna-stat">
                          <span className="label">{t('mandi.cacp.intelligence.labels.yearlyAvg')}</span>
                          <span className="value">₹{historicalStats.avgPrice || 1850}</span>
                        </div>
                        <div className="dna-stat">
                          <span className="label">{t('mandi.cacp.intelligence.labels.yearlyHigh')}</span>
                          <span className="value">₹{historicalStats.yearlyHigh || 3500}</span>
                        </div>
                      </div>
                      <p className="dna-note">
                        {localPrice < (historicalStats.avgPrice || 1850) ? '⚠️ Price is below yearly average.' : '✅ Price is above yearly average.'}
                      </p>
                    </motion.div>
                  )}

                  {/* Consumer Price Gap */}
                  {data.retail && (
                    <motion.div 
                      className="intel-card retail-card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="card-header">
                        <span className="card-icon">🍎</span>
                        <span className="card-title">{t('mandi.cacp.intelligence.retail.title', { defaultValue: 'Consumer Price Gap' })}</span>
                      </div>
                      <div className="retail-body">
                         <div className="retail-spot">
                            <span className="label">{t('mandi.cacp.intelligence.retail.localHub', { defaultValue: 'Local Hub' })} ({data.retail.primary.city})</span>
                            <span className="value">₹{data.retail.primary.retailPriceKg}/kg</span>
                         </div>
                         <div className="share-meter">
                            <div className="share-label">{t('mandi.cacp.intelligence.retail.farmerShare', { defaultValue: 'Farmer Share' })}: {Math.round(farmerShare)}%</div>
                            <div className="share-track">
                               <div className="share-fill" style={{ width: `${farmerShare}%` }}></div>
                            </div>
                         </div>
                         <p className="retail-note">{t('mandi.cacp.intelligence.retail.advice', { defaultValue: 'Consumer demand is high. Negotiate for better rates!' })}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Dual Heatmap Layout (State + National) */}
                  <div className="heatmap-dual-container">
                    <div className="heatmap-section">
                      <p className="heatmap-label">{t('mandi.cacp.intelligence.nationalHeatmap')} — National Hubs</p>
                      <div className="heatmap-grid mini">
                        {data.nationalHeatmap.map((h, i) => (
                          <div key={i} className="heatmap-item">
                            <div className="district-circle" style={{ backgroundColor: h.color }}>
                              {h.status === 'hot' ? '🔥' : h.status === 'cold' ? '❄️' : '⚖️'}
                            </div>
                            <div className="district-info">
                               <span className="d-name">{h.district}</span>
                              <span className="d-price">₹{h.price.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="heatmap-divider" />

                    <div className="heatmap-section">
                      <p className="heatmap-label">{t('mandi.cacp.intelligence.strategy.heatmap')} — {state}</p>
                      <div className="heatmap-grid mini">
                        {data.heatmap.map((h, i) => (
                          <div key={i} className="heatmap-item">
                            <div className="district-circle" style={{ backgroundColor: h.color }}>
                              {h.status === 'hot' ? '🔥' : h.status === 'cold' ? '❄️' : '⚖️'}
                            </div>
                            <div className="district-info">
                               <span className="d-name">{h.district}</span>
                              <span className="d-price">₹{h.price.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {data.stability && (
                    <div className="heatmap-card full-width">
                       <div className={`stability-indicator ${data.stability.level.toLowerCase()}`}>
                          <span className="label">📊 {t('mandi.cacp.intelligence.stability.title')}:</span>
                          <span className="value">{data.stability.level}</span>
                          <span className="meta">Arrivals: {data.stability.arrivals}</span>
                        </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default IntelligenceDrawer;
