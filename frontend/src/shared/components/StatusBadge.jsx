/**
 * StatusBadge Component
 * Displays status with color coding
 * Used for collection requests, waste posts, approvals, etc
 */

import React from 'react';

const getStatusColor = (status) => {
  const statusMap = {
    approved: { bg: 'rgba(134,239,172,0.2)', color: '#86efac', icon: '✓' },
    rejected: { bg: 'rgba(255,107,107,0.2)', color: '#ff6b6b', icon: '✕' },
    completed: { bg: 'rgba(100,255,67,0.2)', color: '#64ff43', icon: '✓' },
    pending: { bg: 'rgba(125,211,252,0.2)', color: '#7dd3fc', icon: '◆' },
    active: { bg: 'rgba(100,255,67,0.2)', color: '#64ff43', icon: '●' },
    inactive: { bg: 'rgba(230,230,230,0.2)', color: '#a0a0a0', icon: '○' },
    'in-progress': { bg: 'rgba(251,191,36,0.2)', color: '#fbbf24', icon: '⟳' },
    cancelled: { bg: 'rgba(148,163,184,0.2)', color: '#94a3b8', icon: '✕' },
  };

  return statusMap[status?.toLowerCase()] || statusMap.pending;
};

const StatusBadge = ({ status, size = 'medium', showIcon = true }) => {
  const statusColor = getStatusColor(status);

  const sizeMap = {
    small: { padding: '2px 10px', fontSize: 10, fontWeight: 700, borderRadius: 4 },
    medium: { padding: '4px 12px', fontSize: 11, fontWeight: 700, borderRadius: 6 },
    large: { padding: '6px 16px', fontSize: 12, fontWeight: 700, borderRadius: 8 },
  };

  const sizeStyle = sizeMap[size] || sizeMap.medium;

  return (
    <span
      style={{
        ...sizeStyle,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: statusColor.bg,
        color: statusColor.color,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
      }}
      title={status}
    >
      {showIcon && <span>{statusColor.icon}</span>}
      {status}
    </span>
  );
};

export default StatusBadge;
