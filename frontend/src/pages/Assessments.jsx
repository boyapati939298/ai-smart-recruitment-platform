import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Typography, Box, Chip, Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Assessments() {
  const { user } = useSelector((state) => state.auth);

  const { data, isLoading } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => api.get('/assessments').then((r) => r.data.data),
  });

  return (
    <Box className="pt-16">
      <PageHeader
        title="Coding Assessments"
        subtitle={user?.role === 'recruiter' ? 'Manage and review assessments' : 'Take coding challenges'}
        action={user?.role === 'recruiter' && (
          <Link to="/recruiter/assessments/create" className="btn-primary">Create Assessment</Link>
        )}
      />

      {isLoading ? <LoadingSpinner /> : (
        <Grid container spacing={3}>
          {data?.map((a) => (
            <Grid item xs={12} md={6} key={a._id}>
              <Box className="card">
                <Box className="flex justify-between mb-2">
                  <Typography variant="h6" fontWeight={600}>{a.title}</Typography>
                  <Chip label={a.difficulty} size="small" />
                </Box>
                <Typography color="text.secondary" className="mb-3">{a.description}</Typography>
                <Typography variant="body2" className="mb-4">
                  {a.questions?.length} questions · {a.duration} minutes · {a.totalPoints} points
                </Typography>
                <Link to={`/assessments/${a._id}`} className="btn-primary text-sm inline-block">
                  {user?.role === 'recruiter' ? 'View Results' : 'Start Assessment'}
                </Link>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
