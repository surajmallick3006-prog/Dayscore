import React, { useState } from 'react';
import { Droplets, Brain, Target, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

const WaterIntakePage = () => {
  const navigate = useNavigate();
  const { saveHealthData } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('7 Days');
  
  const [waterData, setWaterData] = useState({
    intake: 0.0, // Start from 0 to let users track their actual intake
    goal: 4.0, // 4.0L as bare minimum
    hydrationLevel: 'Very Low', // Start with very low since intake is 0
    score: 0 // Start with 0 score
  });

  // Generate data based on selected period
  const generateWaterData = (days) => {
    const data = [];
    for (let i = 0; i < days; i++) {
      const baseIntake = 0.8 + (i / days) * 1.2; // Gradual improvement from 0.8L to 2.0L
      const variation = (Math.random() - 0.5) * 0.4;
      const intake = Math.max(0.2, Math.min(2.5, baseIntake + variation));
      data.push(parseFloat(intake.toFixed(1)));
    }
    return data;
  };

  const getWaterDataForPeriod = () => {
    switch (selectedPeriod) {
      case '7 Days':
        return generateWaterData(7);
      case '14 Days':
        return generateWaterData(14);
      case '30 Days':
      default:
        return generateWaterData(30);
    }
  };

  const weeklyData = getWaterDataForPeriod();

  const logWater = (amount) => {
    let amountInL;
    
    if (amount.includes('L')) {
      // Handle 1L format
      amountInL = parseFloat(amount.replace('L', ''));
    } else {
      // Handle ml format
      amountInL = parseFloat(amount.replace(' ml', '')) / 1000;
    }
    
    const newIntake = waterData.intake + amountInL;
    
    // Determine hydration level based on intake
    let hydrationLevel;
    if (newIntake >= 4.0) {
      hydrationLevel = 'Excellent';
    } else if (newIntake >= 3.0) {
      hydrationLevel = 'Good';
    } else if (newIntake >= 2.0) {
      hydrationLevel = 'Moderate';
    } else if (newIntake >= 1.0) {
      hydrationLevel = 'Low';
    } else {
      hydrationLevel = 'Very Low';
    }
    
    setWaterData(prev => ({
      ...prev,
      intake: newIntake,
      score: Math.round((newIntake / prev.goal) * 100),
      hydrationLevel: hydrationLevel
    }));

    // Sync to DataContext / API
    saveHealthData({
      water: { intake: newIntake, goal: waterData.goal },
      date: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
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
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-gray-200 shadow-lg">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Droplets className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Water Intake</h1>
                <p className="text-gray-600">Track your daily hydration and stay refreshed</p>
              </div>
            </div>

            {/* Circular Progress */}
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  stroke={waterData.score >= 100 ? "#10B981" : "#3B82F6"}
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 35}`}
                  strokeDashoffset={`${2 * Math.PI * 35 * (1 - Math.min(waterData.score, 100) / 100)}`}
                  strokeLinecap="round"
                />
                {/* Extra ring for scores above 100% */}
                {waterData.score > 100 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="30"
                    stroke="#10B981"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 30}`}
                    strokeDashoffset={`${2 * Math.PI * 30 * (1 - Math.min((waterData.score - 100) / 100, 1))}`}
                    strokeLinecap="round"
                    opacity="0.7"
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${waterData.score >= 100 ? 'text-green-600' : 'text-gray-800'}`}>
                  {waterData.score}
                </span>
                <span className="text-gray-500 text-sm">
                  {waterData.score >= 100 ? 'Goal+' : '/100'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <span className="text-gray-600 text-sm">Water Consumed</span>
              </div>
              <div className="text-3xl font-bold text-gray-800">{waterData.intake.toFixed(1)} L</div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600 text-sm">Hydration Level</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">{waterData.hydrationLevel}</div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="text-gray-600 text-sm">Daily Goal</span>
              </div>
              <div className="text-3xl font-bold text-gray-800">{waterData.goal.toFixed(1)} L+</div>
              <p className="text-xs text-gray-500 mt-1">Minimum recommended</p>
            </div>
          </div>

          {/* Amount Selection - Direct Add Buttons */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-3 justify-center mb-4">
              {['250 ml', '500 ml', '750 ml', '1L'].map((amount) => (
                <button
                  key={amount}
                  onClick={() => logWater(amount)}
                  className="px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Add {amount}
                </button>
              ))}
            </div>
            
            {/* Reset Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setWaterData(prev => ({ 
                  ...prev, 
                  intake: 0, 
                  score: 0, 
                  hydrationLevel: 'Very Low' 
                }))}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition-colors"
              >
                Reset Day
              </button>
            </div>
          </div>

          {/* Encouragement Message */}
          <div className="text-center mb-6">
            <p className="text-gray-600 text-lg flex items-center justify-center space-x-2">
              <span>
                {waterData.intake >= waterData.goal 
                  ? `Great job! You've exceeded your daily goal! 🎉`
                  : waterData.intake >= waterData.goal * 0.75
                  ? `Almost there! You're ${Math.round((waterData.intake / waterData.goal) * 100)}% to your goal!`
                  : waterData.intake >= waterData.goal * 0.5
                  ? `You're halfway to your goal! Keep it up`
                  : `Keep going! You're ${Math.round((waterData.intake / waterData.goal) * 100)}% to your 4.0L+ goal`
                }
              </span>
              <span className="text-blue-500">💧</span>
            </p>
          </div>

          {/* Weekly Chart */}
          <div className="mb-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              {/* Period Selection */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Water Intake Trends</h3>
                <div className="flex space-x-2">
                  {['7 Days', '14 Days', '30 Days'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedPeriod === period
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative h-40 mb-4">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-4">
                  <span>2.5L</span>
                  <span>2.0</span>
                  <span>1.5</span>
                  <span>1.0</span>
                  <span>0.5</span>
                  <span>0</span>
                </div>

                {/* Chart area */}
                <div className="ml-12 h-full relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0">
                    {[0, 20, 40, 60, 80, 100].map((percent) => (
                      <div
                        key={percent}
                        className="absolute w-full border-t border-gray-100"
                        style={{ bottom: `${percent}%` }}
                      />
                    ))}
                  </div>

                  {/* Bars */}
                  <div className="relative h-full flex items-end justify-between px-2">
                    {weeklyData.map((intake, index) => (
                      <div key={index} className="flex flex-col items-center flex-1 mx-1">
                        <div
                          className="bg-blue-500 rounded-t w-full max-w-8 transition-all duration-500 hover:bg-blue-600"
                          style={{ height: `${(intake / 2.5) * 100}%` }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Trend line */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <polyline
                      fill="none"
                      stroke="#60A5FA"
                      strokeWidth="2"
                      points={weeklyData.map((intake, index) => {
                        const x = ((index + 0.5) / weeklyData.length) * 100;
                        const y = 100 - (intake / 2.5) * 100;
                        return `${x}%,${y}%`;
                      }).join(' ')}
                    />
                    {/* Arrow at the end */}
                    {weeklyData.length > 1 && (
                      <g>
                        <polygon
                          points="0,0 -8,-3 -8,3"
                          fill="#60A5FA"
                          transform={`translate(${((weeklyData.length - 0.5) / weeklyData.length) * 100}%, ${100 - (weeklyData[weeklyData.length - 1] / 2.5) * 100}%) rotate(${
                            Math.atan2(
                              (100 - (weeklyData[weeklyData.length - 1] / 2.5) * 100) - (100 - (weeklyData[weeklyData.length - 2] / 2.5) * 100),
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
                  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                  if (selectedPeriod === '7 Days') {
                    return <span key={index}>{days[index]}</span>;
                  } else if (selectedPeriod === '14 Days') {
                    return index % 2 === 0 ? <span key={index}>Day {index + 1}</span> : <span key={index}></span>;
                  } else {
                    return index % 5 === 0 ? <span key={index}>Day {index + 1}</span> : <span key={index}></span>;
                  }
                })}
              </div>
              
              <div className="text-center text-sm text-gray-500 mt-4">
                {selectedPeriod === '7 Days' ? 'Last 7 Days' : 
                 selectedPeriod === '14 Days' ? 'Last 14 Days' : 
                 'Last 30 Days'} Water Intake Pattern
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Insight */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-blue-900 font-semibold mb-2 text-lg">AI Insight</h3>
                  <p className="text-blue-800">
                    {waterData.intake >= waterData.goal 
                      ? "Excellent hydration! You're exceeding your daily goal. Keep up the great work!"
                      : `Drink ${(waterData.goal - waterData.intake).toFixed(1)} more liters today to reach your goal. Hydration can improve your focus and energy levels by up to 12%.`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Daily Goal Progress */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700 font-medium">Daily Water Goal</span>
                </div>
                <span className="text-gray-800 font-bold text-lg">{waterData.goal.toFixed(1)} L+</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-4 overflow-hidden mb-4">
                <div 
                  className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((waterData.intake / waterData.goal) * 100, 100)}%` }}
                />
              </div>
              <p className="text-gray-600 text-center">
                Keep sipping! Stay hydrated 💧
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterIntakePage;