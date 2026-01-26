const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['work', 'study', 'personal', 'health', 'other'],
    default: 'other'
  },
  panel: {
    type: String,
    enum: ['academic', 'personal'],
    default: 'personal'
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 30
  },
  actualTime: {
    type: Number, // in minutes
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Productivity score contribution (0-10)
  scoreImpact: {
    type: Number,
    default: 5,
    min: 1,
    max: 10
  }
}, {
  timestamps: true
});

// Index for efficient queries
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });

// Calculate completion rate for productivity score
taskSchema.statics.getCompletionStats = async function(userId, startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalScoreImpact: { $sum: '$scoreImpact' }
      }
    }
  ]);

  const result = {
    total: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
    completionRate: 0,
    totalScoreImpact: 0,
    completedScoreImpact: 0
  };

  stats.forEach(stat => {
    result.total += stat.count;
    result[stat._id.replace('-', '')] = stat.count;
    result.totalScoreImpact += stat.totalScoreImpact;
    
    if (stat._id === 'done') {
      result.completedScoreImpact = stat.totalScoreImpact;
    }
  });

  result.completionRate = result.total > 0 ? (result.completed / result.total) * 100 : 0;
  
  return result;
};

module.exports = mongoose.model('Task', taskSchema);