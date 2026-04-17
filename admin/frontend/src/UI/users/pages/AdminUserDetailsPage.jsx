import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { format } from 'date-fns';
import { COLORS } from '../../../shared/constants/colors';
import { useFetchUserDetails } from '../hooks/useFetchUserDetails';

const AdminUserDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { user, loading, error, verifyUser, deleteUser } = useFetchUserDetails(id);

  const handleDeleteUser = async () => {
    try {
      await deleteUser();
      navigate('/admin/users');
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleVerifyUser = async () => {
    try {
      await verifyUser(user.isVerified);
    } catch (err) {
      console.error('Failed to verify:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', background: COLORS.darker, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: COLORS.bright }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ minHeight: '100vh', background: COLORS.darker, color: COLORS.text }}>
        <Container sx={{ py: 6 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/users')} sx={{ color: COLORS.bright, textTransform: 'none', mb: 3 }}>
            Back to Users
          </Button>
          <Typography sx={{ color: '#ff9b9b' }}>User not found</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: COLORS.darker, color: COLORS.text }}>
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/users')} sx={{ color: COLORS.bright, textTransform: 'none', mb: 4 }}>
          Back to Users
        </Button>

        {error && (
          <Box sx={{ p: 2, background: 'rgba(255,67,67,0.12)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '8px', mb: 3, color: '#ff9b9b' }}>
            {error}
          </Box>
        )}

        <Card sx={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: '12px' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: COLORS.bright }}>{user.email}</Typography>
              <Chip
                icon={user.isVerified ? <VerifiedUserIcon /> : undefined}
                label={user.isVerified ? 'Verified' : 'Unverified'}
                sx={{ background: user.isVerified ? 'rgba(100,255,67,0.25)' : 'rgba(255,107,107,0.2)', color: user.isVerified ? COLORS.bright : '#ff9b9b' }}
              />
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: COLORS.textLow, mb: 0.5 }}>User Type</Typography>
                <Typography sx={{ color: COLORS.text, fontWeight: 600 }}>{user.type}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: COLORS.textLow, mb: 0.5 }}>Verified</Typography>
                <Typography sx={{ color: COLORS.text, fontWeight: 600 }}>{user.isVerified ? 'Yes' : 'No'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: COLORS.textLow, mb: 0.5 }}>Created</Typography>
                <Typography sx={{ color: COLORS.text, fontWeight: 600 }}>{format(new Date(user.createdAt), 'MMM dd, yyyy HH:mm')}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ color: COLORS.textLow, mb: 0.5 }}>ID</Typography>
                <Typography sx={{ color: COLORS.text, fontWeight: 600, fontSize: '0.85rem' }}>{user.id}</Typography>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, mt: 6 }}>
              <Button
                onClick={handleVerifyUser}
                sx={{ color: COLORS.bright, border: `1px solid ${COLORS.border}`, textTransform: 'none', flex: 1 }}
                variant="outlined"
              >
                {user.isVerified ? 'Unverify User' : 'Verify User'}
              </Button>
              <Button
                onClick={() => setDeleteDialogOpen(true)}
                startIcon={<DeleteIcon />}
                sx={{ color: '#ff9b9b', border: '1px solid rgba(255,107,107,0.3)', textTransform: 'none' }}
                variant="outlined"
              >
                Delete
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this user? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUserDetailsPage;
