import { useQuery } from '@tanstack/react-query';
import { Grid, Typography, Box } from '@mui/material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

const COLORS = ['#4f46e5', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics-full'],
    queryFn: () => api.get('/admin/analytics').then((r) => r.data.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box className="pt-16">
      <PageHeader title="Platform Analytics" subtitle="User growth, hiring, and assessment statistics" />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box className="card">
            <Typography variant="h6" fontWeight={600} gutterBottom>User Growth</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.userGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box className="card">
            <Typography variant="h6" fontWeight={600} gutterBottom>Applications by Status</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data?.applicationsByStatus || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={100} label>
                  {(data?.applicationsByStatus || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box className="card">
            <Typography variant="h6" fontWeight={600} gutterBottom>Jobs by Type</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.jobsByType || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box className="card">
            <Typography variant="h6" fontWeight={600} gutterBottom>Assessment Stats by Language</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.assessmentStats || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#06b6d4" name="Submissions" />
                <Bar dataKey="avgScore" fill="#10b981" name="Avg Score" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
