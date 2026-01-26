const express = require('express');
const DayScore = require('../models/DayScore');
const Task = require('../models/Task');
const TimeLog = require('../models/TimeLog');
const HealthData = require('../models/HealthData');
const MoodLog = require('../models/MoodLog');
const ScreenTime = require('../models/ScreenTime');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dayscore/today
// @desc    Get today's day score
// @access  Private
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let dayScore = await DayScore.findOne({
      userId: req.user._id,
      date: today
    });

    if (!dayScore) {
      // Calculate and create today's score
      dayScore = await calculateDayScore(req.user._id, today);
    }

    res.json({ dayScore });
  } catch (error) {
    console.error('Get today score error:', error);
    res.status(500).json({
      message: 'Failed to fetch today\'s score',
      error: 'FETCH_SCORE_ERROR'
    });
  }
});

// @route   POST /api/dayscore/calculate
// @desc    Recalculate day score for a specific date
// @access  Private
router.post('/calculate', authenticateToken, async (req, res) => {
  try {
    const { date } = req.body;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const dayScore = await calculateDayScore(req.user._id, targetDate);

    res.json({
      message: 'Day score calculated successfully',
      dayScore
    });
  } catch (error) {
    console.error('Calculate score error:', error);
    res.status(500).json({
      message: 'Failed to calculate day score',
      error: 'CALCULATE_SCORE_ERROR'
    });
  }
});

// @route   GET /api/dayscore/trends
// @desc    Get day score trends
// @access  Private
router.get('/trends', authenticateToken, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    let startDate, endDate;
    const now = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case '3months':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
    }

    const trends = await DayScore.getScoreTrends(req.user._id, startDate, endDate);
    const averages = await DayScore.getAverageScores(req.user._id, 30);

    res.json({
      period,
      trends,
      averages,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({
      message: 'Failed to fetch score trends',
      error: 'TRENDS_ERROR'
    });
  }
});

// Helper function to calculate day score
async function calculateDayScore(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get user for weights
  const User = require('../models/User');
  const user = await User.findById(userId);
  const weights = user.scoreWeights;

  // Initialize day score
  let dayScore = await DayScore.findOne({ userId, date: startOfDay });
  if (!dayScore) {
    dayScore = new DayScore({ userId, date: startOfDay });
  }

  // 1. Calculate Productivity Score
  const taskStats = await Task.getCompletionStats(userId, startOfDay, endOfDay);
  const timeStats = await TimeLog.getDailyStats(userId, date);
  
  let productivityScore = 0;
  
  // Task completion (40% of productivity)
  const taskCompletionScore = Math.min(taskStats.completionRate, 100);
  productivityScore += taskCompletionScore * 0.4;
  
  // Study/Work time (40% of productivity)
  const totalProductiveTime = timeStats.study.duration + timeStats.work.duration;
  const targetProductiveTime = (user.dailyGoals.studyHours + user.dailyGoals.workHours) * 60;
  const timeScore = Math.min((totalProductiveTime / targetProductiveTime) * 100, 100);
  productivityScore += timeScore * 0.4;
  
  // Productivity quality (20% of productivity)
  const qualityScore = timeStats.overallProductivity * 10;
  productivityScore += qualityScore * 0.2;

  dayScore.scores.productivity = Math.round(productivityScore);
  dayScore.breakdown.productivity = {
    tasksCompleted: taskStats.completed,
    taskCompletionRate: taskStats.completionRate,
    studyTime: timeStats.study.duration,
    workTime: timeStats.work.duration,
    productivityRating: timeStats.overallProductivity
  };

  // 2. Calculate Health Score
  const healthData = await HealthData.findOne({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay }
  });

  let healthScore = 0;
  if (healthData) {
    healthData.calculateScores();
    healthScore = healthData.scores.overallHealthScore;
    
    dayScore.breakdown.health = {
      sleepDuration: healthData.sleep.duration,
      sleepQuality: healthData.sleep.quality,
      steps: healthData.activity.steps,
      activeMinutes: healthData.activity.activeMinutes,
      exerciseTime: healthData.activity.exerciseDuration
    };
  }
  dayScore.scores.health = healthScore;

  // 3. Calculate Focus Score
  const screenTimeData = await ScreenTime.findOne({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay }
  });

  let focusScore = 50; // Default
  if (screenTimeData) {
    screenTimeData.calculateScores();
    focusScore = (screenTimeData.scores.focusScore + screenTimeData.scores.balanceScore) / 2;
    
    dayScore.breakdown.focus = {
      screenTime: screenTimeData.totalScreenTime,
      productiveScreenTime: screenTimeData.categories.productivity,
      distractions: screenTimeData.distractions.count,
      focusQuality: timeStats.overallFocus
    };
  }
  dayScore.scores.focus = Math.round(focusScore);

  // 4. Calculate Mood Score
  const moodData = await MoodLog.findOne({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay }
  });

  let moodScore = 50; // Default
  if (moodData) {
    moodData.calculateWellnessScore();
    moodScore = moodData.wellnessScore;
    
    dayScore.breakdown.mood = {
      moodRating: moodData.mood,
      energyLevel: moodData.energy,
      stressLevel: moodData.stress,
      wellnessScore: moodData.wellnessScore
    };
  }
  dayScore.scores.mood = moodScore;

  // Calculate overall score using user weights
  dayScore.calculateOverallScore(weights);

  // Check goals achievement
  dayScore.goalsAchieved = {
    studyHours: timeStats.study.duration >= (user.dailyGoals.studyHours * 60),
    workHours: timeStats.work.duration >= (user.dailyGoals.workHours * 60),
    sleepHours: healthData ? healthData.sleep.duration >= user.dailyGoals.sleepHours : false,
    steps: healthData ? healthData.activity.steps >= user.dailyGoals.steps : false,
    tasksCompleted: taskStats.completed >= user.dailyGoals.tasksCompleted
  };

  // Generate insights
  dayScore.generateInsights();

  // Save and return
  await dayScore.save();
  return dayScore;
}

module.exports = router;