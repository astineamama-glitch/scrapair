import React, { useState, useEffect } from 'react';

const C = { bright: '#64ff43', darker: '#0a2e03', surface: '#0d3806', border: 'rgba(100,255,67,0.18)', text: '#e6ffe0', textMid: 'rgba(230,255,224,0.55)' };

const BusinessProfilePage = () => {
  const [business, setBusiness] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // API call
      setBusiness(null);
      setPosts([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: 40 }}>Loading profile...</div>;

  return (
    <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: '40px', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      {business && (
        <>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, marginBottom: 32 }}>
            <h2 style={{ margin: '0 0 8px' }}>{business.name}</h2>
            <p style={{ margin: '0 0 16px', color: C.textMid }}>{business.location}</p>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: C.textMid }}>{business.description}</p>
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <div>
                <p style={{ margin: '0 0 4px', color: C.textMid, fontSize: 12 }}>Posts</p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.bright }}>{business.postCount}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', color: C.textMid, fontSize: 12 }}>Rating</p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.bright }}>{business.rating}★</p>
              </div>
            </div>
            <button style={{ padding: '10px 20px', background: C.border, border: 'none', borderRadius: 6, color: C.text, cursor: 'pointer', fontWeight: 700 }}>Contact Business</button>
          </div>

          <h3>Recent Posts</h3>
          {posts.length === 0 ? (
            <p style={{ color: C.textMid }}>No posts from this business yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
              {posts.map((post, i) => (
                <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                  {post.imageUrl && <img src={post.imageUrl} alt={post.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} />}
                  <div style={{ padding: 16 }}>
                    <h4 style={{ margin: '0 0 8px' }}>{post.title}</h4>
                    <p style={{ margin: '0 0 12px', fontSize: 13, color: C.textMid }}>{post.quantity} • {post.category}</p>
                    <button style={{ width: '100%', padding: '8px', background: C.border, border: 'none', borderRadius: 6, color: C.text, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>View</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BusinessProfilePage;
