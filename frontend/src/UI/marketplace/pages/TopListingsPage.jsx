import React, { useState, useEffect } from 'react';

const C = { bright: '#64ff43', darker: '#0a2e03', surface: '#0d3806', border: 'rgba(100,255,67,0.18)', text: '#e6ffe0', textMid: 'rgba(230,255,224,0.55)' };

const TopListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('trending');

  useEffect(() => {
    fetchListings();
  }, [sortBy]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      // API call
      setListings([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: '40px', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <h2>Top Listings</h2>

      <div style={{ marginBottom: 24 }}>
        <label style={{ marginRight: 12 }}>Sort by: </label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '8px 12px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, cursor: 'pointer' }}>
          <option value="trending">Trending</option>
          <option value="newest">Newest</option>
          <option value="quantity">Quantity</option>
          <option value="nearby">Nearby</option>
        </select>
      </div>

      {loading ? (
        <p>Loading listings...</p>
      ) : listings.length > 0 ? (
        <div style={{ display: 'grid', gap: 16, maxWidth: 800 }}>
          {listings.map((listing, i) => (
            <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700 }}>{listing.title}</h3>
                <p style={{ margin: '0 0 4px', fontSize: 13, color: C.textMid }}>{listing.businessName}</p>
                <p style={{ margin: 0, fontSize: 13, color: C.textMid }}>{listing.quantity} • {listing.location}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.bright, marginBottom: 8 }}>#{i + 1}</div>
                <button style={{ padding: '8px 16px', background: C.border, border: 'none', borderRadius: 6, color: C.text, cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>View</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: C.textMid }}>No listings found.</p>
      )}
    </div>
  );
};

export default TopListingsPage;
