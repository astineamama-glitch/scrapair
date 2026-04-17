import React from 'react';
import { Box, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import { COLORS } from '../../../shared/constants/colors';
import { useFetchReports } from '../hooks/useFetchReports';

const AdminReportsPage = () => {
  const { reports, loading, error } = useFetchReports();

  return (
    <Box sx={{ minHeight: '100vh', background: COLORS.darker, color: COLORS.text }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography sx={{ fontSize: '3rem', fontWeight: 900, color: COLORS.bright, mb: 1 }}>
          ◐ Reports Management
        </Typography>
        <Typography sx={{ fontSize: '0.95rem', color: COLORS.textMid, mb: 5 }}>
          View all reported items
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
          <Box sx={{ backgroundColor: COLORS.surface, borderRadius: '12px', border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: `rgba(100,255,67,0.08)` }}>
                    <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>ID</TableCell>
                    <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.length > 0 ? (
                    reports.map((report) => (
                      <TableRow key={report.id} sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                        <TableCell sx={{ color: COLORS.text }}>{report.id}</TableCell>
                        <TableCell sx={{ color: COLORS.text }}>{report.type}</TableCell>
                        <TableCell sx={{ color: COLORS.text }}>{report.status}</TableCell>
                        <TableCell sx={{ color: COLORS.textMid }}>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', color: COLORS.textMid, py: 3 }}>No reports found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default AdminReportsPage;
