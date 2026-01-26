import React from 'react';

const MoodSlider = ({ moodData }) => {
  const mood = moodData?.mood || 3;
  const energy = moodData?.energy || 5;

  const moodEmojis = ['😢', '😕', '😐', '😊', '😄'];
  const moodLabels = ['Very Low', 'Low', 'Neutral', 'Good', 'Excellent'];

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood & Energy</h3>
      
      {/* Current Mood */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{moodEmojis[mood - 1]}</div>
        <div className="text-sm font-medium text-gray-900">{moodLabels[mood - 1]}</div>
        <div className="text-xs text-gray-500">Current mood</div>
      </div>

      {/* Energy Level */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Energy Level</span>
          <span className="text-sm font-medium text-gray-900">{energy}/10</span>
        </div>
        
        <div className="relative">
          <div className="w-full bg-gradient-to-r from-blue-200 via-green-200 to-red-200 rounded-full h-3">
            <div 
              className="absolute top-0 left-0 h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${energy * 10}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>

      {/* Stress Level */}
      {moodData?.stress && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Stress Level</span>
            <span className="text-sm font-medium text-gray-900">{moodData.stress}/10</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${moodData.stress * 10}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick Update */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button className="w-full btn-secondary text-sm py-2">
          Update Mood
        </button>
      </div>
    </div>
  );
};

export default MoodSlider;