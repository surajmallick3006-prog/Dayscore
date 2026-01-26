const mongoose = require('mongoose');

const healthDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  // Sleep data
  sleep: {
    duration: { type: Number, default: 0 }, // in hours
    quality: { type: Number, min: 1, max: 10, default: 7 },
    bedTime: { type: String }, // "23:30"
    wakeTime: { type: String }, // "07:00"
    deepSleep: { type: Number, default: 0 }, // in hours
    remSleep: { type: Number, default: 0 } // in hours
  },
  // Physical activity
  activity: {
    steps: { type: Number, default: 0 },
    distance: { type: Number, default: 0 }, // in km
    calories: { type: Number, default: 0 },
    activeMinutes: { type: Number, default: 0 },
    exerciseType: { type: String, default: '' },
    exerciseDuration: { type: Number, default: 0 } // in minutes
  },
  // Vital signs
  vitals: {
    heartRate: {
      resting: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    },
    bloodPressure: {
      systolic: { type: Number, default: 0 },
      diastolic: { type: Number, default: 0 }
    },
    weight: { type: Number, default: 0 }, // in kg
    hydration: { type: Number, default: 0 } // glasses of water
  },
  // Health score components
  scores: {
    sleepScore: { type: Number, min: 0, max: 100, default: 0 },
    activityScore: { type: Number, min: 0, max: 100, default: 0 },
    overallHealthScore: { type: Number, min: 0, max: 100, default: 0 }
  },
  // Notes and observations
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
healthDataSchema.index({ userId: 1, date: -1 });

// Calculate health scores
healthDataSchema.methods.calculateScores = function() {
  // Sleep Score (0-100)
  const sleepTarget = 8; // hours
  const sleepRatio = Math.min(this.sleep.duration / sleepTarget, 1);
  const qualityBonus = (this.sleep.quality / 10) * 20;
  this.scores.sleepScore = Math.round((sleepRatio * 80) + qualityBonus);

  // Activity Score (0-100)
  const stepsTarget = 10000;
  const stepsRatio = Math.min(this.activity.steps / stepsTarget, 1);
  const exerciseBonus = Math.min(this.activity.exerciseDuration / 30, 1) * 20;
  this.scores.activityScore = Math.round((stepsRatio * 80) + exerciseBonus);

  // Overall Health Score
  this.scores.overallHealthScore = Math.round(
    (this.scores.sleepScore * 0.6) + (this.scores.activityScore * 0.4)
  );

  return this.scores;
};

// Get health trends for a date range
healthDataSchema.statics.getHealthTrends = async function(userId, startDate, endDate) {
  return this.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  })
  .sort({ date: 1 })
  .select('date sleep.duration activity.steps scores');
};

// Get average health metrics
healthDataSchema.statics.getAverageMetrics = async function(userId, days = 7) {
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
        avgSleepDuration: { $avg: '$sleep.duration' },
        avgSleepQuality: { $avg: '$sleep.quality' },
        avgSteps: { $avg: '$activity.steps' },
        avgActiveMinutes: { $avg: '$activity.activeMinutes' },
        avgHealthScore: { $avg: '$scores.overallHealthScore' },
        totalDays: { $sum: 1 }
      }
    }
  ]);

  return result[0] || {
    avgSleepDuration: 0,
    avgSleepQuality: 0,
    avgSteps: 0,
    avgActiveMinutes: 0,
    avgHealthScore: 0,
    totalDays: 0
  };
};

module.exports = mongoose.model('HealthData', healthDataSchema);