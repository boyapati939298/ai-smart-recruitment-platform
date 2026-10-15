import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Typography, Box, TextField, MenuItem, Alert } from '@mui/material';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';

export default function CreateJob() {
  const { register, handleSubmit } = useForm({ defaultValues: { jobType: 'full-time' } });
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        skillsRequired: data.skillsRequired.split(',').map((s) => s.trim()).filter(Boolean),
        salary: { min: Number(data.salaryMin), max: Number(data.salaryMax), currency: 'USD' },
        experienceRequired: { min: Number(data.expMin) || 0, max: Number(data.expMax) },
      };
      return api.post('/jobs', payload);
    },
    onSuccess: () => navigate('/recruiter/jobs'),
  });

  return (
    <Box className="pt-16 max-w-2xl">
      <PageHeader title="Post a Job" subtitle="Create a new job listing" />

      {mutation.error && <Alert severity="error" className="mb-4">{mutation.error.response?.data?.message}</Alert>}

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="card space-y-4">
        <TextField fullWidth label="Job Title" {...register('title', { required: true })} />
        <TextField fullWidth label="Company" {...register('company', { required: true })} />
        <TextField fullWidth multiline rows={5} label="Description" {...register('description', { required: true })} />
        <TextField fullWidth label="Skills (comma separated)" {...register('skillsRequired', { required: true })} />
        <TextField fullWidth label="Location" {...register('location')} />
        <TextField select fullWidth label="Job Type" defaultValue="full-time" {...register('jobType')}>
          <MenuItem value="full-time">Full Time</MenuItem>
          <MenuItem value="remote">Remote</MenuItem>
          <MenuItem value="contract">Contract</MenuItem>
          <MenuItem value="internship">Internship</MenuItem>
        </TextField>
        <Box className="grid grid-cols-2 gap-4">
          <TextField label="Salary Min" type="number" {...register('salaryMin')} />
          <TextField label="Salary Max" type="number" {...register('salaryMax')} />
        </Box>
        <Box className="grid grid-cols-2 gap-4">
          <TextField label="Min Experience (years)" type="number" {...register('expMin')} />
          <TextField label="Max Experience (years)" type="number" {...register('expMax')} />
        </Box>
        <button type="submit" className="btn-primary" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating...' : 'Post Job'}
        </button>
      </form>
    </Box>
  );
}
