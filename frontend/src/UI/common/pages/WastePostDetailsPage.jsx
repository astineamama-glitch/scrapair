import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../shared/context/AuthContext';
import wastePostService from '../../../services/wastePostService';
import messageService from '../../../services/messageService';
import FeedbackForm from '../../../components/FeedbackForm';

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
};

const WastePostDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    window.addEventListener('mousemove', (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    });
    const sc = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', sc);
    return () => {
      window.removeEventListener('scroll', sc);
      window.removeEventListener('mousemove', null);
    };
  }, []);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await wastePostService.getPostDetail(id);
      const postData = response.post || response.data;
      setPost(postData);
    } catch (err) {
      setError(err.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCollection = async () => {
    if (!isAuthenticated) {
      navigate('/role-selection');
      return;
    }

    if (user?.type !== 'recycler') {
      setError('Only recyclers can request collections');
      return;
    }

    setMessageLoading(true);
    try {
      await messageService.sendCollectionRequest(post._id);
      setSuccessMessage('Collection request sent successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to send collection request');
    } finally {
      setMessageLoading(false);
    }
  };

  const handleMessageBusiness = async () => {
    if (!isAuthenticated) {
      navigate('/role-selection');
      return;
    }

    setSendingMessage(true);
    try {
      await messageService.createConversation(post.businessId);
      navigate(`/marketplace/messages?businessId=${post.businessId}`);
    } catch (err) {
      setError(err.message || 'Failed to start conversation');
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", color: C.text }}>
        <div>Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", color: C.text }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '40px' }}>
          <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', background: C.bright, color: '#082800', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>← Back</button>
          {error && <p style={{ color: C.error, marginTop: 20 }}>{error}</p>}
        </div>
      </div>
    );
  }

  const images = post.images || [];
  const currentImage = images[currentImageIndex] || 'placeholder.jpg';

  return (
    <div style={{ minHeight: '100vh', background: C.darker, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: 'hidden', color: C.text }}>
      <div style={{ position: 'fixed', top: mouseY - 320, left: mouseX - 320, width: 640, height: 640, background: 'radial-gradient(circle, rgba(100,255,67,0.055) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, transition: 'top 0.35s ease, left 0.35s ease' }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 1 }} />

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: scrollY > 60 ? 'rgba(10,46,3,0.93)' : 'transparent', backdropFilter: scrollY > 60 ? 'blur(28px)' : 'none', borderBottom: scrollY > 60 ? `1px solid ${C.border}` : 'none', transition: 'all 0.35s ease' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => navigate(-1)} style={{ padding: '10px 24px', fontSize: 14, fontWeight: 700, borderRadius: 100, border: 'none', background: C.bright, color: '#082800', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 16px rgba(100,255,67,0.35)' }} onMouseEnter={e => { e.target.style.boxShadow = '0 0 28px rgba(100,255,67,0.6)'; e.target.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => { e.target.style.boxShadow = '0 0 16px rgba(100,255,67,0.35)'; e.target.style.transform = 'translateY(0)'; }}>← Back</button>
          <div style={{ fontSize: 13, fontWeight: 700, background: 'rgba(100,255,67,0.1)', border: `1px solid ${C.border}`, borderRadius: 100, padding: '8px 16px', color: C.bright }}>
            {post.status || 'Active'}
          </div>
        </div>
      </nav>

      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '60px 40px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60% 1fr', gap: 40, alignItems: 'start', marginBottom: 60 }}>
          {/* Image Gallery */}
          <div style={{ display: 'grid', gap: 16 }}>
            {/* Main image */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 24, overflow: 'hidden', aspectRatio: '16/12' }}>
              <img src={currentImage} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 12 }}>
                {images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    style={{
                      background: C.surface,
                      border: currentImageIndex === i ? `2px solid ${C.bright}` : `1px solid ${C.border}`,
                      borderRadius: 16,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      aspectRatio: '1',
                      transition: 'all 0.2s',
                      boxShadow: currentImageIndex === i ? `0 0 16px rgba(100,255,67,0.4)` : 'none',
                    }}
                    onMouseEnter={e => {
                      if (currentImageIndex !== i) {
                        e.currentTarget.style.borderColor = C.borderHover;
                      }
                    }}
                    onMouseLeave={e => {
                      if (currentImageIndex !== i) {
                        e.currentTarget.style.borderColor = C.border;
                      }
                    }}
                  >
                    <img src={img} alt={`Thumbnail ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <div style={{ textAlign: 'center', color: C.textLow, fontSize: 12, marginTop: 8 }}>
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Post Details */}
          <div style={{ display: 'grid', gap: 32 }}>
            {error && (
              <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 16, padding: '16px 20px', color: C.error, fontSize: 14 }}>
                {error}
              </div>
            )}

            {successMessage && (
              <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 16, padding: '16px 20px', color: '#4ade80', fontSize: 14 }}>
                {successMessage}
              </div>
            )}

            <div>
              <h1 style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-1.5px', color: C.text, margin: '0 0 16px', lineHeight: 1.2 }}>
                {post.title}
              </h1>
              <p style={{ fontSize: 16, color: C.textMid, lineHeight: 1.7, margin: 0 }}>
                {post.description}
              </p>
            </div>

            {/* Key specs */}
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'rgba(100,255,67,0.04)', border: `1px solid ${C.border}`, borderRadius: 14 }}>
                <span style={{ color: C.textMid, fontSize: 14 }}>Material Type</span>
                <span style={{ color: C.bright, fontWeight: 700, fontSize: 14 }}>{post.materialType || 'Mixed'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'rgba(100,255,67,0.04)', border: `1px solid ${C.border}`, borderRadius: 14 }}>
                <span style={{ color: C.textMid, fontSize: 14 }}>Quantity</span>
                <span style={{ color: C.bright, fontWeight: 700, fontSize: 14 }}>{post.quantity} {post.unit || 'units'}</span>
              </div>
              {post.location && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'rgba(100,255,67,0.04)', border: `1px solid ${C.border}`, borderRadius: 14 }}>
                  <span style={{ color: C.textMid, fontSize: 14 }}>📍 Location</span>
                  <span style={{ color: C.bright, fontWeight: 700, fontSize: 14 }}>{post.location}</span>
                </div>
              )}
              {post.postedDate && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'rgba(100,255,67,0.04)', border: `1px solid ${C.border}`, borderRadius: 14 }}>
                  <span style={{ color: C.textMid, fontSize: 14 }}>📅 Posted</span>
                  <span style={{ color: C.bright, fontWeight: 700, fontSize: 14 }}>{new Date(post.postedDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'grid', gap: 12 }}>
              {user?.type === 'recycler' && user._id !== post.businessId ? (
                <>
                  <button
                    onClick={handleRequestCollection}
                    disabled={messageLoading}
                    style={{
                      padding: '16px 24px',
                      background: messageLoading ? 'linear-gradient(135deg, rgba(100,255,67,0.4), rgba(100,255,67,0.3))' : `linear-gradient(135deg, ${C.bright}, #4de029)`,
                      border: 'none',
                      borderRadius: 14,
                      color: '#062400',
                      fontSize: 15,
                      fontWeight: 800,
                      cursor: messageLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.22s',
                      boxShadow: messageLoading ? '0 0 0 0px transparent' : '0 0 12px rgba(100,255,67,0.3)',
                    }}
                    onMouseEnter={e => { if (!messageLoading) { e.target.style.boxShadow = '0 0 20px rgba(100,255,67,0.5)'; e.target.style.transform = 'scale(1.02)'; } }}
                    onMouseLeave={e => { if (!messageLoading) { e.target.style.boxShadow = '0 0 12px rgba(100,255,67,0.3)'; e.target.style.transform = 'scale(1)'; } }}
                  >
                    {messageLoading ? 'Sending...' : '✓ Request Collection'}
                  </button>
                  <button
                    onClick={handleMessageBusiness}
                    disabled={sendingMessage}
                    style={{
                      padding: '14px 24px',
                      background: 'transparent',
                      border: `1px solid ${C.border}`,
                      borderRadius: 14,
                      color: C.bright,
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: sendingMessage ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { if (!sendingMessage) { e.target.style.borderColor = C.borderHover; e.target.style.background = 'rgba(100,255,67,0.08)'; } }}
                    onMouseLeave={e => { if (!sendingMessage) { e.target.style.borderColor = C.border; e.target.style.background = 'transparent'; } }}
                  >
                    💬 Message Business
                  </button>
                </>
              ) : (
                <>
                  {isAuthenticated ? (
                    <button
                      onClick={() => setShowFeedback(true)}
                      style={{
                        padding: '16px 24px',
                        background: `linear-gradient(135deg, ${C.bright}, #4de029)`,
                        border: 'none',
                        borderRadius: 14,
                        color: '#062400',
                        fontSize: 15,
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.22s',
                        boxShadow: '0 0 12px rgba(100,255,67,0.3)',
                      }}
                      onMouseEnter={e => { e.target.style.boxShadow = '0 0 20px rgba(100,255,67,0.5)'; e.target.style.transform = 'scale(1.02)'; }}
                      onMouseLeave={e => { e.target.style.boxShadow = '0 0 12px rgba(100,255,67,0.3)'; e.target.style.transform = 'scale(1)'; }}
                    >
                      ⭐ Leave Feedback
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/role-selection')}
                      style={{
                        padding: '16px 24px',
                        background: `linear-gradient(135deg, ${C.bright}, #4de029)`,
                        border: 'none',
                        borderRadius: 14,
                        color: '#062400',
                        fontSize: 15,
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.22s',
                        boxShadow: '0 0 12px rgba(100,255,67,0.3)',
                      }}
                      onMouseEnter={e => { e.target.style.boxShadow = '0 0 20px rgba(100,255,67,0.5)'; e.target.style.transform = 'scale(1.02)'; }}
                      onMouseLeave={e => { e.target.style.boxShadow = '0 0 12px rgba(100,255,67,0.3)'; e.target.style.transform = 'scale(1)'; }}
                    >
                      🔑 Login to Interact
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Posters info */}
            {post.businessDetails && (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: C.textMid, margin: '0 0 16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Posted by</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {post.businessDetails.avatar && (
                    <img src={post.businessDetails.avatar} alt="Business" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                  )}
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{post.businessDetails.name || 'Business'}</div>
                    <div style={{ fontSize: 13, color: C.textLow }}>Member since {post.businessDetails.memberSince || 'Jan 2025'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {showFeedback && (
        <FeedbackForm postId={post._id} onClose={() => setShowFeedback(false)} onSuccess={() => { setShowFeedback(false); loadPost(); }} />
      )}
    </div>
  );
};

export default WastePostDetailsPage;
