import { db } from '../config/firebase';
import { collection, doc, setDoc, getDocs, query, where, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek } from 'date-fns';

class VibeService {
  constructor() {
    this.vibeTypes = {
      energetic: { emoji: '⚡', label: 'Energetic', color: 'bg-yellow-100 text-yellow-800' },
      calm: { emoji: '😌', label: 'Calm', color: 'bg-blue-100 text-blue-800' },
      focused: { emoji: '🎯', label: 'Focused', color: 'bg-purple-100 text-purple-800' },
      creative: { emoji: '🎨', label: 'Creative', color: 'bg-pink-100 text-pink-800' },
      motivated: { emoji: '🔥', label: 'Motivated', color: 'bg-red-100 text-red-800' },
      peaceful: { emoji: '🧘', label: 'Peaceful', color: 'bg-green-100 text-green-800' },
      tired: { emoji: '😴', label: 'Tired', color: 'bg-gray-100 text-gray-800' },
      stressed: { emoji: '😰', label: 'Stressed', color: 'bg-orange-100 text-orange-800' },
      happy: { emoji: '😊', label: 'Happy', color: 'bg-emerald-100 text-emerald-800' },
      anxious: { emoji: '😟', label: 'Anxious', color: 'bg-amber-100 text-amber-800' },
      confident: { emoji: '💪', label: 'Confident', color: 'bg-indigo-100 text-indigo-800' },
      overwhelmed: { emoji: '🤯', label: 'Overwhelmed', color: 'bg-rose-100 text-rose-800' }
    };

    this.intensityLevels = {
      low: { label: 'Mild', value: 1 },
      medium: { label: 'Moderate', value: 2 },
      high: { label: 'Strong', value: 3 }
    };
  }

  // Save a vibe entry
  async saveVibe(userId, vibeData) {
    try {
      const vibeEntry = {
        userId,
        vibeType: vibeData.vibeType,
        intensity: vibeData.intensity,
        note: vibeData.note || '',
        timestamp: new Date(),
        date: format(new Date(), 'yyyy-MM-dd'),
        createdAt: new Date()
      };

      const docId = `${userId}_${Date.now()}`;
      await setDoc(doc(db, 'vibes', docId), vibeEntry);
      
      console.log('✅ Vibe saved successfully');
      return vibeEntry;
    } catch (error) {
      console.error('❌ Error saving vibe:', error);
      throw error;
    }
  }

  // Get today's vibes for a user
  async getTodayVibes(userId) {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const q = query(
        collection(db, 'vibes'),
        where('userId', '==', userId),
        where('date', '==', today),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Error fetching today\'s vibes:', error);
      return [];
    }
  }

  // Get vibes for a specific date range
  async getVibesInRange(userId, startDate, endDate) {
    try {
      const q = query(
        collection(db, 'vibes'),
        where('userId', '==', userId),
        where('timestamp', '>=', startOfDay(startDate)),
        where('timestamp', '<=', endOfDay(endDate)),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Error fetching vibes in range:', error);
      return [];
    }
  }

  // Get weekly vibe summary
  async getWeeklyVibeSummary(userId, date = new Date()) {
    try {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
      
      const vibes = await this.getVibesInRange(userId, weekStart, weekEnd);
      
      // Group by day
      const dailyVibes = {};
      const vibeCounts = {};
      const intensitySum = {};
      
      vibes.forEach(vibe => {
        const day = format(vibe.timestamp.toDate(), 'yyyy-MM-dd');
        
        if (!dailyVibes[day]) {
          dailyVibes[day] = [];
        }
        dailyVibes[day].push(vibe);
        
        // Count vibe types
        if (!vibeCounts[vibe.vibeType]) {
          vibeCounts[vibe.vibeType] = 0;
          intensitySum[vibe.vibeType] = 0;
        }
        vibeCounts[vibe.vibeType]++;
        intensitySum[vibe.vibeType] += vibe.intensity;
      });

      // Calculate dominant vibe
      let dominantVibe = null;
      let maxCount = 0;
      
      Object.entries(vibeCounts).forEach(([vibeType, count]) => {
        if (count > maxCount) {
          maxCount = count;
          dominantVibe = {
            type: vibeType,
            count,
            averageIntensity: Math.round(intensitySum[vibeType] / count * 10) / 10
          };
        }
      });

      return {
        weekStart,
        weekEnd,
        totalVibes: vibes.length,
        dailyVibes,
        vibeCounts,
        dominantVibe,
        averageVibesPerDay: Math.round((vibes.length / 7) * 10) / 10
      };
    } catch (error) {
      console.error('❌ Error getting weekly vibe summary:', error);
      return null;
    }
  }

  // Get vibe trends over time
  async getVibeTrends(userId, days = 30) {
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, days);
      
      const vibes = await this.getVibesInRange(userId, startDate, endDate);
      
      // Group by date
      const dailyTrends = {};
      
      for (let i = 0; i < days; i++) {
        const date = subDays(endDate, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        dailyTrends[dateStr] = {
          date: dateStr,
          vibes: [],
          dominantVibe: null,
          averageIntensity: 0,
          totalVibes: 0
        };
      }
      
      // Populate with actual data
      vibes.forEach(vibe => {
        const dateStr = format(vibe.timestamp.toDate(), 'yyyy-MM-dd');
        if (dailyTrends[dateStr]) {
          dailyTrends[dateStr].vibes.push(vibe);
          dailyTrends[dateStr].totalVibes++;
        }
      });
      
      // Calculate daily summaries
      Object.values(dailyTrends).forEach(day => {
        if (day.vibes.length > 0) {
          // Find most common vibe for the day
          const vibeCounts = {};
          let totalIntensity = 0;
          
          day.vibes.forEach(vibe => {
            vibeCounts[vibe.vibeType] = (vibeCounts[vibe.vibeType] || 0) + 1;
            totalIntensity += vibe.intensity;
          });
          
          // Get dominant vibe
          let maxCount = 0;
          let dominantVibeType = null;
          
          Object.entries(vibeCounts).forEach(([vibeType, count]) => {
            if (count > maxCount) {
              maxCount = count;
              dominantVibeType = vibeType;
            }
          });
          
          day.dominantVibe = dominantVibeType;
          day.averageIntensity = totalIntensity / day.vibes.length;
        }
      });
      
      return Object.values(dailyTrends).reverse(); // Most recent first
    } catch (error) {
      console.error('❌ Error getting vibe trends:', error);
      return [];
    }
  }

  // Delete a vibe entry
  async deleteVibe(vibeId) {
    try {
      await deleteDoc(doc(db, 'vibes', vibeId));
      console.log('✅ Vibe deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting vibe:', error);
      throw error;
    }
  }

  // Get vibe statistics
  async getVibeStats(userId, days = 30) {
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, days);
      
      const vibes = await this.getVibesInRange(userId, startDate, endDate);
      
      if (vibes.length === 0) {
        return {
          totalVibes: 0,
          averageIntensity: 0,
          mostCommonVibe: null,
          vibeDistribution: {},
          streaks: {},
          moodScore: 0
        };
      }
      
      // Calculate statistics
      const vibeCounts = {};
      const intensitySum = {};
      let totalIntensity = 0;
      
      vibes.forEach(vibe => {
        vibeCounts[vibe.vibeType] = (vibeCounts[vibe.vibeType] || 0) + 1;
        intensitySum[vibe.vibeType] = (intensitySum[vibe.vibeType] || 0) + vibe.intensity;
        totalIntensity += vibe.intensity;
      });
      
      // Find most common vibe
      let mostCommonVibe = null;
      let maxCount = 0;
      
      Object.entries(vibeCounts).forEach(([vibeType, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommonVibe = {
            type: vibeType,
            count,
            percentage: Math.round((count / vibes.length) * 100),
            averageIntensity: Math.round((intensitySum[vibeType] / count) * 10) / 10
          };
        }
      });
      
      // Calculate mood score (positive vibes weighted higher)
      const positiveVibes = ['energetic', 'calm', 'focused', 'creative', 'motivated', 'peaceful', 'happy', 'confident'];
      const positiveCount = vibes.filter(v => positiveVibes.includes(v.vibeType)).length;
      const moodScore = Math.round((positiveCount / vibes.length) * 100);
      
      return {
        totalVibes: vibes.length,
        averageIntensity: Math.round((totalIntensity / vibes.length) * 10) / 10,
        mostCommonVibe,
        vibeDistribution: vibeCounts,
        moodScore,
        averageVibesPerDay: Math.round((vibes.length / days) * 10) / 10
      };
    } catch (error) {
      console.error('❌ Error getting vibe stats:', error);
      return null;
    }
  }

  // Check if user has logged a vibe today
  async hasLoggedVibeToday(userId) {
    try {
      const todayVibes = await this.getTodayVibes(userId);
      return todayVibes.length > 0;
    } catch (error) {
      console.error('❌ Error checking today\'s vibe log:', error);
      return false;
    }
  }

  // Get vibe type info
  getVibeTypeInfo(vibeType) {
    return this.vibeTypes[vibeType] || null;
  }

  // Get all vibe types
  getAllVibeTypes() {
    return this.vibeTypes;
  }

  // Get intensity levels
  getIntensityLevels() {
    return this.intensityLevels;
  }
}

const vibeService = new VibeService();
export default vibeService;