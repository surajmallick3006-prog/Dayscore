const mongoose = require('mongoose');

const screenTimeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  // Total screen time in minutes
  totalScreenTime: {
    type: Number,
    default: 0
  },
  // Screen time by category
  categories: {
    social: { type: Number, default: 0 }, // Social media
    entertainment: { type: Number, default: 0 }, // Videos, games, etc.
    productivity: { type: Number, default: 0 }, // Work, study apps
    communication: { type: Number, default: 0 }, // Email, messaging
    news: { type: Number, default: 0 }, // News and reading
    shopping: { type: Number, default: 0 }, // E-commerce
    other: { type: Number, default: 0 }
  },
  // App-specific usage
  apps: [{
    name: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['social', 'entertainment', 'productivity', 'communication', 'news', 'shopping', 'other'],
      default: 'other'
    },
    timeSpent: { type: Number, required: true }, // in minutes
    openCount: { type: Number, default: 1 }
  }],
  // Distraction tracking
  distractions: {
    count: { type: Number, default: 0 },
    totalTime: { type: Number, default: 0 }, // in minutes
    triggers: [{
      type: String,
      enum: ['notification', 'boredom', 'habit', 'procrastination', 'social', 'other']
    }]
  },
  // Focus sessions (periods of productive screen time)
  focusSessions: [{
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true }, // in minutes
    quality: { type: Number, min: 1, max: 10, default: 7 }, // Focus quality rating
    app: { type: String },
    category: { type: String, default: 'productivity' }
  }],
  // Screen time goals and limits
  limits: {
    dailyLimit: { type: Number, default: 480 }, // 8 hours in minutes
    socialLimit: { type: Number, default: 60 }, // 1 hour
    entertainmentLimit: { type: Number, default: 120 } // 2 hours
  },
  // Calculated scores
  scores: {
    focusScore: { type: Number, min: 0, max: 100, default: 50 },
    distractionScore: { type: Number, min: 0, max: 100, default: 50 },
    balanceScore: { type: Number, min: 0, max: 100, default: 50 }
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
screenTimeSchema.index({ userId: 1, date: -1 });

// Calculate screen time scores
screenTimeSchema.methods.calculateScores = function() {
  // Focus Score: Based on productive vs non-productive time
  const productiveTime = this.categories.productivity + this.categories.communication;
  const nonProductiveTime = this.categories.social + this.categories.entertainment;
  const totalTime = this.totalScreenTime || 1;
  
  const productiveRatio = productiveTime / totalTime;
  this.scores.focusScore = Math.round(Math.min(productiveRatio * 100, 100));

  // Distraction Score: Lower distractions = higher score
  const maxDistractions = 50; // Assume 50 is very high
  const distractionRatio = Math.min(this.distractions.count / maxDistractions, 1);
  this.scores.distractionScore = Math.round((1 - distractionRatio) * 100);

  // Balance Score: Based on staying within limits
  let balanceScore = 100;
  
  // Penalize for exceeding daily limit
  if (this.totalScreenTime > this.limits.dailyLimit) {
    const excess = (this.totalScreenTime - this.limits.dailyLimit) / this.limits.dailyLimit;
    balanceScore -= Math.min(excess * 50, 50);
  }
  
  // Penalize for exceeding social media limit
  if (this.categories.social > this.limits.socialLimit) {
    const excess = (this.categories.social - this.limits.socialLimit) / this.limits.socialLimit;
    balanceScore -= Math.min(excess * 25, 25);
  }
  
  // Penalize for exceeding entertainment limit
  if (this.categories.entertainment > this.limits.entertainmentLimit) {
    const excess = (this.categories.entertainment - this.limits.entertainmentLimit) / this.limits.entertainmentLimit;
    balanceScore -= Math.min(excess * 25, 25);
  }

  this.scores.balanceScore = Math.round(Math.max(balanceScore, 0));

  return this.scores;
};

// Get screen time trends
screenTimeSchema.statics.getScreenTimeTrends = async function(userId, startDate, endDate) {
  return this.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  })
  .sort({ date: 1 })
  .select('date totalScreenTime categories scores distractions.count');
};

// Get app usage statistics
screenTimeSchema.statics.getAppStats = async function(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate }
      }
    },
    { $unwind: '$apps' },
    {
      $group: {
        _id: '$apps.name',
        totalTime: { $sum: '$apps.timeSpent' },
        totalOpens: { $sum: '$apps.openCount' },
        category: { $first: '$apps.category' },
        avgDailyTime: { $avg: '$apps.timeSpent' }
      }
    },
    { $sort: { totalTime: -1 } },
    { $limit: 20 }
  ]);
};

// Get category breakdown
screenTimeSchema.statics.getCategoryBreakdown = async function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const result = await this.findOne({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay }
  }).select('categories totalScreenTime');

  return result || {
    categories: {
      social: 0,
      entertainment: 0,
      productivity: 0,
      communication: 0,
      news: 0,
      shopping: 0,
      other: 0
    },
    totalScreenTime: 0
  };
};

module.exports = mongoose.model('ScreenTime', screenTimeSchema);