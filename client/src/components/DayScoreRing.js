import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const DayScoreRing = ({ dayScore }) => {
  const score = dayScore?.overallScore || 0;
  const radius = 80;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return 'from-green-400 to-green-600';
    if (score >= 60) return 'from-yellow-400 to-yellow-600';
    if (score >= 40) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  const getTrendIcon = () => {
    // Mock trend data - in real app, compare with yesterday
    const trend = Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'same';
    
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="card p-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Today's Day Score</h2>
        
        {/* Score Ring */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <svg
            height={radius * 2}
            width={radius * 2}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              stroke="#e5e7eb"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Progress circle */}
            <circle
              stroke="url(#gradient)"
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="transition-all duration-1000 ease-out"
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className={`stop-color-current ${getScoreColor(score)}`} />
                <stop offset="100%" className={`stop-color-current ${getScoreColor(score)}`} />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
              {score}
            </span>
            <span className="text-sm text-gray-500">/ 100</span>
          </div>
        </div>

        {/* Trend indicator */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          {getTrendIcon()}
          <span className="text-sm text-gray-600">vs yesterday</span>
        </div>

        {/* Score breakdown */}
        {dayScore && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Productivity</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${dayScore.scores.productivity}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">
                  {dayScore.scores.productivity}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Health</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${dayScore.scores.health}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">
                  {dayScore.scores.health}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Focus</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${dayScore.scores.focus}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">
                  {dayScore.scores.focus}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Mood</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${dayScore.scores.mood}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-8">
                  {dayScore.scores.mood}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Insights */}
        {dayScore?.insights && dayScore.insights.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Today's Insight</h4>
            <p className="text-sm text-blue-700">
              {dayScore.insights[0].message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayScoreRing;