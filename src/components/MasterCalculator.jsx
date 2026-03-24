import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import cropsData from '../data/crops.json';
import SeoArticle, { getArticleSchema } from './SeoArticle';
import SeoFaqs, { getFaqSchema } from './SeoFaqs';
import GovtSchemes from './GovtSchemes';
import RoiChart from './RoiChart';
import RelatedCrops from './RelatedCrops';
import SuccessStories from './SuccessStories';
import AgriTechInnovations from './AgriTechInnovations';
import CropProfileCard from './CropProfileCard';
import StatePrices from './StatePrices';

export default function MasterCalculator() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  
  // Find specific crop based on SEO URL slug
  const crop = cropsData.find(c => c.slug === slug);

  if (!crop) return <Navigate to="/calculator/dragon-fruit-profit-margin-calculator" />;

  // User Interactive Sliders State
  const [acres, setAcres] = useState(1);
  const [infraCost, setInfraCost] = useState(crop.infraCost || 0);
  const [saplingCount, setSaplingCount] = useState(crop.saplingCount || 0);
  const [saplingPrice, setSaplingPrice] = useState(crop.saplingPrice || 0);
  const [opEx, setOpEx] = useState(crop.defaultOpEx);
  const [yieldPerAcre, setYieldPerAcre] = useState(crop.defaultYield);
  const [price, setPrice] = useState(crop.defaultPrice);
  
  // The 'Super Calculator' Advanced Features
  const [subsidy, setSubsidy] = useState(0); // %
  const [loanRate, setLoanRate] = useState(8.5); // %
  const [loanTenure, setLoanTenure] = useState(5); // years
  const [intercrop, setIntercrop] = useState(0); // ₹

  // --- Financial Math Engine ---
  const totalPlantationCostPerAcre = saplingCount * saplingPrice;
  const totalSetupCostPerAcre = infraCost + totalPlantationCostPerAcre;
  const rawSetupCost = totalSetupCostPerAcre * acres;
  const subsidyAmount = rawSetupCost * (subsidy / 100);
  const finalSetupCost = rawSetupCost - subsidyAmount;

  // EMI Calculator
  let yearlyEmi = 0;
  if (loanRate > 0 && finalSetupCost > 0) {
      const r = loanRate / 100 / 12;
      const n = loanTenure * 12;
      const emi = (finalSetupCost * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      yearlyEmi = Math.round(emi * 12);
  }

  const yearlyRunningCost = (opEx * acres) + yearlyEmi;
  const totalRevenue = (yieldPerAcre * price * acres) + Number(intercrop);
  
  // Annual Net Profit = Revenue - Running Costs (EMI covers the Setup Cost)
  const netProfit = totalRevenue - yearlyRunningCost; 
  const roi = finalSetupCost > 0 ? ((netProfit / finalSetupCost) * 100).toFixed(2) : 0;

  // Schema Markup (SoftwareApplication)
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": `${t(crop.nameKey)} Profit Margin Calculator`,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "description": `Calculate exact setup costs, subsidies, loan EMI, and net margin for ${t(crop.nameKey)} farming.`,
    "author": {
      "@type": "Person",
      "name": "Niraj"
    }
  };

  const articleSchema = getArticleSchema(crop, t);
  const faqSchema = getFaqSchema(crop, t);

  // Generate 5-Year Projection Matrix
  const generateProjection = () => {
      let proj = [];
      for (let i = 1; i <= 5; i++) {
          // Rule of thumb: Orchards don't yield 100% in Year 1. We assume 15% Y1, 50% Y2, 100% Y3+
          let yieldFactor = i === 1 ? 0.15 : (i === 2 ? 0.5 : 1);
          let yearlyRev = (totalRevenue * yieldFactor);
          // Only add intercrop to early years before canopy closes
          if (i <= 2) yearlyRev += Number(intercrop);

          let yearlyExp = yearlyRunningCost;
          if (i === 1) yearlyExp += finalSetupCost; // Setup paid in Year 1

          proj.push({ year: i, rev: yearlyRev, exp: yearlyExp, cashflow: yearlyRev - yearlyExp });
      }
      return proj;
  };
  const projArray = generateProjection();

  // Currency Formatter
  const fmt = (num) => "₹ " + num.toLocaleString('en-IN');

  return (
    <div style={{ background: crop.bgGradient, minHeight: '100vh', padding: '40px 0' }}>
      
      {/* Dynamic SEO Meta Tags generated based on crops.json mapping */}
      <Helmet>
        <title>{t(crop.nameKey)} 1-Acre Profit Margin Calculator (2026 Updated)</title>
        <meta name="description" content={`Calculate your 1-acre setup costs, subsidies, loan EMI, and net margin for ${t(crop.nameKey)} farming.`} />
        <script type="application/ld+json">{JSON.stringify(schemaMarkup)}</script>
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      
      <div className="app-container">
          {/* Breadcrumbs for SEO */}
          <nav aria-label="breadcrumb" style={{fontSize:'0.95rem', color:'var(--text-muted)', marginBottom:'10px', paddingTop: '20px', display: 'flex', alignItems: 'center', gap: '10px'}}>
              <a href="/" style={{color:'var(--terra-cotta)', textDecoration:'none', fontWeight:700}}>Home</a> 
              <span>›</span> 
              <a href="/calculators" style={{color:'var(--forest-green)', textDecoration:'none', fontWeight:700}}>Horticulture Calculators</a>
              <span>›</span> 
              <span style={{color:'var(--text-main)', fontWeight:700}}>{t(crop.nameKey)} Farming Calculator</span>
          </nav>

          <header className="header-bar" style={{paddingTop: '10px', flexWrap: 'wrap', gap: '15px'}}>
              <div className="brand" style={{flexGrow: 1}}>
                  <span className="icon">🌾</span> Slay<span>Calculator</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.9)', padding: '6px 16px', borderRadius: '12px', border: '1px solid #fbbf24', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
                  <span style={{fontSize: '1.2rem'}} title="Select Native Language">🌍</span>
                  <select 
                      className="lang-select"
                      value={i18n.language}
                      onChange={(e) => i18n.changeLanguage(e.target.value)}
                      style={{background: 'transparent', border: 'none', fontSize: '0.95rem', fontWeight: 700, color: '#451a03', outline: 'none', cursor: 'pointer', appearance: 'none', paddingRight: '15px'}}
                  >
                      <optgroup label="Core Translations">
                          <option value="en">English (Data Server)</option>
                          <option value="hi">हिन्दी (Hindi Native)</option>
                      </optgroup>
                      <optgroup label="Pending Regional Sync">
                          <option value="mr">मराठी (Marathi)</option>
                          <option value="te">తెలుగు (Telugu)</option>
                          <option value="ta">தமிழ் (Tamil)</option>
                          <option value="bn">বাংলা (Bengali)</option>
                          <option value="gu">ગુજરાતી (Gujarati)</option>
                          <option value="kn">ಕನ್ನಡ (Kannada)</option>
                          <option value="ml">മലയാളം (Malayalam)</option>
                          <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                          <option value="or">ଓଡ଼ିଆ (Odia)</option>
                          <option value="as">অসমীয়া (Assamese)</option>
                          <option value="ur">اردو (Urdu)</option>
                          <option value="sa">संस्कृत (Sanskrit)</option>
                          <option value="ks">کأشُر (Kashmiri)</option>
                          <option value="ne">नेपाली (Nepali)</option>
                          <option value="sd">سنڌي (Sindhi)</option>
                          <option value="kok">कोंकणी (Konkani)</option>
                          <option value="mai">मैथिली (Maithili)</option>
                          <option value="bho">भोजपुरी (Bhojpuri)</option>
                          <option value="doi">डोगरी (Dogri)</option>
                          <option value="brx">बरो (Bodo)</option>
                          <option value="sat">संथाली (Santali)</option>
                      </optgroup>
                  </select>
                  <span style={{fontSize: '0.8rem', color: '#c2410c', marginLeft: '-15px', pointerEvents: 'none'}}>▼</span>
              </div>
          </header>

          <div className="calc-header">
              <div className="crop-icon" style={{background: 'white'}}>{crop.icon}</div>
              <div className="crop-titles">
                  <h1 id="calculator-top">Calculate Your Exact {t(crop.nameKey)} Farming Profit Per Acre</h1>
                  <p>{t(crop.descKey)}</p>
              </div>
          </div>

          {/* Interactive TOC for Google Sitelinks */}
          <div style={{ background: 'white', padding: '15px 25px', borderRadius: '16px', marginBottom: '40px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              <strong style={{ color: '#0f172a', fontSize: '1rem' }}>Quick Jump:</strong>
              <a href="#calculator-top" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', padding: '6px 14px', background: '#eff6ff', borderRadius: '20px' }}>📊 Profit Calculator</a>
              <a href="#mandi-prices" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', padding: '6px 14px', background: '#ecfdf5', borderRadius: '20px' }}>📈 Mandi Prices</a>
              <a href="#agronomy-guide" style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', padding: '6px 14px', background: '#fffbeb', borderRadius: '20px' }}>🌱 Agronomy Guide</a>
              <a href="#seo-article" style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', padding: '6px 14px', background: '#f5f3ff', borderRadius: '20px' }}>📖 In-Depth Report</a>
          </div>

          <div className="master-calc-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '40px', alignItems: 'start' }}>
              {/* Inputs Column */}
              <div className="glass-container inputs-panel">
                  {/* Basic Inputs */}
                  <div className="rural-input-group">
                      <div className="rural-label">
                          <span style={{display: 'flex', alignItems: 'center'}}>{t('calc.landSize')} <span className="info-icon">i<span className="info-tooltip">OpEx and Revenue scale linearly with acreage, but buying infrastructure in bulk might lower your CapEx.</span></span></span> 
                          <span className="rural-value">{acres} Acre(s)</span>
                      </div>
                      <input type="range" min="1" max="50" step="0.5" value={acres} onChange={e => setAcres(Number(e.target.value))} />
                  </div>

                  {/* Dynamic Plantation Breakdown */}
                  <div style={{background: 'rgba(255,255,255,0.4)', border: '1px solid #fde68a', borderRadius: '16px', padding: '25px', margin: '30px 0'}}>
                      <h3 style={{color: 'var(--terra-cotta)', marginTop: 0, marginBottom: '20px', fontSize: '1.2rem'}}>1. CapEx: Setup & Infrastructure</h3>
                      
                      <div className="rural-input-group">
                          <div className="rural-label" style={{fontSize: '0.95rem'}}>
                              <span style={{display: 'flex', alignItems: 'center'}}>Fixed Infra (Land, Poles, Drip) <span className="info-icon">i<span className="info-tooltip">Covers durable assets like high-tensile concrete pillars, micro-drip irrigation loops, and polyhouse nets.</span></span></span> 
                              <span className="rural-value">₹ {infraCost.toLocaleString('en-IN')}/Acre</span>
                          </div>
                          <input type="range" min={crop.infraCost * 0.5} max={crop.infraCost * 1.5} step="1000" value={infraCost} onChange={e => setInfraCost(Number(e.target.value))} />
                      </div>

                      <h3 style={{color: 'var(--forest-green)', marginTop: '25px', marginBottom: '20px', fontSize: '1.2rem', paddingTop: '20px', borderTop: '1px solid rgba(0,0,0,0.1)'}}>2. CapEx: Live Plantation Costs</h3>
                      
                      <div className="rural-input-group">
                          <div className="rural-label" style={{fontSize: '0.95rem'}}>
                              <span style={{display: 'flex', alignItems: 'center'}}>Saplings Needed per Acre <span className="info-icon">i<span className="info-tooltip">Plant density directly determines Year 3 yield. Modern high-density farms use significantly more saplings.</span></span></span> 
                              <span className="rural-value">{saplingCount.toLocaleString('en-IN')} plants</span>
                          </div>
                          <input type="range" min={crop.saplingCount * 0.5} max={crop.saplingCount * 2} step="10" value={saplingCount} onChange={e => setSaplingCount(Number(e.target.value))} />
                      </div>

                      <div className="rural-input-group">
                          <div className="rural-label" style={{fontSize: '0.95rem'}}>
                              <span style={{display: 'flex', alignItems: 'center'}}>Today's Local Sapling Price <span className="info-icon">i<span className="info-tooltip">Tissue culture saplings vary heavily by quality. Enter the exact live quote from your local certified nursery.</span></span></span> 
                              <span className="rural-value" style={{color: '#0284c7'}}>₹ {saplingPrice}</span>
                          </div>
                          <input type="number" className="rural-number-input" value={saplingPrice || ''} onChange={e => setSaplingPrice(Number(e.target.value))} placeholder="e.g. ₹ 50" />
                      </div>

                      <div style={{marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.8)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                          <span style={{fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.9rem'}}>Live Sapling Budget:</span>
                          <span style={{fontSize: '1.3rem', fontWeight: 900, color: 'var(--forest-green)'}}>{fmt(totalPlantationCostPerAcre)} / Acre</span>
                      </div>
                  </div>

                  <div className="rural-input-group">
                      <div className="rural-label">
                          <span style={{display: 'flex', alignItems: 'center'}}>{t('calc.price')} <span className="info-icon">i<span className="info-tooltip">Reflects average wholesale Mandi rate. Selling direct-to-consumer or exporting yields significantly higher margins.</span></span></span> 
                          <span className="rural-value">₹ {price}/kg</span>
                      </div>
                      <input type="range" min={crop.defaultPrice * 0.5} max={crop.defaultPrice * 2} step="1" value={price} onChange={e => setPrice(Number(e.target.value))} />
                  </div>

                  <div className="rural-input-group">
                      <div className="rural-label">
                          <span style={{display: 'flex', alignItems: 'center'}}>{t('calc.yield')} <span className="info-icon">i<span className="info-tooltip">A scientifically-managed, mature orchard hits these numbers easily. Poor disease control drops yield by 50%.</span></span></span> 
                          <span className="rural-value">{yieldPerAcre.toLocaleString()} kg</span>
                      </div>
                      <input type="range" min={crop.defaultYield * 0.3} max={crop.defaultYield * 1.5} step="100" value={yieldPerAcre} onChange={e => setYieldPerAcre(Number(e.target.value))} />
                  </div>
                  
                  <hr style={{borderColor: 'rgba(0,0,0,0.1)', margin: '30px 0'}}/>

                  {/* ADVANCED FEATURES (Subsidy, Loan, Intercrop) */}
                  <h3 style={{color: 'var(--soil-brown)', margin: '0 0 20px 0', fontSize: '1.4rem'}}>Advanced Projections</h3>
                  
                  <div className="rural-input-group">
                      <div className="rural-label">
                          <span style={{display: 'flex', alignItems: 'center'}}>{t('calc.subsidy')} <span className="info-icon">i<span className="info-tooltip">The NHB and State Depts offer massive capital subsidies to reduce your out-of-pocket setup burden.</span></span></span> 
                          <span className="rural-value">{subsidy}%</span>
                      </div>
                      <input type="range" min="0" max="100" step="5" value={subsidy} onChange={e => setSubsidy(Number(e.target.value))} />
                      <small style={{color: 'var(--text-muted)'}}>Reduces Initial Setup Cost: {fmt(finalSetupCost)}</small>
                  </div>

                  <div className="rural-input-group">
                      <div className="rural-label">
                          <span style={{display: 'flex', alignItems: 'center'}}>{t('calc.loanRate')} <span className="info-icon">i<span className="info-tooltip">Kisan Credit Card (KCC) or NABARD agricultural term loans for high-tech farming usually hover around 7% - 9%.</span></span></span> 
                          <span className="rural-value">{loanRate}%</span>
                      </div>
                      <input type="range" min="0" max="18" step="0.5" value={loanRate} onChange={e => setLoanRate(Number(e.target.value))} />
                  </div>

                  <div className="rural-input-group">
                      <div className="rural-label">
                          <span style={{display: 'flex', alignItems: 'center'}}>{t('calc.intercrop')} <span className="info-icon">i<span className="info-tooltip">Revenue earned from planting short-duration vegetables between the main crop rows during the first 12-18 months.</span></span></span>
                      </div>
                      <input type="number" className="rural-number-input" value={intercrop} onChange={e => setIntercrop(Number(e.target.value))} placeholder="₹ 0" />
                  </div>
              </div>

              {/* Results Column */}
              <div className="result-panel">
                  <h2 style={{fontSize: '2rem', color: 'var(--soil-brown)', marginBottom: '30px', marginTop: 0}}>Financial Overview</h2>
                  
                  <div className="result-card">
                      <h4>{t('calc.results.revenue')}</h4>
                      <p className="amount" style={{color: '#0284c7'}}>{fmt(totalRevenue)}</p>
                  </div>

                  <div className="result-card">
                      <h4>{t('calc.results.costs')}</h4>
                      <p className="amount" style={{color: '#dc2626'}}>{fmt(yearlyRunningCost)}</p>
                      {yearlyEmi > 0 && <small style={{color: 'var(--text-muted)', display: 'block', marginTop: '10px'}}>Includes Yearly EMI of {fmt(yearlyEmi)}</small>}
                  </div>

                  <div className="result-card profit" style={{marginTop: '30px'}}>
                      <h4>{t('calc.results.netProfit')}</h4>
                      <p className="amount">{fmt(netProfit)}</p>
                  </div>

                  {/* Visualizer Chart that's always visible for Maximum Dwell Time */}
                  <div style={{marginTop: '30px'}}>
                     <RoiChart projectionData={projArray} />
                  </div>

                  {/* High Value Utility: Download PDF */}
                  <button onClick={() => window.print()} style={{ marginTop: '30px', width: '100%', padding: '16px', background: '#0f172a', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.25)', transition: '0.3s' }}>
                      🖨️ Download Bankable PDF Report
                  </button>

              </div>
          </div>

          <GovtSchemes crop={crop} t={t} />

          {/* E-E-A-T Section */}
          <div className="eeat-section glass-container" style={{marginTop: '40px', padding: '40px', textAlign: 'left', background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.03)'}}>
              <div className="author-bio" style={{display: 'flex', gap: '25px', alignItems: 'center'}}>
                  <div style={{width: '90px', height: '90px', borderRadius: '50%', background: 'var(--forest-green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', flexShrink: 0, border: '4px solid #dcfce7'}}>N</div>
                  <div>
                      <h3 style={{margin: '0 0 8px 0', color: '#0f172a', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'}}>Niraj Kumar <span style={{fontSize: '0.85rem', background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: '20px', fontWeight: 600}}>B.Sc Agriculture</span><span style={{fontSize: '0.85rem', background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '20px', fontWeight: 600}}>Principal Agri-Economist</span></h3>
                      <p style={{margin: 0, color: '#475569', fontSize: '1.05rem', lineHeight: '1.6'}}>Niraj holds an ICAR-accredited degree in Agricultural Sciences and has spent 8 years modeling commercial farming returns across 15 Indian states. He has successfully helped over 10,000 progressive farmers secure NABARD subsidies and maximize their high-density orchard yields.</p>
                  </div>
              </div>
          </div>

          <div id="mandi-prices" style={{ scrollMarginTop: '100px' }}></div>
          <StatePrices crop={crop} t={t} />

          <div id="agronomy-guide" style={{ scrollMarginTop: '100px' }}></div>
          {/* Scientific Agronomy Data */}
          <CropProfileCard crop={crop} t={t} />

          <div id="seo-article" style={{ scrollMarginTop: '100px' }}></div>
          {/* Deep Content Expansion for SEO */}
          <SeoArticle crop={crop} t={t} />

          {/* Special Feature: 5 Agritech Innovations */}
          <AgriTechInnovations crop={crop} t={t} />

          <SeoFaqs crop={crop} t={t} />

          {/* Motivational Farmers */}
          <SuccessStories crop={crop} t={t} />

          {/* Internal Linking Engine */}
          <RelatedCrops currentCropId={crop.id} t={t} />

          {/* E-E-A-T Legal Disclaimer */}
          <div className="calculator-footer" style={{marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e0e0e0', fontFamily: 'Inter, sans-serif', paddingBottom: '80px'}}>
              <h4 style={{color: '#64748b', fontSize: '14px', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Data Methodology & Sources</h4>
              <p style={{color: '#94a3b8', fontSize: '12px', lineHeight: '1.5', marginTop: '0', marginBottom: '15px'}}>The baseline setup costs align with NABARD bankable project guidelines for {t(crop.nameKey)}, PMKSY micro-irrigation benchmarks, and standard ICAR/KVK packages of practices for central/western India.</p>
              
              <h4 style={{color: '#64748b', fontSize: '14px', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>⚠️ Legal Disclaimer</h4>
              <p style={{color: '#94a3b8', fontSize: '12px', lineHeight: '1.5', marginTop: '0', marginBottom: '15px'}}>These figures are approximate baseline estimates for educational and planning purposes only. Actual costs fluctuate and vary significantly by district, soil condition, and local vendor pricing. This tool does not constitute financial advice. Always obtain direct quotes from local contractors and your district KVK before making investments.</p>
          </div>

          {/* Sticky Dark-Social WhatsApp Share */}
          <a href={`https://api.whatsapp.com/send?text=Check%20out%20this%20amazing%20${t(crop.nameKey)}%20Farming%20Profit%20Calculator!%20Calculate%20your%20exact%20profits%20and%20subsidies%20here:%20${window.location.href}`} 
             target="_blank" rel="noopener noreferrer" 
             className="whatsapp-float">
             <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="Share on WhatsApp" style={{width: '28px', height: '28px', filter: 'brightness(0) invert(1)'}} />
          </a>

      </div>
    </div>
  );
}
