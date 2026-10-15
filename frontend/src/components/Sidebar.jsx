import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CodeIcon from '@mui/icons-material/Code';
import EventIcon from '@mui/icons-material/Event';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ChatIcon from '@mui/icons-material/Chat';

const linkClass = ({ isActive }) =>
  `flex items-center px-4 py-2.5 rounded-lg transition-colors ${
    isActive ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
  }`;

const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={linkClass}>
    <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{icon}</ListItemIcon>
    <ListItemText primary={label} />
  </NavLink>
);

export default function Sidebar() {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;

  const candidateLinks = [
    { to: '/candidate/dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
    { to: '/candidate/profile', icon: <PersonIcon />, label: 'Profile' },
    { to: '/candidate/resume', icon: <DescriptionIcon />, label: 'Resume Analysis' },
    { to: '/jobs', icon: <WorkIcon />, label: 'Browse Jobs' },
    { to: '/candidate/applications', icon: <AssignmentIcon />, label: 'Applications' },
    { to: '/assessments', icon: <CodeIcon />, label: 'Assessments' },
    { to: '/candidate/interview-prep', icon: <PsychologyIcon />, label: 'Interview Prep' },
    { to: '/candidate/career', icon: <TrendingUpIcon />, label: 'Career Guidance' },
    { to: '/interviews', icon: <EventIcon />, label: 'Interviews' },
    { to: '/chat', icon: <ChatIcon />, label: 'Messages' },
  ];

  const recruiterLinks = [
    { to: '/recruiter/dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
    { to: '/recruiter/company', icon: <BusinessIcon />, label: 'Company' },
    { to: '/recruiter/jobs', icon: <WorkIcon />, label: 'Manage Jobs' },
    { to: '/assessments', icon: <CodeIcon />, label: 'Assessments' },
    { to: '/interviews', icon: <EventIcon />, label: 'Interviews' },
    { to: '/chat', icon: <ChatIcon />, label: 'Messages' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
    { to: '/admin/users', icon: <PeopleIcon />, label: 'Users' },
    { to: '/admin/recruiters', icon: <VerifiedUserIcon />, label: 'Recruiters' },
    { to: '/admin/jobs', icon: <WorkIcon />, label: 'Jobs' },
    { to: '/admin/analytics', icon: <AnalyticsIcon />, label: 'Analytics' },
  ];

  const links = role === 'admin' ? adminLinks : role === 'recruiter' ? recruiterLinks : candidateLinks;

  return (
    <Box
      className="hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto z-10"
      sx={{ pt: 2 }}
    >
      <List sx={{ px: 2 }}>
        {links.map((link) => (
          <ListItemButton key={link.to} component={NavLink} to={link.to} sx={{ borderRadius: 2, mb: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>{link.icon}</ListItemIcon>
            <ListItemText primary={link.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
