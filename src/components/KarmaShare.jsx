import React, { useState, useEffect } from 'react';
import './KarmaShare.css';

export default function KarmaShare() {
  const [karmaPoints, setKarmaPoints] = useState(0);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    const savedKarma = localStorage.getItem('kisan_karma') || 0;
    setKarmaPoints(parseInt(savedKarma, 10));
  }, []);

  const handleShare = () => {
     // Engineered Viral Copy tailored for rural emotional pride
     const message = `🙏 Ram Ram Farmer Brothers! I just found KisanBaba, a free app that tells us the EXACT fertilizer needed per acre so we don't waste money, plus weather alerts and a Crop Doctor.\n\nI am proudly sharing this to help our community thrive. We feed the nation. Let's unite.\n\n👉 Join me here: https://kisanbaba.com`;
     const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
     window.open(url, '_blank');
     
     const newKarma = karmaPoints + 50;
     setKarmaPoints(newKarma);
     localStorage.setItem('kisan_karma', newKarma);
     
     setShowBadge(true);
     setTimeout(() => setShowBadge(false), 4000);
  };

  return (
      <div className="karma-floating-container">
          {showBadge && (
             <div className="karma-popup">
                🌟 +50 Karma! You are now a <strong>Community Sahaayak</strong>. The nation is proud of you.
             </div>
          )}
          <div className="karma-score" title="Your contribution to the farming community">
              <span className="score-icon">🪷</span>
              <div className="score-text">
                 <strong>{karmaPoints}</strong>
                 <span>Karma Points</span>
              </div>
          </div>
          <button className="btn-whatsapp-share" onClick={handleShare}>
              <span className="wa-icon">WhatsApp</span> Share to Community
          </button>
      </div>
  )
}
