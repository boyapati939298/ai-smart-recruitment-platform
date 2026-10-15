import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';

export default function AuthLayout() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return (
    <Box className="min-h-screen flex">
      <Box className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-purple-700 items-center justify-center p-12">
        <Box className="text-white max-w-md">
          <WorkOutlineIcon sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Smart Recruitment
          </Typography>
          <Typography variant="h6" className="opacity-90">
            AI-powered hiring platform with resume screening, coding assessments, and interview management.
          </Typography>
        </Box>
      </Box>
      <Box className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <Box className="w-full max-w-md">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
