import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Globe, ShieldCheck, MessageCircle, UserCircle, Heart, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Footer.css';

export default function Footer() {
  const { t, i18n } = useTranslation();
  const [feedbackStatus, setFeedbackStatus] = useState('idle'); // idle, rating, details, success
  const [userRating, setUserRating] = useState(0);
  const [detailedRatings, setDetailedRatings] = useState({ accuracy: 0, reliability: 0, functionality: 0 });

  return (
    <footer className="kb-footer">
      <div className="footer-container">
        
        <div className="footer-brand">
           <div className="footer-logo">
             <Sprout size={40} className="sprout-icon" strokeWidth={3} />
             KisanBaba
           </div>
           <p>
              {t('footer.brand_mission', { defaultValue: 'Empowering every Indian farmer with deep technology, actionable truth, and unwavering hope.' })}
              <Heart size={16} fill="var(--terra-cotta)" color="var(--terra-cotta)" style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
           </p>
        </div>

        {/* Elite EEAT Author & Disclaimer Section */}
        <div className="footer-eeat-section">
          <div className="eeat-author">
            <div className="author-avatar-wrapper">
              <img src="https://ui-avatars.com/api/?name=Dr+Niraj+Ghanghoriya&background=047857&color=fff&size=128&bold=true" alt="Dr Niraj Ghanghoriya" className="author-avatar" />
              <div className="author-badge">{t('footer.author.badge', { defaultValue: 'Expert Creator' })}</div>
            </div>
            <div className="author-content">
              <h3>{t('footer.author.title')}</h3>
              <p className="author-title">{t('footer.author.role')}</p>
              <p className="author-mission">
                {t('footer.author.bio')}
              </p>
            </div>
          </div>
          
          <div className="eeat-disclaimer">
            <h4>⚠️ {i18n.language === 'hi' ? 'महत्वपूर्ण डिस्क्लेमर (चेतावनी)' : 'Platform Disclaimer'}</h4>
            <p>
              {t('footer.disclaimer')}
            </p>
            
            {/* Global Star Rating Feedback */}
            <div className="feedback-container" style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
              {feedbackStatus === 'idle' && (
                <button 
                  className="footer-feedback-trigger"
                  onClick={() => setFeedbackStatus('rating')}
                  style={{ background: 'var(--prosperity-gold)', border: 'none', padding: '10px 20px', borderRadius: '50px', fontWeight: '900', cursor: 'pointer', color: '#1a1a1a' }}
                >
                  ⭐ {t('footer.feedback.title')}
                </button>
              )}

              {feedbackStatus === 'rating' && (
                <div className="star-rating-box" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star}
                        size={24}
                        fill={star <= userRating ? 'var(--prosperity-gold)' : 'none'}
                        color={star <= userRating ? 'var(--prosperity-gold)' : 'rgba(255,255,255,0.3)'}
                        style={{ cursor: 'pointer' }}
                        onClick={() => { setUserRating(star); setFeedbackStatus('details'); }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{i18n.language === 'hi' ? 'अपनी रेटिंग चुनें' : 'Select your rating'}</span>
                </div>
              )}

              {feedbackStatus === 'details' && (
                <div className="detailed-feedback-box" style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  padding: '15px', 
                  borderRadius: '16px', 
                  marginTop: '10px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: 'var(--prosperity-gold)', fontWeight: '700', lineHeight: 1.4 }}>
                    ❤️ {t('footer.feedback.mission', { defaultValue: "Help us build India's most advanced tool. Your feedback makes this tech world-class!" })}
                  </p>
                  
                  <div className="param-rows" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '15px' }}>
                    {['accuracy', 'reliability', 'functionality'].map(param => (
                       <div key={param} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>{t(`footer.feedback.params.${param}`)}</span>
                         <div style={{ display: 'flex', gap: '4px' }}>
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star 
                                key={s} 
                                size={14} 
                                fill={s <= detailedRatings[param] ? 'var(--prosperity-gold)' : 'none'}
                                color={s <= detailedRatings[param] ? 'var(--prosperity-gold)' : 'rgba(255,255,255,0.2)'}
                                onClick={() => setDetailedRatings(prev => ({ ...prev, [param]: s }))}
                                style={{ cursor: 'pointer' }}
                              />
                            ))}
                         </div>
                       </div>
                    ))}
                  </div>
                  
                  <button 
                    className="submit-feedback-btn"
                    onClick={() => setFeedbackStatus('success')}
                    style={{ 
                      width: '100%', 
                      background: 'var(--forest-green)', 
                      border: 'none', 
                      padding: '8px', 
                      borderRadius: '8px', 
                      color: 'white', 
                      fontWeight: '800', 
                      cursor: 'pointer' 
                    }}
                  >
                    {t('footer.feedback.submit', { defaultValue: 'Submit My Feedback' })}
                  </button>
                </div>
              )}

              {feedbackStatus === 'success' && (
                <div style={{ color: 'var(--prosperity-gold)', fontWeight: '800', fontSize: '0.9rem' }}>
                  🎉 {t('footer.feedback.success')}
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className="footer-nav">
           <Link to="/" className="footer-link"><Globe size={18} /> {t('nav.home', { defaultValue: 'Home' })}</Link>
           <Link to="/mandi-dashboard" className="footer-link">{t('nav.mandi', { defaultValue: 'Mandi Bhav' })}</Link>
           <a href="#" className="footer-link"><ShieldCheck size={18} /> {t('footer.privacy', { defaultValue: 'Privacy' })}</a>
           <a href="#" className="footer-link"><MessageCircle size={18} /> {t('footer.contact', { defaultValue: 'Contact' })}</a>
           <Link to="/admin/mandi" className="footer-link admin"><ShieldCheck size={18} /> {t('nav.admin', { defaultValue: 'Mandi Control Panel' })}</Link>
        </nav>

        <div className="footer-bottom">
           © {new Date().getFullYear()} KisanBaba. Made with pride for Bharat.
        </div>
      </div>
    </footer>
  );
}
