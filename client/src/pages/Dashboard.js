import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import { useServerAuth } from '../context/ServerAuthContext';
import { Plus, Heart, Brain, BarChart3, Target, TrendingUp, TrendingDown } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import TaskSummary from '../components/TaskSummary';
import TimeTracker from '../components/TimeTracker';
import ActivityRings from '../components/ActivityRings';
import SleepChart from '../components/SleepChart';
import ScreenTimeChart from '../components/ScreenTimeChart';
import MoodSlider from '../components/MoodSlider';
import DistractionAlerts from '../components/DistractionAlerts';
import AIInsights from '../components/AIInsights';
import HoroscopeManager from '../components/HoroscopeManager';
import DailyCheckIn from '../components/DailyCheckIn';
import dayScoreService from '../services/dayScoreService';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useServerAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [realDayScore, setRealDayScore] = useState(null);
  const [yesterdayComparison, setYesterdayComparison] = useState(null);
  const [scoreLoading, setScoreLoading] = useState(true);
  
  const {
    tasks,
    timeLogs,
    healthData,
    moodData,
    screenTime,
    loading,
    fetchDayScore,
    fetchTasks,
    fetchTimeLogs,
    fetchHealthData,
    fetchMoodData,
    fetchScreenTime,
    recalculateDayScore
  } = useData();

  // Fetch real-time day score
  useEffect(() => {
    const fetchRealDayScore = async () => {
      try {
        setScoreLoading(true);
        const [scoreData, comparison] = await Promise.all([
          dayScoreService.getTodayScore(),
          dayScoreService.getYesterdayComparison()
        ]);
        
        setRealDayScore(scoreData);
        setYesterdayComparison(comparison);
      } catch (error) {
        console.error('Error fetching real day score:', error);
      } finally {
        setScoreLoading(false);
      }
    };

    fetchRealDayScore();
    
    // Refresh score every 5 minutes
    const interval = setInterval(fetchRealDayScore, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Calculate productivity score based on real task and time data
  const calculateProductivityScore = () => {
    if (!tasks || tasks.length === 0) return 50; // Default if no tasks

    const completionRate = (tasks.filter(t => t.status === 'done').length / tasks.length) * 100;
    const inProgressBonus = tasks.filter(t => t.status === 'in-progress').length * 5; // Bonus for active work
    
    // Time tracking bonus
    const today = new Date().toDateString();
    const todayLogs = timeLogs?.filter(log => {
      try {
        const dateValue = log.startTime || log.createdAt || log.date;
        if (!dateValue) return false;
        const logDate = new Date(dateValue);
        if (isNaN(logDate.getTime())) return false;
        return logDate.toDateString() === today;
      } catch (error) {
        return false;
      }
    }) || [];

    const totalTimeToday = todayLogs.reduce((total, log) => total + (log.duration || 0), 0);
    const timeBonus = Math.min(totalTimeToday / 10, 20); // Up to 20 points for time tracking

    const productivityScore = Math.min(Math.round(completionRate + inProgressBonus + timeBonus), 100);
    return productivityScore;
  };

  // Update day score components with real productivity data
  const getEnhancedDayScoreComponents = () => {
    const baseComponents = getDayScoreComponents();
    const realProductivityScore = calculateProductivityScore();
    
    return {
      ...baseComponents,
      productivity: realProductivityScore
    };
  };

  // Calculate overall day score from real data
  const calculateOverallScore = () => {
    if (!realDayScore) {
      // Calculate from real task and time data if no AI score available
      const components = getEnhancedDayScoreComponents();
      const weights = { productivity: 0.30, health: 0.25, focus: 0.25, wellness: 0.20 };
      return Math.round(
        components.productivity * weights.productivity +
        components.health * weights.health +
        components.focus * weights.focus +
        components.wellness * weights.wellness
      );
    }
    return realDayScore.overall;
  };

  // Get day score components
  const getDayScoreComponents = () => {
    if (!realDayScore) {
      return {
        productivity: 75,
        health: 75,
        focus: 75,
        wellness: 75
      };
    }
    return realDayScore.components;
  };

  useEffect(() => {
    // Fetch all dashboard data
    const fetchDashboardData = async () => {
      await Promise.all([
        fetchDayScore(),
        fetchTasks({ limit: 10 }),
        fetchTimeLogs(),
        fetchHealthData(),
        fetchMoodData(),
        fetchScreenTime()
      ]);
    };

    fetchDashboardData();

    // Set up real-time updates every 30 seconds for task and productivity data
    const interval = setInterval(() => {
      fetchTasks({ limit: 10 });
      fetchTimeLogs();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchDayScore, fetchTasks, fetchTimeLogs, fetchHealthData, fetchMoodData, fetchScreenTime]);

  const isLoading = loading.dayScore || loading.tasks || loading.health || loading.mood;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'productivity', label: 'Productivity', icon: Target },
    { id: 'wellness', label: 'Wellness', icon: Heart },
    { id: 'insights', label: 'AI Insights', icon: Brain }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 -m-6 p-6">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name}!
            </h1>
            <p className="text-blue-100 text-sm">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{calculateOverallScore()}</div>
              <div className="text-xs text-blue-100">Day Score</div>
            </div>
          </div>
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
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
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
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Day Score - Left Column */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Today's Day Score</h3>
              
              {/* Day Score Ring */}
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#f3f4f6"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#10b981"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - calculateOverallScore() / 100)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{calculateOverallScore()}</div>
                      <div className="text-sm text-gray-500">/ 100</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison */}
              <div className="text-center mb-6">
                {yesterdayComparison ? (
                  <div className="flex items-center justify-center space-x-2">
                    {yesterdayComparison.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : yesterdayComparison.trend === 'down' ? (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    ) : (
                      <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                    )}
                    <span className={`text-sm ${
                      yesterdayComparison.trend === 'up' ? 'text-green-500' : 
                      yesterdayComparison.trend === 'down' ? 'text-red-500' : 
                      'text-gray-500'
                    }`}>
                      {yesterdayComparison.trend === 'up' ? '+' : yesterdayComparison.trend === 'down' ? '' : ''}
                      {yesterdayComparison.difference} vs yesterday
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">First day tracking</span>
                )}
              </div>

              {/* Score Breakdown */}
              <div className="space-y-3">
                {(() => {
                  const components = getEnhancedDayScoreComponents();
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Productivity</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div className="h-2 bg-blue-500 rounded-full transition-all duration-500" style={{width: `${components.productivity}%`}}></div>
                          </div>
                          <span className="text-sm font-medium">{components.productivity}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Health</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div className="h-2 bg-green-500 rounded-full transition-all duration-500" style={{width: `${components.health}%`}}></div>
                          </div>
                          <span className="text-sm font-medium">{components.health}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Focus</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div className="h-2 bg-purple-500 rounded-full transition-all duration-500" style={{width: `${components.focus}%`}}></div>
                          </div>
                          <span className="text-sm font-medium">{components.focus}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Mood Wellness</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transition-all duration-500" 
                              style={{width: `${components.wellness}%`}}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{components.wellness}</span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Today's Insight */}
              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-1">Today's Insight</h4>
                <p className="text-sm text-blue-700">
                  {(() => {
                    const components = getEnhancedDayScoreComponents();
                    const overallScore = calculateOverallScore();
                    
                    if (scoreLoading) {
                      return "Analyzing your day's performance...";
                    }
                    
                    // Task-specific insights
                    if (tasks && tasks.length > 0) {
                      const completedTasks = tasks.filter(t => t.status === 'done').length;
                      const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
                      const todoTasks = tasks.filter(t => t.status === 'todo').length;
                      
                      if (completedTasks === tasks.length) {
                        return `🎉 Amazing! You've completed all ${completedTasks} tasks today. Your productivity is at ${components.productivity}%!`;
                      } else if (inProgressTasks > 0 && completedTasks > 0) {
                        return `Great momentum! ${completedTasks} tasks done, ${inProgressTasks} in progress. Keep up the excellent work!`;
                      } else if (inProgressTasks > todoTasks) {
                        return `You're actively working on ${inProgressTasks} tasks. Focus on completing them before starting new ones.`;
                      } else if (todoTasks > 0 && inProgressTasks === 0) {
                        return `Ready to start? You have ${todoTasks} tasks waiting. Pick one and move it to "In Progress" to build momentum!`;
                      }
                    }
                    
                    // Fallback to general insights
                    if (realDayScore?.isFallback) {
                      return "Start tracking your activities to get personalized insights!";
                    }
                    
                    // Find the highest and lowest scoring components
                    const componentEntries = Object.entries(components);
                    const highest = componentEntries.reduce((a, b) => a[1] > b[1] ? a : b);
                    const lowest = componentEntries.reduce((a, b) => a[1] < b[1] ? a : b);
                    
                    if (overallScore >= 85) {
                      return `Excellent day! Your ${highest[0]} (${highest[1]}) is driving strong performance.`;
                    } else if (overallScore >= 70) {
                      return `Good progress today! Consider focusing on ${lowest[0]} (${lowest[1]}) to boost your overall score.`;
                    } else if (overallScore >= 50) {
                      return `Room for improvement. Your ${lowest[0]} needs attention - small changes can make a big difference.`;
                    } else {
                      return `Let's turn this day around! Start with improving your ${lowest[0]} - every step counts.`;
                    }
                  })()}
                </p>
              </div>

              {/* AI Controls */}
              <div className="mt-4 flex justify-center space-x-2">
                <button 
                  onClick={async () => {
                    setScoreLoading(true);
                    try {
                      const scoreData = await dayScoreService.getTodayScore(true);
                      setRealDayScore(scoreData);
                      const comparison = await dayScoreService.getYesterdayComparison();
                      setYesterdayComparison(comparison);
                    } catch (error) {
                      console.error('Error refreshing score:', error);
                    } finally {
                      setScoreLoading(false);
                    }
                  }}
                  disabled={scoreLoading}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                >
                  {scoreLoading ? 'Updating...' : 'Refresh Score'}
                </button>
                
                <span className="text-gray-300">•</span>
                
                <button 
                  onClick={() => {
                    // Disable AI popups for 2 hours
                    localStorage.setItem('aiDisabledUntil', (Date.now() + 2 * 60 * 60 * 1000).toString());
                    toast.success('AI popups disabled for 2 hours', { icon: '🔇' });
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  Disable AI Popups
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Today's Progress</span>
                  <span>{Math.round((new Date().getHours() / 24) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500" 
                    style={{width: `${Math.round((new Date().getHours() / 24) * 100)}%`}}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Start</span>
                  <span>Now</span>
                  <span>End</span>
                </div>
              </div>
            </div>

            {/* Task & Productivity Data - Middle Column */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Task & Productivity</h3>
                <button 
                  onClick={() => window.location.href = '/app/tasks'}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Tasks →
                </button>
              </div>

              {/* Task Counts */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {tasks?.filter(t => t.status === 'todo').length || 0}
                  </div>
                  <div className="text-sm text-blue-700 font-medium">To Do</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">
                    {tasks?.filter(t => t.status === 'in-progress').length || 0}
                  </div>
                  <div className="text-sm text-orange-700 font-medium">In Progress</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {tasks?.filter(t => t.status === 'done').length || 0}
                  </div>
                  <div className="text-sm text-green-700 font-medium">Completed</div>
                </div>
              </div>

              {/* Productivity Metrics */}
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Total Tasks</span>
                  <span className="font-semibold text-gray-900">{tasks?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-semibold text-gray-900">
                    {tasks && tasks.length > 0 ? 
                      Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Active Tasks</span>
                  <span className="font-semibold text-gray-900">
                    {tasks?.filter(t => t.status === 'in-progress').length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Productivity Score</span>
                  <span className="font-semibold text-blue-600">
                    {calculateProductivityScore()}/100
                  </span>
                </div>
              </div>

              {/* Time Tracking Summary */}
              {(() => {
                const today = new Date().toDateString();
                const todayLogs = timeLogs?.filter(log => {
                  try {
                    const dateValue = log.startTime || log.createdAt || log.date;
                    if (!dateValue) return false;
                    const logDate = new Date(dateValue);
                    if (isNaN(logDate.getTime())) return false;
                    return logDate.toDateString() === today;
                  } catch (error) {
                    return false;
                  }
                }) || [];

                const studyTime = todayLogs
                  .filter(log => log.type === 'study')
                  .reduce((total, log) => total + (log.duration || 0), 0);

                const workTime = todayLogs
                  .filter(log => log.type === 'work')
                  .reduce((total, log) => total + (log.duration || 0), 0);

                const formatTime = (minutes) => {
                  const hours = Math.floor(minutes / 60);
                  const mins = minutes % 60;
                  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                };

                return (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Today's Time</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center space-x-1">
                          <span>📚</span>
                          <span>Study Time</span>
                        </span>
                        <span className="font-medium text-blue-600">{formatTime(studyTime)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center space-x-1">
                          <span>💼</span>
                          <span>Work Time</span>
                        </span>
                        <span className="font-medium text-orange-600">{formatTime(workTime)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-gray-700 font-medium">Total Time</span>
                        <span className="font-bold text-indigo-600">{formatTime(studyTime + workTime)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* No Tasks State */}
              {(!tasks || tasks.length === 0) && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-lg text-gray-500 mb-2">No tasks yet</p>
                    <p className="text-sm text-gray-400">Create your first task to start tracking productivity</p>
                  </div>
                  <button 
                    onClick={() => window.location.href = '/app/tasks'}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Task
                  </button>
                </div>
              )}
            </div>

            {/* Activity Progress & Sleep Duration - Right Column */}
            <div className="space-y-6">
              {/* Daily Horoscope */}
              <HoroscopeManager />
              
              {/* Activity Progress */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Progress</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 40 40">
                          <circle cx="20" cy="20" r="16" stroke="#f3f4f6" strokeWidth="3" fill="none" />
                          <circle cx="20" cy="20" r="16" stroke="#ec4899" strokeWidth="3" fill="none"
                            strokeDasharray={`${2 * Math.PI * 16}`}
                            strokeDashoffset={`${2 * Math.PI * 16 * (1 - 0.85)}`} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-pink-600">85%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center space-x-1">
                          <span>💜</span>
                          <span>Cardio</span>
                        </div>
                        <div className="text-xs text-gray-500">34 / 40 min</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 40 40">
                          <circle cx="20" cy="20" r="16" stroke="#f3f4f6" strokeWidth="3" fill="none" />
                          <circle cx="20" cy="20" r="16" stroke="#f59e0b" strokeWidth="3" fill="none"
                            strokeDasharray={`${2 * Math.PI * 16}`}
                            strokeDashoffset={`${2 * Math.PI * 16 * (1 - 0.70)}`} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-amber-600">70%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center space-x-1">
                          <span>🏋️</span>
                          <span>Strength</span>
                        </div>
                        <div className="text-xs text-gray-500">21 / 30 min</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 40 40">
                          <circle cx="20" cy="20" r="16" stroke="#f3f4f6" strokeWidth="3" fill="none" />
                          <circle cx="20" cy="20" r="16" stroke="#10b981" strokeWidth="3" fill="none"
                            strokeDasharray={`${2 * Math.PI * 16}`}
                            strokeDashoffset={`${2 * Math.PI * 16 * (1 - 0.90)}`} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-green-600">90%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center space-x-1">
                          <span>🧘</span>
                          <span>Mind & Recovery</span>
                        </div>
                        <div className="text-xs text-gray-500">18 / 20 min</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sleep Duration */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sleep Duration</h3>
                
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-purple-600">7h 30m</div>
                  <div className="text-sm text-gray-500">Avg</div>
                </div>

                {/* Weekly Chart */}
                <div className="flex items-end justify-between h-16 mb-2">
                  <div className="flex flex-col items-center">
                    <div className="w-4 bg-purple-300 rounded-t" style={{height: '60%'}}></div>
                    <span className="text-xs text-gray-500 mt-1">Mon</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-4 bg-purple-400 rounded-t" style={{height: '70%'}}></div>
                    <span className="text-xs text-gray-500 mt-1">Tue</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-4 bg-purple-400 rounded-t" style={{height: '65%'}}></div>
                    <span className="text-xs text-gray-500 mt-1">Wed</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-4 bg-purple-500 rounded-t" style={{height: '80%'}}></div>
                    <span className="text-xs text-gray-500 mt-1">Thu</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-4 bg-purple-400 rounded-t" style={{height: '75%'}}></div>
                    <span className="text-xs text-gray-500 mt-1">Fri</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-4 bg-purple-600 rounded-t" style={{height: '90%'}}></div>
                    <span className="text-xs text-gray-500 mt-1">Sat</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'productivity' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Data */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Task Overview</h3>

              {/* Task Counts */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {tasks?.filter(t => t.status === 'todo').length || 0}
                  </div>
                  <div className="text-sm text-blue-700">To Do</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {tasks?.filter(t => t.status === 'in-progress').length || 0}
                  </div>
                  <div className="text-sm text-orange-700">In Progress</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {tasks?.filter(t => t.status === 'done').length || 0}
                  </div>
                  <div className="text-sm text-green-700">Completed</div>
                </div>
              </div>

              {/* Task Metrics */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Tasks</span>
                  <span className="font-semibold">{tasks?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-semibold">
                    {tasks && tasks.length > 0 ? 
                      Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Productivity Score</span>
                  <span className="font-semibold text-blue-600">{calculateProductivityScore()}/100</span>
                </div>
              </div>
            </div>

            {/* Time Tracking Data */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Time Tracking</h3>

              {(() => {
                const today = new Date().toDateString();
                const todayLogs = timeLogs?.filter(log => {
                  try {
                    const dateValue = log.startTime || log.createdAt || log.date;
                    if (!dateValue) return false;
                    const logDate = new Date(dateValue);
                    if (isNaN(logDate.getTime())) return false;
                    return logDate.toDateString() === today;
                  } catch (error) {
                    return false;
                  }
                }) || [];

                const studyTime = todayLogs
                  .filter(log => log.type === 'study')
                  .reduce((total, log) => total + (log.duration || 0), 0);

                const workTime = todayLogs
                  .filter(log => log.type === 'work')
                  .reduce((total, log) => total + (log.duration || 0), 0);

                const formatTime = (minutes) => {
                  const hours = Math.floor(minutes / 60);
                  const mins = minutes % 60;
                  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                };

                return (
                  <div className="space-y-6">
                    {/* Time Summary */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {formatTime(studyTime)}
                        </div>
                        <div className="text-sm text-blue-700">Study Time</div>
                        <div className="text-xs text-blue-600 mt-1">
                          {todayLogs.filter(log => log.type === 'study').length} sessions
                        </div>
                      </div>

                      <div className="bg-orange-50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600 mb-1">
                          {formatTime(workTime)}
                        </div>
                        <div className="text-sm text-orange-700">Work Time</div>
                        <div className="text-xs text-orange-600 mt-1">
                          {todayLogs.filter(log => log.type === 'work').length} sessions
                        </div>
                      </div>
                    </div>

                    {/* Time Metrics */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Sessions</span>
                        <span className="font-semibold">{todayLogs.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Time Today</span>
                        <span className="font-semibold text-indigo-600">
                          {formatTime(studyTime + workTime)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Average Session</span>
                        <span className="font-semibold">
                          {todayLogs.length > 0 ? 
                            formatTime(Math.round((studyTime + workTime) / todayLogs.length)) : '0m'}
                        </span>
                      </div>
                    </div>

                    {/* No Time Data State */}
                    {todayLogs.length === 0 && (
                      <div className="text-center py-6">
                        <div className="text-gray-400 mb-3">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm">No time logged today</p>
                        </div>
                        <button 
                          onClick={() => window.location.href = '/app/time-tracker'}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Start Time Tracking
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {activeTab === 'wellness' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              <HoroscopeManager />
              <SleepChart healthData={healthData} />
              <MoodSlider moodData={moodData} />
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              <DailyCheckIn />
              <ActivityRings healthData={healthData} />

              {/* Wellness Summary */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <span>Wellness Summary</span>
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Sleep Duration', value: `${healthData?.sleep?.duration || 7.5}h` },
                    { label: 'Steps Today', value: (healthData?.activity?.steps || 8500).toLocaleString() },
                    { label: 'Active Minutes', value: `${healthData?.activity?.activeMinutes || 45}min` },
                    { label: 'Mood Rating', value: `${moodData?.mood || 4}/5` },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <span className="font-semibold text-gray-900">{item.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Overall Wellness</span>
                    <span className="font-bold text-pink-600">{getDayScoreComponents().wellness}/100</span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <button onClick={() => window.location.href = '/app/mood'}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                    Update Today's Mood →
                  </button>
                </div>
              </div>

              {/* Mood & Wellness Scores */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <span>Mood & Wellness Scores</span>
                </h3>
                {moodData && moodData.length > 0 ? (() => {
                  const latestMood = moodData[0];
                  const components = getDayScoreComponents();
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-purple-50 rounded-xl">
                          <div className="text-3xl font-bold text-purple-600 mb-1">{latestMood.mood ? latestMood.mood * 20 : components.wellness}</div>
                          <div className="text-sm text-purple-700 font-medium">Mood Score</div>
                          <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full mt-1">{latestMood.moodEmoji || '😊'}</div>
                        </div>
                        <div className="text-center p-4 bg-pink-50 rounded-xl">
                          <div className="text-3xl font-bold text-pink-600 mb-1">{components.wellness}</div>
                          <div className="text-sm text-pink-700 font-medium">Wellness Score</div>
                          <div className="text-xs text-pink-600 bg-pink-100 px-2 py-1 rounded-full mt-1">
                            {components.wellness >= 80 ? 'Excellent' : components.wellness >= 65 ? 'Good' : components.wellness >= 50 ? 'Fair' : 'Needs Work'}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                        {[
                          { label: 'Mood', color: '#8b5cf6', textColor: 'text-purple-600', value: latestMood.mood ? latestMood.mood * 20 : components.wellness, sub: latestMood.moodEmoji || '😊' },
                          { label: 'Energy', color: '#10b981', textColor: 'text-green-600', value: latestMood.energy ? latestMood.energy * 10 : 70, sub: `${latestMood.energy || 7}/10` },
                          { label: 'Calm', color: '#f59e0b', textColor: 'text-amber-600', value: (10 - (latestMood.stress || 5)) * 10, sub: `${latestMood.stress || 5}/10` },
                        ].map((ring, i) => (
                          <div key={i} className="text-center">
                            <div className="relative w-12 h-12 mx-auto mb-1">
                              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 40 40">
                                <circle cx="20" cy="20" r="16" stroke="#e5e7eb" strokeWidth="3" fill="none" />
                                <circle cx="20" cy="20" r="16" stroke={ring.color} strokeWidth="3" fill="none"
                                  strokeDasharray={`${2 * Math.PI * 16}`}
                                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - ring.value / 100)}`} />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-xs font-bold ${ring.textColor}`}>{ring.value}</span>
                              </div>
                            </div>
                            <div className={`text-xs font-medium ${ring.textColor}`}>{ring.label}</div>
                            <div className="text-xs text-gray-400">{ring.sub}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })() : (
                  <div className="text-center py-6">
                    <Heart className="w-12 h-12 mx-auto mb-2 text-gray-200" />
                    <p className="text-sm text-gray-400 mb-3">No mood data yet</p>
                    <button onClick={() => window.location.href = '/app/mood'}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all">
                      Track Your Mood
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="grid grid-cols-1 gap-6">
            <AIInsights />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;