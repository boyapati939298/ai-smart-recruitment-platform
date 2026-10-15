import { useQuery } from '@tanstack/react-query';
import { Grid, Typography, Box } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import PeopleIcon from '@mui/icons-material/People';
import CodeIcon from '@mui/icons-material/Code';
import EventIcon from '@mui/icons-material/Event';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function RecruiterDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['recruiter-dashboard'],
    queryFn: () => api.get('/recruiters/dashboard').then((r) => r.data.data),
  });

  if (isLoading) return <LoadingSpinner />;

  const funnelData = data?.hiringFunnel?.map((f) => ({ name: f._id, count: f.count })) || [];

  return (
    <Box className="pt-16">
      <PageHeader title="Recruiter Dashboard" subtitle="Overview of your hiring pipeline" />

      <Grid container spacing={3} className="mb-8">
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Jobs" value={data?.activeJobs || 0} icon={<WorkIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Applications" value={data?.totalApplications || 0} icon={<PeopleIcon />} color="green" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Assessments" value={data?.assessments || 0} icon={<CodeIcon />} color="purple" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Upcoming Interviews" value={data?.upcomingInterviews || 0} icon={<EventIcon />} color="orange" />
        </Grid>
      </Grid>

      <Box className="card">
        <Typography variant="h6" fontWeight={600} gutterBottom>Hiring Funnel</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={funnelData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
