import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart2, Rss, CloudSun } from 'lucide-react';
import './BottomNav.css';

const BottomNav = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Home size={20} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/mandi-dashboard" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <BarChart2 size={20} />
        <span>Mandi</span>
      </NavLink>
      <NavLink to="/news-radar" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Rss size={20} />
        <span>News</span>
      </NavLink>
      <NavLink to="/weather" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <CloudSun size={20} />
        <span>Weather</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
