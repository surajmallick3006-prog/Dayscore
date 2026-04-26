const express = require('express');
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// AI Service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// @route   GET /api/ai/health-check
// @desc    Check AI service health (public endpoint)
// @access  Public
router.get('/health-check', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`, {
      timeout: 5000
    });
    
    res.json({
      aiService: response.data,
      proxy: {
        status: 'healthy',
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ AI service health check failed:', error.message);
    res.status(503).json({
      message: 'AI service unavailable',
      error: 'AI_SERVICE_UNAVAILABLE'
    });
  }
});

// @route   GET /api/ai/demo-analysis
// @desc    Get demo AI analysis (public endpoint for testing)
// @access  Public
router.get('/demo-analysis', async (req, res) => {
  try {
    console.log('🤖 Fetching demo AI analysis from Python service...');
    
    // Call the Python AI service demo endpoint
    const response = await axios.get(`${AI_SERVICE_URL}/demo-analysis`, {
      timeout: 10000 // 10 second timeout
    });
    
    console.log('✅ Demo AI analysis received successfully');
    
    // Transform the response to match the expected format
    const analysis = {
      dayScore: response.data.day_score,
      dayType: response.data.day_type,
      burnoutRisk: response.data.burnout_risk,
      keyScoreDrivers: response.data.key_score_drivers,
      dailyInsights: response.data.daily_insights,
      actionableRecommendations: response.data.actionable_recommendations,
      weeklyTrendInsight: response.data.weekly_trend_insight
    };
    
    res.json({ analysis });
    
  } catch (error) {
    console.error('❌ Demo AI service error:', error.message);
    
    // Fallback to mock data if AI service is unavailable
    const fallbackAnalysis = {
      dayScore: 78,
      dayType: 'BALANCED',
      burnoutRisk: 'LOW',
      keyScoreDrivers: [
        'Good sleep quality (7.2 hours)',
        'Completed 4 out of 6 tasks',
        'Maintained moderate stress levels',
        'Balanced screen time usage'
      ],
      dailyInsights: [
        'Your productivity is on track with a solid completion rate of 67%.',
        'Sleep quality is excellent - this is supporting your energy levels.',
        'Screen time balance is good with more productive than recreational usage.',
        'Stress levels are manageable, contributing to overall well-being.'
      ],
      actionableRecommendations: [
        'Try to complete 1-2 more tasks tomorrow to reach your daily goal',
        'Maintain your current sleep schedule as it\'s working well',
        'Consider a 15-minute walk to boost your step count',
        'Keep up the balanced approach to screen time'
      ],
      weeklyTrendInsight: 'Your performance has been consistent this week with a slight upward trend. Focus on maintaining your current habits while making small improvements in task completion.'
    };
    
    res.json({ analysis: fallbackAnalysis });
  }
});

// @route   GET /api/ai/python-analysis
// @desc    Get AI analysis from Python service
// @access  Private
router.get('/python-analysis', authenticateToken, async (req, res) => {
  try {
    console.log('🤖 Fetching AI analysis from Python service...');
    
    // Call the Python AI service demo endpoint
    const response = await axios.get(`${AI_SERVICE_URL}/demo-analysis`, {
      timeout: 10000 // 10 second timeout
    });
    
    console.log('✅ AI analysis received successfully');
    
    // Transform the response to match the expected format
    const analysis = {
      dayScore: response.data.day_score,
      dayType: response.data.day_type,
      burnoutRisk: response.data.burnout_risk,
      keyScoreDrivers: response.data.key_score_drivers,
      dailyInsights: response.data.daily_insights,
      actionableRecommendations: response.data.actionable_recommendations,
      weeklyTrendInsight: response.data.weekly_trend_insight
    };
    
    res.json({ analysis });
    
  } catch (error) {
    console.error('❌ AI service error:', error.message);
    
    // Fallback to mock data if AI service is unavailable
    const fallbackAnalysis = {
      dayScore: 78,
      dayType: 'BALANCED',
      burnoutRisk: 'LOW',
      keyScoreDrivers: [
        'Good sleep quality (7.2 hours)',
        'Completed 4 out of 6 tasks',
        'Maintained moderate stress levels',
        'Balanced screen time usage'
      ],
      dailyInsights: [
        'Your productivity is on track with a solid completion rate of 67%.',
        'Sleep quality is excellent - this is supporting your energy levels.',
        'Screen time balance is good with more productive than recreational usage.',
        'Stress levels are manageable, contributing to overall well-being.'
      ],
      actionableRecommendations: [
        'Try to complete 1-2 more tasks tomorrow to reach your daily goal',
        'Maintain your current sleep schedule as it\'s working well',
        'Consider a 15-minute walk to boost your step count',
        'Keep up the balanced approach to screen time'
      ],
      weeklyTrendInsight: 'Your performance has been consistent this week with a slight upward trend. Focus on maintaining your current habits while making small improvements in task completion.'
    };
    
    res.json({ analysis: fallbackAnalysis });
  }
});

// @route   POST /api/ai/analyze
// @desc    Analyze user data with Python AI service
// @access  Private
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    console.log('🤖 Sending user data to AI service for analysis...');
    
    // Forward the request to Python AI service
    const response = await axios.post(`${AI_SERVICE_URL}/analyze`, req.body, {
      timeout: 15000, // 15 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ AI analysis completed successfully');
    
    // Transform the response to match the expected format
    const analysis = {
      dayScore: response.data.day_score,
      dayType: response.data.day_type,
      burnoutRisk: response.data.burnout_risk,
      keyScoreDrivers: response.data.key_score_drivers,
      dailyInsights: response.data.daily_insights,
      actionableRecommendations: response.data.actionable_recommendations,
      weeklyTrendInsight: response.data.weekly_trend_insight
    };
    
    res.json({ analysis });
    
  } catch (error) {
    console.error('❌ AI analysis error:', error.message);
    res.status(500).json({
      message: 'AI analysis failed',
      error: 'AI_SERVICE_ERROR'
    });
  }
});

// @route   GET /api/ai/health
// @desc    Check AI service health
// @access  Private
router.get('/health', authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`, {
      timeout: 5000
    });
    
    res.json({
      aiService: response.data,
      proxy: {
        status: 'healthy',
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ AI service health check failed:', error.message);
    res.status(503).json({
      message: 'AI service unavailable',
      error: 'AI_SERVICE_UNAVAILABLE'
    });
  }
});

// @route   GET /api/ai/insights/burnout-patterns
// @desc    Get burnout pattern insights
// @access  Private
router.get('/insights/burnout-patterns', authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/insights/burnout-patterns`, {
      timeout: 5000
    });
    
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ Burnout patterns request failed:', error.message);
    res.status(500).json({
      message: 'Failed to fetch burnout patterns',
      error: 'AI_SERVICE_ERROR'
    });
  }
});

// @route   GET /api/ai/insights/optimal-performance
// @desc    Get optimal performance insights
// @access  Private
router.get('/insights/optimal-performance', authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/insights/optimal-performance`, {
      timeout: 5000
    });
    
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ Optimal performance request failed:', error.message);
    res.status(500).json({
      message: 'Failed to fetch performance insights',
      error: 'AI_SERVICE_ERROR'
    });
  }
});

// @route   GET /api/ai/analytics/overview
// @desc    Get analytics overview from Python AI service (user-specific)
// @access  Private
router.get('/analytics/overview', authenticateToken, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const userId = req.user.id;
    
    const response = await axios.get(`${AI_SERVICE_URL}/analytics/user-overview/${userId}?period=${period}`, {
      timeout: 10000
    });
    
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ User analytics overview request failed:', error.message);
    
    // Fallback to generic analytics
    try {
      const fallbackResponse = await axios.get(`${AI_SERVICE_URL}/analytics/overview?period=${period}`, {
        timeout: 5000
      });
      res.json(fallbackResponse.data);
    } catch (fallbackError) {
      res.status(500).json({
        message: 'Failed to fetch analytics overview',
        error: 'AI_SERVICE_ERROR'
      });
    }
  }
});

// @route   GET /api/ai/analytics/productivity-trends
// @desc    Get productivity trends analysis (user-specific)
// @access  Private
router.get('/analytics/productivity-trends', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user.id;
    
    const response = await axios.get(`${AI_SERVICE_URL}/analytics/user-productivity/${userId}?days=${days}`, {
      timeout: 10000
    });
    
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ User productivity trends request failed:', error.message);
    
    // Fallback to generic analytics
    try {
      const fallbackResponse = await axios.get(`${AI_SERVICE_URL}/analytics/productivity-trends?days=${days}`, {
        timeout: 5000
      });
      res.json(fallbackResponse.data);
    } catch (fallbackError) {
      res.status(500).json({
        message: 'Failed to fetch productivity trends',
        error: 'AI_SERVICE_ERROR'
      });
    }
  }
});

// @route   GET /api/ai/analytics/health-patterns
// @desc    Get health patterns analysis (user-specific)
// @access  Private
router.get('/analytics/health-patterns', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user.id;
    
    const response = await axios.get(`${AI_SERVICE_URL}/analytics/user-health/${userId}?days=${days}`, {
      timeout: 10000
    });
    
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ User health patterns request failed:', error.message);
    
    // Fallback to generic analytics
    try {
      const fallbackResponse = await axios.get(`${AI_SERVICE_URL}/analytics/health-patterns?days=${days}`, {
        timeout: 5000
      });
      res.json(fallbackResponse.data);
    } catch (fallbackError) {
      res.status(500).json({
        message: 'Failed to fetch health patterns',
        error: 'AI_SERVICE_ERROR'
      });
    }
  }
});

// @route   GET /api/ai/analytics/focus-analysis
// @desc    Get focus analysis (user-specific)
// @access  Private
router.get('/analytics/focus-analysis', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user.id;
    
    const response = await axios.get(`${AI_SERVICE_URL}/analytics/user-focus/${userId}?days=${days}`, {
      timeout: 10000
    });
    
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ User focus analysis request failed:', error.message);
    
    // Fallback to generic analytics
    try {
      const fallbackResponse = await axios.get(`${AI_SERVICE_URL}/analytics/focus-analysis?days=${days}`, {
        timeout: 5000
      });
      res.json(fallbackResponse.data);
    } catch (fallbackError) {
      res.status(500).json({
        message: 'Failed to fetch focus analysis',
        error: 'AI_SERVICE_ERROR'
      });
    }
  }
});

// @route   GET /api/ai/analytics/mood-wellness
// @desc    Get mood and wellness analysis (user-specific)
// @access  Private
router.get('/analytics/mood-wellness', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user.id;
    
    const response = await axios.get(`${AI_SERVICE_URL}/analytics/user-mood/${userId}?days=${days}`, {
      timeout: 10000
    });
    
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ User mood wellness request failed:', error.message);
    
    // Fallback to generic analytics
    try {
      const fallbackResponse = await axios.get(`${AI_SERVICE_URL}/analytics/mood-wellness?days=${days}`, {
        timeout: 5000
      });
      res.json(fallbackResponse.data);
    } catch (fallbackError) {
      res.status(500).json({
        message: 'Failed to fetch mood wellness analysis',
        error: 'AI_SERVICE_ERROR'
      });
    }
  }
});

// @route   GET /api/ai/analytics/performance-predictions
// @desc    Get performance predictions (user-specific)
// @access  Private
router.get('/analytics/performance-predictions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const response = await axios.get(`${AI_SERVICE_URL}/analytics/user-predictions/${userId}`, {
      timeout: 10000
    });
    
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ User performance predictions request failed:', error.message);
    
    // Fallback to generic analytics
    try {
      const fallbackResponse = await axios.get(`${AI_SERVICE_URL}/analytics/performance-predictions`, {
        timeout: 5000
      });
      res.json(fallbackResponse.data);
    } catch (fallbackError) {
      res.status(500).json({
        message: 'Failed to fetch performance predictions',
        error: 'AI_SERVICE_ERROR'
      });
    }
  }
});

// @route   GET /api/ai/analytics/weekly-report
// @desc    Get weekly performance report (user-specific)
// @access  Private
router.get('/analytics/weekly-report', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const response = await axios.get(`${AI_SERVICE_URL}/analytics/user-weekly-report/${userId}`, {
      timeout: 10000
    });
    
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ User weekly report request failed:', error.message);
    
    // Fallback to generic analytics
    try {
      const fallbackResponse = await axios.get(`${AI_SERVICE_URL}/analytics/weekly-report`, {
        timeout: 5000
      });
      res.json(fallbackResponse.data);
    } catch (fallbackError) {
      res.status(500).json({
        message: 'Failed to fetch weekly report',
        error: 'AI_SERVICE_ERROR'
      });
    }
  }
});

// @route   GET /api/ai/analytics/goal-tracking
// @desc    Get goal tracking analysis (user-specific)
// @access  Private
router.get('/analytics/goal-tracking', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const response = await axios.get(`${AI_SERVICE_URL}/analytics/user-goals/${userId}`, {
      timeout: 10000
    });
    
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ User goal tracking request failed:', error.message);
    
    // Fallback to generic analytics
    try {
      const fallbackResponse = await axios.get(`${AI_SERVICE_URL}/analytics/goal-tracking`, {
        timeout: 5000
      });
      res.json(fallbackResponse.data);
    } catch (fallbackError) {
      res.status(500).json({
        message: 'Failed to fetch goal tracking',
        error: 'AI_SERVICE_ERROR'
      });
    }
  }
});

module.exports = router;