import { useQuery } from '@tanstack/react-query';
import { Grid, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.get('/admin/analytics').then((r) => r.data.data),
  });

  if (isLoading) return <LoadingSpinner />;

  const o = data?.overview || {};

  return (
    <Box className="pt-16">
      <PageHeader title="Admin Dashboard" subtitle="Platform overview and management" />

      <Grid container spacing={3} className="mb-8">
        <Grid item xs={12} sm={6} md={4}><StatCard title="Total Users" value={o.totalUsers || 0} /></Grid>
        <Grid item xs={12} sm={6} md={4}><StatCard title="Candidates" value={o.totalCandidates || 0} color="green" /></Grid>
        <Grid item xs={12} sm={6} md={4}><StatCard title="Recruiters" value={o.totalRecruiters || 0} color="purple" /></Grid>
        <Grid item xs={12} sm={6} md={4}><StatCard title="Open Jobs" value={o.openJobs || 0} color="orange" /></Grid>
        <Grid item xs={12} sm={6} md={4}><StatCard title="Applications" value={o.totalApplications || 0} /></Grid>
        <Grid item xs={12} sm={6} md={4}><StatCard title="Assessments" value={o.totalAssessments || 0} color="green" /></Grid>
      </Grid>

      <Grid container spacing={3}>
        {[
          { to: '/admin/users', label: 'Manage Users' },
          { to: '/admin/recruiters', label: 'Verify Recruiters' },
          { to: '/admin/jobs', label: 'Monitor Jobs' },
          { to: '/admin/analytics', label: 'View Analytics' },
        ].map((link) => (
          <Grid item xs={12} sm={6} md={3} key={link.to}>
            <Link to={link.to} className="card block text-center hover:shadow-md transition no-underline">
              <Typography fontWeight={600} color="primary">{link.label}</Typography>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
