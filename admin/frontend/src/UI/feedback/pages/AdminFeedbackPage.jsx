/**
 * Admin Feedback Page
 * Displays all feedback submitted by users with filtering and statistics
 */

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Pagination
} from '@mui/material';
import { COLORS } from '../../../shared/constants/colors';
import { useFetchFeedback } from '../hooks/useFetchFeedback';
import { useFetchFeedbackStats } from '../hooks/useFetchFeedbackStats';
import FeedbackDetailModal from '../components/FeedbackDetailModal';

const AdminFeedbackPage = () => {
  const { feedback, loading, error, pagination, applyFilters, goToPage } = useFetchFeedback();
  const { stats, loading: statsLoading } = useFetchFeedbackStats();
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);

  // Filter states
  const [ratingFilter, setRatingFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [fromUserTypeFilter, setFromUserTypeFilter] = useState('');
  const [toUserTypeFilter, setToUserTypeFilter] = useState('');

  const handleApplyFilters = () => {
    const filters = {};
    if (ratingFilter) filters.rating = ratingFilter;
    if (typeFilter) filters.type = typeFilter;
    if (fromUserTypeFilter) filters.fromUserType = fromUserTypeFilter;
    if (toUserTypeFilter) filters.toUserType = toUserTypeFilter;
    applyFilters(filters);
  };

  const handleClearFilters = () => {
    setRatingFilter('');
    setTypeFilter('');
    setFromUserTypeFilter('');
    setToUserTypeFilter('');
    applyFilters({});
  };

  const handleViewDetails = (feedback: any) => {
    setSelectedFeedback(feedback);
    setOpenDetailModal(true);
  };

  const renderRatingStars = (rating: number) => {
    return '⭐'.repeat(Math.round(rating)) + (rating % 1 > 0 ? '½' : '');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'positive':
        return { bg: 'rgba(76,175,80,0.12)', color: '#4caf50', text: 'Positive' };
      case 'negative':
        return { bg: 'rgba(244,67,54,0.12)', color: '#f44336', text: 'Negative' };
      case 'neutral':
        return { bg: 'rgba(158,158,158,0.12)', color: '#9e9e9e', text: 'Neutral' };
      default:
        return { bg: 'rgba(158,158,158,0.12)', color: '#9e9e9e', text: type };
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: COLORS.darker, color: COLORS.text }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography sx={{ fontSize: '3rem', fontWeight: 900, color: COLORS.bright, mb: 1 }}>
            📝 Feedback Management
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: COLORS.textMid }}>
            View and manage user feedback from collections
          </Typography>
        </Box>

        {/* Error Display */}
        {error && (
          <Box sx={{
            p: 2,
            background: 'rgba(244,67,54,0.12)',
            border: '1px solid rgba(244,67,54,0.3)',
            borderRadius: '8px',
            mb: 3,
            color: '#f44336'
          }}>
            {error}
          </Box>
        )}

        {/* Statistics Cards */}
        {!statsLoading && stats && (
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {[
              { label: 'Total Feedback', value: stats.totalFeedback, icon: '📊' },
              { label: 'Average Rating', value: `${stats.averageRating?.toFixed(2)}/5.0`, icon: '⭐' },
              {
                label: 'Most Common Rating',
                value: `${Object.keys(stats.ratingDistribution).reduce((a, b) => stats.ratingDistribution[a] > stats.ratingDistribution[b] ? a : b)}⭐`,
                icon: '📈'
              },
              {
                label: 'Most Common Type',
                value: Object.keys(stats.typeBreakdown).reduce((a, b) => stats.typeBreakdown[a] > stats.typeBreakdown[b] ? a : b),
                icon: '🏷️'
              }
            ].map((stat, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Card sx={{
                  background: `linear-gradient(135deg, ${COLORS.surface} 0%, rgba(100,255,67,0.05) 100%)`,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '12px'
                }}>
                  <CardContent>
                    <Box sx={{ fontSize: '2rem', mb: 1 }}>{stat.icon}</Box>
                    <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid, mb: 1 }}>
                      {stat.label}
                    </Typography>
                    <Typography sx={{ fontSize: '1.8rem', fontWeight: 700, color: COLORS.bright }}>
                      {stat.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Filters */}
        <Box sx={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: '12px',
          p: 3,
          mb: 4
        }}>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 600, color: COLORS.bright, mb: 2 }}>
            🔍 Filters
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                select
                size="small"
                label="Rating"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': { color: COLORS.text },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border },
                  '& .MuiInputBase-input::placeholder': { color: COLORS.textMid }
                }}
              >
                <MenuItem value="">All Ratings</MenuItem>
                <MenuItem value="5">⭐⭐⭐⭐⭐ (5 Stars)</MenuItem>
                <MenuItem value="4">⭐⭐⭐⭐ (4 Stars)</MenuItem>
                <MenuItem value="3">⭐⭐⭐ (3 Stars)</MenuItem>
                <MenuItem value="2">⭐⭐ (2 Stars)</MenuItem>
                <MenuItem value="1">⭐ (1 Star)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                select
                size="small"
                label="Type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': { color: COLORS.text },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border }
                }}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="positive">Positive</MenuItem>
                <MenuItem value="negative">Negative</MenuItem>
                <MenuItem value="neutral">Neutral</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                select
                size="small"
                label="From User Type"
                value={fromUserTypeFilter}
                onChange={(e) => setFromUserTypeFilter(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': { color: COLORS.text },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border }
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="recycler">Recycler</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                select
                size="small"
                label="To User Type"
                value={toUserTypeFilter}
                onChange={(e) => setToUserTypeFilter(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': { color: COLORS.text },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border }
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="recycler">Recycler</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4} sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={handleApplyFilters}
                sx={{ background: COLORS.bright, color: COLORS.darker, flex: 1, fontWeight: 600 }}
              >
                Apply
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleClearFilters}
                sx={{ borderColor: COLORS.border, color: COLORS.text, flex: 1 }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Feedback Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress sx={{ color: COLORS.bright }} />
          </Box>
        ) : (
          <>
            <Box sx={{
              backgroundColor: COLORS.surface,
              borderRadius: '12px',
              border: `1px solid ${COLORS.border}`,
              overflow: 'hidden',
              mb: 3
            }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: `rgba(100,255,67,0.08)` }}>
                      <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>ID</TableCell>
                      <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Rating</TableCell>
                      <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>From User</TableCell>
                      <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>To User</TableCell>
                      <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Comment</TableCell>
                      <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Collection ID</TableCell>
                      <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Created</TableCell>
                      <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feedback.length > 0 ? (
                      feedback.map((item: any) => {
                        const typeStyle = getTypeColor(item.type);
                        return (
                          <TableRow key={item.id} sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                            <TableCell sx={{ color: COLORS.text }}>{item.id}</TableCell>
                            <TableCell sx={{ color: COLORS.bright }}>{renderRatingStars(item.rating)}</TableCell>
                            <TableCell sx={{ color: COLORS.text }}>
                              <Box sx={{ fontSize: '0.85rem' }}>
                                {item.fromUser?.email}
                                <Box sx={{ fontSize: '0.75rem', color: COLORS.textMid }}>
                                  ({item.fromUser?.type})
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ color: COLORS.text }}>
                              <Box sx={{ fontSize: '0.85rem' }}>
                                {item.toUser?.email}
                                <Box sx={{ fontSize: '0.75rem', color: COLORS.textMid }}>
                                  ({item.toUser?.type})
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{
                                display: 'inline-block',
                                px: 1.5,
                                py: 0.5,
                                background: typeStyle.bg,
                                color: typeStyle.color,
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                textTransform: 'capitalize'
                              }}>
                                {typeStyle.text}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ color: COLORS.textMid, fontSize: '0.85rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.comment || '(no comment)'}
                            </TableCell>
                            <TableCell sx={{ color: COLORS.text }}>{item.collectionId}</TableCell>
                            <TableCell sx={{ color: COLORS.textMid, fontSize: '0.85rem' }}>
                              {new Date(item.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleViewDetails(item)}
                                sx={{
                                  borderColor: COLORS.bright,
                                  color: COLORS.bright,
                                  fontSize: '0.75rem',
                                  textTransform: 'capitalize',
                                  '&:hover': { background: `rgba(100,255,67,0.1)` }
                                }}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} sx={{ textAlign: 'center', color: COLORS.textMid, py: 4 }}>
                          No feedback found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={pagination.pages}
                  page={pagination.page}
                  onChange={(e, page) => goToPage(page)}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: COLORS.text,
                      borderColor: COLORS.border,
                      '&.Mui-selected': { background: COLORS.bright, color: COLORS.darker }
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>

      {/* Detail Modal */}
      {selectedFeedback && (
        <FeedbackDetailModal
          open={openDetailModal}
          onClose={() => setOpenDetailModal(false)}
          feedback={selectedFeedback}
        />
      )}
    </Box>
  );
};

export default AdminFeedbackPage;
