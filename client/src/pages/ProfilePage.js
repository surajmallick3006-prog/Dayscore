import React, { useState } from 'react';
import { User, Upload, Sun, Moon, Clock, Zap, Target, MapPin, Settings, ToggleLeft, ToggleRight } from 'lucide-react';
import { useServerAuth } from '../context/ServerAuthContext';

const ProfilePage = () => {
  const { user, updateProfile } = useServerAuth();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: '',
    role: 'Professional',
    ageGroup: 'Professional',
    wakeUpTime: '7:00 AM',
    sleepTime: '11:00 PM'
  });

  const [goals, setGoals] = useState({
    careerGrowth: true,
    careerFitness: true,
    healthActivity: true,
    learningNewFamily: true,
    socialFamily: true,
    freelogy: true
  });

  const [preferences, setPreferences] = useState({
    peakEnergy: 'Mid-Day',
    workStyle: 'Sprint',
    sensitivity: 50,
    realTimeReminders: true
  });

  const handleSaveProfile = () => {
    console.log('Profile saved:', { profileData, goals, preferences });
  };

  const toggleGoal = (goalKey) => {
    setGoals(prev => ({
      ...prev,
      [goalKey]: !prev[goalKey]
    }));
  };

  const togglePreference = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile & Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Basic Identity */}
          <div className="space-y-6">
            {/* Basic Identity Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="bg-blue-100 rounded-xl p-4 mb-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-4">Basic Identity</h2>
                
                {/* Age Group Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
                  <div className="flex space-x-2">
                    {['Student', 'Student', 'Professional'].map((group, index) => (
                      <button
                        key={index}
                        onClick={() => setProfileData(prev => ({ ...prev, ageGroup: group }))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          profileData.ageGroup === group
                            ? index === 0 ? 'bg-orange-500 text-white' 
                              : index === 1 ? 'bg-pink-500 text-white'
                              : 'bg-yellow-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Role Dropdown */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={profileData.role}
                    onChange={(e) => setProfileData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Student">Student</option>
                    <option value="Freelancer">Freelancer</option>
                    <option value="Entrepreneur">Entrepreneur</option>
                  </select>
                </div>

                {/* Wake-up and Sleep Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Typical Wake-up Time</label>
                    <div className="flex items-center space-x-2 bg-orange-100 rounded-xl p-3">
                      <Sun className="w-5 h-5 text-orange-500" />
                      <input
                        type="time"
                        value="07:00"
                        className="bg-transparent border-none outline-none text-orange-700 font-medium"
                        onChange={(e) => setProfileData(prev => ({ ...prev, wakeUpTime: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Typical Sleep Time</label>
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-3">
                      <Moon className="w-5 h-5 text-gray-500" />
                      <input
                        type="time"
                        value="23:00"
                        className="bg-transparent border-none outline-none text-gray-700 font-medium"
                        onChange={(e) => setProfileData(prev => ({ ...prev, sleepTime: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Goals & Routine */}
          <div className="space-y-6">
            {/* Basic Identity Input */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Identity</h3>
              <input
                type="text"
                placeholder="Enter your name"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              />
            </div>

            {/* Daily Routine Baseline */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Routine Baseline</h3>
              
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">Goals & Priorities</h4>
                <div className="space-y-3">
                  {[
                    { key: 'careerGrowth', label: 'Career Growth', color: 'orange' },
                    { key: 'careerFitness', label: 'Career & Fitness', color: 'orange' },
                    { key: 'healthActivity', label: 'Health & Activity', color: 'yellow' },
                    { key: 'learningNewFamily', label: 'Learning New Family Time', color: 'green' },
                    { key: 'socialFamily', label: 'Social & Family Time', color: 'blue' },
                    { key: 'freelogy', label: 'Freelogy', color: 'purple' }
                  ].map((goal) => (
                    <div key={goal.key} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded ${
                          goal.color === 'orange' ? 'bg-orange-400' :
                          goal.color === 'yellow' ? 'bg-yellow-400' :
                          goal.color === 'green' ? 'bg-green-400' :
                          goal.color === 'blue' ? 'bg-blue-400' :
                          'bg-purple-400'
                        }`}></div>
                        <span className="text-gray-700">{goal.label}</span>
                      </div>
                      <button
                        onClick={() => toggleGoal(goal.key)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          goals[goal.key] ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          goals[goal.key] ? 'translate-x-6' : 'translate-x-0.5'
                        }`}></div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                className="w-full bg-cyan-500 text-white font-semibold py-3 rounded-xl hover:bg-cyan-600 transition-colors"
              >
                Save Profile
              </button>
            </div>
          </div>

          {/* Right Column - Address & Preferences */}
          <div className="space-y-6">
            {/* Address */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
              <textarea
                placeholder="Enter your address"
                value={profileData.address}
                onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
              />
              
              <div className="mt-4">
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload</span>
                </div>
                <p className="text-xs text-gray-500">JPG, GIF or PNG, 1MB max.</p>
              </div>
            </div>

            {/* Productivity Preferences */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Productivity Preferences</h3>
              
              {/* Peak Energy Time */}
              <div className="mb-4">
                <div className="flex space-x-2 mb-3">
                  <button
                    onClick={() => setPreferences(prev => ({ ...prev, peakEnergy: 'Peak Energy' }))}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      preferences.peakEnergy === 'Peak Energy' 
                        ? 'bg-gray-300 text-gray-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Peak Energy
                  </button>
                  <button
                    onClick={() => setPreferences(prev => ({ ...prev, peakEnergy: 'Mid-Day' }))}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      preferences.peakEnergy === 'Mid-Day' 
                        ? 'bg-orange-400 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Mid-Day
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPreferences(prev => ({ ...prev, workStyle: 'Morning' }))}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      preferences.workStyle === 'Morning' 
                        ? 'bg-gray-300 text-gray-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Morning
                  </button>
                  <button
                    onClick={() => setPreferences(prev => ({ ...prev, workStyle: 'Sprint' }))}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      preferences.workStyle === 'Sprint' 
                        ? 'bg-gray-300 text-gray-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Sprint (PoDeep Work)
                  </button>
                </div>
              </div>

              {/* Sensitivity Slider */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sensitivity</label>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.sensitivity}
                    onChange={(e) => setPreferences(prev => ({ ...prev, sensitivity: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>Strict</span>
                  </div>
                </div>
              </div>

              {/* Real-time Reminders Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Real-time Reminders</span>
                <button
                  onClick={() => togglePreference('realTimeReminders')}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    preferences.realTimeReminders ? 'bg-cyan-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    preferences.realTimeReminders ? 'translate-x-6' : 'translate-x-0.5'
                  }`}></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;