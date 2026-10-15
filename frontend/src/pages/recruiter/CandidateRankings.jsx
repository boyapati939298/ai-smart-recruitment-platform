import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Typography, Box, Chip, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CandidateRankings() {
  const { jobId } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['rankings', jobId],
    queryFn: () => api.get(`/recruiters/jobs/${jobId}/rankings`).then((r) => r.data.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box className="pt-16">
      <PageHeader title="AI Candidate Rankings" subtitle="Ranked by resume, match, assessment, and experience scores" />

      <Box className="card overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>Candidate</TableCell>
              <TableCell>Overall Score</TableCell>
              <TableCell>Match</TableCell>
              <TableCell>Resume</TableCell>
              <TableCell>Recommendation</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((app) => (
              <TableRow key={app._id}>
                <TableCell>#{app.rank}</TableCell>
                <TableCell>{app.candidateId?.name}</TableCell>
                <TableCell><Chip label={app.overallScore} color="primary" size="small" /></TableCell>
                <TableCell>{app.matchScore}%</TableCell>
                <TableCell>{app.resumeScore}</TableCell>
                <TableCell><Chip label={app.recommendation} size="small" color="success" variant="outlined" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!data?.length && <Typography className="p-4 text-center text-gray-500">No applicants to rank</Typography>}
      </Box>
    </Box>
  );
}
