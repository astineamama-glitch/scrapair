/**
 * Navbar Component
 * Shared navigation bar used across all pages
 * Handles user info, logout, and scroll effects
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COLORS, TRANSITIONS } from '../styles/colors';
import { navbarStyle, navContainer } from '../styles/commonStyles';

const Navbar = ({ user, onLogout, scrollY = 0, role = 'business' }) => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const handleLogoClick = () => {
    navigate(role === 'business' ? '/business/dashboard' : '/recycler/dashboard');
  };

  const handleProfileClick = () => {
    navigate('/edit-profile');
    setShowUserMenu(false);
  };

  const handleDashboardClick = () => {
    navigate(role === 'business' ? '/business/dashboard' : '/recycler/dashboard');
    setShowUserMenu(false);
  };

  return (
    <nav style={navbarStyle(scrollY)}>
      <div style={navContainer}>
        {/* Logo/Brand */}
        <div
          onClick={handleLogoClick}
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: COLORS.bright,
            cursor: 'pointer',
            transition: `color ${TRANSITIONS.normal}`,
          }}
          onMouseEnter={(e) => (e.target.style.color = COLORS.glowStrong)}
          onMouseLeave={(e) => (e.target.style.color = COLORS.bright)}
        >
          ScraPair {role === 'business' ? '◈' : '◎'}
        </div>

        {/* User Info & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {user && (
            <>
              {/* User Menu Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 14px',
                    background: 'transparent',
                    color: COLORS.textMid,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: `all ${TRANSITIONS.normal}`,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = COLORS.bright;
                    e.target.style.borderColor = COLORS.borderHover;
                    e.target.style.background = `rgba(100,255,67,0.08)`;
                  }}
                  onMouseLeave={(e) => {
                    if (!showUserMenu) {
                      e.target.style.color = COLORS.textMid;
                      e.target.style.borderColor = COLORS.border;
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${COLORS.bright}, ${COLORS.glowStrong})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      color: COLORS.darker,
                    }}
                  >
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span>{user.email?.split('@')[0]}</span>
                  <span style={{ fontSize: 10, marginLeft: 4 }}>▼</span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: 8,
                      background: COLORS.darker,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 8,
                      minWidth: 220,
                      boxShadow: `0 8px 24px rgba(0,0,0,0.4)`,
                      zIndex: 1000,
                      overflow: 'hidden',
                    }}
                  >
                    {/* User Info Header */}
                    <div
                      style={{
                        padding: '12px 16px',
                        borderBottom: `1px solid ${COLORS.border}`,
                        fontSize: 12,
                        color: COLORS.textMid,
                      }}
                    >
                      <div style={{ color: COLORS.text, fontWeight: 600, marginBottom: 4 }}>
                        {user.email}
                      </div>
                      <div style={{ fontSize: 11 }}>
                        {role === 'business' ? 'Business Account' : 'Recycler Account'}
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div>
                      <button
                        onClick={handleDashboardClick}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          background: 'transparent',
                          color: COLORS.text,
                          border: 'none',
                          textAlign: 'left',
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: `all ${TRANSITIONS.normal}`,
                          borderBottom: `1px solid ${COLORS.border}`,
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = `rgba(100,255,67,0.1)`;
                          e.target.style.color = COLORS.bright;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = COLORS.text;
                        }}
                      >
                        📊 Dashboard
                      </button>

                      <button
                        onClick={handleProfileClick}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          background: 'transparent',
                          color: COLORS.text,
                          border: 'none',
                          textAlign: 'left',
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: `all ${TRANSITIONS.normal}`,
                          borderBottom: `1px solid ${COLORS.border}`,
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = `rgba(100,255,67,0.1)`;
                          e.target.style.color = COLORS.bright;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = COLORS.text;
                        }}
                      >
                        👤 Edit Profile
                      </button>

                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          background: 'transparent',
                          color: COLORS.textMid,
                          border: 'none',
                          textAlign: 'left',
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: `all ${TRANSITIONS.normal}`,
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = `rgba(255,100,100,0.1)`;
                          e.target.style.color = '#ff6464';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = COLORS.textMid;
                        }}
                      >
                        🚪 Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showUserMenu && (
        <div
          onClick={() => setShowUserMenu(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 999,
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;
