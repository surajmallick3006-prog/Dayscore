const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const Task = require('../models/Task');
const MoodLog = require('../models/MoodLog');
const HealthData = require('../models/HealthData');
const TimeLog = require('../models/TimeLog');
const ScreenTime = require('../models/ScreenTime');
const DayScore = require('../models/DayScore');

const router = express.Router();

// @route   GET /api/data/profile
// @desc    Get user profile data
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/data/day-scores
// @desc    Get user day scores for date range
// @access  Private
router.get('/day-scores', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, days = 30 } = req.query;
    
    let startDate, endDate;
    
    if (start_date && end_date) {
      startDate = new Date(start_date);
      endDate = new Date(end_date);
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
    }
    
    const dayScores = await DayScore.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });
    
    res.json(dayScores);
  } catch (error) {
    console.error('Error fetching day scores:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/data/tasks
// @desc    Get user tasks for date range
// @access  Private
router.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, days = 30 } = req.query;
    
    let startDate, endDate;
    
    if (start_date && end_date) {
      startDate = new Date(start_date);
      endDate = new Date(end_date);
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
    }
    
    const tasks = await Task.find({
      userId: req.user.id,
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/data/mood-logs
// @desc    Get user mood logs for date range
// @access  Private
router.get('/mood-logs', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, days = 30 } = req.query;
    
    let startDate, endDate;
    
    if (start_date && end_date) {
      startDate = new Date(start_date);
      endDate = new Date(end_date);
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
    }
    
    const moodLogs = await MoodLog.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });
    
    res.json(moodLogs);
  } catch (error) {
    console.error('Error fetching mood logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/data/health-data
// @desc    Get user health data for date range
// @access  Private
router.get('/health-data', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, days = 30 } = req.query;
    
    let startDate, endDate;
    
    if (start_date && end_date) {
      startDate = new Date(start_date);
      endDate = new Date(end_date);
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
    }
    
    const healthData = await HealthData.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });
    
    res.json(healthData);
  } catch (error) {
    console.error('Error fetching health data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/data/time-logs
// @desc    Get user time logs for date range
// @access  Private
router.get('/time-logs', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, days = 30 } = req.query;
    
    let startDate, endDate;
    
    if (start_date && end_date) {
      startDate = new Date(start_date);
      endDate = new Date(end_date);
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
    }
    
    const timeLogs = await TimeLog.find({
      userId: req.user.id,
      startTime: { $gte: startDate, $lte: endDate }
    }).sort({ startTime: -1 });
    
    res.json(timeLogs);
  } catch (error) {
    console.error('Error fetching time logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/data/screen-time
// @desc    Get user screen time data for date range
// @access  Private
router.get('/screen-time', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, days = 30 } = req.query;
    
    let startDate, endDate;
    
    if (start_date && end_date) {
      startDate = new Date(start_date);
      endDate = new Date(end_date);
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
    }
    
    const screenTime = await ScreenTime.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });
    
    res.json(screenTime);
  } catch (error) {
    console.error('Error fetching screen time:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/data/comprehensive
// @desc    Get all user data for comprehensive analysis
// @access  Private
router.get('/comprehensive', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Fetch all data in parallel
    const [user, dayScores, tasks, moodLogs, healthData, timeLogs, screenTime] = await Promise.all([
      User.findById(req.user.id).select('-password'),
      DayScore.find({
        userId: req.user.id,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: -1 }),
      Task.find({
        userId: req.user.id,
        createdAt: { $gte: startDate, $lte: endDate }
      }).sort({ createdAt: -1 }),
      MoodLog.find({
        userId: req.user.id,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: -1 }),
      HealthData.find({
        userId: req.user.id,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: -1 }),
      TimeLog.find({
        userId: req.user.id,
        startTime: { $gte: startDate, $lte: endDate }
      }).sort({ startTime: -1 }),
      ScreenTime.find({
        userId: req.user.id,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: -1 })
    ]);
    
    res.json({
      user_profile: user,
      day_scores: dayScores,
      tasks: tasks,
      mood_logs: moodLogs,
      health_data: healthData,
      time_logs: timeLogs,
      screen_time: screenTime,
      date_range: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        days: parseInt(days)
      }
    });
  } catch (error) {
    console.error('Error fetching comprehensive data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/data/analytics-summary
// @desc    Get analytics summary for user
// @access  Private
router.get('/analytics-summary', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Get summary statistics
    const [
      taskStats,
      moodStats,
      healthStats,
      dayScoreStats
    ] = await Promise.all([
      Task.getCompletionStats(req.user.id, startDate, endDate),
      MoodLog.getMoodStats(req.user.id, parseInt(days)),
      HealthData.getAverageMetrics(req.user.id, parseInt(days)),
      DayScore.getAverageScores(req.user.id, parseInt(days))
    ]);
    
    res.json({
      period: `${days} days`,
      task_stats: taskStats,
      mood_stats: moodStats,
      health_stats: healthStats,
      day_score_stats: dayScoreStats,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;