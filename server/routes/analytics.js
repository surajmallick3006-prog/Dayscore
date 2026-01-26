const express = require('express');
const DayScore = require('../models/DayScore');
const Task = require('../models/Task');
const TimeLog = require('../models/TimeLog');
const HealthData = require('../models/HealthData');
const MoodLog = require('../models/MoodLog');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/overview
// @desc    Get analytics overview
// @access  Private
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let days;
    switch (period) {
      case 'week': days = 7; break;
      case 'month': days = 30; break;
      case '3months': days = 90; break;
      default: days = 30;
    }

    const [
      scoreAverages,
      bestWorstDays,
      healthAverages,
      moodStats
    ] = await Promise.all([
      DayScore.getAverageScores(req.user._id, days),
      DayScore.getBestWorstDays(req.user._id, days),
      HealthData.getAverageMetrics(req.user._id, days),
      MoodLog.getMoodStats(req.user._id, days)
    ]);

    res.json({
      period,
      scoreAverages,
      bestWorstDays,
      healthAverages,
      moodStats
    });
  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics overview' });
  }
});

module.exports = router;