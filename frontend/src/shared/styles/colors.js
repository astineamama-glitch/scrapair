/**
 * Centralized Color System
 * Single source of truth for all color tokens across the application
 * Used by all components, pages, and UI modules
 */

export const COLORS = {
  // Primary colors
  bright: '#64ff43',        // Electric lime-green (CTAs, glows, accents)
  deep: '#124d05',          // Forest dark (surfaces, cards)
  darker: '#0a2e03',        // Near-black base
  surface: '#0d3806',       // Card backgrounds

  // Text colors
  text: '#e6ffe0',          // Off-white tinted green (primary text)
  textMid: 'rgba(230,255,224,0.55)',    // Medium emphasis text
  textLow: 'rgba(230,255,224,0.3)',     // Low emphasis text

  // Border & interactive
  border: 'rgba(100,255,67,0.18)',      // Default borders
  borderHover: 'rgba(100,255,67,0.45)', // Hovered borders
  borderActive: 'rgba(100,255,67,0.65)',// Active/focused borders

  // Glow effects
  glow: 'rgba(100,255,67,0.22)',
  glowStrong: 'rgba(100,255,67,0.45)',
  glowMax: 'rgba(100,255,67,0.65)',

  // Status colors
  error: '#ff6b6b',
  errorBg: 'rgba(255,107,107,0.1)',
  errorBorder: 'rgba(255,107,107,0.3)',

  success: '#4ade80',
  successBg: 'rgba(74,222,128,0.1)',
  successBorder: 'rgba(74,222,128,0.3)',

  warning: '#fbbf24',
  warningBg: 'rgba(251,191,36,0.1)',
  warningBorder: 'rgba(251,191,36,0.3)',

  info: '#60a5fa',
  infoBg: 'rgba(96,165,250,0.1)',
  infoBorder: 'rgba(96,165,250,0.3)',
};

export const FONTS = {
  primary: "'DM Sans','Helvetica Neue','Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol',sans-serif",
  mono: "'Fira Code', monospace",
};

export const TRANSITIONS = {
  fast: '0.15s ease',
  normal: '0.2s ease',
  slow: '0.35s ease',
  verySlow: '0.75s cubic-bezier(0.16,1,0.3,1)',
};
