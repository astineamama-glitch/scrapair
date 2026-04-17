import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import collectionService from '../../../../services/collectionService';
import { formatManilaInput } from '../../../../utils/manilaTimeFormatter';

const C = {
  bright: '#64ff43',
  darker: '#0a2e03',
  surface: '#0d3806',
  border: 'rgba(100,255,67,0.18)',
  text: '#e6ffe0',
  textMid: 'rgba(230,255,224,0.55)',
  error: '#ff6b6b',
  errorBg: 'rgba(255,107,107,0.1)',
  errorBorder: 'rgba(255,107,107,0.3)',
  success: '#86efac',
  successBg: 'rgba(134,239,172,0.1)',
  successBorder: 'rgba(134,239,172,0.3)',
};

const ManageCollectionRequestsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadCollections = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await collectionService.getAllCollections({ limit: 100 });
      setCollections(data.filter((collection) => collection.status === 'pending'));
    } catch (err) {
      setError(err.message || 'Failed to load collection requests');
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const handleApprove = async (collectionId) => {
    if (!window.confirm('Approve this request? The recycler will have 1 hour to pick up.')) {
      return;
    }

    try {
      setBusyId(collectionId);
      setError('');
      setSuccess('');
      await collectionService.approveCollection(collectionId);
      setSuccess('Collection approved. Recycler now has 1 hour to pick up.');
      await loadCollections();
    } catch (err) {
      setError(err.message || 'Failed to approve collection request');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (collectionId) => {
    if (!window.confirm('Reject this collection request?')) {
      return;
    }

    try {
      setBusyId(collectionId);
      setError('');
      setSuccess('');
      await collectionService.rejectCollection(collectionId);
      setSuccess('Collection request rejected.');
      await loadCollections();
    } catch (err) {
      setError(err.message || 'Failed to reject collection request');
    } finally {
      setBusyId(null);
    }
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Please login to manage collection requests.
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: '40px 20px', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, color: C.bright, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Requests</div>
            <h1 style={{ margin: 0, fontSize: 40 }}>Collection Requests</h1>
            <p style={{ margin: '8px 0 0', color: C.textMid }}>
              Review and approve collection requests from recyclers. Approved recyclers will have 1 hour to pick up materials.
            </p>
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

        {success && (
          <div style={{ background: C.successBg, border: `1px solid ${C.successBorder}`, color: C.success, borderRadius: 12, padding: 14, marginBottom: 20 }}>
            {success}
          </div>
        )}

        {loading ? (
          <div style={{ color: C.textMid, textAlign: 'center', padding: 40 }}>Loading requests...</div>
        ) : collections.length === 0 ? (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, textAlign: 'center', color: C.textMid }}>
            No pending collection requests right now.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {collections.map((collection) => (
              <div key={collection.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: '0 0 6px', color: C.bright }}>{collection.post?.title || collection.title}</h3>
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
                    <div style={{ fontSize: 11, color: C.textMid, textTransform: 'uppercase', marginBottom: 4 }}>Recycler</div>
                    <div>{collection.recyclerName || collection.recycler?.email || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: C.textMid, textTransform: 'uppercase', marginBottom: 4 }}>Requested</div>
                    <div>{collection.requestDate ? formatManilaInput(collection.requestDate) : 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: C.textMid, textTransform: 'uppercase', marginBottom: 4 }}>Proposed Pickup</div>
                    <div>{collection.scheduledDate ? formatManilaInput(collection.scheduledDate) : 'Not set'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleApprove(collection.id)}
                    disabled={busyId === collection.id}
                    style={{ padding: '12px 18px', borderRadius: 8, border: 'none', background: C.bright, color: '#082800', fontWeight: 700, cursor: 'pointer', opacity: busyId === collection.id ? 0.6 : 1 }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(collection.id)}
                    disabled={busyId === collection.id}
                    style={{ padding: '12px 18px', borderRadius: 8, border: '1px solid rgba(255,107,107,0.3)', background: 'transparent', color: C.error, fontWeight: 700, cursor: 'pointer', opacity: busyId === collection.id ? 0.6 : 1 }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCollectionRequestsPage;
