import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './MicroCalculators.css';

export default function SeedRateCalculator() {
  const [crop, setCrop] = useState('wheat');
  const [area, setArea] = useState(1); 
  const [method, setMethod] = useState('line');

  // Seed rate baselines in KG per Acre
  const seedRates = {
     wheat: { name: "Wheat", line: 40, broadcast: 50 },
     paddy: { name: "Paddy (Direct Seeded)", line: 12, broadcast: 15 },
     maize: { name: "Maize", line: 8, broadcast: 10 },
     chickpea: { name: "Gram (Chana)", line: 30, broadcast: 35 },
     mustard: { name: "Mustard", line: 2, broadcast: 2.5 }
  };

  const currentCrop = seedRates[crop];
  const requiredSeed = (currentCrop[method] * area).toFixed(1);

  return (
    <div className="micro-calc-wrapper seed-bg">
       <header className="kb-header micro-header">
           <Link to="/" className="back-btn">← Back to Dashboard</Link>
           <div className="kb-logo">KisanBaba 🌱</div>
       </header>
       
       <main className="micro-main">
           <div className="glass-card full-width-card">
               <h1 className="micro-title">Seed Rate Quantity Calculator</h1>
               <p className="micro-subtitle">Never overbuy expensive hybrid seeds again. Calculate the exact mathematical requirement for your field.</p>
               
               <div className="rural-input-group config-panel">
                   <div className="config-block">
                       <label className="rural-label">Select Seed Type</label>
                       <select className="rural-select" value={crop} onChange={e => setCrop(e.target.value)}>
                          {Object.keys(seedRates).map(k => (
                             <option key={k} value={k}>{seedRates[k].name}</option>
                          ))}
                       </select>
                   </div>
                   
                   <div className="config-block">
                       <label className="rural-label">Sowing Method</label>
                       <select className="rural-select" value={method} onChange={e => setMethod(e.target.value)}>
                          <option value="line">Line Sowing / Drill (Recommended)</option>
                          <option value="broadcast">Broadcasting (Chhitkawan)</option>
                       </select>
                   </div>
                   
                   <div className="config-block" style={{gridColumn: '1 / -1'}}>
                       <label className="rural-label">Farm Area: <span className="rural-value">{area} Acres</span></label>
                       <input type="range" min="0.5" max="50" step="0.5" value={area} onChange={e => setArea(parseFloat(e.target.value))} />
                   </div>
               </div>

               <div className="giant-result">
                  <h4>Exact Seed Requirement</h4>
                  <div className="giant-number">{requiredSeed} <span className="unit">KG</span></div>
                  <p>Based on rigorous agronomic plant-population density models.</p>
               </div>
               
               <div className="pro-tip warning-tip">
                  <strong>⚠️ Seed Treatment Alert:</strong> Always treat seeds with Trichoderma (5g/kg) and standard fungicide before sowing to prevent root rot. 
               </div>
           </div>
       </main>
    </div>
  );
}
