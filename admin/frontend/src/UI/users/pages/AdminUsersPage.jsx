import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TextField,
  MenuItem,
  InputAdornment,
  Button,
  Chip,
} from '@mui/material';
import { format } from 'date-fns';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { COLORS } from '../../../shared/constants/colors';
import { useFetchUsers } from '../hooks/useFetchUsers';

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    type: '',
    verified: '',
    search: ''
  });
  const [page, setPage] = useState(1);
  const limit = 10;

  const { users, loading, error, totalPages, deleteUser, verifyUser } = useFetchUsers(filters, page, limit);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(userId);
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const handleVerifyUser = async (userId, currentStatus) => {
    try {
      await verifyUser(userId, currentStatus);
    } catch (err) {
      console.error('Failed to verify user:', err);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: COLORS.darker, color: COLORS.text, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", overflowX: 'hidden' }}>
      <Box sx={{ position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.015'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 1 }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, py: 6 }}>
        <Box sx={{ mb: 5 }}>
          <Typography sx={{ fontSize: '3rem', fontWeight: 900, color: COLORS.bright, mb: 1 }}>
            ◉ Users Management
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: COLORS.textMid }}>
            View and manage all system users
          </Typography>
        </Box>

        {error && (
          <Box sx={{ p: 2.5, background: 'rgba(255,67,67,0.12)', border: `1px solid rgba(255,67,67,0.35)`, borderRadius: '12px', mb: 3, color: '#ff9b9b' }}>
            <Typography sx={{ fontSize: '0.9rem' }}>{error}</Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', backgroundColor: COLORS.surface, p: 2.5, borderRadius: '12px', border: `1px solid ${COLORS.border}` }}>
          <TextField
            placeholder="Search users..."
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            size="small"
            sx={{
              flex: 1,
              minWidth: '200px',
              '& .MuiOutlinedInput-root': {
                color: COLORS.text,
                backgroundColor: `${COLORS.darker}ee`,
                '& fieldset': { borderColor: COLORS.border },
                '&:hover fieldset': { borderColor: COLORS.borderHover },
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: COLORS.textMid, mr: 1 }} />
                </InputAdornment>
              )
            }}
          />

          <TextField
            select
            label="User Type"
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            size="small"
            sx={{ minWidth: '150px' }}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="business">Business</MenuItem>
            <MenuItem value="recycler">Recycler</MenuItem>
          </TextField>

          <TextField
            select
            label="Verification"
            name="verified"
            value={filters.verified}
            onChange={handleFilterChange}
            size="small"
            sx={{ minWidth: '150px' }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="true">Verified</MenuItem>
            <MenuItem value="false">Unverified</MenuItem>
          </TextField>

          <Button
            onClick={() => { setFilters({ type: '', verified: '', search: '' }); setPage(1); }}
            sx={{ color: COLORS.bright, border: `1px solid ${COLORS.border}`, textTransform: 'none' }}
          >
            Reset
          </Button>
        </Box>

        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress sx={{ color: COLORS.bright }} /></Box>}

        {!loading && users.length > 0 && (
          <Box sx={{ backgroundColor: COLORS.surface, borderRadius: '12px', border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: `rgba(100,255,67,0.08)`, borderBottom: `2px solid ${COLORS.border}` }}>
                    <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Verified</TableCell>
                    <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Created</TableCell>
                    <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} sx={{ borderBottom: `1px solid ${COLORS.border}`, '&:hover': { backgroundColor: COLORS.glow } }}>
                      <TableCell sx={{ color: COLORS.text }}>{user.email}</TableCell>
                      <TableCell>
                        <Chip label={user.type} size="small" sx={{ background: 'rgba(100,255,67,0.2)', color: COLORS.bright }} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={user.isVerified ? <VerifiedUserIcon /> : undefined}
                          label={user.isVerified ? 'Verified' : 'Unverified'}
                          size="small"
                          sx={{ background: user.isVerified ? 'rgba(100,255,67,0.25)' : 'rgba(255,107,107,0.2)', color: user.isVerified ? COLORS.bright : '#ff9b9b' }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: COLORS.textMid }}>{format(new Date(user.createdAt), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="small" onClick={() => handleVerifyUser(user.id, user.isVerified)} sx={{ color: COLORS.bright, fontSize: '0.75rem', px: 1.5 }}>
                            {user.isVerified ? 'Unverify' : 'Verify'}
                          </Button>
                          <Button size="small" startIcon={<DeleteIcon sx={{ fontSize: '1rem' }} />} onClick={() => handleDeleteUser(user.id)} sx={{ color: '#ff9b9b', fontSize: '0.75rem', px: 1.5 }}>
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {!loading && users.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6, backgroundColor: COLORS.surface, borderRadius: '12px' }}>
            <Typography sx={{ color: COLORS.textMid }}>No users found. Try adjusting your filters.</Typography>
          </Box>
        )}

        {!loading && users.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
            <Button disabled={page === 1} onClick={() => setPage(p => p - 1)} sx={{ color: COLORS.bright }} variant="outlined">Previous</Button>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, color: COLORS.textMid }}>Page {page} of {totalPages}</Box>
            <Button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} sx={{ color: COLORS.bright }} variant="outlined">Next</Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default AdminUsersPage;
