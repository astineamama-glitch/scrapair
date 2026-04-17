import React, { useState, useEffect } from 'react';

const C = { bright: '#64ff43', darker: '#0a2e03', surface: '#0d3806', border: 'rgba(100,255,67,0.18)', text: '#e6ffe0', textMid: 'rgba(230,255,224,0.55)' };

const MarketplaceHomePage = () => {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    try {
      setLoading(true);
      // API call
      setFeaturedPosts([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: '40px', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <h1 style={{ fontSize: 48, fontWeight: 900, margin: '0 0 16px', letterSpacing: '-1px' }}>Marketplace</h1>
      <p style={{ fontSize: 16, color: C.textMid, margin: '0 0 40px', maxWidth: 500 }}>Discover waste materials and connect with verified recyclers worldwide.</p>

      <div style={{ marginBottom: 48 }}>
        <h2 style={{ marginBottom: 24 }}>Featured Materials</h2>
        {loading ? (
          <p>Loading featured materials...</p>
        ) : featuredPosts.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {featuredPosts.map((post, i) => (
              <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(100,255,67,0.45)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = C.border; }}>
                {post.imageUrl && <img src={post.imageUrl} alt={post.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
                <div style={{ padding: 20 }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>{post.title}</h3>
                  <p style={{ margin: '0 0 8px', fontSize: 14, color: C.textMid }}>{post.businessName}</p>
                  <p style={{ margin: '0 0 12px', fontSize: 13, color: C.textMid }}>{post.quantity} • {post.location}</p>
                  <button style={{ width: '100%', padding: '8px', background: C.border, border: 'none', borderRadius: 6, color: C.text, cursor: 'pointer', fontWeight: 700 }}>View Details</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: C.textMid }}>No featured materials available.</p>
        )}
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, textAlign: 'center' }}>
        <h3>Ready to trade?</h3>
        <p style={{ color: C.textMid, marginBottom: 16 }}>Browse our full marketplace or create an account to get started.</p>
        <button style={{ padding: '12px 28px', background: C.bright, color: '#062400', border: 'none', borderRadius: 100, fontWeight: 700, cursor: 'pointer' }}>Explore Now</button>
      </div>
    </div>
  );
};

export default MarketplaceHomePage;
