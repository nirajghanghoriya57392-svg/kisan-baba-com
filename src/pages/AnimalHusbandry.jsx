import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AnimalHusbandry.css';

export default function AnimalHusbandry() {
  const [milkYield, setMilkYield] = useState(10); // Liters per day
  const [bodyWeight, setBodyWeight] = useState(400); // KG
  const [tab, setTab] = useState('feed'); // 'feed' or 'vaccine'

  // Simplified Feed Calculation Logic (Based on NDDB Baselines)
  const maintenanceDryMatter = bodyWeight * 0.02; // 2% of body weight
  const productionDryMatter = milkYield * 0.4;
  const totalDryMatter = (maintenanceDryMatter + productionDryMatter).toFixed(1);
  
  const greenFodder = ((totalDryMatter * 0.6) * 4).toFixed(1); // 60% of DM from roughage, requiring 4x due to 25% DM in green fodder
  const dryFodder = ((totalDryMatter * 0.4) * 1.1).toFixed(1); // 40% from dry, 90% DM
  const concentrate = (milkYield * 0.4).toFixed(1); // 400g concentrate per liter of milk

  const vaccines = [
    { name: "Foot and Mouth Disease (FMD)", animal: "Cow/Buffalo", schedule: "Twice a year (Feb/Mar, Sep/Oct)", age: "Above 4 months", icon: "🐄" },
    { name: "Lumpy Skin Disease (LSD)", animal: "Cow", schedule: "Once a year (Pre-monsoon)", age: "Above 3 months", icon: "🦠" },
    { name: "Brucellosis", animal: "Female Calf", schedule: "Once in lifetime", age: "4 to 8 months", icon: "💉" },
    { name: "Peste des Petits Ruminants (PPR)", animal: "Goat/Sheep", schedule: "Once in 3 years", age: "Above 3 months", icon: "🐐" },
    { name: "Ranikhet Disease", animal: "Poultry", schedule: "Week 1, Week 4 (Booster)", age: "7 days", icon: "🐔" }
  ];

  return (
    <div className="animal-wrapper">
       <header className="kb-header micro-header animal-header">
           <Link to="/" className="back-btn">← Back to Dashboard</Link>
           <div className="kb-logo">Pashupalan Hub 🐄</div>
       </header>

       <main className="animal-main">
          <div className="glass-card full-width-card animal-hero">
              <h1 className="micro-title">Animal Husbandry & Dairy</h1>
              <p className="micro-subtitle">Maximize milk yields with scientific feed mixing and protect your livestock from deadly outbreaks.</p>
              
              <div className="tab-switcher">
                  <button className={`tab-btn ${tab === 'feed' ? 'active' : ''}`} onClick={() => setTab('feed')}>🌾 Feed Mixer Pro</button>
                  <button className={`tab-btn ${tab === 'vaccine' ? 'active' : ''}`} onClick={() => setTab('vaccine')}>💉 Vaccination Calendar</button>
              </div>
          </div>

          {tab === 'feed' && (
             <div className="glass-card feed-mixer-card">
                 <h2 className="section-heading">Dairy Feed Formulation Matrix</h2>
                 <p>Calculate the exact daily dietary requirement to prevent malnutrition and boost milk fat %.</p>
                 
                 <div className="rural-input-group config-panel" style={{marginTop: '30px'}}>
                     <div className="config-block">
                         <label className="rural-label">Daily Milk Yield: <span className="rural-value">{milkYield} Liters</span></label>
                         <input type="range" min="2" max="30" step="1" value={milkYield} onChange={e => setMilkYield(parseFloat(e.target.value))} />
                     </div>
                     <div className="config-block">
                         <label className="rural-label">Cow/Buffalo Body Wt: <span className="rural-value">{bodyWeight} KG</span></label>
                         <input type="range" min="250" max="700" step="50" value={bodyWeight} onChange={e => setBodyWeight(parseFloat(e.target.value))} />
                     </div>
                 </div>

                 <div className="results-grid feed-results">
                     <div className="bag-card green-fodder">
                        <h4>Green Fodder</h4>
                        <div className="bag-count">{greenFodder} <span style={{fontSize: '1rem'}}>KG</span></div>
                        <small>Maize / Sorghum</small>
                     </div>
                     <div className="bag-card dry-fodder">
                        <h4>Dry Fodder</h4>
                        <div className="bag-count">{dryFodder} <span style={{fontSize: '1rem'}}>KG</span></div>
                        <small>Wheat Straw / Paddy Straw</small>
                     </div>
                     <div className="bag-card concentrate">
                        <h4>Concentrate Feed</h4>
                        <div className="bag-count">{concentrate} <span style={{fontSize: '1rem'}}>KG</span></div>
                        <small>Cakes, Bran, Minerals</small>
                     </div>
                 </div>
                 
                 <div className="alert-box" style={{marginTop: '25px', borderColor: '#81C784'}}>
                    <strong>💡 Expert Tip:</strong> Always add 50g Mineral Mixture and 30g Salt daily to the concentrate to prevent reproductive failures.
                 </div>
             </div>
          )}

          {tab === 'vaccine' && (
             <div className="vaccine-grid">
                {vaccines.map((v, i) => (
                    <div className="glass-card v-card" key={i}>
                       <div className="v-icon">{v.icon}</div>
                       <div className="v-data">
                          <h3>{v.name}</h3>
                          <div className="v-row"><span>Livestock:</span> <strong>{v.animal}</strong></div>
                          <div className="v-row"><span>Right Age:</span> <strong>{v.age}</strong></div>
                          <div className="v-schedule">📅 {v.schedule}</div>
                       </div>
                    </div>
                ))}
             </div>
          )}
       </main>
    </div>
  );
}
