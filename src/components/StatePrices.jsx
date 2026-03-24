import React from 'react';

export default function StatePrices({ crop, t }) {
  const mandiData = crop.mandiPrices && crop.mandiPrices.length > 0 ? crop.mandiPrices : [
    { "state": "Maharashtra", "price": "₹ 120 / kg", "trend": "stable" },
    { "state": "Delhi", "price": "₹ 130 / kg", "trend": "up" },
    { "state": "Gujarat", "price": "₹ 110 / kg", "trend": "stable" },
    { "state": "Karnataka", "price": "₹ 125 / kg", "trend": "up" }
  ];

  return (
    <div className="state-prices-card" style={{ marginTop: '50px', background: '#ffffff', borderRadius: '24px', padding: '40px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', paddingBottom: '20px', borderBottom: '2px solid #f8fafc' }}>
        <div style={{ fontSize: '2rem', background: '#fffbeb', width: '55px', height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}>📈</div>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: '#0f172a', margin: '0 0 5px 0' }}>Live Wholesale Mandi Prices</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>Estimated 2026 rates for {t(crop.nameKey)} across major Indian agricultural hubs.</p>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: '15px 20px', color: '#475569', fontWeight: 600, borderBottom: '2px solid #e2e8f0', borderRadius: '8px 0 0 8px' }}>State / Hub</th>
              <th style={{ padding: '15px 20px', color: '#475569', fontWeight: 600, borderBottom: '2px solid #e2e8f0' }}>Wholesale Price</th>
              <th style={{ padding: '15px 20px', color: '#475569', fontWeight: 600, borderBottom: '2px solid #e2e8f0', borderRadius: '0 8px 8px 0' }}>Trend</th>
            </tr>
          </thead>
          <tbody>
            {mandiData.map((mandi, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', transition: '0.2s', ':hover': {background: '#f8fafc'} }}>
                <td style={{ padding: '18px 20px', color: '#1e293b', fontWeight: 600 }}>{mandi.state}</td>
                <td style={{ padding: '18px 20px', color: 'var(--forest-green)', fontWeight: 800, fontSize: '1.1rem' }}>{mandi.price}</td>
                <td style={{ padding: '18px 20px' }}>
                  {mandi.trend === 'up' ? 
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>⬆ Rising</span> : 
                    <span style={{ background: '#f3f4f6', color: '#475569', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>➡ Stable</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '20px 0 0 0', textAlign: 'right' }}>* Prices fluctuate daily. Please consult e-NAM for real-time local rates.</p>
    </div>
  );
}
