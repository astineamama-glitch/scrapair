/**
 * ApprovedCollectionCard Component (Recycler)
 * Display an approved/scheduled collection for recycler
 * Shows pickup details, schedule, location, materials
 */

import React, { useState } from 'react';
import RatingDisplay from '../../../components/RatingDisplay';
import { COLORS, TRANSITIONS } from '../../../shared/styles/colors';
import StatusBadge from '../../../shared/components/StatusBadge';

const ApprovedCollectionCard = ({ 
  collection,
  onView,
  onComplete,
  onCancel,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!collection) return null;

  const isUpcoming = collection.scheduledDate && 
    new Date(collection.scheduledDate) > new Date();

  const daysUntilPickup = isUpcoming 
    ? Math.ceil((new Date(collection.scheduledDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

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
        transition: `all ${TRANSITIONS.normal}`,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? `0 12px 32px ${COLORS.glow}` : 'none',
      }}
    >
      {/* Header with Status & Business */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start',
          marginBottom: 16,
          gap: 12,
          paddingBottom: 16,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <RatingDisplay userId={collection.businessId} variant="inline" />
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: COLORS.text,
                margin: 0,
              }}
            >
              {collection.businessName}
            </h3>
          </div>
          <p
            style={{
              fontSize: 12,
              color: COLORS.textMid,
              margin: '4px 0 0',
            }}
          >
            {collection.businessCity || 'Location TBD'}
          </p>
        </div>
        <StatusBadge status={collection.status} size="medium" />
      </div>

      {/* Pickup Info */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
          marginBottom: 16,
          paddingBottom: 16,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: COLORS.textMid,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: 0,
              marginBottom: 6,
            }}
          >
            📅 Scheduled
          </p>
          <p
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.text,
              margin: 0,
            }}
          >
            {new Date(collection.scheduledDate).toLocaleDateString()}
          </p>
          {isUpcoming && daysUntilPickup !== null && (
            <p
              style={{
                fontSize: 11,
                color: daysUntilPickup <= 3 ? '#ff6b6b' : COLORS.bright,
                margin: '4px 0 0',
                fontWeight: 600,
              }}
            >
              {daysUntilPickup === 0
                ? 'Today'
                : daysUntilPickup === 1
                ? 'Tomorrow'
                : `In ${daysUntilPickup} days`}
            </p>
          )}
        </div>

        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: COLORS.textMid,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: 0,
              marginBottom: 6,
            }}
          >
            🕐 Time
          </p>
          <p
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.text,
              margin: 0,
            }}
          >
            {collection.pickupTime || 'To be scheduled'}
          </p>
        </div>

        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: COLORS.textMid,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: 0,
              marginBottom: 6,
            }}
          >
            📦 Materials
          </p>
          <p
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.text,
              margin: 0,
            }}
          >
            {collection.materialCount || 0} items
          </p>
        </div>

        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: COLORS.textMid,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: 0,
              marginBottom: 6,
            }}
          >
            👥 Status
          </p>
          <p
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.bright,
              margin: 0,
            }}
          >
            Approved
          </p>
        </div>
      </div>

      {/* Materials List Preview */}
      {collection.materials && collection.materials.length > 0 && (
        <div
          style={{
            marginBottom: 16,
            paddingBottom: 16,
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: COLORS.textMid,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: '0 0 10px',
            }}
          >
            Materials to Collect
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {collection.materials.slice(0, 3).map((material, i) => (
              <div
                key={i}
                style={{
                  padding: '4px 10px',
                  background: `rgba(100,255,67,0.1)`,
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  color: COLORS.bright,
                }}
              >
                {material.wasteType || material.type}
              </div>
            ))}
            {collection.materials.length > 3 && (
              <div
                style={{
                  padding: '4px 10px',
                  background: `rgba(100,255,67,0.05)`,
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  color: COLORS.textMid,
                }}
              >
                +{collection.materials.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {onView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(collection);
            }}
            style={{
              flex: 1,
              minWidth: 120,
              padding: '10px 16px',
              background: `rgba(100,255,67,0.1)`,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              color: COLORS.bright,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              transition: `all ${TRANSITIONS.fast}`,
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

        {onComplete && collection.status === 'approved' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete(collection);
            }}
            style={{
              flex: 1,
              minWidth: 120,
              padding: '10px 16px',
              background: 'rgba(134,239,172,0.2)',
              border: '1px solid rgba(134,239,172,0.4)',
              borderRadius: 10,
              color: '#86efac',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              transition: `all ${TRANSITIONS.fast}`,
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(134,239,172,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(134,239,172,0.2)';
            }}
          >
            ✓ Mark Complete
          </button>
        )}

        {onCancel && collection.status === 'approved' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Cancel this pickup?')) {
                onCancel(collection);
              }
            }}
            style={{
              flex: 1,
              minWidth: 120,
              padding: '10px 16px',
              background: 'transparent',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              color: COLORS.textMid,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              transition: `all ${TRANSITIONS.fast}`,
            }}
            onMouseEnter={(e) => {
              e.target.color = '#ff6b6b';
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
    </div>
  );
};

export default ApprovedCollectionCard;
