import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Typography, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AssessmentResults() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['assessment-results', id],
    queryFn: () => api.get(`/assessments/${id}/results`).then((r) => r.data.data),
    retry: false,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box className="pt-16">
      <PageHeader title="Assessment Results" subtitle={data?.assessment?.title} />

      <Box className="card overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Candidate</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Submissions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.rankings?.map((r, i) => (
              <TableRow key={r.candidate._id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{r.candidate.name}</TableCell>
                <TableCell>{r.totalScore}</TableCell>
                <TableCell>{r.submissions.length}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
