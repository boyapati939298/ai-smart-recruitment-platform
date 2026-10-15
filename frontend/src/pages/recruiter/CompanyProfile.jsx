import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Typography, Box, TextField, Alert, Chip } from '@mui/material';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CompanyProfile() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['recruiter-profile'],
    queryFn: () => api.get('/recruiters/profile').then((r) => r.data.data),
    retry: false,
  });

  const { register, handleSubmit } = useForm();

  const mutation = useMutation({
    mutationFn: (formData) => api.put('/recruiters/profile', formData),
    onSuccess: () => queryClient.invalidateQueries(['recruiter-profile']),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box className="pt-16 max-w-2xl">
      <PageHeader
        title="Company Profile"
        subtitle="Manage your company information"
        action={data?.verified ? <Chip label="Verified" color="success" /> : <Chip label="Pending Verification" color="warning" />}
      />

      {mutation.isSuccess && <Alert severity="success" className="mb-4">Profile updated!</Alert>}

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="card space-y-4">
        <TextField fullWidth label="Company Name" defaultValue={data?.companyName} {...register('companyName')} />
        <TextField fullWidth label="Website" defaultValue={data?.website} {...register('website')} />
        <TextField fullWidth label="Industry" defaultValue={data?.industry} {...register('industry')} />
        <TextField fullWidth label="Location" defaultValue={data?.location} {...register('location')} />
        <TextField fullWidth label="Company Size" defaultValue={data?.companySize} {...register('companySize')} />
        <TextField fullWidth multiline rows={4} label="Description" defaultValue={data?.description} {...register('description')} />
        <button type="submit" className="btn-primary" disabled={mutation.isPending}>Save</button>
      </form>
    </Box>
  );
}
