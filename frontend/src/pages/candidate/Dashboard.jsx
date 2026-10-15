import { useQuery } from '@tanstack/react-query';
import { Grid, Typography, Box, Chip } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CodeIcon from '@mui/icons-material/Code';
import EventIcon from '@mui/icons-material/Event';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import JobCard from '../../components/JobCard';

export default function CandidateDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['candidate-dashboard'],
    queryFn: () => api.get('/users/dashboard').then((r) => r.data.data),
  });

  const { data: recommended } = useQuery({
    queryKey: ['recommended-jobs'],
    queryFn: () => api.get('/ai/recommended-jobs').then((r) => r.data.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box className="pt-16">
      <PageHeader title="Candidate Dashboard" subtitle="Track your applications, scores, and opportunities" />

      <Grid container spacing={3} className="mb-8">
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Resume Score" value={data?.resumeScore || 0} icon={<DescriptionIcon />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="ATS Score" value={data?.atsScore || 0} icon={<DescriptionIcon />} color="green" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Coding Score" value={data?.codingScore || 0} icon={<CodeIcon />} color="purple" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Applications" value={data?.recentApplications?.length || 0} icon={<AssignmentIcon />} color="orange" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box className="card">
            <Typography variant="h6" fontWeight={600} gutterBottom>Recent Applications</Typography>
            {data?.recentApplications?.length ? data.recentApplications.map((app) => (
              <Box key={app._id} className="flex justify-between items-center py-3 border-b last:border-0">
                <Box>
                  <Typography fontWeight={500}>{app.jobId?.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{app.jobId?.company}</Typography>
                </Box>
                <Chip label={app.status} size="small" color={app.status === 'hired' ? 'success' : 'default'} />
              </Box>
            )) : <Typography color="text.secondary">No applications yet</Typography>}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box className="card">
            <Typography variant="h6" fontWeight={600} gutterBottom className="flex items-center gap-2">
              <EventIcon fontSize="small" /> Upcoming Interviews
            </Typography>
            {data?.upcomingInterviews?.length ? data.upcomingInterviews.map((int) => (
              <Box key={int._id} className="py-3 border-b last:border-0">
                <Typography fontWeight={500}>{int.title || int.jobId?.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(int.date).toLocaleString()}
                </Typography>
              </Box>
            )) : <Typography color="text.secondary">No upcoming interviews</Typography>}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" fontWeight={600} className="mb-4">Recommended Jobs</Typography>
          <Grid container spacing={2}>
            {recommended?.slice(0, 3).map((rec) => (
              <Grid item xs={12} md={4} key={rec.job._id}>
                <JobCard job={rec.job} matchScore={rec.matchPercentage} />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
