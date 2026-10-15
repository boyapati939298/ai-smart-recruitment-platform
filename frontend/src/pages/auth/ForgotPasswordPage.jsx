import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Typography, Alert, Box } from '@mui/material';
import api from '../../services/api';

export default function ForgotPasswordPage() {
  const { register, handleSubmit } = useForm();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', data);
      setMessage('If an account exists, a reset link has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="card">
      <Typography variant="h5" fontWeight={700} gutterBottom>Forgot Password</Typography>
      <Typography color="text.secondary" className="mb-6">Enter your email to receive a reset link</Typography>

      {message && <Alert severity="success" className="mb-4">{message}</Alert>}
      {error && <Alert severity="error" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('email', { required: true })} type="email" className="input-field" placeholder="Email" />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <Typography className="mt-6 text-center text-sm">
        <Link to="/login" className="text-primary-600">Back to login</Link>
      </Typography>
    </Box>
  );
}
