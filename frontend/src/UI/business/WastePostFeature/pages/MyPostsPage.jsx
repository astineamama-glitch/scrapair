import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import wastePostService from '../../../../services/wastePostService';

/* ─── Color tokens (matching LandingPage & BusinessDashboard) ────────────────
   bright  : #64ff43  (electric lime-green – CTA, glows, accents)
   deep    : #124d05  (forest dark – surfaces, cards)
   darker  : #0a2e03  (near-black base)
   surface : #0d3806  (card backgrounds)
   text    : #e6ffe0  (off-white tinted green)
──────────────────────────────────────────────────────────────────────────── */
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

const MyPostsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const sc = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', sc);
    return () => window.removeEventListener('scroll', sc);
  }, []);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await wastePostService.getUserWastePosts(1, 100);
      setPosts(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    setDeletingId(postId);
    try {
      await wastePostService.deleteWastePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      setError(err.message || 'Failed to delete post.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (postId) => {
    navigate(`/business/posts/waste-post/edit/${postId}`);
  };

  const handleViewDetails = (postId) => {
    navigate(`/business/posts/waste-post/${postId}`);
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 18, marginBottom: 20 }}>Please login to view your posts.</p>
          <Link to="/role-selection" style={{ padding: '12px 28px', background: `linear-gradient(135deg, ${C.bright}, #4de029)`, color: '#062400', textDecoration: 'none', borderRadius: 100, fontWeight: 700, display: 'inline-block' }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.darker, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: 'hidden', color: C.text }}>

      {/* Grain overlay */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 1 }} />

      {/* ══════════ NAVBAR ══════════ */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: scrollY > 60 ? 'rgba(10,46,3,0.93)' : 'transparent', backdropFilter: scrollY > 60 ? 'blur(28px)' : 'none', borderBottom: scrollY > 60 ? `1px solid ${C.border}` : '1px solid transparent', transition: 'all 0.35s ease' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/business/dashboard')}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(100,255,67,0.12)', border: `1px solid ${C.borderHover}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 2a6 6 0 0 1 5.917 5H10V4zm-1 0v5H3.083A6 6 0 0 1 9 4zM3.444 11H9v5.472A6.002 6.002 0 0 1 3.444 11zm6.556 5.472V11h5.556A6.002 6.002 0 0 1 10 16.472z" fill={C.bright}/>
              </svg>
            </div>
            <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.5px', color: C.text }}>ScraPair</span>
          </div>
          <button
            onClick={() => navigate('/business/posts/waste-post/create')}
            style={{
              padding: '12px 28px',
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 100,
              border: 'none',
              background: `linear-gradient(135deg, ${C.bright}, #4de029)`,
              color: '#062400',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: `0 0 16px ${C.glowStrong}`,
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-2px) scale(1.02)';
              e.target.style.boxShadow = `0 0 28px ${C.glowStrong}, 0 8px 24px rgba(100,255,67,0.35)`;
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = `0 0 16px ${C.glowStrong}`;
            }}
          >
            + Create Post
          </button>
        </div>
      </nav>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <main style={{ maxWidth: 1360, margin: '0 auto', padding: '80px 40px 60px', position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{ marginBottom: 72 }}>
          <div style={{ fontSize: 12, color: C.bright, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>Inventory</div>
          <h1 style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-1.8px', color: C.text, margin: 0, lineHeight: 1.1, marginBottom: 12 }}>
            My Waste Posts
          </h1>
          <p style={{ fontSize: 16, color: C.textMid, maxWidth: 500, lineHeight: 1.7, margin: 0 }}>
            View and manage all your posted materials. Monitor status, edit details, or create new listings.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: C.errorBg,
            border: `1px solid ${C.errorBorder}`,
            borderRadius: 16,
            padding: '16px 20px',
            marginBottom: 40,
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

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 16, color: C.textMid }}>Loading your posts...</div>
          </div>
        ) : posts.length === 0 ? (
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 24,
            padding: '80px 40px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>📭</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: '0 0 12px' }}>
              No posts yet
            </h2>
            <p style={{ fontSize: 16, color: C.textMid, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
              You haven't created any waste posts. Start by listing your first material and connect with recyclers.
            </p>
            <button
              onClick={() => navigate('/business/posts/waste-post/create')}
              style={{
                padding: '16px 40px',
                fontSize: 16,
                fontWeight: 700,
                borderRadius: 100,
                border: 'none',
                background: `linear-gradient(135deg, ${C.bright}, #4de029)`,
                color: '#062400',
                cursor: 'pointer',
                transition: 'all 0.22s',
                boxShadow: `0 0 20px ${C.glowStrong}`,
                letterSpacing: '-0.3px',
              }}
              onMouseEnter={e => {
                e.target.style.transform = 'translateY(-3px) scale(1.03)';
                e.target.style.boxShadow = `0 0 32px ${C.glowStrong}, 0 12px 32px rgba(100,255,67,0.35)`;
              }}
              onMouseLeave={e => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = `0 0 20px ${C.glowStrong}`;
              }}
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
            {posts.map((post) => (
              <div
                key={post.id}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 20,
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = C.borderHover;
                  e.currentTarget.style.transform = 'translateY(-8px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Image */}
                {post.images && post.images.length > 0 && (
                  <img
                    src={post.images[0]}
                    alt={post.title}
                    style={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}

                {/* Content */}
                <div style={{ padding: '28px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Status Badge */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 16,
                    width: 'fit-content',
                  }}>
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: post.status === 'active' ? C.bright : '#fbbf24',
                    }} />
                    <span style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: post.status === 'active' ? C.bright : '#fbbf24',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}>
                      {post.status || 'Inactive'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: C.text,
                    margin: '0 0 12px',
                    letterSpacing: '-0.3px',
                  }}>
                    {post.title}
                  </h3>

                  {/* Description */}
                  <p style={{
                    fontSize: 14,
                    color: C.textMid,
                    lineHeight: 1.6,
                    margin: '0 0 20px',
                    flex: 1,
                  }}>
                    {post.description?.substring(0, 100)}{post.description?.length > 100 ? '...' : ''}
                  </p>

                  {/* Meta Info */}
                  <div style={{
                    display: 'grid',
                    gap: 10,
                    marginBottom: 24,
                    fontSize: 13,
                    color: C.textLow,
                  }}>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.textLow, marginBottom: 4 }}>Type</div>
                        <div style={{ fontWeight: 700, color: C.text }}>{post.wasteType}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.textLow, marginBottom: 4 }}>Condition</div>
                        <div style={{ fontWeight: 700, color: C.text }}>{post.condition}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.textLow, marginBottom: 4 }}>Quantity</div>
                        <div style={{ fontWeight: 700, color: C.text }}>{post.quantity} {post.unit}</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr' }}>
                    <button
                      onClick={() => handleViewDetails(post.id)}
                      style={{
                        padding: '12px 16px',
                        fontSize: 13,
                        fontWeight: 700,
                        borderRadius: 100,
                        border: `1px solid ${C.border}`,
                        background: 'transparent',
                        color: C.text,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.target.style.borderColor = C.borderHover; e.target.style.background = 'rgba(100,255,67,0.05)'; }}
                      onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = 'transparent'; }}
                    >
                      👁 View
                    </button>

                    <button
                      onClick={() => handleEdit(post.id)}
                      disabled={post.status === 'collected' || ['PICKED_UP', 'COMPLETED'].includes(post.collectionStatus)}
                      title={post.status === 'collected' || ['PICKED_UP', 'COMPLETED'].includes(post.collectionStatus) ? 'This post has been collected and cannot be edited' : ''}
                      style={{
                        padding: '12px 16px',
                        fontSize: 13,
                        fontWeight: 700,
                        borderRadius: 100,
                        border: `1px solid ${C.border}`,
                        background: post.status === 'collected' || ['PICKED_UP', 'COMPLETED'].includes(post.collectionStatus) ? 'rgba(100,100,100,0.08)' : 'rgba(100,255,67,0.08)',
                        color: post.status === 'collected' || ['PICKED_UP', 'COMPLETED'].includes(post.collectionStatus) ? C.textLow : C.bright,
                        cursor: post.status === 'collected' || ['PICKED_UP', 'COMPLETED'].includes(post.collectionStatus) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        opacity: post.status === 'collected' || ['PICKED_UP', 'COMPLETED'].includes(post.collectionStatus) ? 0.6 : 1,
                      }}
                      onMouseEnter={e => {
                        if (!(post.status === 'collected' || ['PICKED_UP', 'COMPLETED'].includes(post.collectionStatus))) {
                          e.target.style.borderColor = C.borderHover;
                          e.target.style.background = 'rgba(100,255,67,0.15)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!(post.status === 'collected' || ['PICKED_UP', 'COMPLETED'].includes(post.collectionStatus))) {
                          e.target.style.borderColor = C.border;
                          e.target.style.background = 'rgba(100,255,67,0.08)';
                        }
                      }}
                    >
                      ✎ Edit
                    </button>

                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingId === post.id || post.status === 'collected' || ['PICKED_UP', 'COMPLETED'].includes(post.collectionStatus)}
                      title={post.status === 'collected' || ['PICKED_UP', 'COMPLETED'].includes(post.collectionStatus) ? 'This post has been collected and cannot be deleted' : ''}
                      style={{
                        padding: '12px 16px',
                        fontSize: 13,
                        fontWeight: 700,
                        borderRadius: 100,
                        border: 'none',
                        background: post.status === 'collected' || ['PICKED_UP', 'COMPLETED'].includes(post.collectionStatus) ? 'rgba(100,100,100,0.2)' : `linear-gradient(135deg, rgba(255,107,107,0.8), rgba(255,80,80,0.8))`,
                        color: '#fff',
                        cursor: deletingId === post.id || post.status === 'collected' || ['PICKED_UP', 'COMPLETED'].includes(post.collectionStatus) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        gridColumn: '1 / -1',
                        opacity: deletingId === post.id || post.status === 'collected' || ['PICKED_UP', 'COMPLETED'].includes(post.collectionStatus) ? 0.6 : 1,
                        boxShadow: post.status === 'collected' || ['PICKED_UP', 'COMPLETED'].includes(post.collectionStatus) ? 'none' : '0 0 12px rgba(255,107,107,0.25)',
                      }}
                      onMouseEnter={e => {
                        if (!(deletingId === post.id || post.status === 'collected' || ['PICKED_UP', 'COMPLETED'].includes(post.collectionStatus))) {
                          e.target.style.boxShadow = '0 0 20px rgba(255,107,107,0.4)';
                          e.target.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!(deletingId === post.id || post.status === 'collected' || ['PICKED_UP', 'COMPLETED'].includes(post.collectionStatus))) {
                          e.target.style.boxShadow = '0 0 12px rgba(255,107,107,0.25)';
                          e.target.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '48px 40px', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', textAlign: 'center', color: C.textLow, fontSize: 14 }}>
          <p style={{ margin: 0 }}>© 2026 ScraPair. Managing waste, building sustainability.</p>
        </div>
      </footer>
    </div>
  );
};

export default MyPostsPage;
