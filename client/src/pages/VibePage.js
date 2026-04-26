import React, { useState, useEffect } from 'react';
import { Heart, TrendingUp, Calendar, Zap, Target, BarChart3 } from 'lucide-react';
import { useServerAuth } from '../context/ServerAuthContext';
import VibeTracker from '../components/VibeTracker';
import VibeAnalytics from '../components/VibeAnalytics';
import vibeService from '../services/vibeService';

const VibePage = () => {
  const [activeTab, setActiveTab] = useState('tracker');
  const [recentVibes, setRecentVibes] = useState([]);
  const [vibeStats, setVibeStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useServerAuth();

  useEffect(() => {
    if (user) {
      loadVibeData();
    }
  }, [user]);

  const loadVibeData = async () => {
    try {
      const [recent, stats] = await Promise.all([
        vibeService.getVibesInRange(user.id, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
        vibeService.getVibeStats(user.id, 7)
      ]);
      
      setRecentVibes(recent);
      setVibeStats(stats);
    } catch (error) {
      console.error('Error loading vibe data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'tracker', label: 'Vibe Tracker', icon: Heart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'insights', label: 'Insights', icon: TrendingUp }
  ];

  const vibeTypes = vibeService.getAllVibeTypes();

  return (
    <div className="min-h-screen bg-gray-50 -m-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Heart className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Vibe Tracker</h1>
            </div>
            <p className="text-pink-100">
              Track your emotional energy and discover patterns in your daily vibes
            </p>
          </div>
          
          {vibeStats && vibeStats.totalVibes > 0 && (
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{vibeStats.moodScore}%</div>
              <div className="text-sm text-pink-100">Mood Score</div>
              <div className="text-xs text-pink-200">Last 7 days</div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-pink-500 text-pink-600 bg-pink-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'tracker' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Main Vibe Tracker */}
            <VibeTracker />
            
            {/* Recent Vibes Timeline */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2 mb-6">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-semibold text-gray-900">Recent Vibes</h3>
              </div>
              
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentVibes.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {recentVibes.map((vibe) => {
                    const vibeInfo = vibeService.getVibeTypeInfo(vibe.vibeType);
                    const date = vibe.timestamp.toDate();
                    
                    return (
                      <div key={vibe.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-2xl">{vibeInfo.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900">{vibeInfo.label}</span>
                            <div className="flex space-x-1">
                              {[1, 2, 3].map((level) => (
                                <div
                                  key={level}
                                  className={`w-2 h-2 rounded-full ${
                                    level <= vibe.intensity ? 'bg-pink-400' : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {date.toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          {vibe.note && (
                            <div className="text-sm text-gray-600 mt-1 italic">
                              "{vibe.note}"
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No recent vibes</p>
                  <p className="text-xs text-gray-400">Start tracking to see your vibe history</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 gap-6">
            <VibeAnalytics />
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vibe Patterns */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2 mb-6">
                <Target className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900">Vibe Patterns</h3>
              </div>
              
              {vibeStats && vibeStats.totalVibes > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">✨ Positive Insights</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Your mood score is {vibeStats.moodScore}% this week</li>
                      <li>• You're tracking {vibeStats.averageVibesPerDay} vibes per day on average</li>
                      {vibeStats.mostCommonVibe && (
                        <li>• Your most common vibe is {vibeTypes[vibeStats.mostCommonVibe.type].label} {vibeTypes[vibeStats.mostCommonVibe.type].emoji}</li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">📊 Your Vibe Profile</h4>
                    <div className="text-sm text-blue-800">
                      <p className="mb-2">Based on your recent tracking:</p>
                      <ul className="space-y-1">
                        <li>• Average intensity: {vibeStats.averageIntensity}/3</li>
                        <li>• Total vibes logged: {vibeStats.totalVibes}</li>
                        <li>• Most active tracking: {vibeStats.averageVibesPerDay > 2 ? 'High' : vibeStats.averageVibesPerDay > 1 ? 'Medium' : 'Low'}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No patterns yet</p>
                  <p className="text-xs text-gray-400">Track more vibes to see insights</p>
                </div>
              )}
            </div>

            {/* Vibe Guide */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2 mb-6">
                <Zap className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-gray-900">Vibe Guide</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">🎯 How to Use Vibe Tracking</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Log your vibe multiple times throughout the day</li>
                    <li>• Be honest about intensity levels</li>
                    <li>• Add notes to remember what influenced your vibe</li>
                    <li>• Look for patterns in your weekly analytics</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <h4 className="font-semibold text-amber-900 mb-2">💡 Vibe Tips</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Track both positive and challenging vibes</li>
                    <li>• Notice what activities boost your energy</li>
                    <li>• Use vibe data to plan your day better</li>
                    <li>• Celebrate your positive vibe streaks!</li>
                  </ul>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg mb-1">⚡😌🎯</div>
                    <div className="text-xs text-gray-600">Energy Vibes</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg mb-1">😊💪🔥</div>
                    <div className="text-xs text-gray-600">Positive Vibes</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg mb-1">🧘🎨😴</div>
                    <div className="text-xs text-gray-600">Calm Vibes</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg mb-1">😰😟🤯</div>
                    <div className="text-xs text-gray-600">Challenge Vibes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VibePage;