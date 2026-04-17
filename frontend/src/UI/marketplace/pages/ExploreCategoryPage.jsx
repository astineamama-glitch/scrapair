import React, { useState, useEffect } from 'react';

const C = { bright: '#64ff43', darker: '#0a2e03', surface: '#0d3806', border: 'rgba(100,255,67,0.18)', text: '#e6ffe0', textMid: 'rgba(230,255,224,0.55)' };

const ExploreCategoryPage = () => {
  const [category, setCategory] = useState('plastic');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, [category]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      // API call
      setMaterials([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['plastic', 'metal', 'paper', 'glass', 'electronics', 'textile'];

  return (
    <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: '40px', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <h2>Explore Categories</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 32 }}>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)} style={{ padding: '12px 16px', background: category === cat ? C.bright : C.surface, color: category === cat ? '#062400' : C.text, border: `1px solid ${C.border}`, borderRadius: 8, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize' }}>
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading materials...</p>
      ) : materials.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {materials.map((mat, i) => (
            <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              {mat.imageUrl && <img src={mat.imageUrl} alt={mat.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} />}
              <div style={{ padding: 16 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700 }}>{mat.title}</h3>
                <p style={{ margin: '0 0 12px', fontSize: 12, color: C.textMid }}>{mat.quantity} • {mat.location}</p>
                <button style={{ width: '100%', padding: '8px', background: C.border, border: 'none', borderRadius: 6, color: C.text, cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>Details</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: C.textMid }}>No materials in this category.</p>
      )}
    </div>
  );
};

export default ExploreCategoryPage;
