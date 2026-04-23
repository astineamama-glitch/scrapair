import React, { useState, useEffect } from 'react';
import feedbackService from '../services/feedbackService';
import FeedbackForm from './FeedbackForm';
import RatingDisplay from './RatingDisplay';

const FeedbackStatusDisplay = ({
  collectionId,
  collection,
  currentUserType,
  collectionStatus,
  onRefresh
}) => {
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchFeedbackStatus = async () => {
    try {
      setLoading(true);
      setError('');
      const status = await feedbackService.getCollectionFeedbackStatus(collectionId);
      setFeedbackStatus(status);
    } catch (err) {
      setError(err.message || 'Failed to load feedback status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (collectionId && (collectionStatus === 'pickup_confirmed' || collectionStatus === 'materials_accepted')) {
      fetchFeedbackStatus();
    }
  }, [collectionId, collectionStatus]);

  const handleFeedbackSubmitted = () => {
    setShowForm(false);
    fetchFeedbackStatus();
    if (onRefresh) {
      onRefresh();
    }
  };

  if (!collectionId || (collectionStatus !== 'pickup_confirmed' && collectionStatus !== 'materials_accepted')) {
    return null;
  }

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        textAlign: 'center',
        color: '#666'
      }}>
        Loading feedback status...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '15px',
        backgroundColor: '#fee',
        borderRadius: '4px',
        color: '#c33',
        border: '1px solid #fcc'
      }}>
        {error}
      </div>
    );
  }

  if (!feedbackStatus) {
    return null;
  }

  const { canSubmit, yourFeedback, otherPartyFeedback, status, window: feedbackWindow, otherPartyName } = feedbackStatus;

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Feedback Window Status */}
      {(collectionStatus === 'pickup_confirmed' || collectionStatus === 'materials_accepted') && (
        <div style={{
          padding: '15px',
          backgroundColor: feedbackWindow?.isOpen ? '#d4edda' : '#fff3cd',
          border: `1px solid ${feedbackWindow?.isOpen ? '#c3e6cb' : '#ffc107'}`,
          borderRadius: '4px',
          marginBottom: '20px',
          color: feedbackWindow?.isOpen ? '#155724' : '#856404'
        }}>
          {feedbackWindow?.isOpen ? (
            <>
              <strong>✓ Feedback window is open</strong>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                You can leave feedback until {new Date(feedbackWindow.closesAt).toLocaleDateString()} 
                ({Math.round(feedbackWindow.hoursRemaining)} hours remaining)
              </p>
            </>
          ) : (
            <>
              <strong>⏱️ Feedback window not available</strong>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                {status === 'window_not_opened' 
                  ? `Feedback will open ${new Date(feedbackWindow.opensAt).toLocaleTimeString()}`
                  : 'Feedback window has closed'}
              </p>
            </>
          )}
        </div>
      )}

      {/* Your Feedback Status */}
      {yourFeedback ? (
        <div style={{
          padding: '15px',
          backgroundColor: '#e3f2fd',
          border: '1px solid #90caf9',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <strong>✓ Your Feedback Submitted</strong>
          <div style={{ marginTop: '10px' }}>
            <RatingDisplay rating={yourFeedback.rating} />
            {yourFeedback.comment && (
              <p style={{ margin: '10px 0 0 0', fontSize: '14px', fontStyle: 'italic', color: '#333' }}>
                "{yourFeedback.comment}"
              </p>
            )}
            <small style={{ color: '#666' }}>
              Submitted {new Date(yourFeedback.createdAt).toLocaleDateString()}
            </small>
          </div>
        </div>
      ) : canSubmit ? (
        <div style={{
          padding: '15px',
          backgroundColor: '#fff9e6',
          border: '1px solid #ffe58f',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <strong>Leave Your Feedback</strong>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
            Share your experience with this collection
          </p>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#ffc107',
              border: 'none',
              borderRadius: '4px',
              color: '#000',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {showForm ? 'Cancel' : 'Write Feedback'}
          </button>
        </div>
      ) : null}

      {/* Feedback Form */}
      {showForm && canSubmit && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f9f9f9',
          border: '1px solid #ddd',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <FeedbackForm
            collectionId={collectionId}
            business={collection?.business}
            recycler={collection?.recycler}
            onSubmitSuccess={handleFeedbackSubmitted}
            onRefresh={handleFeedbackSubmitted}
          />
        </div>
      )}

      {/* Other Party's Feedback */}
      {otherPartyFeedback ? (
        <div style={{
          padding: '15px',
          backgroundColor: '#f0f8ff',
          border: '1px solid #add8e6',
          borderRadius: '4px',
          marginTop: '20px'
        }}>
          <strong>{otherPartyName}'s Feedback</strong>
          <div style={{ marginTop: '10px' }}>
            <RatingDisplay rating={otherPartyFeedback.rating} />
            {otherPartyFeedback.comment && (
              <p style={{ margin: '10px 0 0 0', fontSize: '14px', fontStyle: 'italic', color: '#333' }}>
                "{otherPartyFeedback.comment}"
              </p>
            )}
            <small style={{ color: '#666' }}>
              Submitted {new Date(otherPartyFeedback.createdAt).toLocaleDateString()}
            </small>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '12px',
          backgroundColor: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: '4px',
          marginTop: '20px',
          textAlign: 'center',
          color: '#999',
          fontSize: '14px'
        }}>
          ⏳ Waiting for {otherPartyName} to leave feedback...
        </div>
      )}
    </div>
  );
};

export default FeedbackStatusDisplay;
