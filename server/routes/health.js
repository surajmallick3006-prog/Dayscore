const express = require('express');
const HealthData = require('../models/HealthData');
const { authenticateToken } = require('../middleware/auth');
const { validateHealthData } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/health
// @desc    Get health data
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const healthData = await HealthData.findOne({
      userId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    res.json({ healthData });
  } catch (error) {
    console.error('Get health data error:', error);
    res.status(500).json({ message: 'Failed to fetch health data' });
  }
});

// @route   POST /api/health
// @desc    Create or update health data
// @access  Private
router.post('/', authenticateToken, validateHealthData, async (req, res) => {
  try {
    const { date, ...healthInfo } = req.body;
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    let healthData = await HealthData.findOne({
      userId: req.user._id,
      date: targetDate
    });

    if (healthData) {
      Object.assign(healthData, healthInfo);
    } else {
      healthData = new HealthData({
        userId: req.user._id,
        date: targetDate,
        ...healthInfo
      });
    }

    healthData.calculateScores();
    await healthData.save();

    res.json({ message: 'Health data saved', healthData });
  } catch (error) {
    console.error('Save health data error:', error);
    res.status(500).json({ message: 'Failed to save health data' });
  }
});

module.exports = router;