import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Flame, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import toast from 'react-hot-toast';
import PhysicalActivityCalculator from '../components/health/PhysicalActivityCalculator';
import '../styles/physical-activity.css';

const ACTIVITY_LOG_KEY = 'dayscore_activity_logs';

const PhysicalActivityPage = () => {
  const navigate = useNavigate();
  const { saveHealthData } = useData();

  const [stats, setStats] = useState({
    activeTime: '0 mins',
    workoutsDone: '0 today',
    lastActivity: 'No activity logged yet',
    totalCaloriesToday: 0,
  });

  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ACTIVITY_LOG_KEY);
      const logs = raw ? JSON.parse(raw) : [];
      setRecentLogs(logs.slice(0, 5));
      updateStatsFromLogs(logs);
    } catch {
      setRecentLogs([]);
    }
  }, []);

  const updateStatsFromLogs = (logs) => {
    const today = new Date().toLocaleDateString('en-CA');
    const todayLogs = logs.filter((l) => l.date === today);

    if (todayLogs.length === 0) {
      setStats({
        activeTime: '0 mins',
        workoutsDone: '0 today',
        lastActivity: 'No activity logged yet',
        totalCaloriesToday: 0,
      });
      return;
    }

    const totalMins = todayLogs.reduce((sum, l) => sum + (l.duration || 0), 0);
    const totalCals = todayLogs.reduce((sum, l) => sum + (l.calories || 0), 0);
    const latest = todayLogs[0];

    setStats({
      activeTime: `${totalMins} mins`,
      workoutsDone: `${todayLogs.length} today`,
      lastActivity: `${latest.exerciseName} · ${latest.duration}m · ${latest.calories} kcal`,
      totalCaloriesToday: totalCals,
    });
  };

  const logActivity = async (data) => {
    const entry = {
      ...data,
      date: new Date().toLocaleDateString('en-CA'),
      timestamp: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY) || '[]');
    const updated = [entry, ...existing].slice(0, 50);
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(updated));
    setRecentLogs(updated.slice(0, 5));
    updateStatsFromLogs(updated);

    await saveHealthData({
      activity: {
        activeMinutes: data.duration,
        exerciseType: data.exerciseName,
        intensity: data.intensity,
        caloriesBurned: data.calories,
        met: data.met,
        steps: Math.round(data.duration * 100),
      },
      physicalActivity: data.duration,
      date: new Date().toISOString(),
    });

    toast.success(
      `${data.exerciseName} logged — ${data.calories} kcal burned in ${data.duration} min!`
    );
  };

  return (
    <div className="physical-activity-page">
      <div className="w-full max-w-[620px] mb-4 px-2">
        <button
          type="button"
          onClick={() => navigate('/app/health')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Health</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-[620px] mb-6 px-2">
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
          <Clock className="w-5 h-5 text-gray-500 mx-auto mb-1" />
          <div className="text-xs text-gray-500">Active Time</div>
          <div className="font-bold text-gray-800">{stats.activeTime}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
          <Trophy className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <div className="text-xs text-gray-500">Workouts</div>
          <div className="font-bold text-gray-800">{stats.workoutsDone}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
          <Flame className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <div className="text-xs text-gray-500">Calories Today</div>
          <div className="font-bold text-gray-800">{stats.totalCaloriesToday} kcal</div>
        </div>
      </div>

      <PhysicalActivityCalculator onLogActivity={logActivity} />

      {recentLogs.length > 0 && (
        <div className="physical-recent-log px-2">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mt-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
              Recent Workouts
            </h3>
            <p className="text-xs text-gray-400 mb-4">{stats.lastActivity}</p>
            <ul className="space-y-2">
              {recentLogs.map((log) => (
                <li
                  key={log.timestamp}
                  className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0"
                >
                  <span className="font-medium text-gray-700">
                    {log.exerciseName} · {log.duration}m
                  </span>
                  <span className="text-amber-600 font-bold">{log.calories} kcal</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhysicalActivityPage;
