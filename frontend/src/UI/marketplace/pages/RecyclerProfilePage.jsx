import React, { useState, useEffect } from 'react';

const C = { bright: '#64ff43', darker: '#0a2e03', surface: '#0d3806', border: 'rgba(100,255,67,0.18)', text: '#e6ffe0', textMid: 'rgba(230,255,224,0.55)' };

const RecyclerProfilePage = () => {
  const [recycler, setRecycler] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // API call
      setRecycler(null);
      setReviews([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: 40 }}>Loading profile...</div>;

  return (
    <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: '40px', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      {recycler && (
        <>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, marginBottom: 32 }}>
            <h2 style={{ margin: '0 0 8px' }}>{recycler.name}</h2>
            <p style={{ margin: '0 0 16px', color: C.textMid }}>{recycler.location}</p>
            <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
              <div>
                <p style={{ margin: '0 0 4px', color: C.textMid, fontSize: 12 }}>Pickups Completed</p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.bright }}>{recycler.pickupsCompleted}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', color: C.textMid, fontSize: 12 }}>Average Rating</p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.bright }}>{recycler.averageRating}★</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', color: C.textMid, fontSize: 12 }}>Reviews</p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.bright }}>{recycler.reviewCount}</p>
              </div>
            </div>
            <button style={{ padding: '10px 20px', background: C.border, border: 'none', borderRadius: 6, color: C.text, cursor: 'pointer', fontWeight: 700 }}>Send Request</button>
          </div>

          <h3>Recent Reviews</h3>
          {reviews.length === 0 ? (
            <p style={{ color: C.textMid }}>No reviews yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: 16, maxWidth: 600 }}>
              {reviews.map((review, i) => (
                <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                    <p style={{ margin: 0, fontWeight: 700 }}>{review.reviewer}</p>
                    <span style={{ color: C.bright }}>{'★'.repeat(Math.floor(review.rating))}</span>
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: 13, color: C.textMid }}>{review.date}</p>
                  <p style={{ margin: 0, fontSize: 13, color: C.textMid }}>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecyclerProfilePage;
