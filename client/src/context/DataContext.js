import React, { createContext, useContext, useReducer, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import hybridAuthService from '../services/hybridAuthService';
import dayScoreService from '../services/dayScoreService';

const DataContext = createContext();

// Data reducer
const dataReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: { ...state.loading, [action.key]: action.payload } };
    case 'SET_DAY_SCORE':
      return { ...state, dayScore: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload || [] };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task._id === action.payload._id ? action.payload : task
        )
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task._id !== action.payload)
      };
    case 'SET_TIME_LOGS':
      return { ...state, timeLogs: action.payload };
    case 'ADD_TIME_LOG':
      return { ...state, timeLogs: [action.payload, ...state.timeLogs] };
    case 'CLEAR_TIME_LOGS':
      return { ...state, timeLogs: [] };
    case 'SET_HEALTH_DATA':
      return { ...state, healthData: action.payload };
    case 'SET_MOOD_DATA':
      return { ...state, moodData: action.payload };
    case 'SET_SCREEN_TIME':
      return { ...state, screenTime: action.payload };
    case 'SET_ANALYTICS':
      return { ...state, analytics: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  dayScore: null,
  tasks: [],
  timeLogs: [],
  healthData: null,
  moodData: null,
  screenTime: null,
  analytics: null,
  loading: {
    dayScore: false,
    tasks: false,
    timeLogs: false,
    health: false,
    mood: false,
    screenTime: false,
    analytics: false,
  },
  error: null,
};

export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Set up axios interceptor to include server token
  React.useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      async (config) => {
        const token = hybridAuthService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          toast.error('Session expired. Please sign in again.');
          hybridAuthService.logout();
          window.location.replace('/');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const setLoading = (key, value) => {
    dispatch({ type: 'SET_LOADING', key, payload: value });
  };

  const handleApiError = (error, defaultMessage) => {
    console.error(defaultMessage, error);
    if (error.response?.status === 401) {
      toast.error('Session expired. Please sign in again.');
      hybridAuthService.logout();
      window.location.replace('/');
    }
    // Removed toast.error for other errors to avoid cluttering the UI
    // since we're using mock data and these errors are expected
  };

  // Day Score functions
  const fetchDayScore = useCallback(async (date = null, forceRecalculate = false) => {
    try {
      setLoading('dayScore', true);
      
      // Use the real day score service
      const scoreData = await dayScoreService.getTodayScore(forceRecalculate);
      
      dispatch({ type: 'SET_DAY_SCORE', payload: scoreData });
      return { success: true, data: scoreData };
    } catch (error) {
      console.error('Failed to fetch day score:', error);
      handleApiError(error, 'Failed to fetch day score');
      
      // Return fallback data
      const fallbackScore = {
        overall: 75,
        components: {
          productivity: 75,
          health: 75,
          focus: 75,
          wellness: 75
        },
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date(),
        isFallback: true
      };
      
      dispatch({ type: 'SET_DAY_SCORE', payload: fallbackScore });
      return { success: false, data: fallbackScore, error };
    } finally {
      setLoading('dayScore', false);
    }
  }, []);

  const recalculateDayScore = useCallback(async (date = null) => {
    try {
      setLoading('dayScore', true);
      
      // Force recalculation using the real service
      const scoreData = await dayScoreService.getTodayScore(true);
      
      dispatch({ type: 'SET_DAY_SCORE', payload: scoreData });
      toast.success('Day score updated!');
      return { success: true, data: scoreData };
    } catch (error) {
      console.error('Recalculate day score error:', error);
      toast.error('Failed to recalculate day score');
      return { success: false, error };
    } finally {
      setLoading('dayScore', false);
    }
  }, []);

  // Task functions
  const fetchTasks = useCallback(async (filters = {}) => {
    try {
      setLoading('tasks', true);
      const queryParams = new URLSearchParams(filters).toString();
      const params = queryParams ? `?${queryParams}` : '';
      const response = await hybridAuthService.apiCall(`/api/tasks${params}`);
      
      // Ensure we always have an array for tasks
      const tasks = Array.isArray(response?.tasks) ? response.tasks : [];
      dispatch({ type: 'SET_TASKS', payload: tasks });
    } catch (error) {
      handleApiError(error, 'Failed to fetch tasks');
      // Ensure tasks is set to empty array on error
      dispatch({ type: 'SET_TASKS', payload: [] });
    } finally {
      setLoading('tasks', false);
    }
  }, []);

  const createTask = useCallback(async (taskData) => {
    try {
      const response = await hybridAuthService.apiCall('/api/tasks', 'POST', taskData);
      dispatch({ type: 'ADD_TASK', payload: response.task });
      toast.success('Task created successfully');
      return { success: true, task: response.task };
    } catch (error) {
      console.error('Create task error:', error);
      toast.error('Failed to create task');
      return { success: false, error };
    }
  }, []);

  const updateTask = useCallback(async (taskId, updates) => {
    try {
      const response = await hybridAuthService.apiCall(`/api/tasks/${taskId}`, 'PUT', updates);
      dispatch({ type: 'UPDATE_TASK', payload: response.task });
      toast.success('Task updated successfully');
      return { success: true, task: response.task };
    } catch (error) {
      console.error('Update task error:', error);
      toast.error('Failed to update task');
      return { success: false, error };
    }
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    try {
      await hybridAuthService.apiCall(`/api/tasks/${taskId}`, 'DELETE');
      dispatch({ type: 'DELETE_TASK', payload: taskId });
      toast.success('Task deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Delete task error:', error);
      toast.error('Failed to delete task');
      return { success: false, error };
    }
  }, []);

  const completeTask = useCallback(async (taskId, actualTime = null) => {
    try {
      const response = await hybridAuthService.apiCall(`/api/tasks/${taskId}/complete`, 'POST', { actualTime });
      dispatch({ type: 'UPDATE_TASK', payload: response.task });
      toast.success('Task completed!');
      recalculateDayScore();
      return { success: true, task: response.task };
    } catch (error) {
      console.error('Complete task error:', error);
      toast.error('Failed to complete task');
      return { success: false, error };
    }
  }, [recalculateDayScore]);

  // Time tracking functions
  const fetchTimeLogs = useCallback(async (date = null) => {
    try {
      setLoading('timeLogs', true);
      const params = date ? `?date=${date}` : '';
      const response = await hybridAuthService.apiCall(`/api/timetracker${params}`);
      dispatch({ type: 'SET_TIME_LOGS', payload: response.timeLogs });
    } catch (error) {
      handleApiError(error, 'Failed to fetch time logs');
    } finally {
      setLoading('timeLogs', false);
    }
  }, []);

  const createTimeLog = useCallback(async (timeLogData) => {
    try {
      const response = await hybridAuthService.apiCall('/api/timetracker', 'POST', timeLogData);
      dispatch({ type: 'ADD_TIME_LOG', payload: response.timeLog });
      toast.success('Time logged successfully');
      recalculateDayScore();
      return { success: true, timeLog: response.timeLog };
    } catch (error) {
      console.error('Create time log error:', error);
      toast.error('Failed to log time');
      return { success: false, error };
    }
  }, [recalculateDayScore]);

  const clearTimeLogs = useCallback(async () => {
    try {
      await hybridAuthService.apiCall('/api/timetracker/clear', 'DELETE');
      dispatch({ type: 'CLEAR_TIME_LOGS' });
      toast.success('All sessions cleared successfully');
      return { success: true };
    } catch (error) {
      console.error('Clear time logs error:', error);
      toast.error('Failed to clear sessions');
      return { success: false, error };
    }
  }, []);

  // Health data functions
  const fetchHealthData = useCallback(async (date = null) => {
    try {
      setLoading('health', true);
      const params = date ? `?date=${date}` : '';
      const response = await hybridAuthService.apiCall(`/api/health${params}`);
      dispatch({ type: 'SET_HEALTH_DATA', payload: response.healthData });
    } catch (error) {
      handleApiError(error, 'Failed to fetch health data');
    } finally {
      setLoading('health', false);
    }
  }, []);

  const saveHealthData = useCallback(async (healthData) => {
    try {
      const response = await hybridAuthService.apiCall('/api/health', 'POST', healthData);
      dispatch({ type: 'SET_HEALTH_DATA', payload: response.healthData });
      toast.success('Health data saved');
      recalculateDayScore();
      return { success: true, healthData: response.healthData };
    } catch (error) {
      console.error('Save health data error:', error);
      toast.error('Failed to save health data');
      return { success: false, error };
    }
  }, [recalculateDayScore]);

  // Mood data functions
  const fetchMoodData = useCallback(async (date = null) => {
    try {
      setLoading('mood', true);
      const params = date ? `?date=${date}` : '';
      const response = await hybridAuthService.apiCall(`/api/mood${params}`);
      dispatch({ type: 'SET_MOOD_DATA', payload: response.moodLog });
    } catch (error) {
      handleApiError(error, 'Failed to fetch mood data');
    } finally {
      setLoading('mood', false);
    }
  }, []);

  const saveMoodData = useCallback(async (moodData) => {
    try {
      const response = await hybridAuthService.apiCall('/api/mood', 'POST', moodData);
      dispatch({ type: 'SET_MOOD_DATA', payload: response.moodLog });
      toast.success('Mood data saved');
      recalculateDayScore();
      return { success: true, moodLog: response.moodLog };
    } catch (error) {
      console.error('Save mood data error:', error);
      toast.error('Failed to save mood data');
      return { success: false, error };
    }
  }, [recalculateDayScore]);

  // Screen time functions
  const fetchScreenTime = useCallback(async (date = null) => {
    try {
      setLoading('screenTime', true);
      const params = date ? `?date=${date}` : '';
      const response = await hybridAuthService.apiCall(`/api/screentime${params}`);
      dispatch({ type: 'SET_SCREEN_TIME', payload: response.screenTime });
    } catch (error) {
      handleApiError(error, 'Failed to fetch screen time data');
    } finally {
      setLoading('screenTime', false);
    }
  }, []);

  const saveScreenTime = useCallback(async (screenTimeData) => {
    try {
      const response = await hybridAuthService.apiCall('/api/screentime', 'POST', screenTimeData);
      dispatch({ type: 'SET_SCREEN_TIME', payload: response.screenTime });
      toast.success('Screen time data saved');
      recalculateDayScore();
      return { success: true, screenTime: response.screenTime };
    } catch (error) {
      console.error('Save screen time error:', error);
      toast.error('Failed to save screen time data');
      return { success: false, error };
    }
  }, [recalculateDayScore]);

  // Analytics functions
  const fetchAnalytics = useCallback(async (period = 'month') => {
    try {
      setLoading('analytics', true);
      const response = await hybridAuthService.apiCall(`/api/analytics/overview?period=${period}`);
      dispatch({ type: 'SET_ANALYTICS', payload: response });
    } catch (error) {
      handleApiError(error, 'Failed to fetch analytics');
    } finally {
      setLoading('analytics', false);
    }
  }, []);

  const value = {
    ...state,
    // Day Score
    fetchDayScore,
    recalculateDayScore,
    // Tasks
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    // Time Tracking
    fetchTimeLogs,
    createTimeLog,
    clearTimeLogs,
    // Health
    fetchHealthData,
    saveHealthData,
    // Mood
    fetchMoodData,
    saveMoodData,
    // Screen Time
    fetchScreenTime,
    saveScreenTime,
    // Analytics
    fetchAnalytics,
    // Utility
    clearError: () => dispatch({ type: 'CLEAR_ERROR' }),
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};