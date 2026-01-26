const express = require('express');
const DayScoreAI = require('../utils/dayScoreAI');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const dayScoreAI = new DayScoreAI();

// @route   POST /api/ai/analyze-day
// @desc    Analyze today's data and provide AI insights
// @access  Private
router.post('/analyze-day', authenticateToken, async (req, res) => {
  try {
    const {
      todayData,
      historicalData = []
    } = req.body;

    // Get user profile from authenticated user
    const userProfile = {
      scoreWeights: req.user.scoreWeights,
      dailyGoals: req.user.dailyGoals,
      preferences: req.user.preferences
    };

    // Prepare data for AI analysis
    const userData = {
      userProfile,
      todayData,
      historicalData
    };

    // Run AI analysis
    const analysis = dayScoreAI.analyzeDayScore(userData);

    res.json({
      message: 'Day analysis completed successfully',
      analysis
    });
  } catch (error) {
    console.error('AI Analysis error:', error);
    res.status(500).json({
      message: 'Failed to analyze day data',
      error: 'AI_ANALYSIS_ERROR'
    });
  }
});



module.exports = router;