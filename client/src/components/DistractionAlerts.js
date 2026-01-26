import React from 'react';
import { AlertTriangle, Smartphone } from 'lucide-react';

const DistractionAlerts = ({ screenTime }) => {
  const distractionCount = screenTime?.distractions?.count || 0;
  const totalScreenTime = screenTime?.totalScreenTime || 0;

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getAlertLevel = (count) => {
    if (count >= 15) return { color: 'text-red-600', bg: 'bg-red-50', level: 'High' };
    if (count >= 8) return { color: 'text-yellow-600', bg: 'bg-yellow-50', level: 'Medium' };
    return { color: 'text-green-600', bg: 'bg-green-50', level: 'Low' };
  };

  const alertLevel = getAlertLevel(distractionCount);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Distraction Tracker</h3>
        <Smartphone className="w-5 h-5 text-gray-400" />
      </div>

      {/* Alert Status */}
      <div className={`${alertLevel.bg} rounded-lg p-4 mb-4`}>
        <div className="flex items-center space-x-2">
          <AlertTriangle className={`w-5 h-5 ${alertLevel.color}`} />
          <div>
            <div className={`text-sm font-medium ${alertLevel.color}`}>
              {alertLevel.level} Distraction Level
            </div>
            <div className="text-xs text-gray-600">
              {distractionCount} alerts today
            </div>
          </div>
        </div>
      </div>

      {/* Screen Time Summary */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Screen Time</span>
          <span className="text-sm font-medium text-gray-900">
            {formatTime(totalScreenTime)}
          </span>
        </div>

        {screenTime?.categories && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Social Media</span>
              <span className="text-sm font-medium text-gray-900">
                {formatTime(screenTime.categories.social)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Entertainment</span>
              <span className="text-sm font-medium text-gray-900">
                {formatTime(screenTime.categories.entertainment)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Productivity</span>
              <span className="text-sm font-medium text-gray-900">
                {formatTime(screenTime.categories.productivity)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Focus Score */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Focus Score</span>
          <span className="font-medium text-gray-900">
            {screenTime?.scores?.focusScore || 50}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${screenTime?.scores?.focusScore || 50}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default DistractionAlerts;