import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import messageService from '../../../services/messageService';

const C = {
  bright: '#64ff43',
  darker: '#0a2e03',
  surface: '#0d3806',
  border: 'rgba(100,255,67,0.18)',
  borderHover: 'rgba(100,255,67,0.45)',
  text: '#e6ffe0',
  textMid: 'rgba(230,255,224,0.55)',
  textLow: 'rgba(230,255,224,0.3)',
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [scrollY, setScrollY] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const sc = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', sc);
    return () => window.removeEventListener('scroll', sc);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [filter, sortBy, page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && hasMore && !loadingMore && page > 1) {
          setLoadingMore(true);
          setTimeout(() => setLoadingMore(false), 300);
        }
      },
      { threshold: 0.1 }
    );
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await messageService.getNotifications({
        filter: filter === 'all' ? undefined : filter,
        page,
        limit: 20,
        sortBy,
      });
      const newNotifications = response.notifications || [];
      if (page === 1) {
        setNotifications(newNotifications);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
      }
      setHasMore(newNotifications.length === 20);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notifId) => {
    try {
      await messageService.markNotificationAsRead(notifId);
      setNotifications(prev =>
        prev.map(n => n._id === notifId ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await messageService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (notifId) => {
    try {
      await messageService.deleteNotification(notifId);
      setNotifications(prev => prev.filter(n => n._id !== notifId));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.darker, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: 'hidden', color: C.text }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 1 }} />

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: scrollY > 60 ? 'rgba(10,46,3,0.93)' : 'transparent', backdropFilter: scrollY > 60 ? 'blur(28px)' : 'none', borderBottom: scrollY > 60 ? `1px solid ${C.border}` : '1px solid transparent', transition: 'all 0.35s ease' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate(-1)}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(100,255,67,0.12)', border: '1px solid rgba(100,255,67,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm0 2a6 6 0 0 1 5.917 5H10V4zm-1 0v5H3.083A6 6 0 0 1 9 4zM3.444 11H9v5.472A6.002 6.002 0 0 1 3.444 11zm6.556 5.472V11h5.556A6.002 6.002 0 0 1 10 16.472z" fill={C.bright}/>
              </svg>
            </div>
            <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.5px', color: C.text }}>ScraPair</span>
          </div>
          <button onClick={() => navigate(-1)} style={{ padding: '10px 24px', fontSize: 14, fontWeight: 700, borderRadius: 100, border: 'none', background: C.bright, color: '#082800', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 16px rgba(100,255,67,0.35)' }} onMouseEnter={e => { e.target.style.boxShadow = '0 0 28px rgba(100,255,67,0.6)'; e.target.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => { e.target.style.boxShadow = '0 0 16px rgba(100,255,67,0.35)'; e.target.style.transform = 'translateY(0)'; }}>← Back</button>
        </div>
      </nav>

      <section style={{ maxWidth: 900, margin: '0 auto', padding: '60px 40px', position: 'relative', zIndex: 2 }}>
        <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 12, color: C.bright, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>Activity</div>
            <h1 style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.08, letterSpacing: '-2px', margin: '0 0 12px', color: C.text }}>Notifications</h1>
            <p style={{ fontSize: 14, color: C.textMid, margin: 0 }}>{notifications.filter(n => !n.read).length} unread</p>
          </div>
          {notifications.some(n => !n.read) && (
            <button onClick={markAllAsRead} style={{ padding: '10px 20px', fontSize: 13, fontWeight: 700, background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 100, color: C.bright, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.target.style.borderColor = C.borderHover; e.target.style.background = 'rgba(100,255,67,0.08)'; }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.background = 'transparent'; }}>Mark all as read</button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          {['all', 'message', 'post', 'collection'].map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }} style={{ padding: '10px 20px', fontSize: 13, fontWeight: 700, background: filter === f ? `linear-gradient(135deg, ${C.bright}, #4de029)` : 'transparent', border: filter === f ? 'none' : `1px solid ${C.border}`, borderRadius: 100, color: filter === f ? '#062400' : C.bright, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { if (filter !== f) { e.target.style.borderColor = C.borderHover; e.target.style.background = 'rgba(100,255,67,0.08)'; } }} onMouseLeave={e => { if (filter !== f) { e.target.style.borderColor = C.border; e.target.style.background = 'transparent'; } }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}

          <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }} style={{ padding: '9px 16px', fontSize: 13, fontWeight: 700, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 100, color: C.text, cursor: 'pointer' }}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: C.textMid }}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: C.surface, borderRadius: 24, border: `1px solid ${C.border}`, color: C.textMid }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ margin: '0 auto 20px', opacity: 0.5 }}>
              <circle cx="32" cy="32" r="30" stroke={C.bright} strokeWidth="2" opacity="0.2"/>
              <path d="M32 22v20M22 32h20" stroke={C.bright} strokeWidth="2" opacity="0.2" strokeLinecap="round"/>
            </svg>
            <p style={{ fontSize: 16, color: C.textMid }}>No notifications yet</p>
            <small style={{ color: C.textLow }}>You're all caught up!</small>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => !notif.read && markAsRead(notif._id)}
                style={{
                  background: notif.read ? C.surface : 'rgba(100,255,67,0.08)',
                  border: notif.read ? `1px solid ${C.border}` : `1px solid rgba(100,255,67,0.35)`,
                  borderRadius: 20,
                  padding: 24,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 20,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = notif.read ? 'rgba(100,255,67,0.06)' : 'rgba(100,255,67,0.12)';
                  e.currentTarget.style.borderColor = notif.read ? C.borderHover : 'rgba(100,255,67,0.45)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = notif.read ? C.surface : 'rgba(100,255,67,0.08)';
                  e.currentTarget.style.borderColor = notif.read ? C.border : 'rgba(100,255,67,0.35)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: 0 }}>{notif.title || 'Notification'}</h3>
                    {!notif.read && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.bright, boxShadow: `0 0 8px ${C.bright}` }} />
                    )}
                  </div>
                  <p style={{ fontSize: 14, color: C.textMid, margin: '0 0 10px' }}>{notif.message}</p>
                  <small style={{ color: C.textLow, fontSize: 12 }}>
                    {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : 'Recently'}
                  </small>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif._id);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: C.textLow,
                    cursor: 'pointer',
                    fontSize: 20,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.target.style.color = '#ff6b6b'; e.target.style.transform = 'scale(1.2)'; }}
                  onMouseLeave={e => { e.target.style.color = C.textLow; e.target.style.transform = 'scale(1)'; }}
                >
                  ×
                </button>
              </div>
            ))}

            {hasMore && (
              <div
                style={{
                  padding: 40,
                  textAlign: 'center',
                  color: C.textMid,
                }}
                ref={el => {
                  if (el && page === 1) {
                    const observer = new IntersectionObserver(entries => {
                      if (entries[0]?.isIntersecting && hasMore && !loadingMore) {
                        setPage(p => p + 1);
                      }
                    });
                    observer.observe(el);
                  }
                }}
              >
                {loadingMore ? 'Loading more...' : 'Scroll to load more'}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default NotificationsPage;
