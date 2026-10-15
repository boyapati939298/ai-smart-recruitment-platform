import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Typography, Alert, Box, MenuItem, TextField } from '@mui/material';
import { register as registerUser, clearError } from '../../redux/slices/authSlice';
import { useEffect } from 'react';

export default function RegisterPage() {
  const { register, handleSubmit, watch } = useForm({ defaultValues: { role: 'candidate' } });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const role = watch('role');

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const onSubmit = async (data) => {
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) {
      navigate(`/${result.payload.user.role}/dashboard`);
    }
  };

  return (
    <Box className="card">
      <Typography variant="h5" fontWeight={700} gutterBottom>Create account</Typography>
      <Typography color="text.secondary" className="mb-6">Join the smart recruitment platform</Typography>

      {error && <Alert severity="error" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input {...register('name', { required: true })} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input {...register('email', { required: true })} type="email" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input {...register('password', { required: true, minLength: 6 })} type="password" className="input-field" />
        </div>
        <TextField select fullWidth label="I am a" {...register('role')} defaultValue="candidate">
          <MenuItem value="candidate">Candidate</MenuItem>
          <MenuItem value="recruiter">Recruiter</MenuItem>
        </TextField>
        {role === 'recruiter' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input {...register('companyName', { required: role === 'recruiter' })} className="input-field" />
          </div>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </form>

      <Typography className="mt-6 text-center text-sm text-gray-600">
        Already have an account? <Link to="/login" className="text-primary-600 font-medium">Sign in</Link>
      </Typography>
    </Box>
  );
}
