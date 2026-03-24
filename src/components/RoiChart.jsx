import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RoiChart({ projectionData }) {
  if (!projectionData || projectionData.length === 0) return null;

  return (
    <div className="roi-chart-wrapper" style={{ width: '100%', height: 350, marginTop: '40px', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)'}}>
      <h3 style={{ color: 'white', marginTop: 0, marginBottom: '20px', fontSize: '1.2rem', textAlign: 'center' }}>5-Year Dynamic Cashflow Analyzer</h3>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={projectionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCashflow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="year" stroke="#94a3b8" tickFormatter={(tick) => `Yr ${tick}`}/>
          <YAxis stroke="#94a3b8" tickFormatter={(value) => `₹${(value/100000).toFixed(1)}L`} width={60} />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <Tooltip 
             contentStyle={{ backgroundColor: 'rgba(24,24,27,0.95)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', color: 'white' }}
             itemStyle={{ color: '#fff', fontWeight: 'bold' }}
             formatter={(value) => `₹ ${value.toLocaleString('en-IN')}`}
             labelStyle={{ color: '#94a3b8', marginBottom: '5px' }}
          />
          <Area type="monotone" dataKey="exp" name="Total Expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
          <Area type="monotone" dataKey="rev" name="Total Revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCashflow)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
