/**
 * BusinessMetricCard Component
 * Display KPI or statistic metric with trend and icon
 * Used in BusinessAnalyticsPage and dashboards
 */

import React from 'react';
import { COLORS, TRANSITIONS } from '../../../shared/styles/colors';

const BusinessMetricCard = ({ 
  icon,
  title,
  value,
  unit = '',
  trend = null, // { direction: 'up' | 'down', percentage: number }
  color = COLORS.bright,
  description = '',
  onClick,
}) => {
  const getTrendColor = () => {
    if (!trend) return null;
    return trend.direction === 'up' ? '#86efac' : '#ff6b6b';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend.direction === 'up' ? '↑' : '↓';
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 18,
        padding: 24,
        cursor: onClick ? 'pointer' : 'default',
        transition: `all ${TRANSITIONS.normal}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = COLORS.borderHover;
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = `0 8px 24px ${COLORS.glow}`;
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
      {/* Background gradient accent */}
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          opacity: 0.08,
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      {/* Header with icon and title */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: COLORS.textMid,
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {title}
          </p>
          {description && (
            <p
              style={{
                fontSize: 11,
                color: COLORS.textLow,
                margin: '4px 0 0',
              }}
            >
              {description}
            </p>
          )}
        </div>
        <div
          style={{
            fontSize: 28,
            lineHeight: 1,
          }}
        >
          {icon}
        </div>
      </div>

      {/* Metric Value */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontSize: 40,
            fontWeight: 900,
            letterSpacing: '-1px',
            color: COLORS.text,
            lineHeight: 1,
          }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {unit && (
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.textMid,
              marginBottom: 4,
            }}
          >
            {unit}
          </div>
        )}
      </div>

      {/* Trend */}
      {trend && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: getTrendColor(),
            fontWeight: 700,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <span>{getTrendIcon()}</span>
          <span>{trend.percentage}% compared to last period</span>
        </div>
      )}
    </div>
  );
};

export default BusinessMetricCard;
