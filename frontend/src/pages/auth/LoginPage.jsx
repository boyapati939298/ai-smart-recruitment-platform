import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Alert, Box } from '@mui/material';
import { login, clearError } from '../../redux/slices/authSlice';
import { useEffect } from 'react';

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const onSubmit = async (data) => {
    const result = await dispatch(login(data));
    if (login.fulfilled.match(result)) {
      navigate(`/${result.payload.user.role}/dashboard`);
    }
  };

  return (
    <Box className="card">
      <Typography variant="h5" fontWeight={700} gutterBottom>Welcome back</Typography>
      <Typography color="text.secondary" className="mb-6">Sign in to your account</Typography>

      {error && <Alert severity="error" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input {...register('email', { required: true })} type="email" className="input-field" placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input {...register('password', { required: true })} type="password" className="input-field" />
        </div>
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <Typography className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account? <Link to="/register" className="text-primary-600 font-medium">Register</Link>
      </Typography>
    </Box>
  );
}
