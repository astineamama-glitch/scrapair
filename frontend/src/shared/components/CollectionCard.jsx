/**
 * CollectionCard Component
 * Displays a collection request/history item
 * Shows status, dates, materials, business/recycler info
 */

import React, { useState } from 'react';
import { COLORS } from '../../shared/styles/colors';

const CollectionCard = ({ 
  collection,
  onApprove,
  onReject,
  onCancel,
  onView,
  showActions = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!collection) return null;

  // Status badge styling
  const getStatusStyle = () => {
    const baseStyle = {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    };

    const status = collection.status?.toLowerCase() || 'pending';

    switch (status) {
      case 'approved':
        return { ...baseStyle, background: 'rgba(134,239,172,0.2)', color: '#86efac' };
      case 'rejected':
        return { ...baseStyle, background: 'rgba(255,107,107,0.2)', color: '#ff6b6b' };
      case 'completed':
        return { ...baseStyle, background: 'rgba(100,255,67,0.2)', color: COLORS.bright };
      case 'pending':
      default:
        return { ...baseStyle, background: 'rgba(125,211,252,0.2)', color: '#7dd3fc' };
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onView}
      style={{
        background: COLORS.surface,
        border: `1px solid ${isHovered ? COLORS.borderHover : COLORS.border}`,
        borderRadius: 18,
        padding: 24,
        cursor: onView ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? `0 8px 24px ${COLORS.glow}` : 'none',
      }}
    >
      {/* Header with Status */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        marginBottom: 16,
      }}>
        <div>
          <h3 style={{
            fontSize: 18,
            fontWeight: 700,
            color: COLORS.text,
            margin: 0,
          }}>
            {collection.businessName || collection.recyclerName || 'Collection'}
          </h3>
          <p style={{
            fontSize: 13,
            color: COLORS.textMid,
            margin: '4px 0 0',
          }}>
            ID: {collection.id?.slice(0, 8)}...
          </p>
        </div>
        <div style={getStatusStyle()}>
          {collection.status || 'Pending'}
        </div>
      </div>

      {/* Details Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 16,
        marginBottom: 20,
        paddingBottom: 20,
        borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <div>
          <p style={{
            fontSize: 11,
            fontWeight: 700,
            color: COLORS.textMid,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: '0 0 6px',
          }}>
            Materials
          </p>
          <p style={{
            fontSize: 14,
            fontWeight: 600,
            color: COLORS.text,
            margin: 0,
          }}>
            {collection.materialCount || collection.quantity || '—'}
          </p>
        </div>

        <div>
          <p style={{
            fontSize: 11,
            fontWeight: 700,
            color: COLORS.textMid,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: '0 0 6px',
          }}>
            Requested
          </p>
          <p style={{
            fontSize: 14,
            fontWeight: 600,
            color: COLORS.text,
            margin: 0,
          }}>
            {collection.requestDate ? new Date(collection.requestDate).toLocaleDateString() : '—'}
          </p>
        </div>

        <div>
          <p style={{
            fontSize: 11,
            fontWeight: 700,
            color: COLORS.textMid,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: '0 0 6px',
          }}>
            Scheduled
          </p>
          <p style={{
            fontSize: 14,
            fontWeight: 600,
            color: COLORS.text,
            margin: 0,
          }}>
            {collection.scheduledDate ? new Date(collection.scheduledDate).toLocaleDateString() : '—'}
          </p>
        </div>

        <div>
          <p style={{
            fontSize: 11,
            fontWeight: 700,
            color: COLORS.textMid,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: '0 0 6px',
          }}>
            Location
          </p>
          <p style={{
            fontSize: 14,
            fontWeight: 600,
            color: COLORS.text,
            margin: 0,
          }}>
            {collection.city || 'N/A'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          {onView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(collection);
              }}
              style={{
                padding: '8px 16px',
                background: `rgba(100,255,67,0.1)`,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                color: COLORS.bright,
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = `rgba(100,255,67,0.2)`;
                e.target.style.borderColor = COLORS.bright;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = `rgba(100,255,67,0.1)`;
                e.target.style.borderColor = COLORS.border;
              }}
            >
              View Details
            </button>
          )}

          {onApprove && collection.status === 'pending' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onApprove(collection);
              }}
              style={{
                padding: '8px 16px',
                background: 'rgba(134,239,172,0.2)',
                border: '1px solid rgba(134,239,172,0.4)',
                borderRadius: 8,
                color: '#86efac',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(134,239,172,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(134,239,172,0.2)';
              }}
            >
              ✓ Approve
            </button>
          )}

          {onReject && collection.status === 'pending' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReject(collection);
              }}
              style={{
                padding: '8px 16px',
                background: 'rgba(255,107,107,0.2)',
                border: '1px solid rgba(255,107,107,0.4)',
                borderRadius: 8,
                color: '#ff6b6b',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,107,107,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,107,107,0.2)';
              }}
            >
              ✕ Reject
            </button>
          )}

          {onCancel && ['pending', 'approved'].includes(collection.status) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel(collection);
              }}
              style={{
                marginLeft: 'auto',
                padding: '8px 16px',
                background: 'transparent',
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                color: COLORS.textMid,
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#ff6b6b';
                e.target.style.borderColor = '#ff6b6b';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = COLORS.textMid;
                e.target.style.borderColor = COLORS.border;
              }}
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CollectionCard;
