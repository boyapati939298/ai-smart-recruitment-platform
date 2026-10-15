import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Chip, Button } from '@mui/material';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminRecruiters() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-recruiters'],
    queryFn: () => api.get('/recruiters').then((r) => r.data.data),
  });

  const verifyMutation = useMutation({
    mutationFn: (id) => api.patch(`/recruiters/${id}/verify`),
    onSuccess: () => queryClient.invalidateQueries(['admin-recruiters']),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box className="pt-16">
      <PageHeader title="Recruiter Verification" />
      <Box className="card overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Company</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Industry</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((r) => (
              <TableRow key={r._id}>
                <TableCell>{r.companyName}</TableCell>
                <TableCell>{r.userId?.email}</TableCell>
                <TableCell>{r.industry}</TableCell>
                <TableCell><Chip label={r.verified ? 'Verified' : 'Pending'} size="small" color={r.verified ? 'success' : 'warning'} /></TableCell>
                <TableCell>
                  {!r.verified && (
                    <Button size="small" variant="contained" onClick={() => verifyMutation.mutate(r._id)}>
                      Verify
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
