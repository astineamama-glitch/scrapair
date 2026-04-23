import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import collectionService from '../../../../services/collectionService';
import messageService from '../../../../services/messageService';
import FeedbackForm from '../../../../components/FeedbackForm';
import FeedbackStatusDisplay from '../../../../components/FeedbackStatusDisplay';
import ReportForm from '../../../../components/ReportForm';
import { formatManila, formatManilaInput } from '../../../../utils/manilaTimeFormatter';

const formatTimestamp = (value) => {
  if (!value) {
    return 'Not set';
  }

  return formatManila(value);
};

const formatScheduled = (value) => {
  if (!value) {
    return 'Not set';
  }

  return formatManilaInput(value);
};

const getStatusColors = (status) => {
  switch (status) {
    case 'pending':
      return { background: '#fff3cd', color: '#856404' };
    case 'approved':
      return { background: '#d1ecf1', color: '#0c5460' };
    case 'scheduled':
      return { background: '#cfe2ff', color: '#084298' };
    case 'pickup_confirmed':
    case 'materials_accepted':
      return { background: '#d4edda', color: '#155724' };
    case 'cancelled':
    case 'rejected':
      return { background: '#f8d7da', color: '#721c24' };
    default:
      return { background: '#f5f5f5', color: '#333' };
  }
};

const sectionStyle = {
  backgroundColor: '#f5f5f5',
  padding: '15px',
  borderRadius: '4px',
  marginBottom: '20px',
};

const CollectionDetailPage = () => {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadCollectionDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await collectionService.getCollectionDetails(collectionId);
      setCollection(data);
    } catch (err) {
      setError(err.message || 'Failed to load collection details.');
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    loadCollectionDetails();
  }, [loadCollectionDetails]);

  const handleApprove = async () => {
    if (!window.confirm('Approve this collection request?')) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      await collectionService.approveCollection(collectionId);
      setSuccess('Collection approved.');
      await loadCollectionDetails();
    } catch (err) {
      setError(err.message || 'Failed to approve collection.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSchedule = () => {
    navigate(`/collection/schedule/${collectionId}`);
  };

  const handleConfirmPickup = async () => {
    if (!window.confirm('Confirm that pickup has happened?')) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      await collectionService.confirmCollection(collectionId);
      setSuccess('Pickup confirmed.');
      await loadCollectionDetails();
    } catch (err) {
      setError(err.message || 'Failed to confirm pickup.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptMaterials = async () => {
    if (!window.confirm('Accept materials for this collection?')) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      await collectionService.acceptMaterials(collectionId);
      setSuccess('Materials accepted.');
      await loadCollectionDetails();
    } catch (err) {
      setError(err.message || 'Failed to accept materials.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessage = async () => {
    try {
      if (!user || !collection?.post?.id || !collection.business || !collection.recycler) {
        setError('Cannot start conversation because collection details are incomplete.');
        return;
      }

      const otherUserId = user.type === 'business' ? collection.recycler.id : collection.business.id;
      const conversation = await messageService.startConversation(otherUserId, collection.post.id);

      if (!conversation?.id) {
        throw new Error('Conversation could not be created.');
      }

      navigate(`/messages/${conversation.id}`);
    } catch (err) {
      setError(err.message || 'Failed to open conversation.');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this collection?')) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      await collectionService.cancelCollection(collectionId);
      setSuccess('Collection cancelled successfully.');
      await loadCollectionDetails();
    } catch (err) {
      setError(err.message || 'Failed to cancel collection.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px 20px', textAlign: 'center' }}>Loading collection details...</div>;
  }

  if (!collection) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2>Collection not found</h2>
        <button
          onClick={() => navigate('/collections')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px',
          }}
        >
          Back to Collections
        </button>
      </div>
    );
  }

  const statusColors = getStatusColors(collection.status);
  const recyclerCanCancel = ['pending', 'approved', 'scheduled'].includes(collection.status);
  const businessCanCancel = ['approved', 'scheduled'].includes(collection.status);
  const cancellationLocked = (collection.cancellationCount || 0) >= 3;

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Back
        </button>
        <h1 style={{ margin: 0, textAlign: 'center', flex: 1 }}>Collection #{collection.id}</h1>
        <div style={{ width: 72 }} />
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee', padding: '15px', borderRadius: '4px', color: '#c33', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: '#efe', padding: '15px', borderRadius: '4px', color: '#2f7d32', marginBottom: '20px' }}>
          {success}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div>
          <div
            style={{
              backgroundColor: statusColors.background,
              color: statusColors.color,
              padding: '15px',
              borderRadius: '4px',
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '16px',
              textTransform: 'uppercase',
            }}
          >
            Status: {collection.status}
          </div>

          {collection.post && (
            <div style={sectionStyle}>
              <h3 style={{ margin: '0 0 15px 0' }}>Material Details</h3>
              <p style={{ margin: '8px 0' }}><strong>Title:</strong> {collection.post.title || collection.title || 'N/A'}</p>
              <p style={{ margin: '8px 0' }}><strong>Type:</strong> {collection.post.wasteType || collection.wasteType || 'N/A'}</p>
              <p style={{ margin: '8px 0' }}><strong>Quantity:</strong> {collection.post.quantity || collection.quantity || 'N/A'} {collection.post.unit || collection.unit || ''}</p>
              <p style={{ margin: '8px 0' }}><strong>Condition:</strong> {collection.post.condition || collection.condition || 'N/A'}</p>
              <p style={{ margin: '8px 0' }}><strong>Location:</strong> {collection.post.address || collection.address || collection.post.city || collection.city || 'N/A'}</p>
              {collection.post.description || collection.description ? (
                <p style={{ margin: '8px 0' }}><strong>Description:</strong> {collection.post.description || collection.description}</p>
              ) : null}
            </div>
          )}

          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 15px 0' }}>Timeline</h3>
            <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Requested:</strong> {formatTimestamp(collection.requestDate || collection.createdAt)}</p>
            <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Scheduled:</strong> {formatScheduled(collection.scheduledDate)}</p>
            <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Completed:</strong> {formatTimestamp(collection.completedAt)}</p>
            <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Pickup Deadline:</strong> {formatTimestamp(collection.pickupDeadline)}</p>
          </div>
        </div>

        <div>
          {collection.recycler && (
            <div style={{ ...sectionStyle, backgroundColor: '#e3f2fd', border: '1px solid #90caf9' }}>
              <h3 style={{ margin: '0 0 15px 0' }}>Recycler Information</h3>
              <p style={{ margin: '8px 0' }}><strong>Email:</strong> {collection.recycler.email || 'N/A'}</p>
              {collection.recycler.phone ? <p style={{ margin: '8px 0' }}><strong>Phone:</strong> {collection.recycler.phone}</p> : null}
            </div>
          )}

          {collection.business && (
            <div style={{ ...sectionStyle, backgroundColor: '#f0f8ff', border: '1px solid #add8e6' }}>
              <h3 style={{ margin: '0 0 15px 0' }}>Business Information</h3>
              <p style={{ margin: '8px 0' }}><strong>Email:</strong> {collection.business.email || 'N/A'}</p>
              {collection.business.phone ? <p style={{ margin: '8px 0' }}><strong>Phone:</strong> {collection.business.phone}</p> : null}
            </div>
          )}

          {collection.cancellationReason && (
            <div style={{ backgroundColor: '#fff0f0', padding: '15px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #f5c6cb' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#721c24' }}>Cancellation Reason</h3>
              <p style={{ margin: 0, color: '#721c24' }}>{String(collection.cancellationReason).replace(/_/g, ' ')}</p>
            </div>
          )}

          {collection.transactionCode && (
            <div style={sectionStyle}>
              <h3 style={{ margin: '0 0 10px 0' }}>Transaction</h3>
              <p style={{ margin: 0 }}><strong>Code:</strong> {collection.transactionCode}</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '30px' }}>
        <button
          onClick={handleMessage}
          disabled={actionLoading}
          style={{
            padding: '12px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: actionLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            opacity: actionLoading ? 0.7 : 1,
          }}
        >
          Message
        </button>

        {user?.type === 'business' && collection.status === 'pending' && (
          <button
            onClick={handleApprove}
            disabled={actionLoading}
            style={{
              padding: '12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: actionLoading ? 0.7 : 1,
            }}
          >
            Approve
          </button>
        )}

        {user?.type === 'business' && collection.status === 'approved' && (
          <button
            onClick={handleSchedule}
            disabled={actionLoading}
            style={{
              padding: '12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: actionLoading ? 0.7 : 1,
            }}
          >
            Schedule
          </button>
        )}

        {user?.type === 'recycler' && ['approved', 'scheduled'].includes(collection.status) && (
          <button
            onClick={handleConfirmPickup}
            disabled={actionLoading}
            style={{
              padding: '12px',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: actionLoading ? 0.7 : 1,
            }}
          >
            Confirm Pickup
          </button>
        )}

        {user?.type === 'recycler' && collection.status === 'pickup_confirmed' && (
          <button
            onClick={handleAcceptMaterials}
            disabled={actionLoading}
            style={{
              padding: '12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: actionLoading ? 0.7 : 1,
            }}
          >
            Accept Materials
          </button>
        )}

        {user?.type === 'recycler' && recyclerCanCancel && (
          <button
            onClick={handleCancel}
            disabled={actionLoading || cancellationLocked}
            title={cancellationLocked ? 'You have used your 3 allowed cancellations for this post.' : ''}
            style={{
              padding: '12px',
              backgroundColor: cancellationLocked ? '#ccc' : '#dc3545',
              color: cancellationLocked ? '#999' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (actionLoading || cancellationLocked) ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: actionLoading ? 0.7 : 1,
            }}
          >
            {cancellationLocked ? 'Cancel Locked' : 'Cancel Collection'}
          </button>
        )}

        {user?.type === 'business' && businessCanCancel && (
          <button
            onClick={handleCancel}
            disabled={actionLoading}
            style={{
              padding: '12px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: actionLoading ? 0.7 : 1,
            }}
          >
            Cancel Collection
          </button>
        )}
      </div>

      <div style={{ backgroundColor: '#e7f3ff', padding: '15px', borderRadius: '4px', border: '1px solid #b3d9ff' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#004085' }}>
          <strong>Tip:</strong> Use the message button to coordinate pickup timing and any material questions with the other party.
        </p>
      </div>


      {/* New Feedback Section - Enhanced */}
      {(collection.status === 'pickup_confirmed' || collection.status === 'materials_accepted') && (
        <div style={{ marginTop: '30px' }}>
          <h3>Collection Feedback</h3>
          <FeedbackStatusDisplay
            collectionId={collection.id}
            collection={collection}
            currentUserType={user?.type}
            collectionStatus={collection.status}
            onRefresh={loadCollectionDetails}
          />
        </div>
      )}

      {/* Report Section - For Completed Collections */}
      {(collection.status === 'pickup_confirmed' || collection.status === 'materials_accepted') && (
        <div style={{ marginTop: '30px' }}>
          <h3>Report an Issue</h3>
          <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '4px', border: '1px solid #ffecb5', marginBottom: '20px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>
              <strong>⚠️ Having issues with this transaction?</strong> Submit a report to notify our support team.
            </p>
          </div>
          <ReportForm 
            reportedUserId={user?.type === 'business' ? collection.recycler?.id : collection.business?.id}
            collectionId={collection.id}
            onSubmitSuccess={loadCollectionDetails}
          />
        </div>
      )}
    </div>
  );
};

export default CollectionDetailPage;
