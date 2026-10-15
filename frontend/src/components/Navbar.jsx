import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AppBar, Toolbar, Typography, IconButton, Badge, Avatar, Menu, MenuItem } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { useState } from 'react';
import { logout } from '../redux/slices/authSlice';

export default function Navbar() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <AppBar position="fixed" color="inherit" elevation={1} sx={{ bgcolor: 'white', zIndex: 1201 }}>
      <Toolbar>
        <WorkOutlineIcon color="primary" sx={{ mr: 1 }} />
        <Typography
          component={Link}
          to="/"
          variant="h6"
          color="primary"
          fontWeight={700}
          sx={{ textDecoration: 'none', flexGrow: 1 }}
        >
          SmartRecruit
        </Typography>

        <Link to="/jobs" className="text-gray-600 hover:text-primary-600 mr-4 hidden sm:block font-medium">
          Jobs
        </Link>

        {isAuthenticated ? (
          <>
            <IconButton color="inherit" onClick={() => navigate('/chat')}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton onClick={(e) => setAnchor(e.currentTarget)}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                {user?.name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
              <MenuItem disabled>{user?.name}</MenuItem>
              <MenuItem onClick={() => { setAnchor(null); navigate(`/${user.role}/dashboard`); }}>
                Dashboard
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-secondary mr-2 text-sm">Login</Link>
            <Link to="/register" className="btn-primary text-sm">Register</Link>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
