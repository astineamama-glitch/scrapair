import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../shared/context/AuthContext';
import messageService from '../../../../services/messageService';
import socketService from '../../../../services/socketService';

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

const ConversationPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [sending, setSending] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showProductPreview, setShowProductPreview] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const initializeSocket = useCallback(() => {
    try {
      const socket = socketService.connect(token);
      const activeConversationId = Number(conversationId);

      if (!socket || Number.isNaN(activeConversationId)) {
        return undefined;
      }

      socketService.emit('conversation:join', activeConversationId);

      const handleMessageReceived = (data) => {
        if (data.conversationId !== activeConversationId) {
          return;
        }

        const incomingSenderId = data.senderId ?? data.sender?.id;

        setMessages((prev) => {
          const filtered = prev.filter(
            (message) =>
              !(
                message._optimistic &&
                message.senderId === incomingSenderId &&
                message.content === data.content &&
                (message.imageUrl || null) === (data.imageUrl || null)
              )
          );

          if (filtered.find((message) => message.id === data.id)) {
            return filtered;
          }

          return [...filtered, { ...data, senderId: incomingSenderId }];
        });
      };

      const handleUserTyping = (data) => {
        if (data.conversationId === activeConversationId && data.userId !== user.id) {
          setOtherUserTyping(true);
        }
      };

      const handleUserStopTyping = (data) => {
        if (data.conversationId === activeConversationId) {
          setOtherUserTyping(false);
        }
      };

      socketService.on('message:received', handleMessageReceived);
      socketService.on('user:typing', handleUserTyping);
      socketService.on('user:stop-typing', handleUserStopTyping);

      return () => {
        socketService.emit('conversation:leave', activeConversationId);
        socketService.off('message:received', handleMessageReceived);
        socketService.off('user:typing', handleUserTyping);
        socketService.off('user:stop-typing', handleUserStopTyping);
      };
    } catch (err) {
      console.error('Socket error:', err);
      return undefined;
    }
  }, [conversationId, token, user?.id]);

  const loadConversation = useCallback(async () => {
    try {
      const response = await messageService.getConversation(conversationId);
      setConversation(response || null);
      setError('');
    } catch (err) {
      console.error('[ConversationPage] Failed to load conversation:', err.status, err.data?.error, err.message);
      setConversation(null);
      setError(err.data?.error || err.message || 'Failed to load conversation');
    }
  }, [conversationId]);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await messageService.getConversationMessages(conversationId, 1, 100);
      setMessages(Array.isArray(response) ? response : []);
    } catch (err) {
      setError('Failed to load messages');
      console.error('[ConversationPage] Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || !token) {
      return undefined;
    }

    loadConversation();
    loadMessages();
    const cleanupSocket = initializeSocket();

    return () => {
      if (cleanupSocket) {
        cleanupSocket();
      }
    };
  }, [conversationId, token, loadConversation, loadMessages, initializeSocket]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result || '');
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadMessageImage = async () => {
    if (!imageFile) return '';
    setImageUploading(true);
    try {
      const response = await messageService.uploadMessageImage(imageFile);
      return response.url || '';
    } catch (err) {
      const message = err.message || err.data?.error || 'Failed to upload image';
      setError(message);
      throw err;
    } finally {
      setImageUploading(false);
    }
  };

  const handleMessageContentChange = (e) => {
    const content = e.target.value;
    setMessageContent(content);

    if (content.trim()) {
      socketService.emit('message:typing', parseInt(conversationId));
    }

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      socketService.emit('message:stop-typing', parseInt(conversationId));
    }, 2000);

    setTypingTimeout(timeout);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageContent.trim() && !imageFile) {
      setError('Please enter a message or select an image.');
      return;
    }

    setSending(true);
    setError('');

    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadMessageImage();
        if (!imageUrl) {
          throw new Error('Image upload did not return a valid URL');
        }
      }

      const otherParticipant =
        conversation?.participant1?.id === user.id
          ? conversation?.participant2
          : conversation?.participant1;

      const optimisticMessage = {
        id: Date.now(),
        conversationId: parseInt(conversationId),
        senderId: user.id,
        recipientId: otherParticipant?.id,
        sender: {
          id: user.id,
          businessName: user.businessName,
          email: user.email
        },
        content: messageContent,
        imageUrl: imageUrl || null,
        createdAt: new Date().toISOString(),
        _optimistic: true  // Mark as optimistic for deduplication
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      await messageService.sendMessage(
        conversationId,
        otherParticipant?.id,
        messageContent,
        imageUrl
      );

      setMessageContent('');
      setImageFile(null);
      setImagePreview('');
    } catch (err) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', background: C.darker, color: C.text, minHeight: '100vh', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
        <p>Please login to view messages.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', background: C.darker, color: C.text, minHeight: '100vh', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.bright, animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', background: C.darker, color: C.text, minHeight: '100vh', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: C.surface, padding: '24px', borderRadius: '12px', border: `1px solid ${C.border}`, maxWidth: '400px' }}>
          <p style={{ color: '#ff6b6b', fontWeight: 700, marginBottom: 12 }}>⚠️ {error || 'Conversation not found'}</p>
          <button onClick={() => navigate('/messages')} style={{ padding: '10px 16px', background: C.bright, color: C.darker, border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  const otherParticipant =
    conversation?.participant1?.id === user.id
      ? conversation?.participant2
      : conversation?.participant1;

  const wastePost = conversation?.wastePost
    ? {
        ...conversation.wastePost,
        imageUrls: conversation.wastePost.imageUrls || conversation.wastePost.images || [],
        pricePerUnit: conversation.wastePost.pricePerUnit ?? conversation.wastePost.price
      }
    : null;
  const wastePostImages = wastePost?.imageUrls || [];
  const wastePostPrice = wastePost?.pricePerUnit;

  return (
    <div style={{ minHeight: '100vh', background: C.darker, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflow: 'hidden', display: 'flex', flexDirection: 'column', color: C.text }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes bounce { 0%, 80%, 100% { opacity: 0.5; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-5px); } }
        *::-webkit-scrollbar { width: 6px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: rgba(100,255,67,0.3); border-radius: 3px; }
        *::-webkit-scrollbar-thumb:hover { background: rgba(100,255,67,0.5); }
      `}</style>

      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/messages')} style={{ background: 'none', border: 'none', color: C.bright, cursor: 'pointer', fontSize: 20, padding: 8, transition: 'all 0.2s' }} onMouseEnter={e => { e.target.style.color = C.text; e.target.style.transform = 'scale(1.1)'; }} onMouseLeave={e => { e.target.style.color = C.bright; e.target.style.transform = 'scale(1)'; }}>
            ←
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>
              {otherParticipant?.businessName || otherParticipant?.name || otherParticipant?.email || 'Conversation'}
            </h2>
            {wastePost && <p style={{ margin: '4px 0 0 0', fontSize: 12, color: C.textMid }}>📦 {wastePost.title}</p>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {wastePost && (
            <button
              onClick={() => setShowProductPreview(!showProductPreview)}
              style={{
                padding: '8px 16px',
                background: showProductPreview ? C.bright : 'transparent',
                color: showProductPreview ? C.darker : C.bright,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
              onMouseEnter={e => { if (!showProductPreview) { e.target.style.borderColor = C.bright; e.target.style.color = C.bright; } }}
              onMouseLeave={e => { if (!showProductPreview) { e.target.style.borderColor = C.border; e.target.style.color = C.bright; } }}
            >
              View Item
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', gap: 16, padding: 16 }}>
        {/* Messages Column */}
        <div style={{ flex: showProductPreview && wastePost ? '1' : '1', display: 'flex', flexDirection: 'column', background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'hidden', minWidth: 0 }}>
          {/* Messages Container */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: C.textMid, margin: 'auto' }}>
                <div style={{ fontSize: 12, marginBottom: 8 }}>Loading...</div>
                <div style={{ width: 30, height: 30, border: `2px solid ${C.border}`, borderTopColor: C.bright, borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: C.textMid, margin: 'auto' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>💬</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>No messages yet</div>
                <div style={{ fontSize: 12, color: C.textLow, marginTop: 4 }}>Start the conversation!</div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={msg.id || idx} style={{ display: 'flex', justifyContent: msg.senderId === user.id ? 'flex-end' : 'flex-start', animation: 'slideIn 0.3s ease' }}>
                  <div style={{
                    maxWidth: '70%',
                    backgroundColor: msg.senderId === user.id ? C.bright : C.darker,
                    color: msg.senderId === user.id ? C.darker : C.text,
                    padding: '12px 16px',
                    borderRadius: msg.senderId === user.id ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    wordWrap: 'break-word',
                    boxShadow: msg.senderId === user.id ? `0 4px 12px rgba(100,255,67,0.2)` : 'none',
                  }}>
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="Message" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, marginBottom: msg.content ? 8 : 0, display: 'block' }} />
                    )}
                    {msg.content && <p style={{ margin: 0, fontSize: 13, lineHeight: 1.4 }}>{msg.content}</p>}
                    <p style={{ margin: '6px 0 0 0', fontSize: 11, opacity: 0.7 }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}

            {otherUserTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ backgroundColor: C.darker, padding: '12px 16px', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontStyle: 'italic', color: C.textMid }}>typing</span>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: 4, height: 4, backgroundColor: C.bright, borderRadius: '50%', animation: `bounce 1.4s infinite ${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div style={{ padding: 12, borderTop: `1px solid ${C.border}`, background: C.darker }}>
              <div style={{ position: 'relative', width: 'fit-content' }}>
                <img src={imagePreview} alt="Preview" style={{ maxWidth: 80, maxHeight: 80, borderRadius: 8, border: `1px solid ${C.border}` }} />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(''); }}
                  style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, backgroundColor: C.error, color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ backgroundColor: C.errorBg, border: `1px solid ${C.errorBorder}`, color: C.error, padding: 12, borderRadius: 8, fontSize: 12, margin: 12 }}>
              {error}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSendMessage} style={{ padding: 12, borderTop: `1px solid ${C.border}`, background: C.darker, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              value={messageContent}
              onChange={handleMessageContentChange}
              placeholder="Type a message..."
              rows="2"
              style={{
                flex: 1,
                padding: '10px 12px',
                border: `1px solid ${C.border}`,
                backgroundColor: C.darker,
                color: C.text,
                borderRadius: 8,
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 13,
                resize: 'none',
                transition: 'all 0.2s',
                outlineColor: C.bright,
              }}
              onFocus={e => { e.target.style.borderColor = C.bright; e.target.style.boxShadow = `0 0 0 2px rgba(100,255,67,0.1)`; }}
              onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
            />
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} id="msg-image" />
            <label htmlFor="msg-image" style={{ padding: '10px 12px', backgroundColor: C.surface, border: `1px solid ${C.border}`, color: C.text, borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.borderHover; e.currentTarget.style.borderColor = C.bright; e.currentTarget.style.color = C.bright; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = C.surface; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text; }}>
              📷
            </label>
            <button type="submit" disabled={sending || imageUploading} style={{ padding: '10px 16px', background: C.bright, color: C.darker, border: 'none', borderRadius: 6, cursor: sending || imageUploading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13, transition: 'all 0.2s', opacity: sending || imageUploading ? 0.6 : 1 }} onMouseEnter={e => { if (!sending && !imageUploading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = `0 8px 20px rgba(100,255,67,0.3)`; } }} onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}>
              {sending ? '...' : '→'}
            </button>
          </form>
        </div>

        {/* Product Preview Column */}
        {showProductPreview && wastePost && (
          <div style={{ width: 320, background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ backgroundColor: C.darker, borderRadius: 8, overflow: 'hidden', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
              {wastePostImages[0] ? (
                <img src={wastePostImages[0]} alt={wastePost.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ color: C.textMid, fontSize: 12 }}>No image</div>
              )}
            </div>

            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700, color: C.bright, lineHeight: 1.2 }}>
                {wastePost.title}
              </h3>
              {wastePostPrice && (
                <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.bright }}>
                  ₱{Number(wastePost.pricePerUnit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  {wastePost.unit && <span style={{ fontSize: 12, color: C.textMid, marginLeft: 6 }}>per {wastePost.unit}</span>}
                </p>
              )}
            </div>

            {wastePost.description && (
              <div>
                <p style={{ margin: 0, fontSize: 12, color: C.textMid, lineHeight: 1.5 }}>
                  {wastePost.description}
                </p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
              {wastePost.quantity && (
                <div style={{ backgroundColor: 'rgba(100,255,67,0.08)', border: `1px solid ${C.border}`, padding: 12, borderRadius: 8 }}>
                  <p style={{ margin: 0, fontSize: 10, color: C.textLow, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Quantity</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: 13, color: C.text, fontWeight: 600 }}>
                    {wastePost.quantity} {wastePost.unit || 'units'}
                  </p>
                </div>
              )}
              {wastePost.materials?.length > 0 && (
                <div style={{ backgroundColor: 'rgba(100,255,67,0.08)', border: `1px solid ${C.border}`, padding: 12, borderRadius: 8 }}>
                  <p style={{ margin: 0, fontSize: 10, color: C.textLow, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Materials</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: 12, color: C.text, fontWeight: 600 }}>
                    {wastePost.materials.map(m => m.name).join(', ')}
                  </p>
                </div>
              )}
              {wastePost.location && (
                <div style={{ backgroundColor: 'rgba(100,255,67,0.08)', border: `1px solid ${C.border}`, padding: 12, borderRadius: 8 }}>
                  <p style={{ margin: 0, fontSize: 10, color: C.textLow, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>📍 Location</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: 12, color: C.text, fontWeight: 600 }}>
                    {wastePost.location}
                  </p>
                </div>
              )}
            </div>

            {wastePost.status && (
              <div style={{ display: 'inline-block', backgroundColor: wastePost.status === 'available' ? 'rgba(100,255,67,0.15)' : 'rgba(255,107,107,0.15)', color: wastePost.status === 'available' ? C.bright : C.error, padding: '8px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {wastePost.status}
              </div>
            )}

            <div style={{ backgroundColor: 'rgba(100,255,67,0.08)', border: `1px solid ${C.border}`, padding: 12, borderRadius: 8, fontSize: 12, color: C.textMid, lineHeight: 1.5 }}>
              💡 Discuss details, negotiate price, or schedule a collection with the seller.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationPage;
