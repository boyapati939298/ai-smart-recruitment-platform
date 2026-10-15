import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Chip, IconButton } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/users').then((r) => r.data.data),
  });

  const suspendMutation = useMutation({
    mutationFn: (id) => api.patch(`/users/${id}/suspend`),
    onSuccess: () => queryClient.invalidateQueries(['admin-users']),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box className="pt-16">
      <PageHeader title="User Management" />
      <Box className="card overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((u) => (
              <TableRow key={u._id}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell><Chip label={u.role} size="small" /></TableCell>
                <TableCell><Chip label={u.isActive ? 'Active' : 'Suspended'} size="small" color={u.isActive ? 'success' : 'error'} /></TableCell>
                <TableCell>
                  {u.role !== 'admin' && (
                    <IconButton size="small" onClick={() => suspendMutation.mutate(u._id)}>
                      <BlockIcon />
                    </IconButton>
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
