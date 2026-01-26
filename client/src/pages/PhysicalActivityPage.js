import React, { useState } from 'react';
import { Activity, Brain, Target, ArrowLeft, Clock, Trophy, Calendar, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PhysicalActivityPage = () => {
  const navigate = useNavigate();
  const [selectedActivity, setSelectedActivity] = useState('Cardio');
  const [selectedPeriod, setSelectedPeriod] = useState('7 Days');
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState('Medium');
  
  const [activityData, setActivityData] = useState({
    activeTime: '45 mins',
    workoutsDone: '2 today',
    lastActivity: 'Mon • Cardio • 30 mins',
    score: 78,
    dailyGoal: 60
  });

  // Generate activity data based on selected period
  const generateActivityData = (days) => {
    const data = [];
    for (let i = 0; i < days; i++) {
      const baseActivity = 20 + (i / days) * 30; // Gradual improvement from 20 to 50 minutes
      const variation = (Math.random() - 0.5) * 15;
      const activity = Math.max(10, Math.min(60, baseActivity + variation));
      data.push(Math.round(activity));
    }
    return data;
  };

  const getActivityDataForPeriod = () => {
    switch (selectedPeriod) {
      case '7 Days':
        return generateActivityData(7);
      case '14 Days':
        return generateActivityData(14);
      case '30 Days':
      default:
        return generateActivityData(30);
    }
  };

  const weeklyData = getActivityDataForPeriod();

  const logActivity = () => {
    // Activity logging functionality
    console.log(`Activity logged: ${selectedActivity}, Duration: ${duration} mins, Intensity: ${intensity}`);
    // Here you would typically save to database
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/app/health')}
        className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Health</span>
      </button>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Physical Activity</h1>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600 text-sm">Active Time</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">{activityData.activeTime}</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Trophy className="w-5 h-5 text-orange-500" />
                <span className="text-gray-600 text-sm">Workouts</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">{activityData.workoutsDone}</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                <span className="text-gray-600 text-sm">Last Activity</span>
              </div>
              <div className="text-lg font-medium text-gray-800">{activityData.lastActivity}</div>
            </div>
          </div>

          {/* What did you do today? */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">What did you do today?</h2>
            
            {/* Activity Type Selection */}
            <div className="flex justify-center space-x-4 mb-8">
              {[
                { name: 'Cardio', icon: '💜', color: 'purple' },
                { name: 'Strength', icon: '🏋️', color: 'blue' },
                { name: 'Mind & Recovery', icon: '🧘', color: 'green' }
              ].map((activity) => (
                <button
                  key={activity.name}
                  onClick={() => setSelectedActivity(activity.name)}
                  className={`flex items-center space-x-3 px-6 py-4 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    selectedActivity === activity.name
                      ? `bg-${activity.color}-100 text-${activity.color}-700 border-2 border-${activity.color}-300`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                  }`}
                >
                  <span className="text-2xl">{activity.icon}</span>
                  <span>{activity.name}</span>
                </button>
              ))}
            </div>

            {/* Duration Slider */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-lg font-medium text-gray-700">Duration:</label>
                <span className="text-2xl font-bold text-gray-800">{duration} mins</span>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="15"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${((duration-15)/(90-15))*100}%, #e5e7eb ${((duration-15)/(90-15))*100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>15</span>
                  <span>30</span>
                  <span>45</span>
                  <span>60</span>
                  <span>75</span>
                  <span>90</span>
                </div>
              </div>
            </div>

            {/* Intensity Selection */}
            <div className="mb-8">
              <label className="block text-lg font-medium text-gray-700 mb-4">Intensity:</label>
              <div className="flex justify-center space-x-4">
                {[
                  { name: 'Low', emoji: '😊', color: 'green' },
                  { name: 'Medium', emoji: '😅', color: 'purple' },
                  { name: 'High', emoji: '😤', color: 'red' }
                ].map((level) => (
                  <button
                    key={level.name}
                    onClick={() => setIntensity(level.name)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                      intensity === level.name
                        ? `bg-${level.color}-100 text-${level.color}-700 border-2 border-${level.color}-300`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                  >
                    <span className="text-xl">{level.emoji}</span>
                    <span>{level.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Log Activity Button */}
            <div className="text-center">
              <button
                onClick={logActivity}
                className="bg-purple-500 text-white font-semibold py-4 px-12 rounded-2xl hover:bg-purple-600 transition-all duration-200 shadow-lg text-lg"
              >
                Log Activity
              </button>
            </div>
          </div>

          {/* Activity Trends */}
          <div className="mb-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              {/* Period Selection */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Activity Trends</h3>
                <div className="flex space-x-2">
                  {['7 Days', '14 Days', '30 Days'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedPeriod === period
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart */}
              <div className="relative h-40 mb-4">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-4">
                  <span>60</span>
                  <span>40</span>
                  <span>20</span>
                  <span>0</span>
                </div>

                {/* Chart area */}
                <div className="ml-12 h-full relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0">
                    {[0, 33, 66, 100].map((percent) => (
                      <div
                        key={percent}
                        className="absolute w-full border-t border-gray-100"
                        style={{ bottom: `${percent}%` }}
                      />
                    ))}
                  </div>

                  {/* Bars */}
                  <div className="relative h-full flex items-end justify-between px-2">
                    {weeklyData.map((value, index) => (
                      <div key={index} className="flex flex-col items-center flex-1 mx-1">
                        <div
                          className="bg-green-400 rounded-t w-full max-w-8 transition-all duration-500 hover:bg-green-500"
                          style={{ height: `${(value / 60) * 100}%` }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Trend line with arrow */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <polyline
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                      points={weeklyData.map((value, index) => {
                        const x = ((index + 0.5) / weeklyData.length) * 100;
                        const y = 100 - (value / 60) * 100;
                        return `${x}%,${y}%`;
                      }).join(' ')}
                    />
                    {/* Arrow at the end */}
                    {weeklyData.length > 1 && (
                      <g>
                        <polygon
                          points="0,0 -8,-3 -8,3"
                          fill="#10B981"
                          transform={`translate(${((weeklyData.length - 0.5) / weeklyData.length) * 100}%, ${100 - (weeklyData[weeklyData.length - 1] / 60) * 100}%) rotate(${
                            Math.atan2(
                              (100 - (weeklyData[weeklyData.length - 1] / 60) * 100) - (100 - (weeklyData[weeklyData.length - 2] / 60) * 100),
                              (((weeklyData.length - 0.5) / weeklyData.length) * 100) - (((weeklyData.length - 1.5) / weeklyData.length) * 100)
                            ) * (180 / Math.PI)
                          })`}
                        />
                      </g>
                    )}
                  </svg>
                </div>
              </div>

              {/* X-axis labels */}
              <div className="ml-12 flex justify-between text-xs text-gray-500">
                {weeklyData.map((_, index) => {
                  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                  if (selectedPeriod === '7 Days') {
                    return <span key={index}>{days[index]}</span>;
                  } else if (selectedPeriod === '14 Days') {
                    return index % 2 === 0 ? <span key={index}>Day {index + 1}</span> : <span key={index}></span>;
                  } else {
                    return index % 5 === 0 ? <span key={index}>Day {index + 1}</span> : <span key={index}></span>;
                  }
                })}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Insight */}
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Brain className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-green-900 font-semibold mb-2 text-lg">AI Insight</h3>
                  <p className="text-green-800">
                    Your activity level is consistent this week! Adding <span className="font-semibold">10</span> more minutes of walking daily can boost your DayScore by <span className="font-semibold">8%</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* Daily Activity Goal */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700 font-medium">Daily Activity Goal</span>
                </div>
                <span className="text-gray-800 font-bold text-lg">{activityData.dailyGoal} mins</span>
              </div>
              <div className="w-full bg-green-100 rounded-full h-4 overflow-hidden mb-4">
                <div 
                  className="bg-green-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((45 / activityData.dailyGoal) * 100, 100)}%` }}
                />
              </div>
              <p className="text-gray-600 text-center">
                Almost there! Keep moving 🏃‍♂️
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicalActivityPage;