import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import collectionService from '../../../../services/collectionService';
import wastePostService from '../../../../services/wastePostService';
import { convertBrowserLocalToManilaTime } from '../../../../utils/datetimeLocalConverter';

const C = {
  bright: '#64ff43',
  darker: '#0a2e03',
  surface: '#0d3806',
  border: 'rgba(100,255,67,0.18)',
  borderHover: 'rgba(100,255,67,0.45)',
  text: '#e6ffe0',
  textMid: 'rgba(230,255,224,0.55)',
  textLow: 'rgba(230,255,224,0.3)',
  error: '#ff6b6b',
  errorBg: 'rgba(255,107,107,0.1)',
  errorBorder: 'rgba(255,107,107,0.3)',
  success: '#4ade80',
  successBg: 'rgba(74,222,128,0.1)',
  successBorder: 'rgba(74,222,128,0.3)',
};

const RequestCollectionPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [post, setPost] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focusedField, setFocusedField] = useState(null);

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

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await wastePostService.getWastePostById(postId);
      // Extract the post data from the response object { message, data }
      setPost(response.data || response);
    } catch (err) {
      setError(err.message || 'Failed to load waste post.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) {
      setError('You must be logged in to request a collection.');
      return;
    }

    setSubmitting(true);

    try {
      let manilaScheduledDate = scheduledDate;
      if (scheduledDate) {
        manilaScheduledDate = convertBrowserLocalToManilaTime(scheduledDate);
      }

      const response = await collectionService.requestCollection(parseInt(postId), manilaScheduledDate);
      
      if (response.data?.forceApproved) {
        setSuccess('? Collection request submitted and auto-approved!');
      } else if (response.data?.cancelLocked) {
        setSuccess('?? Collection request submitted. This request cannot be cancelled.');
      } else {
        setSuccess('Collection request submitted successfully! Redirecting...');
      }
      setTimeout(() => {
        navigate('/collections');
      }, 2000);
    } catch (err) {
      if (err.cause?.code === 'MAX_REQUESTS_EXCEEDED') {
        setError('? You have already requested this post 4 times. You cannot request it again.');
      } else {
        setError(err.message || 'Failed to submit collection request.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", color: C.text }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, marginBottom: 12 }}>Loading waste post details...</div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.bright, animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  if (!post || !user || user.type !== 'recycler') {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", color: C.text }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: C.error, marginBottom: 24 }}>{!post ? 'Post not found' : 'Only recyclers can request collections'}</p>
          <button onClick={() => navigate(-1)} style={{ padding: '10px 24px', background: C.bright, border: 'none', borderRadius: 12, color: '#062400', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.transform = 'scale(1.05)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.darker, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: 'hidden', color: C.text }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ position: 'fixed', top: mouse.y - 320, left: mouse.x - 320, width: 640, height: 640, background: 'radial-gradient(circle, rgba(100,255,67,0.055) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, transition: 'top 0.35s ease, left 0.35s ease' }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 1 }} />
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
          <button onClick={() => navigate(-1)} style={{ padding: '10px 24px', fontSize: 14, fontWeight: 700, borderRadius: 100, border: 'none', background: C.bright, color: '#082800', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 16px rgba(100,255,67,0.35)' }} onMouseEnter={e => { e.target.style.boxShadow = '0 0 28px rgba(100,255,67,0.6)'; e.target.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => { e.target.style.boxShadow = '0 0 16px rgba(100,255,67,0.35)'; e.target.style.transform = 'translateY(0)'; }}>? Back</button>
        </div>
      </nav>
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '60px 40px', position: 'relative', zIndex: 2 }}>
        <div style={{ marginBottom: 60 }}>
          <div style={{ fontSize: 12, color: C.bright, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>Collection Request</div>
          <h1 style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.08, letterSpacing: '-2px', margin: '0 0 12px', color: C.text }}>Request Collection</h1>
          <p style={{ fontSize: 16, color: C.textMid, margin: 0 }}>Submit your collection request for this waste material</p>
        </div>
        {error && <div style={{ background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: 16, padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}><svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}><circle cx="10" cy="10" r="9" stroke={C.error} strokeWidth="2"/><path d="M10 6v4M10 14h.01" stroke={C.error} strokeWidth="2" strokeLinecap="round"/></svg><span style={{ fontSize: 14, color: C.error, fontWeight: 500 }}>{error}</span></div>}
        {success && <div style={{ background: C.successBg, border: `1px solid ${C.successBorder}`, borderRadius: 16, padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}><svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}><path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z" fill={C.success}/></svg><span style={{ fontSize: 14, color: C.success, fontWeight: 500 }}>{success}</span></div>}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 24, padding: 40, marginBottom: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.4px', color: C.bright, margin: '0 0 24px' }}>?? Waste Material Details</h2>
          <div style={{ display: 'grid', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Material Type</label>
              <p style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: 0 }}>{post.wasteType || 'N/A'}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Quantity</label>
                <p style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: 0 }}>{post.quantity} {post.unit || 'units'}</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Condition</label>
                <p style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: 0 }}>{post.condition || 'N/A'}</p>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Description</label>
              <p style={{ fontSize: 14, color: C.textMid, margin: 0, lineHeight: 1.6 }}>{post.description || 'No description provided'}</p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Location</label>
              <p style={{ fontSize: 14, color: C.text, margin: 0, fontWeight: 500 }}>{post.location || post.city || 'N/A'}</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 24, padding: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.4px', color: C.bright, margin: '0 0 32px' }}>?? Proposed Pickup</h2>
          <div style={{ display: 'grid', gap: 24, marginBottom: 40 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Proposed Date & Time (Optional)</label>
              <input type="datetime-local" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} onFocus={() => setFocusedField('datetime')} onBlur={() => setFocusedField(null)} style={{ width: '100%', padding: '12px 16px', border: `1px solid ${focusedField === 'datetime' ? C.borderHover : C.border}`, borderRadius: 14, background: 'rgba(100,255,67,0.03)', color: C.text, fontSize: 14, boxSizing: 'border-box', transition: 'all 0.2s ease', outline: 'none', boxShadow: focusedField === 'datetime' ? `0 0 0 3px rgba(100,255,67,0.1)` : 'none', cursor: 'pointer' }} />
              <small style={{ display: 'block', marginTop: 6, color: C.textLow, fontSize: 12 }}>?? Suggest when you'd like to pick up these materials. The business owner can approve or adjust this.</small>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <button type="button" onClick={() => navigate(-1)} style={{ padding: '14px 24px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 14, color: C.bright, fontSize: 14, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.target.style.borderColor = C.borderHover; e.target.style.background = 'rgba(100,255,67,0.08)'; }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = 'transparent'; }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ padding: '14px 24px', background: submitting ? 'linear-gradient(135deg, rgba(100,255,67,0.4), rgba(100,255,67,0.3))' : `linear-gradient(135deg, ${C.bright}, #4de029)`, border: 'none', borderRadius: 14, color: '#062400', fontSize: 14, fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer', transition: 'all 0.22s', boxShadow: submitting ? '0 0 0 0px transparent, 0 4px 16px rgba(100,255,67,0.2)' : '0 0 0 0px transparent, 0 8px 24px rgba(100,255,67,0.35)', transform: submitting ? 'scale(0.98)' : 'scale(1)' }} onMouseEnter={e => { if (!submitting) { e.target.style.boxShadow = '0 0 0 5px rgba(100,255,67,0.15), 0 12px 36px rgba(100,255,67,0.5)'; e.target.style.transform = 'translateY(-2px) scale(1.01)'; } }} onMouseLeave={e => { if (!submitting) { e.target.style.boxShadow = '0 0 0 0px transparent, 0 8px 24px rgba(100,255,67,0.35)'; e.target.style.transform = 'scale(1)'; } }}>{submitting ? 'Submitting...' : 'Submit Collection Request'}</button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default RequestCollectionPage;

