import React, { useState, useEffect } from 'react';

const C = { bright: '#64ff43', darker: '#0a2e03', surface: '#0d3806', border: 'rgba(100,255,67,0.18)', text: '#e6ffe0', textMid: 'rgba(230,255,224,0.55)' };

const BusinessAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState({ totalPosts: 0, activeRequests: 0, completedPickups: 0, wasteProcessed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // API call for analytics
      setAnalytics({ totalPosts: 12, activeRequests: 3, completedPickups: 8, wasteProcessed: 2560 });
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: 40 }}>Loading analytics...</div>;

  const statCards = [
    { label: 'Total Posts', value: analytics.totalPosts, icon: '◈' },
    { label: 'Active Requests', value: analytics.activeRequests, icon: '◎' },
    { label: 'Completed Pickups', value: analytics.completedPickups, icon: '◉' },
    { label: 'Total Waste Processed (kg)', value: analytics.wasteProcessed, icon: '◆' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: '40px', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <h2>Analytics & Performance</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginTop: 32 }}>
        {statCards.map((card, i) => (
          <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{card.icon}</div>
            <p style={{ margin: '0 0 8px', color: C.textMid, fontSize: 13 }}>{card.label}</p>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: C.bright }}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessAnalyticsPage;
