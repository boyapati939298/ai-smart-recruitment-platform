import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Chip, Button } from '@mui/material';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminJobs() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: () => api.get('/jobs/admin/all').then((r) => r.data.data),
  });

  const flagMutation = useMutation({
    mutationFn: (id) => api.patch(`/jobs/admin/${id}/flag`),
    onSuccess: () => queryClient.invalidateQueries(['admin-jobs']),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box className="pt-16">
      <PageHeader title="Job Monitoring" />
      <Box className="card overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Posted By</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Flagged</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((job) => (
              <TableRow key={job._id}>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.company}</TableCell>
                <TableCell>{job.createdBy?.email}</TableCell>
                <TableCell><Chip label={job.status} size="small" /></TableCell>
                <TableCell>{job.isFlagged ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <Button size="small" color={job.isFlagged ? 'success' : 'error'} onClick={() => flagMutation.mutate(job._id)}>
                    {job.isFlagged ? 'Unflag' : 'Flag'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
