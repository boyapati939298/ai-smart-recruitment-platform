import { useQuery } from '@tanstack/react-query';
import { Typography, Box, Chip, List, ListItem, ListItemText } from '@mui/material';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CareerGuidance() {
  const { data, isLoading } = useQuery({
    queryKey: ['career-guidance'],
    queryFn: () => api.get('/ai/career-guidance').then((r) => r.data.data),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box className="pt-16">
      <PageHeader title="AI Career Guidance" subtitle="Personalized learning paths and recommendations" />

      <Box className="card mb-6">
        <Typography variant="h6" fontWeight={600} gutterBottom>Career Advice</Typography>
        <Typography color="text.secondary">{data?.careerAdvice}</Typography>
      </Box>

      <Box className="card mb-6">
        <Typography variant="h6" fontWeight={600} gutterBottom>Skills to Learn</Typography>
        <Box className="flex flex-wrap gap-2">
          {data?.missingSkills?.map((s) => <Chip key={s} label={s} color="warning" />)}
        </Box>
      </Box>

      <Box className="card mb-6">
        <Typography variant="h6" fontWeight={600} gutterBottom>Learning Paths</Typography>
        <List>
          {data?.learningPaths?.map((lp, i) => (
            <ListItem key={i}>
              <ListItemText
                primary={lp.skill}
                secondary={`${lp.duration} — ${lp.resources?.join(', ')}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Box className="card">
        <Typography variant="h6" fontWeight={600} gutterBottom>Recommended Certifications</Typography>
        <List>
          {data?.recommendedCertifications?.map((cert, i) => (
            <ListItem key={i}>
              <ListItemText primary={cert.name} secondary={cert.provider} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
}
