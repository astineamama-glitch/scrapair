import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../shared/context/AuthContext';

/* ─── Color tokens ────────────────────────────────────────────
   bright  : #64ff43  (electric lime-green – CTA, glows, accents)
   deep    : #124d05  (forest dark – surfaces, cards)
   darker  : #0a2e03  (near-black base)
   surface : #0d3806  (card backgrounds)
   text    : #e6ffe0  (off-white tinted green)
──────────────────────────────────────────────────────────── */
const C = {
  bright: '#64ff43',
  deep: '#124d05',
  darker: '#0a2e03',
  surface: '#0d3806',
  border: 'rgba(100,255,67,0.18)',
  borderHover: 'rgba(100,255,67,0.45)',
  text: '#e6ffe0',
  textMid: 'rgba(230,255,224,0.55)',
  textLow: 'rgba(230,255,224,0.3)',
  glow: 'rgba(100,255,67,0.22)',
  glowStrong: 'rgba(100,255,67,0.45)',
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthContext();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [visible, setVisible] = useState(new Set());
  const [ctaHov, setCtaHov] = useState(false);

  useEffect(() => {
    const mm = (e) => setMouse({ x: e.clientX, y: e.clientY });
    const sc = () => setScrollY(window.scrollY);
    window.addEventListener('mousemove', mm);
    window.addEventListener('scroll', sc);
    return () => { window.removeEventListener('mousemove', mm); window.removeEventListener('scroll', sc); };
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && setVisible(p => new Set([...p, e.target.dataset.s]))),
      { threshold: 0.12 }
    );
    document.querySelectorAll('[data-s]').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = () => isAuthenticated
    ? navigate(user?.type === 'business' ? '/business/dashboard' : '/recycler/dashboard')
    : navigate('/role-selection');

  const reveal = (k) => ({
    opacity: visible.has(k) ? 1 : 0,
    transform: visible.has(k) ? 'translateY(0)' : 'translateY(36px)',
    transition: 'opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1)',
  });

  const stats = [
    { v: '15+', l: 'Active Recyclers' },
    { v: '2.5K+', l: 'Tons Recycled' },
    { v: '89%', l: 'Satisfaction Rate' },
    { v: '16+', l: 'Cities Covered' },
  ];

  const features = [
    { icon: '◈', title: 'Scrap Posting', desc: 'Post recyclable materials in seconds — detailed specs, images, and smart category tagging built right in.', tag: 'Core' },
    { icon: '◎', title: 'Recycler Matching', desc: 'AI-driven proximity pairing with verified recyclers using behavioral data and live demand signals.', tag: 'AI-Powered' },
    { icon: '◉', title: 'Live Tracking', desc: 'End-to-end visibility from scheduled pickup through final processing and compliance reporting.', tag: 'Real-time' },
    { icon: '◐', title: 'Analytics Hub', desc: 'Rich dashboards for sustainability reporting, carbon offset calculation, and research output.', tag: 'Insights' },
  ];

  const testimonials = [
    { name: 'Sarah Johnson', role: 'Recycler', co: 'Mabolo', text: 'ScraPair transformed how we handle industrial waste. The analytics alone saved us 30% in disposal costs within the first quarter.' },
    { name: 'Michael Chen', role: 'Recycler Partner', co: 'Cebu City', text: "The matching algorithm is incredibly accurate. We've doubled our material intake since joining — with zero extra overhead." },
    { name: 'Priya Nair', role: 'Business Owner', co: 'Pardo', text: 'Live tracking gave our compliance team exactly what they needed. Reporting is automated and always audit-ready.' },
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(100,255,67,0.12)', border: '1px solid rgba(100,255,67,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 2a6 6 0 0 1 5.917 5H10V4zm-1 0v5H3.083A6 6 0 0 1 9 4zM3.444 11H9v5.472A6.002 6.002 0 0 1 3.444 11zm6.556 5.472V11h5.556A6.002 6.002 0 0 1 10 16.472z" fill={C.bright} />
              </svg>
            </div>
            <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.5px', color: C.text }}>ScraPair</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
            <button onClick={go}
              style={{ padding: '10px 24px', fontSize: 14, fontWeight: 700, borderRadius: 100, border: 'none', background: C.bright, color: '#082800', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 16px rgba(100,255,67,0.35)' }}
              onMouseEnter={e => { e.target.style.boxShadow = '0 0 28px rgba(100,255,67,0.6)'; e.target.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.target.style.boxShadow = '0 0 16px rgba(100,255,67,0.35)'; e.target.style.transform = 'translateY(0)'; }}
            >{isAuthenticated ? 'Dashboard' : 'Get started'}</button>
          </div>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2, maxWidth: 1360, margin: '0 auto', padding: '80px 40px 60px' }}>
        {/* Decorative rings */}
        <div style={{ position: 'absolute', top: '18%', right: '-4%', width: 580, height: 580, border: '1px solid rgba(100,255,67,0.07)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '28%', right: '6%', width: 300, height: 300, border: '1px solid rgba(100,255,67,0.1)', borderRadius: '50%', pointerEvents: 'none' }} />

        {/* Live badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'rgba(100,255,67,0.08)', border: '1px solid rgba(100,255,67,0.22)', borderRadius: 100, padding: '7px 18px 7px 10px', marginBottom: 44, width: 'fit-content' }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: C.bright, boxShadow: `0 0 10px ${C.bright}` }} />
          <span style={{ fontSize: 13, color: C.bright, fontWeight: 600 }}>Now live in Cebu City</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>

          {/* Left */}
          <div>
            <h1 style={{ fontSize: 78, fontWeight: 900, lineHeight: 1.04, letterSpacing: '-2.8px', margin: '0 0 28px', color: C.text }}>
              The future<br />of scrap is<br />
              <span style={{ color: C.bright, textShadow: '0 0 40px rgba(100,255,67,0.4)' }}>circular.</span>
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.75, color: C.textMid, maxWidth: 440, margin: '0 0 52px' }}>
              A research-driven platform connecting scrap generators with verified recyclers. Track, manage, and analyze waste at scale — for a truly circular economy.
            </p>

            {/* ── HERO BIG CTA ── */}
            <div style={{ marginBottom: 56 }}>
              <button
                onClick={go}
                onMouseEnter={() => setCtaHov(true)}
                onMouseLeave={() => setCtaHov(false)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 12,
                  padding: '24px 56px',
                  fontSize: 22, fontWeight: 900, letterSpacing: '-0.4px',
                  borderRadius: 100, border: 'none',
                  background: ctaHov
                    ? 'linear-gradient(135deg, #84ff67, #64ff43)'
                    : 'linear-gradient(135deg, #64ff43, #4de029)',
                  color: '#062400',
                  cursor: 'pointer',
                  transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
                  boxShadow: ctaHov
                    ? '0 0 0 5px rgba(100,255,67,0.2), 0 20px 56px rgba(100,255,67,0.5)'
                    : '0 0 0 0px transparent, 0 8px 32px rgba(100,255,67,0.3)',
                  transform: ctaHov ? 'translateY(-4px) scale(1.04)' : 'translateY(0) scale(1)',
                }}
              >
                <span>{isAuthenticated ? 'Go to dashboard' : '🚀 Get started free'}</span>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ transform: ctaHov ? 'translateX(5px)' : 'translateX(0)', transition: 'transform 0.22s' }}>
                  <path d="M4 11h14M11 4l7 7-7 7" stroke="#062400" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Social proof */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 24 }}>
                <div style={{ display: 'flex' }}>
                  {['SJ', 'MC', 'PN', 'AR', 'LT'].map((init, i) => (
                    <div key={i} style={{ width: 34, height: 34, borderRadius: '50%', border: `2px solid ${C.darker}`, background: `hsl(${112 + i * 18},55%,${38 + i * 5}%)`, marginLeft: i ? -10 : 0, zIndex: 5 - i, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: C.text }}>
                      {init}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ color: C.bright, fontSize: 13, letterSpacing: 2 }}>★★★★★</div>
                  <div style={{ fontSize: 13, color: C.textLow }}>12+ partners already onboard</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Dashboard mockup */}
          <div style={{ position: 'relative' }}>
            <div style={{ background: 'rgba(100,255,67,0.04)', border: `1px solid ${C.border}`, borderRadius: 28, padding: 30 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 12, color: C.textLow, marginBottom: 5, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Monthly recycled</div>
                  <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-1.2px', color: C.text }}>142.8 <span style={{ fontSize: 17, color: C.bright }}>tons</span></div>
                </div>
                <div style={{ background: 'rgba(100,255,67,0.12)', border: '1px solid rgba(100,255,67,0.25)', borderRadius: 14, padding: '9px 16px' }}>
                  <span style={{ fontSize: 13, color: C.bright, fontWeight: 700 }}>↑ 18.4%</span>
                </div>
              </div>
              {/* Bar chart */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 80, marginBottom: 22 }}>
                {[40, 58, 34, 70, 55, 82, 90, 65, 76, 85, 93, 100].map((h, i) => (
                  <div key={i} style={{ flex: 1, background: i === 11 ? `linear-gradient(180deg, ${C.bright}, #4de029)` : 'rgba(100,255,67,0.13)', height: `${h}%`, borderRadius: '4px 4px 0 0', boxShadow: i === 11 ? '0 0 12px rgba(100,255,67,0.4)' : 'none' }} />
                ))}
              </div>
              {/* Mini stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[{ l: 'Active Posts', v: '2', d: '+1' }, { l: 'Recyclers Matched', v: '5', d: '+2' }, { l: 'Pickups Today', v: '3', d: '+3' }, { l: 'CO₂ Offset', v: '2.1t', d: '+0.3' }].map((s, i) => (
                  <div key={i} style={{ background: 'rgba(100,255,67,0.04)', border: '1px solid rgba(100,255,67,0.1)', borderRadius: 14, padding: '13px 16px' }}>
                    <div style={{ fontSize: 11, color: C.textLow, marginBottom: 7, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.l}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: 23, fontWeight: 800, color: C.text }}>{s.v}</span>
                      <span style={{ fontSize: 13, color: C.bright, fontWeight: 700 }}>{s.d}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Floating badge */}
            <div style={{ position: 'absolute', bottom: -22, right: -22, background: `linear-gradient(135deg, ${C.bright}, #4de029)`, borderRadius: 18, padding: '13px 20px', display: 'flex', alignItems: 'center', gap: 11, boxShadow: '0 8px 36px rgba(100,255,67,0.45)' }}>
              <span style={{ fontSize: 18 }}>✓</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#062400' }}>Verified pickup</div>
                <div style={{ fontSize: 11, color: 'rgba(6,36,0,0.65)' }}>3 mins ago · Cebu City</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats band */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', marginTop: 80, border: `1px solid ${C.border}`, borderRadius: 20, overflow: 'hidden' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: C.surface, padding: '28px 32px', borderRight: i < 3 ? '1px solid rgba(100,255,67,0.1)' : 'none', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(100,255,67,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = C.surface}
            >
              <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-1.5px', color: C.text, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 13, color: C.textLow, marginTop: 8 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section data-s="how" style={{ maxWidth: 1360, margin: '0 auto', padding: '120px 40px', position: 'relative', zIndex: 2, ...reveal('how') }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 72 }}>
          <div>
            <div style={{ fontSize: 12, color: C.bright, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>How it works</div>
            <h2 style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-1.8px', color: C.text, margin: 0, lineHeight: 1.1 }}>Simple by design.<br />Powerful at scale.</h2>
          </div>
          <p style={{ fontSize: 16, color: C.textMid, maxWidth: 280, textAlign: 'right', lineHeight: 1.7 }}>Three steps from scrap generation to verified recycling — with data every step of the way.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[
            { n: '01', title: 'Post your scrap', body: 'Describe materials, upload images, set pickup windows. The platform categorizes and indexes your post instantly.' },
            { n: '02', title: 'Get matched', body: 'Our algorithm surfaces verified recyclers by proximity, material specialty, and capacity — ranked by score.' },
            { n: '03', title: 'Track & report', body: 'Follow every stage in real-time. Generate compliance reports, carbon certificates, and research datasets on demand.' },
          ].map((step, i) => (
            <div key={i} style={{ background: C.surface, border: '1px solid rgba(100,255,67,0.1)', borderRadius: 22, padding: '40px 36px', transition: 'all 0.3s ease' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(100,255,67,0.07)'; e.currentTarget.style.borderColor = 'rgba(100,255,67,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = 'rgba(100,255,67,0.1)'; }}
            >
              <div style={{ fontSize: 76, fontWeight: 900, color: 'rgba(100,255,67,0.1)', letterSpacing: '-3px', lineHeight: 1, marginBottom: 24 }}>{step.n}</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 14, letterSpacing: '-0.4px' }}>{step.title}</h3>
              <p style={{ fontSize: 15, color: C.textMid, lineHeight: 1.75, margin: 0 }}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section data-s="feat" style={{ maxWidth: 1360, margin: '0 auto', padding: '40px 40px 120px', position: 'relative', zIndex: 2, ...reveal('feat') }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ fontSize: 12, color: C.bright, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>Platform features</div>
          <h2 style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-1.8px', color: C.text, margin: 0 }}>Everything in one place.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18 }}>
          {features.map((item, i) => (
            <div key={i} style={{ background: C.surface, border: '1px solid rgba(100,255,67,0.1)', borderRadius: 24, padding: '36px 32px', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)', display: 'flex', gap: 26, alignItems: 'flex-start' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(100,255,67,0.06)'; e.currentTarget.style.borderColor = 'rgba(100,255,67,0.32)'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = 'rgba(100,255,67,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: 58, height: 58, background: 'rgba(100,255,67,0.1)', border: '1px solid rgba(100,255,67,0.22)', borderRadius: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: C.bright, flexShrink: 0, fontFamily: 'monospace' }}>{item.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <h4 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.3px' }}>{item.title}</h4>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.bright, background: 'rgba(100,255,67,0.1)', border: '1px solid rgba(100,255,67,0.22)', borderRadius: 100, padding: '3px 11px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{item.tag}</span>
                </div>
                <p style={{ fontSize: 15, color: C.textMid, lineHeight: 1.75, margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section data-s="test" style={{ background: 'rgba(100,255,67,0.03)', borderTop: '1px solid rgba(100,255,67,0.08)', borderBottom: '1px solid rgba(100,255,67,0.08)', ...reveal('test') }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '100px 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 12, color: C.bright, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>Testimonials</div>
            <h2 style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-1.8px', color: C.text, margin: 0 }}>Trusted by industry leaders.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ background: C.darker, border: '1px solid rgba(100,255,67,0.1)', borderRadius: 24, padding: 34, transition: 'all 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(100,255,67,0.32)'; e.currentTarget.style.transform = 'translateY(-5px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(100,255,67,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: 52, color: 'rgba(100,255,67,0.25)', lineHeight: 1, marginBottom: 18, fontFamily: 'Georgia,serif' }}>"</div>
                <p style={{ fontSize: 15, color: 'rgba(230,255,224,0.65)', lineHeight: 1.8, marginBottom: 26 }}>{t.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderTop: '1px solid rgba(100,255,67,0.08)', paddingTop: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: `hsl(${118 + i * 20},55%,${35 + i * 5}%)`, border: '2px solid rgba(100,255,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: C.text, flexShrink: 0 }}>
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: C.textLow }}>{t.role} · {t.co}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section data-s="cta" style={{ maxWidth: 1360, margin: '0 auto', padding: '120px 40px', ...reveal('cta') }}>
        <div style={{ background: 'linear-gradient(145deg, rgba(100,255,67,0.08), rgba(100,255,67,0.03))', border: '1px solid rgba(100,255,67,0.22)', borderRadius: 36, padding: '90px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, border: '1px solid rgba(100,255,67,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 450, height: 450, border: '1px solid rgba(100,255,67,0.08)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 220, height: 220, background: 'radial-gradient(circle, rgba(100,255,67,0.07) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: 12, color: C.bright, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 24 }}>Ready to join?</div>
            <h2 style={{ fontSize: 68, fontWeight: 900, letterSpacing: '-2.5px', color: C.text, margin: '0 0 24px', lineHeight: 1.04 }}>
              Make every scrap<br />
              <span style={{ color: C.bright, textShadow: '0 0 50px rgba(100,255,67,0.4)' }}>count for something.</span>
            </h2>
            <p style={{ fontSize: 18, color: C.textMid, maxWidth: 500, margin: '0 auto 52px', lineHeight: 1.75 }}>
              Join hundreds of businesses and recyclers building a circular economy — one verified pickup at a time.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={go}
                style={{ padding: '22px 56px', fontSize: 22, fontWeight: 900, borderRadius: 100, border: 'none', background: `linear-gradient(135deg, ${C.bright}, #4de029)`, color: '#062400', cursor: 'pointer', transition: 'all 0.22s', letterSpacing: '-0.4px', boxShadow: '0 0 40px rgba(100,255,67,0.3), 0 8px 32px rgba(100,255,67,0.2)' }}
                onMouseEnter={e => { e.target.style.transform = 'translateY(-4px) scale(1.04)'; e.target.style.boxShadow = '0 0 60px rgba(100,255,67,0.55), 0 16px 48px rgba(100,255,67,0.4)'; }}
                onMouseLeave={e => { e.target.style.transform = 'translateY(0) scale(1)'; e.target.style.boxShadow = '0 0 40px rgba(100,255,67,0.3), 0 8px 32px rgba(100,255,67,0.2)'; }}
              >{isAuthenticated ? '→ Go to dashboard' : '🚀 Get started free'}</button>

            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ borderTop: '1px solid rgba(100,255,67,0.08)', padding: '48px 40px', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(100,255,67,0.1)', border: '1px solid rgba(100,255,67,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 2a6 6 0 0 1 5.917 5H10V4zm-1 0v5H3.083A6 6 0 0 1 9 4zM3.444 11H9v5.472A6.002 6.002 0 0 1 3.444 11zm6.556 5.472V11h5.556A6.002 6.002 0 0 1 10 16.472z" fill={C.bright} />
              </svg>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: '-0.3px' }}>ScraPair</span>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            {['Privacy', 'Terms', 'Contact', 'Research'].map(l => (
              <span key={l} style={{ fontSize: 14, color: C.textLow, cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = C.bright}
                onMouseLeave={e => e.target.style.color = C.textLow}
              >{l}</span>
            ))}
          </div>
          <span style={{ fontSize: 13, color: 'rgba(230,255,224,0.2)' }}>© 2025 ScraPair · Building a circular future.</span>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;0,9..40,900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
