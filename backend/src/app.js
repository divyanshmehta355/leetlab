const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const authRoutes = require('./routes/authRoutes');
const problemRoutes = require('./routes/problemRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const solutionRoutes = require('./routes/solutionRoutes');
const profileRoutes = require('./routes/profileRoutes');
const userRoutes = require('./routes/userRoutes');

// Routes will be mounted here
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api', solutionRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/users', userRoutes);

// Central error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  // Serve static files from the React frontend app
  app.use(express.static(path.join(__dirname, '../../../frontend/dist')));
  
  // Anything that doesn't match the API routes should be handled by React Router
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontend/dist/index.html'));
  });
}

module.exports = app;
