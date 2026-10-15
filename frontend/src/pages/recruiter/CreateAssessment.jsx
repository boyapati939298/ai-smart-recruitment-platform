import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Typography, Box, TextField, MenuItem, Checkbox, FormControlLabel, Alert } from '@mui/material';
import api from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CreateAssessment() {
  const { register, handleSubmit } = useForm({ defaultValues: { difficulty: 'medium', duration: 60 } });
  const navigate = useNavigate();
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const { data: questions, isLoading } = useQuery({
    queryKey: ['coding-questions'],
    queryFn: () => api.get('/assessments/questions').then((r) => r.data.data),
  });

  const mutation = useMutation({
    mutationFn: (data) => api.post('/assessments', {
      ...data,
      duration: Number(data.duration),
      questions: selectedQuestions.map((qId, i) => ({ questionId: qId, points: 10, order: i + 1 })),
    }),
    onSuccess: () => navigate('/assessments'),
  });

  const toggleQuestion = (id) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box className="pt-16 max-w-2xl">
      <PageHeader title="Create Assessment" subtitle="Build a coding assessment for candidates" />

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="card space-y-4">
        <TextField fullWidth label="Title" {...register('title', { required: true })} />
        <TextField fullWidth multiline rows={3} label="Description" {...register('description')} />
        <TextField select fullWidth label="Difficulty" defaultValue="medium" {...register('difficulty')}>
          <MenuItem value="easy">Easy</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="hard">Hard</MenuItem>
        </TextField>
        <TextField fullWidth type="number" label="Duration (minutes)" {...register('duration')} />

        <Typography variant="h6" fontWeight={600}>Select Questions</Typography>
        {questions?.map((q) => (
          <FormControlLabel
            key={q._id}
            control={<Checkbox checked={selectedQuestions.includes(q._id)} onChange={() => toggleQuestion(q._id)} />}
            label={`${q.title} (${q.difficulty})`}
          />
        ))}

        {mutation.error && <Alert severity="error">{mutation.error.response?.data?.message}</Alert>}

        <button type="submit" className="btn-primary" disabled={mutation.isPending || !selectedQuestions.length}>
          Create Assessment
        </button>
      </form>
    </Box>
  );
}
