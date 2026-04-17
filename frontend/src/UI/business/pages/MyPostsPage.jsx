import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const C = { bright: '#64ff43', darker: '#0a2e03', surface: '#0d3806', border: 'rgba(100,255,67,0.18)', text: '#e6ffe0', textMid: 'rgba(230,255,224,0.55)' };

const MyPostsPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // API call to fetch user's waste posts
      setPosts([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      // API call to delete post
      await fetchPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: 40 }}>Loading your posts...</div>;

  return (
    <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h2>My Waste Posts</h2>
        <button onClick={() => navigate('/business/waste-post/create')} style={{ padding: '10px 20px', background: C.bright, color: '#062400', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>+ New Post</button>
      </div>

      {error && <div style={{ background: 'rgba(255,107,107,0.1)', padding: '12px 16px', marginBottom: 20, color: '#ff6b6b', borderRadius: 6 }}>{error}</div>}

      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 40px' }}>
          <p style={{ color: C.textMid }}>No posts yet. Create one to get started!</p>
          <button onClick={() => navigate('/business/waste-post/create')} style={{ marginTop: 20, padding: '12px 24px', background: C.bright, color: '#062400', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Create Your First Post</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {posts.map((post) => (
            <div key={post.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              {post.imageUrl && <img src={post.imageUrl} alt={post.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
              <div style={{ padding: 20 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>{post.title}</h3>
                <p style={{ margin: '0 0 12px', fontSize: 14, color: C.textMid }}>{post.category} • {post.quantity}</p>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: C.textMid, minHeight: 40 }}>{post.description?.substring(0, 60)}...</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => navigate(`/business/posts/${post.id}/edit`)} style={{ flex: 1, padding: '8px', background: C.border, border: 'none', borderRadius: 6, color: C.text, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Edit</button>
                  <button onClick={() => handleDelete(post.id)} style={{ flex: 1, padding: '8px', background: 'rgba(255,107,107,0.2)', border: 'none', borderRadius: 6, color: '#ff6b6b', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPostsPage;
