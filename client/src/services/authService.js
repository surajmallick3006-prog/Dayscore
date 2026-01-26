import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

class AuthService {
  constructor() {
    this.auth = auth;
    this.db = db;
  }

  // Register new user
  async register(email, password, name) {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Update the user's display name
      await updateProfile(user, {
        displayName: name
      });

      // Send email verification
      await sendEmailVerification(user);

      // Create user document in Firestore
      const userData = {
        uid: user.uid,
        name: name,
        email: email,
        createdAt: new Date().toISOString(),
        emailVerified: false,
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
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
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
      };

      await setDoc(doc(this.db, 'users', user.uid), userData);

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          ...userData
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Login user
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(this.db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};

      // Update last active date
      await updateDoc(doc(this.db, 'users', user.uid), {
        'streaks.lastActiveDate': new Date().toISOString()
      });

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          ...userData
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Logout user
  async logout() {
    try {
      await signOut(this.auth);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Get current user
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(this.db, 'users', user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          ...userData
        });
      } else {
        callback(null);
      }
    });
  }

  // Update user profile
  async updateUserProfile(updates) {
    try {
      const user = this.getCurrentUser();
      if (!user) throw new Error('No user logged in');

      // Update Firebase Auth profile if name is being updated
      if (updates.name && updates.name !== user.displayName) {
        await updateProfile(user, {
          displayName: updates.name
        });
      }

      // Update Firestore document
      await updateDoc(doc(this.db, 'users', user.uid), {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      // Get updated user data
      const userDoc = await getDoc(doc(this.db, 'users', user.uid));
      const userData = userDoc.data();

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          ...userData
        }
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Send password reset email
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Get user token for API calls
  async getUserToken() {
    try {
      const user = this.getCurrentUser();
      if (!user) return null;
      return await user.getIdToken();
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }

  // Helper method to convert Firebase error codes to user-friendly messages
  getErrorMessage(errorCode) {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}

export default new AuthService();