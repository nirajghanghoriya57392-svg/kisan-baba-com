import React from 'react';
import { Link } from 'react-router-dom';
import cropsData from '../data/crops.json';

export default function RelatedCrops({ currentCropId, t }) {
  // Filter out the current crop to recommend visually engaging alternatives
  const recommendedCrops = cropsData.filter(c => c.id !== currentCropId).slice(0, 3);

  if (recommendedCrops.length === 0) return null;

  return (
    <div className="related-crops-section" style={{ marginTop: '60px', padding: '40px', background: 'rgba(255,255,255,0.6)', borderRadius: '24px', border: '1px solid #fde68a', backdropFilter: 'blur(20px)' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--soil-brown)', margin: '0 0 10px 0' }}>Discover More High-Profit Crops</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>Compare profit margins across other heavily subsidized cash crops.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
        {recommendedCrops.map(crop => (
          <Link to={`/calculator/${crop.slug}`} key={crop.id} style={{ textDecoration: 'none' }}>
            <div className="related-card" style={{ background: 'white', borderRadius: '20px', padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 30px rgba(69, 26, 3, 0.05)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer' }}>
              <div style={{ fontSize: '3rem', background: crop.bgGradient, width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
                {crop.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: 'var(--soil-brown)', fontWeight: 800 }}>{t(crop.nameKey)}</h3>
                <p style={{ margin: 0, color: 'var(--forest-green)', fontWeight: 700, fontSize: '0.9rem' }}>View ROI &rarr;</p>
              </div>
            </div>
            {/* Dynamic hover state injected directly to avoid modifying multiple CSS files */}
            <style>{`
              .related-card:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 20px 40px rgba(194, 65, 12, 0.15) !important; border-color: #fca5a5 !important; }
            `}</style>
          </Link>
        ))}
      </div>
    </div>
  );
}
