import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Card, CardContent, Grid, CircularProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import { COLORS } from '../../../shared/constants/colors';
import { useFetchStatistics } from '../hooks/useFetchStatistics';
import feedbackAPI from '../../../api/feedback/feedbackApi';
import { reportsAPI } from '../../../api/reports';

const AdminDashboard = () => {
  const { statistics, loading, error } = useFetchStatistics();
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [pendingReports, setPendingReports] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchAdditionalStats = async () => {
      try {
        setStatsLoading(true);
        
        // Fetch feedback stats
        const feedbackData = await feedbackAPI.getStats();
        setFeedbackStats(feedbackData.data);

        // Fetch pending reports count
        const reportsData = await reportsAPI.getAll(1, 1, { status: 'pending' });
        setPendingReports(reportsData.pagination?.total || 0);
      } catch (err) {
        console.error('Error fetching additional stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchAdditionalStats();
  }, []);

  const getMostReportedReason = () => {
    if (!feedbackStats) return 'N/A';
    const reasons = {
      positive: feedbackStats.typeBreakdown?.positive || 0,
      negative: feedbackStats.typeBreakdown?.negative || 0,
      neutral: feedbackStats.typeBreakdown?.neutral || 0
    };
    return Object.keys(reasons).reduce((a, b) => reasons[a] > reasons[b] ? a : b);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: COLORS.darker, color: COLORS.text }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography sx={{ fontSize: '3.2rem', fontWeight: 900, color: COLORS.bright, mb: 1 }}>
          ◈ Admin Dashboard
        </Typography>
        <Typography sx={{ fontSize: '1rem', color: COLORS.textMid, mb: 5 }}>
          System monitoring & statistics
        </Typography>

        {error && (
          <Box sx={{ p: 2, background: 'rgba(255,67,67,0.12)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '8px', mb: 3, color: '#ff9b9b' }}>
            {error}
          </Box>
        )}

        {loading || statsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress sx={{ color: COLORS.bright }} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {[
              { label: 'Total Users', value: statistics?.totalUsers || 0, icon: <PeopleIcon sx={{ fontSize: 32 }} /> },
              { label: 'Total Materials', value: statistics?.totalMaterials || 0, icon: <WarningIcon sx={{ fontSize: 32 }} /> },
              { label: 'Total Posts', value: statistics?.totalPosts || 0, icon: '◎' },
              { label: 'Total Reports', value: statistics?.totalReports || 0, icon: '◐' },
              { label: 'Total Feedback', value: feedbackStats?.totalFeedback || 0, icon: '📝' },
              { label: 'Average Rating', value: `${(feedbackStats?.averageRating || 0).toFixed(2)}/5`, icon: '⭐' },
              { label: 'Pending Reports', value: pendingReports, icon: '⏳' },
              { label: 'Most Common Type', value: getMostReportedReason(), icon: '🏷️' },
            ].map((stat, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Card sx={{ background: `linear-gradient(135deg, ${COLORS.surface} 0%, rgba(18,77,5,0.5) 100%)`, border: `1px solid ${COLORS.border}`, borderRadius: '14px' }}>
                  <CardContent>
                    <Box sx={{ fontSize: '2rem', mb: 1, color: COLORS.bright }}>
                      {typeof stat.icon === 'string' ? stat.icon : stat.icon}
                    </Box>
                    <Typography sx={{ fontSize: '0.85rem', color: COLORS.textLow, mb: 1 }}>{stat.label}</Typography>
                    <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: COLORS.bright }}>{stat.value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default AdminDashboard;
