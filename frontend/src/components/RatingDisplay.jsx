import React, { useState, useEffect } from 'react';
import { useAuth } from '../shared/context/AuthContext';
import ratingService from '../services/ratingService';
import '../styles/RatingDisplay.css';

const RatingDisplay = ({ userId = null, postId = null, variant = 'compact' }) => {
  const { token } = useAuth();
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRating = async () => {
      try {
        setLoading(true);
        let data;
        
        if (userId) {
          data = await ratingService.getUserRating(userId);
        } else if (postId) {
          data = await ratingService.getPostRating(postId);
        } else {
          throw new Error('Either userId or postId is required');
        }

        setRating(data);
      } catch (err) {
        setError('Could not load rating');
      } finally {
        setLoading(false);
      }
    };

    if (userId || postId) {
      fetchRating();
    }
  }, [userId, postId, token]);

  if (loading) {
    return <div className={`rating-display ${variant}`}>Loading rating...</div>;
  }

  if (error) {
    return <div className={`rating-display ${variant}`}>Rating unavailable</div>;
  }

  if (!rating) {
    return <div className={`rating-display ${variant}`}>No ratings yet</div>;
  }

  const renderStars = (avg) => {
    const fullStars = Math.floor(avg);
    const hasHalf = avg % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`star-${i}`} className="star full">★</span>);
    }

    if (hasHalf) {
      stars.push(<span key="star-half" className="star half">★</span>);
    }

    const emptyStars = 5 - Math.ceil(avg);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }

    return stars;
  };

  return (
    <div className={`rating-display ${variant}`}>
      {variant === 'compact' ? (
        <div className="rating-compact">
          <span className="stars">{renderStars(rating.averageRating)}</span>
          <span className="value">{rating.averageRating.toFixed(1)}</span>
          {rating.totalRatings > 0 && (
            <span className="count">({rating.totalRatings})</span>
          )}
        </div>
      ) : (
        <div className="rating-detailed">
          <div className="rating-header">
            <h4>{userId ? 'User Rating' : 'Post Rating'}</h4>
          </div>
          <div className="rating-content">
            <div className="rating-stars">
              {renderStars(rating.averageRating)}
            </div>
            <div className="rating-stats">
              <p className="average">
                <strong>{rating.averageRating.toFixed(1)}</strong> out of 5
              </p>
              <p className="based-on">
                Based on {rating.totalRatings} rating{rating.totalRatings !== 1 ? 's' : ''}
              </p>
              {rating.recentFeedback && rating.recentFeedback.length > 0 && (
                <div className="recent-feedback">
                  <h5>Recent Feedback:</h5>
                  <ul>
                    {rating.recentFeedback.slice(0, 3).map((fb, idx) => (
                      <li key={idx}>
                        <span className="rating-value">{fb.rating} ★</span>
                        {fb.fromUser && (
                          <span className="reviewer">
                            {fb.fromUser.businessName || fb.fromUser.companyName || fb.fromUser.email}
                          </span>
                        )}
                        {fb.comment && <span className="comment">"{fb.comment}"</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingDisplay;

