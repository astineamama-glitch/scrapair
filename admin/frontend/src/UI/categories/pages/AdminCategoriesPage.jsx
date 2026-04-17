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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { COLORS } from '../../../shared/constants/colors';
import { useFetchCategories } from '../hooks/useFetchCategories';

const AdminCategoriesPage = () => {
  const { categories, loading, error, createCategory, updateCategory, deleteCategory } = useFetchCategories();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingId(category.id);
      setFormData({ name: category.name, description: category.description || '' });
    } else {
      setEditingId(null);
      setFormData({ name: '', description: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateCategory(editingId, formData);
      } else {
        await createCategory(formData);
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving category:', err);
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(categoryId);
      } catch (err) {
        console.error('Error deleting category:', err);
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: COLORS.darker, color: COLORS.text }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
          <Box>
            <Typography sx={{ fontSize: '3rem', fontWeight: 900, color: COLORS.bright, mb: 1 }}>
              ◈ Waste Categories
            </Typography>
            <Typography sx={{ fontSize: '0.95rem', color: COLORS.textMid }}>
              Manage waste material categories
            </Typography>
          </Box>
          <Button
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ color: COLORS.bright, border: `1px solid ${COLORS.border}`, textTransform: 'none' }}
            variant="outlined"
          >
            Add Category
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
                    <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>ID</TableCell>
                    <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Description</TableCell>
                    <TableCell sx={{ color: COLORS.bright, fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <TableRow key={category.id} sx={{ borderBottom: `1px solid ${COLORS.border}` }}>
                        <TableCell sx={{ color: COLORS.text, fontSize: '0.85rem' }}>{category.id}</TableCell>
                        <TableCell sx={{ color: COLORS.text }}>{category.name}</TableCell>
                        <TableCell sx={{ color: COLORS.textMid }}>{category.description || '-'}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleOpenDialog(category)}
                              sx={{ color: COLORS.bright, textTransform: 'none' }}
                              variant="text"
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDelete(category.id)}
                              sx={{ color: '#ff9b9b', textTransform: 'none' }}
                              variant="text"
                            >
                              Delete
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', color: COLORS.textMid, py: 3 }}>No categories found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingId ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSave} variant="contained" color="primary">
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminCategoriesPage;
