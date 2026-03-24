import React, { useState, useMemo, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('kb_admin_auth') === 'true');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (pin.trim() === '1234') {
      setIsAuthenticated(true);
      localStorage.setItem('kb_admin_auth', 'true');
    } else {
      alert('Wrong PIN. Access Denied.');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('kb_admin_auth');
    navigate('/admin');
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center', background: '#000', color: '#fff', minHeight: '100vh' }}>
        <h1 style={{ color: '#ef4444' }}>🛡️ ADMIN GATEWAY</h1>
        <div style={{ maxWidth: '300px', margin: '0 auto', background: '#111', padding: '30px', borderRadius: '12px', border: '1px solid #333' }}>
          <p>Enter Master PIN:</p>
          <input 
            type={showPin ? "text" : "password"} 
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#222', color: '#fff', border: '1px solid #444', textAlign: 'center' }}
          />
          <button onClick={() => setShowPin(!showPin)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', display: 'block', margin: '0 auto 10px' }}>
            {showPin ? 'Hide PIN' : 'Show PIN'}
          </button>
          <button onClick={handleLogin} style={{ width: '100%', padding: '12px', background: '#fff', color: '#000', fontWeight: 'bold' }}>
            ENTER SYSTEM
          </button>
        </div>
      </div>
    );
  }

  if (location.pathname !== '/admin') return <Outlet />;

  return (
    <div style={{ padding: '40px 20px', background: '#0a0a0a', color: '#fff', minHeight: '100vh' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <h1>📊 System Overview</h1>
         <button onClick={logout} style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px' }}>LOGOUT</button>
       </div>
       <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '20px', background: '#111', borderRadius: '12px', border: '1px solid #222' }}>
             <h3>🤖 Active Crawlers</h3>
             <p>All India Mandi Scraper: <span style={{ color: '#10b981' }}>RUNNING</span></p>
             <p>Weather Intelligence: <span style={{ color: '#10b981' }}>RUNNING</span></p>
          </div>
          <div style={{ padding: '20px', background: '#111', borderRadius: '12px', border: '1px solid #222' }}>
             <h3>📊 Mandi Data Health</h3>
             <p>Sync status: 2,800 records today</p>
             <button style={{ width: '100%', padding: '10px', marginTop: '10px' }} onClick={() => navigate('/admin/mandi')}>OPEN MANDI CONTROL PANEL</button>
          </div>
       </div>
    </div>
  );
}
