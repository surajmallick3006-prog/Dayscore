import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import authService from '../services/authService';

const AuthContext = createContext();

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
    default:
      return state;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      dispatch({ type: 'SET_USER', payload: user });
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const result = await authService.login(email, password);
      
      if (result.success) {
        dispatch({ type: 'SET_USER', payload: result.user });
        toast.success('Welcome back!');
        return { success: true };
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
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const result = await authService.register(email, password, name);
      
      if (result.success) {
        dispatch({ type: 'SET_USER', payload: result.user });
        toast.success('Account created successfully! Please check your email to verify your account.');
        return { success: true };
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
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const result = await authService.logout();
      if (result.success) {
        dispatch({ type: 'CLEAR_USER' });
        toast.success('Logged out successfully');
      }
    } catch (error) {
      toast.error('Logout failed');
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const result = await authService.updateUserProfile(profileData);
      if (result.success) {
        dispatch({ type: 'SET_USER', payload: result.user });
        toast.success('Profile updated successfully');
        return { success: true };
      } else {
        toast.error(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const message = 'Failed to update profile';
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    try {
      const result = await authService.resetPassword(email);
      if (result.success) {
        toast.success('Password reset email sent! Check your inbox.');
        return { success: true };
      } else {
        toast.error(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const message = 'Failed to send password reset email';
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;