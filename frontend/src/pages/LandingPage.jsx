import { Link } from 'react-router-dom';
import { Box, Typography, Button, Grid, Container } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CodeIcon from '@mui/icons-material/Code';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VideoCallIcon from '@mui/icons-material/VideoCall';

const features = [
  { icon: <SmartToyIcon fontSize="large" />, title: 'AI Resume Screening', desc: 'Automated resume analysis with ATS scoring and skill extraction.' },
  { icon: <AssessmentIcon fontSize="large" />, title: 'Smart ATS Pipeline', desc: 'Track candidates from applied to hired with AI-powered ranking.' },
  { icon: <CodeIcon fontSize="large" />, title: 'Coding Assessments', desc: 'Monaco editor with Judge0 execution and automated evaluation.' },
  { icon: <VideoCallIcon fontSize="large" />, title: 'Video Interviews', desc: 'WebRTC-powered interviews with screen sharing and AI questions.' },
];

export default function LandingPage() {
  return (
    <Box>
      <Box className="bg-gradient-to-br from-primary-600 via-primary-700 to-purple-800 text-white">
        <Container maxWidth="lg" className="py-24 md:py-32">
          <Typography variant="h2" fontWeight={800} gutterBottom className="max-w-2xl">
            AI-Powered Smart Recruitment Platform
          </Typography>
          <Typography variant="h6" className="opacity-90 max-w-xl mb-8">
            Hire smarter with AI resume screening, coding assessments, candidate ranking, and interview management — all in one platform.
          </Typography>
          <Box className="flex gap-4 flex-wrap">
            <Button component={Link} to="/register" variant="contained" size="large" sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}>
              Get Started
            </Button>
            <Button component={Link} to="/jobs" variant="outlined" size="large" sx={{ borderColor: 'white', color: 'white' }}>
              Browse Jobs
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" className="py-20">
        <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
          Everything you need to hire top talent
        </Typography>
        <Grid container spacing={4} className="mt-8">
          {features.map((f) => (
            <Grid item xs={12} sm={6} md={3} key={f.title}>
              <Box className="card text-center h-full">
                <Box className="text-primary-600 mb-4">{f.icon}</Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>{f.title}</Typography>
                <Typography color="text.secondary">{f.desc}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box className="bg-slate-100 py-16">
        <Container maxWidth="md" className="text-center">
          <Typography variant="h4" fontWeight={700} gutterBottom>Ready to transform your hiring?</Typography>
          <Button component={Link} to="/register" variant="contained" size="large" className="mt-4">
            Create Free Account
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
