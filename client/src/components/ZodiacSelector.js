import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

const ZodiacSelector = ({ onSelect, onClose }) => {
  const [selectedSign, setSelectedSign] = useState(null);

  const zodiacSigns = [
    { sign: 'aries', name: 'Aries', symbol: '♈', dates: 'Mar 21 - Apr 19' },
    { sign: 'taurus', name: 'Taurus', symbol: '♉', dates: 'Apr 20 - May 20' },
    { sign: 'gemini', name: 'Gemini', symbol: '♊', dates: 'May 21 - Jun 20' },
    { sign: 'cancer', name: 'Cancer', symbol: '♋', dates: 'Jun 21 - Jul 22' },
    { sign: 'leo', name: 'Leo', symbol: '♌', dates: 'Jul 23 - Aug 22' },
    { sign: 'virgo', name: 'Virgo', symbol: '♍', dates: 'Aug 23 - Sep 22' },
    { sign: 'libra', name: 'Libra', symbol: '♎', dates: 'Sep 23 - Oct 22' },
    { sign: 'scorpio', name: 'Scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21' },
    { sign: 'sagittarius', name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21' },
    { sign: 'capricorn', name: 'Capricorn', symbol: '♑', dates: 'Dec 22 - Jan 19' },
    { sign: 'aquarius', name: 'Aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18' },
    { sign: 'pisces', name: 'Pisces', symbol: '♓', dates: 'Feb 19 - Mar 20' }
  ];

  const handleContinue = () => {
    if (selectedSign) {
      onSelect(selectedSign);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-center mb-2">
            <Sparkles className="w-6 h-6 mr-2" />
            <h2 className="text-xl font-bold">What's your zodiac sign?</h2>
          </div>
          <p className="text-purple-100 text-sm text-center">
            We'll use this to show your daily horoscope vibe.
          </p>
        </div>

        {/* Zodiac Signs Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {zodiacSigns.map((zodiac) => (
              <button
                key={zodiac.sign}
                onClick={() => setSelectedSign(zodiac)}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200 text-left
                  ${selectedSign?.sign === zodiac.sign
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{zodiac.symbol}</span>
                  <div>
                    <div className="font-semibold text-gray-900">{zodiac.name}</div>
                    <div className="text-xs text-gray-500">{zodiac.dates}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Continue Button */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={handleContinue}
              disabled={!selectedSign}
              className={`
                flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2
                ${selectedSign
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <span>Continue</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZodiacSelector;