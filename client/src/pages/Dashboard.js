import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import { useServerAuth } from '../context/ServerAuthContext';
import { Plus, Heart, Brain, BarChart3, Target } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import TaskSummary from '../components/TaskSummary';
import TimeTracker from '../components/TimeTracker';
import ActivityRings from '../components/ActivityRings';
import SleepChart from '../components/SleepChart';
import ScreenTimeChart from '../components/ScreenTimeChart';
import MoodSlider from '../components/MoodSlider';
import DistractionAlerts from '../components/DistractionAlerts';
import AIInsights from '../components/AIInsights';

const Dashboard = () => {
  const { user } = useServerAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [wellnessScore, setWellnessScore] = useState(75);
  const [dayScoreData, setDayScoreData] = useState({
    productivity: 85,
    health: 78,
    focus: 82,
    wellness: 75
  });
  
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
    fetchScreenTime
  } = useData();

  // Update wellness score from localStorage
  useEffect(() => {
    const updateWellnessScore = () => {
      const latestScores = localStorage.getItem('latestMoodWellnessScores');
      if (latestScores) {
        const scores = JSON.parse(latestScores);
        setWellnessScore(scores.wellnessScore);
        setDayScoreData(prev => ({
          ...prev,
          wellness: scores.wellnessScore
        }));
      }
    };

    // Update on mount
    updateWellnessScore();

    // Listen for storage changes (when mood is updated)
    const handleStorageChange = (e) => {
      if (e.key === 'latestMoodWellnessScores') {
        updateWellnessScore();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for updates within the same tab
    const interval = setInterval(updateWellnessScore, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Calculate overall day score
  const calculateOverallScore = () => {
    const { productivity, health, focus, wellness } = dayScoreData;
    return Math.round((productivity * 0.25) + (health * 0.25) + (focus * 0.25) + (wellness * 0.25));
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
            <button className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors">
              <Plus className="w-5 h-5" />
            </button>
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
                <span className="text-sm text-red-500">📉 vs yesterday</span>
              </div>

              {/* Score Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Productivity</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{width: `${dayScoreData.productivity}%`}}></div>
                    </div>
                    <span className="text-sm font-medium">{dayScoreData.productivity}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Health</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-green-500 rounded-full" style={{width: `${dayScoreData.health}%`}}></div>
                    </div>
                    <span className="text-sm font-medium">{dayScoreData.health}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Focus</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-purple-500 rounded-full" style={{width: `${dayScoreData.focus}%`}}></div>
                    </div>
                    <span className="text-sm font-medium">{dayScoreData.focus}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mood Wellness</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transition-all duration-500" 
                        style={{width: `${dayScoreData.wellness}%`}}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{dayScoreData.wellness}</span>
                  </div>
                </div>
              </div>

              {/* Today's Insight */}
              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-1">Today's Insight</h4>
                <p className="text-sm text-blue-700">
                  {wellnessScore >= 80 
                    ? "Excellent wellness score boosting your overall day performance!" 
                    : wellnessScore >= 65 
                    ? "Good wellness balance contributing to your productivity today!" 
                    : wellnessScore >= 50 
                    ? "Consider tracking your mood to improve your overall day score." 
                    : "Your wellness needs attention - visit the Mood page to boost your day score."
                  }
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Today's Progress</span>
                  <span>17%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-green-500 rounded-full" style={{width: '17%'}}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Sat</span>
                </div>
              </div>
            </div>

            {/* Task Assignments - Middle Column */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Task Assignments</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>

              {/* Task Stats */}
              <div className="flex justify-center space-x-8 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{tasks?.filter(t => t.status === 'todo').length || 2}</div>
                  <div className="text-sm text-gray-500">To Do</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{tasks?.filter(t => t.status === 'in-progress').length || 3}</div>
                  <div className="text-sm text-gray-500">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{tasks?.filter(t => t.status === 'done').length || 1}</div>
                  <div className="text-sm text-gray-500">Done</div>
                </div>
              </div>

              {/* Recent Tasks */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Tasks</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Design New Landing Page</div>
                        <div className="text-xs text-gray-500">Due Jan 26</div>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Prepare Presentation</div>
                        <div className="text-xs text-gray-500">Due Jan 29</div>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Study JavaScript</div>
                        <div className="text-xs text-gray-500">Due Jan 25</div>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Complete Math Assignment</div>
                        <div className="text-xs text-gray-500">Due Jan 25</div>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Read Research Paper</div>
                        <div className="text-xs text-gray-500">Due Jan 27</div>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Progress & Sleep Duration - Right Column */}
            <div className="space-y-6">
              {/* Activity Progress */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Progress</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 40 40">
                          <circle cx="20" cy="20" r="16" stroke="#f3f4f6" strokeWidth="3" fill="none" />
                          <circle cx="20" cy="20" r="16" stroke="#10b981" strokeWidth="3" fill="none"
                            strokeDasharray={`${2 * Math.PI * 16}`}
                            strokeDashoffset={`${2 * Math.PI * 16 * (1 - 0.95)}`} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-green-600">95%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Steps</div>
                        <div className="text-xs text-gray-500">9,500 / 10,000</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 40 40">
                          <circle cx="20" cy="20" r="16" stroke="#f3f4f6" strokeWidth="3" fill="none" />
                          <circle cx="20" cy="20" r="16" stroke="#8b5cf6" strokeWidth="3" fill="none"
                            strokeDasharray={`${2 * Math.PI * 16}`}
                            strokeDashoffset={`${2 * Math.PI * 16 * (1 - 0.75)}`} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-purple-600">75%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Active Minutes</div>
                        <div className="text-xs text-gray-500">45 / 60 min</div>
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
            <div className="space-y-6">
              <TaskSummary tasks={tasks} />
              <TimeTracker timeLogs={timeLogs} />
            </div>
            <div className="space-y-6">
              <ScreenTimeChart screenTime={screenTime} />
              <DistractionAlerts screenTime={screenTime} />
            </div>
          </div>
        )}

        {activeTab === 'wellness' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <SleepChart healthData={healthData} />
              <MoodSlider moodData={moodData} />
              
              {/* Mood & Wellness Scores */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <span>Mood & Wellness Scores</span>
                </h3>
                
                {(() => {
                  // Get latest mood and wellness scores from localStorage
                  const latestScores = localStorage.getItem('latestMoodWellnessScores');
                  const moodEntries = localStorage.getItem('moodEntries');
                  const scores = latestScores ? JSON.parse(latestScores) : null;
                  const entries = moodEntries ? JSON.parse(moodEntries) : [];
                  
                  if (scores) {
                    // Get the latest entry for detailed breakdown
                    const latestEntry = entries.find(entry => entry.date === scores.date);
                    
                    return (
                      <div className="space-y-4">
                        {/* Main Score Display */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-purple-50 rounded-xl">
                            <div className="text-3xl font-bold text-purple-600 mb-1">
                              {scores.moodScore}
                            </div>
                            <div className="text-sm text-purple-700 font-medium mb-1">Mood Score</div>
                            <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                              {scores.moodCategory}
                            </div>
                          </div>
                          
                          <div className="text-center p-4 bg-pink-50 rounded-xl">
                            <div className="text-3xl font-bold text-pink-600 mb-1">
                              {scores.wellnessScore}
                            </div>
                            <div className="text-sm text-pink-700 font-medium mb-1">Wellness Score</div>
                            <div className="text-xs text-pink-600 bg-pink-100 px-2 py-1 rounded-full">
                              {scores.wellnessCategory}
                            </div>
                          </div>
                        </div>
                        
                        {/* Wellness Components Breakdown */}
                        {latestEntry && (
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                            <h4 className="text-sm font-semibold text-gray-800 mb-3 text-center">Wellness Components</h4>
                            <div className="grid grid-cols-3 gap-3">
                              {/* Mood Component */}
                              <div className="text-center">
                                <div className="relative w-12 h-12 mx-auto mb-2">
                                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 40 40">
                                    <circle cx="20" cy="20" r="16" stroke="#e5e7eb" strokeWidth="3" fill="none" />
                                    <circle cx="20" cy="20" r="16" stroke="#8b5cf6" strokeWidth="3" fill="none"
                                      strokeDasharray={`${2 * Math.PI * 16}`}
                                      strokeDashoffset={`${2 * Math.PI * 16 * (1 - (latestEntry.mood * 20) / 100)}`} />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-bold text-purple-600">{latestEntry.mood * 20}</span>
                                  </div>
                                </div>
                                <div className="text-xs font-medium text-purple-700">Mood</div>
                                <div className="text-xs text-purple-600">{latestEntry.moodEmoji}</div>
                              </div>
                              
                              {/* Energy Component */}
                              <div className="text-center">
                                <div className="relative w-12 h-12 mx-auto mb-2">
                                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 40 40">
                                    <circle cx="20" cy="20" r="16" stroke="#e5e7eb" strokeWidth="3" fill="none" />
                                    <circle cx="20" cy="20" r="16" stroke="#10b981" strokeWidth="3" fill="none"
                                      strokeDasharray={`${2 * Math.PI * 16}`}
                                      strokeDashoffset={`${2 * Math.PI * 16 * (1 - (latestEntry.energy * 10) / 100)}`} />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-bold text-green-600">{latestEntry.energy * 10}</span>
                                  </div>
                                </div>
                                <div className="text-xs font-medium text-green-700">Energy</div>
                                <div className="text-xs text-green-600">{latestEntry.energy}/10</div>
                              </div>
                              
                              {/* Stress Management Component (inverted) */}
                              <div className="text-center">
                                <div className="relative w-12 h-12 mx-auto mb-2">
                                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 40 40">
                                    <circle cx="20" cy="20" r="16" stroke="#e5e7eb" strokeWidth="3" fill="none" />
                                    <circle cx="20" cy="20" r="16" stroke="#f59e0b" strokeWidth="3" fill="none"
                                      strokeDasharray={`${2 * Math.PI * 16}`}
                                      strokeDashoffset={`${2 * Math.PI * 16 * (1 - ((10 - latestEntry.stress) * 10) / 100)}`} />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-bold text-amber-600">{(10 - latestEntry.stress) * 10}</span>
                                  </div>
                                </div>
                                <div className="text-xs font-medium text-amber-700">Stress Mgmt</div>
                                <div className="text-xs text-amber-600">{latestEntry.stress}/10</div>
                              </div>
                            </div>
                            
                            {/* Component Explanation */}
                            <div className="mt-3 text-center text-xs text-gray-600">
                              Wellness combines mood level, energy boost, and stress management
                            </div>
                          </div>
                        )}
                        
                        {/* Last Updated */}
                        <div className="text-center text-xs text-gray-500 pt-2 border-t">
                          Last updated: {new Date(scores.timestamp).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        
                        {/* Quick Action */}
                        <div className="text-center">
                          <button 
                            onClick={() => window.location.href = '/app/mood'}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Update Today's Mood →
                          </button>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-center py-6">
                        <div className="text-gray-400 mb-3">
                          <Heart className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm">No mood data yet</p>
                        </div>
                        <button 
                          onClick={() => window.location.href = '/app/mood'}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                        >
                          Track Your Mood
                        </button>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
            <div className="space-y-6">
              <ActivityRings healthData={healthData} />
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Wellness Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sleep Duration</span>
                    <span className="font-medium">{healthData?.sleep?.duration || 7.5}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Steps Today</span>
                    <span className="font-medium">{healthData?.activity?.steps?.toLocaleString() || '8,500'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Minutes</span>
                    <span className="font-medium">{healthData?.activity?.activeMinutes || 45}min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Mood Rating</span>
                    <span className="font-medium">{moodData?.mood || 4}/5</span>
                  </div>
                  
                  {/* Add Wellness Score to Summary */}
                  {(() => {
                    const latestScores = localStorage.getItem('latestMoodWellnessScores');
                    const scores = latestScores ? JSON.parse(latestScores) : null;
                    
                    if (scores) {
                      return (
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-sm text-gray-600">Overall Wellness</span>
                          <span className="font-medium text-pink-600">{scores.wellnessScore}/100</span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
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

      {/* Quick Action Floating Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors">
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;