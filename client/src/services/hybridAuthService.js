import { db } from '../config/firebase';
import { collection, doc, setDoc, getDoc, query, where, getDocs } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class HybridAuthService {
  constructor() {
    // Initialize EmailJS with public key
    const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'qzkosF3HoemAfhE2-';
    console.log('🔑 EmailJS Public Key:', publicKey);
    emailjs.init(publicKey);
    
    // Log EmailJS configuration
    console.log('📧 EmailJS Config:', {
      serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID,
      templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
      publicKey: publicKey
    });
  }

  // Check if Firebase is available
  isFirebaseAvailable() {
    return db !== null && db !== undefined;
  }

  // Generate OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP via EmailJS (client-side)
  async sendOTPEmail(email, otp, name) {
    try {
      console.log('📧 Sending OTP email to:', email, 'OTP:', otp);
      
      // Validate email first
      if (!email || email.trim() === '') {
        console.error('❌ Email is empty or invalid');
        return false;
      }
      
      // Use hardcoded values to ensure they work
      const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID || 'service_pt6nicj';
      const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'template_gmtbb2d';
      
      // Try multiple parameter combinations to match your template
      const templateParams = {
        // Common EmailJS recipient field names
        to_email: email.trim(),
        email: email.trim(),
        user_email: email.trim(),
        recipient_email: email.trim(),
        
        // Name fields
        to_name: name || email.split('@')[0],
        user_name: name || email.split('@')[0],
        name: name || email.split('@')[0],
        
        // OTP fields
        passcode: otp,
        otp_code: otp,
        code: otp,
        verification_code: otp,
        
        // Additional fields
        from_name: 'DayScore Team',
        subject: 'DayScore - Email Verification Code',
        message: `Your DayScore verification code is: ${otp}. This code will expire in 10 minutes.`
      };

      console.log('📧 Template params:', templateParams);
      console.log('📧 Service ID:', serviceId);
      console.log('📧 Template ID:', templateId);

      const result = await emailjs.send(
        serviceId,
        templateId,
        templateParams
      );

      console.log('✅ OTP email sent successfully:', result);
      return true;
    } catch (error) {
      console.error('❌ Error sending OTP email:', error);
      console.error('❌ Error details:', {
        status: error.status,
        text: error.text,
        message: error.message
      });
      
      // Log error for debugging
      console.error('Email sending failed:', error);
      return false;
    }
  }

  // Secure password hashing (use proper hashing in production)
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'dayscore_salt_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Generate a simple JWT-like token (for demo purposes)
  generateToken(userId) {
    const payload = {
      userId,
      exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    };
    return btoa(JSON.stringify(payload));
  }

  // Verify token
  verifyToken(token) {
    try {
      const payload = JSON.parse(atob(token));
      return payload.exp > Date.now() ? payload : null;
    } catch {
      return null;
    }
  }

  // Validate email format and domain
  validateEmail(email) {
    // Basic email format validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }

    // Extract domain for validation
    const domain = email.split('@')[1].toLowerCase();
    
    // Check against common valid domains and patterns
    const validDomainPatterns = [
      // Major email providers
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
      'icloud.com', 'me.com', 'mac.com', 'protonmail.com', 'tutanota.com',
      'zoho.com', 'yandex.com', 'mail.com', 'gmx.com', 'fastmail.com',
      
      // Educational domains
      '.edu', '.ac.', '.university', '.college',
      
      // Country-specific domains
      '.co.uk', '.co.in', '.com.au', '.ca', '.de', '.fr', '.jp', '.cn',
      
      // Organization domains
      '.org', '.gov', '.mil', '.int',
      
      // Business domains
      '.com', '.net', '.biz', '.info'
    ];

    // Check if domain matches any valid pattern
    const isValidDomain = validDomainPatterns.some(pattern => {
      if (pattern.startsWith('.')) {
        return domain.endsWith(pattern) || domain.includes(pattern);
      }
      return domain === pattern || domain.endsWith('.' + pattern);
    });

    // Additional checks for suspicious patterns
    const suspiciousPatterns = [
      /^\d+\.\d+\.\d+\.\d+$/, // IP addresses
      /^[a-z]{1,2}\.com$/, // Very short domains
      /\.(tk|ml|ga|cf)$/, // Free domains often used for spam
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(domain));

    if (isSuspicious) {
      return { valid: false, error: 'Please use a valid email address' };
    }

    if (!isValidDomain) {
      // Allow custom domains but show warning
      return { 
        valid: true, 
        warning: 'Please ensure your email address is correct. We couldn\'t verify this domain.' 
      };
    }

    return { valid: true };
  }

  // Register user (sends OTP via EmailJS from client)
  async register(name, email, password) {
    try {
      console.log('🔄 Starting registration for:', email);
      
      // Validate email first
      const emailValidation = this.validateEmail(email);
      if (!emailValidation.valid) {
        console.error('❌ Email validation failed:', emailValidation.error);
        return {
          success: false,
          error: emailValidation.error,
        };
      }
      console.log('✅ Email validation passed');

      // Check Firebase availability
      if (!this.isFirebaseAvailable()) {
        console.error('❌ Firebase not available');
        return {
          success: false,
          error: 'Firebase is not configured. Please check your Firebase setup.',
        };
      }
      console.log('✅ Firebase is available');

      // Check if user already exists in Firestore
      console.log('🔍 Checking if user exists...');
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.error('❌ User already exists');
        return {
          success: false,
          error: 'User already exists with this email',
        };
      }
      console.log('✅ User does not exist, proceeding...');

      // Generate OTP
      const otp = this.generateOTP();
      const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      console.log('🔢 Generated OTP:', otp);

      // Send OTP via EmailJS (client-side)
      console.log('📧 Sending OTP email...');
      const emailSent = await this.sendOTPEmail(email, otp, name);
      if (!emailSent) {
        console.error('❌ Failed to send OTP email');
        return {
          success: false,
          error: 'Failed to send verification email. Please check your email address and try again.',
        };
      }
      console.log('✅ OTP email sent successfully');

      // Store temporary registration data in localStorage
      const hashedPassword = await this.hashPassword(password);
      const tempData = {
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpires,
        timestamp: Date.now(),
      };
      
      localStorage.setItem('tempRegistration', JSON.stringify(tempData));
      console.log('💾 Temporary registration data stored');

      return {
        success: true,
        message: 'OTP sent successfully. Please check your email.',
      };
    } catch (error) {
      console.error('❌ Registration error:', error);
      return {
        success: false,
        error: `Registration failed: ${error.message}`,
      };
    }
  }

  // Verify OTP and store user in Firebase
  async verifyOTP(email, otp) {
    console.log('🔄 HybridAuthService: Starting OTP verification for:', email, 'OTP:', otp);
    
    // Input validation
    if (!email || !otp) {
      console.error('❌ HybridAuthService: Missing email or OTP');
      return {
        success: false,
        error: 'Email and OTP are required.',
      };
    }

    if (otp.length !== 6) {
      console.error('❌ HybridAuthService: Invalid OTP length');
      return {
        success: false,
        error: 'OTP must be 6 digits.',
      };
    }

    try {
      // Get temporary registration data
      const tempData = localStorage.getItem('tempRegistration');
      if (!tempData) {
        console.error('❌ HybridAuthService: No registration data found');
        return {
          success: false,
          error: 'Registration data not found. Please register again.',
        };
      }

      let registrationData;
      try {
        registrationData = JSON.parse(tempData);
      } catch (parseError) {
        console.error('❌ HybridAuthService: Failed to parse registration data:', parseError);
        localStorage.removeItem('tempRegistration');
        return {
          success: false,
          error: 'Invalid registration data. Please register again.',
        };
      }

      console.log('📋 HybridAuthService: Registration data found:', { 
        email: registrationData.email, 
        hasOtp: !!registrationData.otp,
        timestamp: registrationData.timestamp,
        otpExpires: registrationData.otpExpires
      });
      
      // Check if data is not expired (10 minutes)
      if (Date.now() - registrationData.timestamp > 10 * 60 * 1000) {
        localStorage.removeItem('tempRegistration');
        console.error('❌ HybridAuthService: Registration session expired');
        return {
          success: false,
          error: 'Registration session expired. Please register again.',
        };
      }

      // Check if email matches
      if (registrationData.email !== email) {
        console.error('❌ HybridAuthService: Email mismatch. Expected:', registrationData.email, 'Got:', email);
        return {
          success: false,
          error: 'Email mismatch. Please register again.',
        };
      }

      // Check OTP
      if (registrationData.otp !== otp) {
        console.error('❌ HybridAuthService: Invalid OTP. Expected:', registrationData.otp, 'Got:', otp);
        return {
          success: false,
          error: 'Invalid OTP. Please check your email and try again.',
        };
      }

      // Check if OTP is expired
      if (Date.now() > registrationData.otpExpires) {
        localStorage.removeItem('tempRegistration');
        console.error('❌ HybridAuthService: OTP expired');
        return {
          success: false,
          error: 'OTP has expired. Please register again.',
        };
      }

      console.log('✅ HybridAuthService: OTP verification passed, creating user in Firebase...');

      // Check Firebase availability
      if (!this.isFirebaseAvailable()) {
        console.error('❌ HybridAuthService: Firebase not available');
        return {
          success: false,
          error: 'Firebase is not available. Please check your connection.',
        };
      }

      // Create user document in Firestore
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userDoc = {
        id: userId,
        name: registrationData.name,
        email: registrationData.email,
        password: registrationData.password,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences: {
          theme: 'dark',
          notifications: true,
        },
        dailyGoals: {
          tasks: 5,
          screenTime: 8,
          mood: 7,
          sleep: 8,
        },
        scoreWeights: {
          tasks: 0.3,
          screenTime: 0.2,
          mood: 0.25,
          health: 0.25,
        },
        streaks: {
          current: 0,
          longest: 0,
          lastActiveDate: new Date(),
        },
      };

      console.log('💾 HybridAuthService: Saving user to Firebase with ID:', userId);
      
      try {
        await setDoc(doc(db, 'users', userId), userDoc);
        console.log('✅ HybridAuthService: User saved to Firebase successfully');
      } catch (firebaseError) {
        console.error('❌ HybridAuthService: Firebase save failed, using local storage:', firebaseError);
        
        // Fallback: Store user data locally for testing
        const existingUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
        existingUsers.push(userDoc);
        localStorage.setItem('localUsers', JSON.stringify(existingUsers));
        console.log('✅ HybridAuthService: User saved locally as fallback');
      }

      // Generate token and store user data
      const token = this.generateToken(userId);
      const user = { ...userDoc };
      delete user.password; // Don't return password

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('tempRegistration');

      console.log('✅ HybridAuthService: Registration completed successfully');
      
      // Add extra logging to debug the return
      console.log('🔄 HybridAuthService: About to return success result...');
      const successResult = {
        success: true,
        user,
        token,
      };
      console.log('📤 HybridAuthService: Returning result:', successResult);
      
      // Add a small delay to ensure all async operations complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return successResult;
    } catch (error) {
      console.error('❌ HybridAuthService: OTP verification error:', error);
      
      // Check if it's a Firebase permissions error
      if (error.code === 'permission-denied') {
        return {
          success: false,
          error: 'Firebase permissions error. Please update your Firestore security rules to allow writes.',
        };
      }
      
      return {
        success: false,
        error: `Verification failed: ${error.message}`,
      };
    }
  }

  // Resend OTP
  async resendOTP(email) {
    try {
      // Get temporary registration data
      const tempData = localStorage.getItem('tempRegistration');
      if (!tempData) {
        return {
          success: false,
          error: 'Registration data not found. Please register again.',
        };
      }

      const registrationData = JSON.parse(tempData);
      
      // Check if email matches
      if (registrationData.email !== email) {
        return {
          success: false,
          error: 'Email mismatch. Please register again.',
        };
      }

      // Generate new OTP
      const otp = this.generateOTP();
      const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Send OTP via EmailJS
      const emailSent = await this.sendOTPEmail(email, otp, registrationData.name);
      if (!emailSent) {
        return {
          success: false,
          error: 'Failed to send verification email. Please try again.',
        };
      }

      // Update temporary registration data with new OTP
      registrationData.otp = otp;
      registrationData.otpExpires = otpExpires;
      localStorage.setItem('tempRegistration', JSON.stringify(registrationData));

      return {
        success: true,
        message: 'OTP sent successfully. Please check your email.',
      };
    } catch (error) {
      console.error('Resend OTP error:', error);
      return {
        success: false,
        error: 'Failed to resend OTP. Please try again.',
      };
    }
  }

  // Login user with email verification for new users
  async login(email, password) {
    try {
      console.log('🔄 Starting login for:', email);
      
      // Check Firebase availability
      if (!this.isFirebaseAvailable()) {
        return {
          success: false,
          error: 'Firebase is not configured. Please check your Firebase setup.',
        };
      }

      // Find user in Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('❌ User not found, checking if this is a new user...');
        
        // Check if this email is valid for registration
        const emailValidation = this.validateEmail(email);
        if (emailValidation.valid) {
          return {
            success: false,
            error: 'Account not found. Please register first.',
            isNewUser: true
          };
        } else {
          return {
            success: false,
            error: 'Invalid email or password',
          };
        }
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      console.log('✅ User found in database');

      // Check if user's email is verified
      if (!userData.emailVerified) {
        console.log('⚠️ User email not verified, sending verification...');
        
        // Generate OTP for verification
        const otp = this.generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        
        // Send verification OTP
        const emailSent = await this.sendOTPEmail(email, otp, userData.name);
        if (!emailSent) {
          return {
            success: false,
            error: 'Failed to send verification email. Please try again.',
          };
        }
        
        // Store verification data
        localStorage.setItem('loginVerification', JSON.stringify({
          email,
          password: await this.hashPassword(password),
          otp,
          otpExpires,
          timestamp: Date.now(),
        }));
        
        return {
          success: false,
          error: 'Please verify your email first. We\'ve sent you a verification code.',
          needsVerification: true
        };
      }

      // Check password
      const hashedPassword = await this.hashPassword(password);
      if (hashedPassword !== userData.password) {
        console.log('❌ Invalid password');
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      console.log('✅ Login successful');
      
      // Generate token and store user data
      const token = this.generateToken(userData.id);
      const user = { ...userData };
      delete user.password; // Don't return password

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return {
        success: true,
        user,
        token,
      };
    } catch (error) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        error: 'Login failed. Please try again.',
      };
    }
  }

  // Verify login OTP for existing users
  async verifyLoginOTP(email, otp) {
    try {
      console.log('🔄 Verifying login OTP for:', email);
      
      // Get verification data
      const verificationData = localStorage.getItem('loginVerification');
      if (!verificationData) {
        return {
          success: false,
          error: 'Verification session not found. Please try logging in again.',
        };
      }

      const loginData = JSON.parse(verificationData);
      
      // Check if data is not expired (10 minutes)
      if (Date.now() - loginData.timestamp > 10 * 60 * 1000) {
        localStorage.removeItem('loginVerification');
        return {
          success: false,
          error: 'Verification session expired. Please try logging in again.',
        };
      }

      // Check if email matches
      if (loginData.email !== email) {
        return {
          success: false,
          error: 'Email mismatch. Please try logging in again.',
        };
      }

      // Check OTP
      if (loginData.otp !== otp) {
        return {
          success: false,
          error: 'Invalid OTP. Please check your email and try again.',
        };
      }

      // Check if OTP is expired
      if (Date.now() > loginData.otpExpires) {
        localStorage.removeItem('loginVerification');
        return {
          success: false,
          error: 'OTP has expired. Please try logging in again.',
        };
      }

      // Find and update user in Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return {
          success: false,
          error: 'User not found.',
        };
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // Mark email as verified
      await setDoc(doc(db, 'users', userData.id), {
        ...userData,
        emailVerified: true,
        updatedAt: new Date()
      });

      console.log('✅ Email verified and login successful');
      
      // Generate token and store user data
      const token = this.generateToken(userData.id);
      const user = { ...userData, emailVerified: true };
      delete user.password; // Don't return password

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('loginVerification');

      return {
        success: true,
        user,
        token,
      };
    } catch (error) {
      console.error('❌ Login OTP verification error:', error);
      return {
        success: false,
        error: 'Verification failed. Please try again.',
      };
    }
  }

  // Get current user profile
  async getProfile() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { success: false, error: 'No token found' };

      const payload = this.verifyToken(token);
      if (!payload) return { success: false, error: 'Invalid token' };

      const userDoc = await getDoc(doc(db, 'users', payload.userId));
      if (!userDoc.exists()) {
        return { success: false, error: 'User not found' };
      }

      const userData = userDoc.data();
      delete userData.password; // Don't return password

      return {
        success: true,
        user: userData,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get profile',
      };
    }
  }

  // Logout user
  async logout() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tempRegistration');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Logout failed' };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) return false;

    const payload = this.verifyToken(token);
    return !!payload;
  }

  // Get stored user data
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Get stored token
  getToken() {
    return localStorage.getItem('token');
  }
}

const hybridAuthService = new HybridAuthService();
export default hybridAuthService;