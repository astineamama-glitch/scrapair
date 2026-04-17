import React, { useState, useEffect } from 'react';

const C = { bright: '#64ff43', darker: '#0a2e03', surface: '#0d3806', border: 'rgba(100,255,67,0.18)', text: '#e6ffe0', textMid: 'rgba(230,255,224,0.55)' };

const ScheduledPickupsPage = () => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPickups();
  }, []);

  const fetchPickups = async () => {
    try {
      setLoading(true);
      // API call for pickups
      setPickups([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: 40 }}>Loading pickups...</div>;

  return (
    <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: '40px', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <h2>Scheduled Pickups</h2>

      {pickups.length === 0 ? (
        <p style={{ color: C.textMid }}>No scheduled pickups.</p>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {pickups.map((pickup) => (
            <div key={pickup.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>{pickup.businessName}</h3>
                  <p style={{ margin: '0 0 4px', fontSize: 14, color: C.textMid }}>{pickup.wasteMaterial} • {pickup.quantity}</p>
                  <p style={{ margin: 0, fontSize: 13, color: C.textMid }}>📍 {pickup.location}</p>
                </div>
                <span style={{ background: 'rgba(100,255,67,0.2)', color: C.bright, padding: '6px 12px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>
                  Scheduled
                </span>
              </div>
              <p style={{ margin: '0 0 12px', paddingTop: 12, borderTop: `1px solid ${C.border}`, color: C.textMid, fontSize: 14 }}>📅 {pickup.scheduledDate} at {pickup.scheduledTime}</p>
              <button style={{ padding: '8px 16px', background: C.border, border: 'none', borderRadius: 6, color: C.text, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Contact Business</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduledPickupsPage;
