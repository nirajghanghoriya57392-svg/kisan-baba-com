import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './NewsRadar.css';

export default function NewsRadar() {
  const [filter, setFilter] = useState('All');

  // Hardcoded curated news stream mimicking an RSS aggregator backend
  const newsStream = [
    {
      id: 1, 
      category: "Tech & Innovation", 
      headline: "Drone Spraying Subsidy Increased by 50% for FPOs",
      summary: "The Agriculture Ministry has announced an immediate release of massive funds specifically for Farmer Producer Organizations purchasing precision agricultural spray drones this quarter.",
      impact: "Reduces your pesticide and nano-urea spraying cost by 40% per acre and completely eliminates human respiratory hazards.",
      implementation: "Do not buy a drone individually. Cluster 10 farmers in your village, register an FPO, and apply at your nearest Krishi Vigyan Kendra (KVK).",
      quote: "Technology is not replacing the Indian farmer; it is finally giving him wings.",
      color: "#0284c7" // light blue
    },
    {
      id: 2, 
      category: "Disaster Alert", 
      headline: "Alert: Super-Cyclone 'Mocha' Trajectory Shift",
      summary: "IMD confirms the cyclone trajectory has shifted inward. High sustained winds of 90kmph expected across coastal districts starting Thursday night.",
      impact: "Immediate threat of lodging to mature standing paddy crops and massive destruction to banana plantations.",
      implementation: "Harvest mature crops within 48 hours. Postpone all fertilizer applications. Ensure proper field drainage to prevent water stagnation.",
      quote: "Nature is unpredictable, but a prepared farmer is unbreakable.",
      color: "#dc2626" // red
    },
    {
      id: 3, 
      category: "Market & Economy", 
      headline: "MSP for Pulses Hiked by ₹400/Quintal for Kharif",
      summary: "Cabinet approves the highest ever Minimum Support Price hike for Moong and Tur (Pigeon Pea) to reduce reliance on international pulse imports.",
      impact: "Massive profitability bump for pulse growers compared to traditional water-heavy crops like Paddy.",
      implementation: "Shift 20% of your Paddy acreage to Moong this season. Buy certified seeds early from state seed corporations before shortages hit.",
      quote: "Smart farming is growing what the market demands, not just what the soil allows.",
      color: "#16a34a" // green
    }
  ];

  const filteredNews = filter === 'All' ? newsStream : newsStream.filter(n => n.category === filter);

  return (
    <div className="radar-wrapper">
       <header className="kb-header micro-header radar-header">
           <Link to="/" className="back-btn">← Back to Dashboard</Link>
           <div className="kb-logo">5-Min News Radar 📡</div>
       </header>

       <main className="radar-main">
          <div className="radar-hero">
              <h1 className="micro-title">5-Min Actionable Radar</h1>
              <p className="micro-subtitle">We read 100+ boring agriculture articles daily so you don't have to. Here are the top 3 things you <strong>must</strong> know today to stay profitable.</p>
              
              <div className="radar-filters">
                 {['All', 'Tech & Innovation', 'Market & Economy', 'Disaster Alert'].map(f => (
                    <button 
                       key={f} 
                       className={`radar-filter-btn ${filter === f ? 'active' : ''}`}
                       onClick={() => setFilter(f)}
                    >
                       {f}
                    </button>
                 ))}
              </div>
          </div>

          <div className="news-feed">
              {filteredNews.map(news => (
                  <div className="smart-card glass-card" key={news.id} style={{borderTop: `4px solid ${news.color}`}}>
                     <div className="card-category" style={{color: news.color}}>{news.category}</div>
                     <h2 className="card-headline">{news.headline}</h2>
                     <p className="card-summary">{news.summary}</p>
                     
                     <div className="action-grid">
                        <div className="action-box">
                           <h3>🤔 Why is this important?</h3>
                           <p>{news.impact}</p>
                        </div>
                        <div className="action-box">
                           <h3>🚀 What should you do?</h3>
                           <p><strong>{news.implementation}</strong></p>
                        </div>
                     </div>
                     
                     <blockquote className="radar-quote">
                        {news.quote}
                     </blockquote>
                     
                     <div className="card-footer">
                        <button className="read-more-btn">Read the Hindi / Native Translation 🌐</button>
                     </div>
                  </div>
              ))}
          </div>
       </main>
    </div>
  );
}
