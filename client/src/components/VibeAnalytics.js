import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, BarChart3, Target, Zap } from 'lucide-react';
import { useServerAuth } from '../context/ServerAuthContext';
import vibeService from '../services/vibeService';

const VibeAnalytics = () => {
  const [vibeStats, setVibeStats] = useState(null);
  const [vibeTrends, setVibeTrends] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [loading, setLoading] = useState(true);

  const { user } = useServerAuth();

  useEffect(() => {
    if (user) {
      loadVibeAnalytics();
    }
  }, [user, selectedPeriod]);

  const loadVibeAnalytics = async () => {
    setLoading(true);
    try {
      const [stats, trends] = await Promise.all([
        vibeService.getVibeStats(user.id, selectedPeriod),
        vibeService.getVibeTrends(user.id, selectedPeriod)
      ]);
      
      setVibeStats(stats);
      setVibeTrends(trends);
    } catch (error) {
      console.error('Error loading vibe analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!vibeStats || vibeStats.totalVibes === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900">Vibe Analytics</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No vibe data yet</p>
          <p className="text-xs text-gray-400">Start logging your vibes to see analytics</p>
        </div>
      </div>
    );
  }

  const vibeTypes = vibeService.getAllVibeTypes();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900">Vibe Analytics</h3>
        </div>
        
        {/* Period Selector */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setSelectedPeriod(days)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedPeriod === days
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{vibeStats.totalVibes}</div>
          <div className="text-xs text-purple-700">Total Vibes</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{vibeStats.averageVibesPerDay}</div>
          <div className="text-xs text-blue-700">Per Day</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <div className="text-2xl font-bold text-green-600">{vibeStats.moodScore}%</div>
          <div className="text-xs text-green-700">Mood Score</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">{vibeStats.averageIntensity}</div>
          <div className="text-xs text-orange-700">Avg Intensity</div>
        </div>
      </div>

      {/* Most Common Vibe */}
      {vibeStats.mostCommonVibe && (
        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-2xl">
              {vibeTypes[vibeStats.mostCommonVibe.type].emoji}
            </span>
            <div>
              <h4 className="font-semibold text-indigo-900">
                Most Common: {vibeTypes[vibeStats.mostCommonVibe.type].label}
              </h4>
              <p className="text-sm text-indigo-700">
                {vibeStats.mostCommonVibe.count} times ({vibeStats.mostCommonVibe.percentage}%) • 
                Avg intensity: {vibeStats.mostCommonVibe.averageIntensity}/3
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Vibe Distribution */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
          <Target className="w-4 h-4" />
          <span>Vibe Distribution</span>
        </h4>
        
        <div className="space-y-2">
          {Object.entries(vibeStats.vibeDistribution)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8)
            .map(([vibeType, count]) => {
              const percentage = Math.round((count / vibeStats.totalVibes) * 100);
              const vibeInfo = vibeTypes[vibeType];
              
              return (
                <div key={vibeType} className="flex items-center space-x-3">
                  <span className="text-lg">{vibeInfo.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{vibeInfo.label}</span>
                      <span className="text-xs text-gray-500">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Trend Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
          <TrendingUp className="w-4 h-4" />
          <span>Vibe Trends</span>
        </h4>
        
        <div className="relative h-32 bg-gray-50 rounded-lg p-4 overflow-x-auto">
          <div className="flex items-end justify-between h-full min-w-full">
            {vibeTrends.slice(-14).map((day, index) => {
              const height = day.totalVibes > 0 ? Math.max((day.totalVibes / Math.max(...vibeTrends.map(d => d.totalVibes))) * 100, 10) : 5;
              const vibeInfo = day.dominantVibe ? vibeTypes[day.dominantVibe] : null;
              
              return (
                <div key={index} className="flex flex-col items-center space-y-1 flex-1 max-w-8">
                  <div className="relative group">
                    <div
                      className={`w-4 rounded-t transition-all duration-300 ${
                        day.totalVibes > 0 ? 'bg-gradient-to-t from-purple-400 to-pink-400' : 'bg-gray-200'
                      }`}
                      style={{ height: `${height}%` }}
                    ></div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      <br />
                      {day.totalVibes} vibes
                      {vibeInfo && (
                        <>
                          <br />
                          {vibeInfo.emoji} {vibeInfo.label}
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 transform -rotate-45 origin-center">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  
                  {vibeInfo && (
                    <div className="text-xs">{vibeInfo.emoji}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-2 text-center">
          Last {Math.min(14, vibeTrends.length)} days • Hover for details
        </div>
      </div>
    </div>
  );
};

export default VibeAnalytics;