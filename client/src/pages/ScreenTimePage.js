import React from 'react';
import { Smartphone, AlertTriangle, Target } from 'lucide-react';

const ScreenTimePage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Screen Time & Focus</h1>
        <p className="text-gray-600">Monitor your digital habits and distractions</p>
      </div>

      {/* Today's Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6 text-center">
          <Smartphone className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">4h 15m</div>
          <div className="text-sm text-gray-600">Total Screen Time</div>
          <div className="text-xs text-yellow-600 mt-1">15% above average</div>
        </div>

        <div className="card p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">12</div>
          <div className="text-sm text-gray-600">Distractions</div>
          <div className="text-xs text-red-600 mt-1">High level</div>
        </div>

        <div className="card p-6 text-center">
          <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">76</div>
          <div className="text-sm text-gray-600">Focus Score</div>
          <div className="text-xs text-green-600 mt-1">Good focus</div>
        </div>
      </div>

      {/* App Usage Breakdown */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">App Usage Breakdown</h2>
        <div className="space-y-4">
          {[
            { name: 'Social Media', time: '1h 30m', percentage: 35, color: 'bg-red-500' },
            { name: 'Productivity', time: '1h 15m', percentage: 30, color: 'bg-green-500' },
            { name: 'Entertainment', time: '45m', percentage: 18, color: 'bg-orange-500' },
            { name: 'Communication', time: '35m', percentage: 14, color: 'bg-blue-500' },
            { name: 'Other', time: '10m', percentage: 3, color: 'bg-gray-500' },
          ].map((app, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded ${app.color}`} />
                <span className="text-sm font-medium text-gray-900">{app.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${app.color}`}
                    style={{ width: `${app.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{app.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Trends */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Screen Time</h2>
        <div className="h-48 flex items-end justify-between space-x-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div key={day} className="flex flex-col items-center flex-1">
              <div className="w-full space-y-1 mb-2">
                <div 
                  className="w-full bg-red-400 rounded-t"
                  style={{ height: `${Math.random() * 60 + 20}px` }}
                />
                <div 
                  className="w-full bg-orange-400"
                  style={{ height: `${Math.random() * 40 + 10}px` }}
                />
                <div 
                  className="w-full bg-green-400"
                  style={{ height: `${Math.random() * 50 + 15}px` }}
                />
                <div 
                  className="w-full bg-blue-400 rounded-b"
                  style={{ height: `${Math.random() * 30 + 10}px` }}
                />
              </div>
              <span className="text-xs text-gray-600">{day}</span>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-4 gap-2 mt-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
            <span>Social</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-400 rounded"></div>
            <span>Entertainment</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <span>Productivity</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-400 rounded"></div>
            <span>Communication</span>
          </div>
        </div>
      </div>

      {/* Focus Sessions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Focus Sessions</h2>
        <div className="space-y-3">
          {[
            { duration: '45 min', quality: 8, app: 'Study App', time: '2 hours ago' },
            { duration: '30 min', quality: 6, app: 'Work Project', time: '4 hours ago' },
            { duration: '25 min', quality: 9, app: 'Reading', time: '6 hours ago' },
          ].map((session, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-green-500" />
                <div>
                  <div className="font-medium text-gray-900">{session.app}</div>
                  <div className="text-sm text-gray-600">{session.time}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">{session.duration}</div>
                <div className="text-sm text-gray-600">Quality: {session.quality}/10</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScreenTimePage;