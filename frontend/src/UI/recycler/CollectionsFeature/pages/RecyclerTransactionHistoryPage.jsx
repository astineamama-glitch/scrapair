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
  success: '#64ff43',
  successBg: 'rgba(100,255,67,0.1)',
  successBorder: 'rgba(100,255,67,0.3)',
  info: '#7dd3fc',
  infoBg: 'rgba(125,211,252,0.1)',
  infoBorder: 'rgba(125,211,252,0.3)',
};

const COMPLETED_STATUSES = ['pickup_confirmed', 'materials_accepted'];

const formatLocalDateTime = (value) => {
  if (!value) {
    return 'Not set';
  }
  return formatManila(value);
};

const getStatusStyles = (status) => {
  if (status === 'materials_accepted') {
    return {
      background: 'rgba(100,255,67,0.15)',
      color: C.success,
      border: 'rgba(100,255,67,0.3)',
      label: 'Completed',
    };
  }

  if (status === 'pickup_confirmed') {
    return {
      background: 'rgba(125,211,252,0.15)',
      color: C.info,
      border: 'rgba(125,211,252,0.3)',
      label: 'Pickup Confirmed',
    };
  }

  return {
    background: 'rgba(230,255,224,0.08)',
    color: C.textMid,
    border: 'rgba(230,255,224,0.15)',
    label: status,
  };
};

const RecyclerTransactionHistoryPage = () => {
  const navigate = useNavigate();
  const authContext = useAuth();
  const user = authContext?.user;
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredCollection, setHoveredCollection] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
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

      const data = await collectionService.getUserCollections();
      
      const completedCollections = (Array.isArray(data) ? data : []).filter((col) =>
        COMPLETED_STATUSES.includes(col.status)
      );

      setCollections(completedCollections);
    } catch (err) {
      setError(err.message || 'Failed to load transaction history.');
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

  const filteredAndSorted = useMemo(() => {
    let filtered = collections;

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((col) => col.status === filterStatus);
    }

    // Sort
    const sorted = [...filtered];
    if (sortBy === 'newest') {
      sorted.sort(
        (a, b) =>
          new Date(b.completedAt || b.updatedAt || 0) -
          new Date(a.completedAt || a.updatedAt || 0)
      );
    } else if (sortBy === 'oldest') {
      sorted.sort(
        (a, b) =>
          new Date(a.completedAt || a.updatedAt || 0) -
          new Date(b.completedAt || b.updatedAt || 0)
      );
    }

    return sorted;
  }, [collections, filterStatus, sortBy]);

  const stats = useMemo(() => {
    return {
      total: collections.length,
      completed: collections.filter((c) => c.status === 'materials_accepted').length,
      pickupConfirmed: collections.filter((c) => c.status === 'pickup_confirmed').length,
    };
  }, [collections]);

  if (!user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: C.darker,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: C.text,
          fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: C.success, marginBottom: 16 }}>Please login to view transaction history.</p>
          <button
            onClick={() => navigate('/role-selection')}
            style={{
              padding: '10px 24px',
              background: C.bright,
              border: 'none',
              borderRadius: 8,
              color: '#062400',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.darker,
        color: C.text,
        padding: '40px 20px',
        fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
          <div>
            <div
              style={{
                fontSize: 12,
                color: C.bright,
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              Transaction History
            </div>
            <h1 style={{ margin: 0, fontSize: 40, fontWeight: 900 }}>Completed Pickups</h1>
            <p style={{ margin: '8px 0 0', color: C.textMid }}>View all your completed transactions and pickup history.</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              border: 'none',
              background: C.bright,
              color: '#082800',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Back
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              background: 'rgba(255,107,107,0.1)',
              border: '1px solid rgba(255,107,107,0.3)',
              borderRadius: 8,
              padding: 14,
              marginBottom: 20,
              color: '#ff6b6b',
            }}
          >
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.successBorder}`,
              borderRadius: 12,
              padding: 20,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, color: C.bright, fontWeight: 800, marginBottom: 8 }}>
              {stats.total}
            </div>
            <div style={{ fontSize: 12, color: C.textMid, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Transactions
            </div>
          </div>
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.infoBorder}`,
              borderRadius: 12,
              padding: 20,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, color: C.info, fontWeight: 800, marginBottom: 8 }}>
              {stats.pickupConfirmed}
            </div>
            <div style={{ fontSize: 12, color: C.textMid, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pickup Confirmed
            </div>
          </div>
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.successBorder}`,
              borderRadius: 12,
              padding: 20,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, color: C.success, fontWeight: 800, marginBottom: 8 }}>
              {stats.completed}
            </div>
            <div style={{ fontSize: 12, color: C.textMid, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Fully Completed
            </div>
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginBottom: 24,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            <label style={{ fontSize: 12, color: C.textMid, fontWeight: 700, textTransform: 'uppercase', alignSelf: 'center' }}>
              Status:
            </label>
            {['all', ...COMPLETED_STATUSES].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: 6,
                  border: `1px solid ${filterStatus === status ? 'transparent' : C.border}`,
                  background: filterStatus === status ? C.bright : 'transparent',
                  color: filterStatus === status ? '#082800' : C.bright,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                }}
              >
                {status === 'all' ? 'All' : status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <label style={{ fontSize: 12, color: C.textMid, fontWeight: 700, textTransform: 'uppercase', alignSelf: 'center' }}>
              Sort:
            </label>
            {['newest', 'oldest'].map((sort) => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                style={{
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: 6,
                  border: `1px solid ${sortBy === sort ? 'transparent' : C.border}`,
                  background: sortBy === sort ? C.bright : 'transparent',
                  color: sortBy === sort ? '#082800' : C.bright,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                }}
              >
                {sort === 'newest' ? 'Newest First' : 'Oldest First'}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        {loading ? (
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: 32,
              textAlign: 'center',
              color: C.textMid,
            }}
          >
            Loading transactions...
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: 32,
              textAlign: 'center',
              color: C.textMid,
            }}
          >
            No completed transactions yet. Start requesting collections to build your transaction history.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {filteredAndSorted.map((collection) => {
              const isHovered = hoveredCollection === collection.id;
              const statusStyles = getStatusStyles(collection.status);

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
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/recycler/collection/${collection.id}/${collection.transactionCode || 'unknown'}`)} 
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'start' }}>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          flexWrap: 'wrap',
                          marginBottom: 12,
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            fontSize: 18,
                            color: C.bright,
                            fontWeight: 800,
                          }}
                        >
                          {collection.post?.title || `Transaction #${collection.id}`}
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
                          {statusStyles.label}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
                        <div>
                          <div
                            style={{
                              fontSize: 11,
                              color: C.textLow,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              marginBottom: 4,
                            }}
                          >
                            Material
                          </div>
                          <div>{collection.post?.wasteType || 'N/A'}</div>
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 11,
                              color: C.textLow,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              marginBottom: 4,
                            }}
                          >
                            Quantity
                          </div>
                          <div>
                            {collection.post?.quantity || 'N/A'} {collection.post?.unit || ''}
                          </div>
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 11,
                              color: C.textLow,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              marginBottom: 4,
                            }}
                          >
                            Business
                          </div>
                          <div>
                            {collection.business?.businessName ||
                              collection.business?.companyName ||
                              collection.business?.email ||
                              'N/A'}
                          </div>
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 11,
                              color: C.textLow,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              marginBottom: 4,
                            }}
                          >
                            Requested
                          </div>
                          <div>{formatLocalDateTime(collection.requestDate || collection.createdAt)}</div>
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 11,
                              color: C.textLow,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              marginBottom: 4,
                            }}
                          >
                            Completed
                          </div>
                          <div>{formatLocalDateTime(collection.completedAt)}</div>
                        </div>
                        {collection.transactionCode && (
                          <div>
                            <div
                              style={{
                                fontSize: 11,
                                color: C.textLow,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                marginBottom: 4,
                              }}
                            >
                              Transaction Code
                            </div>
                            <div style={{ fontFamily: 'monospace', fontSize: 12, color: C.bright }}>
                              {collection.transactionCode}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 150 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/recycler/collection/${collection.id}/${collection.transactionCode || 'unknown'}`);
                        }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: `1px solid ${C.border}`,
                          background: 'transparent',
                          color: C.text,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        View Details
                      </button>
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

export default RecyclerTransactionHistoryPage;
