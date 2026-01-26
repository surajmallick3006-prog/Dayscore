const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  avatar: {
    type: String,
    default: ''
  },
  // Day Score calculation weights (percentages)
  scoreWeights: {
    productivity: { type: Number, default: 30 },
    health: { type: Number, default: 25 },
    focus: { type: Number, default: 25 },
    mood: { type: Number, default: 20 }
  },
  // User preferences
  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      dailyReminder: { type: Boolean, default: true }
    },
    timezone: { type: String, default: 'UTC' }
  },
  // Goals and targets
  dailyGoals: {
    studyHours: { type: Number, default: 4 },
    workHours: { type: Number, default: 8 },
    sleepHours: { type: Number, default: 8 },
    steps: { type: Number, default: 10000 },
    tasksCompleted: { type: Number, default: 5 }
  },
  // Streak tracking
  streaks: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);