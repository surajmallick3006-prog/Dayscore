import React, { useState, useEffect } from 'react';
import { Moon, Activity, Droplets, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HealthPage = () => {
  const navigate = useNavigate();
  
  const [sleepData, setSleepData] = useState({
    duration: '6h 45m',
    quality: 84,
    goal: '8h 0m'
  });

  const [activityData, setActivityData] = useState({
    activeMinutes: 45,
    goal: 60,
    intensityZones: [
      { name: 'Light', value: 15, color: '#FF6B6B' },
      { name: 'Moderate', value: 20, color: '#4ECDC4' },
      { name: 'Vigorous', value: 10, color: '#45B7D1' }
    ],
    weeklyData: [25, 35, 45, 30, 40, 50, 45]
  });

  const [waterData, setWaterData] = useState({
    intake: 1.8,
    goal: 2.5,
    glasses: [true, true, true, true, true, false, false, false]
  });

  const getCurrentDate = () => {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return now.toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
          HEALTH ACTIVITIES
        </h1>
        <div className="text-right text-gray-500 text-sm">
          {getCurrentDate()}
        </div>
      </div>

      {/* Main Cards Container */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Sleep Duration Card */}
          <div 
            className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200"
            onClick={() => navigate('/app/sleep-duration')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">SLEEP DURATION</h3>
              <Moon className="w-6 h-6 text-purple-400" />
            </div>
            
            <div className="text-center mb-6">
              <div className="text-4xl font-bold mb-2 text-gray-800">{sleepData.duration}</div>
              <div className="text-gray-500 text-sm">Goal: {sleepData.goal}</div>
            </div>

            {/* Circular Progress */}
            <div className="flex justify-center mb-6">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="url(#sleepGradient)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - sleepData.quality / 100)}`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="sleepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="50%" stopColor="#EC4899" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-800">{sleepData.quality}%</span>
                </div>
              </div>
            </div>

            <div className="text-center mb-4">
              <span className="text-sm text-gray-600">Good</span>
            </div>

            {/* Sleep Chart */}
            <div className="mb-4">
              <div className="h-16 flex items-end justify-between bg-gradient-to-r from-orange-200 via-pink-200 to-purple-200 rounded-lg p-2">
                <svg className="w-full h-full" viewBox="0 0 200 60">
                  <path
                    d="M 0 30 Q 25 10 50 30 T 100 30 Q 125 50 150 30 T 200 30"
                    stroke="url(#sleepWaveGradient)"
                    strokeWidth="2"
                    fill="none"
                    className="opacity-80"
                  />
                  <defs>
                    <linearGradient id="sleepWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="50%" stopColor="#EC4899" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Awake</span>
                <span>Light</span>
                <span>Deep</span>
                <span>Sleep</span>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              AI predicts a 13% drop in focus tomorrow if you don't hit REM sleep by 11:00 PM
            </div>
          </div>

          {/* Physical Activity Card */}
          <div 
            className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200"
            onClick={() => navigate('/app/physical-activity')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">PHYSICAL ACTIVITY</h3>
              <Activity className="w-6 h-6 text-orange-400" />
            </div>

            {/* Activity Rings */}
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32">
                {/* Outer Ring - Move */}
                <svg className="absolute inset-0 w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#F59E0B"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - 0.75)}`}
                    strokeLinecap="round"
                  />
                </svg>
                
                {/* Inner Ring - Exercise */}
                <svg className="absolute inset-2 w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#10B981"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.6)}`}
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="text-xs text-orange-500">Active</div>
                  <div className="text-xs text-orange-500">Minutes</div>
                  <div className="text-xs text-green-500 mt-1">10K</div>
                  <div className="text-xs text-green-500">Sessions</div>
                </div>
              </div>
            </div>

            {/* Active Minutes */}
            <div className="mb-4 text-center">
              <div className="text-sm text-gray-600 mb-2">Active Minutes</div>
              <div className="text-2xl font-bold text-gray-800">{activityData.activeMinutes}</div>
            </div>

            {/* Weekly Chart */}
            <div className="mb-4">
              <div className="h-16 flex items-end justify-between space-x-1">
                {activityData.weeklyData.map((value, index) => {
                  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div
                        className="w-full rounded-t"
                        style={{ 
                          height: `${(value / 60) * 60}px`,
                          backgroundColor: index < 3 ? '#F59E0B' : index < 5 ? '#10B981' : '#06B6D4'
                        }}
                      />
                      <span className="text-xs text-gray-500 mt-1">{days[index]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-xs text-gray-500 mb-2">
              Intensity Zones
            </div>
            <div className="text-xs text-gray-500">
              A 20 min run puts you in the more high intensity zone. Keep it up!
            </div>
          </div>

          {/* Water Intake Card */}
          <div 
            className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200"
            onClick={() => navigate('/app/water-intake')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">WATER INTAKE</h3>
              <Droplets className="w-6 h-6 text-blue-400" />
            </div>

            <div className="text-center mb-6">
              <div className="text-sm text-gray-600 mb-2">
                Raised your goal to 4.0 L so reach optimal hydration.
              </div>
              <div className="text-sm text-gray-500 mb-4">
                100-150% of daily goal recommended.
              </div>
            </div>

            {/* Water Bottle Visualization */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <svg width="80" height="120" viewBox="0 0 80 120" className="text-gray-300">
                  {/* Bottle outline */}
                  <path
                    d="M25 20 L25 15 Q25 10 30 10 L50 10 Q55 10 55 15 L55 20 L60 25 Q65 30 65 35 L65 100 Q65 110 55 110 L25 110 Q15 110 15 100 L15 35 Q15 30 20 25 Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="transparent"
                  />
                  {/* Water fill */}
                  <path
                    d="M20 30 L60 30 L60 100 Q60 105 55 105 L25 105 Q20 105 20 100 Z"
                    fill="url(#waterGradient)"
                    opacity="0.7"
                  />
                  <defs>
                    <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#22D3EE" />
                      <stop offset="100%" stopColor="#0891B2" />
                    </linearGradient>
                  </defs>
                </svg>
                
                <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                  <div className="bg-cyan-400 text-white text-xs px-2 py-1 rounded-full">
                    + 250ml
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-gray-800">{waterData.intake}L</div>
              <div className="text-gray-500 text-sm">Daily goal: 3.0 L</div>
            </div>

            {/* Water Glasses */}
            <div className="flex justify-center space-x-2 mb-4">
              {waterData.glasses.map((filled, index) => (
                <div
                  key={index}
                  className={`w-6 h-8 rounded-b-full border-2 ${
                    filled 
                      ? 'bg-cyan-400 border-cyan-400' 
                      : 'border-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Days of week */}
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              {['250ml', '500ml', '750ml', '1000ml', '1250ml', '1500ml', '1750ml', '2000ml'].map((amount, index) => (
                <div key={index} className="text-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mb-1 mx-auto"></div>
                  <span className="transform -rotate-90 origin-center text-xs">{amount.slice(0, 3)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Navigation Icons */}
        <div className="flex justify-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-full px-8 py-4 flex space-x-8 shadow-lg border border-gray-200">
            <button className="p-3 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors">
              <Moon className="w-6 h-6" />
            </button>
            <button className="p-3 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors">
              <Activity className="w-6 h-6" />
            </button>
            <button className="p-3 rounded-full bg-cyan-100 text-cyan-600 hover:bg-cyan-200 transition-colors">
              <Droplets className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthPage;