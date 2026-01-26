import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  registerWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignIn,
  signInWithGoogle,
  signOutUser,
  resetPassword,
  onAuthStateChange,
  getCurrentUser
} from '../services/authService';

const FirebaseAuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true, loading: false };
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

export const FirebaseAuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        dispatch({
          type: 'SET_USER',
          payload: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified
          }
        });
      } else {
        dispatch({ type: 'CLEAR_USER' });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const result = await firebaseSignIn(email, password);
      
      if (result.success) {
        toast.success('Welcome back!');
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
        toast.error(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const message = error.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const result = await registerWithEmailAndPassword(name, email, password);
      
      if (result.success) {
        toast.success('Account created successfully!');
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
        toast.error(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const message = error.message || 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const result = await signInWithGoogle();
      
      if (result.success) {
        toast.success('Welcome!');
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error });
        toast.error(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const message = error.message || 'Google sign-in failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOutUser();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  }, []);

  const sendPasswordReset = useCallback(async (email) => {
    try {
      const result = await resetPassword(email);
      
      if (result.success) {
        toast.success('Password reset email sent!');
        return { success: true };
      } else {
        toast.error(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const message = error.message || 'Failed to send reset email';
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
    loginWithGoogle,
    logout,
    sendPasswordReset,
    clearError,
    getCurrentUser
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};