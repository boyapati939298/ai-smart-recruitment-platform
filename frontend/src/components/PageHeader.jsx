import { Typography, Box } from '@mui/material';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary">{subtitle}</Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
