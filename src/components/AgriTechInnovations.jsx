import React from 'react';

export default function AgriTechInnovations({ crop, t }) {
  const cropName = t(crop.nameKey);
  const techData = crop.technologies && crop.technologies.length > 0 ? crop.technologies : [
      {
        "name": `Drone-Based Liquid Fertigation for ${cropName}`,
        "desc": `Autonomous payload drones that aerially spray water-soluble micronutrients directly onto the ${cropName} canopy, reducing manual labor costs by 80% and preventing soil compaction.`
      },
      {
        "name": "AI-Powered Soil Moisture Sensors",
        "desc": `IoT probes planted near the root zone that automatically trigger the drip irrigation system only when the soil volumetric water content drops below the optimal threshold for ${cropName}, saving thousands of liters of water.`
      },
      {
        "name": "Solar-Powered Cold Storage Micro-Chambers",
        "desc": `Off-grid, solar-powered chilling units placed directly on the farm. They rapidly cool freshly harvested ${cropName} to 10°C, doubling shelf life and preventing immediate post-harvest loss.`
      },
      {
        "name": "LED Photoperiod Extension Lighting",
        "desc": `Using specialized LED grow lights strung across the trellises to trick the ${cropName} plants into flowering during the off-season, capturing premium winter market prices.`
      },
      {
        "name": "Blockchain Traceability QR Codes",
        "desc": `Printing unique, unalterable QR codes on each ${cropName} crate so premium retail buyers can verify the farm's organic pesticide records, instantly commanding a 20% higher market rate.`
      }
  ];

  return (
    <div className="agritech-section" style={{ marginTop: '50px', padding: '40px', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', borderBottom: '2px solid #f8fafc', paddingBottom: '20px' }}>
        <div style={{ fontSize: '2.5rem', background: '#eff6ff', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}>🚀</div>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0 0 5px 0' }}>5 Break-Through Technologies</h2>
          <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>Modern innovations transforming {t(crop.nameKey)} agriculture globally.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {techData.map((tech, index) => (
          <div key={index} style={{ display: 'flex', gap: '20px', background: '#f8fafc', padding: '20px', borderRadius: '16px', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ background: '#3b82f6', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', flexShrink: 0 }}>{index + 1}</div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#1e293b' }}>{tech.name}</h3>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>{tech.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
