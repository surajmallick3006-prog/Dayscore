import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const ScreenTimeChart = ({ screenTime }) => {
  // Mock weekly screen time data
  const weeklyData = [
    { day: 'Mon', social: 45, entertainment: 90, productivity: 180, other: 30 },
    { day: 'Tue', social: 60, entertainment: 75, productivity: 200, other: 25 },
    { day: 'Wed', social: 30, entertainment: 60, productivity: 240, other: 20 },
    { day: 'Thu', social: 75, entertainment: 120, productivity: 160, other: 35 },
    { day: 'Fri', social: 90, entertainment: 150, productivity: 120, other: 40 },
    { day: 'Sat', social: 120, entertainment: 180, productivity: 60, other: 50 },
    { day: 'Sun', social: 100, entertainment: 200, productivity: 80, other: 45 },
  ];

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + entry.value, 0);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <p className="text-sm text-gray-600 mb-2">Total: {formatTime(total)}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatTime(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Screen Time</h3>
        <div className="flex space-x-4 text-sm">
          <button className="text-primary-600 font-medium">Day</button>
          <button className="text-gray-500">Week</button>
          <button className="text-gray-500">Month</button>
        </div>
      </div>

      {/* Today's Total */}
      <div className="text-center mb-6">
        <div className="text-2xl font-bold text-gray-900">
          {formatTime(screenTime?.totalScreenTime || 255)}
        </div>
        <div className="text-sm text-gray-500">Today</div>
      </div>

      {/* Weekly Chart */}
      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData}>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="social" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
            <Bar dataKey="entertainment" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} />
            <Bar dataKey="productivity" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
            <Bar dataKey="other" stackId="a" fill="#6b7280" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-600">Social</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-orange-500 rounded"></div>
          <span className="text-gray-600">Entertainment</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-600">Productivity</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-gray-500 rounded"></div>
          <span className="text-gray-600">Other</span>
        </div>
      </div>
    </div>
  );
};

export default ScreenTimeChart;