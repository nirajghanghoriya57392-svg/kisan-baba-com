import React, { useState } from 'react';
import { Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InfoTooltip({ title, methodology, accuracy, limitations, source }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="info-tooltip-wrapper">
      <button 
        className="info-trigger-btn" 
        onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
        aria-label="View Logic and Methodology"
      >
        <Info size={16} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="info-modal-overlay"
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="info-modal-content"
            >
              <div className="info-modal-header">
                <h3>{title}</h3>
                <button onClick={() => setIsOpen(false)}><X size={20} /></button>
              </div>
              <div className="info-scroll-body">
                <div className="info-section">
                  <h4>🧠 Science & Methodology</h4>
                  <p>{methodology}</p>
                </div>
                <div className="info-section">
                  <h4>🎯 Ground Accuracy</h4>
                  <div className="accuracy-bar">
                    <div className="accuracy-fill" style={{ width: accuracy }}></div>
                  </div>
                  <span className="accuracy-label">Est. Accuracy: {accuracy}</span>
                </div>
                <div className="info-section warning">
                  <h4>⚠️ Limitations & Friction</h4>
                  <p>{limitations}</p>
                </div>
                <div className="info-section source">
                  <h4>🏛️ Authentic Data Source</h4>
                  <p>{source}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .info-tooltip-wrapper {
          display: inline-block;
          margin-left: 8px;
          vertical-align: middle;
        }
        .info-trigger-btn {
          background: hsla(222, 47%, 50%, 0.1);
          border: 1px solid hsla(222, 47%, 70%, 0.3);
          color: var(--text-muted);
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .info-trigger-btn:hover {
          background: var(--elite-navy);
          color: white;
          transform: scale(1.1);
        }
        .info-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          z-index: 9999;
        }
        .info-modal-content {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) !important;
          width: 90%;
          max-width: 450px;
          background: var(--bg-card);
          border-radius: 20px;
          border: 1px solid var(--glass-border);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          z-index: 10000;
          overflow: hidden;
        }
        .info-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: rgba(0,0,0,0.03);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        [data-theme='dark'] .info-modal-header { background: rgba(255,255,255,0.03); border-bottom-color: rgba(255,255,255,0.05); }
        .info-modal-header h3 { margin: 0; font-size: 1.1rem; color: var(--text-main); font-weight: 800; }
        .info-modal-header button { background: none; border: none; color: var(--text-muted); cursor: pointer; }
        
        .info-scroll-body {
          padding: 30px 24px;
          max-height: 75vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .info-section {
          margin-bottom: 0;
        }
        .info-section h4 {
          margin: 0 0 10px 0;
          font-size: 1.15rem;
          color: var(--text-main);
          font-weight: 900;
          letter-spacing: -0.3px;
        }
        .info-section p {
          margin: 0;
          font-size: 1.05rem;
          color: var(--text-main);
          line-height: 1.7;
          font-weight: 500;
          letter-spacing: 0.2px;
        }
        [data-theme='dark'] .info-section {
          color: rgba(255, 255, 255, 0.95);
        }
        .accuracy-bar {
          height: 10px;
          background: rgba(0,0,0,0.1);
          border-radius: 6px;
          margin-top: 8px;
          margin-bottom: 6px;
        }
        [data-theme='dark'] .accuracy-bar { background: rgba(255,255,255,0.1); }
        .accuracy-fill {
          height: 100%;
          background: var(--forest-green);
          border-radius: 6px;
        }
        [data-theme='dark'] .accuracy-fill { background: #10b981; }
        .accuracy-label { font-size: 0.85rem; font-weight: 800; color: var(--forest-green); }
        [data-theme='dark'] .accuracy-label { color: #10b981; }
        
        .info-section.warning {
          background: rgba(239, 68, 68, 0.08);
          padding: 16px;
          border-radius: 12px;
          border-left: 4px solid var(--terra-cotta);
        }
        [data-theme='dark'] .info-section.warning {
          background: rgba(239, 68, 68, 0.15);
          border-left: 4px solid #ef4444;
        }
        .info-section.warning h4 { color: #b91c1c; }
        [data-theme='dark'] .info-section.warning h4 { color: #f87171; }
        
        .info-section.source {
          background: rgba(59, 130, 246, 0.08);
          padding: 16px;
          border-radius: 12px;
          border-left: 4px solid var(--elite-navy);
        }
        [data-theme='dark'] .info-section.source {
          background: rgba(59, 130, 246, 0.15);
          border-left: 4px solid #60a5fa;
        }
        .info-section.source h4 { color: var(--elite-navy); }
        [data-theme='dark'] .info-section.source h4 { color: #93c5fd; }
      `}</style>
    </div>
  );
}
