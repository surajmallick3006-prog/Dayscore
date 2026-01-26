import React, { useState } from 'react';
import { Brain, Zap, Heart, AlertTriangle, Star, Settings, BarChart3 } from 'lucide-react';
import { useAI } from '../context/AIContext';

const AIControls = () => {
  const [showControls, setShowControls] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  const {
    isRecoveryMode,
    toggleRecoveryMode,
    triggerAIPopup,
    getPopupAnalytics,
    aiAvailable,
    isAnalyzing,
    popupHistory
  } = useAI();

  const handleShowAnalytics = async () => {
    if (!showAnalytics) {
      const data = await getPopupAnalytics();
      setAnalytics(data);
    }
    setShowAnalytics(!showAnalytics);
  };

  const testPopups = [
    { intent: 'console', label: 'Emotional Support', icon: Heart, color: 'text-purple-500' },
    { intent: 'praise', label: 'Celebration', icon: Star, color: 'text-yellow-500' },
    { intent: 'warn', label: 'Gentle Care', icon: AlertTriangle, color: 'text-orange-500' },
    { intent: 'nudge', label: 'Kind Nudge', icon: Zap, color: 'text-blue-500' }
  ];

  return (
    <div className="fixed bottom-4 left-4 z-30">
      {/* Main AI Button */}
      <div className="relative">
        <button
          onClick={() => setShowControls(!showControls)}
          className={`
            w-12 h-12 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center
            ${aiAvailable 
              ? isRecoveryMode 
                ? 'bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500' 
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
              : 'bg-gray-400 hover:bg-gray-500'
            }
            ${isAnalyzing ? 'animate-pulse' : ''}
          `}
          title={aiAvailable ? 'DayScore AI Controls' : 'AI Not Available'}
        >
          <Brain className={`w-6 h-6 text-white ${isAnalyzing ? 'animate-spin' : ''}`} />
        </button>

        {/* Status Indicator */}
        <div className={`
          absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white
          ${aiAvailable ? 'bg-green-400' : 'bg-red-400'}
        `} />

        {/* Recovery Mode Indicator */}
        {isRecoveryMode && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-white flex items-center justify-center">
            <Heart className="w-2 h-2 text-white" />
          </div>
        )}
      </div>

      {/* Controls Panel */}
      {showControls && (
        <div className="absolute bottom-16 left-0 w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-4 animate-slideUp">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-gray-900">DayScore AI</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShowAnalytics}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                title="View Analytics"
              >
                <BarChart3 className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => setShowControls(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${aiAvailable ? 'text-green-600' : 'text-red-600'}`}>
                {aiAvailable ? 'Connected' : 'Offline'}
              </span>
            </div>
            {isRecoveryMode && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Mode:</span>
                <span className="font-medium text-green-600 flex items-center">
                  <Heart className="w-3 h-3 mr-1" />
                  Recovery
                </span>
              </div>
            )}
          </div>

          {/* Recovery Mode Toggle */}
          <div className="mb-4">
            <button
              onClick={() => toggleRecoveryMode(!isRecoveryMode)}
              className={`
                w-full p-3 rounded-lg transition-all duration-200 flex items-center justify-between
                ${isRecoveryMode 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span className="font-medium">Recovery Mode</span>
              </div>
              <div className={`
                w-10 h-6 rounded-full transition-colors relative
                ${isRecoveryMode ? 'bg-green-400' : 'bg-gray-300'}
              `}>
                <div className={`
                  absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                  ${isRecoveryMode ? 'translate-x-5' : 'translate-x-1'}
                `} />
              </div>
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Therapeutic mode with deep emotional support and validation
            </p>
          </div>

          {/* Recent Popups */}
          {popupHistory.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Messages</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {popupHistory.slice(0, 3).map((popup, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                    <div className="flex items-center space-x-1 mb-1">
                      <span className={`
                        px-2 py-0.5 rounded text-xs font-medium
                        ${popup.intent === 'praise' ? 'bg-yellow-100 text-yellow-800' :
                          popup.intent === 'console' ? 'bg-purple-100 text-purple-800' :
                          popup.intent === 'warn' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'}
                      `}>
                        {popup.intent}
                      </span>
                      <span className="text-gray-500">{popup.tone}</span>
                    </div>
                    <p className="text-gray-700">{popup.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Panel */}
          {showAnalytics && analytics && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">AI Analytics (7 days)</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Messages:</span>
                  <span className="font-medium">{analytics.totalPopups}</span>
                </div>
                {Object.entries(analytics.intentDistribution || {}).map(([intent, count]) => (
                  <div key={intent} className="flex justify-between text-xs">
                    <span className="text-gray-500 capitalize">{intent}:</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIControls;