const express = require('express');
const TimeLog = require('../models/TimeLog');
const { authenticateToken } = require('../middleware/auth');
const { validateTimeLog } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/timetracker
// @desc    Get time logs
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { date, type, limit = 50 } = req.query;
    
    const filter = { userId: req.user._id };
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.startTime = { $gte: startOfDay, $lte: endOfDay };
    }
    
    if (type) filter.type = type;

    const timeLogs = await TimeLog.find(filter)
      .sort({ startTime: -1 })
      .limit(parseInt(limit))
      .populate('taskId', 'title');

    res.json({ timeLogs });
  } catch (error) {
    console.error('Get time logs error:', error);
    res.status(500).json({ message: 'Failed to fetch time logs' });
  }
});

// @route   POST /api/timetracker
// @desc    Create time log
// @access  Private
router.post('/', authenticateToken, validateTimeLog, async (req, res) => {
  try {
    const timeLog = new TimeLog({
      ...req.body,
      userId: req.user._id
    });

    await timeLog.save();
    res.status(201).json({ message: 'Time log created', timeLog });
  } catch (error) {
    console.error('Create time log error:', error);
    res.status(500).json({ message: 'Failed to create time log' });
  }
});

// @route   GET /api/timetracker/stats
// @desc    Get time tracking statistics
// @access  Private
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const stats = await TimeLog.getDailyStats(req.user._id, targetDate);
    
    res.json({ stats, date: targetDate });
  } catch (error) {
    console.error('Get time stats error:', error);
    res.status(500).json({ message: 'Failed to fetch time statistics' });
  }
});

module.exports = router;