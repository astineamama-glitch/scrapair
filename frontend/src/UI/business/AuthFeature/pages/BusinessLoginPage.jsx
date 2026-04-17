import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';

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
  error:       '#ff6b6b',
  errorBg:     'rgba(255,107,107,0.1)',
  errorBorder: 'rgba(255,107,107,0.3)',
};

const BusinessLoginPage = () => {
  const navigate = useNavigate();
  const { businessLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [focusedInput, setFocusedInput] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await businessLogin(email, password);
      navigate('/business/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          <button onClick={() => navigate('/role-selection')}
            style={{ padding: '10px 24px', fontSize: 14, fontWeight: 700, borderRadius: 100, border: 'none', background: C.bright, color: '#082800', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 16px rgba(100,255,67,0.35)' }}
            onMouseEnter={e => { e.target.style.boxShadow = '0 0 28px rgba(100,255,67,0.6)'; e.target.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.target.style.boxShadow = '0 0 16px rgba(100,255,67,0.35)'; e.target.style.transform = 'translateY(0)'; }}
          >← Back</button>
        </div>
      </nav>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2, padding: '60px 40px' }}>

        {/* Decorative background elements */}
        <div style={{ position: 'fixed', top: '5%', right: '-8%', width: 500, height: 500, border: '1px solid rgba(100,255,67,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', bottom: '10%', left: '-10%', width: 400, height: 400, border: '1px solid rgba(100,255,67,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 520, margin: '0 auto', width: '100%' }}>
          {/* Header */}
          <div style={{ textAlign: 'left', marginBottom: 60 }}>
            <div style={{ fontSize: 12, color: C.bright, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>Business Owner</div>
            <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.08, letterSpacing: '-2px', margin: '0 0 16px', color: C.text }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: C.textMid, margin: 0 }}>
              Sign in to access your ScraPair dashboard and manage your waste materials.
            </p>
          </div>

          {/* Form Container */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 28, padding: 48 }}>

            {/* Error Message */}
            {error && (
              <div style={{
                background: C.errorBg,
                border: `1px solid ${C.errorBorder}`,
                borderRadius: 16,
                padding: '16px 20px',
                marginBottom: 32,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="10" cy="10" r="9" stroke={C.error} strokeWidth="2"/>
                  <path d="M10 6v4M10 14h.01" stroke={C.error} strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: 14, color: C.error, fontWeight: 500 }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Email Input */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  required
                  placeholder="you@company.com"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: `1px solid ${focusedInput === 'email' ? C.borderHover : C.border}`,
                    borderRadius: 14,
                    background: 'rgba(100,255,67,0.03)',
                    color: C.text,
                    fontSize: 14,
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    boxShadow: focusedInput === 'email' ? `0 0 0 3px rgba(100,255,67,0.1)` : 'none',
                  }}
                />
              </div>

              {/* Password Input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: C.textMid, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Password</label>
                  <Link 
                    to="/forgot-password" 
                    style={{ fontSize: 12, color: C.bright, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.target.style.textDecoration = 'none'}
                  >
                    Forgot?
                  </Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: `1px solid ${focusedInput === 'password' ? C.borderHover : C.border}`,
                    borderRadius: 14,
                    background: 'rgba(100,255,67,0.03)',
                    color: C.text,
                    fontSize: 14,
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    boxShadow: focusedInput === 'password' ? `0 0 0 3px rgba(100,255,67,0.1)` : 'none',
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  marginTop: 16,
                  background: loading
                    ? 'linear-gradient(135deg, rgba(100,255,67,0.4), rgba(100,255,67,0.3))'
                    : 'linear-gradient(135deg, #64ff43, #4de029)',
                  color: '#062400',
                  fontSize: 15,
                  fontWeight: 800,
                  border: 'none',
                  borderRadius: 14,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
                  boxShadow: loading
                    ? '0 0 0 0px transparent, 0 4px 16px rgba(100,255,67,0.2)'
                    : '0 0 0 0px transparent, 0 8px 24px rgba(100,255,67,0.35)',
                  transform: loading ? 'scale(0.98)' : 'scale(1)',
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.target.style.boxShadow = '0 0 0 5px rgba(100,255,67,0.15), 0 12px 36px rgba(100,255,67,0.5)';
                    e.target.style.transform = 'translateY(-2px) scale(1.01)';
                  }
                }}
                onMouseLeave={e => {
                  if (!loading) {
                    e.target.style.boxShadow = '0 0 0 0px transparent, 0 8px 24px rgba(100,255,67,0.35)';
                    e.target.style.transform = 'scale(1)';
                  }
                }}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <div style={{ width: 14, height: 14, border: '2px solid rgba(6,36,0,0.2)', borderTop: '2px solid #062400', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '32px 0' }}>
              <div style={{ flex: 1, height: '1px', background: C.border }} />
              <span style={{ color: C.textLow, fontSize: 12 }}>or</span>
              <div style={{ flex: 1, height: '1px', background: C.border }} />
            </div>

            {/* Sign Up Link */}
            <p style={{ textAlign: 'center', fontSize: 14, color: C.textMid, margin: 0 }}>
              Don't have an account?{' '}
              <Link 
                to="/business/signup" 
                style={{ color: C.bright, fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                onMouseLeave={e => e.target.style.textDecoration = 'none'}
              >
                Sign up here
              </Link>
            </p>
          </div>

          {/* Footer Info */}
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <p style={{ fontSize: 12, color: C.textLow, margin: 0 }}>
              <Link 
                to="/role-selection" 
                style={{ color: C.bright, textDecoration: 'none', fontWeight: 600 }}
                onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                onMouseLeave={e => e.target.style.textDecoration = 'none'}
              >
                Looking for recycler login?
              </Link>
            </p>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BusinessLoginPage;
