import React, { useState, useEffect } from 'react';

const C = { bright: '#64ff43', darker: '#0a2e03', surface: '#0d3806', border: 'rgba(100,255,67,0.18)', text: '#e6ffe0', textMid: 'rgba(230,255,224,0.55)' };

const RecyclerPerformancePage = () => {
  const [perfData, setPerfData] = useState({ totalPickups: 0, totalWaste: 0, averageRating: 0, reviewCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      setPerfData({ totalPickups: 15, totalWaste: 3420, averageRating: 4.7, reviewCount: 18 });
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: 40 }}>Loading performance data...</div>;

  const stats = [
    { label: 'Total Pickups', value: perfData.totalPickups, icon: '◎' },
    { label: 'Total Waste Processed (kg)', value: perfData.totalWaste, icon: '◆' },
    { label: 'Average Rating', value: `${perfData.averageRating}★`, icon: '★' },
    { label: 'Total Reviews', value: perfData.reviewCount, icon: '◉' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: '40px', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <h2>Your Performance</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginTop: 32 }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{stat.icon}</div>
            <p style={{ margin: '0 0 8px', color: C.textMid, fontSize: 13 }}>{stat.label}</p>
            <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: C.bright }}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecyclerPerformancePage;
