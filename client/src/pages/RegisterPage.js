import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, Eye, EyeOff, Check, ArrowLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useServerAuth } from '../context/ServerAuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Logo from '../components/Logo';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [currentStep, setCurrentStep] = useState('register'); // 'register' or 'verify'
  const [otpData, setOtpData] = useState({ otp: '', email: '' });
  const [resendCooldown, setResendCooldown] = useState(0);

  const { register, verifyOTP, resendOTP, isAuthenticated, loading, error, clearError, registrationData } = useServerAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Set OTP email when registration data is available
  useEffect(() => {
    if (registrationData?.email) {
      setOtpData(prev => ({ ...prev, email: registrationData.email }));
      setCurrentStep('verify');
    }
  }, [registrationData]);

  // Handle resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    // Calculate password strength
    const password = formData.password;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    // Prevent double submission
    if (isSubmitting) {
      console.log('⚠️ Already submitting, ignoring duplicate submission');
      return;
    }
    
    setIsSubmitting(true);

    try {
      if (currentStep === 'register') {
        // Registration step
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }

        if (!formData.agreeToTerms) {
          toast.error('Please agree to the terms and conditions');
          return;
        }

        console.log('🔄 Starting registration...');
        const result = await register(formData.name, formData.email, formData.password);
        console.log('📥 Registration result:', result);
        
        if (!result.success) {
          console.log('❌ Registration failed:', result.error);
          // Error handling is done in the register function
        } else {
          console.log('✅ Registration successful, should move to OTP step');
        }
        // If successful, the useEffect will change step to 'verify'
      } else {
        // OTP verification step
        console.log('🔄 Starting OTP verification in RegisterPage...');
        console.log('📧 Email:', otpData.email, 'OTP:', otpData.otp);
        
        // Validate inputs before proceeding
        if (!otpData.email || !otpData.otp) {
          toast.error('Please enter the verification code');
          return;
        }
        
        if (otpData.otp.length !== 6) {
          toast.error('Please enter a valid 6-digit code');
          return;
        }
        
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Verification timeout')), 30000)
        );

        const verificationPromise = verifyOTP(otpData.email, otpData.otp);
        
        console.log('⏳ Waiting for verification result...');
        const result = await Promise.race([verificationPromise, timeoutPromise]);
        console.log('📥 RegisterPage received result:', result);
        
        if (result && result.success) {
          console.log('✅ Verification successful, navigating to dashboard...');
          // Small delay to ensure state is updated
          setTimeout(() => {
            navigate('/app/dashboard', { replace: true });
          }, 100);
        } else {
          console.log('❌ Verification failed in RegisterPage:', result?.error || 'Unknown error');
          // Error is already handled in verifyOTP function
        }
      }
    } catch (error) {
      console.error('❌ HandleSubmit error:', error);
      if (error.message === 'Verification timeout') {
        toast.error('Verification is taking too long. Please check your connection and try again.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      // Always set submitting to false after a delay to prevent UI flicker
      console.log('🔄 Setting isSubmitting to false...');
      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    setOtpData(prev => ({ ...prev, otp: value }));
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    const result = await resendOTP(otpData.email);
    if (result.success) {
      setResendCooldown(60); // 60 second cooldown
    }
  };

  const handleBackToRegister = () => {
    setCurrentStep('register');
    setOtpData({ otp: '', email: '' });
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
      </div>

      <div className="relative max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo size={64} />
          </div>
          <h2 className="text-3xl font-bold text-white">
            {currentStep === 'register' ? 'Create Your Account' : 'Verify Your Email'}
          </h2>
          <p className="mt-2 text-gray-300">
            {currentStep === 'register'
              ? 'Start tracking your daily productivity and wellness'
              : `We've sent a verification code to ${otpData.email}`
            }
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {currentStep === 'verify' && (
            <button
              type="button"
              onClick={handleBackToRegister}
              className="flex items-center text-gray-300 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to registration
            </button>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {currentStep === 'register' ? (
              // Registration Form
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-12"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                      )}
                    </button>
                  </div>

                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Password strength</span>
                        <span className={`font-medium ${passwordStrength <= 2 ? 'text-red-400' : passwordStrength <= 3 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-12 ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? 'border-red-500/50'
                          : 'border-white/20'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                      )}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
                  )}
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="agreeToTerms"
                      name="agreeToTerms"
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded bg-white/5"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="agreeToTerms" className="text-gray-300">
                      I agree to the{' '}
                      <Link to="/terms" className="text-primary-400 hover:text-primary-300">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-primary-400 hover:text-primary-300">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || formData.password !== formData.confirmPassword || !formData.agreeToTerms}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    'Create Account'
                  )}
                </button>
              </>
            ) : (
              // OTP Verification Form
              <>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-200 mb-2">
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={otpData.otp}
                    onChange={handleOtpChange}
                    maxLength={6}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-center text-2xl tracking-widest"
                    placeholder="000000"
                  />
                  <p className="mt-2 text-xs text-gray-400">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || otpData.otp.length !== 6}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    'Verify Email'
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendCooldown > 0}
                    className="text-primary-400 hover:text-primary-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                  >
                    {resendCooldown > 0 ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Resend in {resendCooldown}s
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Resend Code
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {currentStep === 'register' && (
              <div className="text-center">
                <span className="text-gray-300">Already have an account? </span>
                <Link
                  to="/login"
                  className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </div>
            )}
          </form>
        </div>

        {/* Features Preview */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <h3 className="text-sm font-medium text-white mb-3">What you'll get:</h3>
          <div className="space-y-2">
            {[
              'Daily productivity scoring',
              'Task and time management',
              'Health and mood tracking',
              'Detailed analytics and insights'
            ].map((feature, index) => (
              <div key={index} className="flex items-center text-sm text-gray-300">
                <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;