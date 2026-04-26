import React, { useState, useEffect } from 'react';
import { Plus, X, TrendingUp, Calendar, Zap, Heart } from 'lucide-react';
import { useServerAuth } from '../context/ServerAuthContext';
import vibeService from '../services/vibeService';
import toast from 'react-hot-toast';

const VibeTracker = () => {
  const [showVibeSelector, setShowVibeSelector] = useState(false);
  const [todayVibes, setTodayVibes] = useState([]);
  const [selectedVibe, setSelectedVibe] = useState(null);
  const [selectedIntensity, setSelectedIntensity] = useState('medium');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState(null);

  const { user } = useServerAuth();

  useEffect(() => {
    if (user) {
      loadTodayVibes();
      loadWeeklyStats();
    }
  }, [user]);

  const loadTodayVibes = async () => {
    try {
      const vibes = await vibeService.getTodayVibes(user.id);
      setTodayVibes(vibes);
    } catch (error) {
      console.error('Error loading today\'s vibes:', error);
    }
  };

  const loadWeeklyStats = async () => {
    try {
      const stats = await vibeService.getWeeklyVibeSummary(user.id);
      setWeeklyStats(stats);
    } catch (error) {
      console.error('Error loading weekly stats:', error);
    }
  };

  const handleSaveVibe = async () => {
    if (!selectedVibe || !user) return;

    setLoading(true);
    try {
      const vibeData = {
        vibeType: selectedVibe,
        intensity: vibeService.getIntensityLevels()[selectedIntensity].value,
        note: note.trim()
      };

      await vibeService.saveVibe(user.id, vibeData);
      
      // Reset form
      setSelectedVibe(null);
      setSelectedIntensity('medium');
      setNote('');
      setShowVibeSelector(false);
      
      // Reload data
      await loadTodayVibes();
      await loadWeeklyStats();
      
      toast.success('Vibe logged successfully! ✨');
    } catch (error) {
      console.error('Error saving vibe:', error);
      toast.error('Failed to save vibe');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVibe = async (vibeId) => {
    try {
      await vibeService.deleteVibe(vibeId);
      await loadTodayVibes();
      await loadWeeklyStats();
      toast.success('Vibe removed');
    } catch (error) {
      console.error('Error deleting vibe:', error);
      toast.error('Failed to remove vibe');
    }
  };

  const vibeTypes = vibeService.getAllVibeTypes();
  const intensityLevels = vibeService.getIntensityLevels();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-pink-500" />
          <h3 className="text-lg font-semibold text-gray-900">Vibe Tracker</h3>
        </div>
        <button
          onClick={() => setShowVibeSelector(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Log Vibe</span>
        </button>
      </div>

      {/* Today's Vibes */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>Today's Vibes</span>
        </h4>
        
        {todayVibes.length > 0 ? (
          <div className="space-y-2">
            {todayVibes.map((vibe) => {
              const vibeInfo = vibeService.getVibeTypeInfo(vibe.vibeType);
              return (
                <div
                  key={vibe.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{vibeInfo.emoji}</span>
                    <div>
                      <div className="font-medium text-gray-900">{vibeInfo.label}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(vibe.timestamp.toDate()).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        {vibe.note && ` • ${vibe.note}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
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
                    <button
                      onClick={() => handleDeleteVibe(vibe.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Heart className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No vibes logged today</p>
            <p className="text-xs text-gray-400">Tap "Log Vibe" to track how you're feeling</p>
          </div>
        )}
      </div>

      {/* Weekly Summary */}
      {weeklyStats && weeklyStats.totalVibes > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>This Week</span>
          </h4>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-pink-600">{weeklyStats.totalVibes}</div>
              <div className="text-xs text-pink-700">Total Vibes</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {weeklyStats.averageVibesPerDay}
              </div>
              <div className="text-xs text-blue-700">Per Day</div>
            </div>
          </div>

          {weeklyStats.dominantVibe && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg">
                  {vibeService.getVibeTypeInfo(weeklyStats.dominantVibe.type).emoji}
                </span>
                <span className="font-medium text-purple-900">
                  Most Common: {vibeService.getVibeTypeInfo(weeklyStats.dominantVibe.type).label}
                </span>
              </div>
              <div className="text-xs text-purple-700">
                {weeklyStats.dominantVibe.count} times • Avg intensity: {weeklyStats.dominantVibe.averageIntensity}/3
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vibe Selector Modal */}
      {showVibeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">How are you feeling?</h3>
                <button
                  onClick={() => setShowVibeSelector(false)}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-pink-100 text-sm mt-1">
                Track your current vibe and energy
              </p>
            </div>

            <div className="p-6">
              {/* Vibe Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Select your vibe:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(vibeTypes).map(([key, vibe]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedVibe(key)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                        selectedVibe === key
                          ? 'border-pink-500 bg-pink-50 shadow-md'
                          : 'border-gray-200 hover:border-pink-300 hover:bg-pink-25'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{vibe.emoji}</span>
                        <span className="font-medium text-gray-900 text-sm">{vibe.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity Selection */}
              {selectedVibe && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Intensity:</h4>
                  <div className="flex space-x-2">
                    {Object.entries(intensityLevels).map(([key, level]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedIntensity(key)}
                        className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 ${
                          selectedIntensity === key
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="flex justify-center space-x-1 mb-1">
                            {[1, 2, 3].map((dot) => (
                              <div
                                key={dot}
                                className={`w-2 h-2 rounded-full ${
                                  dot <= level.value ? 'bg-purple-400' : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-xs font-medium text-gray-700">{level.label}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Note Input */}
              {selectedVibe && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Note (optional):</h4>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="What's contributing to this vibe?"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                    rows={3}
                    maxLength={200}
                  />
                  <div className="text-xs text-gray-500 mt-1">{note.length}/200</div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowVibeSelector(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveVibe}
                  disabled={!selectedVibe || loading}
                  className={`
                    flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2
                    ${selectedVibe && !loading
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Log Vibe</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VibeTracker;