const express = require('express');
const ScreenTime = require('../models/ScreenTime');
const { authenticateToken } = require('../middleware/auth');
const { validateScreenTime } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/screentime
// @desc    Get screen time data
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const screenTime = await ScreenTime.getCategoryBreakdown(req.user._id, targetDate);
    
    res.json({ screenTime });
  } catch (error) {
    console.error('Get screen time error:', error);
    res.status(500).json({ message: 'Failed to fetch screen time data' });
  }
});

// @route   POST /api/screentime
// @desc    Create or update screen time data
// @access  Private
router.post('/', authenticateToken, validateScreenTime, async (req, res) => {
  try {
    const { date, ...screenTimeInfo } = req.body;
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    let screenTime = await ScreenTime.findOne({
      userId: req.user._id,
      date: targetDate
    });

    if (screenTime) {
      Object.assign(screenTime, screenTimeInfo);
    } else {
      screenTime = new ScreenTime({
        userId: req.user._id,
        date: targetDate,
        ...screenTimeInfo
      });
    }

    screenTime.calculateScores();
    await screenTime.save();

    res.json({ message: 'Screen time data saved', screenTime });
  } catch (error) {
    console.error('Save screen time error:', error);
    res.status(500).json({ message: 'Failed to save screen time data' });
  }
});

module.exports = router;