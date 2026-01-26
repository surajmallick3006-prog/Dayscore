import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Target, Lightbulb } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

const AIInsights = ({ className = '' }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAIAnalysis();
  }, []);

  const fetchAIAnalysis = async () => {
    try {
      setLoading(true);
      // Try Python AI service first, fallback to JavaScript AI
      const response = await axios.get('/api/ai/python-analysis');
      setAnalysis(response.data.analysis);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch AI analysis:', err);
      setError('Failed to load AI insights');
    } finally {
      setLoading(false);
    }
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
        <div className="text-center text-red-600">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
          <button 
            onClick={fetchAIAnalysis}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
          >
            Try again
          </button>
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
            onClick={fetchAIAnalysis}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Brain className="w-4 h-4 mr-2" />
            Refresh Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;