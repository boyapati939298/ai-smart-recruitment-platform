import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Typography, Alert, Box } from '@mui/material';
import api from '../../services/api';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, data);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="card">
      <Typography variant="h5" fontWeight={700} gutterBottom>Reset Password</Typography>
      {error && <Alert severity="error" className="mb-4">{error}</Alert>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('password', { required: true, minLength: 6 })} type="password" className="input-field" placeholder="New password" />
        <button type="submit" disabled={loading} className="btn-primary w-full">Reset Password</button>
      </form>
      <Typography className="mt-6 text-center text-sm">
        <Link to="/login" className="text-primary-600">Back to login</Link>
      </Typography>
    </Box>
  );
}
