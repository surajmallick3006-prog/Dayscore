const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const timeTrackerRoutes = require('./routes/timeTracker');
const healthRoutes = require('./routes/health');
const moodRoutes = require('./routes/mood');
const screenTimeRoutes = require('./routes/screenTime');
const dayScoreRoutes = require('./routes/dayScore');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dayscore')
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/timetracker', timeTrackerRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/screentime', screenTimeRoutes);
app.use('/api/dayscore', dayScoreRoutes);
app.use('/api/analytics', analyticsRoutes);



// Fallback for database unavailable
app.use((err, req, res, next) => {
  if (err.name === 'MongooseError' || err.message.includes('MongoDB')) {
    return res.status(503).json({
      error: 'DATABASE_UNAVAILABLE',
      message: 'Database is temporarily unavailable. Please try again later.'
    });
  }
  next(err);
});

// Health check endpoint
app.get('/api/health-check', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});