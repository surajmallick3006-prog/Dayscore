import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, TrendingUp, Settings, BarChart3 } from 'lucide-react';
import HoroscopeManager from '../components/HoroscopeManager';
import ZodiacSelector from '../components/ZodiacSelector';
import horoscopeService from '../services/horoscopeService';

const HoroscopePage = () => {
  const [accuracyStats, setAccuracyStats] = useState(null);
  const [weeklyHoroscopes, setWeeklyHoroscopes] = useState([]);
  const [userZodiac, setUserZodiac] = useState(null);
  const [showZodiacSelector, setShowZodiacSelector] = useState(false);

  useEffect(() => {
    const zodiacSign = horoscopeService.getUserZodiacSign();
    if (zodiacSign) {
      setUserZodiac(zodiacSign);
      
      // Get accuracy stats
      const stats = horoscopeService.getAccuracyStats(zodiacSign);
      setAccuracyStats(stats);
      
      // Generate weekly horoscopes (last 7 days)
      const weekly = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toDateString();
        
        // Simulate getting horoscope for each day
        const dayHoroscope = horoscopeService.getTodayHoroscope(zodiacSign);
        if (dayHoroscope) {
          weekly.push({
            ...dayHoroscope,
            date: dateString,
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
            isToday: i === 0
          });
        }
      }
      setWeeklyHoroscopes(weekly);
    }
  }, []);

  const zodiacInfo = userZodiac ? horoscopeService.zodiacInfo[userZodiac] : null;

  return (
    <div className="min-h-screen bg-gray-50 -m-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Sparkles className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Your Horoscope</h1>
            </div>
            <p className="text-purple-100">
              Daily cosmic guidance for your journey
            </p>
          </div>
          {zodiacInfo && (
            <div className="text-center">
              <div className="text-4xl mb-2">{zodiacInfo.symbol}</div>
              <div className="text-lg font-semibold">{zodiacInfo.name}</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Horoscope Card */}
        <div className="lg:col-span-2">
          <HoroscopeManager />
          
          {/* Weekly Overview */}
          {weeklyHoroscopes.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2 mb-6">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-semibold text-gray-900">This Week's Journey</h3>
              </div>
              
              <div className="space-y-4">
                {weeklyHoroscopes.map((horoscope, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      horoscope.isToday
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-lg">{horoscope.symbol}</span>
                          <div>
                            <div className="font-medium text-gray-900">
                              {horoscope.dayName}
                              {horoscope.isToday && (
                                <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                  Today
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(horoscope.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {horoscope.prediction}
                        </p>
                      </div>
                      <div className="ml-4 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {horoscope.vibe}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Accuracy Stats */}
          {accuracyStats && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900">Your Accuracy</h3>
              </div>
              
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {accuracyStats.accuracy}%
                </div>
                <div className="text-sm text-gray-500">
                  Based on {accuracyStats.totalReadings} reading{accuracyStats.totalReadings !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${accuracyStats.accuracy}%` }}
                ></div>
              </div>
              
              <p className="text-xs text-gray-500 mt-3 text-center">
                Keep giving feedback to improve accuracy
              </p>
            </div>
          )}

          {/* Zodiac Info */}
          {zodiacInfo && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">{zodiacInfo.symbol}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{zodiacInfo.name}</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Element:</span>
                  <span className="font-medium">
                    {['aries', 'leo', 'sagittarius'].includes(userZodiac) ? 'Fire 🔥' :
                     ['taurus', 'virgo', 'capricorn'].includes(userZodiac) ? 'Earth 🌍' :
                     ['gemini', 'libra', 'aquarius'].includes(userZodiac) ? 'Air 💨' :
                     'Water 🌊'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Quality:</span>
                  <span className="font-medium">
                    {['aries', 'cancer', 'libra', 'capricorn'].includes(userZodiac) ? 'Cardinal' :
                     ['taurus', 'leo', 'scorpio', 'aquarius'].includes(userZodiac) ? 'Fixed' :
                     'Mutable'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Ruling Planet:</span>
                  <span className="font-medium">
                    {userZodiac === 'aries' ? 'Mars ♂️' :
                     userZodiac === 'taurus' ? 'Venus ♀️' :
                     userZodiac === 'gemini' ? 'Mercury ☿️' :
                     userZodiac === 'cancer' ? 'Moon 🌙' :
                     userZodiac === 'leo' ? 'Sun ☀️' :
                     userZodiac === 'virgo' ? 'Mercury ☿️' :
                     userZodiac === 'libra' ? 'Venus ♀️' :
                     userZodiac === 'scorpio' ? 'Pluto ♇' :
                     userZodiac === 'sagittarius' ? 'Jupiter ♃' :
                     userZodiac === 'capricorn' ? 'Saturn ♄' :
                     userZodiac === 'aquarius' ? 'Uranus ♅' :
                     'Neptune ♆'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => setShowZodiacSelector(true)}
                className="w-full mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Change Sign</span>
              </button>

              {showZodiacSelector && (
                <ZodiacSelector
                  onSelect={(zodiac) => {
                    horoscopeService.setUserZodiacSign(zodiac.sign);
                    setUserZodiac(zodiac.sign);
                    setShowZodiacSelector(false);
                  }}
                  onClose={() => setShowZodiacSelector(false)}
                />
              )}
            </div>
          )}

          {/* Daily Vibe Tracker */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900">Vibe Tracker</h3>
            </div>
            
            <div className="space-y-3">
              {['⚡ Focus', '😌 Calm', '🔥 Action', '🧘 Balance', '🌙 Rest'].map((vibe, index) => {
                const count = weeklyHoroscopes.filter(h => h.vibe === vibe).length;
                const percentage = weeklyHoroscopes.length > 0 ? (count / weeklyHoroscopes.length) * 100 : 0;
                
                return (
                  <div key={vibe} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{vibe}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-purple-400 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 w-8">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoroscopePage;