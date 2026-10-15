import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Typography, Box, Chip, Alert, Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get(`/jobs/${id}`).then((r) => r.data.data),
  });

  const { data: match } = useQuery({
    queryKey: ['job-match', id],
    queryFn: () => api.get(`/ai/job-match/${id}`).then((r) => r.data.data),
    enabled: isAuthenticated && user?.role === 'candidate',
  });

  const applyMutation = useMutation({
    mutationFn: () => api.post(`/applications/jobs/${id}/apply`),
    onSuccess: () => navigate('/candidate/applications'),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box className="pt-16 max-w-4xl">
      <Box className="card mb-6">
        <Typography variant="h4" fontWeight={700}>{job.title}</Typography>
        <Typography variant="h6" color="text.secondary" className="mb-4">{job.company}</Typography>

        <Box className="flex flex-wrap gap-2 mb-4">
          <Chip label={job.jobType} />
          {job.location && <Chip label={job.location} variant="outlined" />}
          {job.salary?.min && <Chip label={`$${job.salary.min.toLocaleString()} - $${job.salary.max?.toLocaleString()}`} color="success" variant="outlined" />}
        </Box>

        {match && (
          <Alert severity={match.matchPercentage >= 70 ? 'success' : 'info'} className="mb-4">
            Match Score: {match.matchPercentage}% — {match.recommendation}
          </Alert>
        )}

        <Typography className="whitespace-pre-wrap mb-6">{job.description}</Typography>

        <Typography variant="h6" fontWeight={600} gutterBottom>Required Skills</Typography>
        <Box className="flex flex-wrap gap-2 mb-6">
          {job.skillsRequired?.map((s) => <Chip key={s} label={s} color="primary" variant="outlined" />)}
        </Box>

        {match?.missingSkills?.length > 0 && (
          <Box className="mb-6">
            <Typography variant="subtitle2" color="text.secondary">Missing Skills:</Typography>
            <Box className="flex flex-wrap gap-2 mt-1">
              {match.missingSkills.map((s) => <Chip key={s} label={s} size="small" color="warning" />)}
            </Box>
          </Box>
        )}

        {user?.role === 'candidate' && job.status === 'open' && (
          <button onClick={() => applyMutation.mutate()} disabled={applyMutation.isPending} className="btn-primary">
            {applyMutation.isPending ? 'Applying...' : 'Apply Now'}
          </button>
        )}
        {applyMutation.error && <Alert severity="error" className="mt-4">{applyMutation.error.response?.data?.message}</Alert>}
      </Box>
    </Box>
  );
}
