import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, Send, Edit3, Trash2, Users, TrendingUp, Calendar } from 'lucide-react';
import { useServerAuth } from '../context/ServerAuthContext';
import checkInService from '../services/checkInService';
import toast from 'react-hot-toast';

const DailyCheckIn = () => {
  const [todayCheckIn, setTodayCheckIn] = useState(null);
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [thought, setThought] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [autoData, setAutoData] = useState(null);
  const [streak, setStreak] = useState(null);

  const { user } = useServerAuth();

  useEffect(() => {
    if (user) {
      loadTodayCheckIn();
      loadAutoData();
      loadStreak();
    }
  }, [user]);

  const loadTodayCheckIn = async () => {
    try {
      const checkIn = await checkInService.getTodayCheckIn(user.id);
      setTodayCheckIn(checkIn);
    } catch (error) {
      console.error('Error loading today\'s check-in:', error);
    }
  };

  const loadAutoData = async () => {
    try {
      const [dayScoreData, moodData] = await Promise.all([
        checkInService.getDayScoreEmoji(75), // This will be replaced with actual service call
        checkInService.autoDetectMood(user.id)
      ]);
      
      setAutoData({
        dayScore: 75, // This will be fetched from actual service
        dayScoreEmoji: checkInService.getDayScoreEmoji(75),
        mood: moodData
      });
    } catch (error) {
      console.error('Error loading auto data:', error);
    }
  };

  const loadStreak = async () => {
    try {
      const streakData = await checkInService.getCheckInStreak(user.id);
      setStreak(streakData);
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  const handleCreateCheckIn = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const checkInData = {
        thought: thought.trim(),
        isPublic
      };

      const newCheckIn = await checkInService.createCheckIn(user.id, user, checkInData);
      setTodayCheckIn(newCheckIn);
      setShowCheckInForm(false);
      setThought('');
      
      await loadStreak(); // Refresh streak
      toast.success('Daily check-in posted! 🌟');
    } catch (error) {
      console.error('Error creating check-in:', error);
      toast.error('Failed to post check-in');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateThought = async () => {
    if (!todayCheckIn) return;

    setLoading(true);
    try {
      await checkInService.updateCheckInThought(todayCheckIn.id, user.id, thought);
      setTodayCheckIn({ ...todayCheckIn, thought: thought.trim() });
      setShowCheckInForm(false);
      setThought('');
      toast.success('Check-in updated! ✨');
    } catch (error) {
      console.error('Error updating check-in:', error);
      toast.error('Failed to update check-in');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCheckIn = async () => {
    if (!todayCheckIn || !window.confirm('Delete today\'s check-in?')) return;

    try {
      await checkInService.deleteCheckIn(todayCheckIn.id, user.id);
      setTodayCheckIn(null);
      await loadStreak(); // Refresh streak
      toast.success('Check-in deleted');
    } catch (error) {
      console.error('Error deleting check-in:', error);
      toast.error('Failed to delete check-in');
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Daily Check-In</h3>
        </div>
        
        {streak && (
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1 text-orange-600">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">{streak.currentStreak} day streak</span>
            </div>
          </div>
        )}
      </div>

      {/* Today's Check-In Display */}
      {todayCheckIn ? (
        <div className="space-y-4">
          {/* Check-In Card */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{todayCheckIn.dayScoreEmoji}</div>
                <div>
                  <div className="font-semibold text-gray-900">
                    DayScore: {todayCheckIn.dayScore}
                  </div>
                  <div className="text-sm text-gray-600">
                    Mood: {todayCheckIn.moodEmoji} {todayCheckIn.moodLabel}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setThought(todayCheckIn.thought);
                    setShowCheckInForm(true);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                  title="Edit thought"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDeleteCheckIn}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete check-in"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {todayCheckIn.thought && (
              <div className="bg-white bg-opacity-60 rounded-lg p-3 mb-3">
                <p className="text-gray-800 italic">"{todayCheckIn.thought}"</p>
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {new Date(todayCheckIn.timestamp.toDate()).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <Heart className="w-3 h-3" />
                  <span>{todayCheckIn.likeCount || 0}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{todayCheckIn.supportCount || 0}</span>
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  todayCheckIn.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {todayCheckIn.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          {streak && (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{streak.currentStreak}</div>
                <div className="text-xs text-orange-700">Day Streak</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{streak.averageDayScore}</div>
                <div className="text-xs text-blue-700">Avg Score</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{streak.averageMood}</div>
                <div className="text-xs text-purple-700">Avg Mood</div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Check-In Prompt */
        <div className="space-y-4">
          {/* Question Prompt */}
          <div className="text-center py-6">
            <div className="text-4xl mb-3">🧩</div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">
              How was your day today?
            </h4>
            <p className="text-gray-600 text-sm">
              Share a quick reflection with the community
            </p>
          </div>

          {/* Auto-Detected Data Preview */}
          {autoData && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
              <h5 className="text-sm font-medium text-gray-800 mb-3">Auto-detected from your data:</h5>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{autoData.dayScoreEmoji}</div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      DayScore: {autoData.dayScore}
                    </div>
                    <div className="text-sm text-gray-600">
                      Mood: {autoData.mood.emoji} {autoData.mood.label}
                    </div>
                  </div>
                </div>
                
                {autoData.mood.dominantVibe && (
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Today's vibe:</div>
                    <div className="font-medium text-gray-800">
                      {autoData.mood.dominantVibe.emoji} {autoData.mood.dominantVibe.label}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Check-In Button */}
          <div className="text-center">
            <button
              onClick={() => setShowCheckInForm(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              Share Your Day
            </button>
          </div>
        </div>
      )}

      {/* Check-In Form Modal */}
      {showCheckInForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold">
                {todayCheckIn ? 'Update Your Thought' : 'Daily Check-In'}
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                {todayCheckIn ? 'Edit your reflection' : 'Share how your day went'}
              </p>
            </div>

            <div className="p-6">
              {/* Auto Data Display */}
              {autoData && !todayCheckIn && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{autoData.dayScoreEmoji}</span>
                    <div>
                      <div className="font-semibold">DayScore: {autoData.dayScore}</div>
                      <div className="text-sm text-gray-600">
                        Mood: {autoData.mood.emoji} {autoData.mood.label}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Auto-detected from your activity & wellness data
                  </div>
                </div>
              )}

              {/* Thought Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share a thought (optional):
                </label>
                <textarea
                  value={thought}
                  onChange={(e) => setThought(e.target.value)}
                  placeholder="One small win, challenge, or feeling from today..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  maxLength={200}
                />
                <div className="text-xs text-gray-500 mt-1">{thought.length}/200</div>
              </div>

              {/* Privacy Toggle */}
              {!todayCheckIn && (
                <div className="mb-6">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Share with community (helps others support you)
                    </span>
                  </label>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCheckInForm(false);
                    setThought('');
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={todayCheckIn ? handleUpdateThought : handleCreateCheckIn}
                  disabled={loading}
                  className={`
                    flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2
                    ${loading
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg'
                    }
                  `}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{todayCheckIn ? 'Update' : 'Post Check-In'}</span>
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

export default DailyCheckIn;