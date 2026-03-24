import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  Home, 
  BarChart3, 
  Rss, 
  Heart, 
  Languages, 
  Menu, 
  X,
  Sprout,
  Sun,
  Moon
} from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [langOpen, setLangOpen] = useState(false);

  const switchLang = (code) => {
    i18n.changeLanguage(code);
    sessionStorage.setItem('kisanbaba_manual_lang', 'true');
    setLangOpen(false);
  };

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'mr', label: 'मराठी', flag: '🚩' }
  ];

  const navLinks = [
    { path: '/', label: t('nav.home'), icon: Home },
    { path: '/mandi-dashboard', label: t('nav.mandi'), icon: BarChart3 },
    { path: '/news-radar', label: t('nav.news'), icon: Rss },
    { path: '/kisan-bhai', label: t('nav.kisanBhai'), icon: Heart },
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="nav-brand">
        <motion.div
           whileHover={{ rotate: 15, scale: 1.1 }}
           transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Sprout size={32} strokeWidth={2.5} />
        </motion.div>
        <span className="brand-text">KisanBaba <span>Smart</span></span>
      </Link>
      
      {/* Desktop Menu */}
      <div className="nav-links">
        {navLinks.map((link) => (
          <Link 
            key={link.path} 
            to={link.path} 
            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            <link.icon size={20} />
            {link.label}
          </Link>
        ))}
        
        <div className="lang-dropdown-wrapper" style={{ position: 'relative' }}>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLangOpen(!langOpen)} 
            className="lang-switch"
          >
            <Languages size={18} />
            {languages.find(l => l.code === (i18n.language || 'en'))?.label || 'Language'}
          </motion.button>
          
          <AnimatePresence>
            {langOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="lang-dropdown-menu"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '10px',
                  background: 'var(--card-bg)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  padding: '8px',
                  minWidth: '150px',
                  zIndex: 1000,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }}
              >
                {languages.map(l => (
                  <button 
                    key={l.code}
                    onClick={() => switchLang(l.code)}
                    className="lang-option"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: i18n.language === l.code ? 'var(--prosperity-gold)' : 'transparent',
                      color: i18n.language === l.code ? '#1a1a1a' : 'inherit',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span>{l.flag}</span>
                    {l.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={20} fill="currentColor" /> : <Sun size={20} fill="currentColor" />}
        </motion.button>
      </div>

      {/* Mobile Nav Toggle */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }} className="mobile-only">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="theme-toggle"
          style={{ padding: '8px' }}
        >
          {theme === 'light' ? <Moon size={20} fill="currentColor" /> : <Sun size={20} fill="currentColor" />}
        </motion.button>
        <button onClick={() => setLangOpen(!langOpen)} className="lang-switch" style={{ padding: '8px 12px' }}>
          {(i18n.language || 'en').toUpperCase()}
        </button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setMenuOpen(!menuOpen)}
          className="premium-button"
          style={{ padding: '10px' }}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mobile-nav-overlay"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="mobile-menu"
            >
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setMenuOpen(false)}
                  className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
                >
                  <link.icon size={22} />
                  {link.label}
                </Link>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .mobile-only { display: none; }
        @media (max-width: 900px) {
          .mobile-only { display: flex; }
        }
      `}</style>
    </nav>
  );
}
