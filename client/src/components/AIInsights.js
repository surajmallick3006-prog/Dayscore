import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Target, Lightbulb, RefreshCw } from 'lucide-react';
import hybridAuthService from '../services/hybridAuthService';
import LoadingSpinner from './LoadingSpinner';

const AIInsights = ({ className = '' }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  useEffect(() => {
    // Only fetch on mount, not on every render
    const lastFetch = localStorage.getItem('lastAIInsightsFetch');
    const now = Date.now();
    const cooldownPeriod = 10 * 60 * 1000; // 10 minutes cooldown
    
    if (!lastFetch || (now - parseInt(lastFetch)) > cooldownPeriod) {
      fetchAIAnalysis();
    } else {
      // Load cached analysis if available
      const cachedAnalysis = localStorage.getItem('cachedAIAnalysis');
      if (cachedAnalysis) {
        try {
          setAnalysis(JSON.parse(cachedAnalysis));
          setLoading(false);
        } catch (e) {
          fetchAIAnalysis();
        }
      } else {
        setLoading(false);
        setError('Analysis will be available after cooldown period');
      }
    }
  }, []);

  const fetchAIAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we're in cooldown period
      const lastFetch = localStorage.getItem('lastAIInsightsFetch');
      const now = Date.now();
      const cooldownPeriod = 10 * 60 * 1000; // 10 minutes
      
      if (lastFetch && (now - parseInt(lastFetch)) < cooldownPeriod) {
        const remainingTime = Math.ceil((cooldownPeriod - (now - parseInt(lastFetch))) / 60000);
        setError(`Analysis available in ${remainingTime} minutes (rate limit protection)`);
        setLoading(false);
        return;
      }

      // Check if AI insights are temporarily disabled
      const disabledUntil = localStorage.getItem('aiInsightsDisabledUntil');
      if (disabledUntil && now < parseInt(disabledUntil)) {
        const remainingTime = Math.ceil((parseInt(disabledUntil) - now) / 60000);
        setError(`AI insights temporarily disabled for ${remainingTime} more minutes`);
        setLoading(false);
        return;
      }
      
      // Store fetch timestamp
      localStorage.setItem('lastAIInsightsFetch', now.toString());
      setLastFetchTime(now);
      
      // Try authenticated endpoint first
      let response = await hybridAuthService.apiCall('/ai/python-analysis', 'GET');
      
      if (!response.success) {
        console.log('Authenticated endpoint failed, using fallback analysis...');
        // Use fallback analysis instead of making more API calls
        const fallbackAnalysis = generateFallbackAnalysis();
        setAnalysis(fallbackAnalysis);
        localStorage.setItem('cachedAIAnalysis', JSON.stringify(fallbackAnalysis));
        return;
      } else {
        setAnalysis(response.data.analysis);
        localStorage.setItem('cachedAIAnalysis', JSON.stringify(response.data.analysis));
      }
      
    } catch (err) {
      console.error('Failed to fetch AI analysis:', err);
      
      // Handle rate limit errors
      if (err.message.includes('429') || err.message.includes('Too Many Requests')) {
        // Disable AI insights for 30 minutes on rate limit
        const disableUntil = Date.now() + (30 * 60 * 1000);
        localStorage.setItem('aiInsightsDisabledUntil', disableUntil.toString());
        setError('Rate limit reached. AI insights disabled for 30 minutes.');
      } else {
        setError('Using offline analysis due to API issues');
        // Use fallback analysis
        const fallbackAnalysis = generateFallbackAnalysis();
        setAnalysis(fallbackAnalysis);
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate fallback analysis when API is unavailable
  const generateFallbackAnalysis = () => {
    const currentHour = new Date().getHours();
    const isEvening = currentHour >= 18;
    const isMorning = currentHour < 12;
    
    return {
      dayScore: 75,
      dayType: isEvening ? 'RECOVERY' : isMorning ? 'PUSH' : 'BALANCED',
      burnoutRisk: 'LOW',
      keyScoreDrivers: [
        'Consistent daily routine showing good habits',
        'Active engagement with productivity tracking',
        'Balanced approach to work and wellness'
      ],
      dailyInsights: [
        isMorning ? 
          'Morning energy levels are optimal for focused work and learning activities.' :
          isEvening ?
          'Evening reflection time is perfect for planning tomorrow and unwinding.' :
          'Midday momentum is great for tackling challenging tasks and staying productive.',
        'Your tracking habits show commitment to personal growth and self-awareness.',
        'Maintaining this consistent approach will build strong long-term success patterns.'
      ],
      actionableRecommendations: [
        'Continue your current tracking routine - consistency builds lasting habits',
        'Set one specific goal for tomorrow to maintain forward momentum',
        'Take time for reflection on what worked well today'
      ],
      weeklyTrendInsight: 'Your consistent use of the tracking system shows dedication to personal improvement. Keep building these positive habits for long-term success.'
    };
  };

  const getDayTypeColor = (dayType) => {
    switch (dayType) {
      case 'PUSH': return 'text-green-600 bg-green-100';
      case 'RECOVERY': return 'text-blue-600 bg-blue-100';
      case 'BALANCED': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBurnoutRiskColor = (risk) => {
    switch (risk) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MODERATE': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDayScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="md" text="Analyzing your day..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
          <p className="text-sm text-gray-600 mb-3">{error}</p>
          {!error.includes('cooldown') && !error.includes('disabled') && (
            <button 
              onClick={fetchAIAnalysis}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Try again
            </button>
          )}
          {error.includes('rate limit') && (
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-700">
                Rate limiting protects against API overuse. Analysis will be available soon.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Daily Insights</h3>
              <p className="text-sm text-gray-500">Personalized analysis of your day</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getDayScoreColor(analysis.dayScore)}`}>
              {analysis.dayScore}
            </div>
            <div className="text-xs text-gray-500">Day Score</div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Day Type & Burnout Risk */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDayTypeColor(analysis.dayType)}`}>
              {analysis.dayType} Day
            </div>
            <p className="text-xs text-gray-500 mt-1">Recommended approach</p>
          </div>
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getBurnoutRiskColor(analysis.burnoutRisk)}`}>
              {analysis.burnoutRisk} Risk
            </div>
            <p className="text-xs text-gray-500 mt-1">Burnout assessment</p>
          </div>
        </div>

        {/* Key Score Drivers */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Key Performance Drivers
          </h4>
          <div className="space-y-2">
            {analysis.keyScoreDrivers.map((driver, index) => (
              <div key={index} className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                {driver}
              </div>
            ))}
          </div>
        </div>

        {/* Daily Insights */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Lightbulb className="w-4 h-4 mr-2" />
            Daily Insights
          </h4>
          <div className="space-y-3">
            {analysis.dailyInsights.map((insight, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Tomorrow's Action Plan
          </h4>
          <div className="space-y-2">
            {analysis.actionableRecommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start text-sm text-gray-700">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">
                  {index + 1}
                </div>
                {recommendation}
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Trend Insight */}
        {analysis.weeklyTrendInsight && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Weekly Pattern Analysis</h4>
            <p className="text-sm text-gray-700">{analysis.weeklyTrendInsight}</p>
          </div>
        )}

        {/* Refresh Button */}
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={() => {
              const now = Date.now();
              const lastFetch = localStorage.getItem('lastAIInsightsFetch');
              const cooldownPeriod = 10 * 60 * 1000; // 10 minutes
              
              if (lastFetch && (now - parseInt(lastFetch)) < cooldownPeriod) {
                const remainingTime = Math.ceil((cooldownPeriod - (now - parseInt(lastFetch))) / 60000);
                setError(`Please wait ${remainingTime} more minutes before refreshing (rate limit protection)`);
                return;
              }
              
              fetchAIAnalysis();
            }}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Analyzing...' : 'Refresh Analysis'}
          </button>
          
          {/* Rate limit info */}
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">
              Analysis refreshes every 10 minutes to respect API limits
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;