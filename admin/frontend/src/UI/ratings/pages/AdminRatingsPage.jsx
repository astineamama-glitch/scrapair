import React from 'react';
import { Box, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Grid, Paper } from '@mui/material';
import { COLORS } from '../../../shared/constants/colors';
import { useFetchRatings } from '../hooks/useFetchRatings';

const AdminRatingsPage = () => {
  const { ratings, loading, error } = useFetchRatings();

  const calculateReviewStats = () => {
    const totalUserReviews = ratings.users.reduce((sum, user) => sum + (user.totalRatings || 0), 0);
    const avgRating = ratings.users.length > 0 
      ? (ratings.users.reduce((sum, user) => sum + (user.averageRating || 0), 0) / ratings.users.length).toFixed(2)
      : 0;
    const userCount = ratings.users.length;
    
    return { totalUserReviews, avgRating, userCount };
  };

  const stats = calculateReviewStats();

  return (
    <Box sx={{ minHeight: '100vh', background: COLORS.darker, color: COLORS.text }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography sx={{ fontSize: '3rem', fontWeight: 900, color: COLORS.bright, mb: 1 }}>
          ◎ Ratings Management
        </Typography>
        <Typography sx={{ fontSize: '0.95rem', color: COLORS.textMid, mb: 5 }}>
          View user and post ratings
        </Typography>

        {/* Review Statistics Summary */}
        {!loading && (
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2.5, background: `rgba(100,255,67,0.08)`, border: `1px solid ${COLORS.border}`, borderRadius: '12px' }}>
                <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid, fontWeight: 600, mb: 1 }}>
                  Total Reviews Submitted
                </Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: COLORS.bright }}>
                  {stats.totalUserReviews}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2.5, background: `rgba(100,255,67,0.08)`, border: `1px solid ${COLORS.border}`, borderRadius: '12px' }}>
                <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid, fontWeight: 600, mb: 1 }}>
                  Average Rating
                </Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: COLORS.bright }}>
                  {stats.avgRating}⭐
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2.5, background: `rgba(100,255,67,0.08)`, border: `1px solid ${COLORS.border}`, borderRadius: '12px' }}>
                <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid, fontWeight: 600, mb: 1 }}>
                  Total Users Rated
                </Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: COLORS.bright }}>
                  {stats.userCount}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {error && (
          <Box sx={{ p: 2, background: 'rgba(255,67,67,0.12)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '8px', mb: 3, color: '#ff9b9b' }}>
            {error}
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress sx={{ color: COLORS.bright }} />
          </Box>
        ) : (
          <>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: COLORS.bright, mt: 4, mb: 2 }}>User Ratings</Typography>
            <Box sx={{ backgroundColor: COLORS.surface, borderRadius: '12px', border: `1px solid ${COLORS.border}`, overflow: 'hidden', mb: 4 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: `rgba(100,255,67,0.08)` }}>
                      <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>ID</TableCell>
                      <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Average Rating</TableCell>
                      <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Total Reviews</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ratings.users.length > 0 ? (
                      ratings.users.map((rating, idx) => (
                        <TableRow key={idx} sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                          <TableCell sx={{ color: COLORS.text }}>{rating.id}</TableCell>
                          <TableCell sx={{ color: COLORS.text }}>{rating.averageRating?.toFixed(2) || 'N/A'}</TableCell>
                          <TableCell sx={{ color: COLORS.text }}>{rating.totalRatings || 0}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={3} sx={{ textAlign: 'center', color: COLORS.textMid, py: 3 }}>No user ratings found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default AdminRatingsPage;
