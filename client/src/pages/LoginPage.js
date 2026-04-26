import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useServerAuth } from '../context/ServerAuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Logo from '../components/Logo';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState('login'); // 'login' or 'verify'
  const [otpData, setOtpData] = useState({ otp: '', email: '' });
  const [resendCooldown, setResendCooldown] = useState(0);

  const { login, verifyLoginOTP, isAuthenticated, loading, error, clearError, registrationData } = useServerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/app/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Set OTP email when verification is needed
  useEffect(() => {
    if (registrationData?.email && registrationData?.needsVerification) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError(); // Clear any previous errors
    setIsSubmitting(true);
    
    if (currentStep === 'login') {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else if (result.needsVerification) {
        // Will be handled by useEffect above
      } else if (result.isNewUser) {
        // Redirect to registration
        navigate('/register', { state: { email: formData.email } });
      }
    } else {
      // OTP verification step
      const result = await verifyLoginOTP(otpData.email, otpData.otp);
      if (result.success) {
        navigate(from, { replace: true });
      }
    }
    
    setIsSubmitting(false);
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    setOtpData(prev => ({ ...prev, otp: value }));
  };

  const handleBackToLogin = () => {
    setCurrentStep('login');
    setOtpData({ otp: '', email: '' });
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
            {currentStep === 'login' ? 'Welcome Back' : 'Verify Your Email'}
          </h2>
          <p className="mt-2 text-gray-300">
            {currentStep === 'login'
              ? 'Please enter your details to track today\'s score.'
              : `We've sent a verification code to ${otpData.email}`
            }
          </p>
          
          {currentStep === 'login' && (
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-500/10 text-primary-400 border border-primary-500/20">
              Global Average DayScore: 7.8/10 ✨
            </div>
          )}
        </div>

        {/* Login/Verification Form Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {currentStep === 'verify' && (
            <button
              type="button"
              onClick={handleBackToLogin}
              className="flex items-center text-gray-300 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </button>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {currentStep === 'login' ? (
              // Login Form
              <>
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
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-12"
                      placeholder="Enter your password"
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
                </div>
              </>
            ) : (
              // OTP Verification Form
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
            )}

            {currentStep === 'login' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded bg-white/5"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-300">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <span className="text-gray-400">
                    Forgot password?
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || (currentStep === 'verify' && otpData.otp.length !== 6)}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                currentStep === 'login' ? 'Sign In' : 'Verify Email'
              )}
            </button>

            {currentStep === 'login' && (
              <div className="text-center">
                <span className="text-gray-300">Don't have an account? </span>
                <Link
                  to="/register"
                  className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </form>
        </div>

        {/* Demo Analytics Preview */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-300">Demo Analytics</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-white">85</div>
              <div className="text-xs text-gray-400">Productivity</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-white">92</div>
              <div className="text-xs text-gray-400">Health</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-white">78</div>
              <div className="text-xs text-gray-400">Focus</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;