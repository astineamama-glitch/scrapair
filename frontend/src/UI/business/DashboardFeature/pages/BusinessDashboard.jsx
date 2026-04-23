import React from 'react';
import { useAuth } from '../../../../shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { COLORS, FONTS } from '../../../../shared/styles/colors';
import { useWindowScroll } from '../../../../shared/hooks/useWindowScroll';
import Navbar from '../../../../shared/components/Navbar';
import QuickActionCard from '../../components/QuickActionCard';

const BusinessDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const scrollY = useWindowScroll();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cardConfig = [
    { icon: '◈', title: 'Post Waste Materials', desc: 'Create a new waste post to list your recyclable materials on the marketplace.', action: '/business/posts/waste-post/create', label: 'Create Post' },
    { icon: '◎', title: 'View My Posts', desc: 'View, edit, or manage your posted waste materials.', action: '/business/posts', label: 'View Posts' },
    { icon: '◉', title: 'Collection Requests', desc: 'Manage collection requests from recyclers.', action: '/collections', label: 'View Requests' },
    { icon: '◐', title: 'Transaction History', desc: 'View all your completed pickups and transactions.', action: '/business/transaction-history', label: 'View History' },
    { icon: '◆', title: 'Messages', desc: 'Communicate with recyclers about your materials.', action: '/messages', label: 'Open Messages' },
    { icon: '★', title: 'Pending Approvals', desc: 'Manage approved recyclers and their pickup windows.', action: '/business/pending-approvals', label: 'View Approvals' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: COLORS.darker, fontFamily: FONTS.primary, overflowX: 'hidden', color: COLORS.text }}>
      {/* Grain overlay */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 1 }} />

      {/* Navbar */}
      <Navbar user={user} onLogout={() => { logout(); navigate('/'); }} scrollY={scrollY} role="business" />

      {/* Main Content */}
      <main style={{ maxWidth: 1360, margin: '0 auto', padding: '80px 40px 60px', position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{ marginBottom: 72 }}>
          <div style={{ fontSize: 12, color: COLORS.bright, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16 }}>Dashboard</div>
          <h1 style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-1.8px', color: COLORS.text, margin: 0, lineHeight: 1.1 }}>
            Manage Your<br />Waste Operations
          </h1>
          <p style={{ fontSize: 16, color: COLORS.textMid, maxWidth: 500, marginTop: 20, lineHeight: 1.7 }}>
            Post materials, track collections, and connect with verified recyclers — all in one place.
          </p>
        </div>

        {/* Grid Cards with refactored component */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {cardConfig.map((card) => (
            <QuickActionCard
              key={card.action}
              {...card}
              onClick={() => navigate(card.action)}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${COLORS.border}`, padding: '48px 40px', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', textAlign: 'center', color: COLORS.textLow, fontSize: 14 }}>
          <p style={{ margin: 0 }}>© 2026 ScraPair. Building a circular economy, one pickup at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default BusinessDashboard;
