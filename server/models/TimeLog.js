const mongoose = require('mongoose');

const timeLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['study', 'work', 'break', 'meeting'],
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 300
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  // Focus quality during this session (1-10)
  focusQuality: {
    type: Number,
    min: 1,
    max: 10,
    default: 7
  },
  // Productivity rating for this session (1-10)
  productivityRating: {
    type: Number,
    min: 1,
    max: 10,
    default: 7
  },
  // Break details if type is 'break'
  breakType: {
    type: String,
    enum: ['short', 'long', 'lunch', 'exercise'],
    default: 'short'
  },
  // Tags for categorization
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
timeLogSchema.index({ userId: 1, startTime: -1 });
timeLogSchema.index({ userId: 1, type: 1, startTime: -1 });

// Calculate daily time stats
timeLogSchema.statics.getDailyStats = async function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const stats = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        startTime: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $group: {
        _id: '$type',
        totalDuration: { $sum: '$duration' },
        averageFocus: { $avg: '$focusQuality' },
        averageProductivity: { $avg: '$productivityRating' },
        sessionCount: { $sum: 1 }
      }
    }
  ]);

  const result = {
    study: { duration: 0, focus: 0, productivity: 0, sessions: 0 },
    work: { duration: 0, focus: 0, productivity: 0, sessions: 0 },
    break: { duration: 0, focus: 0, productivity: 0, sessions: 0 },
    meeting: { duration: 0, focus: 0, productivity: 0, sessions: 0 },
    totalDuration: 0,
    overallFocus: 0,
    overallProductivity: 0
  };

  let totalSessions = 0;
  let totalFocus = 0;
  let totalProductivity = 0;

  stats.forEach(stat => {
    const type = stat._id;
    result[type] = {
      duration: stat.totalDuration,
      focus: Math.round(stat.averageFocus * 10) / 10,
      productivity: Math.round(stat.averageProductivity * 10) / 10,
      sessions: stat.sessionCount
    };
    
    result.totalDuration += stat.totalDuration;
    totalSessions += stat.sessionCount;
    totalFocus += stat.averageFocus * stat.sessionCount;
    totalProductivity += stat.averageProductivity * stat.sessionCount;
  });

  result.overallFocus = totalSessions > 0 ? Math.round((totalFocus / totalSessions) * 10) / 10 : 0;
  result.overallProductivity = totalSessions > 0 ? Math.round((totalProductivity / totalSessions) * 10) / 10 : 0;

  return result;
};

// Get weekly time trends
timeLogSchema.statics.getWeeklyTrends = async function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        startTime: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
          type: '$type'
        },
        totalDuration: { $sum: '$duration' },
        averageFocus: { $avg: '$focusQuality' }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);
};

module.exports = mongoose.model('TimeLog', timeLogSchema);