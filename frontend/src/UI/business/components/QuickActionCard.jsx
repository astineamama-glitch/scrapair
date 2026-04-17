/**
 * QuickActionCard Component
 * Reusable card for dashboard quick actions
 * Used in BusinessDashboard and RecyclerDashboard
 */

import React, { useState } from 'react';
import { COLORS, TRANSITIONS } from '../../../shared/styles/colors';
import { cardBase } from '../../../shared/styles/commonStyles';

const QuickActionCard = ({ icon, title, desc, label, onClick, hovered, onHover, onHoverEnd }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onHover) onHover();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onHoverEnd) onHoverEnd();
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...cardBase,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 180,
        background: isHovered ? COLORS.surface : `rgba(100,255,67,0.01)`,
        borderColor: isHovered ? COLORS.borderHover : COLORS.border,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? `0 8px 32px ${COLORS.glow}` : 'none',
      }}
    >
      {/* Animated gradient background on hover */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: -40,
          width: 200,
          height: '100%',
          background: `radial-gradient(circle, ${COLORS.glow} 0%, transparent 60%)`,
          opacity: isHovered ? 1 : 0,
          transition: `opacity ${TRANSITIONS.normal}`,
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div
          style={{
            fontSize: 28,
            marginBottom: 12,
            color: isHovered ? COLORS.bright : COLORS.textMid,
            transition: `color ${TRANSITIONS.normal}`,
          }}
        >
          {icon}
        </div>

        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: COLORS.text,
            margin: '0 0 8px',
            transition: `color ${TRANSITIONS.normal}`,
          }}
        >
          {title}
        </h3>

        <p
          style={{
            fontSize: 13,
            color: COLORS.textMid,
            margin: '0 0 auto',
            lineHeight: 1.5,
            transition: `color ${TRANSITIONS.normal}`,
          }}
        >
          {desc}
        </p>

        <div
          style={{
            marginTop: 16,
            fontSize: 12,
            color: isHovered ? COLORS.bright : COLORS.textLow,
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            transition: `color ${TRANSITIONS.normal}`,
          }}
        >
          {label} →
        </div>
      </div>
    </div>
  );
};

export default QuickActionCard;
