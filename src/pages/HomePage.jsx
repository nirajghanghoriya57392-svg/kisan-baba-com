import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { 
  Mic, 
  BarChart2, 
  CloudSun, 
  Heart, 
  Calculator, 
  Stethoscope, 
  FileText, 
  PawPrint, 
  Rss, 
  ArrowRight,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  Building2
} from 'lucide-react';
import cropsData from '../data/crops.json';
import { fetchMandiRates, fetchWeatherAlerts } from '../utils/api';
import SuccessStories from '../components/SuccessStories';
import './HomePage.css';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [micText, setMicText] = useState("Tap and tell us what you need...");
  const [mandiData, setMandiData] = useState([]);
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    async function loadDashboards() {
       // Mocking specific user data for attractive home page
       const mockMandi = [
         { id: 1, commodity: t('crops.tomato.name') || 'Tomato', price: 1827, change: 37, trend: 'up' },
         { id: 2, commodity: 'Onion', price: 1527, change: 38, trend: 'up' },
         { id: 3, commodity: 'Potato', price: 927, change: 39, trend: 'up' },
         { id: 4, commodity: 'Paddy (Dhan)', price: 2127, change: 40, trend: 'up' }
       ];
       setMandiData(mockMandi);

       // Mocking specific weather data
       setWeatherData({
         temp: 28,
         location: t('home.weather.location'),
         icon: '⛅',
         alertText: t('home.weather.alertHeader'),
         actionableAdvice: i18n.language === 'hi' 
           ? "आज अपनी कटी हुई फसल को खुले में न छोड़ें। ढक्कर रखें।" 
           : "Don't leave harvested crops in the open today. Keep them covered.",
         isFavorable: false
       });
    }
    loadDashboards();
  }, [i18n.language, t]);

  const handleMicClick = () => {
    if (!isListening) {
      setIsListening(true);
      setMicText("Listening... Speak now");
      setTimeout(() => {
        setIsListening(false);
        setMicText("Processing query...");
        setTimeout(() => setMicText("Tap and tell us what you need..."), 1500);
      }, 3000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="kisanbaba-wrapper">
      <Helmet>
        <title>KisanBaba - The Sunrise of Indian Agriculture | Live Mandi Rates</title>
        <meta name="description" content="KisanBaba is India's premier agricultural platform providing real-time APMC Mandi rates and crop calculators." />
      </Helmet>
      
      <main className="kb-main">
         <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="kb-hero"
         >
            <h1>KisanBaba <span>Smart</span></h1>
            <p>{t('home.hero.subtitle')}</p>
            
            <div className="mic-container" onClick={handleMicClick}>
               <div className={`pulse-ring ${isListening ? 'active' : ''}`}></div>
               <motion.div 
                 whileHover={{ scale: 1.1 }}
                 whileTap={{ scale: 0.9 }}
                 className="mic-btn"
               >
                 <Mic size={48} strokeWidth={2.5} />
               </motion.div>
            </div>
            <motion.span 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mic-label"
            >
                {isListening ? micText : t('home.hero.micPrompt')}
            </motion.span>
         </motion.section>

          <motion.section 
           variants={containerVariants}
           initial="hidden"
           animate="visible"
           className="kb-dashboard-grid"
         >
            <motion.div 
              variants={itemVariants} 
              className="glass-card home-mandi-card"
              whileHover={{ scale: 1.02, translateY: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
               <div className="card-header-main">
                 <h2><BarChart2 size={24} color="var(--forest-green)" /> {t('home.mandi.title')}</h2>
                 <span className="live-pill">LIVE</span>
               </div>
               
               <div className="mandi-price-list">
                 {mandiData.map(item => (
                   <div className="data-row-glow" key={item.id}>
                     <span className="commodity-label">{item.commodity}</span>
                     <div className="price-trends">
                       <span className="price-val">₹{item.price}/q</span>
                       <div className={`trend-tag-home ${item.trend}`}>
                          {item.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          ₹{item.change}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>

               <div className="card-footer-advice">
                  <p className="advice-text">💡 {t('home.mandi.profitAdvice')}</p>
               </div>

               <div className="card-actions-home">
                 <Link to="/mandi-dashboard" className="premium-nav-btn mandi">
                    {t('home.mandi.exploreBtn')} <ArrowRight size={18}/>
                 </Link>
                 <Link to="/mandi-dashboard" className="secondary-text-btn">
                   {t('home.mandi.exploreBtn')}
                 </Link>
               </div>
            </motion.div>

            <motion.div 
              variants={itemVariants} 
              className="glass-card home-weather-card"
              whileHover={{ scale: 1.02, translateY: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
               <div className="card-header-main">
                 <h2><CloudSun size={24} color="var(--wheat-gold)" /> {t('home.weather.title')}</h2>
                 <span className="safe-pill">{i18n.language === 'hi' ? 'सुरक्षित' : 'SAFE'}</span>
               </div>

               {weatherData && (
                 <>
                   <div className="weather-display-home">
                      <div className="weather-massive-icon">
                         {weatherData.icon}
                      </div>
                      <div className="weather-stat-stack">
                          <div className="temp-big">{weatherData.temp}°C</div>
                          <div className="loc-small">{weatherData.location}</div>
                      </div>
                   </div>
                   
                   <div className="home-alert-box">
                      <div className="alert-header-row">
                        <Info size={16} /> <strong>{t('home.weather.alertHeader')}:</strong>
                      </div>
                      <p className="alert-advice">{weatherData.actionableAdvice}</p>
                   </div>

                   <div className="card-actions-home">
                     <Link to="/mandi-dashboard" className="premium-nav-btn weather">
                       {t('home.weather.exploreBtn')} <ChevronRight size={18}/>
                     </Link>
                   </div>
                 </>
               )}
            </motion.div>
         </motion.section>

         {/* Gateway Links */}
         <motion.section 
           variants={containerVariants}
           initial="hidden"
           animate="visible"
           className="quick-links"
         >
            <Link to="/mandi-dashboard" className="btn-glass">
                <div className="icon-box" style={{ background: 'hsla(162, 94%, 18%, 0.1)' }}>
                  <BarChart2 size={36} color="var(--forest-green)" />
                </div>
                <span>Mandi Bhav</span>
            </Link>
            <Link to="/kisan-bhai" className="btn-glass">
                <div className="icon-box" style={{ background: 'hsla(12, 76%, 55%, 0.1)' }}>
                  <Heart size={36} color="var(--terra-cotta)" />
                </div>
                <span>Kisan Bhai</span>
            </Link>
            <a href="#calculators" className="btn-glass">
                <div className="icon-box" style={{ background: 'hsla(42, 87%, 50%, 0.1)' }}>
                  <Calculator size={36} color="var(--wheat-gold)" />
                </div>
                <span>Calculators</span>
            </a>
            <Link to="/news-radar" className="btn-glass">
                <div className="icon-box" style={{ background: 'hsla(222, 47%, 11%, 0.1)' }}>
                  <Rss size={36} color="var(--text-main)" />
                </div>
                <span>News Radar</span>
            </Link>
         </motion.section>

         {/* The Calculators Grid */}
         <section id="calculators" className="kb-calculators">
            <h2 className="section-title">The Path to Prosperity</h2>
            <div className="calculator-grid">
              <motion.div whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link to="/fertilizer-calculator" className="calc-card" style={{background: 'linear-gradient(135deg, #0f172a, var(--forest-green))'}}>
                     <div className="calc-icon">🧪</div>
                     <div className="calc-info">
                         <h3>Fertilizer (NPK)</h3>
                         <p>Exact bag requirements for your soil</p>
                     </div>
                     <ArrowRight className="calc-arrow" />
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link to="/seed-rate-calculator" className="calc-card" style={{background: 'linear-gradient(135deg, #431407, var(--terra-cotta))'}}>
                     <div className="calc-icon">🌱</div>
                     <div className="calc-info">
                         <h3>Seed Rate</h3>
                         <p>Optimized seed density for maximum yield</p>
                     </div>
                     <ArrowRight className="calc-arrow" />
                </Link>
              </motion.div>

              {cropsData.slice(0, 4).map(crop => (
                <motion.div key={crop.id} whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Link to={`/calculator/${crop.slug}`} className="calc-card" style={{background: crop.bgGradient}}>
                    <div className="calc-icon">{crop.icon}</div>
                    <div className="calc-info">
                        <h3>{t(crop.nameKey)}</h3>
                        <p>{t(crop.descKey)}</p>
                    </div>
                    <ArrowRight className="calc-arrow" />
                  </Link>
                </motion.div>
              ))}
            </div>
         </section>

         <SuccessStories t={t} />

         {/* Govt Schemes Section */}
         <section id="schemes" className="kb-schemes-preview">
            <h2 className="section-title">Sarkari Yojna</h2>
            <div className="kb-dashboard-grid">
               <motion.div whileHover={{ scale: 1.02 }} className="glass-card scheme-card">
                  <div className="scheme-status"><Calendar size={18} /> FY 2024-25</div>
                  <Building2 size={40} color="var(--terra-cotta)" style={{ marginBottom: '20px' }} />
                  <h3>Kisan Samman Nidhi</h3>
                  <p>Check your installment status and fix Aadhaar e-KYC errors instantly.</p>
                  <button className="premium-button">Check Status</button>
               </motion.div>
               
               <motion.div whileHover={{ scale: 1.02 }} className="glass-card scheme-card">
                  <div className="scheme-status"><TrendingUp size={18} /> Active</div>
                  <PawPrint size={40} color="var(--forest-green)" style={{ marginBottom: '20px' }} />
                  <h3>Pashu Kisan Credit Card</h3>
                  <p>Apply for low-interest loans for cattle and dairy farming.</p>
                  <button className="premium-button">Learn More</button>
               </motion.div>
            </div>
         </section>
      </main>
      
      <style>{`
        .trend-tag { 
          display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 8px; font-size: 0.85rem; font-weight: 800;
        }
        .trend-tag.up { background: hsla(162, 94%, 18%, 0.1); color: var(--forest-green); }
        .trend-tag.down { background: hsla(12, 76%, 55%, 0.1); color: var(--terra-cotta); }
        .text-link { color: var(--forest-green); text-decoration: none; font-weight: 800; display: flex; align-items: center; gap: 4px; margin-top: 20px; font-size: 0.95rem; }
        .scheme-status { font-size: 0.75rem; font-weight: 900; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; display: flex; align-items: center; gap: 6px; }
        .premium-button { background: var(--forest-green); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; cursor: pointer; margin-top: 20px; transition: 0.3s; }
        .premium-button:hover { transform: translateY(-3px); box-shadow: 0 10px 20px hsla(162, 94%, 18%, 0.3); }
      `}</style>
    </div>
  );
}
