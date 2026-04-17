import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const C = { bright: '#64ff43', darker: '#0a2e03', surface: '#0d3806', border: 'rgba(100,255,67,0.18)', text: '#e6ffe0', textMid: 'rgba(230,255,224,0.55)' };

const BrowseWastePostsPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // API call to fetch waste posts
      setPosts([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: 40 }}>Loading posts...</div>;

  return (
    <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: '40px', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <h2>Browse Waste Materials</h2>
      
      <div style={{ marginBottom: 24 }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 6, background: C.surface, color: C.text, cursor: 'pointer' }}>
          <option value="">All Categories</option>
          <option value="plastic">Plastic</option>
          <option value="metal">Metal</option>
          <option value="paper">Paper</option>
          <option value="glass">Glass</option>
        </select>
      </div>

      {posts.length === 0 ? (
        <p style={{ color: C.textMid }}>No waste posts available.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {posts.map((post) => (
            <div key={post.id} onClick={() => navigate(`/recycler/waste/${post.id}`)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(100,255,67,0.45)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = C.border; }}>
              {post.imageUrl && <img src={post.imageUrl} alt={post.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
              <div style={{ padding: 20 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>{post.title}</h3>
                <p style={{ margin: '0 0 8px', fontSize: 14, color: C.textMid }}>{post.businessName}</p>
                <p style={{ margin: '0 0 12px', fontSize: 14, color: C.textMid }}>{post.category} • {post.quantity}</p>
                <button style={{ width: '100%', padding: '8px', background: C.border, border: 'none', borderRadius: 6, color: C.text, cursor: 'pointer', fontWeight: 700 }}>View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseWastePostsPage;
