/**
 * Admin Reports Page
 * Displays all reports submitted by users with filtering and detailed view
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
  Button,
  TextField,
  MenuItem,
  Grid,
  Pagination
} from '@mui/material';
import { COLORS } from '../../../shared/constants/colors';
import { useFetchReports } from '../hooks/useFetchReports';
import ReportDetailModal from '../components/ReportDetailModal';

const AdminReportsPage = () => {
  const { reports, loading, error, pagination, applyFilters, goToPage } = useFetchReports();
  const [selectedReport, setSelectedReport] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');

  const handleApplyFilters = () => {
    const filters = {};
    if (statusFilter) filters.status = statusFilter;
    if (reasonFilter) filters.reason = reasonFilter;
    applyFilters(filters);
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setReasonFilter('');
    applyFilters({});
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setOpenDetailModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return { bg: 'rgba(76,175,80,0.12)', color: '#4caf50', text: 'Approved' };
      case 'rejected':
        return { bg: 'rgba(244,67,54,0.12)', color: '#f44336', text: 'Rejected' };
      case 'pending':
        return { bg: 'rgba(255,193,7,0.12)', color: '#ffc107', text: 'Pending' };
      default:
        return { bg: 'rgba(158,158,158,0.12)', color: '#9e9e9e', text: status };
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: COLORS.darker, color: COLORS.text }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography sx={{ fontSize: '3rem', fontWeight: 900, color: COLORS.bright, mb: 1 }}>
            ◐ Reports Management
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: COLORS.textMid }}>
            View and manage user reports
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
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                size="small"
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': { color: COLORS.text },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border }
                }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                size="small"
                label="Reason (search)"
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': { color: COLORS.text },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', gap: 1 }}>
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

        {/* Reports Table */}
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
                      <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Reason</TableCell>
                      <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Reporter Email</TableCell>
                      <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Reported User Email</TableCell>
                      <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Validity Score</TableCell>
                      <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Created</TableCell>
                      <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports.length > 0 ? (
                      reports.map((report) => {
                        const statusStyle = getStatusColor(report.status);
                        return (
                          <TableRow key={report.id} sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                            <TableCell sx={{ color: COLORS.text }}>{report.id}</TableCell>
                            <TableCell>
                              <Box sx={{
                                display: 'inline-block',
                                px: 1.5,
                                py: 0.5,
                                background: statusStyle.bg,
                                color: statusStyle.color,
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                textTransform: 'capitalize'
                              }}>
                                {statusStyle.text}
                              </Box>
                            </TableCell>
                            <TableCell sx={{
                              color: COLORS.text,
                              fontSize: '0.85rem',
                              textTransform: 'capitalize'
                            }}>
                              {report.reason || 'N/A'}
                            </TableCell>
                            <TableCell sx={{ color: COLORS.text, fontSize: '0.85rem' }}>
                              {report.reporter?.email || 'Unknown'}
                            </TableCell>
                            <TableCell sx={{ color: COLORS.text, fontSize: '0.85rem' }}>
                              {report.reportedUser?.email || 'Unknown'}
                            </TableCell>
                            <TableCell sx={{
                              color: report.validityScore >= 70 ? '#4caf50' : report.validityScore >= 40 ? '#ffc107' : '#f44336',
                              fontWeight: 600
                            }}>
                              {report.validityScore || 0}%
                            </TableCell>
                            <TableCell sx={{ color: COLORS.textMid, fontSize: '0.85rem' }}>
                              {new Date(report.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleViewDetails(report)}
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
                        <TableCell colSpan={8} sx={{ textAlign: 'center', color: COLORS.textMid, py: 4 }}>
                          No reports found
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
      {selectedReport && (
        <ReportDetailModal
          open={openDetailModal}
          onClose={() => setOpenDetailModal(false)}
          report={selectedReport}
        />
      )}
    </Box>
  );
};

export default AdminReportsPage;
