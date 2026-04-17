/**
 * RecyclerStatsCard Component
 * Display recycler KPIs - collections, ratings, materials processed
 * Used in recycler dashboard and profile
 */

import React from 'react';
import { COLORS, TRANSITIONS } from '../../../shared/styles/colors';

const RecyclerStatsCard = ({ 
  metric,
  value,
  label,
  icon,
  progress = null, // 0-100 for progress bar
  comparison = null, // compared to previous period
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: 20,
        cursor: onClick ? 'pointer' : 'default',
        transition: `all ${TRANSITIONS.normal}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = COLORS.borderHover;
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = `0 8px 20px ${COLORS.glow}`;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = COLORS.border;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: COLORS.textMid,
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {metric}
          </p>
          <p
            style={{
              fontSize: 13,
              color: COLORS.textLow,
              margin: '4px 0 0',
            }}
          >
            {label}
          </p>
        </div>
        <div style={{ fontSize: 24 }}>{icon}</div>
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: 32,
          fontWeight: 900,
          letterSpacing: '-0.5px',
          color: COLORS.text,
          lineHeight: 1,
        }}
      >
        {value}
      </div>

      {/* Comparison */}
      {comparison && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: comparison.trend === 'up' ? '#86efac' : '#ff6b6b',
          }}
        >
          {comparison.trend === 'up' ? '↑' : '↓'} {comparison.percentage}%{' '}
          <span style={{ color: COLORS.textLow }}>vs last period</span>
        </div>
      )}

      {/* Progress Bar */}
      {progress !== null && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              flex: 1,
              height: 6,
              background: `rgba(100,255,67,0.1)`,
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.min(progress, 100)}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${COLORS.bright}, #4de029)`,
                transition: `width ${TRANSITIONS.normal}`,
              }}
            />
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: COLORS.textMid,
              minWidth: 35,
              textAlign: 'right',
            }}
          >
            {progress}%
          </span>
        </div>
      )}
    </div>
  );
};

export default RecyclerStatsCard;
