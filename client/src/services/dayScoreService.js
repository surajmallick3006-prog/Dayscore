import { db } from '../config/firebase';
import { collection, doc, getDoc, setDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import hybridAuthService from './hybridAuthService';

class DayScoreService {
  constructor() {
    this.currentUser = null;
  }

  // Get current user ID
  getCurrentUserId() {
    const user = hybridAuthService.getCurrentUser();
    return user?.uid || user?.id;
  }

  // Calculate real-time day score from Firebase data
  async calculateTodayScore() {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Fetch all user data from Firebase for today
      const userData = await this.fetchTodayUserData(userId, todayStr);
      
      // Calculate component scores
      const componentScores = await this.calculateComponentScores(userData);
      
      // Calculate overall day score
      const overallScore = this.calculateOverallScore(componentScores);
      
      // Store the calculated score in Firebase
      await this.storeDayScore(userId, todayStr, {
        overall: overallScore,
        components: componentScores,
        timestamp: Timestamp.now(),
        date: todayStr
      });

      return {
        overall: overallScore,
        components: componentScores,
        date: todayStr,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error calculating today score:', error);
      throw error;
    }
  }

  // Fetch all user data for today from Firebase
  async fetchTodayUserData(userId, dateStr) {
    try {
      const today = new Date(dateStr);
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      // Fetch tasks for today
      const tasksRef = collection(db, 'users', userId, 'tasks');
      const tasksQuery = query(
        tasksRef,
        where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
        where('createdAt', '<=', Timestamp.fromDate(endOfDay))
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch time logs for today
      const timeLogsRef = collection(db, 'users', userId, 'timeLogs');
      const timeLogsQuery = query(
        timeLogsRef,
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay))
      );
      const timeLogsSnapshot = await getDocs(timeLogsQuery);
      const timeLogs = timeLogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch mood data for today
      const moodRef = collection(db, 'users', userId, 'moodLogs');
      const moodQuery = query(
        moodRef,
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay)),
        orderBy('date', 'desc'),
        limit(1)
      );
      const moodSnapshot = await getDocs(moodQuery);
      const moodData = moodSnapshot.docs.length > 0 ? moodSnapshot.docs[0].data() : null;

      // Fetch health data for today
      const healthRef = collection(db, 'users', userId, 'healthData');
      const healthQuery = query(
        healthRef,
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay)),
        orderBy('date', 'desc'),
        limit(1)
      );
      const healthSnapshot = await getDocs(healthQuery);
      const healthData = healthSnapshot.docs.length > 0 ? healthSnapshot.docs[0].data() : null;

      // Fetch screen time data for today
      const screenTimeRef = collection(db, 'users', userId, 'screenTime');
      const screenTimeQuery = query(
        screenTimeRef,
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay)),
        orderBy('date', 'desc'),
        limit(1)
      );
      const screenTimeSnapshot = await getDocs(screenTimeQuery);
      const screenTimeData = screenTimeSnapshot.docs.length > 0 ? screenTimeSnapshot.docs[0].data() : null;

      return {
        tasks,
        timeLogs,
        moodData,
        healthData,
        screenTimeData,
        date: dateStr
      };
    } catch (error) {
      console.error('Error fetching today user data:', error);
      return {
        tasks: [],
        timeLogs: [],
        moodData: null,
        healthData: null,
        screenTimeData: null,
        date: dateStr
      };
    }
  }

  // Calculate component scores from real data
  async calculateComponentScores(userData) {
    const { tasks, timeLogs, moodData, healthData, screenTimeData } = userData;

    // Calculate Productivity Score (0-100)
    const productivityScore = this.calculateProductivityScore(tasks, timeLogs);

    // Calculate Health Score (0-100)
    const healthScore = this.calculateHealthScore(healthData);

    // Calculate Focus Score (0-100)
    const focusScore = this.calculateFocusScore(screenTimeData, timeLogs);

    // Calculate Wellness Score (0-100)
    const wellnessScore = this.calculateWellnessScore(moodData);

    return {
      productivity: Math.round(productivityScore),
      health: Math.round(healthScore),
      focus: Math.round(focusScore),
      wellness: Math.round(wellnessScore)
    };
  }

  // Calculate productivity score from tasks and time logs
  calculateProductivityScore(tasks, timeLogs) {
    let score = 50; // Base score

    // Task completion rate (40% of score)
    if (tasks.length > 0) {
      const completedTasks = tasks.filter(task => task.status === 'done' || task.completed);
      const completionRate = completedTasks.length / tasks.length;
      score += completionRate * 40;
    }

    // Time tracking engagement (30% of score)
    if (timeLogs.length > 0) {
      const totalMinutes = timeLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
      const hours = totalMinutes / 60;
      
      // Optimal range: 4-8 hours of tracked time
      if (hours >= 4 && hours <= 8) {
        score += 30;
      } else if (hours > 0) {
        score += Math.min(30, (hours / 4) * 15);
      }
    }

    // Task creation and planning (20% of score)
    if (tasks.length > 0) {
      score += Math.min(20, tasks.length * 4); // Up to 5 tasks for full points
    }

    // Time distribution quality (10% of score)
    if (timeLogs.length > 1) {
      const categories = [...new Set(timeLogs.map(log => log.category))];
      score += Math.min(10, categories.length * 3); // Variety bonus
    }

    return Math.min(100, Math.max(0, score));
  }

  // Calculate health score from health data
  calculateHealthScore(healthData) {
    let score = 50; // Base score

    if (!healthData) return score;

    // Sleep duration (40% of score)
    if (healthData.sleepDuration) {
      const hours = healthData.sleepDuration;
      if (hours >= 7 && hours <= 9) {
        score += 40;
      } else if (hours >= 6 && hours <= 10) {
        score += 30;
      } else if (hours > 0) {
        score += 15;
      }
    }

    // Physical activity (30% of score)
    if (healthData.physicalActivity) {
      const minutes = healthData.physicalActivity;
      if (minutes >= 30) {
        score += 30;
      } else if (minutes > 0) {
        score += (minutes / 30) * 30;
      }
    }

    // Water intake (20% of score)
    if (healthData.waterIntake) {
      const glasses = healthData.waterIntake;
      if (glasses >= 8) {
        score += 20;
      } else if (glasses > 0) {
        score += (glasses / 8) * 20;
      }
    }

    // Meal tracking (10% of score)
    if (healthData.meals && healthData.meals.length > 0) {
      score += Math.min(10, healthData.meals.length * 3);
    }

    return Math.min(100, Math.max(0, score));
  }
  // Calculate focus score from screen time and time logs
  calculateFocusScore(screenTimeData, timeLogs) {
    let score = 50; // Base score

    // Screen time quality (50% of score)
    if (screenTimeData) {
      const { productiveTime = 0, totalTime = 1, distractions = 0 } = screenTimeData;
      const productiveRatio = productiveTime / totalTime;
      
      if (productiveRatio >= 0.7) {
        score += 25;
      } else {
        score += productiveRatio * 25;
      }

      // Distraction penalty
      const distractionPenalty = Math.min(25, distractions * 2);
      score -= distractionPenalty;
    }

    // Time log focus sessions (30% of score)
    if (timeLogs.length > 0) {
      const focusCategories = ['Study', 'Work', 'Learning'];
      const focusLogs = timeLogs.filter(log => 
        focusCategories.includes(log.category) || 
        focusCategories.some(cat => log.category?.includes(cat))
      );
      
      if (focusLogs.length > 0) {
        const focusMinutes = focusLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
        const focusHours = focusMinutes / 60;
        
        if (focusHours >= 3) {
          score += 30;
        } else {
          score += (focusHours / 3) * 30;
        }
      }
    }

    // Session consistency (20% of score)
    if (timeLogs.length >= 3) {
      score += 20; // Bonus for multiple focused sessions
    } else if (timeLogs.length > 0) {
      score += (timeLogs.length / 3) * 20;
    }

    return Math.min(100, Math.max(0, score));
  }

  // Calculate wellness score from mood data
  calculateWellnessScore(moodData) {
    let score = 50; // Base score

    if (!moodData) return score;

    // Mood level (40% of score)
    if (moodData.mood !== undefined) {
      const moodScore = (moodData.mood / 5) * 40; // Convert 1-5 to 0-40
      score += moodScore;
    }

    // Energy level (30% of score)
    if (moodData.energy !== undefined) {
      const energyScore = (moodData.energy / 10) * 30; // Convert 1-10 to 0-30
      score += energyScore;
    }

    // Stress management (20% of score) - inverted
    if (moodData.stress !== undefined) {
      const stressScore = ((10 - moodData.stress) / 10) * 20; // Lower stress = higher score
      score += stressScore;
    }

    // Gratitude/positivity (10% of score)
    if (moodData.gratitude && moodData.gratitude.length > 0) {
      score += 10;
    } else if (moodData.notes && moodData.notes.length > 20) {
      score += 5; // Partial credit for reflection
    }

    return Math.min(100, Math.max(0, score));
  }

  // Calculate overall day score with weighted components
  calculateOverallScore(componentScores) {
    const weights = {
      productivity: 0.30,
      health: 0.25,
      focus: 0.25,
      wellness: 0.20
    };

    const weightedScore = 
      (componentScores.productivity * weights.productivity) +
      (componentScores.health * weights.health) +
      (componentScores.focus * weights.focus) +
      (componentScores.wellness * weights.wellness);

    return Math.round(weightedScore);
  }
  // Store day score in Firebase
  async storeDayScore(userId, dateStr, scoreData) {
    try {
      const dayScoreRef = doc(db, 'users', userId, 'dayScores', dateStr);
      await setDoc(dayScoreRef, scoreData, { merge: true });
    } catch (error) {
      console.error('Error storing day score:', error);
    }
  }

  // Get stored day score from Firebase
  async getStoredDayScore(userId, dateStr) {
    try {
      const dayScoreRef = doc(db, 'users', userId, 'dayScores', dateStr);
      const docSnap = await getDoc(dayScoreRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting stored day score:', error);
      return null;
    }
  }

  // Get day score with caching (check Firebase first, calculate if needed)
  async getTodayScore(forceRecalculate = false) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const todayStr = new Date().toISOString().split('T')[0];
      
      // Check if we should use cached score
      if (!forceRecalculate) {
        const storedScore = await this.getStoredDayScore(userId, todayStr);
        if (storedScore) {
          // Check if score is recent (within last hour)
          const scoreTime = storedScore.timestamp?.toDate() || new Date(0);
          const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
          
          if (scoreTime > hourAgo) {
            return storedScore;
          }
        }
      }

      // Calculate fresh score
      return await this.calculateTodayScore();
    } catch (error) {
      console.error('Error getting today score:', error);
      // Return fallback score
      return {
        overall: 75,
        components: {
          productivity: 75,
          health: 75,
          focus: 75,
          wellness: 75
        },
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date(),
        isFallback: true
      };
    }
  }

  // Get historical day scores for trends
  async getHistoricalScores(userId, days = 30) {
    try {
      const dayScoresRef = collection(db, 'users', userId, 'dayScores');
      const scoresQuery = query(
        dayScoresRef,
        orderBy('date', 'desc'),
        limit(days)
      );
      
      const scoresSnapshot = await getDocs(scoresQuery);
      return scoresSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting historical scores:', error);
      return [];
    }
  }

  // Compare with yesterday's score
  async getYesterdayComparison() {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) return null;

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const todayStr = today.toISOString().split('T')[0];
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const [todayScore, yesterdayScore] = await Promise.all([
        this.getStoredDayScore(userId, todayStr),
        this.getStoredDayScore(userId, yesterdayStr)
      ]);

      if (todayScore && yesterdayScore) {
        const difference = todayScore.overall - yesterdayScore.overall;
        return {
          today: todayScore.overall,
          yesterday: yesterdayScore.overall,
          difference,
          trend: difference > 0 ? 'up' : difference < 0 ? 'down' : 'same',
          percentage: yesterdayScore.overall > 0 ? Math.round((difference / yesterdayScore.overall) * 100) : 0
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting yesterday comparison:', error);
      return null;
    }
  }
}

const dayScoreService = new DayScoreService();
export default dayScoreService;