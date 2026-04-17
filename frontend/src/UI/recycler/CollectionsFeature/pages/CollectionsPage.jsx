import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import collectionService from '../../../../services/collectionService';
import { formatManila } from '../../../../utils/manilaTimeFormatter';

const C = {
  bright: '#64ff43',
  darker: '#0a2e03',
  surface: '#0d3806',
  border: 'rgba(100,255,67,0.18)',
  borderHover: 'rgba(100,255,67,0.45)',
  text: '#e6ffe0',
  textMid: 'rgba(230,255,224,0.55)',
  textLow: 'rgba(230,255,224,0.3)',
  error: '#ff6b6b',
  errorBg: 'rgba(255,107,107,0.1)',
  errorBorder: 'rgba(255,107,107,0.3)',
  info: '#7dd3fc',
  infoBg: 'rgba(125,211,252,0.1)',
  infoBorder: 'rgba(125,211,252,0.3)',
};

const STATUS_TABS = [
  'pending',
  'approved',
  'scheduled',
  'completed',
  'confirmed',
  'cancelled',
  'rejected',
];

const formatLocalDateTime = (value) => {
  if (!value) {
    return 'Not set';
  }

  return formatManila(value);
};

const getStatusStyles = (status) => {
  if (status === 'approved') {
    return {
      background: 'rgba(125,211,252,0.15)',
      color: C.info,
      border: 'rgba(125,211,252,0.3)',
    };
  }

  if (status === 'scheduled' || status === 'completed' || status === 'confirmed') {
    return {
      background: 'rgba(100,255,67,0.15)',
      color: C.bright,
      border: 'rgba(100,255,67,0.3)',
    };
  }

  if (status === 'cancelled' || status === 'rejected') {
    return {
      background: 'rgba(255,107,107,0.15)',
      color: C.error,
      border: 'rgba(255,107,107,0.3)',
    };
  }

  return {
    background: 'rgba(230,255,224,0.08)',
    color: C.textMid,
    border: 'rgba(230,255,224,0.15)',
  };
};

const CollectionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  const [hoveredCollection, setHoveredCollection] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const handleVisibilityChange = () => setIsPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadCollections = useCallback(async () => {
    if (!user) {
      setCollections([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const data =
        user.type === 'business'
          ? await collectionService.getAllCollections()
          : await collectionService.getUserCollections();

      setCollections(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load collections.');
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isPageVisible) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return undefined;
    }

    loadCollections();
    intervalRef.current = setInterval(loadCollections, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPageVisible, loadCollections]);

  const handleConfirmCollection = async (collectionId) => {
    if (!window.confirm('Confirm that pickup has been completed?')) {
      return;
    }

    try {
      await collectionService.confirmCollection(collectionId);
      setSuccess('Pickup confirmed successfully.');
      await loadCollections();
    } catch (err) {
      setError(err.message || 'Failed to confirm pickup.');
      setSuccess('');
    }
  };

  const handleAcceptMaterials = async (collectionId) => {
    if (!window.confirm('Accept materials for this collection?')) {
      return;
    }

    try {
      await collectionService.acceptMaterials(collectionId);
      setSuccess('Materials accepted successfully.');
      await loadCollections();
    } catch (err) {
      setError(err.message || 'Failed to accept materials.');
      setSuccess('');
    }
  };

  const handleCancelCollection = async (collectionId) => {
    if (!window.confirm('Cancel this collection request?')) {
      return;
    }

    try {
      await collectionService.cancelCollection(collectionId);
      setSuccess('Collection cancelled successfully.');
      setError('');
      await loadCollections();
    } catch (err) {
      setError(err.message || 'Failed to cancel collection.');
      setSuccess('');
    }
  };

  const tabCounts = useMemo(() => {
    return STATUS_TABS.reduce((acc, status) => {
      acc[status] = collections.filter((collection) => collection.status === status).length;
      return acc;
    }, {});
  }, [collections]);

  const filteredCollections = useMemo(() => {
    return collections.filter((collection) => collection.status === activeTab);
  }, [collections, activeTab]);

  if (loading && !user) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text }}>
        Loading collections...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text, fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: C.error }}>Please login to view collections.</p>
          <button onClick={() => navigate('/role-selection')} style={{ padding: '10px 24px', background: C.bright, border: 'none', borderRadius: 8, color: '#062400', fontWeight: 700, cursor: 'pointer', marginTop: 16 }}>
            Login
          </button>
        </div>
      </div>
    );
  }

  if (user.type === 'business') {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: '40px 20px', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 12, color: C.bright, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Collections</div>
              <h1 style={{ margin: 0, fontSize: 40 }}>Collections Management</h1>
              <p style={{ margin: '8px 0 0', color: C.textMid }}>Review requests, approve recyclers, and track active pickup windows.</p>
            </div>
            <button onClick={() => navigate(-1)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: C.bright, color: '#082800', fontWeight: 700, cursor: 'pointer' }}>
              Back
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <button
              onClick={() => navigate('/business/collection-requests')}
              style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 24, textAlign: 'left', color: C.text, cursor: 'pointer' }}
            >
              <div style={{ fontSize: 12, color: C.bright, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>New Requests</div>
              <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Collection Requests</div>
              <p style={{ margin: 0, color: C.textMid, lineHeight: 1.5 }}>
                Review and approve collection requests from recyclers. Approved recyclers will have 1 hour to pick up materials.
              </p>
            </button>

            <button
              onClick={() => navigate('/business/pending-approvals')}
              style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 24, textAlign: 'left', color: C.text, cursor: 'pointer' }}
            >
              <div style={{ fontSize: 12, color: C.bright, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Pending Approvals</div>
              <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Approved Pickups</div>
              <p style={{ margin: 0, color: C.textMid, lineHeight: 1.5 }}>
                Keep an eye on approved and scheduled pickups, including cancellations and pickup progress.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: '40px 20px', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 12, color: C.bright, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Tracking</div>
            <h1 style={{ margin: 0, fontSize: 40 }}>My Collections</h1>
            <p style={{ margin: '8px 0 0', color: C.textMid }}>Track collection requests from pending to confirmed.</p>
          </div>
          <button onClick={() => navigate(-1)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: C.bright, color: '#082800', fontWeight: 700, cursor: 'pointer' }}>
            Back
          </button>
        </div>

        {error && (
          <div style={{ background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: 8, padding: 14, marginBottom: 20, color: C.error }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: C.infoBg, border: `1px solid ${C.infoBorder}`, borderRadius: 8, padding: 14, marginBottom: 20, color: C.info }}>
            {success}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', flexWrap: 'wrap' }}>
          {STATUS_TABS.map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              style={{
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 8,
                border: `1px solid ${activeTab === status ? 'transparent' : C.border}`,
                background: activeTab === status ? C.bright : 'transparent',
                color: activeTab === status ? '#082800' : C.bright,
                cursor: 'pointer',
                textTransform: 'capitalize',
                whiteSpace: 'nowrap',
              }}
            >
              {status} <span style={{ opacity: 0.7 }}>({tabCounts[status] || 0})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 32, textAlign: 'center', color: C.textMid }}>
            Loading collections...
          </div>
        ) : filteredCollections.length === 0 ? (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 32, textAlign: 'center', color: C.textMid }}>
            No {activeTab} collections right now.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {filteredCollections.map((collection) => {
              const isHovered = hoveredCollection === collection.id;
              const statusStyles = getStatusStyles(collection.status);
              const cancellationLocked = (collection.cancellationCount || 0) >= 3;

              return (
                <div
                  key={collection.id}
                  onMouseEnter={() => setHoveredCollection(collection.id)}
                  onMouseLeave={() => setHoveredCollection(null)}
                  style={{
                    background: C.surface,
                    border: `1px solid ${isHovered ? C.borderHover : C.border}`,
                    borderRadius: 8,
                    padding: 20,
                    boxShadow: isHovered ? '0 12px 32px rgba(100,255,67,0.12)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                        <h3 style={{ margin: 0, fontSize: 18, color: C.bright }}>
                          {collection.post?.title || collection.title || `Collection #${collection.id}`}
                        </h3>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            padding: '4px 10px',
                            borderRadius: 8,
                            background: statusStyles.background,
                            color: statusStyles.color,
                            border: `1px solid ${statusStyles.border}`,
                          }}
                        >
                          {collection.status}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Material</div>
                          <div>{collection.post?.wasteType || collection.wasteType || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Quantity</div>
                          <div>{collection.post?.quantity || collection.quantity || 'N/A'} {collection.post?.unit || collection.unit || ''}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Business</div>
                          <div>{collection.business?.businessName || collection.business?.companyName || collection.business?.email || 'N/A'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Requested</div>
                          <div>{formatLocalDateTime(collection.requestDate || collection.createdAt)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Scheduled</div>
                          <div>{formatLocalDateTime(collection.scheduledDate)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: C.textLow, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Pickup Deadline</div>
                          <div>{formatLocalDateTime(collection.pickupDeadline)}</div>
                        </div>
                      </div>

                      {collection.description && (
                        <p style={{ margin: '16px 0 0', color: C.textMid, lineHeight: 1.5 }}>
                          {collection.description}
                        </p>
                      )}

                      {collection.cancellationReason && (
                        <p style={{ margin: '16px 0 0', color: C.error, lineHeight: 1.5 }}>
                          <strong>Reason:</strong> {String(collection.cancellationReason).replace(/_/g, ' ')}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 150 }}>
                      <button
                        onClick={() => navigate(`/collection/${collection.id}`)}
                        style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent', color: C.text, fontWeight: 700, cursor: 'pointer' }}
                      >
                        View Details
                      </button>

                      {['approved', 'scheduled'].includes(collection.status) && (
                        <button
                          onClick={() => handleConfirmCollection(collection.id)}
                          style={{ padding: '10px 14px', borderRadius: 8, border: 'none', background: C.bright, color: '#082800', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Confirm Pickup
                        </button>
                      )}

                      {collection.status === 'completed' && (
                        <button
                          onClick={() => handleAcceptMaterials(collection.id)}
                          style={{ padding: '10px 14px', borderRadius: 8, border: 'none', background: C.bright, color: '#082800', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Accept Materials
                        </button>
                      )}

                      {['pending', 'approved', 'scheduled'].includes(collection.status) && (
                        <button
                          onClick={() => handleCancelCollection(collection.id)}
                          disabled={cancellationLocked}
                          title={cancellationLocked ? 'You have already used your 3 allowed cancellations for this post.' : ''}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: `1px solid ${cancellationLocked ? C.border : C.errorBorder}`,
                            background: 'transparent',
                            color: cancellationLocked ? C.textLow : C.error,
                            fontWeight: 700,
                            cursor: cancellationLocked ? 'not-allowed' : 'pointer',
                            opacity: cancellationLocked ? 0.7 : 1,
                          }}
                        >
                          {cancellationLocked ? 'Cancel Locked' : 'Cancel Collection'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionsPage;
