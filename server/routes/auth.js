const express = require('express');
const User = require('../models/User');
const { generateToken, generateRefreshToken, authenticateToken } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { generateOTP, sendOTPEmail } = require('../utils/emailService');

const router = express.Router();

// @route   POST /api/auth/send-otp
// @desc    Send OTP for registration (EmailJS only)
// @access  Public
router.post('/send-otp', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
        error: 'MISSING_FIELDS'
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP temporarily (use Redis in production)
    global.tempOTPs = global.tempOTPs || {};
    global.tempOTPs[email] = {
      otp,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0
    };

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      delete global.tempOTPs[email];
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email',
        error: 'EMAIL_SEND_ERROR'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully. Please check your email.',
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: 'SEND_OTP_ERROR'
    });
  }
});

// @route   POST /api/auth/verify-otp-only
// @desc    Verify OTP only (no user creation)
// @access  Public
router.post('/verify-otp-only', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
        error: 'MISSING_FIELDS'
      });
    }

    // Check temporary OTP storage
    global.tempOTPs = global.tempOTPs || {};
    const otpData = global.tempOTPs[email];

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired',
        error: 'OTP_NOT_FOUND'
      });
    }

    // Check if OTP is expired
    if (otpData.expires < Date.now()) {
      delete global.tempOTPs[email];
      return res.status(400).json({
        success: false,
        message: 'OTP has expired',
        error: 'OTP_EXPIRED'
      });
    }

    // Check attempts
    if (otpData.attempts >= 3) {
      delete global.tempOTPs[email];
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts',
        error: 'TOO_MANY_ATTEMPTS'
      });
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      otpData.attempts++;
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
        error: 'INVALID_OTP'
      });
    }

    // OTP is valid, clean up
    delete global.tempOTPs[email];

    res.json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: 'VERIFICATION_ERROR'
    });
  }
});

// @route   POST /api/auth/resend-otp-only
// @desc    Resend OTP for email verification (EmailJS only)
// @access  Public
router.post('/resend-otp-only', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        error: 'MISSING_EMAIL'
      });
    }

    // Generate new OTP
    const otp = generateOTP();

    // Update temporary OTP storage
    global.tempOTPs = global.tempOTPs || {};
    global.tempOTPs[email] = {
      otp,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0
    };

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      delete global.tempOTPs[email];
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email',
        error: 'EMAIL_SEND_ERROR'
      });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully. Please check your email.'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: 'RESEND_ERROR'
    });
  }
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email',
        error: 'USER_EXISTS'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new user (not verified yet)
    const user = new User({
      name,
      email,
      password,
      otp,
      otpExpires,
      emailVerified: false
    });

    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      // If email fails, delete the user and return error
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        message: 'Failed to send verification email',
        error: 'EMAIL_SEND_ERROR'
      });
    }

    res.status(201).json({
      message: 'Registration initiated. Please check your email for verification code.',
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Registration failed',
      error: 'REGISTRATION_ERROR'
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and complete registration
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: 'Email and OTP are required',
        error: 'MISSING_FIELDS'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    // Check if OTP is valid and not expired
    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({
        message: 'Invalid or expired OTP',
        error: 'INVALID_OTP'
      });
    }

    // Mark email as verified and clear OTP
    user.emailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      message: 'Email verified successfully',
      user: user.toJSON(),
      token,
      refreshToken
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      message: 'OTP verification failed',
      error: 'VERIFICATION_ERROR'
    });
  }
});

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP for email verification
// @access  Public
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
        error: 'MISSING_EMAIL'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    // Check if user is already verified
    if (user.emailVerified) {
      return res.status(400).json({
        message: 'Email is already verified',
        error: 'ALREADY_VERIFIED'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({
        message: 'Failed to send verification email',
        error: 'EMAIL_SEND_ERROR'
      });
    }

    res.json({
      message: 'OTP sent successfully. Please check your email.'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      message: 'Failed to resend OTP',
      error: 'RESEND_ERROR'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in',
        error: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Update last active date for streak tracking
    user.streaks.lastActiveDate = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Login failed',
      error: 'LOGIN_ERROR'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Failed to get user profile',
      error: 'PROFILE_ERROR'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, avatar, preferences, dailyGoals, scoreWeights } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };
    if (dailyGoals) updateData.dailyGoals = { ...req.user.dailyGoals, ...dailyGoals };
    if (scoreWeights) updateData.scoreWeights = { ...req.user.scoreWeights, ...scoreWeights };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Failed to update profile',
      error: 'UPDATE_ERROR'
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current password and new password are required'
      });
    }

    // Verify current password
    const user = await User.findById(req.user._id);
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        message: 'Current password is incorrect',
        error: 'INVALID_PASSWORD'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      message: 'Failed to change password',
      error: 'PASSWORD_CHANGE_ERROR'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const newToken = generateToken(decoded.userId);

    res.json({
      token: newToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      message: 'Invalid refresh token',
      error: 'INVALID_REFRESH_TOKEN'
    });
  }
});

module.exports = router;