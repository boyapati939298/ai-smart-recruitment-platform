import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';

export default function MainLayout() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const showSidebar = isAuthenticated && user;

  return (
    <Box className="min-h-screen bg-slate-50">
      <Navbar />
      <Box className="flex">
        {showSidebar && <Sidebar />}
        <Box component="main" className={`flex-1 p-4 md:p-6 ${showSidebar ? 'md:ml-64' : ''}`}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
