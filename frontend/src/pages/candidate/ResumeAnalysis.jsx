import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Typography, Box, LinearProgress, Alert, Chip, List, ListItem, ListItemText } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { Grid } from '@mui/material';

export default function ResumeAnalysis() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['resume-analysis'],
    queryFn: () => api.get('/resume/analysis').then((r) => r.data.data).catch(() => null),
    retry: false,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('resume', file);
      return api.post('/resume/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['resume-analysis']);
      setFile(null);
    },
  });

  const analysis = data?.analysis;

  return (
    <Box className="pt-16">
      <PageHeader title="Resume Analysis" subtitle="Upload your resume for AI-powered analysis" />

      <Box className="card mb-6">
        <Box className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <CloudUploadIcon sx={{ fontSize: 48, color: 'gray' }} />
          <Typography className="my-2">Upload PDF or DOCX (max 5MB)</Typography>
          <input type="file" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files[0])} className="my-2" />
          <button
            onClick={() => uploadMutation.mutate()}
            disabled={!file || uploadMutation.isPending}
            className="btn-primary mt-2"
          >
            {uploadMutation.isPending ? 'Analyzing...' : 'Upload & Analyze'}
          </button>
        </Box>
        {uploadMutation.error && <Alert severity="error" className="mt-4">{uploadMutation.error.message}</Alert>}
      </Box>

      {data && (
        <>
          <Grid container spacing={3} className="mb-6">
            <Grid item xs={12} sm={6}>
              <StatCard title="Resume Score" value={data.resumeScore} color="primary" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatCard title="ATS Compatibility" value={data.atsScore} color="green" />
            </Grid>
          </Grid>

          {analysis && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box className="card">
                  <Typography variant="h6" fontWeight={600} gutterBottom>Extracted Skills</Typography>
                  <Box className="flex flex-wrap gap-2">
                    {analysis.skills?.map((s) => <Chip key={s} label={s} color="primary" variant="outlined" />)}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box className="card">
                  <Typography variant="h6" fontWeight={600} gutterBottom>Missing Skills</Typography>
                  <Box className="flex flex-wrap gap-2">
                    {analysis.missingSkills?.map((s) => <Chip key={s} label={s} color="warning" variant="outlined" />)}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box className="card">
                  <Typography variant="h6" fontWeight={600} gutterBottom>Improvement Suggestions</Typography>
                  <List>
                    {analysis.suggestions?.map((s, i) => (
                      <ListItem key={i}><ListItemText primary={s} /></ListItem>
                    ))}
                  </List>
                </Box>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Box>
  );
}
