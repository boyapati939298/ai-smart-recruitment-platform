import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Typography, Box, Chip, Button, Dialog, DialogTitle, DialogContent, TextField } from '@mui/material';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';

export default function InterviewDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['interviews'],
    queryFn: () => api.get('/interviews').then((r) => r.data.data),
  });

  const scheduleMutation = useMutation({
    mutationFn: (data) => api.post('/interviews', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['interviews']);
      setOpen(false);
      reset();
    },
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box className="pt-16">
      <PageHeader
        title="Interviews"
        subtitle="Manage and join scheduled interviews"
        action={user?.role === 'recruiter' && (
          <Button variant="contained" onClick={() => setOpen(true)}>Schedule Interview</Button>
        )}
      />

      <Box className="space-y-4">
        {data?.map((int) => (
          <Box key={int._id} className="card flex justify-between items-center flex-wrap gap-4">
            <Box>
              <Typography fontWeight={600}>{int.title || int.jobId?.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(int.date).toLocaleString()} · {int.duration} min
              </Typography>
              <Typography variant="body2">
                {user.role === 'recruiter' ? int.candidateId?.name : int.recruiterId?.name}
              </Typography>
            </Box>
            <Box className="flex gap-2 items-center">
              <Chip label={int.status} size="small" />
              {int.roomId && int.status === 'scheduled' && (
                <Link to={`/interview/${int.roomId}`} className="btn-primary text-sm">Join</Link>
              )}
            </Box>
          </Box>
        ))}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Interview</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit((d) => scheduleMutation.mutate(d))} className="space-y-4 pt-2">
            <TextField fullWidth label="Candidate ID" {...register('candidateId', { required: true })} />
            <TextField fullWidth label="Job ID" {...register('jobId', { required: true })} />
            <TextField fullWidth type="datetime-local" label="Date" InputLabelProps={{ shrink: true }} {...register('date', { required: true })} />
            <TextField fullWidth label="Duration (min)" type="number" defaultValue={60} {...register('duration')} />
            <Button type="submit" variant="contained" disabled={scheduleMutation.isPending}>Schedule</Button>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
