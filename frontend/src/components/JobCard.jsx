import { Link } from 'react-router-dom';
import { Chip, Typography, Box } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';

export default function JobCard({ job, matchScore }) {
  return (
    <Link to={`/jobs/${job._id}`} className="card block hover:shadow-md transition-shadow no-underline">
      <Box className="flex justify-between items-start mb-2">
        <Box>
          <Typography variant="h6" fontWeight={600} color="text.primary">
            {job.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {job.company}
          </Typography>
        </Box>
        {matchScore !== undefined && (
          <Chip
            label={`${matchScore}% Match`}
            size="small"
            color={matchScore >= 70 ? 'success' : matchScore >= 50 ? 'warning' : 'default'}
          />
        )}
      </Box>
      <Box className="flex flex-wrap gap-2 mb-3">
        {job.skillsRequired?.slice(0, 4).map((skill) => (
          <Chip key={skill} label={skill} size="small" variant="outlined" />
        ))}
      </Box>
      <Box className="flex gap-4 text-sm text-gray-500">
        {job.location && (
          <span className="flex items-center gap-1">
            <LocationOnIcon fontSize="small" /> {job.location}
          </span>
        )}
        <span className="flex items-center gap-1">
          <WorkIcon fontSize="small" /> {job.jobType}
        </span>
      </Box>
    </Link>
  );
}
