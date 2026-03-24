import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { fetchTopTradedCommodities } from '../utils/api';
import './TickerTape.css';

const MOCK_TICKER = [
    { name: "TOMATO", icon: "🍅", mandi: "Azadpur", price: 1450, change: 50, trend: "up" },
    { name: "PADDY", icon: "🌾", mandi: "Raipur", price: 2183, change: 10, trend: "up" },
    { name: "ONION", icon: "🧅", mandi: "Lasalgaon", price: 1800, change: -120, trend: "down" },
    { name: "WHEAT", icon: "🌾", mandi: "Khanna", price: 2425, change: 15, trend: "up" },
    { name: "SOYBEAN", icon: "🫘", mandi: "Indore", price: 5328, change: 436, trend: "up" },
];

export default function TickerTape() {
    const [items, setItems] = useState(MOCK_TICKER);

    useEffect(() => {
        loadTicker();
    }, []);

    async function loadTicker() {
        const realData = await fetchTopTradedCommodities();
        if (realData && realData.length > 0) {
            setItems(realData);
        }
    }

    return (
        <div className="ticker-tape-container">
            <div className="ticker-label">LIVE MARKET FEED</div>
            <div className="ticker-wrapper">
                <motion.div 
                    className="ticker-track"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ 
                        duration: 30, 
                        repeat: Infinity, 
                        ease: "linear" 
                    }}
                >
                    {[...items, ...items, ...items].map((item, i) => (
                        <div key={i} className="ticker-item">
                            <span className="ticker-icon">{item.icon}</span>
                            <span className="ticker-name">{item.name}</span>
                            {item.mandi && <span className="ticker-mandi">({item.mandi})</span>}
                            <span className="ticker-price">₹{item.price?.toLocaleString('en-IN')}</span>
                            <div className={`ticker-stats ${item.trend}`}>
                                {item.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                <span>{Math.abs(item.change || 0)}</span>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
