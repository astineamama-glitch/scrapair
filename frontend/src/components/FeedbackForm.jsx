import React, { useState, useEffect } from 'react';
import { useAuth } from '../shared/context/AuthContext';
import feedbackService from '../services/feedbackService';
import '../styles/FeedbackForm.css';

const FeedbackForm = ({ 
  collectionId, 
  business, 
  recycler, 
  onSubmitSuccess,
  feedbackStatus,
  onRefresh
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [canSubmit, setCanSubmit] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  const MIN_COMMENT_LENGTH = 20;
  const LOW_RATING_THRESHOLD = 3;

  // Determine who the current user is rating based on their role
  const getToUserId = () => {
    if (!user) return null;
    if (user.type === 'business') return recycler?.id;
    if (user.type === 'recycler') return business?.id;
    return null;
  };

  const getRatedPartyName = () => {
    if (!user) return 'party';
    if (user.type === 'business') return recycler?.companyName || recycler?.businessName || 'Recycler';
    if (user.type === 'recycler') return business?.businessName || business?.companyName || 'Business';
    return 'party';
  };

  // Validate form
  useEffect(() => {
    let message = '';
    let isValid = true;

    if (rating < LOW_RATING_THRESHOLD && comment.length < MIN_COMMENT_LENGTH) {
      message = `For ratings below ${LOW_RATING_THRESHOLD} stars, comment must be at least ${MIN_COMMENT_LENGTH} characters. Current: ${comment.length}`;
      isValid = false;
    }

    setValidationMessage(message);
    setCanSubmit(isValid && rating >= 1 && rating <= 5);
  }, [rating, comment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const toUserId = getToUserId();

    if (!collectionId || !toUserId) {
      setError('Missing collection or user information');
      return;
    }

    if (!canSubmit) {
      setError(validationMessage || 'Please fix validation errors');
      return;
    }

    setIsSubmitting(true);

    try {
      await feedbackService.submitFeedback({
        collectionId,
        toUserId,
        rating: parseFloat(rating),
        comment: comment.trim() || ''
      });

      setSuccess('Feedback submitted successfully!');
      setRating(5);
      setComment('');

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      
      if (onRefresh) {
        setTimeout(() => onRefresh(), 1000);
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
          {rating < LOW_RATING_THRESHOLD && (
            <div className="validation-note">
              ⚠️ Please provide a comment explaining your {rating}-star rating
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="comment">
            Comment {rating < LOW_RATING_THRESHOLD && '*'}
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            maxLength={500}
            rows={4}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '4px' }}>
            <span>{comment.length}/500 characters</span>
            {rating < LOW_RATING_THRESHOLD && (
              <span style={{ color: comment.length < MIN_COMMENT_LENGTH ? '#dc3545' : '#28a745' }}>
                {comment.length < MIN_COMMENT_LENGTH 
                  ? `${MIN_COMMENT_LENGTH - comment.length} more chars needed` 
                  : '✓ Valid'}
              </span>
            )}
          </div>
        </div>

        {validationMessage && (
          <div className="validation-message" style={{ color: '#dc3545', fontSize: '12px', marginBottom: '10px' }}>
            {validationMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          className="btn btn-primary"
          style={{
            opacity: (isSubmitting || !canSubmit) ? 0.6 : 1,
            cursor: (isSubmitting || !canSubmit) ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;

