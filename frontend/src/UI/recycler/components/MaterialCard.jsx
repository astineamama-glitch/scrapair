/**
 * MaterialCard Component
 * Displays a waste post/material in the recycler marketplace
 * Used in RecyclerDashboard and MarketplacePage
 */

import React, { useState } from 'react';
import { COLORS, TRANSITIONS } from '../../../shared/styles/colors';
import { cardBase } from '../../../shared/styles/commonStyles';

const MaterialCard = ({ material, onRequest, onView }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleRequest = (e) => {
    e.stopPropagation();
    if (onRequest) onRequest(material);
  };

  const handleView = () => {
    if (onView) onView(material);
  };

  return (
    <div
      onClick={handleView}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...cardBase,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 220,
        background: isHovered ? COLORS.surface : `rgba(100,255,67,0.01)`,
        borderColor: isHovered ? COLORS.borderHover : COLORS.border,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? `0 8px 32px ${COLORS.glow}` : 'none',
      }}
    >
      {/* Hover overlay */}
      {isHovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 50% 0%, ${COLORS.glow} 0%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Title & Category */}
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              display: 'inline-block',
              padding: '4px 10px',
              background: `rgba(100,255,67,0.1)`,
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              color: COLORS.bright,
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {material.wasteType || 'Material'}
          </div>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: COLORS.text,
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {material.title}
          </h3>
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: 13,
            color: COLORS.textMid,
            margin: '0 0 12px',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {material.description || 'No description provided'}
        </p>

        {/* Location & Quantity */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, fontSize: 12, color: COLORS.textMid }}>
          {material.city && (
            <div>
              <span style={{ color: COLORS.textLow }}>📍</span> {material.city}
            </div>
          )}
          {material.quantity && (
            <div>
              <span style={{ color: COLORS.textLow }}>📦</span> {material.quantity} {material.unit || 'units'}
            </div>
          )}
        </div>

        {/* Business Name */}
        {material.businessName && (
          <div
            style={{
              fontSize: 12,
              color: COLORS.textLow,
              marginBottom: 12,
              paddingTop: 12,
              borderTop: `1px solid ${COLORS.border}`,
            }}
          >
            <div style={{ color: COLORS.textMid, fontWeight: 600 }}>Posted by</div>
            {material.businessName}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleRequest}
          style={{
            width: '100%',
            marginTop: 'auto',
            padding: '10px 16px',
            background: isHovered ? COLORS.bright : `rgba(100,255,67,0.08)`,
            color: isHovered ? '#062400' : COLORS.bright,
            border: `1px solid ${isHovered ? COLORS.bright : COLORS.border}`,
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            transition: `all ${TRANSITIONS.normal}`,
          }}
          onMouseEnter={(e) => {
            e.target.style.background = COLORS.bright;
            e.target.style.color = '#062400';
            e.target.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            if (isHovered) {
              e.target.style.background = COLORS.bright;
              e.target.style.color = '#062400';
            } else {
              e.target.style.background = `rgba(100,255,67,0.08)`;
              e.target.style.color = COLORS.bright;
            }
            e.target.style.transform = 'scale(1)';
          }}
        >
          Request Collection →
        </button>
      </div>
    </div>
  );
};

export default MaterialCard;
