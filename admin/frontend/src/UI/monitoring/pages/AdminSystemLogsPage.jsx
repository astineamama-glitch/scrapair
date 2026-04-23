import React from 'react';
import { Box, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { COLORS } from '../../../shared/constants/colors';
import { useFetchLogs } from '../hooks/useFetchLogs';

const AdminSystemLogsPage = () => {
  const { logs, loading, error, clearLogs } = useFetchLogs();

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all logs? This cannot be undone.')) return;
    try {
      await clearLogs();
    } catch (err) {
      console.error('Failed to clear logs:', err);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: COLORS.darker, color: COLORS.text }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
          <Box>
            <Typography sx={{ fontSize: '3rem', fontWeight: 900, color: COLORS.bright, mb: 1 }}>
              ◈ System Logs
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', color: COLORS.textMid }}>
              System activity and events
            </Typography>
          </Box>
          <Button
            startIcon={<DeleteIcon />}
            onClick={handleClearLogs}
            sx={{ color: '#ff9b9b', border: '1px solid rgba(255,107,107,0.3)', textTransform: 'none' }}
            variant="outlined"
          >
            Clear Logs
          </Button>
        </Box>

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
                    <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Timestamp</TableCell>
                    <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Action</TableCell>
                    <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>IP Address</TableCell>
                    <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.length > 0 ? (
                    logs.map((log) => {
                      let details = {};
                      
                      // Safely parse details
                      if (log.details) {
                        try {
                          details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                        } catch (e) {
                          details = { action: log.details };
                        }
                      } else {
                        details = {};
                      }
                      
                      // Format details for display
                      const formatDetails = () => {
                        if (!details) return '';
                        const parts = [];
                        if (details.action) parts.push(details.action);
                        if (details.username) parts.push(`User: ${details.username}`);
                        if (details.environment) parts.push(`Env: ${details.environment}`);
                        if (details.sessionExpiry) parts.push(`Session: ${details.sessionExpiry}`);
                        return parts.join(' • ');
                      };

                      return (
                        <TableRow key={log.id} sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                          <TableCell sx={{ color: COLORS.textMid, fontSize: '0.85rem' }}>{new Date(log.timestamp).toLocaleString()}</TableCell>
                          <TableCell sx={{ color: COLORS.text }}>{log.action}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: '4px', background: log.status === 'success' ? 'rgba(100,255,67,0.2)' : 'rgba(255,107,107,0.2)', color: log.status === 'success' ? COLORS.bright : '#ff9b9b', fontSize: '0.75rem', fontWeight: 600 }}>
                              {log.status}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: COLORS.text, fontSize: '0.85rem' }}>{log.ipAddress}</TableCell>
                          <TableCell sx={{ color: COLORS.textMid, fontSize: '0.8rem' }}>{formatDetails()}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', color: COLORS.textMid, py: 3 }}>No logs found</TableCell></TableRow>
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

export default AdminSystemLogsPage;
