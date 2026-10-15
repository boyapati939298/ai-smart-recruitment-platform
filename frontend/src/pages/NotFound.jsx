import { Link } from 'react-router-dom';
import { Typography, Box } from '@mui/material';

export default function NotFound() {
  return (
    <Box className="pt-24 text-center">
      <Typography variant="h1" fontWeight={800} color="primary">404</Typography>
      <Typography variant="h5" className="mb-4">Page not found</Typography>
      <Link to="/" className="btn-primary">Go Home</Link>
    </Box>
  );
}
