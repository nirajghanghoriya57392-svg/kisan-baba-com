import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './MicroCalculators.css';

export default function FertilizerCalculator() {
  const [crop, setCrop] = useState('paddy');
  const [area, setArea] = useState(1); 
  
  // Basic NPK recommendation logic per Acre (ICAR Baselines)
  const recommendations = {
     paddy: { name: "Paddy (Kharif)", urea: 2.5, ssp: 3, mop: 1, spacing: "20x15 cm" },
     wheat: { name: "Wheat", urea: 2.5, ssp: 3, mop: 1.5, spacing: "22.5 cm rows" },
     maize: { name: "Maize", urea: 3, ssp: 2.5, mop: 1, spacing: "60x20 cm" },
     sugarcane: { name: "Sugarcane", urea: 6, ssp: 4, mop: 2, spacing: "90 cm rows" },
     cotton: { name: "Cotton (Bt)", urea: 3, ssp: 2, mop: 1, spacing: "90x90 cm" },
     tomato: { name: "Tomato", urea: 4, ssp: 3.5, mop: 2, spacing: "60x45 cm" }
  };

  const currentRec = recommendations[crop];

  return (
    <div className="micro-calc-wrapper">
       <header className="kb-header micro-header">
           <Link to="/" className="back-btn">← Back to Dashboard</Link>
           <div className="kb-logo">KisanBaba 🧪</div>
       </header>
       
       <main className="micro-main">
           <div className="glass-card full-width-card">
               <h1 className="micro-title">Fertilizer & Nutrient Calculator</h1>
               <p className="micro-subtitle">Stop guessing. Stop wasting money. Get exact ICAR-approved NPK bag requirements for your field size.</p>
               
               <div className="rural-input-group config-panel">
                   <div className="config-block">
                       <label className="rural-label">Select Your Crop</label>
                       <select className="rural-select" value={crop} onChange={e => setCrop(e.target.value)}>
                          {Object.keys(recommendations).map(k => (
                             <option key={k} value={k}>{recommendations[k].name}</option>
                          ))}
                       </select>
                   </div>
                   
                   <div className="config-block">
                       <label className="rural-label">Farm Area: <span className="rural-value">{area} Acres</span></label>
                       <input type="range" min="0.5" max="50" step="0.5" value={area} onChange={e => setArea(parseFloat(e.target.value))} />
                   </div>
               </div>

               <h3 className="results-title">Required Granular Bags (per {area} Acre)</h3>
               <div className="results-grid">
                   <div className="bag-card urea">
                      <div className="bag-icon">⚪</div>
                      <h4>Urea (Nitrogen)</h4>
                      <div className="bag-count">{Math.ceil(currentRec.urea * area)} Bags</div>
                      <small>Standard 45kg bag</small>
                   </div>
                   <div className="bag-card ssp">
                      <div className="bag-icon">🟤</div>
                      <h4>SSP (Phosphorus)</h4>
                      <div className="bag-count">{Math.ceil(currentRec.ssp * area)} Bags</div>
                      <small>Standard 50kg bag</small>
                   </div>
                   <div className="bag-card mop">
                      <div className="bag-icon">🔴</div>
                      <h4>MOP (Potash)</h4>
                      <div className="bag-count">{Math.ceil(currentRec.mop * area)} Bags</div>
                      <small>Standard 50kg bag</small>
                   </div>
               </div>
               
               <div className="pro-tip">
                  <strong>💡 Agronomy Tip:</strong> Apply 1/3rd of Urea as basal dose, and the rest in two splits at tillering and panicle initiation. 
               </div>
           </div>
       </main>
    </div>
  );
}
