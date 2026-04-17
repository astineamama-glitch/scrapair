/**
 * SearchBar Component
 * Lightweight search input with debouncing support
 * Used in headers, filter sections, etc
 */

import React, { useState } from 'react';
import { COLORS } from '../../shared/styles/colors';

const SearchBar = ({ 
  placeholder = 'Search...',
  value,
  onChange,
  onClear,
  disabled = false,
  icon = '🔍',
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: '' } });
    }
  };

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    }}>
      <span style={{
        position: 'absolute',
        left: 12,
        color: COLORS.textMid,
        fontSize: 16,
        pointerEvents: 'none',
      }}>
        {icon}
      </span>

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          width: '100%',
          padding: '12px 40px 12px 40px',
          paddingLeft: 40,
          paddingRight: value ? 40 : 16,
          border: `1px solid ${isFocused ? COLORS.borderHover : COLORS.border}`,
          borderRadius: 12,
          background: isFocused ? 'rgba(100,255,67,0.05)' : 'rgba(100,255,67,0.02)',
          color: COLORS.text,
          fontSize: 14,
          boxSizing: 'border-box',
          transition: 'all 0.2s',
          outline: 'none',
        }}
      />

      {value && (
        <button
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: 8,
            background: 'none',
            border: 'none',
            color: COLORS.textMid,
            cursor: 'pointer',
            fontSize: 18,
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
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
  );
};

export default SearchBar;
