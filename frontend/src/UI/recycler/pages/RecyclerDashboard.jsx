import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const C = { bright: '#64ff43', darker: '#0a2e03', surface: '#0d3806', border: 'rgba(100,255,67,0.18)', text: '#e6ffe0', textMid: 'rgba(230,255,224,0.55)' };

const RecyclerDashboard = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const sc = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', sc);
    return () => window.removeEventListener('scroll', sc);
  }, []);

  const cardConfig = [
    { icon: '◈', title: 'Browse Waste Posts', desc: 'Discover and filter recyclable materials from businesses.', action: '/recycler/browse', label: 'Browse' },
    { icon: '◎', title: 'My Requests', desc: 'Track collection requests and their status.', action: '/recycler/requests', label: 'View Requests' },
    { icon: '◉', title: 'Scheduled Pickups', desc: 'Manage upcoming waste collection appointments.', action: '/recycler/pickups', label: 'View Pickups' },
    { icon: '◐', title: 'Messages', desc: 'Communicate with waste businesses.', action: '/marketplace/messages', label: 'Messages' },
    { icon: '◆', title: 'Performance', desc: 'Track your recycling impact and ratings.', action: '/recycler/performance', label: 'Analytics' },
    { icon: '★', title: 'My Reviews', desc: 'View feedback from businesses and other recyclers.', action: '/recycler/reviews', label: 'Reviews' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.darker, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: 'hidden', color: C.text }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 1 }} />

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: scrollY > 60 ? 'rgba(10,46,3,0.93)' : 'transparent', backdropFilter: scrollY > 60 ? 'blur(28px)' : 'none', borderBottom: scrollY > 60 ? `1px solid ${C.border}` : '1px solid transparent', transition: 'all 0.35s ease' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(100,255,67,0.12)', border: `1px solid rgba(100,255,67,0.45)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 2a6 6 0 0 1 5.917 5H10V4zm-1 0v5H3.083A6 6 0 0 1 9 4z" fill={C.bright}/></svg>
            </div>
            <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.5px', color: C.text }}>ScraPair</span>
          </div>
          <button onClick={() => navigate('/edit-profile')} style={{ padding: '10px 20px', fontSize: 14, fontWeight: 700, borderRadius: 100, border: `1px solid ${C.border}`, background: 'transparent', color: C.text, cursor: 'pointer' }}>⚙️ Settings</button>
        </div>
      </nav>

      <main style={{ maxWidth: 1360, margin: '0 auto', padding: '80px 40px 60px', position: 'relative', zIndex: 2 }}>
        <h1 style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-1.8px', color: C.text, margin: '0 0 40px', lineHeight: 1.1 }}>Recycler Dashboard</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
          {cardConfig.map((card, i) => (
            <div key={i} onClick={() => navigate(card.action)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 22, padding: '40px 36px', transition: 'all 0.3s', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(100,255,67,0.06)'; e.currentTarget.style.borderColor = 'rgba(100,255,67,0.45)'; e.currentTarget.style.transform = 'translateY(-5px)'; }} onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ width: 56, height: 56, background: 'rgba(100,255,67,0.1)', border: `1px solid ${C.border}`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: C.bright, marginBottom: 24 }}>{card.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: '0 0 12px' }}>{card.title}</h3>
              <p style={{ fontSize: 15, color: C.textMid, lineHeight: 1.75, margin: '0 0 24px' }}>{card.desc}</p>
              <button onClick={(e) => { e.stopPropagation(); navigate(card.action); }} style={{ width: '100%', padding: '14px 20px', fontSize: 14, fontWeight: 700, borderRadius: 100, border: 'none', background: `linear-gradient(135deg, ${C.bright}, #4de029)`, color: '#062400', cursor: 'pointer' }}>{card.label} →</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default RecyclerDashboard;
