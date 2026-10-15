import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Typography, Box, Alert, Chip, TextField } from '@mui/material';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CandidateProfile() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/users/profile').then((r) => r.data.data),
  });

  const { register, handleSubmit, reset } = useForm();

  const mutation = useMutation({
    mutationFn: (data) => api.put('/users/profile', data),
    onSuccess: () => queryClient.invalidateQueries(['profile']),
  });

  if (isLoading) return <LoadingSpinner />;
  if (user && !mutation.isSuccess) reset(user);

  const onSubmit = (data) => {
    const skills = typeof data.skills === 'string'
      ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : data.skills;
    mutation.mutate({ ...data, skills });
  };

  return (
    <Box className="pt-16 max-w-3xl">
      <PageHeader title="My Profile" subtitle="Manage your personal and professional details" />

      {mutation.isSuccess && <Alert severity="success" className="mb-4">Profile updated!</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
        <TextField fullWidth label="Name" defaultValue={user?.name} {...register('name')} />
        <TextField fullWidth label="Phone" defaultValue={user?.phone} {...register('phone')} />
        <TextField fullWidth label="Location" defaultValue={user?.location} {...register('location')} />
        <TextField fullWidth multiline rows={3} label="Bio" defaultValue={user?.bio} {...register('bio')} />
        <TextField fullWidth label="Skills (comma separated)" defaultValue={user?.skills?.join(', ')} {...register('skills')} />
        <TextField fullWidth label="GitHub" defaultValue={user?.githubProfile} {...register('githubProfile')} />
        <TextField fullWidth label="LinkedIn" defaultValue={user?.linkedinProfile} {...register('linkedinProfile')} />

        {user?.skills?.length > 0 && (
          <Box className="flex flex-wrap gap-2">
            {user.skills.map((s) => <Chip key={s} label={s} />)}
          </Box>
        )}

        <button type="submit" className="btn-primary" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </Box>
  );
}
