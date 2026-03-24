import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell, PieChart, Pie } from 'recharts';
import './MandiAdmin.css';

// Mock Data for Analytics
const MOCK_ACTIVITY_DATA = [
  { day: 'Mon', reports: 12, shares: 45, searches: 320 },
  { day: 'Tue', reports: 18, shares: 52, searches: 410 },
  { day: 'Wed', reports: 8, shares: 38, searches: 290 },
  { day: 'Thu', reports: 25, shares: 65, searches: 540 },
  { day: 'Fri', reports: 14, shares: 42, searches: 380 },
  { day: 'Sat', reports: 32, shares: 88, searches: 620 },
  { day: 'Sun', reports: 20, shares: 72, searches: 490 },
];

const MOCK_FEEDBACK_DATA = [
  { name: 'Accuracy', value: 4.8 },
  { name: 'Reliability', value: 4.5 },
  { name: 'Functionality', value: 4.7 }
];

const MOCK_SENTIMENT_DATA = [
  { name: 'Positive', value: 75, color: '#10b981' },
  { name: 'Neutral', value: 15, color: '#f59e0b' },
  { name: 'Negative', value: 10, color: '#ef4444' }
];

export default function MandiAdmin() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [healthStatus] = useState({
    agmarknet: 'healthy',
    weather: 'healthy',
    auth: 'healthy',
    db: 'healthy'
  });

  return (
    <div className="mandi-admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span className="logo-icon">👑</span>
          <div className="logo-text">
            <h3>Admin Portal</h3>
            <p>Mandi Bhav Control</p>
          </div>
        </div>
        
        <nav className="admin-nav">
          <button className="back-btn" onClick={() => window.location.href='/admin'}>
            ⬅️ Back to System Control
          </button>
          <div style={{ margin: '10px 0', borderBottom: '1px solid var(--glass-border)' }}></div>
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            📊 Dashboard Overview
          </button>
          <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>
            🛡️ Integrity Report Log
          </button>
          <button className={activeTab === 'feedback' ? 'active' : ''} onClick={() => setActiveTab('feedback')}>
            ⭐ User Feedback Analysis
          </button>
          <button className={activeTab === 'sync' ? 'active' : ''} onClick={() => setActiveTab('sync')}>
            ⚡ Core Sync Hub
          </button>
          <button className={activeTab === 'health' ? 'active' : ''} onClick={() => setActiveTab('health')}>
            ⚙️ Feature Health & APIs
          </button>
        </nav>

        <div className="admin-footer">
          <div className="sys-version">v2.4.0-pro-admin</div>
          <button className="logout-btn">Sign Out</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-search">
            <input type="text" placeholder="Search events, districts, or farmers..." />
          </div>
          <div className="user-profile">
            <span className="notif-badge">🔔 3</span>
            <div className="avatar">A</div>
          </div>
        </header>

        <div className="admin-content">
          {activeTab === 'overview' && (
            <div className="tab-pane">
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-title">Real-time Reports</span>
                  <div className="stat-value">149</div>
                  <div className="stat-delta up">+12% vs last week</div>
                </div>
                <div className="stat-card">
                  <span className="stat-title">Platform Shares</span>
                  <div className="stat-value">2.4k</div>
                  <div className="stat-delta up">+24% vs last week</div>
                </div>
                <div className="stat-card">
                  <span className="stat-title">Active Districts</span>
                  <div className="stat-value">712</div>
                  <div className="stat-delta">Stable</div>
                </div>
                <div className="stat-card">
                  <span className="stat-title">Mandi Accuracy</span>
                  <div className="stat-value">96.4%</div>
                  <div className="stat-delta up">+0.5% (AI Refined)</div>
                </div>
              </div>

              <div className="chart-row">
                <div className="chart-card">
                  <h3>Weekly Interaction Trend</h3>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MOCK_ACTIVITY_DATA}>
                        <defs>
                          <linearGradient id="colorSearches" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="day" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
                        <Area type="monotone" dataKey="searches" stroke="#10b981" fillOpacity={1} fill="url(#colorSearches)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="chart-card">
                  <h3>Engagement Metrics</h3>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={MOCK_ACTIVITY_DATA}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="day" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ background: '#1e293b', border: 'none' }} />
                        <Legend />
                        <Bar dataKey="shares" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="reports" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="tab-pane">
              <div className="admin-table-container">
                <div className="table-header">
                  <h3>Latest Integrity Submissions</h3>
                  <button className="export-btn">Export CSV</button>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Farmer Name</th>
                      <th>District/Mandi</th>
                      <th>Crop</th>
                      <th>Model Price</th>
                      <th>User Price</th>
                      <th>Gap (₹)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>12:45 PM</td>
                      <td>Rahul Sharma</td>
                      <td>Raipur / Mandi Complex</td>
                      <td>Paddy (Dhan)</td>
                      <td>2,183</td>
                      <td>1,950</td>
                      <td className="text-red">233</td>
                      <td><span className="badge warning">Investigating</span></td>
                    </tr>
                    <tr>
                      <td>11:30 AM</td>
                      <td>Nilesh G.</td>
                      <td>Indore / Devi Ahilya</td>
                      <td>Soyabean</td>
                      <td>4,200</td>
                      <td>4,200</td>
                      <td className="text-green">0</td>
                      <td><span className="badge success">Verified</span></td>
                    </tr>
                    <tr>
                      <td>10:15 AM</td>
                      <td>Suresh T.</td>
                      <td>Jaipur / Muhana Mandi</td>
                      <td>Tomato</td>
                      <td>1,200</td>
                      <td>900</td>
                      <td className="text-red">300</td>
                      <td><span className="badge critical">Critical Alert</span></td>
                    </tr>
                    <tr>
                      <td>09:00 AM</td>
                      <td>Vijay P.</td>
                      <td>Nasik / Lasalgaon</td>
                      <td>Onion</td>
                      <td>1,850</td>
                      <td>1,800</td>
                      <td className="text-amber">50</td>
                      <td><span className="badge pending">Pending</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="tab-pane">
              <div className="chart-row">
                <div className="chart-card">
                  <h3>Average Ratings</h3>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={MOCK_FEEDBACK_DATA}>
                        <XAxis type="number" domain={[0, 5]} hide />
                        <YAxis dataKey="name" type="category" stroke="#94a3b8" />
                        <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
                        <Bar dataKey="value" fill="#fbbf24" radius={[0, 4, 4, 0]}>
                           {MOCK_FEEDBACK_DATA.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.value > 4.5 ? '#f59e0b' : '#fbbf24'} />
                            ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="chart-card">
                  <h3>Voice of Farmers (Sentiment)</h3>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={MOCK_SENTIMENT_DATA}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {MOCK_SENTIMENT_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="feedback-quotes">
                <h3>Direct Farmer Feedback</h3>
                <div className="quote-grid">
                  <div className="quote-card">
                    <p>"The diesel price integration is a game changer. Now I know exactly where to go."</p>
                    <span>- Vikram S., Maharastra</span>
                  </div>
                  <div className="quote-card">
                    <p>"Please add multi-language support for Tamil Nadu farmers too. We love the app!"</p>
                    <span>- Anbu K., Tamil Nadu</span>
                  </div>
                  <div className="quote-card warning">
                    <p>"The weather alert for rain was a bit late today. Please improve the sync."</p>
                    <span>- Harish P., Punjab</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="tab-pane">
              <div className="sync-dashboard-grid">
                {/* Resilience Control Center */}
                <div className="sync-control-card">
                  <div className="card-header-flex">
                    <h3>⚡ Resilience Pipeline Control</h3>
                    <span className="live-status">System Ready</span>
                  </div>
                  <p className="description">Manually trigger the 4-Tier fallback discovery for all India crops. This bypasses the daily scheduler.</p>
                  
                  <div className="pipeline-visual">
                    <div className="pipeline-step active">1. OGD API</div>
                    <div className="pipeline-connector"></div>
                    <div className="pipeline-step">2. HTML Scraper</div>
                    <div className="pipeline-connector"></div>
                    <div className="pipeline-step">3. AI Nowcast</div>
                    <div className="pipeline-connector"></div>
                    <div className="pipeline-step">4. User Pulse</div>
                  </div>

                  <div className="sync-actions">
                    <button className="sync-btn-primary" onClick={() => alert('Starting Tier 1: Agmarknet API Sync...')}>
                      🚀 Trigger Full Refresh
                    </button>
                    <button className="sync-btn-secondary" onClick={() => alert('Running AI Prophet Refinement for missing gaps...')}>
                      🤖 Force AI Re-inference
                    </button>
                  </div>
                </div>

                {/* AI Logic Inspector */}
                <div className="sync-ai-card">
                  <h3>🧠 AI Accuracy Logic (Prophet)</h3>
                  <div className="ai-log-stream">
                    <div className="log-entry">[05:30 AM] Loading historical 365-day trend for 'Wheat'...</div>
                    <div className="log-entry">[05:30 AM] Seasonality factor: 1.08 (Rabi Harvest nearing)</div>
                    <div className="log-entry success">[05:31 AM] Prophet result: Expected Modal ₹2,450 (±₹50)</div>
                    <div className="log-entry warning">[05:32 AM] Gap detected in 'Indore' Mandi - AI Fallback Activated</div>
                  </div>
                </div>

                {/* Farmer Correction Consensus */}
                <div className="farmer-consensus-card">
                   <div className="card-header-flex">
                     <h3>🤝 Farmer Price Corrections</h3>
                     <span className="consensus-badge">4 Pending Verification</span>
                   </div>
                   <div className="consensus-list">
                      <div className="consensus-item">
                        <div className="item-info">
                          <strong>Indore Mandi: Soybean</strong>
                          <span>Reported by 3 Farmers (Avg: ₹4,150) vs API (₹4,250)</span>
                        </div>
                        <button className="approve-btn">Apply Correction</button>
                      </div>
                      <div className="consensus-item">
                        <div className="item-info">
                          <strong>Raipur Mandi: Tomato</strong>
                          <span>Reported by 1 Farmer (₹900) vs API (₹1,200)</span>
                        </div>
                        <button className="hold-btn">Wait for Consensus</button>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'health' && (
            <div className="tab-pane">
              <div className="health-grid">
                {Object.entries(healthStatus).map(([service, status]) => (
                  <div key={service} className={`health-card ${status}`}>
                    <div className="health-icon">{status === 'healthy' ? '✅' : '⚠️'}</div>
                    <div className="health-info">
                      <span className="service-name">{service.toUpperCase()} API</span>
                      <span className="service-status">{status.toUpperCase()}</span>
                    </div>
                    <div className="health-ping">Ping: {Math.floor(Math.random() * 30) + 110}ms</div>
                  </div>
                ))}
              </div>
              
              <div className="debug-actions" style={{ marginTop: '20px' }}>
                <h3>Rapid Response Controls</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className="sos-btn"
                    onClick={() => {
                      localStorage.clear();
                      alert('🛡️ Admin Action: API Caches Cleared. All Mandi data will be re-fetched on next visit.');
                    }}
                  >
                    Manual Refresh All API Caches
                  </button>
                  <button 
                    className="sos-btn warning"
                    onClick={() => {
                      alert('🚨 Emergency Push Protocol Initiated. Broadcast sent to all registered farmers.');
                    }}
                  >
                    Trigger Emergency Push Notification
                  </button>
                  <button 
                    className="sos-btn critical"
                    onClick={() => {
                      alert('⚙️ System Maintenance: Mandi section is now locked for all users.');
                    }}
                  >
                    Put Mandi Section in Maintenance
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
