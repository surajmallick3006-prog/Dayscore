import React from 'react';
import { Clock, BookOpen, Briefcase } from 'lucide-react';

const TimeTracker = ({ timeLogs = [] }) => {
  // Calculate today's time by type
  const today = new Date().toDateString();
  const todayLogs = timeLogs.filter(log => {
    try {
      const dateValue = log.startTime || log.createdAt || log.date;
      if (!dateValue) return false;
      const logDate = new Date(dateValue);
      if (isNaN(logDate.getTime())) return false;
      return logDate.toDateString() === today;
    } catch (error) {
      console.warn('Invalid date in time log:', log, error);
      return false;
    }
  });

  const studyTime = todayLogs
    .filter(log => log.type === 'study')
    .reduce((total, log) => total + log.duration, 0);

  const workTime = todayLogs
    .filter(log => log.type === 'work')
    .reduce((total, log) => total + log.duration, 0);

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900">Time Tracker</h3>
        <Clock className="w-4 h-4 text-gray-400" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Study Time */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-900">Study</span>
          </div>
          <div className="text-lg font-bold text-blue-600">
            {formatTime(studyTime)}
          </div>
          <div className="text-xs text-blue-700">
            Today's focus time
          </div>
        </div>

        {/* Work Time */}
        <div className="bg-orange-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Briefcase className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-orange-900">Work</span>
          </div>
          <div className="text-lg font-bold text-orange-600">
            {formatTime(workTime)}
          </div>
          <div className="text-xs text-orange-700">
            Productive hours
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="mt-3">
        <h4 className="text-xs font-medium text-gray-700 mb-2">Recent Sessions</h4>
        <div className="space-y-1">
          {todayLogs.slice(0, 3).map((log, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                {log.type === 'study' ? (
                  <BookOpen className="w-3 h-3 text-blue-500" />
                ) : (
                  <Briefcase className="w-3 h-3 text-orange-500" />
                )}
                <span className="text-gray-600 capitalize">{log.type}</span>
              </div>
              <span className="text-gray-900 font-medium">
                {formatTime(log.duration)}
              </span>
            </div>
          ))}
          
          {todayLogs.length === 0 && (
            <div className="text-center py-2 text-gray-500">
              <Clock className="w-6 h-6 mx-auto mb-1 text-gray-300" />
              <p className="text-xs">No time logged today</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-secondary text-xs py-1.5">
            Start Study
          </button>
          <button className="btn-secondary text-xs py-1.5">
            Start Work
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeTracker;