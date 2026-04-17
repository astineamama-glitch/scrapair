import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const C = { bright: '#64ff43', darker: '#0a2e03', surface: '#0d3806', border: 'rgba(100,255,67,0.18)', text: '#e6ffe0', textMid: 'rgba(230,255,224,0.55)' };

const CreateWastePostPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', description: '', category: '', quantity: '', location: '', image: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setFormData({ ...formData, [name]: files[0] });
    else setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category) return setError('Required fields missing');
    try {
      setLoading(true);
      // API call to create waste post
      navigate('/business/posts');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: '40px' }}>
      <button onClick={() => navigate(-1)} style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, cursor: 'pointer', marginBottom: 24 }}>← Back</button>
      <h2>Post Waste Materials</h2>
      {error && <div style={{ background: 'rgba(255,107,107,0.1)', padding: '12px 16px', marginBottom: 20, color: '#ff6b6b', borderRadius: 6 }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ maxWidth: 600, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Material Title *</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Plastic Bottles..." style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 6, background: C.darker, color: C.text, boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Category *</label>
          <select name="category" value={formData.category} onChange={handleChange} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 6, background: C.darker, color: C.text, boxSizing: 'border-box' }}>
            <option value="">Select Category</option>
            <option value="plastic">Plastic</option>
            <option value="metal">Metal</option>
            <option value="paper">Paper</option>
            <option value="glass">Glass</option>
          </select>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Quantity</label>
          <input type="text" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="e.g., 500 kg" style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 6, background: C.darker, color: C.text, boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe the materials..." style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 6, background: C.darker, color: C.text, boxSizing: 'border-box', fontFamily: 'inherit' }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Upload Image</label>
          <input type="file" name="image" onChange={handleChange} accept="image/*" style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 6, background: C.darker, color: C.textMid, boxSizing: 'border-box' }} />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: C.bright, color: '#062400', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
};

export default CreateWastePostPage;
