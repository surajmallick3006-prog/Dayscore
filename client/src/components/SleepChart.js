import React from 'react';
import { Moon } from 'lucide-react';

const SleepChart = ({ healthData }) => {
  const sleepDuration = healthData?.sleep?.duration || 0;
  const sleepQuality = healthData?.sleep?.quality || 0;
  const targetSleep = 8; // hours

  // Mock weekly sleep data
  const weeklyData = [
    { day: 'Mon', hours: 7.5 },
    { day: 'Tue', hours: 6.8 },
    { day: 'Wed', hours: 8.2 },
    { day: 'Thu', hours: 7.1 },
    { day: 'Fri', hours: 6.5 },
    { day: 'Sat', hours: 8.8 },
    { day: 'Sun', hours: sleepDuration || 7.3 },
  ];

  const formatTime = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Sleep Duration</h3>
        <Moon className="w-5 h-5 text-gray-400" />
      </div>

      {/* Today's Sleep */}
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-indigo-600">
          {formatTime(sleepDuration)}
        </div>
        <div className="text-sm text-gray-500">
          {sleepDuration >= targetSleep ? 'Great sleep!' : 'Need more rest'}
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">7h 30m Avg</div>
        <div className="flex items-end justify-between h-16 space-x-1">
          {weeklyData.map((data, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-indigo-200 rounded-t"
                style={{ 
                  height: `${(data.hours / 10) * 100}%`,
                  minHeight: '4px'
                }}
              />
              <div className="text-xs text-gray-500 mt-1">{data.day}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sleep Quality */}
      {sleepQuality > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Sleep Quality</span>
            <span className="font-medium text-gray-900">{sleepQuality}/10</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${sleepQuality * 10}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SleepChart;