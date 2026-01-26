import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, Square, ChevronDown, RotateCcw, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const TimeTrackerPage = () => {
  // Parallel timers for different session types
  const [timers, setTimers] = useState({
    study: { time: 0, isRunning: false, isPaused: false, startTime: null, description: '' },
    work: { time: 0, isRunning: false, isPaused: false, startTime: null, description: '' },
    entertainment: { time: 0, isRunning: false, isPaused: false, startTime: null, description: '' }
  });
  
  const [activeSessionType, setActiveSessionType] = useState('study');
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showRefreshConfirm, setShowRefreshConfirm] = useState(false);
  const [sessionToSubmit, setSessionToSubmit] = useState(null);

  const { timeLogs, loading, fetchTimeLogs, createTimeLog, clearTimeLogs } = useData();

  // Daily reset functionality
  const checkAndResetForNewDay = () => {
    const today = new Date().toDateString(); // e.g., "Mon Jan 25 2026"
    const lastActiveDate = localStorage.getItem('timeTrackerLastActiveDate');
    
    if (lastActiveDate !== today) {
      // It's a new day, reset all timers
      console.log('🌅 New day detected, resetting all timers to 00:00:00');
      
      setTimers({
        study: { time: 0, isRunning: false, isPaused: false, startTime: null, description: '' },
        work: { time: 0, isRunning: false, isPaused: false, startTime: null, description: '' },
        entertainment: { time: 0, isRunning: false, isPaused: false, startTime: null, description: '' }
      });
      
      // Update the last active date
      localStorage.setItem('timeTrackerLastActiveDate', today);
      
      // Show a friendly notification
      toast.success('🌅 Good morning! Your timers have been reset for the new day.', {
        duration: 4000,
        icon: '🌅'
      });
    }
  };

  // Load saved timers from localStorage (but respect daily reset)
  const loadSavedTimers = () => {
    try {
      const savedTimers = localStorage.getItem('timeTrackerTimers');
      const savedDate = localStorage.getItem('timeTrackerLastActiveDate');
      const today = new Date().toDateString();
      
      if (savedTimers && savedDate === today) {
        // Same day, restore saved timers
        const parsedTimers = JSON.parse(savedTimers);
        console.log('📱 Restoring saved timers from today');
        setTimers(parsedTimers);
      } else {
        // Different day or no saved data, start fresh
        console.log('🌅 Starting fresh timers for new day');
        checkAndResetForNewDay();
      }
    } catch (error) {
      console.error('Error loading saved timers:', error);
      checkAndResetForNewDay();
    }
  };

  // Save timers to localStorage
  const saveTimersToStorage = (newTimers) => {
    try {
      localStorage.setItem('timeTrackerTimers', JSON.stringify(newTimers));
      localStorage.setItem('timeTrackerLastActiveDate', new Date().toDateString());
    } catch (error) {
      console.error('Error saving timers:', error);
    }
  };

  // Initialize timers on component mount
  useEffect(() => {
    loadSavedTimers();
    fetchTimeLogs();
  }, [fetchTimeLogs]);

  // Check for new day every minute (when component is active)
  useEffect(() => {
    const checkForMidnight = () => {
      const now = new Date();
      const currentDateString = now.toDateString();
      const lastActiveDate = localStorage.getItem('timeTrackerLastActiveDate');
      
      // Check if we've crossed midnight
      if (lastActiveDate && lastActiveDate !== currentDateString) {
        console.log('🌅 Midnight crossed, triggering daily reset');
        checkAndResetForNewDay();
      }
      
      // If it's close to midnight (within 2 minutes), check more frequently
      const minutesToMidnight = (24 * 60) - (now.getHours() * 60 + now.getMinutes());
      if (minutesToMidnight <= 2) {
        console.log('⏰ Close to midnight, will check more frequently');
        // The interval will handle this automatically
      }
    };

    // Check immediately
    checkForMidnight();
    
    // Check every minute, but more frequently near midnight
    const interval = setInterval(checkForMidnight, 60000);

    return () => clearInterval(interval);
  }, []);

  // Save timers whenever they change
  useEffect(() => {
    saveTimersToStorage(timers);
  }, [timers]);

  // Timer effect - runs for all active timers
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers => {
        const newTimers = { ...prevTimers };
        Object.keys(newTimers).forEach(type => {
          if (newTimers[type].isRunning && !newTimers[type].isPaused) {
            newTimers[type] = {
              ...newTimers[type],
              time: newTimers[type].time + 1
            };
          }
        });
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getCurrentTimer = () => timers[activeSessionType];
  const updateCurrentTimer = (updates) => {
    setTimers(prev => ({
      ...prev,
      [activeSessionType]: { ...prev[activeSessionType], ...updates }
    }));
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    const currentTimer = getCurrentTimer();
    if (!currentTimer.isRunning) {
      updateCurrentTimer({
        isRunning: true,
        isPaused: false,
        startTime: new Date()
      });
    } else if (currentTimer.isPaused) {
      updateCurrentTimer({ isPaused: false });
    }
  };

  const handlePause = () => {
    const currentTimer = getCurrentTimer();
    if (currentTimer.isRunning && !currentTimer.isPaused) {
      updateCurrentTimer({ isPaused: true });
    }
  };

  const handleStop = async () => {
    const currentTimer = getCurrentTimer();
    if (currentTimer.isRunning && currentTimer.time > 0) {
      setSessionToSubmit(activeSessionType);
      setShowSessionForm(true);
    }
  };

  const handleRefresh = () => {
    const currentTimer = getCurrentTimer();
    // Show confirmation dialog if timer is running or has time
    if (currentTimer.isRunning || currentTimer.time > 0) {
      setShowRefreshConfirm(true);
    } else {
      // If timer is at 0 and not running, just reset (no confirmation needed)
      resetTimer();
    }
  };

  const resetTimer = () => {
    // Reset current timer without saving
    updateCurrentTimer({
      time: 0,
      isRunning: false,
      isPaused: false,
      startTime: null
    });
    setShowRefreshConfirm(false);
  };

  const handleSessionTypeChange = (newType) => {
    setActiveSessionType(newType);
  };

  const handleClearAllSessions = async () => {
    const sessionCount = timeLogs.length;
    if (window.confirm(`Are you sure you want to clear all ${sessionCount} recent sessions? This will permanently delete your session history and cannot be undone.`)) {
      const result = await clearTimeLogs();
      if (result.success) {
        // Sessions are already cleared from state by the clearTimeLogs function
        console.log(`Successfully cleared ${sessionCount} sessions`);
      }
    }
  };

  // Manual reset all timers function
  const resetAllTimers = () => {
    if (window.confirm('Are you sure you want to reset all timers to 00:00:00? This will not save any current sessions.')) {
      setTimers({
        study: { time: 0, isRunning: false, isPaused: false, startTime: null, description: '' },
        work: { time: 0, isRunning: false, isPaused: false, startTime: null, description: '' },
        entertainment: { time: 0, isRunning: false, isPaused: false, startTime: null, description: '' }
      });
      
      // Update the last reset date
      localStorage.setItem('timeTrackerLastActiveDate', new Date().toDateString());
      
      toast.success('🔄 All timers have been reset to 00:00:00', {
        duration: 3000,
        icon: '🔄'
      });
    }
  };

  // Get the last reset date for display
  const getLastResetInfo = () => {
    const lastActiveDate = localStorage.getItem('timeTrackerLastActiveDate');
    const today = new Date().toDateString();
    
    if (lastActiveDate === today) {
      return 'Today';
    } else if (lastActiveDate) {
      const resetDate = new Date(lastActiveDate);
      const daysDiff = Math.floor((new Date() - resetDate) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) return 'Yesterday';
      if (daysDiff < 7) return `${daysDiff} days ago`;
      return resetDate.toLocaleDateString();
    }
    return 'Never';
  };

  const handleCancelRefresh = () => {
    setShowRefreshConfirm(false);
  };

  const handleSubmitSession = async (e) => {
    e.preventDefault();
    
    const timerToSubmit = timers[sessionToSubmit];
    const sessionData = {
      type: sessionToSubmit,
      startTime: timerToSubmit.startTime.toISOString(),
      duration: Math.floor(timerToSubmit.time / 60), // convert to minutes
      description: timerToSubmit.description || `${getSessionTypeLabel(sessionToSubmit)} session`,
      focusQuality: 7, // default value
      productivityRating: 7 // default value
    };

    const result = await createTimeLog(sessionData);
    
    if (result.success) {
      // Reset the submitted timer
      setTimers(prev => ({
        ...prev,
        [sessionToSubmit]: {
          time: 0,
          isRunning: false,
          isPaused: false,
          startTime: null,
          description: ''
        }
      }));
      
      setShowSessionForm(false);
      setSessionToSubmit(null);
      
      // Refresh time logs to show the new session immediately
      await fetchTimeLogs();
    }
  };

  const handleCancelSession = () => {
    // Reset the timer that was being submitted without saving
    if (sessionToSubmit) {
      setTimers(prev => ({
        ...prev,
        [sessionToSubmit]: {
          time: 0,
          isRunning: false,
          isPaused: false,
          startTime: null,
          description: ''
        }
      }));
    }
    setShowSessionForm(false);
    setSessionToSubmit(null);
  };

  const getSessionTypeLabel = (type) => {
    switch (type) {
      case 'study': return 'Study Time';
      case 'work': return 'Work Time';
      case 'entertainment': return 'Entertainment Time';
      default: return 'Session';
    }
  };

  const getSessionTypeIcon = (type) => {
    switch (type) {
      case 'study': return '📚';
      case 'work': return '💼';
      case 'entertainment': return '🎮';
      default: return '⏱️';
    }
  };

  const getSessionTypeColor = (type) => {
    switch (type) {
      case 'study': return 'text-blue-600';
      case 'work': return 'text-green-600';
      case 'entertainment': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  // Calculate today's summary including active timers
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = timeLogs.filter(log => {
    try {
      // Safely handle date conversion with fallback
      const dateValue = log.startTime || log.createdAt || log.date;
      if (!dateValue) return false;
      
      const logDate = new Date(dateValue);
      if (isNaN(logDate.getTime())) return false; // Check for invalid date
      
      return logDate.toISOString().split('T')[0] === today;
    } catch (error) {
      console.warn('Invalid date in time log:', log, error);
      return false;
    }
  });

  const todaySummary = {
    study: todayLogs.filter(log => log.type === 'study').reduce((sum, log) => sum + (log.duration || 0), 0) + Math.floor(timers.study.time / 60),
    work: todayLogs.filter(log => log.type === 'work').reduce((sum, log) => sum + (log.duration || 0), 0) + Math.floor(timers.work.time / 60),
    entertainment: todayLogs.filter(log => log.type === 'entertainment').reduce((sum, log) => sum + (log.duration || 0), 0) + Math.floor(timers.entertainment.time / 60)
  };

  // Calculate total time including seconds from active timers
  const todaySummaryWithSeconds = {
    study: {
      minutes: todayLogs.filter(log => log.type === 'study').reduce((sum, log) => sum + (log.duration || 0), 0),
      seconds: timers.study.time
    },
    work: {
      minutes: todayLogs.filter(log => log.type === 'work').reduce((sum, log) => sum + (log.duration || 0), 0),
      seconds: timers.work.time
    },
    entertainment: {
      minutes: todayLogs.filter(log => log.type === 'entertainment').reduce((sum, log) => sum + (log.duration || 0), 0),
      seconds: timers.entertainment.time
    }
  };

  // Calculate total seconds for each type
  const getTotalSeconds = (type) => {
    return (todaySummaryWithSeconds[type].minutes * 60) + todaySummaryWithSeconds[type].seconds;
  };

  // Calculate grand total in seconds
  const grandTotalSeconds = getTotalSeconds('study') + getTotalSeconds('work') + getTotalSeconds('entertainment');

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDurationWithSeconds = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  if (loading.timeLogs) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading time tracker..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Time Tracker</h1>
            <p className="text-gray-600">Track your study, work, and entertainment sessions</p>
          </div>
          
          {/* Daily Reset Info & Controls */}
          <div className="text-right">
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Last reset: {getLastResetInfo()}</span>
                </div>
              </div>
              
              <button
                onClick={resetAllTimers}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                title="Reset all timers to 00:00:00"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset All</span>
              </button>
            </div>
            
            {/* New Day Indicator */}
            {getLastResetInfo() === 'Today' && (
              <div className="mt-1 text-xs text-green-600 flex items-center justify-end space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Fresh start today</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Timers Summary */}
      {Object.values(timers).some(timer => timer.isRunning || timer.time > 0) && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Active Sessions</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(timers).map(([type, timer]) => {
              if (timer.time === 0 && !timer.isRunning) return null;
              return (
                <div key={type} className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                  type === activeSessionType ? 'bg-white border-blue-300 shadow-sm' : 'bg-white/50 border-gray-200'
                } ${timer.isRunning && !timer.isPaused ? 'ring-2 ring-green-200' : ''}`}>
                  <span className="text-lg">{getSessionTypeIcon(type)}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatTime(timer.time)}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center space-x-1">
                      <span>{getSessionTypeLabel(type)}</span>
                      {timer.isRunning && !timer.isPaused && (
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      )}
                      {timer.isPaused && <span className="text-yellow-600">⏸️</span>}
                    </div>
                  </div>
                  {type === activeSessionType && (
                    <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Active
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Timer */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Session</h2>
          
          {/* Session Type Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Type
            </label>
            <div className="relative">
              <select
                value={activeSessionType}
                onChange={(e) => handleSessionTypeChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="study">📚 Study Time</option>
                <option value="work">💼 Work Time</option>
                <option value="entertainment">🎮 Entertainment Time</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            {/* Show status of other timers */}
            <div className="mt-2 flex space-x-2 text-xs">
              {Object.entries(timers).map(([type, timer]) => {
                if (type === activeSessionType) return null;
                return (
                  <div key={type} className={`px-2 py-1 rounded-full flex items-center space-x-1 ${
                    timer.isRunning && !timer.isPaused ? 'bg-green-100 text-green-800' :
                    timer.isPaused ? 'bg-yellow-100 text-yellow-800' :
                    timer.time > 0 ? 'bg-gray-100 text-gray-600' : 'hidden'
                  }`}>
                    <span>{getSessionTypeIcon(type)}</span>
                    <span>{formatTime(timer.time)}</span>
                    {timer.isRunning && !timer.isPaused && <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>}
                    {timer.isPaused && <span>⏸️</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${getSessionTypeColor(activeSessionType)}`}>
              {formatTime(getCurrentTimer().time)}
            </div>
            <div className="text-sm text-gray-600 mb-6 flex items-center justify-center space-x-2">
              <span>{getSessionTypeIcon(activeSessionType)}</span>
              <span>{getSessionTypeLabel(activeSessionType)}</span>
              {getCurrentTimer().isRunning && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  getCurrentTimer().isPaused ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {getCurrentTimer().isPaused ? 'Paused' : 'Running'}
                </span>
              )}
            </div>
            
            <div className="flex justify-center space-x-2">
              {!getCurrentTimer().isRunning || getCurrentTimer().isPaused ? (
                <button 
                  onClick={handleStart}
                  className="btn-primary flex items-center space-x-2 px-6"
                >
                  <Play className="w-4 h-4" />
                  <span>{!getCurrentTimer().isRunning ? 'Start' : 'Resume'}</span>
                </button>
              ) : (
                <button 
                  onClick={handlePause}
                  className="btn-secondary flex items-center space-x-2 px-6"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </button>
              )}
              
              <button 
                onClick={handleRefresh}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
                title="Reset timer to 00:00:00 (won't save current session)"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              
              <button 
                onClick={handleStop}
                disabled={!getCurrentTimer().isRunning || getCurrentTimer().time === 0}
                className="btn-danger flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed px-6"
              >
                <Square className="w-4 h-4" />
                <span>Stop</span>
              </button>
            </div>
          </div>
        </div>

        {/* Today's Summary */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Today's Summary</h2>
            <div className="text-xs text-gray-500">
              Resets daily at midnight
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span>📚</span>
                <span className="text-gray-600">Study Time</span>
              </div>
              <span className="font-medium text-blue-600">
                {formatDurationWithSeconds(getTotalSeconds('study'))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span>💼</span>
                <span className="text-gray-600">Work Time</span>
              </div>
              <span className="font-medium text-green-600">
                {formatDurationWithSeconds(getTotalSeconds('work'))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span>🎮</span>
                <span className="text-gray-600">Entertainment Time</span>
              </div>
              <span className="font-medium text-purple-600">
                {formatDurationWithSeconds(getTotalSeconds('entertainment'))}
              </span>
            </div>
            <div className="pt-3 border-t-2 border-gray-300">
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">⏱️</span>
                  <span className="text-gray-900 font-semibold text-lg">Total Time Today</span>
                </div>
                <span className="font-bold text-xl text-indigo-600">
                  {formatDurationWithSeconds(grandTotalSeconds)}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">
                📚 {formatDurationWithSeconds(getTotalSeconds('study'))} + 💼 {formatDurationWithSeconds(getTotalSeconds('work'))} + 🎮 {formatDurationWithSeconds(getTotalSeconds('entertainment'))} = ⏱️ Total
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Sessions</h2>
          {timeLogs.length > 0 && (
            <button
              onClick={handleClearAllSessions}
              className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg flex items-center space-x-1 transition-all"
              title="Clear all recent sessions"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All ({timeLogs.length})</span>
            </button>
          )}
        </div>
        <div className="space-y-3">
          {timeLogs.length > 0 ? (
            timeLogs.slice(0, 10).map((log, index) => (
              <div key={log._id || index} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                index === 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="text-lg">{getSessionTypeIcon(log.type)}</div>
                  <div>
                    <div className="font-medium text-gray-900 flex items-center space-x-2">
                      <span>{getSessionTypeLabel(log.type)}</span>
                      {index === 0 && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Latest
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {log.description || 'No description'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {formatDuration(log.duration || 0)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {(() => {
                      try {
                        const dateValue = log.startTime || log.createdAt || log.date;
                        if (!dateValue) return 'Today';
                        const date = new Date(dateValue);
                        if (isNaN(date.getTime())) return 'Today';
                        return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                      } catch (error) {
                        return 'Today';
                      }
                    })()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
              <p className="text-gray-600">Start your first session to see it here</p>
            </div>
          )}
        </div>
      </div>

      {/* Refresh Confirmation Modal */}
      {showRefreshConfirm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
                <RotateCcw className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Reset Timer?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                This will reset the timer to 00:00:00. Your current session time ({formatTime(getCurrentTimer().time)}) will not be saved.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={resetTimer}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Reset Timer
                </button>
                <button
                  onClick={handleCancelRefresh}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Submission Modal */}
      {showSessionForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Save {getSessionTypeLabel(sessionToSubmit)} Session
            </h2>
            
            <form onSubmit={handleSubmitSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Duration
                </label>
                <div className="text-2xl font-bold text-primary-600">
                  {sessionToSubmit && formatTime(timers[sessionToSubmit].time)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Type
                </label>
                <div className="flex items-center space-x-2 text-gray-900">
                  <span>{sessionToSubmit && getSessionTypeIcon(sessionToSubmit)}</span>
                  <span>{sessionToSubmit && getSessionTypeLabel(sessionToSubmit)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={sessionToSubmit ? timers[sessionToSubmit].description : ''}
                  onChange={(e) => sessionToSubmit && setTimers(prev => ({
                    ...prev,
                    [sessionToSubmit]: { ...prev[sessionToSubmit], description: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="3"
                  placeholder={`What did you work on during this ${sessionToSubmit} session?`}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Save Session
                </button>
                <button
                  type="button"
                  onClick={handleCancelSession}
                  className="btn-secondary flex-1"
                >
                  Discard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTrackerPage;