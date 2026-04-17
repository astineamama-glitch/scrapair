/**
 * Common Reusable Styles
 * Style functions used across multiple pages and components
 * These eliminate style duplication and ensure consistency
 */

import { COLORS, TRANSITIONS } from './colors';

export const navbarStyle = (scrollY) => ({
  position: 'sticky',
  top: 0,
  zIndex: 100,
  background: scrollY > 60 ? 'rgba(10,46,3,0.93)' : 'transparent',
  backdropFilter: scrollY > 60 ? 'blur(28px)' : 'none',
  borderBottom: scrollY > 60 ? `1px solid ${COLORS.border}` : '1px solid transparent',
  transition: `all ${TRANSITIONS.normal}`,
});

export const navContainer = {
  maxWidth: 1360,
  margin: '0 auto',
  padding: '18px 40px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export const buttonPrimary = {
  padding: '12px 32px',
  background: COLORS.bright,
  color: '#062400',
  border: 'none',
  borderRadius: 14,
  fontWeight: 700,
  cursor: 'pointer',
  transition: `all ${TRANSITIONS.normal}`,
  fontSize: 14,

  ':hover': {
    boxShadow: `0 0 20px ${COLORS.glowStrong}`,
  },
};

export const buttonSecondary = {
  padding: '10px 24px',
  background: 'transparent',
  color: COLORS.bright,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 12,
  fontWeight: 700,
  cursor: 'pointer',
  transition: `all ${TRANSITIONS.normal}`,
  fontSize: 14,

  ':hover': {
    borderColor: COLORS.borderHover,
    background: `rgba(100,255,67,0.08)`,
  },
};

export const buttonGhost = {
  padding: '8px 16px',
  background: 'transparent',
  color: COLORS.text,
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  transition: `all ${TRANSITIONS.normal}`,
  fontSize: 13,

  ':hover': {
    color: COLORS.bright,
  },
};

export const buttonDanger = {
  padding: '10px 24px',
  background: COLORS.errorBg,
  color: COLORS.error,
  border: `1px solid ${COLORS.errorBorder}`,
  borderRadius: 12,
  fontWeight: 700,
  cursor: 'pointer',
  transition: `all ${TRANSITIONS.normal}`,
  fontSize: 14,

  ':hover': {
    background: `rgba(255,107,107,0.2)`,
    borderColor: COLORS.error,
  },
};

export const cardBase = {
  background: COLORS.surface,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 14,
  padding: 24,
  cursor: 'pointer',
  transition: `all ${TRANSITIONS.normal}`,

  ':hover': {
    borderColor: COLORS.borderHover,
    background: `rgba(100,255,67,0.02)`,
  },
};

export const inputBase = {
  padding: '12px 16px',
  border: `1px solid ${COLORS.border}`,
  borderRadius: 14,
  background: `rgba(100,255,67,0.03)`,
  color: COLORS.text,
  fontSize: 14,
  boxSizing: 'border-box',
  transition: `all ${TRANSITIONS.normal}`,

  ':focus': {
    borderColor: COLORS.borderHover,
    outline: 'none',
    boxShadow: `0 0 0 3px rgba(100,255,67,0.1)`,
  },
};

export const badgeBase = {
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'capitalize',
};

export const badgeSuccess = {
  ...badgeBase,
  background: COLORS.successBg,
  color: COLORS.success,
  border: `1px solid ${COLORS.successBorder}`,
};

export const badgeError = {
  ...badgeBase,
  background: COLORS.errorBg,
  color: COLORS.error,
  border: `1px solid ${COLORS.errorBorder}`,
};

export const badgeWarning = {
  ...badgeBase,
  background: COLORS.warningBg,
  color: COLORS.warning,
  border: `1px solid ${COLORS.warningBorder}`,
};

export const badgeInfo = {
  ...badgeBase,
  background: COLORS.infoBg,
  color: COLORS.info,
  border: `1px solid ${COLORS.infoBorder}`,
};

export const gridContainer = {
  maxWidth: 1360,
  margin: '0 auto',
  padding: '40px',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 24,
};

export const loadingStyle = {
  minHeight: '100vh',
  background: COLORS.darker,
  color: COLORS.text,
  padding: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const errorAlertStyle = {
  background: COLORS.errorBg,
  borderLeft: `4px solid ${COLORS.error}`,
  padding: '12px 16px',
  marginBottom: 20,
  color: COLORS.error,
  borderRadius: 6,
  fontSize: 14,
};

export const successAlertStyle = {
  background: COLORS.successBg,
  borderLeft: `4px solid ${COLORS.success}`,
  padding: '12px 16px',
  marginBottom: 20,
  color: COLORS.success,
  borderRadius: 6,
  fontSize: 14,
};
