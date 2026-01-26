import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useData } from './DataContext';
import { useServerAuth } from './ServerAuthContext';
import aiService from '../services/aiService';
import toast from 'react-hot-toast';

const AIContext = createContext();

export const AIProvider = ({ children }) => {
  const [currentPopup, setCurrentPopup] = useState(null);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [popupHistory, setPopupHistory] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { user } = useServerAuth();
  const { 
    dayScore, 
    tasks, 
    timeLogs, 
    healthData, 
    moodData, 
    screenTime 
  } = useData();

  // Initialize recovery mode from storage
  useEffect(() => {
    const recoveryMode = aiService.getRecoveryMode();
    setIsRecoveryMode(recoveryMode);
  }, []);

  // Build user context for AI analysis
  const buildUserContext = useCallback(() => {
    if (!user) return null;

    // Calculate time spent today
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = timeLogs.filter(log => {
      try {
        const logDate = new Date(log.startTime || log.createdAt || log.date);
        return logDate.toISOString().split('T')[0] === today;
      } catch {
        return false;
      }
    });

    const studyTime = todayLogs
      .filter(log => log.type === 'study')
      .reduce((sum, log) => sum + (log.duration || 0), 0);

    const workTime = todayLogs
      .filter(log => log.type === 'work')
      .reduce((sum, log) => sum + (log.duration || 0), 0);

    const entertainmentTime = todayLogs
      .filter(log => log.type === 'entertainment')
      .reduce((sum, log) => sum + (log.duration || 0), 0);

    // Task completion stats
    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;

    // Sleep and mood data
    const sleep = healthData?.sleep || 7;
    const mood = moodData?.mood || 5;

    return {
      userId: user.id,
      dayScore: dayScore?.score || 0,
      mood,
      sleep,
      studyTime: Math.floor(studyTime / 60), // Convert to minutes
      workTime: Math.floor(workTime / 60),
      entertainmentTime: Math.floor(entertainmentTime / 60),
      completedTasks,
      totalTasks,
      screenTimeHours: screenTime?.totalTime || 0,
      timestamp: new Date()
    };
  }, [user, dayScore, tasks, timeLogs, healthData, moodData, screenTime]);

  // Analyze context and potentially show popup
  const analyzeAndShowPopup = useCallback(async (trigger = 'auto') => {
    if (!user || isAnalyzing) return;

    const context = buildUserContext();
    if (!context) return;

    setIsAnalyzing(true);

    try {
      // Check if AI should trigger
      const intent = aiService.shouldTriggerAI(context);
      
      if (!intent && trigger === 'auto') {
        setIsAnalyzing(false);
        return;
      }

      console.log('🧠 AI Analysis triggered:', { intent, trigger, context });

      // Generate AI popup
      const popup = await aiService.generatePopup(context, intent);
      
      if (popup) {
        setCurrentPopup(popup);
        setPopupHistory(prev => [popup, ...prev.slice(0, 9)]); // Keep last 10
        
        console.log('✨ AI Popup generated:', popup);
      }

    } catch (error) {
      console.error('❌ AI Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [user, buildUserContext, isAnalyzing]);

  // Handle popup actions
  const handlePopupAction = useCallback((popup) => {
    switch (popup.cta) {
      case 'Enter Recovery Mode':
        toggleRecoveryMode(true);
        toast.success('Recovery mode activated. Take it easy! 🌱');
        break;
      
      case 'Start 25-min Focus':
        // Navigate to time tracker or start focus session
        toast.success('Focus session ready! 🎯');
        break;
      
      case 'Take 5 Minutes':
        toast.success('Great choice! Rest is productive too 😌');
        break;
      
      default:
        console.log('Popup action:', popup.cta);
    }
  }, []);

  // Toggle recovery mode
  const toggleRecoveryMode = useCallback((enabled) => {
    setIsRecoveryMode(enabled);
    aiService.setRecoveryMode(enabled);
    
    if (enabled) {
      toast.success('Recovery mode on. Be gentle with yourself 🌱', {
        duration: 4000,
        icon: '🫂'
      });
    } else {
      toast.success('Recovery mode off. Ready to tackle goals! 💪', {
        duration: 4000,
        icon: '🔥'
      });
    }
  }, []);

  // Close current popup
  const closePopup = useCallback(() => {
    setCurrentPopup(null);
  }, []);

  // Manual trigger for testing/demo
  const triggerAIPopup = useCallback(async (intent = null) => {
    await analyzeAndShowPopup(intent || 'manual');
  }, [analyzeAndShowPopup]);

  // Get popup analytics
  const getPopupAnalytics = useCallback(async () => {
    if (!user) return null;
    return await aiService.getPopupAnalytics(user.id);
  }, [user]);

  // Auto-trigger on significant events
  useEffect(() => {
    if (!user) return;

    // Trigger on task completion
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount > 0) {
      const timer = setTimeout(() => analyzeAndShowPopup('task_complete'), 2000);
      return () => clearTimeout(timer);
    }
  }, [tasks, user, analyzeAndShowPopup]);

  // Auto-trigger on day score changes
  useEffect(() => {
    if (!user || !dayScore) return;

    const timer = setTimeout(() => analyzeAndShowPopup('score_update'), 3000);
    return () => clearTimeout(timer);
  }, [dayScore?.score, user, analyzeAndShowPopup]);

  // Periodic check (every 30 minutes during active use)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      // Only trigger if user has been active (check for recent data updates)
      const lastActivity = Math.max(
        new Date(dayScore?.updatedAt || 0).getTime(),
        new Date(tasks[0]?.updatedAt || 0).getTime(),
        new Date(timeLogs[0]?.createdAt || 0).getTime()
      );

      const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
      
      if (lastActivity > thirtyMinutesAgo) {
        analyzeAndShowPopup('periodic');
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [user, dayScore, tasks, timeLogs, analyzeAndShowPopup]);

  const value = {
    // State
    currentPopup,
    isRecoveryMode,
    popupHistory,
    isAnalyzing,
    
    // Actions
    analyzeAndShowPopup,
    handlePopupAction,
    toggleRecoveryMode,
    closePopup,
    triggerAIPopup,
    getPopupAnalytics,
    
    // Utils
    buildUserContext,
    aiAvailable: aiService.isAvailable()
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};