import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import MasterCalculator from './components/MasterCalculator';
import HomePage from './pages/HomePage';
import KisanBhai from './pages/KisanBhai';
import FertilizerCalculator from './pages/FertilizerCalculator';
import SeedRateCalculator from './pages/SeedRateCalculator';
import CropDoctor from './pages/CropDoctor';
import AnimalHusbandry from './pages/AnimalHusbandry';
import NewsRadar from './pages/NewsRadar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminDashboard from './pages/AdminDashboard';
import MandiDashboard from './pages/MandiDashboard';
import MandiAdmin from './pages/MandiAdmin';
import TickerTape from './components/TickerTape';
import BottomNav from './components/BottomNav';

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    className="page-transition-wrapper"
  >
    {children}
  </motion.div>
);

function AppContent() {
  const location = useLocation();
  
  return (
    <>
      <TickerTape />
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
          <Route path="/calculator/:slug" element={<PageWrapper><MasterCalculator /></PageWrapper>} />
          <Route path="/kisan-bhai" element={<PageWrapper><KisanBhai /></PageWrapper>} />
          <Route path="/fertilizer-calculator" element={<PageWrapper><FertilizerCalculator /></PageWrapper>} />
          <Route path="/seed-rate-calculator" element={<PageWrapper><SeedRateCalculator /></PageWrapper>} />
          <Route path="/crop-doctor" element={<PageWrapper><CropDoctor /></PageWrapper>} />
          <Route path="/animal-husbandry" element={<PageWrapper><AnimalHusbandry /></PageWrapper>} />
          <Route path="/news-radar" element={<PageWrapper><NewsRadar /></PageWrapper>} />
          <Route path="/admin" element={<AdminDashboard />}>
            <Route path="mandi" element={<MandiAdmin />} />
          </Route>
          <Route path="/mandi-dashboard" element={<PageWrapper><MandiDashboard /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
      <Footer />
      <BottomNav />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
