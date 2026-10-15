import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Typography, Box, Chip, Table, TableBody, TableCell, TableHead, TableRow, Select, MenuItem } from '@mui/material';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

const stages = ['applied', 'screening', 'shortlisted', 'assessment', 'interview', 'offered', 'hired', 'rejected'];

export default function Applicants() {
  const { jobId } = useParams();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['applicants', jobId],
    queryFn: () => api.get(`/applications/jobs/${jobId}/applicants`).then((r) => r.data.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/applications/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries(['applicants', jobId]),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box className="pt-16">
      <PageHeader title="Applicants" subtitle="Manage candidate pipeline" />

      <Box className="card overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Candidate</TableCell>
              <TableCell>Match</TableCell>
              <TableCell>Resume</TableCell>
              <TableCell>ATS</TableCell>
              <TableCell>Stage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((app) => (
              <TableRow key={app._id}>
                <TableCell>
                  <Typography fontWeight={500}>{app.candidateId?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{app.candidateId?.email}</Typography>
                </TableCell>
                <TableCell><Chip label={`${app.matchScore}%`} size="small" color="primary" /></TableCell>
                <TableCell>{app.resumeScore}</TableCell>
                <TableCell>{app.atsScore}</TableCell>
                <TableCell>
                  <Select
                    size="small"
                    value={app.status}
                    onChange={(e) => updateMutation.mutate({ id: app._id, status: e.target.value })}
                  >
                    {stages.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
