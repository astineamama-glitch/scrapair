import React, { useState } from 'react';
import { useAuth } from '../shared/context/AuthContext';
import feedbackService from '../services/feedbackService';
import '../styles/FeedbackForm.css';

const FeedbackForm = ({ collectionId, business, recycler, onSubmitSuccess }) => {
  const { user, token } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Determine who the current user is rating based on their role
  const getToUserId = () => {
    if (!user) return null;
    
    if (user.type === 'business') {
      // Business rates the recycler
      return recycler?.id;
    } else if (user.type === 'recycler') {
      // Recycler rates the business
      return business?.id;
    }
    return null;
  };

  const getRatedPartyName = () => {
    if (!user) return 'party';
    
    if (user.type === 'business') {
      return recycler?.companyName || recycler?.businessName || 'Recycler';
    } else if (user.type === 'recycler') {
      return business?.businessName || business?.companyName || 'Business';
    }
    return 'party';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const toUserId = getToUserId();

    if (!collectionId || !toUserId) {
      setError('Missing collection or user information');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5');
      return;
    }

    setIsSubmitting(true);

    try {
      await feedbackService.submitFeedback({
        collectionId,
        toUserId,
        rating: parseFloat(rating),
        comment: comment.trim() || '',
        type: 'positive'
      });

      setSuccess('Feedback submitted successfully!');
      setRating(5);
      setComment('');
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (err) {
      setError(err.message || 'Error submitting feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-form-container">
      <h3>Leave Feedback for {getRatedPartyName()}</h3>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="rating">Rating *</label>
          <div className="rating-selector">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star ${rating >= star ? 'active' : ''}`}
                onClick={() => setRating(star)}
                title={`${star} star${star !== 1 ? 's' : ''}`}
              >
                ★
              </button>
            ))}
          </div>
          <small>{rating} out of 5 stars</small>
        </div>

        <div className="form-group">
          <label htmlFor="comment">Comment (Optional)</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            maxLength={500}
            rows={4}
          />
          <small>{comment.length}/500 characters</small>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;

