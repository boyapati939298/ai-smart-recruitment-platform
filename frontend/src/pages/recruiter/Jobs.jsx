import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Typography, Box, Chip, Table, TableBody, TableCell, TableHead, TableRow, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PeopleIcon from '@mui/icons-material/People';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function RecruiterJobs() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: () => api.get('/jobs/recruiter/mine').then((r) => r.data.data),
  });

  return (
    <Box className="pt-16">
      <PageHeader
        title="My Jobs"
        subtitle="Manage job postings"
        action={<Link to="/recruiter/jobs/create" className="btn-primary">Post New Job</Link>}
      />

      {isLoading ? <LoadingSpinner /> : (
        <Box className="card overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Applications</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.map((job) => (
                <TableRow key={job._id}>
                  <TableCell>{job.title}</TableCell>
                  <TableCell><Chip label={job.status} size="small" /></TableCell>
                  <TableCell>{job.applicationCount}</TableCell>
                  <TableCell>
                    <Link to={`/recruiter/applicants/${job._id}`}><IconButton size="small"><PeopleIcon /></IconButton></Link>
                    <Link to={`/recruiter/rankings/${job._id}`}><IconButton size="small" color="primary">AI</IconButton></Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
