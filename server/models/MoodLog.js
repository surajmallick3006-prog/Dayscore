const mongoose = require('mongoose');

const moodLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  // Mood tracking (1-5 scale with emojis)
  mood: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  // Energy level (1-10 scale)
  energy: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  // Stress level (1-10 scale)
  stress: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  // Motivation level (1-10 scale)
  motivation: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  // Focus level (1-10 scale)
  focus: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  // Anxiety level (1-10 scale)
  anxiety: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  // Gratitude and positive notes
  gratitude: [{
    type: String,
    maxlength: 200
  }],
  // Daily reflection
  reflection: {
    type: String,
    maxlength: 1000
  },
  // Mood triggers/factors
  triggers: [{
    type: String,
    enum: [
      'work-stress', 'lack-of-sleep', 'exercise', 'social-interaction',
      'weather', 'diet', 'caffeine', 'alcohol', 'medication',
      'family', 'friends', 'achievement', 'failure', 'other'
    ]
  }],
  // Activities that improved mood
  moodBoosters: [{
    type: String,
    enum: [
      'exercise', 'meditation', 'music', 'reading', 'socializing',
      'nature', 'hobby', 'rest', 'food', 'accomplishment', 'other'
    ]
  }],
  // Overall wellness score for the day
  wellnessScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
moodLogSchema.index({ userId: 1, date: -1 });

// Calculate wellness score based on mood metrics
moodLogSchema.methods.calculateWellnessScore = function() {
  // Normalize all values to 0-100 scale
  const moodScore = ((this.mood - 1) / 4) * 100; // 1-5 to 0-100
  const energyScore = ((this.energy - 1) / 9) * 100; // 1-10 to 0-100
  const stressScore = ((10 - this.stress) / 9) * 100; // Inverted: lower stress = higher score
  const motivationScore = ((this.motivation - 1) / 9) * 100;
  const focusScore = ((this.focus - 1) / 9) * 100;
  const anxietyScore = ((10 - this.anxiety) / 9) * 100; // Inverted

  // Weighted average
  this.wellnessScore = Math.round(
    (moodScore * 0.25) +
    (energyScore * 0.20) +
    (stressScore * 0.20) +
    (motivationScore * 0.15) +
    (focusScore * 0.10) +
    (anxietyScore * 0.10)
  );

  return this.wellnessScore;
};

// Get mood trends for a date range
moodLogSchema.statics.getMoodTrends = async function(userId, startDate, endDate) {
  return this.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  })
  .sort({ date: 1 })
  .select('date mood energy stress motivation focus anxiety wellnessScore');
};

// Get mood statistics
moodLogSchema.statics.getMoodStats = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        avgMood: { $avg: '$mood' },
        avgEnergy: { $avg: '$energy' },
        avgStress: { $avg: '$stress' },
        avgMotivation: { $avg: '$motivation' },
        avgFocus: { $avg: '$focus' },
        avgAnxiety: { $avg: '$anxiety' },
        avgWellness: { $avg: '$wellnessScore' },
        totalEntries: { $sum: 1 },
        // Mood distribution
        moodDistribution: {
          $push: '$mood'
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      avgMood: 0,
      avgEnergy: 0,
      avgStress: 0,
      avgMotivation: 0,
      avgFocus: 0,
      avgAnxiety: 0,
      avgWellness: 0,
      totalEntries: 0,
      moodDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const result = stats[0];
  
  // Calculate mood distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result.moodDistribution.forEach(mood => {
    distribution[mood] = (distribution[mood] || 0) + 1;
  });
  result.moodDistribution = distribution;

  // Round averages
  Object.keys(result).forEach(key => {
    if (key.startsWith('avg') && typeof result[key] === 'number') {
      result[key] = Math.round(result[key] * 10) / 10;
    }
  });

  return result;
};

// Get common mood triggers
moodLogSchema.statics.getCommonTriggers = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate }
      }
    },
    { $unwind: '$triggers' },
    {
      $group: {
        _id: '$triggers',
        count: { $sum: 1 },
        avgMoodWhenTriggered: { $avg: '$mood' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
};

module.exports = mongoose.model('MoodLog', moodLogSchema);