import React, { useState, useEffect } from 'react';

const C = { bright: '#64ff43', darker: '#0a2e03', surface: '#0d3806', border: 'rgba(100,255,67,0.18)', text: '#e6ffe0', textMid: 'rgba(230,255,224,0.55)' };

const RecyclerReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // API call for reviews
      setReviews([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < Math.floor(rating) ? C.bright : C.textMid }}>★</span>
    )).join('');
  };

  if (loading) return <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: 40 }}>Loading reviews...</div>;

  return (
    <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: '40px', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <h2>My Reviews</h2>

      {reviews.length === 0 ? (
        <p style={{ color: C.textMid }}>No reviews yet. Complete pickups to earn reviews!</p>
      ) : (
        <div style={{ display: 'grid', gap: 16, maxWidth: 600 }}>
          {reviews.map((review) => (
            <div key={review.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>{review.businessName}</h3>
                  <p style={{ margin: 0, fontSize: 12, color: C.textMid }}>{review.date}</p>
                </div>
                <span style={{ color: C.bright, fontSize: 14 }}>{renderStars(review.rating)}</span>
              </div>
              {review.comment && (
                <p style={{ margin: 0, fontSize: 14, color: C.textMid, lineHeight: 1.6 }}>"{review.comment}"</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecyclerReviewsPage;
