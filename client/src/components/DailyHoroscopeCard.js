import React, { useState, useEffect } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, Settings, Eye } from 'lucide-react';
import horoscopeService from '../services/horoscopeService';

const DailyHoroscopeCard = ({ onEditZodiac }) => {
  const [horoscope, setHoroscope] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [showTomorrowHint, setShowTomorrowHint] = useState(false);
  const [tomorrowHint, setTomorrowHint] = useState('');

  useEffect(() => {
    const zodiacSign = horoscopeService.getUserZodiacSign();
    if (zodiacSign) {
      const todayHoroscope = horoscopeService.getTodayHoroscope(zodiacSign);
      setHoroscope(todayHoroscope);
      
      // Check if feedback already given today
      const hasGivenFeedback = horoscopeService.hasGivenFeedbackToday(zodiacSign);
      setFeedbackGiven(hasGivenFeedback);
      
      // Get tomorrow's hint
      const hint = horoscopeService.getTomorrowHint();
      setTomorrowHint(hint);
    }
  }, []);

  const handleFeedback = (isAccurate) => {
    if (horoscope && !feedbackGiven) {
      horoscopeService.storeHoroscopeFeedback(
        horoscope.sign, 
        horoscope.date, 
        isAccurate
      );
      setFeedbackGiven(true);
      setShowFeedback(false);
      
      // Show tomorrow hint after feedback
      setTimeout(() => {
        setShowTomorrowHint(true);
      }, 500);
    }
  };

  if (!horoscope) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl p-6 border border-purple-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900">Your Daily Horoscope</h3>
        </div>
        <button
          onClick={onEditZodiac}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
          title="Change zodiac sign"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Horoscope Content */}
      <div className="mb-4">
        <div className="flex items-center space-x-3 mb-3">
          <span className="text-3xl">{horoscope.symbol}</span>
          <div>
            <h4 className="text-xl font-bold text-gray-900">{horoscope.name}</h4>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-purple-600 font-medium">Today's vibe:</span>
              <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                {horoscope.vibe}
              </span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-700 leading-relaxed text-base">
          {horoscope.prediction}
        </p>
      </div>

      {/* Feedback Section */}
      {!feedbackGiven && !showFeedback && (
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setShowFeedback(true)}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1"
          >
            <Eye className="w-4 h-4" />
            <span>Does this feel accurate?</span>
          </button>
        </div>
      )}

      {showFeedback && !feedbackGiven && (
        <div className="bg-white bg-opacity-60 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-700 mb-3 text-center">
            Does this horoscope feel accurate today?
          </p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => handleFeedback(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Yes ✨</span>
            </button>
            <button
              onClick={() => handleFeedback(false)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ThumbsDown className="w-4 h-4" />
              <span>Not really 🤷</span>
            </button>
          </div>
        </div>
      )}

      {feedbackGiven && (
        <div className="text-center text-sm text-gray-500 mb-4">
          Thanks for your feedback! ✨
        </div>
      )}

      {/* Tomorrow Hint */}
      {showTomorrowHint && (
        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl p-4 border border-indigo-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">🔮</span>
            <h5 className="text-sm font-semibold text-indigo-900">A Hint for Tomorrow</h5>
          </div>
          <p className="text-sm text-indigo-700">{tomorrowHint}</p>
        </div>
      )}

      {/* DayScore Integration */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Reading your horoscope adds a little clarity to your day ✨
        </p>
      </div>
    </div>
  );
};

export default DailyHoroscopeCard;