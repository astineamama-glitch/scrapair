import React, { useState, useEffect } from 'react';

const C = { bright: '#64ff43', darker: '#0a2e03', surface: '#0d3806', border: 'rgba(100,255,67,0.18)', text: '#e6ffe0', textMid: 'rgba(230,255,224,0.55)' };

const MarketplaceSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      // API call to search
      setResults([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: '40px', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <h2>Marketplace Search</h2>
      
      <form onSubmit={handleSearch} style={{ marginBottom: 32, maxWidth: 600 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search materials, businesses, recyclers..." style={{ flex: 1, padding: '12px 16px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.surface, color: C.text, fontFamily: 'inherit' }} />
          <button type="submit" style={{ padding: '12px 24px', background: C.bright, color: '#062400', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Search</button>
        </div>
      </form>

      {loading ? (
        <p>Searching...</p>
      ) : results.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
          {results.map((item, i) => (
            <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700 }}>{item.title}</h3>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: C.textMid }}>{item.description?.substring(0, 80)}...</p>
              <button style={{ padding: '8px 16px', background: C.border, border: 'none', borderRadius: 6, color: C.text, cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>View</button>
            </div>
          ))}
        </div>
      ) : searchQuery ? (
        <p style={{ color: C.textMid }}>No results found for "{searchQuery}"</p>
      ) : (
        <p style={{ color: C.textMid }}>Enter a search query to get started.</p>
      )}
    </div>
  );
};

export default MarketplaceSearchPage;
