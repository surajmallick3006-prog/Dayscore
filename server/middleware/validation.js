const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Task validation
const validateTask = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  
  body('category')
    .optional()
    .isIn(['work', 'study', 'personal', 'health', 'other'])
    .withMessage('Invalid category'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  body('estimatedTime')
    .optional()
    .isInt({ min: 1, max: 1440 })
    .withMessage('Estimated time must be between 1 and 1440 minutes'),
  
  handleValidationErrors
];

// Time log validation
const validateTimeLog = [
  body('type')
    .isIn(['study', 'work', 'break', 'meeting'])
    .withMessage('Type must be study, work, break, or meeting'),
  
  body('startTime')
    .isISO8601()
    .withMessage('Start time must be a valid date'),
  
  body('duration')
    .isInt({ min: 1, max: 1440 })
    .withMessage('Duration must be between 1 and 1440 minutes'),
  
  body('focusQuality')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Focus quality must be between 1 and 10'),
  
  body('productivityRating')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Productivity rating must be between 1 and 10'),
  
  handleValidationErrors
];

// Health data validation
const validateHealthData = [
  body('date')
    .isISO8601()
    .withMessage('Date must be valid'),
  
  body('sleep.duration')
    .optional()
    .isFloat({ min: 0, max: 24 })
    .withMessage('Sleep duration must be between 0 and 24 hours'),
  
  body('sleep.quality')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Sleep quality must be between 1 and 10'),
  
  body('activity.steps')
    .optional()
    .isInt({ min: 0, max: 100000 })
    .withMessage('Steps must be between 0 and 100,000'),
  
  body('activity.activeMinutes')
    .optional()
    .isInt({ min: 0, max: 1440 })
    .withMessage('Active minutes must be between 0 and 1440'),
  
  handleValidationErrors
];

// Mood log validation
const validateMoodLog = [
  body('date')
    .isISO8601()
    .withMessage('Date must be valid'),
  
  body('mood')
    .isInt({ min: 1, max: 5 })
    .withMessage('Mood must be between 1 and 5'),
  
  body('energy')
    .isInt({ min: 1, max: 10 })
    .withMessage('Energy must be between 1 and 10'),
  
  body('stress')
    .isInt({ min: 1, max: 10 })
    .withMessage('Stress must be between 1 and 10'),
  
  body('motivation')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Motivation must be between 1 and 10'),
  
  body('focus')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Focus must be between 1 and 10'),
  
  body('anxiety')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Anxiety must be between 1 and 10'),
  
  handleValidationErrors
];

// Screen time validation
const validateScreenTime = [
  body('date')
    .isISO8601()
    .withMessage('Date must be valid'),
  
  body('totalScreenTime')
    .isInt({ min: 0, max: 1440 })
    .withMessage('Total screen time must be between 0 and 1440 minutes'),
  
  body('categories.social')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Social screen time must be non-negative'),
  
  body('categories.entertainment')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Entertainment screen time must be non-negative'),
  
  body('categories.productivity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Productivity screen time must be non-negative'),
  
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateTask,
  validateTimeLog,
  validateHealthData,
  validateMoodLog,
  validateScreenTime,
  handleValidationErrors
};