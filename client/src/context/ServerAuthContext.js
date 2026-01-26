import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import hybridAuthService from '../services/hybridAuthService';

const ServerAuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload, loading: false };
    case 'CLEAR_USER':
      return { ...state, user: null, isAuthenticated: false, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_REGISTRATION_DATA':
      return { ...state, registrationData: action.payload };
    case 'CLEAR_REGISTRATION_DATA':
      return { ...state, registrationData: null };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  registrationData: null, // Stores email after registration for OTP verification
};

export const ServerAuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing authentication on app start
  useEffect(() => {
    const initializeAuth = async () => {
      if (hybridAuthService.isAuthenticated()) {
        const user = hybridAuthService.getCurrentUser();
        dispatch({ type: 'SET_USER', payload: user });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const result = await hybridAuthService.register(name, email, password);

      if (result.success) {
        dispatch({ type: 'SET_REGISTRATION_DATA', payload: { email } });
        toast.success('Registration initiated! Please check your email for the verification code.');
        return { success: true, email };
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
        toast.error(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const message = 'Registration failed. Please try again.';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const verifyOTP = useCallback(async (email, otp) => {
    try {
      console.log('🔄 ServerAuthContext: Starting OTP verification...');
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Verification timeout')), 30000) // 30 second timeout
      );

      console.log('🔄 ServerAuthContext: Calling hybridAuthService.verifyOTP...');
      const verificationPromise = hybridAuthService.verifyOTP(email, otp);

      console.log('⏳ ServerAuthContext: Waiting for verification result...');
      const result = await Promise.race([verificationPromise, timeoutPromise]);
      console.log('📥 ServerAuthContext: Received verification result:', result);

      if (result && result.success) {
        console.log('✅ ServerAuthContext: Verification successful, updating state...');
        dispatch({ type: 'SET_USER', payload: result.user });
        dispatch({ type: 'CLEAR_REGISTRATION_DATA' });
        toast.success('Email verified successfully! Welcome to DayScore.');
        console.log('✅ ServerAuthContext: State updated, returning success...');
        return { success: true, user: result.user };
      } else {
        console.log('❌ ServerAuthContext: Verification failed:', result?.error || 'Unknown error');
        const errorMessage = result?.error || 'Verification failed';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('❌ ServerAuthContext: Verification error:', error);
      let message = 'OTP verification failed. Please try again.';
      if (error.message === 'Verification timeout') {
        message = 'Verification is taking too long. Please check your connection and try again.';
      }
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    } finally {
      console.log('🔄 ServerAuthContext: Setting loading to false...');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const resendOTP = useCallback(async (email) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });

      const result = await hybridAuthService.resendOTP(email);

      if (result.success) {
        toast.success('OTP sent successfully! Please check your email.');
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
        toast.error(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const message = 'Failed to resend OTP. Please try again.';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const result = await hybridAuthService.login(email, password);

      if (result.success) {
        dispatch({ type: 'SET_USER', payload: result.user });
        toast.success('Welcome back!');
        return { success: true, user: result.user };
      } else if (result.needsVerification) {
        // User needs email verification
        dispatch({ type: 'SET_REGISTRATION_DATA', payload: { email, needsVerification: true } });
        toast.success('Verification code sent to your email!');
        return { success: false, needsVerification: true, error: result.error };
      } else if (result.isNewUser) {
        // New user, redirect to registration
        dispatch({ type: 'SET_ERROR', payload: result.error });
        toast.error(result.error);
        return { success: false, isNewUser: true, error: result.error };
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
        toast.error(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const message = 'Login failed. Please try again.';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const verifyLoginOTP = useCallback(async (email, otp) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const result = await hybridAuthService.verifyLoginOTP(email, otp);

      if (result.success) {
        dispatch({ type: 'SET_USER', payload: result.user });
        dispatch({ type: 'CLEAR_REGISTRATION_DATA' });
        toast.success('Email verified successfully! Welcome to DayScore.');
        return { success: true, user: result.user };
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
        toast.error(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const message = 'Verification failed. Please try again.';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const result = await hybridAuthService.logout();
      if (result.success) {
        dispatch({ type: 'CLEAR_USER' });
        toast.success('Logged out successfully');
      }
    } catch (error) {
      toast.error('Logout failed');
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value = {
    ...state,
    register,
    verifyOTP,
    resendOTP,
    login,
    verifyLoginOTP,
    logout,
    clearError,
  };

  return (
    <ServerAuthContext.Provider value={value}>
      {children}
    </ServerAuthContext.Provider>
  );
};

export const useServerAuth = () => {
  const context = useContext(ServerAuthContext);
  if (!context) {
    throw new Error('useServerAuth must be used within a ServerAuthProvider');
  }
  return context;
};