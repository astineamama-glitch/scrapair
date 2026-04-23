/**
 * Report Detail Modal
 * Shows full report details and allows admin actions
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Grid,
  LinearProgress,
  TextField,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  Card,
  CardContent
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import { COLORS } from '../../../shared/constants/colors';
import { reportsAPI } from '../../../api/reports';

const ReportDetailModal = ({ open, onClose, report, onActionSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionMode, setActionMode] = useState('view'); // view, confirm, reject, escalate
  const [deductionPercentage, setDeductionPercentage] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [escalationNotes, setEscalationNotes] = useState('');
  const [tabValue, setTabValue] = useState(0);

  if (!report) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid_confirmed':
        return { bg: 'rgba(76,175,80,0.12)', color: '#4caf50', text: 'Valid - Confirmed' };
      case 'invalid_confirmed':
        return { bg: 'rgba(244,67,54,0.12)', color: '#f44336', text: 'Invalid - Confirmed' };
      case 'pending':
        return { bg: 'rgba(255,193,7,0.12)', color: '#ffc107', text: 'Pending' };
      case 'under_review':
        return { bg: 'rgba(33,150,243,0.12)', color: '#2196f3', text: 'Under Review' };
      case 'escalated':
        return { bg: 'rgba(255,152,0,0.12)', color: '#ff9800', text: 'Escalated' };
      default:
        return { bg: 'rgba(158,158,158,0.12)', color: '#9e9e9e', text: status };
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return { bg: 'rgba(244,67,54,0.12)', color: '#f44336', text: 'Critical' };
      case 'high':
        return { bg: 'rgba(255,152,0,0.12)', color: '#ff9800', text: 'High' };
      case 'medium':
        return { bg: 'rgba(255,193,7,0.12)', color: '#ffc107', text: 'Medium' };
      case 'low':
        return { bg: 'rgba(76,175,80,0.12)', color: '#4caf50', text: 'Low' };
      default:
        return { bg: 'rgba(158,158,158,0.12)', color: '#9e9e9e', text: severity || 'Unknown' };
    }
  };

  const handleConfirmValid = async () => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      if (!adminNotes.trim()) {
        setError('Admin notes are required');
        setLoading(false);
        return;
      }

      const result = await reportsAPI.confirmAsValid(report.id, {
        deductionPercentage,
        adminNotes,
        useAutoDeduction: !deductionPercentage
      });

      setSuccess('Report confirmed as valid. Rating deduction applied.');
      setActionMode('view');
      setTimeout(() => {
        onActionSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.error || 'Failed to confirm report');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmInvalid = async () => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      if (!rejectionReason.trim()) {
        setError('Rejection reason is required');
        setLoading(false);
        return;
      }

      const result = await reportsAPI.confirmAsInvalid(report.id, {
        rejectionReason,
        adminNotes
      });

      setSuccess('Report confirmed as invalid.');
      setActionMode('view');
      setTimeout(() => {
        onActionSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.error || 'Failed to confirm report as invalid');
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async () => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      if (!escalationNotes.trim()) {
        setError('Escalation notes are required');
        setLoading(false);
        return;
      }

      const result = await reportsAPI.escalate(report.id, {
        adminNotes: escalationNotes
      });

      setSuccess('Report escalated successfully.');
      setActionMode('view');
      setTimeout(() => {
        onActionSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.error || 'Failed to escalate report');
    } finally {
      setLoading(false);
    }
  };

  const canTakeAction = report.status === 'pending' || report.status === 'under_review';
  const statusStyle = getStatusColor(report.status);
  const severityStyle = getSeverityColor(report.severity);
  const validityScore = Math.max(0, Math.min(100, report.validityScore || 0));

  // Determine default deduction percentage based on severity
  const severityDeductionMap = {
    low: 5,
    medium: 15,
    high: 20,
    critical: 30
  };

  const defaultDeductionPercent = severityDeductionMap[report.severity] || 10;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
        Report #{report.id}
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ minWidth: 'auto', color: COLORS.textMid }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, background: COLORS.darker }}>
        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* View Mode */}
        {actionMode === 'view' && (
          <>
            {/* Status Badge */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid, fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
                Status
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Box sx={{
                  display: 'inline-block',
                  px: 1.5,
                  py: 0.5,
                  background: statusStyle.bg,
                  color: statusStyle.color,
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}>
                  {statusStyle.text}
                </Box>
                {report.severity && (
                  <Box sx={{
                    display: 'inline-block',
                    px: 1.5,
                    py: 0.5,
                    background: severityStyle.bg,
                    color: severityStyle.color,
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}>
                    {severityStyle.text}
                  </Box>
                )}
              </Box>
            </Box>

            <Divider sx={{ borderColor: COLORS.border, my: 2 }} />

            {/* Reason */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid, fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
                Reason
              </Typography>
              <Typography sx={{
                background: `rgba(100,255,67,0.05)`,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '6px',
                p: 1.5,
                fontSize: '0.9rem',
                color: COLORS.bright,
                fontWeight: 600,
                textTransform: 'capitalize'
              }}>
                {report.reason || 'N/A'}
              </Typography>
            </Box>

            <Divider sx={{ borderColor: COLORS.border, my: 2 }} />

            {/* Reporter & Reported User Side by Side */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid, fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
                  Reporter
                </Typography>
                <Card sx={{ background: `rgba(100,255,67,0.05)`, border: `1px solid ${COLORS.border}` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid, mb: 1 }}>
                      Email: <Typography component="span" sx={{ color: COLORS.bright, fontWeight: 600 }}>{report.reporter?.email}</Typography>
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid, mb: 1 }}>
                      Type: <Typography component="span" sx={{ color: COLORS.bright, fontWeight: 600, textTransform: 'capitalize' }}>{report.reporter?.type}</Typography>
                    </Typography>
                    {report.reporter?.businessName && (
                      <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid }}>
                        Business: <Typography component="span" sx={{ color: COLORS.bright, fontWeight: 600 }}>{report.reporter.businessName}</Typography>
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid, fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
                  Reported User
                </Typography>
                <Card sx={{ background: `rgba(244,67,54,0.05)`, border: `1px solid ${COLORS.border}` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid, mb: 1 }}>
                      Email: <Typography component="span" sx={{ color: COLORS.bright, fontWeight: 600 }}>{report.reportedUser?.email}</Typography>
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid, mb: 1 }}>
                      Type: <Typography component="span" sx={{ color: COLORS.bright, fontWeight: 600, textTransform: 'capitalize' }}>{report.reportedUser?.type}</Typography>
                    </Typography>
                    {report.reportedUser?.businessName && (
                      <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid }}>
                        Business: <Typography component="span" sx={{ color: COLORS.bright, fontWeight: 600 }}>{report.reportedUser.businessName}</Typography>
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ borderColor: COLORS.border, my: 2 }} />

            {/* Validity Score */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid, fontWeight: 600, textTransform: 'uppercase' }}>
                  Validity Score
                </Typography>
                <Typography sx={{ fontSize: '1rem', color: COLORS.bright, fontWeight: 700 }}>
                  {validityScore}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={validityScore}
                sx={{
                  height: '8px',
                  borderRadius: '4px',
                  background: `rgba(100,255,67,0.1)`,
                  '& .MuiLinearProgress-bar': {
                    background: validityScore >= 70 ? '#4caf50' : validityScore >= 40 ? '#ffc107' : '#f44336',
                    borderRadius: '4px'
                  }
                }}
              />
            </Box>

            {/* Points Deducted (if already applied) */}
            {report.pointsDeducted && report.pointsDeducted > 0 && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid, fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
                    Points Deducted
                  </Typography>
                  <Typography sx={{
                    background: `rgba(244,67,54,0.05)`,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '6px',
                    p: 1.5,
                    fontSize: '1.1rem',
                    color: '#f44336',
                    fontWeight: 700,
                    textAlign: 'center'
                  }}>
                    {report.pointsDeducted.toFixed(2)} points
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: COLORS.border, my: 2 }} />
              </>
            )}

            {/* Description */}
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid, fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
                Description
              </Typography>
              <Box sx={{
                background: `rgba(100,255,67,0.05)`,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '6px',
                p: 2,
                minHeight: '100px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: COLORS.text,
                fontSize: '0.9rem'
              }}>
                {report.description || '(No description provided)'}
              </Box>
            </Box>

            {/* Admin Notes */}
            {report.adminNotes && (
              <>
                <Divider sx={{ borderColor: COLORS.border, my: 2 }} />
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid, fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
                    Admin Notes
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
                    {report.adminNotes}
                  </Box>
                </Box>
              </>
            )}

            <Divider sx={{ borderColor: COLORS.border, my: 2 }} />

            {/* Metadata */}
            <Box sx={{ mb: 1 }}>
              <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMid }}>
                Created: {new Date(report.createdAt).toLocaleString()}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: COLORS.textMid }}>
                Updated: {new Date(report.updatedAt).toLocaleString()}
              </Typography>
            </Box>
          </>
        )}

        {/* Confirm Valid Mode */}
        {actionMode === 'confirm' && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ fontWeight: 600, mb: 1 }}>Confirm Report as Valid</Box>
              <Typography variant="body2">
                This action will apply a rating deduction to the reported user based on the severity of the report.
              </Typography>
            </Alert>

            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: '0.9rem', color: COLORS.textMid, fontWeight: 600, mb: 1 }}>
                Severity: <Typography component="span" sx={{ color: severityStyle.color, fontWeight: 700, textTransform: 'uppercase' }}>{severityStyle.text}</Typography>
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: COLORS.textMid, mb: 2 }}>
                Default deduction: {defaultDeductionPercent}% ({((defaultDeductionPercent / 100) * 5.0).toFixed(2)} rating points)
              </Typography>

              <TextField
                type="number"
                label="Deduction Percentage (optional - leave empty for auto)"
                value={deductionPercentage || ''}
                onChange={(e) => setDeductionPercentage(e.target.value ? parseFloat(e.target.value) : null)}
                inputProps={{ min: 0, max: 100, step: 5 }}
                fullWidth
                size="small"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': { color: COLORS.text },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border }
                }}
              />

              {deductionPercentage !== null && (
                <Typography sx={{ fontSize: '0.85rem', color: COLORS.bright, mb: 2 }}>
                  Custom deduction: {deductionPercentage}% ({((deductionPercentage / 100) * 5.0).toFixed(2)} rating points)
                </Typography>
              )}
            </Box>

            <TextField
              label="Admin Notes (required)"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              multiline
              rows={4}
              fullWidth
              placeholder="Explain why this report is valid and the deduction..."
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': { color: COLORS.text },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border }
              }}
            />
          </Box>
        )}

        {/* Confirm Invalid Mode */}
        {actionMode === 'reject' && (
          <Box>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Box sx={{ fontWeight: 600, mb: 1 }}>Confirm Report as Invalid</Box>
              <Typography variant="body2">
                This action will mark the report as invalid. No rating deduction will be applied.
              </Typography>
            </Alert>

            <TextField
              label="Rejection Reason (required)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              multiline
              rows={3}
              fullWidth
              placeholder="Explain why this report is invalid..."
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': { color: COLORS.text },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border }
              }}
            />

            <TextField
              label="Admin Notes (optional)"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              multiline
              rows={3}
              fullWidth
              placeholder="Additional comments..."
              sx={{
                '& .MuiOutlinedInput-root': { color: COLORS.text },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border }
              }}
            />
          </Box>
        )}

        {/* Escalate Mode */}
        {actionMode === 'escalate' && (
          <Box>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Box sx={{ fontWeight: 600, mb: 1 }}>Escalate Report</Box>
              <Typography variant="body2">
                This action will mark the report as escalated for higher-level review.
              </Typography>
            </Alert>

            <TextField
              label="Escalation Notes (required)"
              value={escalationNotes}
              onChange={(e) => setEscalationNotes(e.target.value)}
              multiline
              rows={4}
              fullWidth
              placeholder="Explain why this report needs escalation..."
              sx={{
                '& .MuiOutlinedInput-root': { color: COLORS.text },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.border }
              }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: `1px solid ${COLORS.border}`, p: 2, gap: 1 }}>
        {actionMode === 'view' && canTakeAction && (
          <>
            <Button
              onClick={() => {
                setActionMode('confirm');
                setDeductionPercentage(null);
                setAdminNotes('');
              }}
              disabled={loading}
              startIcon={<CheckCircleIcon />}
              variant="contained"
              sx={{ background: '#4caf50', color: '#fff', fontWeight: 600 }}
            >
              Confirm Valid
            </Button>
            <Button
              onClick={() => {
                setActionMode('reject');
                setRejectionReason('');
                setAdminNotes('');
              }}
              disabled={loading}
              startIcon={<CancelIcon />}
              variant="contained"
              sx={{ background: '#f44336', color: '#fff', fontWeight: 600 }}
            >
              Confirm Invalid
            </Button>
            <Button
              onClick={() => {
                setActionMode('escalate');
                setEscalationNotes('');
              }}
              disabled={loading}
              startIcon={<WarningIcon />}
              variant="contained"
              sx={{ background: '#ff9800', color: '#fff', fontWeight: 600 }}
            >
              Escalate
            </Button>
          </>
        )}

        {actionMode !== 'view' && (
          <>
            <Button
              onClick={() => {
                setActionMode('view');
                setError('');
                setSuccess('');
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            {actionMode === 'confirm' && (
              <Button
                onClick={handleConfirmValid}
                disabled={loading || !adminNotes.trim()}
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                sx={{ background: '#4caf50', color: '#fff', fontWeight: 600 }}
              >
                {loading ? 'Processing...' : 'Confirm as Valid'}
              </Button>
            )}
            {actionMode === 'reject' && (
              <Button
                onClick={handleConfirmInvalid}
                disabled={loading || !rejectionReason.trim()}
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <CancelIcon />}
                sx={{ background: '#f44336', color: '#fff', fontWeight: 600 }}
              >
                {loading ? 'Processing...' : 'Confirm as Invalid'}
              </Button>
            )}
            {actionMode === 'escalate' && (
              <Button
                onClick={handleEscalate}
                disabled={loading || !escalationNotes.trim()}
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <WarningIcon />}
                sx={{ background: '#ff9800', color: '#fff', fontWeight: 600 }}
              >
                {loading ? 'Processing...' : 'Escalate Report'}
              </Button>
            )}
          </>
        )}

        {actionMode === 'view' && (
          <Button
            onClick={onClose}
            variant="contained"
            sx={{ background: COLORS.bright, color: COLORS.darker, fontWeight: 600, ml: 'auto' }}
          >
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ReportDetailModal;
