const mongoose = require('mongoose');

const dayScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  // Component scores (0-100)
  scores: {
    productivity: { type: Number, min: 0, max: 100, default: 0 },
    health: { type: Number, min: 0, max: 100, default: 0 },
    focus: { type: Number, min: 0, max: 100, default: 0 },
    mood: { type: Number, min: 0, max: 100, default: 0 }
  },
  // Overall day score (0-100)
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // Detailed breakdown for transparency
  breakdown: {
    // Productivity factors
    productivity: {
      tasksCompleted: { type: Number, default: 0 },
      taskCompletionRate: { type: Number, default: 0 },
      studyTime: { type: Number, default: 0 },
      workTime: { type: Number, default: 0 },
      productivityRating: { type: Number, default: 0 }
    },
    // Health factors
    health: {
      sleepDuration: { type: Number, default: 0 },
      sleepQuality: { type: Number, default: 0 },
      steps: { type: Number, default: 0 },
      activeMinutes: { type: Number, default: 0 },
      exerciseTime: { type: Number, default: 0 }
    },
    // Focus factors
    focus: {
      screenTime: { type: Number, default: 0 },
      productiveScreenTime: { type: Number, default: 0 },
      distractions: { type: Number, default: 0 },
      focusQuality: { type: Number, default: 0 }
    },
    // Mood factors
    mood: {
      moodRating: { type: Number, default: 0 },
      energyLevel: { type: Number, default: 0 },
      stressLevel: { type: Number, default: 0 },
      wellnessScore: { type: Number, default: 0 }
    }
  },
  // Goals achievement
  goalsAchieved: {
    studyHours: { type: Boolean, default: false },
    workHours: { type: Boolean, default: false },
    sleepHours: { type: Boolean, default: false },
    steps: { type: Boolean, default: false },
    tasksCompleted: { type: Boolean, default: false }
  },
  // Insights and recommendations
  insights: [{
    type: { type: String, enum: ['achievement', 'improvement', 'warning', 'tip'] },
    message: { type: String, maxlength: 200 },
    category: { type: String, enum: ['productivity', 'health', 'focus', 'mood'] }
  }],
  // Calculation metadata
  calculatedAt: {
    type: Date,
    default: Date.now
  },
  version: {
    type: String,
    default: '1.0'
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
dayScoreSchema.index({ userId: 1, date: -1 });
dayScoreSchema.index({ userId: 1, overallScore: -1 });

// Calculate overall day score using user's weights
dayScoreSchema.methods.calculateOverallScore = function(userWeights) {
  const weights = userWeights || {
    productivity: 30,
    health: 25,
    focus: 25,
    mood: 20
  };

  this.overallScore = Math.round(
    (this.scores.productivity * weights.productivity / 100) +
    (this.scores.health * weights.health / 100) +
    (this.scores.focus * weights.focus / 100) +
    (this.scores.mood * weights.mood / 100)
  );

  return this.overallScore;
};

// Generate insights based on scores and data
dayScoreSchema.methods.generateInsights = function() {
  this.insights = [];

  // Productivity insights
  if (this.scores.productivity >= 80) {
    this.insights.push({
      type: 'achievement',
      message: 'Excellent productivity today! You completed most of your tasks.',
      category: 'productivity'
    });
  } else if (this.scores.productivity < 50) {
    this.insights.push({
      type: 'improvement',
      message: 'Consider breaking down large tasks into smaller, manageable chunks.',
      category: 'productivity'
    });
  }

  // Health insights
  if (this.breakdown.health.sleepDuration < 6) {
    this.insights.push({
      type: 'warning',
      message: 'You got less than 6 hours of sleep. Try to maintain 7-9 hours for optimal health.',
      category: 'health'
    });
  }

  if (this.breakdown.health.steps >= 10000) {
    this.insights.push({
      type: 'achievement',
      message: 'Great job hitting your step goal today!',
      category: 'health'
    });
  }

  // Focus insights
  if (this.breakdown.focus.distractions > 20) {
    this.insights.push({
      type: 'improvement',
      message: 'High distraction count today. Try using focus techniques like Pomodoro.',
      category: 'focus'
    });
  }

  // Mood insights
  if (this.breakdown.mood.stressLevel > 7) {
    this.insights.push({
      type: 'tip',
      message: 'High stress detected. Consider meditation or a short walk to relax.',
      category: 'mood'
    });
  }

  return this.insights;
};

// Get score trends for a date range
dayScoreSchema.statics.getScoreTrends = async function(userId, startDate, endDate) {
  return this.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  })
  .sort({ date: 1 })
  .select('date scores overallScore goalsAchieved');
};

// Get best and worst days
dayScoreSchema.statics.getBestWorstDays = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [bestDay] = await this.find({
    userId,
    date: { $gte: startDate }
  })
  .sort({ overallScore: -1 })
  .limit(1);

  const [worstDay] = await this.find({
    userId,
    date: { $gte: startDate }
  })
  .sort({ overallScore: 1 })
  .limit(1);

  return { bestDay, worstDay };
};

// Get average scores
dayScoreSchema.statics.getAverageScores = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        avgOverallScore: { $avg: '$overallScore' },
        avgProductivity: { $avg: '$scores.productivity' },
        avgHealth: { $avg: '$scores.health' },
        avgFocus: { $avg: '$scores.focus' },
        avgMood: { $avg: '$scores.mood' },
        totalDays: { $sum: 1 }
      }
    }
  ]);

  return result[0] || {
    avgOverallScore: 0,
    avgProductivity: 0,
    avgHealth: 0,
    avgFocus: 0,
    avgMood: 0,
    totalDays: 0
  };
};

module.exports = mongoose.model('DayScore', dayScoreSchema);