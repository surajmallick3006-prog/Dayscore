import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Calendar, Zap, Users, Heart } from 'lucide-react';
import { useServerAuth } from '../context/ServerAuthContext';
import VibeWheel from '../components/VibeWheel';
import vibeService from '../services/vibeService';

const VibeWheelPage = () => {
  const [selectedVibe, setSelectedVibe] = useState(null);
  const [vibeHistory, setVibeHistory] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useServerAuth();

  useEffect(() => {
    if (user) {
      loadVibeData();
    }
  }, [user]);

  const loadVibeData = async () => {
    try {
      const [history, stats] = await Promise.all([
        getWheelSpinHistory(),
        vibeService.getWeeklyVibeSummary(user.id)
      ]);
      
      setVibeHistory(history);
      setWeeklyStats(stats);
    } catch (error) {
      console.error('Error loading vibe data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWheelSpinHistory = () => {
    // Get last 7 days of wheel spins from localStorage
    const history = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const spinData = localStorage.getItem(`vibeWheel_${user.id}_${dateStr}`);
      if (spinData) {
        try {
          const parsed = JSON.parse(spinData);
          history.push({
            date: dateStr,
            vibe: parsed,
            dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' })
          });
        } catch (error) {
          console.error('Error parsing spin data:', error);
        }
      }
    }
    
    return history.reverse(); // Show oldest first
  };

  const handleVibeSelected = (vibe) => {
    setSelectedVibe(vibe);
    // Refresh history to show new spin
    setTimeout(() => {
      loadVibeData();
    }, 1000);
  };

  const getVibeInsight = () => {
    if (!selectedVibe) return null;

    const insights = {
      productive: {
        tip: "Channel this energy into your most important tasks. Make a priority list and tackle the big ones first!",
        activities: ["Complete challenging projects", "Organize your workspace", "Set new goals", "Learn something new"]
      },
      calm: {
        tip: "Perfect time for mindful activities and gentle self-care. Listen to your body and mind today.",
        activities: ["Practice meditation", "Take a nature walk", "Read a good book", "Do gentle yoga"]
      },
      energetic: {
        tip: "Your high energy is perfect for physical activities and social connections. Make the most of it!",
        activities: ["Exercise or workout", "Connect with friends", "Start new projects", "Dance or move"]
      },
      rest: {
        tip: "Honor your need for rest. Sometimes the most productive thing is to slow down and recharge.",
        activities: ["Take a nap", "Practice deep breathing", "Journal your thoughts", "Listen to music"]
      },
      balanced: {
        tip: "You're in a great state for making decisions and maintaining harmony in all areas of life.",
        activities: ["Plan your week", "Balance work and play", "Practice gratitude", "Connect with nature"]
      },
      creative: {
        tip: "Your creative energy is flowing! This is the perfect time to express yourself and explore new ideas.",
        activities: ["Draw or paint", "Write in a journal", "Try a new recipe", "Brainstorm ideas"]
      }
    };

    return insights[selectedVibe.id] || null;
  };

  return (
    <div className="min-h-screen bg-gray-50 -m-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Sparkles className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Vibe Wheel</h1>
              <span className="text-3xl">🎡</span>
            </div>
            <p className="text-purple-100">
              Discover your daily energy and let the universe guide your vibe
            </p>
          </div>
          
          {weeklyStats && weeklyStats.totalVibes > 0 && (
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{weeklyStats.totalVibes}</div>
              <div className="text-sm text-purple-100">Vibes This Week</div>
              <div className="text-xs text-purple-200">Including wheel spins</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vibe Wheel */}
        <div className="space-y-6">
          <VibeWheel onVibeSelected={handleVibeSelected} />
          
          {/* Vibe Insight */}
          {selectedVibe && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-900">Vibe Insight</h3>
              </div>
              
              {(() => {
                const insight = getVibeInsight();
                if (!insight) return null;
                
                return (
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                      <h4 className="font-semibold text-yellow-900 mb-2">
                        {selectedVibe.emoji} {selectedVibe.label} Energy Tips
                      </h4>
                      <p className="text-sm text-yellow-800">{insight.tip}</p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-3">Perfect Activities for Today:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {insight.activities.map((activity, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm text-blue-800">
                            <span className="text-blue-500">•</span>
                            <span>{activity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Vibe History & Stats */}
        <div className="space-y-6">
          {/* Weekly Vibe History */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-6">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-semibold text-gray-900">Your Vibe Journey</h3>
            </div>
            
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : vibeHistory.length > 0 ? (
              <div className="space-y-4">
                {vibeHistory.map((entry, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-3xl">{entry.vibe.emoji}</div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{entry.vibe.label}</div>
                      <div className="text-sm text-gray-600">{entry.dayOfWeek}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No vibe history yet</p>
                <p className="text-xs text-gray-400">Spin the wheel to start your journey!</p>
              </div>
            )}
          </div>

          {/* Vibe Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">Vibe Analytics</h3>
            </div>
            
            {weeklyStats && weeklyStats.totalVibes > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">{weeklyStats.totalVibes}</div>
                    <div className="text-sm text-purple-700">Total Vibes</div>
                    <div className="text-xs text-purple-600">This week</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{weeklyStats.averageVibesPerDay}</div>
                    <div className="text-sm text-blue-700">Per Day</div>
                    <div className="text-xs text-blue-600">Average</div>
                  </div>
                </div>
                
                {weeklyStats.dominantVibe && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">Most Common Vibe This Week</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">
                        {vibeService.getVibeTypeInfo(weeklyStats.dominantVibe.type).emoji}
                      </span>
                      <div>
                        <div className="font-medium text-green-800">
                          {vibeService.getVibeTypeInfo(weeklyStats.dominantVibe.type).label}
                        </div>
                        <div className="text-sm text-green-700">
                          {weeklyStats.dominantVibe.count} times • Avg intensity: {weeklyStats.dominantVibe.averageIntensity}/3
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No vibe data yet</p>
                <p className="text-xs text-gray-400">Start tracking to see analytics</p>
              </div>
            )}
          </div>

          {/* Vibe Wheel Guide */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-6">
              <Heart className="w-5 h-5 text-pink-500" />
              <h3 className="text-lg font-semibold text-gray-900">How It Works</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">🎡 Daily Spin</h4>
                <p className="text-sm text-purple-800">
                  Spin once per day to discover what energy the universe has for you. Each result comes with personalized tips and activities.
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">📊 Track Your Journey</h4>
                <p className="text-sm text-blue-800">
                  Log your wheel results to your vibe tracker and see patterns in your energy over time. Share with the community for extra support!
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">✨ DayScore Boost</h4>
                <p className="text-sm text-green-800">
                  Spinning the wheel adds +1 engagement point to your DayScore. Sharing your result with the community gives you an extra +1 bonus!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VibeWheelPage;