import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  info: '#7dd3fc',
  infoBg: 'rgba(125,211,252,0.1)',
  infoBorder: 'rgba(125,211,252,0.3)',
};

// Floating Chat Widget Component
const FloatingChatWidget = ({ 
  selectedConv, 
  user, 
  onClose, 
  onMinimize, 
  isMinimized, 
  token 
}) => {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [sending, setSending] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const otherParticipant = selectedConv
    ? (selectedConv.participant1?.id === user.id ? selectedConv.participant2 : selectedConv.participant1)
    : null;
  const wastePost = selectedConv?.wastePost
    ? {
        ...selectedConv.wastePost,
        imageUrls: selectedConv.wastePost.imageUrls || selectedConv.wastePost.images || [],
        pricePerUnit: selectedConv.wastePost.pricePerUnit ?? selectedConv.wastePost.price
      }
    : null;
  const selectedConvId = selectedConv?.id ? Number(selectedConv.id) : null;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const initializeSocket = useCallback(() => {
    try {
      const socket = socketService.connect(token);
      const activeConversationId = selectedConvId;

      if (!socket || !activeConversationId || Number.isNaN(activeConversationId)) {
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
  }, [selectedConvId, token, user?.id]);

  const loadMessages = useCallback(async () => {
    if (!selectedConvId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await messageService.getConversationMessages(selectedConvId, 1, 100);
      setMessages(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [selectedConvId]);

  useEffect(() => {
    if (!selectedConvId || !token) {
      return undefined;
    }

    loadMessages();
    const cleanupSocket = initializeSocket();

    return () => {
      if (cleanupSocket) {
        cleanupSocket();
      }
    };
  }, [selectedConvId, token, loadMessages, initializeSocket]);

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
      socketService.emit('message:typing', parseInt(selectedConv.id));
    }

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      socketService.emit('message:stop-typing', parseInt(selectedConv.id));
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

      const optimisticMessage = {
        id: Date.now(),
        conversationId: parseInt(selectedConv.id),
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
        selectedConv.id,
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

  if (isMinimized) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      width: 400,
      height: '90vh',
      maxHeight: 700,
      background: C.surface,
      borderRadius: '12px 12px 0 0',
      border: `1px solid ${C.border}`,
      borderBottom: 'none',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
      zIndex: 999,
      animation: 'slideInRight 0.3s ease',
      fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
      color: C.text,
    }}>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bounce { 0%, 80%, 100% { opacity: 0.5; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-5px); } }
        *::-webkit-scrollbar { width: 6px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: rgba(100,255,67,0.3); border-radius: 3px; }
        *::-webkit-scrollbar-thumb:hover { background: rgba(100,255,67,0.5); }
      `}</style>

      {/* Header */}
      <div style={{ background: C.darker, borderBottom: `1px solid ${C.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.bright }}>
            {otherParticipant?.businessName || otherParticipant?.name || 'Chat'}
          </h3>
          {wastePost && <p style={{ margin: '2px 0 0', fontSize: 10, color: C.textMid }}>?? {wastePost.title}</p>}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {wastePost && (
            <button
              onClick={() => setExpandedProduct(wastePost)}
              style={{
                padding: '6px 10px',
                background: 'transparent',
                color: C.bright,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 10,
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = C.bright; e.target.style.background = 'rgba(100,255,67,0.08)'; }}
              onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = 'transparent'; }}
            >
              Item
            </button>
          )}
          <button onClick={() => onMinimize()} style={{ padding: '6px 10px', background: 'transparent', color: C.text, border: `1px solid ${C.border}`, borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, transition: 'all 0.2s' }} onMouseEnter={e => { e.target.style.borderColor = C.bright; e.target.style.color = C.bright; }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.text; }}>-</button>
          <button onClick={() => onClose()} style={{ padding: '6px 10px', background: 'transparent', color: C.text, border: `1px solid ${C.border}`, borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, transition: 'all 0.2s' }} onMouseEnter={e => { e.target.style.borderColor = C.error; e.target.style.color = C.error; }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.text; }}>�</button>
        </div>
      </div>

      {/* Messages Container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: C.textMid, margin: 'auto' }}>
            <div style={{ width: 20, height: 20, border: `2px solid ${C.border}`, borderTopColor: C.bright, borderRadius: '50%', margin: '0 auto 8px', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: 11 }}>Loading...</div>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: C.textMid, margin: 'auto' }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>??</div>
            <div style={{ fontSize: 11, fontWeight: 500 }}>No messages yet</div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={msg.id || idx} style={{ display: 'flex', justifyContent: msg.senderId === user.id ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%',
                backgroundColor: msg.senderId === user.id ? C.bright : C.darker,
                color: msg.senderId === user.id ? C.darker : C.text,
                padding: '10px 12px',
                borderRadius: msg.senderId === user.id ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                wordWrap: 'break-word',
                boxShadow: msg.senderId === user.id ? `0 2px 8px rgba(100,255,67,0.2)` : 'none',
              }}>
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="Attachment" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 6, marginBottom: msg.content ? 6 : 0, display: 'block' }} />
                )}
                {msg.content && <p style={{ margin: 0, fontSize: 11, lineHeight: 1.4 }}>{msg.content}</p>}
                <p style={{ margin: '3px 0 0 0', fontSize: 9, opacity: 0.7 }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}

        {otherUserTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ backgroundColor: C.darker, padding: '10px 12px', borderRadius: '12px 12px 12px 4px', display: 'flex', gap: 3, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ width: 3, height: 3, backgroundColor: C.bright, borderRadius: '50%', animation: `bounce 1.4s infinite ${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div style={{ padding: 10, borderTop: `1px solid ${C.border}`, background: C.darker }}>
          <div style={{ position: 'relative', width: 'fit-content' }}>
            <img src={imagePreview} alt="Preview" style={{ maxWidth: 60, maxHeight: 60, borderRadius: 6, border: `1px solid ${C.border}` }} />
            <button
              onClick={() => { setImageFile(null); setImagePreview(''); }}
              style={{ position: 'absolute', top: -8, right: -8, width: 18, height: 18, backgroundColor: C.error, color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              �
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ backgroundColor: C.errorBg, border: `1px solid ${C.errorBorder}`, color: C.error, padding: 8, borderRadius: 6, fontSize: 10, margin: 10, marginBottom: 0 }}>
          {error}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} style={{ padding: 10, borderTop: `1px solid ${C.border}`, background: C.darker, display: 'flex', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
        <textarea
          value={messageContent}
          onChange={handleMessageContentChange}
          placeholder="Message..."
          rows="2"
          style={{
            flex: 1,
            padding: '8px 10px',
            border: `1px solid ${C.border}`,
            backgroundColor: C.darker,
            color: C.text,
            borderRadius: 6,
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 11,
            resize: 'none',
            transition: 'all 0.2s',
          }}
          onFocus={e => { e.target.style.borderColor = C.bright; }}
          onBlur={e => { e.target.style.borderColor = C.border; }}
        />
        <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} id="msg-img-float" />
        <label htmlFor="msg-img-float" style={{ padding: '8px 9px', backgroundColor: C.surface, border: `1px solid ${C.border}`, color: C.text, borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600, transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.borderHover; e.currentTarget.style.borderColor = C.bright; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = C.surface; e.currentTarget.style.borderColor = C.border; }}>
          ??
        </label>
        <button type="submit" disabled={sending || imageUploading} style={{ padding: '8px 10px', background: C.bright, color: C.darker, border: 'none', borderRadius: 6, cursor: sending || imageUploading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 11, transition: 'all 0.2s', opacity: sending || imageUploading ? 0.6 : 1 }}>
          {sending ? '...' : '?'}
        </button>
      </form>

      {/* Expanded Product Modal */}
      {expandedProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, animation: 'fadeIn 0.2s' }} onClick={() => setExpandedProduct(null)}>
          <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, maxWidth: 420, maxHeight: '80vh', overflowY: 'auto', padding: 20, position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setExpandedProduct(null)} style={{ position: 'absolute', top: 12, right: 12, width: 28, height: 28, background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 6, cursor: 'pointer', fontSize: 14, color: C.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>�</button>

            <div style={{ backgroundColor: C.darker, borderRadius: 10, overflow: 'hidden', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              {expandedProduct.imageUrls?.[0] ? (
                <img src={expandedProduct.imageUrls[0]} alt={expandedProduct.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ color: C.textMid }}>No image</div>
              )}
            </div>

            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, color: C.bright }}>
              {expandedProduct.title}
            </h2>

            {expandedProduct.pricePerUnit && (
              <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.bright, marginBottom: 12 }}>
                ?{Number(expandedProduct.pricePerUnit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                {expandedProduct.unit && <span style={{ fontSize: 12, color: C.textMid }}>/{expandedProduct.unit}</span>}
              </p>
            )}

            {expandedProduct.description && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 11, color: C.textLow, textTransform: 'uppercase', fontWeight: 700 }}>Description</h3>
                <p style={{ margin: 0, fontSize: 12, color: C.text, lineHeight: 1.5 }}>
                  {expandedProduct.description}
                </p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              {expandedProduct.quantity && (
                <div style={{ backgroundColor: 'rgba(100,255,67,0.08)', border: `1px solid ${C.border}`, padding: 10, borderRadius: 6 }}>
                  <p style={{ margin: 0, fontSize: 9, color: C.textLow, textTransform: 'uppercase', fontWeight: 700 }}>Qty</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: C.bright, fontWeight: 700 }}>
                    {expandedProduct.quantity} {expandedProduct.unit || ''}
                  </p>
                </div>
              )}
              {expandedProduct.location && (
                <div style={{ backgroundColor: 'rgba(100,255,67,0.08)', border: `1px solid ${C.border}`, padding: 10, borderRadius: 6 }}>
                  <p style={{ margin: 0, fontSize: 9, color: C.textLow, textTransform: 'uppercase', fontWeight: 700 }}>?? Location</p>
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: C.text, fontWeight: 600 }}>
                    {expandedProduct.location}
                  </p>
                </div>
              )}
            </div>

            {expandedProduct.materials?.length > 0 && (
              <div style={{ backgroundColor: 'rgba(100,255,67,0.08)', border: `1px solid ${C.border}`, padding: 10, borderRadius: 6, marginBottom: 12 }}>
                <p style={{ margin: 0, fontSize: 9, color: C.textLow, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Materials</p>
                <p style={{ margin: 0, fontSize: 11, color: C.text, fontWeight: 600 }}>
                  {expandedProduct.materials.map(m => m.name).join(', ')}
                </p>
              </div>
            )}

            {expandedProduct.status && (
              <div style={{ display: 'inline-block', backgroundColor: expandedProduct.status === 'available' ? 'rgba(100,255,67,0.15)' : 'rgba(255,107,107,0.15)', color: expandedProduct.status === 'available' ? C.bright : C.error, padding: '8px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                ? {expandedProduct.status}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MessagesPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [hoveredConv, setHoveredConv] = useState(null);
  const intervalRef = useRef(null);

  // Floating chat state
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [minimizedLabel, setMinimizedLabel] = useState('');

  const loadConversations = useCallback(async (ignoreCache = false) => {
    if (messageService.isCacheValid() && !ignoreCache) {
      setLoading(false);
    } else {
      setLoading(true);
    }
    
    setError('');
    try {
      const conversationsArray = await messageService.getConversations(ignoreCache);
      setConversations(conversationsArray);
      setUnreadCounts({});
    } catch (err) {
      setError(err.message || 'Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle Page Visibility API
  useEffect(() => {
    const handleVisibilityChange = () => setIsPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Mouse and scroll tracking
  useEffect(() => {
    const mm = (e) => setMouse({ x: e.clientX, y: e.clientY });
    const sc = () => setScrollY(window.scrollY);
    window.addEventListener('mousemove', mm);
    window.addEventListener('scroll', sc);
    return () => {
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('scroll', sc);
    };
  }, []);

  // Polling effect
  useEffect(() => {
    if (!isPageVisible) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    loadConversations();
    intervalRef.current = setInterval(loadConversations, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPageVisible, loadConversations]);

  // WebSocket listener
  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const socket = socketService.connect(token);

    if (!socket) {
      return undefined;
    }

    const handleConversationUpdate = () => {
      messageService.clearConversationsCache();
      loadConversations(true);
    };

    socketService.onConversationUpdate(handleConversationUpdate);

    return () => {
      socketService.off('conversation:updated', handleConversationUpdate);
    };
  }, [token, loadConversations]);

  const handleOpenChat = (conversationId, businessName) => {
    setSelectedConversationId(conversationId);
    setIsMinimized(false);
    setMinimizedLabel(businessName?.substring(0, 15) || 'Chat');
  };

  const handleCloseChat = () => {
    setSelectedConversationId(null);
    setIsMinimized(false);
  };

  const handleMinimizeChat = () => {
    setIsMinimized(true);
  };

  const handleManualRefresh = () => {
    loadConversations(true);
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: C.darker, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", color: C.text }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: C.error }}>Please login to view messages</p>
          <button onClick={() => navigate('/role-selection')} style={{ padding: '10px 24px', background: C.bright, border: 'none', borderRadius: 12, color: '#062400', fontWeight: 700, cursor: 'pointer', marginTop: 16, transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.transform = 'scale(1.05)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'}>Login</button>
        </div>
      </div>
    );
  }

  const selectedConv = conversations.find(c => c.id === selectedConversationId);

  return (
    <div style={{ minHeight: '100vh', background: C.darker, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: 'hidden', color: C.text }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      {/* Background Effects */}
      <div style={{ position: 'fixed', top: mouse.y - 320, left: mouse.x - 320, width: 640, height: 640, background: 'radial-gradient(circle, rgba(100,255,67,0.055) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0, transition: 'top 0.35s ease, left 0.35s ease' }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 1 }} />

      {/* Navigation */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: scrollY > 60 ? 'rgba(10,46,3,0.93)' : 'transparent', backdropFilter: scrollY > 60 ? 'blur(28px)' : 'none', borderBottom: scrollY > 60 ? `1px solid ${C.border}` : '1px solid transparent', transition: 'all 0.35s ease' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(100,255,67,0.12)', border: '1px solid rgba(100,255,67,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 5, height: 5, backgroundColor: C.bright, borderRadius: '50%' }} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>ScraPair</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={handleManualRefresh} style={{ padding: '8px 16px', fontSize: 12, fontWeight: 700, borderRadius: 100, border: `1px solid ${C.border}`, background: 'transparent', color: C.bright, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.target.style.borderColor = C.borderHover; e.target.style.background = 'rgba(100,255,67,0.1)'; }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = 'transparent'; }}>? Refresh</button>
            <button onClick={() => navigate(-1)} style={{ padding: '8px 16px', fontSize: 12, fontWeight: 700, borderRadius: 100, border: 'none', background: C.bright, color: '#082800', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 12px rgba(100,255,67,0.3)' }} onMouseEnter={e => { e.target.style.boxShadow = '0 0 20px rgba(100,255,67,0.5)'; e.target.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => { e.target.style.boxShadow = '0 0 12px rgba(100,255,67,0.3)'; e.target.style.transform = 'translateY(0)'; }}>? Back</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '40px 40px', position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: C.bright, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Messages</div>
          <h1 style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1px', margin: '0 0 8px', color: C.text }}>Conversations</h1>
          <p style={{ fontSize: 14, color: C.textMid, margin: 0 }}>Click on any conversation to start chatting</p>
        </div>

        {/* Info Messages */}
        {!isPageVisible && (
          <div style={{ background: C.infoBg, border: `1px solid ${C.infoBorder}`, borderRadius: 12, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: C.info, fontWeight: 500 }}>?? Polling paused - click Refresh to update</span>
          </div>
        )}
        {error && (
          <div style={{ background: C.errorBg, border: `1px solid ${C.errorBorder}`, borderRadius: 12, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: C.error, fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* Conversations List */}
        {loading && conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: C.textMid }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.bright, margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: 14 }}>Loading conversations...</div>
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>??</div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: C.text, margin: '0 0 6px' }}>No conversations yet</h3>
            <p style={{ fontSize: 12, color: C.textMid, margin: 0 }}>Start a conversation by posting waste or requesting a collection</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {conversations.map((conversation) => {
              const unreadCount = unreadCounts[conversation.id] || 0;
              const otherParticipant = conversation.participant1?.id === user.id ? conversation.participant2 : conversation.participant1;
              const isHovered = hoveredConv === conversation.id;
              const isActive = selectedConversationId === conversation.id;

              return (
                <div
                  key={conversation.id}
                  onClick={() => handleOpenChat(conversation.id, otherParticipant?.businessName || otherParticipant?.name)}
                  onMouseEnter={() => setHoveredConv(conversation.id)}
                  onMouseLeave={() => setHoveredConv(null)}
                  style={{
                    background: isActive ? 'rgba(100,255,67,0.12)' : C.surface,
                    border: `1px solid ${isActive ? C.bright : isHovered ? C.borderHover : C.border}`,
                    borderRadius: 14,
                    padding: 18,
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                    transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                    boxShadow: isHovered || isActive ? '0 8px 24px rgba(100,255,67,0.12)' : '0 0 0 transparent',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: C.bright, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {otherParticipant?.businessName || otherParticipant?.companyName || otherParticipant?.email || 'Unknown'}
                      {unreadCount > 0 && (
                        <span style={{ fontSize: 10, background: C.bright, color: '#0a2e03', padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>
                          {unreadCount}
                        </span>
                      )}
                    </h3>
                    {conversation.wastePost && (
                      <p style={{ fontSize: 12, color: C.bright, margin: '0 0 4px', fontWeight: 600 }}>
                        ?? {conversation.wastePost.title}
                      </p>
                    )}
                    {conversation.lastMessage && (
                      <p style={{ fontSize: 12, color: C.textMid, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {conversation.lastMessage}
                      </p>
                    )}
                  </div>
                  <div style={{ color: C.bright, flexShrink: 0, transition: 'transform 0.2s', transform: isHovered ? 'translateX(4px)' : 'translateX(0)' }}>
                    ?
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Floating Chat Widget */}
      {selectedConversationId && !isMinimized && selectedConv && (
        <FloatingChatWidget
          selectedConv={selectedConv}
          user={user}
          onClose={handleCloseChat}
          onMinimize={handleMinimizeChat}
          isMinimized={isMinimized}
          token={token}
        />
      )}

      {/* Minimized Chat Button */}
      {selectedConversationId && isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            padding: '12px 16px',
            background: C.bright,
            color: C.darker,
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 12,
            zIndex: 999,
            boxShadow: '0 4px 16px rgba(100,255,67,0.4)',
            transition: 'all 0.2s',
            animation: 'slideInUp 0.3s ease',
          }}
          onMouseEnter={e => { e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = '0 8px 24px rgba(100,255,67,0.6)'; }}
          onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 4px 16px rgba(100,255,67,0.4)'; }}
        >
          ?? {minimizedLabel}
        </button>
      )}
    </div>
  );
};

export default MessagesPage;
