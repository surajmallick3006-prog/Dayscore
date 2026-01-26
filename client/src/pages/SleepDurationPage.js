import React, { useState, useEffect, useRef } from 'react';
import { Moon, Brain, Target, ArrowLeft, Clock, Utensils, Play, Pause, Square, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SleepDurationPage = () => {
  const navigate = useNavigate();
  const [selectedStage, setSelectedStage] = useState('Light Sleep');
  const bedtimeRef = useRef(null);
  const dinnertimeRef = useRef(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7 Days');
  
  // Sleep tracking states
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [trackingStartTime, setTrackingStartTime] = useState(null);
  const [pausedDuration, setPausedDuration] = useState(0);
  const [currentSleepDuration, setCurrentSleepDuration] = useState(0);
  const [sleepSessions, setSleepSessions] = useState([]);
  const [showTimeTracker, setShowTimeTracker] = useState(false);
  
  const [sleepData, setSleepData] = useState({
    duration: '7h 20m',
    quality: 'Good',
    bedtime: '11:30 PM',
    dinnertime: '8:00 PM',
    score: 85,
    goal: 8
  });

  const [showBedtimePicker, setShowBedtimePicker] = useState(false);
  const [showDinnertimePicker, setShowDinnertimePicker] = useState(false);

  // Generate sleep data based on selected period
  const generateSleepData = (days) => {
    const data = [];
    for (let i = 0; i < days; i++) {
      const baseSleep = 6.0 + (i / days) * 2.0; // Gradual improvement from 6h to 8h
      const variation = (Math.random() - 0.5) * 1.5;
      const sleep = Math.max(4.0, Math.min(9.0, baseSleep + variation));
      data.push(parseFloat(sleep.toFixed(1)));
    }
    return data;
  };

  const getSleepDataForPeriod = () => {
    switch (selectedPeriod) {
      case '7 Days':
        return generateSleepData(7);
      case '14 Days':
        return generateSleepData(14);
      case '30 Days':
      default:
        return generateSleepData(30);
    }
  };

  const weeklyData = getSleepDataForPeriod();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bedtimeRef.current && !bedtimeRef.current.contains(event.target)) {
        setShowBedtimePicker(false);
      }
      if (dinnertimeRef.current && !dinnertimeRef.current.contains(event.target)) {
        setShowDinnertimePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sleep tracking timer effect
  useEffect(() => {
    let interval = null;
    
    if (isTracking && !isPaused) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - trackingStartTime - pausedDuration) / 1000);
        setCurrentSleepDuration(elapsed);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, isPaused, trackingStartTime, pausedDuration]);

  // Load sleep sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('sleepSessions');
    if (savedSessions) {
      setSleepSessions(JSON.parse(savedSessions));
    }
  }, []);

  // Save sleep sessions to localStorage
  const saveSessions = (sessions) => {
    localStorage.setItem('sleepSessions', JSON.stringify(sessions));
    setSleepSessions(sessions);
  };

  const updateBedtime = (time) => {
    setSleepData(prev => ({ ...prev, bedtime: time }));
    setShowBedtimePicker(false);
  };

  const updateDinnertime = (time) => {
    setSleepData(prev => ({ ...prev, dinnertime: time }));
    setShowDinnertimePicker(false);
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 1; hour <= 12; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour}:${minute.toString().padStart(2, '0')}`;
        times.push(`${timeStr} AM`);
        times.push(`${timeStr} PM`);
      }
    }
    return times;
  };

  // Sleep tracking functions
  const startSleepTracking = () => {
    const now = Date.now();
    setTrackingStartTime(now);
    setIsTracking(true);
    setIsPaused(false);
    setPausedDuration(0);
    setCurrentSleepDuration(0);
  };

  const pauseSleepTracking = () => {
    setIsPaused(true);
  };

  const resumeSleepTracking = () => {
    const now = Date.now();
    const pauseTime = now - trackingStartTime - currentSleepDuration * 1000;
    setPausedDuration(prev => prev + pauseTime);
    setIsPaused(false);
  };

  const stopSleepTracking = () => {
    if (isTracking && currentSleepDuration > 0) {
      const newSession = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        duration: currentSleepDuration,
        startTime: new Date(trackingStartTime).toLocaleTimeString(),
        endTime: new Date().toLocaleTimeString(),
        stage: selectedStage
      };
      
      const updatedSessions = [newSession, ...sleepSessions.slice(0, 9)]; // Keep last 10 sessions
      saveSessions(updatedSessions);
    }
    
    setIsTracking(false);
    setIsPaused(false);
    setTrackingStartTime(null);
    setPausedDuration(0);
    setCurrentSleepDuration(0);
  };

  const clearSleepSessions = () => {
    saveSessions([]);
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSessionDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const logSleep = () => {
    // Sleep logging functionality
    console.log('Sleep logged');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/health')}
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
              <div className="p-3 bg-orange-100 rounded-xl">
                <Moon className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-orange-600">Sleep Duration</h1>
                <p className="text-gray-600">Track your sleep patterns and aim for better rest</p>
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
                  stroke="#F97316"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 35}`}
                  strokeDashoffset={`${2 * Math.PI * 35 * (1 - sleepData.score / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-orange-600">{sleepData.score}</span>
                <span className="text-gray-500 text-sm">/100</span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-6 border border-orange-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Moon className="w-5 h-5 text-orange-500" />
                <span className="text-gray-600 text-sm">Sleep Duration</span>
              </div>
              <div className="text-3xl font-bold text-orange-600">{sleepData.duration}</div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-orange-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-5 h-5 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600 text-sm">Sleep Quality</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{sleepData.quality}</div>
            </div>
            
            <div ref={bedtimeRef} className="bg-white rounded-2xl p-6 border border-orange-200 shadow-sm relative">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="text-gray-600 text-sm">Bedtime</span>
              </div>
              <button
                onClick={() => setShowBedtimePicker(!showBedtimePicker)}
                className="text-3xl font-bold text-orange-600 hover:text-orange-700 transition-colors"
              >
                {sleepData.bedtime}
              </button>
              
              {showBedtimePicker && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-orange-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  {generateTimeOptions().filter(time => 
                    (time.includes('PM') && (
                      time.startsWith('8:') || time.startsWith('9:') || 
                      time.startsWith('10:') || time.startsWith('11:') || time.startsWith('12:')
                    )) || (time.includes('AM') && (
                      time.startsWith('12:') || time.startsWith('1:') || time.startsWith('2:')
                    ))
                  ).map((time) => (
                    <button
                      key={time}
                      onClick={() => updateBedtime(time)}
                      className="w-full text-left px-4 py-2 hover:bg-orange-50 text-orange-600 transition-colors"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div ref={dinnertimeRef} className="bg-white rounded-2xl p-6 border border-orange-200 shadow-sm relative">
              <div className="flex items-center space-x-2 mb-2">
                <Utensils className="w-5 h-5 text-orange-500" />
                <span className="text-gray-600 text-sm">Dinner Time</span>
              </div>
              <button
                onClick={() => setShowDinnertimePicker(!showDinnertimePicker)}
                className="text-3xl font-bold text-orange-600 hover:text-orange-700 transition-colors"
              >
                {sleepData.dinnertime}
              </button>
              
              {showDinnertimePicker && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-orange-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  {generateTimeOptions().filter(time => 
                    time.includes('PM') && (
                      time.startsWith('5:') || time.startsWith('6:') || 
                      time.startsWith('7:') || time.startsWith('8:') || 
                      time.startsWith('9:') || time.startsWith('10:')
                    )
                  ).map((time) => (
                    <button
                      key={time}
                      onClick={() => updateDinnertime(time)}
                      className="w-full text-left px-4 py-2 hover:bg-orange-50 text-orange-600 transition-colors"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sleep Time Tracker */}
          <div className="mb-6">
            <div className="bg-white rounded-2xl p-6 border border-orange-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-orange-600 flex items-center space-x-2">
                  <Timer className="w-5 h-5" />
                  <span>Sleep Time Tracker</span>
                </h3>
                <button
                  onClick={() => setShowTimeTracker(!showTimeTracker)}
                  className="text-orange-500 hover:text-orange-600 transition-colors text-sm font-medium"
                >
                  {showTimeTracker ? 'Hide Tracker' : 'Show Tracker'}
                </button>
              </div>

              {showTimeTracker && (
                <div className="space-y-4">
                  {/* Current Sleep Timer */}
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-600 mb-2">
                      {formatDuration(currentSleepDuration)}
                    </div>
                    <div className="text-gray-600 text-sm mb-4">
                      {isTracking ? (isPaused ? 'Sleep Tracking Paused' : 'Currently Tracking Sleep') : 'Ready to Track Sleep'}
                    </div>
                    
                    {/* Control Buttons */}
                    <div className="flex justify-center space-x-3">
                      {!isTracking ? (
                        <button
                          onClick={startSleepTracking}
                          className="flex items-center space-x-2 bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-all duration-200 shadow-lg"
                        >
                          <Play className="w-4 h-4" />
                          <span>Start Sleep</span>
                        </button>
                      ) : (
                        <>
                          {!isPaused ? (
                            <button
                              onClick={pauseSleepTracking}
                              className="flex items-center space-x-2 bg-yellow-500 text-white px-4 py-3 rounded-xl hover:bg-yellow-600 transition-all duration-200 shadow-lg"
                            >
                              <Pause className="w-4 h-4" />
                              <span>Pause</span>
                            </button>
                          ) : (
                            <button
                              onClick={resumeSleepTracking}
                              className="flex items-center space-x-2 bg-green-500 text-white px-4 py-3 rounded-xl hover:bg-green-600 transition-all duration-200 shadow-lg"
                            >
                              <Play className="w-4 h-4" />
                              <span>Resume</span>
                            </button>
                          )}
                          <button
                            onClick={stopSleepTracking}
                            className="flex items-center space-x-2 bg-red-500 text-white px-4 py-3 rounded-xl hover:bg-red-600 transition-all duration-200 shadow-lg"
                          >
                            <Square className="w-4 h-4" />
                            <span>Stop & Save</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Recent Sleep Sessions */}
                  {sleepSessions.length > 0 && (
                    <div className="border-t border-orange-200 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-700">Recent Sleep Sessions</h4>
                        <button
                          onClick={clearSleepSessions}
                          className="text-red-500 hover:text-red-600 text-sm transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {sleepSessions.map((session) => (
                          <div key={session.id} className="flex items-center justify-between bg-orange-50 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                              <div>
                                <div className="font-medium text-gray-800">
                                  {formatSessionDuration(session.duration)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {session.date} • {session.startTime} - {session.endTime}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-orange-600 font-medium">
                              {session.stage}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sleep Stages Selection */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-3 justify-center">
              {['Light Sleep', 'Deep Sleep', 'REM', 'Awake'].map((stage) => (
                <button
                  key={stage}
                  onClick={() => setSelectedStage(stage)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedStage === stage
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          {/* Encouragement Message */}
          <div className="text-center mb-6">
            <p className="text-orange-600 text-lg flex items-center justify-center space-x-2">
              <span>You're close to your goal! Almost there</span>
              <span className="text-orange-500">🌙</span>
            </p>
          </div>

          {/* Weekly Chart */}
          <div className="mb-6">
            <div className="bg-white rounded-2xl p-6 border border-orange-200 shadow-sm">
              {/* Period Selection */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-orange-600">Sleep Duration Trends</h3>
                <div className="flex space-x-2">
                  {['7 Days', '14 Days', '30 Days'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        selectedPeriod === period
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end justify-between h-40 space-x-2 relative">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-4">
                  <span>9h</span>
                  <span>6h</span>
                  <span>3h</span>
                  <span>0</span>
                </div>

                {/* Chart area with orange gradient background */}
                <div className="ml-8 flex-1 h-full relative bg-gradient-to-t from-orange-100 to-orange-50 rounded-lg">
                  <div className="flex items-end justify-between h-full space-x-1 p-2">
                    {weeklyData.map((value, index) => {
                      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                      const dayIndex = index % 7;
                      return (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div
                            className="w-full bg-gradient-to-t from-orange-300 to-orange-400 rounded-t transition-all duration-300"
                            style={{ height: `${(value / 9) * 120}px` }}
                          />
                          {/* Show day labels based on period */}
                          {(
                            (selectedPeriod === '7 Days') || 
                            (selectedPeriod === '14 Days' && index % 2 === 0) || 
                            (selectedPeriod === '30 Days' && index % 4 === 0)
                          ) && (
                            <span className="text-xs text-gray-500 mt-2">{days[dayIndex]}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Trend line with arrow */}
                  <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <polyline
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      points={weeklyData.map((value, index) => 
                        `${(index / (weeklyData.length - 1)) * 100}%,${100 - (value / 9) * 100}%`
                      ).join(' ')}
                    />
                    {/* Trend line points */}
                    {weeklyData.map((value, index) => (
                      <circle
                        key={index}
                        cx={`${(index / (weeklyData.length - 1)) * 100}%`}
                        cy={`${100 - (value / 9) * 100}%`}
                        r="3"
                        fill="#F97316"
                      />
                    ))}
                    {/* Arrow at the end */}
                    {(() => {
                      const lastIndex = weeklyData.length - 1;
                      const secondLastIndex = weeklyData.length - 2;
                      const lastX = (lastIndex / (weeklyData.length - 1)) * 100;
                      const lastY = 100 - (weeklyData[lastIndex] / 9) * 100;
                      const secondLastX = (secondLastIndex / (weeklyData.length - 1)) * 100;
                      const secondLastY = 100 - (weeklyData[secondLastIndex] / 9) * 100;
                      
                      // Calculate angle for arrow direction
                      const angle = Math.atan2(lastY - secondLastY, lastX - secondLastX) * 180 / Math.PI;
                      
                      return (
                        <g transform={`translate(${lastX}%, ${lastY}%) rotate(${angle})`}>
                          <polygon
                            points="0,0 -8,-3 -8,3"
                            fill="#F97316"
                          />
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-500 mt-4">
                {selectedPeriod === '7 Days' ? 'Last 7 Days' : 
                 selectedPeriod === '14 Days' ? 'Last 14 Days' : 
                 'Last 30 Days'} Sleep Pattern • Avg: {(weeklyData.reduce((a, b) => a + b, 0) / weeklyData.length).toFixed(1)}h
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Insight */}
            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Brain className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-orange-900 font-semibold mb-2 text-lg">AI Insight</h3>
                  <p className="text-orange-800">
                    Great timing! Having dinner at {sleepData.dinnertime} and sleeping at {sleepData.bedtime} gives your body 3.5 hours to digest. This can improve your sleep quality by 12%.
                  </p>
                </div>
              </div>
            </div>

            {/* Daily Sleep Goal */}
            <div className="bg-white rounded-2xl p-6 border border-orange-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-orange-500" />
                  <span className="text-gray-700 font-medium">Daily Sleep Goal</span>
                </div>
                <span className="text-orange-600 font-bold text-lg">{sleepData.goal} hours</span>
              </div>
              <div className="w-full bg-orange-100 rounded-full h-4 overflow-hidden mb-4">
                <div 
                  className="bg-orange-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((7.33 / sleepData.goal) * 100, 100)}%` }}
                />
              </div>
              <p className="text-gray-600 text-center mb-4">
                Almost there! Sleep tight 🌙
              </p>
              
              {/* Log Sleep Button */}
              <button
                onClick={logSleep}
                className="w-full bg-orange-500 text-white font-semibold py-3 rounded-2xl hover:bg-orange-600 transition-all duration-200 shadow-lg"
              >
                Log Sleep
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SleepDurationPage;