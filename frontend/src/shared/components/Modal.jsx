/**
 * Modal Component
 * Reusable modal/dialog for forms, confirmations, and content display
 */

import React, { useState } from 'react';
import { COLORS, TRANSITIONS } from '../../shared/styles/colors';

const Modal = ({ 
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  actionButtons = [],
  size = 'medium',
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  const sizeMap = {
    small: { maxWidth: '400px', padding: 32 },
    medium: { maxWidth: '600px', padding: 40 },
    large: { maxWidth: '800px', padding: 40 },
  };

  const sizeStyle = sizeMap[size] || sizeMap.medium;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 999,
          animation: `fadeIn 0.2s ${TRANSITIONS.normal}`,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          ...sizeStyle,
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 24,
          boxShadow: `0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px ${COLORS.glow}`,
          animation: `slideUp 0.3s ${TRANSITIONS.normal}`,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            gap: 16,
            marginBottom: title || subtitle ? 24 : 0,
            paddingBottom: title || subtitle ? 24 : 0,
            borderBottom: title || subtitle ? `1px solid ${COLORS.border}` : 'none',
          }}
        >
          <div>
            {title && (
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  letterSpacing: '-0.5px',
                  color: COLORS.text,
                  margin: 0,
                }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: 14,
                  color: COLORS.textMid,
                  margin: title ? '8px 0 0' : 0,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {showCloseButton && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 24,
                color: COLORS.textMid,
                cursor: 'pointer',
                padding: '4px 8px',
                transition: `all ${TRANSITIONS.fast}`,
              }}
              onMouseEnter={(e) => {
                e.target.style.color = COLORS.bright;
              }}
              onMouseLeave={(e) => {
                e.target.style.color = COLORS.textMid;
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ marginBottom: actionButtons.length > 0 ? 32 : 0 }}>
          {children}
        </div>

        {/* Action Buttons */}
        {actionButtons.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end',
              paddingTop: 24,
              borderTop: `1px solid ${COLORS.border}`,
            }}
          >
            {actionButtons.map((btn, i) => (
              <button
                key={i}
                onClick={btn.onClick}
                disabled={btn.disabled}
                style={{
                  padding: '10px 24px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: btn.disabled ? 'not-allowed' : 'pointer',
                  transition: `all ${TRANSITIONS.normal}`,
                  opacity: btn.disabled ? 0.5 : 1,
                  ...(btn.variant === 'primary'
                    ? {
                        background: `linear-gradient(135deg, ${COLORS.bright}, #4de029)`,
                        color: '#062400',
                        border: 'none',
                      }
                    : btn.variant === 'danger'
                    ? {
                        background: 'rgba(255,107,107,0.2)',
                        color: '#ff6b6b',
                        border: '1px solid rgba(255,107,107,0.4)',
                      }
                    : {
                        background: 'transparent',
                        color: COLORS.textMid,
                        border: `1px solid ${COLORS.border}`,
                      }),
                }}
                onMouseEnter={(e) => {
                  if (!btn.disabled) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = `0 8px 20px ${COLORS.glow}`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!btn.disabled) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideUp {
            from {
              transform: translate(-50%, -45%);
              opacity: 0;
            }
            to {
              transform: translate(-50%, -50%);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default Modal;
