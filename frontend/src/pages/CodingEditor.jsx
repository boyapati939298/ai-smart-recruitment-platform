import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Typography, Box, MenuItem, TextField, Alert, Chip } from '@mui/material';
import Editor from '@monaco-editor/react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const languages = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
  { id: 'c', label: 'C' },
];

const defaultCode = {
  javascript: 'function solution() {\n  // Write your code here\n  console.log("Hello");\n}',
  python: 'def solution():\n    # Write your code here\n    print("Hello")',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello");\n    }\n}',
  cpp: '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello" << endl;\n    return 0;\n}',
  c: '#include <stdio.h>\nint main() {\n    printf("Hello\\n");\n    return 0;\n}',
};

export default function CodingEditor() {
  const { id } = useParams();
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(defaultCode.javascript);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [output, setOutput] = useState('');

  const { data: assessment, isLoading } = useQuery({
    queryKey: ['assessment', id],
    queryFn: () => api.get(`/assessments/${id}`).then((r) => r.data.data),
  });

  const runMutation = useMutation({
    mutationFn: () => api.post('/submissions/run', { code, language }),
    onSuccess: (res) => setOutput(res.data.data.stdout || res.data.data.stderr || 'No output'),
  });

  const submitMutation = useMutation({
    mutationFn: (questionId) => api.post('/submissions/submit', {
      assessmentId: id,
      questionId,
      code,
      language,
    }),
  });

  if (isLoading) return <LoadingSpinner />;

  const questions = assessment?.questions || [];
  const currentQ = questions[activeQuestion]?.questionId;

  return (
    <Box className="pt-16">
      <Typography variant="h5" fontWeight={700} className="mb-4">{assessment.title}</Typography>

      <Box className="flex gap-2 mb-4 flex-wrap">
        {questions.map((q, i) => (
          <Chip
            key={i}
            label={`Q${i + 1}`}
            onClick={() => setActiveQuestion(i)}
            color={activeQuestion === i ? 'primary' : 'default'}
            variant={activeQuestion === i ? 'filled' : 'outlined'}
          />
        ))}
      </Box>

      <Box className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Box className="card">
          <Typography variant="h6" fontWeight={600}>{currentQ?.title}</Typography>
          <Chip label={currentQ?.difficulty} size="small" className="my-2" />
          <Typography className="whitespace-pre-wrap mt-2">{currentQ?.problemStatement}</Typography>
        </Box>

        <Box>
          <Box className="flex gap-2 mb-2">
            <TextField select size="small" value={language} onChange={(e) => {
              setLanguage(e.target.value);
              setCode(defaultCode[e.target.value]);
            }} sx={{ minWidth: 140 }}>
              {languages.map((l) => <MenuItem key={l.id} value={l.id}>{l.label}</MenuItem>)}
            </TextField>
            <button onClick={() => runMutation.mutate()} className="btn-secondary" disabled={runMutation.isPending}>
              Run Code
            </button>
            <button
              onClick={() => submitMutation.mutate(currentQ?._id)}
              className="btn-primary"
              disabled={submitMutation.isPending}
            >
              Submit
            </button>
          </Box>

          <Box className="border rounded-lg overflow-hidden" style={{ height: 400 }}>
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={setCode}
              theme="vs-dark"
              options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true }}
            />
          </Box>

          {output && (
            <Box className="card mt-2">
              <Typography variant="subtitle2">Output</Typography>
              <pre className="text-sm mt-1 whitespace-pre-wrap">{output}</pre>
            </Box>
          )}

          {submitMutation.data && (
            <Alert severity={submitMutation.data.data.data.status === 'accepted' ? 'success' : 'warning'} className="mt-2">
              Score: {submitMutation.data.data.data.score}/{submitMutation.data.data.data.maxScore} —
              {submitMutation.data.data.data.testsPassed}/{submitMutation.data.data.data.totalTests} tests passed
            </Alert>
          )}
        </Box>
      </Box>
    </Box>
  );
}
