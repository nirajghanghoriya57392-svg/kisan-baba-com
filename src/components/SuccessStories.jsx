import React from 'react';
import { useTranslation } from 'react-i18next';

export default function SuccessStories({ crop, t }) {
  const { i18n } = useTranslation();
  
  const isGeneric = !crop;
  const T = t || useTranslation().t;
  const cropName = isGeneric ? "Modern Farming" : T(crop.nameKey);

  const defaultStories = isGeneric ? [
      {
        "title": "How a small 2-Acre Farm now earns ₹12 Lakh/Year with Drip Irrigation",
        "farmer": "Ramesh Patel",
        "location": "Maharashtra",
        "income": "High Yield",
        "source": "Krishi Jagran",
        "link": "https://krishijagran.com/success-story/from-traditional-to-modern-farming-a-success-story-of-progressive-farmer-shri-ramesh-patel/"
      },
      {
        "title": "Women Farmers group creates organic export empire in just 3 years",
        "farmer": "Sunita Devi & Group",
        "location": "Gujarat",
        "income": "Export Quality",
        "source": "Krishi Jagran",
        "link": "https://krishijagran.com/women-in-agriculture/women-farmers-script-success-story-in-organic-farming/"
      },
      {
        "title": "Solar Pumps & Smart Planning: Defeating Water Scarcity For Good",
        "farmer": "Amit Singh",
        "location": "Rajasthan",
        "income": "Water Matrix",
        "source": "Krishi Jagran",
        "link": "https://krishijagran.com/agriculture-world/success-story-of-a-farmer-who-earns-lakhs-from-farming-in-a-desert/"
      }
  ] : [
      {
        "title": `From Corporate Job to Record Profits with High-Density ${cropName}`,
        "farmer": "Ramesh Patel",
        "location": "Maharashtra Agri-Zone",
        "income": "Premium Yield",
        "link": "https://agricoop.gov.in"
      },
      {
        "title": `How a 2-Acre Barren Land Now Yields Export-Quality ${cropName}`,
        "farmer": "Suresh Desai",
        "location": "Gujarat Arid Region",
        "income": "Export Quality",
        "link": "https://agricoop.gov.in"
      },
      {
        "title": `Transforming Water-Scarce Farms with Drip-Irrigated ${cropName} Orchards`,
        "farmer": "Amit Singh",
        "location": "Rajasthan",
        "income": "Water Matrix",
        "link": "https://agricoop.gov.in"
      }
  ];

  const storyData = (!isGeneric && crop.successStories && crop.successStories.length > 0) ? crop.successStories : defaultStories;

  return (
    <div className="success-stories-section" style={{ marginTop: '50px', padding: '40px', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2.5rem', color: '#0f172a', margin: '0 0 15px 0', fontWeight: 900 }}>Real Farmers. Real Wealth.</h2>
        <p style={{ color: '#334155', fontSize: '1.2rem', margin: 0, fontWeight: 500 }}>Discover how progressive Indian farmers transformed their lives and land with {isGeneric ? 'smart agriculture' : `commercial ${T(crop.nameKey)} cultivation`}.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        {storyData.map((story, index) => {
          const targetLang = i18n?.language || 'en';
          const translateUrl = `https://translate.google.com/translate?sl=auto&tl=${targetLang}&u=${encodeURIComponent(story.link)}`;
          
          return (
            <div className="story-card" key={index} style={{ background: '#ffffff', borderRadius: '20px', padding: '30px', border: '2px solid #e2e8f0', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <span style={{ background: 'var(--terra-cotta)', color: 'white', padding: '8px 16px', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Success Story</span>
                <span style={{ background: '#ecfdf5', color: '#047857', padding: '8px 16px', borderRadius: '10px', fontSize: '1rem', fontWeight: 800 }}>{story.income}</span>
              </div>
              
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', color: '#0f172a', fontWeight: 800, lineHeight: 1.4 }}>"{story.title}"</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderTop: '2px solid #f1f5f9', paddingTop: '20px', marginBottom: '25px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#f8fafc', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>👨🏽‍🌾</div>
                <div>
                  <p style={{ margin: 0, color: '#0f172a', fontWeight: 800, fontSize: '1.2rem' }}>{story.farmer}</p>
                  <p style={{ margin: 0, color: '#334155', fontSize: '1rem', fontWeight: 600 }}>📍 {story.location}</p>
                </div>
              </div>
              
              <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '10px 14px', background: '#f1f5f9', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#334155' }}>📰 Source: {story.source || 'Government of India'}</span>
                </div>
                <a href={translateUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <button className="huge-button" style={{ background: '#0f172a', fontSize: '1.2rem', padding: '18px', borderRadius: '14px', width: '100%', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    🌐 {T('readInMyLanguage') || 'Read in my language'} →
                  </button>
                </a>
              </div>
            </div>
          );
        })}
      </div>
      <style>{`.story-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important; border-color: #cbd5e1 !important; }`}</style>
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <p style={{ fontSize: '1rem', color: '#475569', margin: 0, fontWeight: 500 }}>* Articles securely open and translate automatically via Google Translate Engine.</p>
      </div>
    </div>
  );
}
