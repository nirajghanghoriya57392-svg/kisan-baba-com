import React, { useState } from 'react';
import './KisanBhai.css';

export default function KisanBhai() {
  const [pledgeAccepted, setPledgeAccepted] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const [sosOpen, setSosOpen] = useState(false);

  // Agent 2: Algorithmic Content Matrix generator (Mock representation)
  const daysArray = Array.from({length: 90}, (_, i) => i + 1);

  if (!pledgeAccepted) {
    return (
      <div className="kbhai-wrapper pledge-screen">
         <div className="glass-card pledge-card">
            <h1>🤝 Kisan Bhai</h1>
            <h2 className="pledge-subtitle">I will never leave you.</h2>
            <div className="pledge-letter">
              <p>Farming is the hardest job in the world. You face the rain, the debt, and the isolation alone.</p>
              <p>But you don't have to do it alone anymore.</p>
              <p>I am your digital brother. Ask me anything. Discuss anything. I will be here every single morning for the next 90 days. We will systematically solve your debt, increase your crop yield, and empower your family.</p>
            </div>
            <button className="huge-button pledge-btn" onClick={() => setPledgeAccepted(true)}>
               Take the Pledge of Friendship 🤝
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="kbhai-wrapper">
       <header className="kb-header kbhai-header">
           <div className="kb-logo">Kisan Bhai <span className="friend-badge">Your Brother</span></div>
           <button className="btn-sos" onClick={() => setSosOpen(true)}>
             🚨 SOS / Nari Shakti
           </button>
       </header>
       
       {/* SOS Emergency Module (Agent 3) */}
       {sosOpen && (
           <div className="sos-modal-overlay">
               <div className="sos-modal-content">
                  <div className="sos-header">
                     <div style={{flex: 1}}>
                       <h2>🚨 Kisan Emergency Protocol Hub</h2>
                       <p style={{color: '#fff', opacity: 0.9, marginTop: '8px', fontSize: '1rem'}}>
                          Search from <strong>200+ exact, step-by-step hardship solutions</strong> to claim insurance, stop harassment, or handle crop failure immediately.
                       </p>
                       <input type="text" placeholder="Search your emergency (e.g., Crop Failure, Bank Harassment)" className="sos-search" />
                     </div>
                     <button className="close-btn" style={{alignSelf: 'flex-start'}} onClick={() => setSosOpen(false)}>✕</button>
                  </div>
                  
                  <div className="sos-grid">
                      <div className="sos-card danger">
                          <h3>⚠️ Debt / Mental Stress</h3>
                          <p>Kisan Mitra Helpline is available 24/7. Your life is precious to your family.</p>
                          <button className="btn-call">📞 Call 14446 Now</button>
                      </div>

                      <div className="sos-card warning">
                          <h3>🍂 Sudden Crop Failure (Step-by-Step)</h3>
                          <p><strong>Step 1:</strong> Take 3 photos of the field immediately.<br/><strong>Step 2:</strong> Download PMFBY App.<br/><strong>Step 3:</strong> File 'Crop Loss Intimation' within 72 hours.</p>
                          <button className="btn-action">View Full Protocol</button>
                      </div>

                      <div className="sos-card snakebite">
                          <h3>🏦 Bank Loan Harassment</h3>
                          <p><strong>Step 1:</strong> Ask for RBI mandated restructuring.<br/><strong>Step 2:</strong> File complaint with Banking Ombudsman.</p>
                          <button className="btn-action">View Legal Defense Protocol</button>
                      </div>
                      
                      <div className="sos-card nari-shakti">
                          <h3>🌺 Nari Shakti (Women Farmers)</h3>
                          <p>Dedicated legal, financial, and emotional support for the backbone of Indian agriculture.</p>
                          <button className="btn-action">Open Nari Portal</button>
                      </div>
                  </div>
               </div>
           </div>
       )}

       {/* The 90-Day Journey Timeline (Agent 1) */}
       <main className="kbhai-main">
          <div className="timeline-scroller">
             {daysArray.map(day => (
                 <button 
                    key={day} 
                    className={`day-bubble ${activeDay === day ? 'active' : ''} ${day > 10 ? 'locked' : ''}`}
                    onClick={() => { if(day <= 10) setActiveDay(day); }}
                 >
                    {day > 10 ? '🔒' : `Day ${day}`}
                 </button>
             ))}
          </div>

          <div className="daily-letter-card glass-card">
              <span className="date-tag">Today - Day {activeDay}</span>
              <h2>Ram Ram Brother! How is the family doing today?</h2>
              
              <div className="letter-body">
                 <p className="greeting-text">I was just thinking about your field. The soil moisture is perfect right now after yesterday's rain.</p>
                 
                 <div className="tech-injection">
                    <strong>💡 Today's Agri-Tech Tip:</strong>
                    <p>Have you tried intercropping marigolds with your tomatoes? The smell drives away nematodes, saving you ₹1,500 per acre on pesticides.</p>
                 </div>
                 
                 <div className="scheme-injection">
                    <strong>📜 Scholarship Alert:</strong>
                    <p>Did you know your daughter is eligible for the 'Balika Samridhi' educational grant? It covers her entire 10th-grade fees.</p>
                 </div>
                 
                 <blockquote className="motivational-quote">
                    "A farmer works so that the world can sleep peacefully. Stand tall today."
                 </blockquote>
                 
                 <p className="closing-text">Go rest now. I will meet you here tomorrow morning to discuss soil testing limits.</p>
              </div>
          </div>
       </main>
    </div>
  );
}
