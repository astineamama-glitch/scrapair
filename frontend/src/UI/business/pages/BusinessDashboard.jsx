import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../../../shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const C = {
  bright: '#64ff43', deep: '#124d05', darker: '#0a2e03', surface: '#0d3806',
  border: 'rgba(100,255,67,0.18)', borderHover: 'rgba(100,255,67,0.45)',
  text: '#e6ffe0', textMid: 'rgba(230,255,224,0.55)', textLow: 'rgba(230,255,224,0.3)',
  glow: 'rgba(100,255,67,0.22)', glowStrong: 'rgba(100,255,67,0.45)',
};

const BusinessDashboard = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const sc = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', sc);
    return () => window.removeEventListener('scroll', sc);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cardConfig = [
    { icon: '◈', title: 'Post Waste Materials', desc: 'Create a new waste post to list your recyclable materials.', action: '/business/waste-post/create', label: 'Create Post' },
    { icon: '◎', title: 'View My Posts', desc: 'View, edit, or manage your posted waste materials.', action: '/business/posts', label: 'View Posts' },
    { icon: '◉', title: 'Collection Requests', desc: 'Manage collection requests from recyclers.', action: '/business/collections', label: 'View Requests' },
    { icon: '◐', title: 'Messages', desc: 'Communicate with recyclers about your materials.', action: '/marketplace/messages', label: 'Open Messages' },
    { icon: '◆', title: 'Notifications', desc: 'View collection requests and system alerts.', action: '/notifications', label: 'View Alerts' },
    { icon: '★', title: 'Pending Approvals', desc: 'Manage approved recyclers and pickup windows.', action: '/business/pending-approvals', label: 'View Approvals' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.darker, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: 'hidden', color: C.text }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 1 }} />

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: scrollY > 60 ? 'rgba(10,46,3,0.93)' : 'transparent', backdropFilter: scrollY > 60 ? 'blur(28px)' : 'none', borderBottom: scrollY > 60 ? `1px solid ${C.border}` : '1px solid transparent', transition: 'all 0.35s ease' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(100,255,67,0.12)', border: `1px solid ${C.borderHover}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 2a6 6 0 0 1 5.917 5H10V4zm-1 0v5H3.083A6 6 0 0 1 9 4zM3.444 11H9v5.472A6.002 6.002 0 0 1 3.444 11zm6.556 5.472V11h5.556A6.002 6.002 0 0 1 10 16.472z" fill={C.bright}/>
              </svg>
            </div>
            <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.5px', color: C.text }}>ScraPair</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 14, color: C.textMid }}>Welcome, <span style={{ color: C.bright, fontWeight: 700 }}>{user?.businessName || 'Business'}</span></div>
            <button onClick={() => navigate('/edit-profile')} style={{ padding: '10px 20px', fontSize: 14, fontWeight: 700, borderRadius: 100, border: `1px solid ${C.border}`, background: 'transparent', color: C.text, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.target.style.borderColor = C.borderHover; e.target.style.background = 'rgba(100,255,67,0.05)'; }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = 'transparent'; }}>⚙️ Settings</button>
            <button onClick={handleLogout} style={{ padding: '10px 20px', fontSize: 14, fontWeight: 700, borderRadius: 100, border: 'none', background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.8), rgba(255, 80, 80, 0.8))', color: '#fff', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 16px rgba(255,107,107,0.25)' }} onMouseEnter={e => { e.target.style.boxShadow = '0 0 28px rgba(255,107,107,0.45)'; e.target.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => { e.target.style.boxShadow = '0 0 16px rgba(255,107,107,0.25)'; e.target.style.transform = 'translateY(0)'; }}>Logout</button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1360, margin: '0 auto', padding: '80px 40px 60px', position: 'relative', zIndex: 2 }}>
        <div style={{ marginBottom: 72 }}>
          <div style={{ fontSize: 12, color: C.bright, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>Dashboard</div>
          <h1 style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-1.8px', color: C.text, margin: 0, lineHeight: 1.1 }}>Manage Your<br />Waste Operations</h1>
          <p style={{ fontSize: 16, color: C.textMid, maxWidth: 500, marginTop: 20, lineHeight: 1.7 }}>Post materials, track collections, and connect with verified recyclers — all in one place.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
          {cardConfig.map((card, i) => (
            <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 22, padding: '40px 36px', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)', cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(100,255,67,0.06)'; e.currentTarget.style.borderColor = C.borderHover; e.currentTarget.style.transform = 'translateY(-5px)'; }} onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ width: 56, height: 56, background: 'rgba(100,255,67,0.1)', border: `1px solid ${C.border}`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: C.bright, marginBottom: 24, fontFamily: 'monospace' }}>{card.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: '0 0 12px', letterSpacing: '-0.3px' }}>{card.title}</h3>
              <p style={{ fontSize: 15, color: C.textMid, lineHeight: 1.75, margin: '0 0 24px' }}>{card.desc}</p>
              <button onClick={() => navigate(card.action)} style={{ width: '100%', padding: '14px 20px', fontSize: 14, fontWeight: 700, borderRadius: 100, border: 'none', background: `linear-gradient(135deg, ${C.bright}, #4de029)`, color: '#062400', cursor: 'pointer', transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)', boxShadow: `0 0 16px ${C.glowStrong}`, letterSpacing: '-0.3px' }} onMouseEnter={e => { e.target.style.transform = 'translateY(-2px) scale(1.02)'; e.target.style.boxShadow = `0 0 28px ${C.glowStrong}, 0 8px 24px rgba(100,255,67,0.35)`; }} onMouseLeave={e => { e.target.style.transform = 'translateY(0) scale(1)'; e.target.style.boxShadow = `0 0 16px ${C.glowStrong}`; }}>{card.label} →</button>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '48px 40px', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', textAlign: 'center', color: C.textLow, fontSize: 14 }}>
          <p style={{ margin: 0 }}>© 2026 ScraPair. Building a circular economy, one pickup at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default BusinessDashboard;
