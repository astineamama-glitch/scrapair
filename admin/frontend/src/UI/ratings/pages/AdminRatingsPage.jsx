import React from 'react';
import { Box, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import { COLORS } from '../../../shared/constants/colors';
import { useFetchRatings } from '../hooks/useFetchRatings';

const AdminRatingsPage = () => {
  const { ratings, loading, error } = useFetchRatings();

  return (
    <Box sx={{ minHeight: '100vh', background: COLORS.darker, color: COLORS.text }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography sx={{ fontSize: '3rem', fontWeight: 900, color: COLORS.bright, mb: 1 }}>
          ◎ Ratings Management
        </Typography>
        <Typography sx={{ fontSize: '0.95rem', color: COLORS.textMid, mb: 5 }}>
          View user and post ratings
        </Typography>

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
                          <TableCell sx={{ color: COLORS.text }}>{rating.totalReviews || 0}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={3} sx={{ textAlign: 'center', color: COLORS.textMid, py: 3 }}>No user ratings found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: COLORS.bright, mt: 4, mb: 2 }}>Post Ratings</Typography>
            <Box sx={{ backgroundColor: COLORS.surface, borderRadius: '12px', border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
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
                    {ratings.posts.length > 0 ? (
                      ratings.posts.map((rating, idx) => (
                        <TableRow key={idx} sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                          <TableCell sx={{ color: COLORS.text }}>{rating.id}</TableCell>
                          <TableCell sx={{ color: COLORS.text }}>{rating.averageRating?.toFixed(2) || 'N/A'}</TableCell>
                          <TableCell sx={{ color: COLORS.text }}>{rating.totalReviews || 0}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={3} sx={{ textAlign: 'center', color: COLORS.textMid, py: 3 }}>No post ratings found</TableCell></TableRow>
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
