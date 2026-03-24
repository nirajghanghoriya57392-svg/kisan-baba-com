import React from 'react';

export default function CropProfileCard({ crop, t }) {
  const profile = crop.agronomy || {
      "soil": "Well-drained sandy loam with high organic matter. Ideal pH between 5.5 to 7.0.",
      "states": "Maharashtra, Karnataka, Andhra Pradesh, Gujarat, Tamil Nadu.",
      "bestClimate": "A warm, sub-tropical climate. Thrives in 20°C to 32°C. Requires moderate rainfall.",
      "unsuitableClimate": "Highly susceptible to waterlogging, severe frost, and extended periods over 42°C.",
      "varieties": "Varies by region. Please consult your local KVK for certified commercial varieties."
  };

  return (
    <div className="agronomy-card" style={{ marginTop: '50px', background: '#f8fafc', borderRadius: '24px', padding: '40px', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)'}}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <div style={{ fontSize: '2rem', background: '#ffffff', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>🌱</div>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: '#0f172a', margin: '0 0 5px 0' }}>{t(crop.nameKey)} Cultivation Profile</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>Scientific agronomic data for Indian agro-climatic zones.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', borderLeft: '4px solid #8b5cf6'}}>
          <h4 style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Best Soil Type</h4>
          <p style={{ margin: 0, color: '#0f172a', fontWeight: 600, fontSize: '1.05rem' }}>{profile.soil}</p>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', borderLeft: '4px solid #3b82f6'}}>
          <h4 style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Producing States</h4>
          <p style={{ margin: 0, color: '#0f172a', fontWeight: 600, fontSize: '1.05rem' }}>{profile.states}</p>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', borderLeft: '4px solid #10b981'}}>
          <h4 style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ideal Climate</h4>
          <p style={{ margin: 0, color: '#0f172a', fontWeight: 600, fontSize: '1.05rem' }}>{profile.bestClimate}</p>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', borderLeft: '4px solid #ef4444'}}>
          <h4 style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unsuitable Conditions</h4>
          <p style={{ margin: 0, color: '#0f172a', fontWeight: 600, fontSize: '1.05rem' }}>{profile.unsuitableClimate}</p>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9', borderLeft: '4px solid #f59e0b', gridColumn: '1 / -1'}}>
          <h4 style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Commercial High-Yielding Varieties</h4>
          <p style={{ margin: 0, color: '#0f172a', fontWeight: 600, fontSize: '1.05rem' }}>{profile.varieties}</p>
        </div>

      </div>
    </div>
  );
}
