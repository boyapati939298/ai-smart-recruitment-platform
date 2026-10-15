import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Typography, Box, TextField, MenuItem, Chip, Alert } from '@mui/material';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';

const categories = ['technical', 'hr', 'behavioral', 'aptitude', 'system_design', 'coding'];

export default function InterviewPrep() {
  const [category, setCategory] = useState('technical');
  const [answers, setAnswers] = useState({});

  const { data: saved } = useQuery({
    queryKey: ['interview-questions'],
    queryFn: () => api.get('/ai/interview-questions').then((r) => r.data.data),
  });

  const generateMutation = useMutation({
    mutationFn: () => api.post('/ai/interview-questions', { category, count: 5 }),
  });

  const evaluateMutation = useMutation({
    mutationFn: ({ question, answer }) => api.post('/ai/evaluate-answer', { question, answer }),
  });

  const questions = generateMutation.data?.data?.questions || saved?.[0]?.questions || [];

  return (
    <Box className="pt-16">
      <PageHeader title="Interview Preparation" subtitle="AI-generated personalized interview questions" />

      <Box className="card mb-6 flex gap-4 flex-wrap items-end">
        <TextField select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 200 }}>
          {categories.map((c) => <MenuItem key={c} value={c}>{c.replace('_', ' ')}</MenuItem>)}
        </TextField>
        <button onClick={() => generateMutation.mutate()} className="btn-primary" disabled={generateMutation.isPending}>
          {generateMutation.isPending ? 'Generating...' : 'Generate Questions'}
        </button>
      </Box>

      {questions.map((q, i) => (
        <Box key={i} className="card mb-4">
          <Box className="flex gap-2 mb-2">
            <Chip label={q.difficulty || 'medium'} size="small" />
          </Box>
          <Typography fontWeight={600} className="mb-3">{q.question}</Typography>
          <TextField
            fullWidth multiline rows={3} placeholder="Your answer..."
            value={answers[i] || ''}
            onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
          />
          <button
            className="btn-secondary mt-2"
            onClick={() => evaluateMutation.mutate({ question: q.question, answer: answers[i] })}
          >
            Get AI Feedback
          </button>
          {evaluateMutation.data?.data?.feedback && answers[i] && (
            <Alert severity="info" className="mt-2">
              Score: {evaluateMutation.data.data.score}/100 — {evaluateMutation.data.data.feedback}
            </Alert>
          )}
        </Box>
      ))}
    </Box>
  );
}
