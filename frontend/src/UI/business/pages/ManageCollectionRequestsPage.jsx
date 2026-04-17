import React, { useState, useEffect } from 'react';

const C = { bright: '#64ff43', darker: '#0a2e03', surface: '#0d3806', border: 'rgba(100,255,67,0.18)', text: '#e6ffe0', textMid: 'rgba(230,255,224,0.55)' };

const ManageCollectionRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // API call to fetch collection requests
      setRequests([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      // API call to approve request
      await fetchRequests();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm('Reject this collection request?')) return;
    try {
      // API call to reject request
      await fetchRequests();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: 40 }}>Loading requests...</div>;

  const filteredRequests = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  return (
    <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: '40px', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <h2>Collection Requests</h2>
      {error && <div style={{ background: 'rgba(255,107,107,0.1)', padding: '12px 16px', marginBottom: 20, color: '#ff6b6b', borderRadius: 6 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {['all', 'pending', 'approved', 'rejected'].map(status => (
          <button key={status} onClick={() => setFilter(status)} style={{ padding: '8px 16px', background: filter === status ? C.bright : C.surface, color: filter === status ? '#062400' : C.text, border: `1px solid ${C.border}`, borderRadius: 6, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize' }}>
            {status}
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <p style={{ color: C.textMid }}>No collection requests found.</p>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {filteredRequests.map((request) => (
            <div key={request.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>{request.wasteMaterial}</h3>
                  <p style={{ margin: 0, fontSize: 14, color: C.textMid }}>Requested by: {request.recyclerName}</p>
                </div>
                <span style={{ background: request.status === 'pending' ? 'rgba(255,193,7,0.2)' : request.status === 'approved' ? 'rgba(100,255,67,0.2)' : 'rgba(255,107,107,0.2)', color: request.status === 'pending' ? '#ffc107' : request.status === 'approved' ? C.bright : '#ff6b6b', padding: '6px 12px', borderRadius: 4, fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
                  {request.status}
                </span>
              </div>
              <p style={{ margin: '0 0 16px', fontSize: 14, color: C.textMid }}>Proposed pickup: {request.proposedDate}</p>
              {request.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleApprove(request.id)} style={{ flex: 1, padding: '8px 16px', background: 'rgba(100,255,67,0.2)', color: C.bright, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>Approve</button>
                  <button onClick={() => handleReject(request.id)} style={{ flex: 1, padding: '8px 16px', background: 'rgba(255,107,107,0.2)', color: '#ff6b6b', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageCollectionRequestsPage;
