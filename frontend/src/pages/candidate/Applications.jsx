import { useQuery } from '@tanstack/react-query';
import { Typography, Box, Chip, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

const statusColors = {
  applied: 'default', screening: 'info', shortlisted: 'primary',
  assessment: 'warning', interview: 'secondary', offered: 'success',
  hired: 'success', rejected: 'error',
};

export default function Applications() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => api.get('/applications/mine').then((r) => r.data.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box className="pt-16">
      <PageHeader title="My Applications" subtitle="Track your job application status" />

      <Box className="card overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Job</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Match</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Applied</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((app) => (
              <TableRow key={app._id}>
                <TableCell>
                  <Link to={`/jobs/${app.jobId?._id}`} className="text-primary-600 font-medium">
                    {app.jobId?.title}
                  </Link>
                </TableCell>
                <TableCell>{app.jobId?.company}</TableCell>
                <TableCell>{app.matchScore}%</TableCell>
                <TableCell><Chip label={app.status} size="small" color={statusColors[app.status]} /></TableCell>
                <TableCell>{new Date(app.appliedDate).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!data?.length && <Typography className="p-4 text-center text-gray-500">No applications yet</Typography>}
      </Box>
    </Box>
  );
}
