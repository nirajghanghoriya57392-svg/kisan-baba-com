import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CropDoctor.css';

export default function CropDoctor() {
  const [searchTerm, setSearchTerm] = useState("");

  // Expert-backed E-E-A-T Database Module for Plant Protection
  const diseases = [
    {
      id: 1, crop: "Paddy (Dhan)", name: "Brown Spot / Rice Blast", icon: "🌾",
      symptoms: "Oval to cylindrical brown spots on leaves with grey centers. High humidity triggers fast spread.",
      organic: "Spray 5% Neem Seed Kernel Extract (NSKE) at early tillering stage.",
      chemical: "Tricyclazole 75% WP @ 120g per acre mixed in 200 Litres of water."
    },
    {
      id: 2, crop: "Tomato", name: "Early Blight", icon: "🍅",
      symptoms: "Target board-like irregular concentric necrotic spots on lower aging leaves.",
      organic: "Apply Trichoderma viride enriched FYM (Farm Yard Manure) to roots.",
      chemical: "Mancozeb 75% WP @ 400g/acre OR Chlorothalonil 75% WP @ 400g/acre."
    },
    {
      id: 3, crop: "Chilli", name: "Leaf Curl Virus (Whitefly Vector)", icon: "🌶️",
      symptoms: "Severe upward curling and crinkling of leaves, stunted growth, flower drop.",
      organic: "Install 15 Yellow Sticky Traps/acre. Spray pure Neem Oil (1500 ppm) @ 5ml/L.",
      chemical: "Imidacloprid 17.8 SL @ 60ml/acre in 150 Litres of water. Alternate with Spinosad."
    },
    {
      id: 4, crop: "Cotton", name: "Pink Bollworm", icon: "☁️",
      symptoms: "Rosetted flowers. Larvae feed inside bolls causing pre-mature opening and rotting.",
      organic: "Install Pheromone Traps (5/acre) at flowering. Handpick rosetted flowers.",
      chemical: "Emamectin benzoate 5% SG @ 100g/acre OR Profenofos @ 600ml/acre."
    }
  ];

  return (
    <div className="doctor-wrapper">
       <header className="kb-header micro-header" style={{borderBottom: '1px solid rgba(255,255,255,0.2)'}}>
           <Link to="/" className="back-btn">← Back to Dashboard</Link>
           <div className="kb-logo" style={{color: 'white'}}>Sanjeevani 🩺</div>
       </header>
       
       <main className="doctor-main">
          <div className="glass-card full-width-card doctor-hero">
              <h1 className="micro-title">Crop Doctor (Sanjeevani)</h1>
              <p className="micro-subtitle">Identify diseases visually and access exact chemical dilution ratios and organic remedies backed by agronomy experts.</p>
              
              <input 
                 type="text" 
                 className="rural-input doc-search" 
                 placeholder="Search Crop or Pest (e.g., Tomato Blight, Paddy Blast)..." 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
              />
          </div>

          <div className="disease-grid">
               {diseases.filter(d => d.crop.toLowerCase().includes(searchTerm.toLowerCase()) || d.name.toLowerCase().includes(searchTerm.toLowerCase())).map(d => (
                  <div className="disease-card glass-card" key={d.id}>
                      <div className="d-header">
                         <span className="d-cropTag">{d.icon} {d.crop}</span>
                         <h3>{d.name}</h3>
                      </div>
                      <div className="d-body">
                         <div className="info-block">
                           <strong>⚠️ Visual Symptoms:</strong>
                           <p>{d.symptoms}</p>
                         </div>
                         
                         <div className="treatment-block organic">
                            <strong>🌱 Organic / Safe Remedy:</strong>
                            <p>{d.organic}</p>
                         </div>
                         
                         <div className="treatment-block chemical">
                            <strong>🧪 Chemical Protocol:</strong>
                            <p>{d.chemical}</p>
                         </div>
                      </div>
                  </div>
               ))}
          </div>
       </main>
    </div>
  );
}
