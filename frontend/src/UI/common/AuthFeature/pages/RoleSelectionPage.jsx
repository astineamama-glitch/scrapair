import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── Color tokens ────────────────────────────────────────────
   bright  : #64ff43  (electric lime-green – CTA, glows, accents)
   deep    : #124d05  (forest dark – surfaces, cards)
   darker  : #0a2e03  (near-black base)
   surface : #0d3806  (card backgrounds)
   text    : #e6ffe0  (off-white tinted green)
──────────────────────────────────────────────────────────── */
const C = {
  bright:      '#64ff43',
  deep:        '#124d05',
  darker:      '#0a2e03',
  surface:     '#0d3806',
  border:      'rgba(100,255,67,0.18)',
  borderHover: 'rgba(100,255,67,0.45)',
  text:        '#e6ffe0',
  textMid:     'rgba(230,255,224,0.55)',
  textLow:     'rgba(230,255,224,0.3)',
  glow:        'rgba(100,255,67,0.22)',
  glowStrong:  'rgba(100,255,67,0.45)',
};

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [buttonHover, setButtonHover] = useState(null);

  useEffect(() => {
    const mm = (e) => setMouse({ x: e.clientX, y: e.clientY });
    const sc = () => setScrollY(window.scrollY);
    window.addEventListener('mousemove', mm);
    window.addEventListener('scroll', sc);
    return () => { 
      window.removeEventListener('mousemove', mm); 
      window.removeEventListener('scroll', sc); 
    };
  }, []);

  const roles = [
    {
      id: 'business',
      title: 'Business Owner',
      desc: 'Post recyclable materials and connect with verified recyclers',
      icon: '◈',
      route: '/business/login',
      details: ['Post scrap materials', 'Track pickups', 'Get compliance reports'],
    },
    {
      id: 'recycler',
      title: 'Recycler',
      desc: 'Find and manage materials for recycling operations',
      icon: '◎',
      route: '/recycler/login',
      details: ['Discover materials', 'Manage collections', 'Grow your business'],
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.darker, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: 'hidden', color: C.text }}>

      {/* Ambient cursor glow */}
      <div style={{ position: 'fixed', top: mouse.y - 320, left: mouse.x - 320, width: 640, height: 640, background: 'radial-gradient(circle, rgba(100,255,67,0.055) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, transition: 'top 0.35s ease, left 0.35s ease' }} />

      {/* Grain overlay */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 1 }} />

      {/* ══════════ NAVBAR ══════════ */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: scrollY > 60 ? 'rgba(10,46,3,0.93)' : 'transparent', backdropFilter: scrollY > 60 ? 'blur(28px)' : 'none', borderBottom: scrollY > 60 ? `1px solid ${C.border}` : '1px solid transparent', transition: 'all 0.35s ease' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(100,255,67,0.12)', border: '1px solid rgba(100,255,67,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 2a6 6 0 0 1 5.917 5H10V4zm-1 0v5H3.083A6 6 0 0 1 9 4zM3.444 11H9v5.472A6.002 6.002 0 0 1 3.444 11zm6.556 5.472V11h5.556A6.002 6.002 0 0 1 10 16.472z" fill={C.bright}/>
              </svg>
            </div>
            <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.5px', color: C.text }}>ScraPair</span>
          </div>
          <button onClick={() => navigate('/')}
            style={{ padding: '10px 24px', fontSize: 14, fontWeight: 700, borderRadius: 100, border: 'none', background: C.bright, color: '#082800', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 16px rgba(100,255,67,0.35)' }}
            onMouseEnter={e => { e.target.style.boxShadow = '0 0 28px rgba(100,255,67,0.6)'; e.target.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.target.style.boxShadow = '0 0 16px rgba(100,255,67,0.35)'; e.target.style.transform = 'translateY(0)'; }}
          >Back to home</button>
        </div>
      </nav>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2, maxWidth: 1360, margin: '0 auto', padding: '60px 40px' }}>

        {/* Decorative background elements */}
        <div style={{ position: 'absolute', top: '10%', right: '-6%', width: 450, height: 450, border: '1px solid rgba(100,255,67,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '-5%', width: 350, height: 350, border: '1px solid rgba(100,255,67,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <div style={{ fontSize: 12, color: C.bright, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>Get started</div>
          <h1 style={{ fontSize: 68, fontWeight: 900, lineHeight: 1.08, letterSpacing: '-2.4px', margin: '0 0 24px', color: C.text }}>
            Select your<br />
            <span style={{ color: C.bright, textShadow: '0 0 40px rgba(100,255,67,0.4)' }}>role</span>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.75, color: C.textMid, maxWidth: 520, margin: '0 auto' }}>
            Join the circular economy. Choose your role to get started.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 28, marginBottom: 60 }}>
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => navigate(role.route)}
              onMouseEnter={() => setButtonHover(role.id)}
              onMouseLeave={() => setButtonHover(null)}
              style={{
                background: buttonHover === role.id ? 'rgba(100,255,67,0.09)' : C.surface,
                border: `1px solid ${buttonHover === role.id ? 'rgba(100,255,67,0.35)' : C.border}`,
                borderRadius: 28,
                padding: '48px 40px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                transform: buttonHover === role.id ? 'translateY(-8px)' : 'translateY(0)',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
              }}
            >
              {/* Icon */}
              <div style={{
                width: 72,
                height: 72,
                background: 'rgba(100,255,67,0.12)',
                border: '1px solid rgba(100,255,67,0.22)',
                borderRadius: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                color: C.bright,
                transition: 'all 0.3s ease',
                transform: buttonHover === role.id ? 'scale(1.1) rotate(8deg)' : 'scale(1) rotate(0deg)',
              }}>
                {role.icon}
              </div>

              {/* Text content */}
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.6px', color: C.text, margin: '0 0 10px' }}>
                  {role.title}
                </h2>
                <p style={{ fontSize: 16, color: C.textMid, lineHeight: 1.7, margin: 0, marginBottom: 20 }}>
                  {role.desc}
                </p>

                {/* Details list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {role.details.map((detail, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: C.bright,
                        boxShadow: `0 0 8px ${C.bright}`,
                      }} />
                      <span style={{ fontSize: 14, color: C.textMid }}>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Arrow */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginTop: 16,
                color: C.bright,
                fontSize: 14,
                fontWeight: 700,
                transition: 'all 0.3s ease',
                transform: buttonHover === role.id ? 'translateX(8px)' : 'translateX(0)',
              }}>
                <span>Continue</span>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ transition: 'transform 0.3s ease', transform: buttonHover === role.id ? 'translateX(3px)' : 'translateX(0)' }}>
                  <path d="M3 9h12M9 3l6 6-6 6" stroke={C.bright} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', padding: '32px', background: 'rgba(100,255,67,0.04)', border: `1px solid ${C.border}`, borderRadius: 22, marginTop: 40 }}>
          <p style={{ fontSize: 15, color: C.textMid, margin: '0 0 16px' }}>
            New to ScraPair?
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '12px 32px',
                fontSize: 14,
                fontWeight: 700,
                borderRadius: 100,
                border: `2px solid ${C.border}`,
                background: 'transparent',
                color: C.bright,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = C.borderHover; e.target.style.background = 'rgba(100,255,67,0.08)'; }}
              onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = 'transparent'; }}
            >
              ← Back home
            </button>
            <span style={{ color: C.textLow, fontSize: 13 }}>Learn more before choosing</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RoleSelectionPage;
