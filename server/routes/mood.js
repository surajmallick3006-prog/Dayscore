const express = require('express');
const MoodLog = require('../models/MoodLog');
const { authenticateToken } = require('../middleware/auth');
const { validateMoodLog } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/mood
// @desc    Get mood data
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const moodLog = await MoodLog.findOne({
      userId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    res.json({ moodLog });
  } catch (error) {
    console.error('Get mood data error:', error);
    res.status(500).json({ message: 'Failed to fetch mood data' });
  }
});

// @route   POST /api/mood
// @desc    Create or update mood log
// @access  Private
router.post('/', authenticateToken, validateMoodLog, async (req, res) => {
  try {
    const { date, ...moodInfo } = req.body;
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    let moodLog = await MoodLog.findOne({
      userId: req.user._id,
      date: targetDate
    });

    if (moodLog) {
      Object.assign(moodLog, moodInfo);
    } else {
      moodLog = new MoodLog({
        userId: req.user._id,
        date: targetDate,
        ...moodInfo
      });
    }

    moodLog.calculateWellnessScore();
    await moodLog.save();

    res.json({ message: 'Mood log saved', moodLog });
  } catch (error) {
    console.error('Save mood log error:', error);
    res.status(500).json({ message: 'Failed to save mood log' });
  }
});

module.exports = router;