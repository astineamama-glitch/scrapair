/**
 * Feedback Detail Modal
 * Shows full feedback details in a modal dialog
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { COLORS } from '../../../shared/constants/colors';

const FeedbackDetailModal = ({ open, onClose, feedback }) => {
  if (!feedback) return null;

  const renderRatingStars = (rating) => {
    return '⭐'.repeat(Math.round(rating)) + (rating % 1 > 0 ? '½' : '');
  };

  const getTypeColor = (type) => {
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

  const formatCollectionStatus = (status) => {
    if (status === 'materials_accepted') {
      return 'Completed';
    }
    return status.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const typeStyle = getTypeColor(feedback.type);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: COLORS.surface,
          color: COLORS.text,
          borderRadius: '12px',
          border: `1px solid ${COLORS.border}`
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${COLORS.border}`,
        color: COLORS.bright,
        fontWeight: 700,
        fontSize: '1.2rem'
      }}>
        Feedback #{feedback.id}
        <Button
          onClick={onClose}
          sx={{ minWidth: 'auto', color: COLORS.textMid }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Rating */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid, fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
            Rating
          </Typography>
          <Typography sx={{ fontSize: '1.5rem', color: COLORS.bright }}>
            {renderRatingStars(feedback.rating)} ({feedback.rating}/5.0)
          </Typography>
        </Box>

        <Divider sx={{ borderColor: COLORS.border, my: 2 }} />

        {/* Type */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid, fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
            Type
          </Typography>
          <Box sx={{
            display: 'inline-block',
            px: 1.5,
            py: 0.5,
            background: typeStyle.bg,
            color: typeStyle.color,
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: 600,
            textTransform: 'capitalize'
          }}>
            {typeStyle.text}
          </Box>
        </Box>

        <Divider sx={{ borderColor: COLORS.border, my: 2 }} />

        {/* From User */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid, fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
            From User
          </Typography>
          <Box sx={{
            background: `rgba(100,255,67,0.05)`,
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            p: 2
          }}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid }}>
                  Email: <Typography component="span" sx={{ color: COLORS.bright, fontWeight: 600 }}>{feedback.fromUser?.email}</Typography>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid }}>
                  Type: <Typography component="span" sx={{ color: COLORS.bright, fontWeight: 600, textTransform: 'capitalize' }}>{feedback.fromUser?.type}</Typography>
                </Typography>
              </Grid>
              {feedback.fromUser?.businessName && (
                <Grid item xs={12}>
                  <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid }}>
                    Business: <Typography component="span" sx={{ color: COLORS.bright, fontWeight: 600 }}>{feedback.fromUser.businessName}</Typography>
                  </Typography>
                </Grid>
              )}
              {feedback.fromUser?.companyName && (
                <Grid item xs={12}>
                  <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid }}>
                    Company: <Typography component="span" sx={{ color: COLORS.bright, fontWeight: 600 }}>{feedback.fromUser.companyName}</Typography>
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </Box>

        {/* To User */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid, fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
            To User (Recipient)
          </Typography>
          <Box sx={{
            background: `rgba(100,255,67,0.05)`,
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            p: 2
          }}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid }}>
                  Email: <Typography component="span" sx={{ color: COLORS.bright, fontWeight: 600 }}>{feedback.toUser?.email}</Typography>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid }}>
                  Type: <Typography component="span" sx={{ color: COLORS.bright, fontWeight: 600, textTransform: 'capitalize' }}>{feedback.toUser?.type}</Typography>
                </Typography>
              </Grid>
              {feedback.toUser?.businessName && (
                <Grid item xs={12}>
                  <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid }}>
                    Business: <Typography component="span" sx={{ color: COLORS.bright, fontWeight: 600 }}>{feedback.toUser.businessName}</Typography>
                  </Typography>
                </Grid>
              )}
              {feedback.toUser?.companyName && (
                <Grid item xs={12}>
                  <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid }}>
                    Company: <Typography component="span" sx={{ color: COLORS.bright, fontWeight: 600 }}>{feedback.toUser.companyName}</Typography>
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </Box>

        <Divider sx={{ borderColor: COLORS.border, my: 2 }} />

        {/* Collection */}
        {feedback.collection && (
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid, fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
              Related Collection
            </Typography>
            <Box sx={{ fontSize: '0.9rem', color: COLORS.text }}>
              Collection ID: <span style={{ color: COLORS.bright, fontWeight: 600 }}>{feedback.collection.id}</span>
              <br />
              Status: <span style={{ color: COLORS.bright, fontWeight: 600 }}>{formatCollectionStatus(feedback.collection.status)}</span>
            </Box>
          </Box>
        )}

        <Divider sx={{ borderColor: COLORS.border, my: 2 }} />

        {/* Comment */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid, fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
            Comment
          </Typography>
          <Box sx={{
            background: `rgba(100,255,67,0.05)`,
            border: `1px solid ${COLORS.border}`,
            borderRadius: '6px',
            p: 2,
            minHeight: '80px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            color: COLORS.text,
            fontSize: '0.9rem'
          }}>
            {feedback.comment || '(No comment provided)'}
          </Box>
        </Box>

        <Divider sx={{ borderColor: COLORS.border, my: 2 }} />

        {/* Metadata */}
        <Box sx={{ mb: 1 }}>
          <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMid }}>
            Created: {new Date(feedback.createdAt).toLocaleString()}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMid }}>
            Updated: {new Date(feedback.updatedAt).toLocaleString()}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ borderTop: `1px solid ${COLORS.border}`, p: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{ background: COLORS.bright, color: COLORS.darker, fontWeight: 600 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackDetailModal;
