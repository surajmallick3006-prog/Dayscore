import React, { useState, useEffect, useRef } from 'react';
import { Moon, Brain, Target, ArrowLeft, Clock, Utensils, Play, Pause, Square, Timer, Coffee, Apple, Droplets } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

const SleepDurationPage = () => {
  const navigate = useNavigate();
  const { saveHealthData } = useData();
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
  
  // Meal consumption tracking
  const [mealConsumption, setMealConsumption] = useState({
    breakfast: { consumed: false, time: '08:00', items: [] },
    lunch: { consumed: false, time: '13:00', items: [] },
    dinner: { consumed: false, time: '20:00', items: [] },
    snacks: { consumed: false, time: '16:00', items: [] }
  });
  
  const [showMealTracker, setShowMealTracker] = useState(false);
  
  const [sleepData, setSleepData] = useState({
    duration: '7h 20m',
    quality: 'Good',
    bedtime: '23:30',
    dinnertime: '20:00',
    score: 85,
    goal: 8,
    actualSleepTime: null, // Will be calculated from tracker
    wakeUpTime: null
  });

  const [showBedtimePicker, setShowBedtimePicker] = useState(false);
  const [showDinnertimePicker, setShowDinnertimePicker] = useState(false);

  // Meal options for different meal types
  const mealOptions = {
    breakfast: ['Oatmeal', 'Eggs', 'Toast', 'Cereal', 'Fruit', 'Yogurt', 'Coffee', 'Tea'],
    lunch: ['Salad', 'Sandwich', 'Soup', 'Rice', 'Pasta', 'Chicken', 'Fish', 'Vegetables'],
    dinner: ['Grilled Chicken', 'Fish', 'Vegetables', 'Rice', 'Pasta', 'Salad', 'Soup', 'Bread'],
    snacks: ['Nuts', 'Fruit', 'Crackers', 'Yogurt', 'Cookies', 'Chips', 'Juice', 'Water']
  };

  // Update sleep duration when tracking stops or sessions change
  useEffect(() => {
    if (sleepSessions.length > 0) {
      const latestSession = sleepSessions[0];
      if (latestSession.calculatedDuration) {
        setSleepData(prev => ({ 
          ...prev, 
          duration: latestSession.calculatedDuration,
          actualSleepTime: latestSession.calculatedDuration,
          bedtime: latestSession.bedtime || prev.bedtime,
          wakeUpTime: latestSession.wakeTime || prev.wakeUpTime
        }));
      }
    }
  }, [sleepSessions]);

  // Calculate sleep score based on duration and goal
  const calculateSleepScore = (duration, goal) => {
    if (!duration || !goal) return 85; // Default score
    
    const durationHours = parseFloat(duration.replace('h', '.').replace('m', '')) || 0;
    const percentage = Math.min((durationHours / goal) * 100, 100);
    
    // Bonus points for optimal sleep (7-9 hours)
    let bonus = 0;
    if (durationHours >= 7 && durationHours <= 9) {
      bonus = 10;
    }
    
    return Math.min(Math.round(percentage + bonus), 100);
  };

  // Update sleep score when duration changes
  useEffect(() => {
    const newScore = calculateSleepScore(sleepData.duration, sleepData.goal);
    if (newScore !== sleepData.score) {
      setSleepData(prev => ({ ...prev, score: newScore }));
    }
  }, [sleepData.duration, sleepData.goal, sleepData.score]);

  // Helper function to parse duration string to hours
  const parseDurationToHours = (durationStr) => {
    if (!durationStr) return 0;
    
    const hourMatch = durationStr.match(/(\d+)h/);
    const minuteMatch = durationStr.match(/(\d+)m/);
    
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
    
    return hours + (minutes / 60);
  };

  // Generate sleep data based on selected period and actual sessions
  const generateSleepData = (days) => {
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();
      
      // Check if we have actual sleep session data for this date
      const sessionForDate = sleepSessions.find(session => session.date === dateStr);
      
      if (sessionForDate && sessionForDate.calculatedDuration) {
        // Use actual tracked data
        const hours = parseDurationToHours(sessionForDate.calculatedDuration);
        data.push(hours);
      } else {
        // Use generated data for dates without tracking
        const baseSleep = 6.0 + ((days - 1 - i) / days) * 2.0;
        const variation = (Math.random() - 0.5) * 1.5;
        const sleep = Math.max(4.0, Math.min(9.0, baseSleep + variation));
        data.push(parseFloat(sleep.toFixed(1)));
      }
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
        
        // Auto-update sleep duration in real-time
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const newDuration = `${hours}h ${minutes}m`;
        setSleepData(prev => ({ ...prev, actualSleepTime: newDuration }));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, isPaused, trackingStartTime, pausedDuration]);

  // Load data from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('sleepSessions');
    if (savedSessions) {
      setSleepSessions(JSON.parse(savedSessions));
    }
    
    const savedMeals = localStorage.getItem('mealConsumption');
    if (savedMeals) {
      setMealConsumption(JSON.parse(savedMeals));
    }
    
    const savedSleepData = localStorage.getItem('sleepData');
    if (savedSleepData) {
      const parsed = JSON.parse(savedSleepData);
      setSleepData(prev => ({ ...prev, ...parsed }));
    }
  }, []);

  // Save data to localStorage
  const saveSessions = (sessions) => {
    localStorage.setItem('sleepSessions', JSON.stringify(sessions));
    setSleepSessions(sessions);
  };

  const saveMealData = (meals) => {
    localStorage.setItem('mealConsumption', JSON.stringify(meals));
    setMealConsumption(meals);
  };

  const saveSleepData = (data) => {
    localStorage.setItem('sleepData', JSON.stringify(data));
    setSleepData(data);
    // Sync to DataContext / API
    const durationHours = parseFloat(data.duration) || 7;
    saveHealthData({
      sleep: {
        duration: durationHours,
        quality: data.score || 75,
        bedtime: data.bedtime,
        wakeUpTime: data.wakeUpTime,
      },
      date: new Date().toISOString(),
    });
  };

  const updateBedtime = (time) => {
    const newData = { ...sleepData, bedtime: time };
    setSleepData(newData);
    saveSleepData(newData);
    setShowBedtimePicker(false);
  };

  const updateDinnertime = (time) => {
    const newData = { ...sleepData, dinnertime: time };
    setSleepData(newData);
    saveSleepData(newData);
    setShowDinnertimePicker(false);
    
    // Update meal consumption dinner time
    const updatedMeals = {
      ...mealConsumption,
      dinner: { ...mealConsumption.dinner, time: time }
    };
    saveMealData(updatedMeals);
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeStr);
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
    
    // Set actual bedtime to current time
    const currentTime = new Date().toTimeString().slice(0, 5);
    const newData = { ...sleepData, bedtime: currentTime };
    setSleepData(newData);
    saveSleepData(newData);
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
      const endTime = new Date();
      const wakeTime = endTime.toTimeString().slice(0, 5);
      
      // Calculate final sleep duration
      const hours = Math.floor(currentSleepDuration / 3600);
      const minutes = Math.floor((currentSleepDuration % 3600) / 60);
      const finalDuration = `${hours}h ${minutes}m`;
      
      const newSession = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        duration: currentSleepDuration,
        startTime: new Date(trackingStartTime).toLocaleTimeString(),
        endTime: endTime.toLocaleTimeString(),
        stage: selectedStage,
        bedtime: sleepData.bedtime,
        wakeTime: wakeTime,
        calculatedDuration: finalDuration
      };
      
      const updatedSessions = [newSession, ...sleepSessions.slice(0, 9)]; // Keep last 10 sessions
      saveSessions(updatedSessions);
      
      // Update sleep data with calculated values
      const newSleepData = {
        ...sleepData,
        wakeUpTime: wakeTime,
        duration: finalDuration,
        actualSleepTime: finalDuration
      };
      setSleepData(newSleepData);
      saveSleepData(newSleepData);
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

  // Meal tracking functions
  const toggleMealConsumption = (mealType) => {
    const updatedMeals = {
      ...mealConsumption,
      [mealType]: {
        ...mealConsumption[mealType],
        consumed: !mealConsumption[mealType].consumed,
        consumedAt: !mealConsumption[mealType].consumed ? new Date().toLocaleTimeString() : null
      }
    };
    saveMealData(updatedMeals);
  };

  const addMealItem = (mealType, item) => {
    const updatedMeals = {
      ...mealConsumption,
      [mealType]: {
        ...mealConsumption[mealType],
        items: [...mealConsumption[mealType].items, item],
        consumed: true,
        consumedAt: new Date().toLocaleTimeString()
      }
    };
    saveMealData(updatedMeals);
  };

  const removeMealItem = (mealType, itemIndex) => {
    const updatedMeals = {
      ...mealConsumption,
      [mealType]: {
        ...mealConsumption[mealType],
        items: mealConsumption[mealType].items.filter((_, index) => index !== itemIndex)
      }
    };
    saveMealData(updatedMeals);
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

  const getMealIcon = (mealType) => {
    switch (mealType) {
      case 'breakfast': return Coffee;
      case 'lunch': return Apple;
      case 'dinner': return Utensils;
      case 'snacks': return Droplets;
      default: return Utensils;
    }
  };

  const logSleep = () => {
    // Sleep logging functionality
    console.log('Sleep logged with data:', sleepData);
    console.log('Meal consumption:', mealConsumption);
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
              <div className="text-3xl font-bold text-orange-600">
                {sleepData.actualSleepTime || sleepData.duration}
              </div>
              <div className="mt-2 space-y-1">
                {isTracking && (
                  <div className="text-xs text-orange-500 font-medium flex items-center space-x-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span>Live Tracking</span>
                  </div>
                )}
                {sleepData.bedtime && sleepData.wakeUpTime && !isTracking && (
                  <div className="text-xs text-gray-500">
                    {sleepData.bedtime} → {sleepData.wakeUpTime}
                  </div>
                )}
                {sleepSessions.length > 0 && !isTracking && (
                  <div className="text-xs text-green-600 font-medium">
                    Last tracked: {sleepSessions[0].date}
                  </div>
                )}
                {!isTracking && sleepSessions.length === 0 && (
                  <div className="text-xs text-gray-400">
                    Start tracking for accurate duration
                  </div>
                )}
              </div>
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
                  {generateTimeOptions().filter(time => {
                    const hour = parseInt(time.split(':')[0]);
                    return hour >= 20 || hour <= 8; // 20:00 to 08:00
                  }).map((time) => (
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
                  {generateTimeOptions().filter(time => {
                    const hour = parseInt(time.split(':')[0]);
                    return hour >= 17 && hour <= 22; // 17:00 to 22:00
                  }).map((time) => (
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

          {/* Meal Consumption Tracker */}
          <div className="mb-6">
            <div className="bg-white rounded-2xl p-6 border border-orange-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-orange-600 flex items-center space-x-2">
                  <Utensils className="w-5 h-5" />
                  <span>Daily Meal Consumption</span>
                </h3>
                <button
                  onClick={() => setShowMealTracker(!showMealTracker)}
                  className="text-orange-500 hover:text-orange-600 transition-colors text-sm font-medium"
                >
                  {showMealTracker ? 'Hide Tracker' : 'Show Tracker'}
                </button>
              </div>

              {showMealTracker && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(mealConsumption).map(([mealType, mealData]) => {
                      const IconComponent = getMealIcon(mealType);
                      return (
                        <div key={mealType} className="bg-orange-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <IconComponent className="w-4 h-4 text-orange-500" />
                              <span className="text-sm font-medium text-orange-900 capitalize">
                                {mealType}
                              </span>
                            </div>
                            <button
                              onClick={() => toggleMealConsumption(mealType)}
                              className={`w-5 h-5 rounded-full border-2 transition-colors ${
                                mealData.consumed
                                  ? 'bg-orange-500 border-orange-500'
                                  : 'border-orange-300 hover:border-orange-400'
                              }`}
                            >
                              {mealData.consumed && (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </button>
                          </div>
                          
                          <div className="text-xs text-orange-700 mb-2">
                            Time: {mealData.time}
                            {mealData.consumedAt && (
                              <div>Consumed: {mealData.consumedAt}</div>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            {mealData.items.map((item, index) => (
                              <div key={index} className="flex items-center justify-between bg-white rounded px-2 py-1">
                                <span className="text-xs text-gray-700">{item}</span>
                                <button
                                  onClick={() => removeMealItem(mealType, index)}
                                  className="text-red-400 hover:text-red-600 text-xs"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            
                            <div className="flex flex-wrap gap-1 mt-2">
                              {mealOptions[mealType].slice(0, 4).map((option) => (
                                <button
                                  key={option}
                                  onClick={() => addMealItem(mealType, option)}
                                  className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded hover:bg-orange-200 transition-colors"
                                >
                                  + {option}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Meal Summary */}
                  <div className="bg-orange-100 rounded-xl p-4">
                    <h4 className="font-medium text-orange-900 mb-2">Today's Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {Object.entries(mealConsumption).map(([mealType, mealData]) => (
                        <div key={mealType} className="text-center">
                          <div className={`font-medium ${mealData.consumed ? 'text-green-600' : 'text-gray-500'}`}>
                            {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                          </div>
                          <div className="text-xs text-gray-600">
                            {mealData.consumed ? '✓ Consumed' : '○ Pending'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
                    <div className="text-gray-600 text-sm mb-2">
                      {isTracking ? (isPaused ? 'Sleep Tracking Paused' : 'Currently Tracking Sleep') : 'Ready to Track Sleep'}
                    </div>
                    
                    {/* Additional tracking info */}
                    {isTracking && (
                      <div className="bg-orange-50 rounded-lg p-3 mb-4">
                        <div className="text-sm text-orange-800 space-y-1">
                          <div>Started: {trackingStartTime ? new Date(trackingStartTime).toLocaleTimeString() : 'N/A'}</div>
                          <div>Bedtime: {sleepData.bedtime}</div>
                          {currentSleepDuration > 0 && (
                            <div className="font-medium">
                              Current Duration: {Math.floor(currentSleepDuration / 3600)}h {Math.floor((currentSleepDuration % 3600) / 60)}m
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Show last session info when not tracking */}
                    {!isTracking && sleepSessions.length > 0 && (
                      <div className="bg-green-50 rounded-lg p-3 mb-4">
                        <div className="text-sm text-green-800">
                          <div className="font-medium mb-1">Last Sleep Session</div>
                          <div>Duration: {sleepSessions[0].calculatedDuration || formatSessionDuration(sleepSessions[0].duration)}</div>
                          <div>Date: {sleepSessions[0].date}</div>
                          {sleepSessions[0].bedtime && sleepSessions[0].wakeTime && (
                            <div>{sleepSessions[0].bedtime} → {sleepSessions[0].wakeTime}</div>
                          )}
                        </div>
                      </div>
                    )}
                    
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
                                  {session.calculatedDuration || formatSessionDuration(session.duration)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {session.date} • {session.bedtime || session.startTime} - {session.wakeTime || session.endTime}
                                </div>
                                {session.bedtime && session.wakeTime && (
                                  <div className="text-xs text-orange-600">
                                    Bedtime: {session.bedtime} → Wake: {session.wakeTime}
                                  </div>
                                )}
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
                  <p className="text-orange-800 mb-2">
                    {(() => {
                      const dinnerTime = sleepData.dinnertime;
                      const bedTime = sleepData.bedtime;
                      const dinnerHour = parseInt(dinnerTime.split(':')[0]);
                      const bedHour = parseInt(bedTime.split(':')[0]);
                      
                      let timeDiff = bedHour - dinnerHour;
                      if (timeDiff < 0) timeDiff += 24; // Handle overnight
                      
                      if (timeDiff >= 3) {
                        return `Perfect! Having dinner at ${dinnerTime} and sleeping at ${bedTime} gives your body ${timeDiff} hours to digest. This can improve your sleep quality by ${Math.min(timeDiff * 4, 20)}%.`;
                      } else {
                        return `Consider having dinner earlier. Currently ${timeDiff} hours between dinner (${dinnerTime}) and bedtime (${bedTime}) may affect sleep quality. Aim for 3+ hours gap.`;
                      }
                    })()}
                  </p>
                  <div className="text-sm text-orange-700">
                    <div className="flex items-center space-x-4">
                      <span>Meals consumed today: {Object.values(mealConsumption).filter(meal => meal.consumed).length}/4</span>
                      {sleepData.actualSleepTime && (
                        <span>• Live sleep duration: {sleepData.actualSleepTime}</span>
                      )}
                    </div>
                  </div>
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
              
              {/* Progress calculation based on actual or tracked duration */}
              {(() => {
                const currentDuration = sleepData.actualSleepTime || sleepData.duration;
                const durationHours = parseDurationToHours(currentDuration);
                const progressPercentage = Math.min((durationHours / sleepData.goal) * 100, 100);
                
                return (
                  <>
                    <div className="w-full bg-orange-100 rounded-full h-4 overflow-hidden mb-4">
                      <div 
                        className="bg-orange-500 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        {durationHours.toFixed(1)}h / {sleepData.goal}h
                      </div>
                      <div className="text-sm text-gray-600">
                        {progressPercentage >= 100 ? (
                          <span className="text-green-600 font-medium">🎉 Goal achieved!</span>
                        ) : progressPercentage >= 80 ? (
                          <span className="text-orange-600">Almost there! Sleep tight 🌙</span>
                        ) : isTracking ? (
                          <span className="text-blue-600">Currently tracking... 😴</span>
                        ) : (
                          <span className="text-gray-500">Start tracking to see progress</span>
                        )}
                      </div>
                      
                      {/* Show remaining time if tracking */}
                      {isTracking && progressPercentage < 100 && (
                        <div className="text-xs text-orange-500 mt-1">
                          {((sleepData.goal - durationHours) * 60).toFixed(0)} minutes to goal
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
              
              {/* Log Sleep Button */}
              <button
                onClick={logSleep}
                className="w-full bg-orange-500 text-white font-semibold py-3 rounded-2xl hover:bg-orange-600 transition-all duration-200 shadow-lg"
              >
                {isTracking ? 'Currently Tracking...' : 'Log Sleep'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SleepDurationPage;