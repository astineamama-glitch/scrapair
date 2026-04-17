import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const C = { bright: '#64ff43', darker: '#0a2e03', surface: '#0d3806', border: 'rgba(100,255,67,0.18)', text: '#e6ffe0', textMid: 'rgba(230,255,224,0.55)' };

const MarketplaceMessagesPage = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      // API call
      setConversations([]);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConvId) return;
    try {
      // API call to send message
      setNewMessage('');
      // Refresh messages
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: 40 }}>Loading messages...</div>;

  return (
    <div style={{ minHeight: '100vh', background: C.darker, color: C.text, padding: '40px', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", display: 'flex' }}>
      <div style={{ flex: '0 0 320px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginRight: 20, maxHeight: '100vh', overflowY: 'auto' }}>
        <h3>Conversations</h3>
        {conversations.length === 0 ? (
          <p style={{ color: C.textMid, fontSize: 14 }}>No conversations yet.</p>
        ) : (
          conversations.map((conv) => (
            <div key={conv.id} onClick={() => { setSelectedConvId(conv.id); }} style={{ padding: 12, borderRadius: 8, cursor: 'pointer', marginBottom: 8, background: selectedConvId === conv.id ? 'rgba(100,255,67,0.15)' : 'transparent', border: selectedConvId === conv.id ? `1px solid ${C.border}` : '1px solid transparent', transition: 'all 0.2s' }} onMouseEnter={e => { if (selectedConvId !== conv.id) e.currentTarget.style.background = 'rgba(100,255,67,0.06)'; }} onMouseLeave={e => { if (selectedConvId !== conv.id) e.currentTarget.style.background = 'transparent'; }}>
              <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 14 }}>{conv.participantName}</p>
              <p style={{ margin: 0, color: C.textMid, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.lastMessage}</p>
            </div>
          ))
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedConvId ? (
          <>
            <div style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.isOwn ? 'flex-end' : 'flex-start' }}>
                  <div style={{ background: msg.isOwn ? C.bright : C.border, color: msg.isOwn ? '#062400' : C.text, padding: '10px 16px', borderRadius: 8, maxWidth: '70%', wordWrap: 'break-word' }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: '12px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.surface, color: C.text, fontFamily: 'inherit', resize: 'none', height: 48 }} />
              <button onClick={handleSendMessage} style={{ padding: '12px 24px', background: C.bright, color: '#062400', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Send</button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: C.textMid }}>Select a conversation to view messages</div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceMessagesPage;
