/**
 * WastePostCard Component (Business)
 * Display a business' own waste post with edit/delete/deactivate actions
 * Used in BusinessPostsPage
 */

import React, { useState } from 'react';
import { COLORS } from '../../../shared/styles/colors';
import StatusBadge from '../../../shared/components/StatusBadge';

const WastePostCard = ({ 
  post,
  onEdit,
  onDelete,
  onToggleStatus,
  showActions = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!post) return null;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this post?')) {
      onDelete(post.id);
    }
  };

  const handleToggleStatus = (e) => {
    e.stopPropagation();
    onToggleStatus(post.id, post.status === 'active' ? 'inactive' : 'active');
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onEdit && onEdit(post)}
      style={{
        background: COLORS.surface,
        border: `1px solid ${isHovered ? COLORS.borderHover : COLORS.border}`,
        borderRadius: 18,
        overflow: 'hidden',
        cursor: onEdit ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image */}
      {post.imageUrl && (
        <div
          style={{
            width: '100%',
            height: 180,
            background: `linear-gradient(135deg, ${COLORS.deep} 0%, ${COLORS.darker} 100%)`,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <img
            src={post.imageUrl}
            alt={post.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        </div>
      )}

      {/* Content */}
      <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header with Status */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            marginBottom: 12,
            gap: 12,
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: COLORS.text,
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {post.title}
          </h3>
          <StatusBadge status={post.status} size="small" />
        </div>

        {/* Waste Type */}
        <div
          style={{
            display: 'inline-block',
            padding: '4px 10px',
            background: `rgba(100,255,67,0.1)`,
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700,
            color: COLORS.bright,
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            width: 'fit-content',
          }}
        >
          {post.wasteType}
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
          {post.description}
        </p>

        {/* Details Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            fontSize: 12,
            color: COLORS.textMid,
            marginBottom: 16,
            paddingTop: 12,
            borderTop: `1px solid ${COLORS.border}`,
          }}
        >
          <div>
            <span style={{ color: COLORS.textLow }}>📦</span> {post.quantity} {post.unit}
          </div>
          <div>
            <span style={{ color: COLORS.textLow }}>📍</span> {post.city || 'N/A'}
          </div>
          <div>
            <span style={{ color: COLORS.textLow }}>📅</span>{' '}
            {new Date(post.createdAt).toLocaleDateString()}
          </div>
          <div>
            <span style={{ color: COLORS.textLow }}>👀</span> {post.views || 0} views
          </div>
        </div>

        {/* Collection Count */}
        {post.requestCount > 0 && (
          <div
            style={{
              padding: '8px 12px',
              background: 'rgba(125,211,252,0.1)',
              borderRadius: 8,
              fontSize: 12,
              color: '#7dd3fc',
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            💬 {post.requestCount} collection request{post.requestCount !== 1 ? 's' : ''}
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 8,
              marginTop: 'auto',
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit && onEdit(post);
              }}
              style={{
                padding: '8px 12px',
                background: `rgba(100,255,67,0.1)`,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                color: COLORS.bright,
                fontWeight: 700,
                fontSize: 11,
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
              ✎ Edit
            </button>

            <button
              onClick={handleToggleStatus}
              style={{
                padding: '8px 12px',
                background:
                  post.status === 'active'
                    ? 'rgba(125,211,252,0.2)'
                    : 'rgba(134,239,172,0.2)',
                border: '1px solid transparent',
                borderRadius: 8,
                color: post.status === 'active' ? '#7dd3fc' : '#86efac',
                fontWeight: 700,
                fontSize: 11,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '1';
              }}
            >
              {post.status === 'active' ? '○ Deactivate' : '● Activate'}
            </button>

            <button
              onClick={handleDelete}
              style={{
                padding: '8px 12px',
                background: 'rgba(255,107,107,0.1)',
                border: `1px solid ${COLORS.border}`,
                borderRadius: 8,
                color: '#ff6b6b',
                fontWeight: 700,
                fontSize: 11,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,107,107,0.2)';
                e.target.style.borderColor = '#ff6b6b';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,107,107,0.1)';
                e.target.style.borderColor = COLORS.border;
              }}
            >
              🗑 Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WastePostCard;
