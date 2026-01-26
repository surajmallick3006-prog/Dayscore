import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../config/firebase';
import toast from 'react-hot-toast';

class FirebaseAuthService {
  constructor() {
    this.auth = auth;
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      toast.success('Welcome back!');
      return {
        success: true,
        user: {
          _id: user.uid,
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
          scoreWeights: {
            productivity: 30,
            health: 25,
            focus: 25,
            mood: 20
          },
          preferences: {
            theme: 'light',
            notifications: {
              email: true,
              push: true,
              dailyReminder: true
            },
            timezone: 'UTC'
          },
          dailyGoals: {
            studyHours: 4,
            workHours: 8,
            sleepHours: 8,
            steps: 10000,
            tasksCompleted: 5
          },
          streaks: {
            current: 0,
            longest: 0,
            lastActiveDate: new Date().toISOString()
          }
        },
        token: await user.getIdToken()
      };
    } catch (error) {
      console.error('Firebase sign in error:', error);
      let message = 'Login failed';
      
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          message = 'This account has been disabled';
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Please try again later';
          break;
        default:
          message = error.message;
      }
      
      toast.error(message);
      return { success: false, error: message };
    }
  }

  // Register new user
  async register(name, email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // Update the user's display name
      await updateProfile(user, {
        displayName: name
      });
      
      toast.success('Account created successfully!');
      return {
        success: true,
        user: {
          _id: user.uid,
          name: name,
          email: user.email,
          scoreWeights: {
            productivity: 30,
            health: 25,
            focus: 25,
            mood: 20
          },
          preferences: {
            theme: 'light',
            notifications: {
              email: true,
              push: true,
              dailyReminder: true
            },
            timezone: 'UTC'
          },
          dailyGoals: {
            studyHours: 4,
            workHours: 8,
            sleepHours: 8,
            steps: 10000,
            tasksCompleted: 5
          },
          streaks: {
            current: 0,
            longest: 0,
            lastActiveDate: new Date().toISOString()
          }
        },
        token: await user.getIdToken()
      };
    } catch (error) {
      console.error('Firebase registration error:', error);
      let message = 'Registration failed';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'An account with this email already exists';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address';
          break;
        case 'auth/weak-password':
          message = 'Password should be at least 6 characters';
          break;
        default:
          message = error.message;
      }
      
      toast.error(message);
      return { success: false, error: message };
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOut(this.auth);
      toast.success('Logged out successfully');
      return { success: true };
    } catch (error) {
      console.error('Firebase sign out error:', error);
      toast.error('Failed to log out');
      return { success: false, error: error.message };
    }
  }

  // Send password reset email
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      toast.success('Password reset email sent');
      return { success: true };
    } catch (error) {
      console.error('Firebase password reset error:', error);
      let message = 'Failed to send password reset email';
      
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'No account found with this email';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address';
          break;
        default:
          message = error.message;
      }
      
      toast.error(message);
      return { success: false, error: message };
    }
  }

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(this.auth, callback);
  }

  // Get current user
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // Get current user token
  async getCurrentUserToken() {
    const user = this.getCurrentUser();
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }
}

export default new FirebaseAuthService();