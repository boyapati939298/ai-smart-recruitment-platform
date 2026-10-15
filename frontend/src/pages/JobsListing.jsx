import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, TextField, MenuItem, Grid } from '@mui/material';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function JobsListing() {
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', search, jobType],
    queryFn: () => api.get('/jobs', { params: { search, jobType, limit: 20 } }).then((r) => r.data.data),
  });

  return (
    <Box className="pt-16">
      <PageHeader title="Job Listings" subtitle="Find your next opportunity" />

      <Box className="card mb-6 flex gap-4 flex-wrap">
        <TextField
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <TextField select label="Job Type" value={jobType} onChange={(e) => setJobType(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="full-time">Full Time</MenuItem>
          <MenuItem value="part-time">Part Time</MenuItem>
          <MenuItem value="remote">Remote</MenuItem>
          <MenuItem value="contract">Contract</MenuItem>
          <MenuItem value="internship">Internship</MenuItem>
        </TextField>
      </Box>

      {isLoading ? <LoadingSpinner /> : (
        <Grid container spacing={3}>
          {data?.map((job) => (
            <Grid item xs={12} md={6} lg={4} key={job._id}>
              <JobCard job={job} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
