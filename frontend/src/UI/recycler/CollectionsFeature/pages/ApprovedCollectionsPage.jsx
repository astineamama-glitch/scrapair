import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../../../shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import collectionService from '../../../../services/collectionService';
import { formatManilaInput } from '../../../../utils/manilaTimeFormatter';

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
};

const CountdownTimer = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!deadline) {
      setTimeLeft('No deadline');
      return undefined;
    }

    const updateTimer = () => {
      const diff = new Date(deadline) - new Date();

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return <span style={{ color: timeLeft === 'Expired' ? C.error : C.bright, fontWeight: 800 }}>{timeLeft}</span>;
};

const ApprovedCollectionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page] = useState(1);
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  const intervalRef = useRef(null);

  const approvedCollections = useMemo(
    () => collections.filter((collection) => ['approved', 'scheduled', 'completed', 'confirmed'].includes(collection.status)),
    [collections]
  );

  useEffect(() => {
    const handleVisibilityChange = () => setIsPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await collectionService.getUserCollections({ page, limit: 20 });
      setCollections(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load approved collections');
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (!isPageVisible) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return undefined;
    }

    loadCollections();
    intervalRef.current = setInterval(loadCollections, 15000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPageVisible, loadCollections]);

  const handleConfirmPickup = async (collectionId) => {
    if (!window.confirm('Confirm pickup for this collection?')) {
      return;
    }

    try {
      await collectionService.confirmCollection(collectionId);
      await loadCollections();
    } catch (err) {
      setError(err.message || 'Failed to confirm pickup');
    }
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Please login to view approved collections.
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: '40px 20px', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, color: C.bright, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Pickups</div>
            <h1 style={{ margin: 0, fontSize: 40 }}>Approved Collections</h1>
          </div>
          <button onClick={() => navigate(-1)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: C.bright, color: '#082800', fontWeight: 700, cursor: 'pointer' }}>
            Back
          </button>
        </div>

        {error && (
          <div style={{ background: C.errorBg, border: `1px solid ${C.errorBorder}`, color: C.error, borderRadius: 12, padding: 14, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {loading && approvedCollections.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.textMid, padding: 40 }}>Loading collections...</div>
        ) : approvedCollections.length === 0 ? (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, textAlign: 'center', color: C.textMid }}>
            No approved collections right now.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {approvedCollections.map((collection) => (
              <div key={collection.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: '0 0 6px', color: C.bright }}>{collection.post?.title || collection.title || `Collection #${collection.id}`}</h3>
                    <div style={{ fontSize: 13, color: C.textMid }}>
                      {collection.post?.wasteType || collection.wasteType} • {collection.post?.quantity || collection.quantity} {collection.post?.unit || collection.unit}
                    </div>
                  </div>
                  <div style={{ textTransform: 'uppercase', fontSize: 12, fontWeight: 800, color: C.bright }}>
                    {collection.status}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: C.textLow, textTransform: 'uppercase', marginBottom: 4 }}>Business</div>
                    <div>{collection.business?.businessName || collection.business?.companyName || collection.business?.email || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: C.textLow, textTransform: 'uppercase', marginBottom: 4 }}>Location</div>
                    <div>{collection.post?.address || collection.address || collection.post?.city || collection.city || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: C.textLow, textTransform: 'uppercase', marginBottom: 4 }}>Pickup Window</div>
                    <CountdownTimer deadline={collection.pickupDeadline} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: C.textLow, textTransform: 'uppercase', marginBottom: 4 }}>Proposed Pickup</div>
                    <div>{collection.scheduledDate ? formatManilaInput(collection.scheduledDate) : 'Not set'}</div>
                  </div>
                </div>

                {collection.description && (
                  <p style={{ marginTop: 0, color: C.textMid, lineHeight: 1.5 }}>{collection.description}</p>
                )}

                {['approved', 'scheduled'].includes(collection.status) ? (
                  <button onClick={() => handleConfirmPickup(collection.id)} style={{ padding: '12px 18px', borderRadius: 8, border: 'none', background: C.bright, color: '#082800', fontWeight: 700, cursor: 'pointer' }}>
                    Confirm Pickup
                  </button>
                ) : (
                  <div style={{ color: C.bright, fontWeight: 700 }}>
                    {collection.status === 'confirmed' ? 'Collection confirmed.' : 'Pickup already completed.'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovedCollectionsPage;
