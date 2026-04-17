import React, { useState, useEffect } from 'react';

const C = { bright: '#64ff43', darker: '#0a2e03', surface: '#0d3806', border: 'rgba(100,255,67,0.18)', text: '#e6ffe0', textMid: 'rgba(230,255,224,0.55)' };

const RecyclerRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // API call for requests
      setRequests([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: 40 }}>Loading requests...</div>;

  const filteredRequests = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  return (
    <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: '40px', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
      <h2>My Collection Requests</h2>
      
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {['all', 'pending', 'approved', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: '8px 16px', background: filter === s ? C.bright : C.surface, color: filter === s ? '#062400' : C.text, border: `1px solid ${C.border}`, borderRadius: 6, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize' }}>
            {s}
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <p style={{ color: C.textMid }}>No requests in this category.</p>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {filteredRequests.map((req) => (
            <div key={req.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>{req.wasteMaterial}</h3>
                  <p style={{ margin: '0 0 4px', fontSize: 14, color: C.textMid }}>Business: {req.businessName}</p>
                  <p style={{ margin: 0, fontSize: 14, color: C.textMid }}>{req.quantity} • {req.location}</p>
                </div>
                <span style={{ background: req.status === 'approved' ? 'rgba(100,255,67,0.2)' : 'rgba(255,193,7,0.2)', color: req.status === 'approved' ? C.bright : '#ffc107', padding: '6px 12px', borderRadius: 4, fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
                  {req.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecyclerRequestsPage;
