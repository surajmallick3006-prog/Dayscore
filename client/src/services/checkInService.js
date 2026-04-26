import { db } from '../config/firebase';
import { collection, doc, setDoc, getDocs, query, where, orderBy, limit, deleteDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import dayScoreService from './dayScoreService';
import vibeService from './vibeService';

class CheckInService {
  constructor() {
    this.moodEmojis = {
      1: '😢', 2: '😔', 3: '😐', 4: '🙂', 5: '😊',
      6: '😄', 7: '🤗', 8: '😍', 9: '🤩', 10: '🥳'
    };
    
    this.dayScoreEmojis = {
      excellent: '🌟', // 90-100
      great: '🌿', // 80-89
      good: '🌱', // 70-79
      fair: '⭐', // 60-69
      needs_work: '🌧️' // <60
    };
  }

  // Auto-detect user's current mood from recent data
  async autoDetectMood(userId) {
    try {
      // Get today's vibe data
      const todayVibes = await vibeService.getTodayVibes(userId);
      
      if (todayVibes.length > 0) {
        // Calculate mood from vibes
        const positiveVibes = ['energetic', 'calm', 'focused', 'creative', 'motivated', 'peaceful', 'happy', 'confident'];
        const negativeVibes = ['tired', 'stressed', 'anxious', 'overwhelmed'];
        
        let moodScore = 5; // Default neutral
        let totalIntensity = 0;
        let vibeCount = 0;
        
        todayVibes.forEach(vibe => {
          vibeCount++;
          if (positiveVibes.includes(vibe.vibeType)) {
            moodScore += vibe.intensity * 0.8;
            totalIntensity += vibe.intensity;
          } else if (negativeVibes.includes(vibe.vibeType)) {
            moodScore -= vibe.intensity * 0.6;
            totalIntensity += vibe.intensity;
          }
        });
        
        // Normalize mood score (1-10 scale)
        moodScore = Math.max(1, Math.min(10, Math.round(moodScore)));
        
        // Get dominant vibe for mood label
        const vibeStats = await vibeService.getVibeStats(userId, 1);
        const dominantVibe = vibeStats?.mostCommonVibe?.type;
        
        return {
          score: moodScore,
          emoji: this.moodEmojis[moodScore],
          label: this.getMoodLabel(moodScore),
          dominantVibe: dominantVibe ? vibeService.getVibeTypeInfo(dominantVibe) : null,
          source: 'vibe_data'
        };
      }
      
      // Fallback to default mood
      return {
        score: 5,
        emoji: this.moodEmojis[5],
        label: 'Neutral',
        dominantVibe: null,
        source: 'default'
      };
      
    } catch (error) {
      console.error('Error auto-detecting mood:', error);
      return {
        score: 5,
        emoji: this.moodEmojis[5],
        label: 'Neutral',
        dominantVibe: null,
        source: 'error'
      };
    }
  }

  // Get mood label from score
  getMoodLabel(score) {
    if (score >= 9) return 'Amazing';
    if (score >= 8) return 'Great';
    if (score >= 7) return 'Good';
    if (score >= 6) return 'Pretty Good';
    if (score >= 5) return 'Okay';
    if (score >= 4) return 'Meh';
    if (score >= 3) return 'Not Great';
    if (score >= 2) return 'Rough';
    return 'Tough';
  }

  // Get DayScore emoji based on score
  getDayScoreEmoji(score) {
    if (score >= 90) return this.dayScoreEmojis.excellent;
    if (score >= 80) return this.dayScoreEmojis.great;
    if (score >= 70) return this.dayScoreEmojis.good;
    if (score >= 60) return this.dayScoreEmojis.fair;
    return this.dayScoreEmojis.needs_work;
  }

  // Create a daily check-in
  async createCheckIn(userId, userData, checkInData) {
    try {
      // Get auto-detected data
      const [dayScoreData, moodData] = await Promise.all([
        dayScoreService.getTodayScore(),
        this.autoDetectMood(userId)
      ]);

      const checkIn = {
        userId,
        userName: userData.name || 'Anonymous',
        userAvatar: userData.avatar || null,
        
        // Auto-fetched data
        dayScore: dayScoreData?.overall || 75,
        dayScoreEmoji: this.getDayScoreEmoji(dayScoreData?.overall || 75),
        mood: moodData.score,
        moodEmoji: moodData.emoji,
        moodLabel: moodData.label,
        dominantVibe: moodData.dominantVibe,
        
        // User input
        thought: checkInData.thought || '',
        
        // Metadata
        date: format(new Date(), 'yyyy-MM-dd'),
        timestamp: new Date(),
        createdAt: new Date(),
        
        // Social features
        likes: [],
        supportMessages: [],
        likeCount: 0,
        supportCount: 0,
        
        // Privacy
        isPublic: checkInData.isPublic !== false // Default to public
      };

      const docId = `${userId}_${format(new Date(), 'yyyy-MM-dd')}`;
      await setDoc(doc(db, 'checkIns', docId), checkIn);
      
      console.log('✅ Check-in created successfully');
      return { id: docId, ...checkIn };
    } catch (error) {
      console.error('❌ Error creating check-in:', error);
      throw error;
    }
  }

  // Get user's check-in for today
  async getTodayCheckIn(userId) {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const docId = `${userId}_${today}`;
      
      const q = query(
        collection(db, 'checkIns'),
        where('userId', '==', userId),
        where('date', '==', today),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error fetching today\'s check-in:', error);
      return null;
    }
  }

  // Get community check-ins (recent public check-ins)
  async getCommunityCheckIns(limit = 20) {
    try {
      const q = query(
        collection(db, 'checkIns'),
        where('isPublic', '==', true),
        orderBy('timestamp', 'desc'),
        limit(limit)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Error fetching community check-ins:', error);
      return [];
    }
  }

  // Get check-ins for a specific date range
  async getCheckInsInRange(startDate, endDate, userId = null) {
    try {
      let q;
      
      if (userId) {
        q = query(
          collection(db, 'checkIns'),
          where('userId', '==', userId),
          where('timestamp', '>=', startOfDay(startDate)),
          where('timestamp', '<=', endOfDay(endDate)),
          orderBy('timestamp', 'desc')
        );
      } else {
        q = query(
          collection(db, 'checkIns'),
          where('isPublic', '==', true),
          where('timestamp', '>=', startOfDay(startDate)),
          where('timestamp', '<=', endOfDay(endDate)),
          orderBy('timestamp', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Error fetching check-ins in range:', error);
      return [];
    }
  }

  // Like a check-in
  async likeCheckIn(checkInId, userId) {
    try {
      const checkInRef = doc(db, 'checkIns', checkInId);
      await updateDoc(checkInRef, {
        likes: arrayUnion(userId),
        likeCount: arrayUnion(userId).length
      });
      
      console.log('✅ Check-in liked');
    } catch (error) {
      console.error('❌ Error liking check-in:', error);
      throw error;
    }
  }

  // Unlike a check-in
  async unlikeCheckIn(checkInId, userId) {
    try {
      const checkInRef = doc(db, 'checkIns', checkInId);
      await updateDoc(checkInRef, {
        likes: arrayRemove(userId)
      });
      
      console.log('✅ Check-in unliked');
    } catch (error) {
      console.error('❌ Error unliking check-in:', error);
      throw error;
    }
  }

  // Add support message to check-in
  async addSupportMessage(checkInId, userId, userName, message) {
    try {
      const supportMessage = {
        id: Date.now().toString(),
        userId,
        userName,
        message,
        timestamp: new Date()
      };

      const checkInRef = doc(db, 'checkIns', checkInId);
      await updateDoc(checkInRef, {
        supportMessages: arrayUnion(supportMessage),
        supportCount: arrayUnion(supportMessage).length
      });
      
      console.log('✅ Support message added');
      return supportMessage;
    } catch (error) {
      console.error('❌ Error adding support message:', error);
      throw error;
    }
  }

  // Delete a check-in
  async deleteCheckIn(checkInId, userId) {
    try {
      // Verify ownership
      const checkInRef = doc(db, 'checkIns', checkInId);
      const checkInDoc = await getDocs(query(collection(db, 'checkIns'), where('userId', '==', userId)));
      
      if (checkInDoc.empty) {
        throw new Error('Check-in not found or unauthorized');
      }

      await deleteDoc(checkInRef);
      console.log('✅ Check-in deleted');
    } catch (error) {
      console.error('❌ Error deleting check-in:', error);
      throw error;
    }
  }

  // Update check-in thought
  async updateCheckInThought(checkInId, userId, newThought) {
    try {
      const checkInRef = doc(db, 'checkIns', checkInId);
      await updateDoc(checkInRef, {
        thought: newThought,
        updatedAt: new Date()
      });
      
      console.log('✅ Check-in thought updated');
    } catch (error) {
      console.error('❌ Error updating check-in thought:', error);
      throw error;
    }
  }

  // Get user's check-in streak
  async getCheckInStreak(userId) {
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, 30); // Check last 30 days
      
      const checkIns = await this.getCheckInsInRange(startDate, endDate, userId);
      
      // Calculate streak
      let streak = 0;
      let currentDate = new Date();
      
      while (streak < 30) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const hasCheckIn = checkIns.some(checkIn => checkIn.date === dateStr);
        
        if (hasCheckIn) {
          streak++;
          currentDate = subDays(currentDate, 1);
        } else {
          break;
        }
      }
      
      return {
        currentStreak: streak,
        totalCheckIns: checkIns.length,
        averageDayScore: checkIns.length > 0 ? 
          Math.round(checkIns.reduce((sum, c) => sum + c.dayScore, 0) / checkIns.length) : 0,
        averageMood: checkIns.length > 0 ? 
          Math.round(checkIns.reduce((sum, c) => sum + c.mood, 0) / checkIns.length) : 0
      };
    } catch (error) {
      console.error('❌ Error calculating check-in streak:', error);
      return {
        currentStreak: 0,
        totalCheckIns: 0,
        averageDayScore: 0,
        averageMood: 0
      };
    }
  }

  // Check if user has checked in today
  async hasCheckedInToday(userId) {
    try {
      const todayCheckIn = await this.getTodayCheckIn(userId);
      return todayCheckIn !== null;
    } catch (error) {
      console.error('❌ Error checking today\'s check-in status:', error);
      return false;
    }
  }

  // Get check-in analytics for user
  async getCheckInAnalytics(userId, days = 30) {
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, days);
      
      const checkIns = await this.getCheckInsInRange(startDate, endDate, userId);
      
      if (checkIns.length === 0) {
        return {
          totalCheckIns: 0,
          averageDayScore: 0,
          averageMood: 0,
          moodTrend: 'stable',
          dayScoreTrend: 'stable',
          mostCommonMood: null,
          checkInFrequency: 0
        };
      }
      
      // Calculate trends
      const recentCheckIns = checkIns.slice(0, Math.floor(checkIns.length / 2));
      const olderCheckIns = checkIns.slice(Math.floor(checkIns.length / 2));
      
      const recentAvgMood = recentCheckIns.reduce((sum, c) => sum + c.mood, 0) / recentCheckIns.length;
      const olderAvgMood = olderCheckIns.reduce((sum, c) => sum + c.mood, 0) / olderCheckIns.length;
      
      const recentAvgScore = recentCheckIns.reduce((sum, c) => sum + c.dayScore, 0) / recentCheckIns.length;
      const olderAvgScore = olderCheckIns.reduce((sum, c) => sum + c.dayScore, 0) / olderCheckIns.length;
      
      return {
        totalCheckIns: checkIns.length,
        averageDayScore: Math.round(checkIns.reduce((sum, c) => sum + c.dayScore, 0) / checkIns.length),
        averageMood: Math.round(checkIns.reduce((sum, c) => sum + c.mood, 0) / checkIns.length),
        moodTrend: recentAvgMood > olderAvgMood + 0.5 ? 'improving' : 
                   recentAvgMood < olderAvgMood - 0.5 ? 'declining' : 'stable',
        dayScoreTrend: recentAvgScore > olderAvgScore + 2 ? 'improving' : 
                       recentAvgScore < olderAvgScore - 2 ? 'declining' : 'stable',
        mostCommonMood: this.getMostCommonMood(checkIns),
        checkInFrequency: Math.round((checkIns.length / days) * 100) // Percentage
      };
    } catch (error) {
      console.error('❌ Error getting check-in analytics:', error);
      return null;
    }
  }

  // Helper: Get most common mood from check-ins
  getMostCommonMood(checkIns) {
    const moodCounts = {};
    
    checkIns.forEach(checkIn => {
      const moodLabel = checkIn.moodLabel;
      moodCounts[moodLabel] = (moodCounts[moodLabel] || 0) + 1;
    });
    
    let mostCommon = null;
    let maxCount = 0;
    
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = mood;
      }
    });
    
    return mostCommon;
  }
}

const checkInService = new CheckInService();
export default checkInService;