/**
 * FilterPanel Component
 * Reusable filter section for marketplace/collections
 * Handles waste type, city, and date range filters
 */

import React from 'react';
import { COLORS } from '../../shared/styles/colors';

const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  categories = [],
  showDateRange = false,
  onApply 
}) => {
  return (
    <div style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 28,
      padding: 40,
      marginBottom: 60,
    }}>
      <h2 style={{
        fontSize: 28,
        fontWeight: 900,
        letterSpacing: '-0.6px',
        color: COLORS.text,
        margin: '0 0 24px',
      }}>
        Filter Results
      </h2>

      <div style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      }}>
        {/* Search Input */}
        <div>
          <label style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 700,
            color: COLORS.textMid,
            marginBottom: 10,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            Search
          </label>
          <input
            type="text"
            name="searchQuery"
            placeholder="Search by title or description..."
            value={filters.searchQuery || ''}
            onChange={onFilterChange}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              background: 'rgba(100,255,67,0.03)',
              color: COLORS.text,
              fontSize: 14,
              boxSizing: 'border-box',
              transition: 'all 0.2s',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = COLORS.borderHover;
              e.target.style.boxShadow = '0 0 0 3px rgba(100,255,67,0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = COLORS.border;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Waste Type Filter */}
        {categories.length > 0 && (
          <div>
            <label style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 700,
              color: COLORS.textMid,
              marginBottom: 10,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              Waste Type
            </label>
            <select
              name="wasteType"
              value={filters.wasteType || ''}
              onChange={onFilterChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `1px solid ${COLORS.border}`,
                borderRadius: 12,
                background: 'rgba(100,255,67,0.03)',
                color: COLORS.text,
                fontSize: 14,
                boxSizing: 'border-box',
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none',
              }}
            >
              <option value="">All Waste Types</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name?.toLowerCase()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* City Filter */}
        <div>
          <label style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 700,
            color: COLORS.textMid,
            marginBottom: 10,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            City
          </label>
          <input
            type="text"
            name="city"
            placeholder="Filter by city..."
            value={filters.city || ''}
            onChange={onFilterChange}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              background: 'rgba(100,255,67,0.03)',
              color: COLORS.text,
              fontSize: 14,
              boxSizing: 'border-box',
              transition: 'all 0.2s',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = COLORS.borderHover;
              e.target.style.boxShadow = '0 0 0 3px rgba(100,255,67,0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = COLORS.border;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Date Range Filter (Optional) */}
        {showDateRange && (
          <>
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 700,
                color: COLORS.textMid,
                marginBottom: 10,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                From Date
              </label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom || ''}
                onChange={onFilterChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 12,
                  background: 'rgba(100,255,67,0.03)',
                  color: COLORS.text,
                  fontSize: 14,
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 700,
                color: COLORS.textMid,
                marginBottom: 10,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                To Date
              </label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo || ''}
                onChange={onFilterChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 12,
                  background: 'rgba(100,255,67,0.03)',
                  color: COLORS.text,
                  fontSize: 14,
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Apply Button */}
      {onApply && (
        <button
          onClick={onApply}
          style={{
            marginTop: 24,
            padding: '12px 32px',
            background: `linear-gradient(135deg, ${COLORS.bright}, #4de029)`,
            color: '#062400',
            border: 'none',
            borderRadius: 100,
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px) scale(1.02)';
            e.target.style.boxShadow = `0 0 28px ${COLORS.glow}`;
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Apply Filters ✓
        </button>
      )}
    </div>
  );
};

export default FilterPanel;
