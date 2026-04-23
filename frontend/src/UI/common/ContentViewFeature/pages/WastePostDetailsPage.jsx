import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import RatingDisplay from '../../../../components/RatingDisplay';
import wastePostService from '../../../../services/wastePostService';
import messageService from '../../../../services/messageService';
import FeedbackForm from '../../../../components/FeedbackForm';

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
  info: '#7dd3fc',
  infoBg: 'rgba(125,211,252,0.1)',
  infoBorder: 'rgba(125,211,252,0.3)',
};

const WastePostDetailsPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);

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
    loadPostDetails();
  }, [postId]);

  const loadPostDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await wastePostService.getWastePostById(postId);
      const postData = response.data || response;
      setPost(postData);

      if (postData.collectionId) {
        try {
          const collectionResponse = await fetch(`/api/collections/${postData.collectionId}`);
          if (collectionResponse.ok) {
            const collData = await collectionResponse.json();
            setCollection(collData.data || collData);
          }
        } catch (collErr) {}
      }
    } catch (err) {
      setError(err.message || 'Failed to load waste post details');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageBusiness = async () => {
    if (!user) {
      navigate('/role-selection');
      return;
    }

    if (!post || !post.businessId) {
      setError('Business information not available');
      return;
    }

    try {
      setMessageLoading(true);
      const response = await messageService.startConversation(post.businessId, post.id);
      const conversationId = response.data?.id || response.id;

      if (conversationId) {
        navigate(`/messages/${conversationId}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to open conversation with business');
    } finally {
      setMessageLoading(false);
    }
  };

  const handleRequestCollection = () => {
    if (!user) {
      navigate('/role-selection');
      return;
    }
    navigate(`/collection/request/${postId}`);
  };

  const getStatusBadge = (status) => {
    if (status === 'reserved') return { label: '📦 In Collection', color: C.info };
    if (status === 'collected') return { label: '✅ Collected', color: C.bright };
    return { label: '✨ Available', color: C.bright };
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", color: C.text }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, marginBottom: 12 }}>Loading post...</div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.bright, animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", color: C.text }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: '0 0 16px' }}>Post not found</h2>
          <button onClick={() => navigate('/recycler/dashboard')} style={{ padding: '12px 28px', fontSize: 13, fontWeight: 700, borderRadius: 100, border: 'none', background: C.bright, color: '#082800', cursor: 'pointer', boxShadow: '0 0 16px rgba(100,255,67,0.35)' }}>← Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const badge = getStatusBadge(post.status);
  const images = post.images && post.images.length > 0 ? post.images : [post.imageUrl].filter(Boolean);

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
          <button onClick={() => navigate(-1)} style={{ padding: '10px 24px', fontSize: 14, fontWeight: 700, borderRadius: 100, border: 'none', background: C.bright, color: '#082800', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 16px rgba(100,255,67,0.35)' }} onMouseEnter={e => { e.target.style.boxShadow = '0 0 28px rgba(100,255,67,0.6)'; e.target.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => { e.target.style.boxShadow = '0 0 16px rgba(100,255,67,0.35)'; e.target.style.transform = 'translateY(0)'; }}>← Back</button>
        </div>
      </nav>

      <section style={{ maxWidth: 1300, margin: '0 auto', padding: '60px 40px', position: 'relative', zIndex: 2 }}>
        {error && <div style={{ background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: 16, padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}><svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}><circle cx="10" cy="10" r="9" stroke={C.error} strokeWidth="2"/><path d="M10 6v4M10 14h.01" stroke={C.error} strokeWidth="2" strokeLinecap="round"/></svg><span style={{ fontSize: 14, color: C.error, fontWeight: 500 }}>{error}</span></div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start', marginBottom: 60 }}>
          {/* Left: Images */}
          <div>
            {images.length > 0 ? (
              <>
                <div style={{ marginBottom: 20, borderRadius: 24, overflow: 'hidden', border: `1px solid ${C.border}`, background: 'rgba(0,0,0,0.3)' }}>
                  <img src={images[selectedImage]} alt={post.title} style={{ width: '100%', height: 400, objectFit: 'cover' }} />
                </div>
                {images.length > 1 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 12 }}>
                    {images.map((img, idx) => (
                      <div key={idx} onClick={() => setSelectedImage(idx)} style={{ cursor: 'pointer', borderRadius: 12, overflow: 'hidden', border: `2px solid ${selectedImage === idx ? C.bright : C.border}`, transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.borderColor = C.borderHover} onMouseLeave={e => e.target.style.borderColor = selectedImage === idx ? C.bright : C.border}>
                        <img src={img} alt={`${post.title} ${idx + 1}`} style={{ width: '100%', height: 80, objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ width: '100%', height: 400, borderRadius: 24, background: C.surface, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 48 }}>📷</span>
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <h1 style={{ fontSize: 36, fontWeight: 900, color: C.text, margin: 0 }}>{post.title}</h1>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 14px', borderRadius: 100, background: 'rgba(100,255,67,0.15)', color: badge.color, border: `1px solid ${badge.color}` }}>
                  {badge.label}
                </div>
              </div>
              <p style={{ fontSize: 16, color: C.textMid, margin: 0 }}>Posted by <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: C.bright }}>
                <RatingDisplay userId={post.business?.id} variant="inline" />
                <strong>{post.business?.businessName || 'Business'}</strong>
              </span></p>
            </div>

            {/* Specs Grid */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Waste Type</p>
                  <p style={{ fontSize: 14, color: C.bright, fontWeight: 600, margin: 0 }}>{post.wasteType}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Quantity</p>
                  <p style={{ fontSize: 14, color: C.bright, fontWeight: 600, margin: 0 }}>{post.quantity} {post.unit}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Condition</p>
                  <p style={{ fontSize: 14, color: C.text, fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>{post.condition}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Posted</p>
                  <p style={{ fontSize: 14, color: C.text, fontWeight: 600, margin: 0 }}>{new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <p style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>📍 Location</p>
              <p style={{ fontSize: 14, color: C.text, fontWeight: 600, margin: '0 0 4px' }}>{post.address}</p>
              <p style={{ fontSize: 13, color: C.textMid, margin: 0 }}>{post.city}</p>
              {post.latitude && post.longitude && (
                <p style={{ fontSize: 12, color: C.textLow, margin: '8px 0 0' }}>📌 {parseFloat(post.latitude).toFixed(4)}, {parseFloat(post.longitude).toFixed(4)}</p>
              )}
            </div>

            {/* Business Rating */}
            {post.business && post.business.id && (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
                <p style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>⭐ Business Rating</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 24 }}>⭐⭐⭐⭐</div>
                  <div>
                    <p style={{ fontSize: 20, fontWeight: 800, color: C.bright, margin: 0 }}>4.0</p>
                    <p style={{ fontSize: 12, color: C.textLow, margin: '4px 0 0' }}>Based on collections</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={handleMessageBusiness} disabled={messageLoading} style={{ padding: '16px 24px', fontSize: 14, fontWeight: 800, borderRadius: 100, border: 'none', background: C.bright, color: '#082800', cursor: messageLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: messageLoading ? 0.6 : 1, boxShadow: '0 0 20px rgba(100,255,67,0.4)' }} onMouseEnter={e => { if (!messageLoading) { e.target.style.boxShadow = '0 0 32px rgba(100,255,67,0.6)'; e.target.style.transform = 'scale(1.02)'; } }} onMouseLeave={e => { if (!messageLoading) { e.target.style.boxShadow = '0 0 20px rgba(100,255,67,0.4)'; e.target.style.transform = 'scale(1)'; } }}>
                {messageLoading ? '...' : '💬 Message'}
              </button>
              <button onClick={handleRequestCollection} disabled={post.status === 'reserved' || post.status === 'collected'} style={{ padding: '16px 24px', fontSize: 14, fontWeight: 800, borderRadius: 100, border: `1px solid ${C.border}`, background: post.status === 'reserved' || post.status === 'collected' ? 'transparent' : 'transparent', color: post.status === 'reserved' || post.status === 'collected' ? C.textLow : C.bright, cursor: post.status === 'reserved' || post.status === 'collected' ? 'not-allowed' : 'pointer', opacity: post.status === 'reserved' || post.status === 'collected' ? 0.5 : 1, transition: 'all 0.2s' }} onMouseEnter={e => { if (post.status !== 'reserved' && post.status !== 'collected') { e.target.style.borderColor = C.borderHover; e.target.style.background = 'rgba(100,255,67,0.1)'; } }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = 'transparent'; }}>
                {post.status === 'reserved' ? '📦 In Progress' : post.status === 'collected' ? '✅ Collected' : '🚚 Request'}
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, marginBottom: 40 }}>
          <p style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>Description</p>
          <p style={{ fontSize: 15, color: C.text, lineHeight: 1.8, margin: 0 }}>{post.description}</p>
        </div>

        {/* Post Rating */}
        {post && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, marginBottom: 40 }}>
            <p style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 20px' }}>⭐ Post Rating</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 32 }}>⭐⭐⭐⭐⭐</div>
              <div>
                <p style={{ fontSize: 24, fontWeight: 800, color: C.bright, margin: 0 }}>5.0</p>
                <p style={{ fontSize: 13, color: C.textLow, margin: '6px 0 0' }}>Excellent waste material quality</p>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Form */}
        {post && collection && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32 }}>
            <p style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 20px' }}>📝 Feedback</p>
            <FeedbackForm collectionId={collection.id} business={collection.business} recycler={collection.recycler} onSubmitSuccess={loadPostDetails} />
          </div>
        )}

        {post && !collection && post.collectionId && (
          <div style={{ background: C.infoBg, border: `1px solid ${C.infoBorder}`, borderRadius: 16, padding: 20 }}>
            <p style={{ fontSize: 14, color: C.info, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>ℹ️</span>
              Feedback form available after collection details are loaded.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default WastePostDetailsPage;

