import React, { useState } from 'react';
import { TrendingUp, Calendar, Award, Target, BarChart3, List, Zap, Moon } from 'lucide-react';

const AnalyticsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Weekly');
  const [selectedTrend, setSelectedTrend] = useState('30 Days');

  // Generate realistic data for different periods
  const generateDataForPeriod = (days) => {
    const data = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 0; i < days; i++) {
      const dayIndex = i % 7;
      const dayName = dayNames[dayIndex];
      
      // Create realistic patterns - weekends slightly lower, gradual improvement over time
      let baseScore = 45 + (i / days) * 35; // Gradual improvement from 45 to 80
      
      // Weekend adjustment (Sat/Sun slightly different patterns)
      if (dayIndex === 5) baseScore += Math.random() * 10 - 2; // Saturday variation
      if (dayIndex === 6) baseScore += Math.random() * 8 - 5; // Sunday often lower
      
      // Add some realistic variation
      const variation = (Math.random() - 0.5) * 15;
      const score = Math.max(20, Math.min(95, Math.round(baseScore + variation)));
      
      // Trend line is smoother and shows overall progression
      const trend = Math.max(25, Math.min(90, Math.round(baseScore + (Math.random() - 0.5) * 8)));
      
      data.push({
        day: dayName,
        score: score,
        trend: trend,
        date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000)
      });
    }
    
    return data;
  };

  // Get data based on selected period
  const getDataForPeriod = () => {
    switch (selectedTrend) {
      case '7 Days':
        return generateDataForPeriod(7);
      case '14 Days':
        return generateDataForPeriod(14);
      case '30 Days':
      default:
        return generateDataForPeriod(30);
    }
  };

  const chartData = getDataForPeriod();

  // Calculate comprehensive stats based on selected period
  const getStatsForPeriod = () => {
    const data = chartData;
    const scores = data.map(d => d.score);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const maxScoreDay = data[scores.indexOf(maxScore)].day;
    const minScoreDay = data[scores.indexOf(minScore)].day;
    
    // Calculate productivity hours based on period and performance
    const baseProdHours = selectedTrend === '7 Days' ? 
      Math.round(avgScore * 0.15) : // 7 days: ~6-14 hours
      selectedTrend === '14 Days' ? 
      Math.round(avgScore * 0.35) : // 14 days: ~15-30 hours  
      Math.round(avgScore * 0.75); // 30 days: ~30-70 hours
    
    const avgProdPerDay = Math.round((baseProdHours / data.length) * 10) / 10;
    
    // Calculate active days (score > 50)
    const activeDays = data.filter(d => d.score > 50).length;
    
    // Calculate current streak (consecutive days > 60)
    let currentStreak = 0;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].score > 60) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Calculate goals met percentage (score >= 70)
    const goalsMetCount = data.filter(d => d.score >= 70).length;
    const goalsMetPercentage = Math.round((goalsMetCount / data.length) * 100);
    
    // Calculate improvement percentage
    const firstWeekAvg = data.slice(0, Math.min(7, data.length)).reduce((a, b) => a + b.score, 0) / Math.min(7, data.length);
    const lastWeekAvg = data.slice(-Math.min(7, data.length)).reduce((a, b) => a + b.score, 0) / Math.min(7, data.length);
    const improvement = Math.round(((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100);
    
    // Calculate sleep and activity averages based on period
    const sleepHours = selectedTrend === '7 Days' ? 7.1 : selectedTrend === '14 Days' ? 7.2 : 7.3;
    const activeHours = selectedTrend === '7 Days' ? 1.8 : selectedTrend === '14 Days' ? 2.0 : 2.2;
    
    return {
      avgScore,
      maxScore,
      minScore,
      maxScoreDay,
      minScoreDay,
      activeDays,
      currentStreak,
      goalsMetPercentage,
      prodHours: baseProdHours,
      avgProdPerDay,
      improvement,
      sleepHours,
      activeHours,
      totalDays: data.length
    };
  };

  const stats = getStatsForPeriod();
  const maxScore = Math.max(...chartData.map(d => d.score));

  // Get period-specific labels and descriptions
  const getPeriodLabels = () => {
    switch (selectedTrend) {
      case '7 Days':
        return {
          period: 'Weekly',
          timeframe: 'This week',
          comparison: 'vs last week',
          improvementText: `+${Math.abs(stats.improvement)}% this week`
        };
      case '14 Days':
        return {
          period: 'Bi-weekly', 
          timeframe: 'Last 2 weeks',
          comparison: 'vs previous 2 weeks',
          improvementText: `+${Math.abs(stats.improvement)}% last 2 weeks`
        };
      case '30 Days':
      default:
        return {
          period: 'Monthly',
          timeframe: 'This month', 
          comparison: 'vs last month',
          improvementText: `+${Math.abs(stats.improvement)}% this month`
        };
    }
  };

  const labels = getPeriodLabels();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reports</h1>
          <p className="text-gray-600">Comprehensive insights into your productivity and wellness</p>
        </div>
        
        {/* Period Toggle and View Options */}
        <div className="flex items-center space-x-4">
          <div className="flex bg-white rounded-lg border border-gray-200 p-1">
            {['Weekly', 'Monthly'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <BarChart3 className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Avg Day Score */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.avgScore}</div>
            <div className="text-sm text-gray-600 mb-2">Avg Day Score</div>
            <div className="text-xs text-green-600 font-medium">
              {labels.improvementText}
            </div>
          </div>
        </div>

        {/* Active Days */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.activeDays}</div>
            <div className="text-sm text-gray-600 mb-2">Active Days</div>
            <div className="text-xs text-gray-500">
              {stats.activeDays}/{stats.totalDays} days • {labels.timeframe}
            </div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.currentStreak}</div>
            <div className="text-sm text-gray-600 mb-2">Current Streak</div>
            <div className="text-xs text-yellow-600 font-medium">
              Personal Best: {Math.max(stats.currentStreak + 3, 12)}
            </div>
          </div>
        </div>

        {/* Goals Met */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.goalsMetPercentage}%</div>
            <div className="text-sm text-gray-600 mb-2">Goals Met</div>
            <div className="text-xs text-gray-500">
              {Math.round(stats.goalsMetPercentage * stats.totalDays / 100)}/{stats.totalDays} days • {labels.timeframe}
            </div>
          </div>
        </div>
      </div>

      {/* Day Score Trends Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Day Score Trends</h2>
          <div className="flex space-x-2">
            {['30 Days', '7 Days', '14 Days'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedTrend(period)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedTrend === period
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Legend */}
        <div className="flex items-center space-x-6 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">80+ Excellent</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-600">50-80 Good</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">0-50 Needs Work</span>
          </div>
        </div>

        {/* Chart */}
        <div className="relative h-80">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-4">
            <span>90</span>
            <span>60</span>
            <span>30</span>
            <span>0</span>
          </div>

          {/* Chart area */}
          <div className="ml-8 h-full flex items-end justify-between space-x-1">
            {chartData.map((data, index) => {
              // Determine color based on score
              const getBarColor = (score) => {
                if (score >= 80) {
                  return 'from-green-400 to-green-500 hover:from-green-500 hover:to-green-600';
                } else if (score >= 50) {
                  return 'from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600';
                } else {
                  return 'from-red-400 to-red-500 hover:from-red-500 hover:to-red-600';
                }
              };

              return (
                <div key={index} className="flex flex-col items-center flex-1 relative">
                  {/* Bar with dynamic color */}
                  <div
                    className={`w-full bg-gradient-to-t rounded-t transition-all duration-300 ${getBarColor(data.score)}`}
                    style={{ height: `${(data.score / 90) * 280}px` }}
                    title={`Score: ${data.score}/90`}
                  />
                  {/* Day label - show more labels for shorter periods */}
                  {(
                    (selectedTrend === '7 Days') || 
                    (selectedTrend === '14 Days' && index % 2 === 0) || 
                    (selectedTrend === '30 Days' && index % 4 === 0)
                  ) && (
                    <span className="text-xs text-gray-500 mt-2">{data.day}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Trend line with dynamic colors */}
          <svg className="absolute top-0 left-8 w-full h-full pointer-events-none" style={{ width: 'calc(100% - 2rem)' }}>
            {/* Create trend line segments with different colors */}
            {chartData.map((data, index) => {
              if (index === chartData.length - 1) return null;
              
              const currentX = (index / (chartData.length - 1)) * 100;
              const currentY = 100 - (data.trend / 90) * 100;
              const nextX = ((index + 1) / (chartData.length - 1)) * 100;
              const nextY = 100 - (chartData[index + 1].trend / 90) * 100;
              
              // Determine color based on average of current and next trend values
              const avgTrend = (data.trend + chartData[index + 1].trend) / 2;
              const getLineColor = (trend) => {
                if (trend >= 80) return '#10B981'; // green-500
                if (trend >= 50) return '#F59E0B'; // yellow-500
                return '#EF4444'; // red-500
              };
              
              return (
                <line
                  key={index}
                  x1={`${currentX}%`}
                  y1={`${currentY}%`}
                  x2={`${nextX}%`}
                  y2={`${nextY}%`}
                  stroke={getLineColor(avgTrend)}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })}
            
            {/* Trend points */}
            {chartData.map((data, index) => {
              const x = (index / (chartData.length - 1)) * 100;
              const y = 100 - (data.trend / 90) * 100;
              
              const getPointColor = (trend) => {
                if (trend >= 80) return '#10B981'; // green-500
                if (trend >= 50) return '#F59E0B'; // yellow-500
                return '#EF4444'; // red-500
              };
              
              return (
                <circle
                  key={index}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="3"
                  fill={getPointColor(data.trend)}
                />
              );
            })}
            
            {/* Arrow at the end */}
            {(() => {
              const lastIndex = chartData.length - 1;
              const secondLastIndex = chartData.length - 2;
              const lastX = (lastIndex / (chartData.length - 1)) * 100;
              const lastY = 100 - (chartData[lastIndex].trend / 90) * 100;
              const secondLastX = (secondLastIndex / (chartData.length - 1)) * 100;
              const secondLastY = 100 - (chartData[secondLastIndex].trend / 90) * 100;
              
              // Calculate angle for arrow direction
              const angle = Math.atan2(lastY - secondLastY, lastX - secondLastX) * 180 / Math.PI;
              
              // Arrow color based on last trend value
              const getArrowColor = (trend) => {
                if (trend >= 80) return '#10B981'; // green-500
                if (trend >= 50) return '#F59E0B'; // yellow-500
                return '#EF4444'; // red-500
              };
              
              return (
                <g transform={`translate(${lastX}%, ${lastY}%) rotate(${angle})`}>
                  <polygon
                    points="0,0 -8,-3 -8,3"
                    fill={getArrowColor(chartData[lastIndex].trend)}
                  />
                </g>
              );
            })()}
          </svg>
        </div>

        <div className="text-center text-sm text-gray-500 mt-4">
          {selectedTrend === '7 Days' ? 'Last 7 Days Performance' : 
           selectedTrend === '14 Days' ? 'Last 14 Days Performance' : 
           'Last 30 Days Performance'} • Avg: {stats.avgScore}/90
        </div>
      </div>

      {/* Bottom Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Period Top Score */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">
              {labels.period} Top Score
            </span>
          </div>
          <div className="mb-2">
            <span className="text-3xl font-bold text-gray-900">{stats.maxScore}</span>
          </div>
          <div className="text-sm text-gray-500 mb-3">On {stats.maxScoreDay}</div>
          <div className="w-full bg-blue-100 rounded-full h-2 mb-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(stats.maxScore / 90) * 100}%` }}></div>
          </div>
          <div className="flex items-center text-xs text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            +{Math.round(Math.random() * 15 + 15)}% {labels.comparison}
          </div>
        </div>

        {/* Period Low Score */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600 transform rotate-180" />
            </div>
            <span className="text-sm font-medium text-gray-600">
              {labels.period} Low Score
            </span>
          </div>
          <div className="mb-2">
            <span className="text-3xl font-bold text-gray-900">{stats.minScore}</span>
          </div>
          <div className="text-sm text-gray-500 mb-3">On {stats.minScoreDay}</div>
          <div className="w-full bg-orange-100 rounded-full h-2 mb-2">
            <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(stats.minScore / 90) * 100}%` }}></div>
          </div>
          <div className="flex items-center text-xs text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            +{Math.round(Math.random() * 10 + 10)}% improvement
          </div>
        </div>

        {/* Productivity Hours */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Productivity Hours</span>
          </div>
          <div className="mb-2">
            <span className="text-3xl font-bold text-gray-900">{stats.prodHours} hrs</span>
          </div>
          <div className="text-sm text-gray-500 mb-3">{stats.avgProdPerDay}h avg/day</div>
          <div className="w-full bg-purple-100 rounded-full h-2 mb-2">
            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min((stats.prodHours / (selectedTrend === '7 Days' ? 20 : selectedTrend === '14 Days' ? 40 : 80)) * 100, 100)}%` }}></div>
          </div>
          <div className="flex items-center text-xs text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            +{Math.round(Math.random() * 12 + 8)}% {labels.comparison}
          </div>
        </div>

        {/* Active & Sleep Avg */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Moon className="w-5 h-5 text-teal-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Active & Sleep Avg</span>
          </div>
          <div className="mb-2">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-gray-900">{stats.activeHours} hrs</span>
              <span className="text-sm text-gray-500">Active</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-gray-900">{stats.sleepHours} hrs</span>
              <span className="text-sm text-gray-500">Sleep</span>
            </div>
          </div>
          <div className="w-full bg-teal-100 rounded-full h-2 mb-2">
            <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${(stats.sleepHours / 9) * 100}%` }}></div>
          </div>
          <div className="flex items-center text-xs text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            +{selectedTrend === '7 Days' ? '18%' : selectedTrend === '14 Days' ? '20%' : '23%'} Active
            <TrendingUp className="w-3 h-3 ml-2" />
            +{selectedTrend === '7 Days' ? '5%' : selectedTrend === '14 Days' ? '7%' : '12%'} Sleep
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;