import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Share2, Sparkles, Heart } from 'lucide-react';
import { useServerAuth } from '../context/ServerAuthContext';
import vibeService from '../services/vibeService';
import checkInService from '../services/checkInService';
import toast from 'react-hot-toast';

// Add custom CSS for wheel animation
const wheelStyles = `
  .wheel-spin {
    transition: transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99);
  }
  
  .wheel-spin.spinning {
    transition: transform 4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  
  @keyframes wheelGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
    50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.8); }
  }
  
  .wheel-spinning {
    animation: wheelGlow 1s ease-in-out infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = wheelStyles;
  document.head.appendChild(styleSheet);
}

const VibeWheel = ({ onVibeSelected, showCommunityPrompt = true }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedVibe, setSelectedVibe] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [hasSpunToday, setHasSpunToday] = useState(false);
  const wheelRef = useRef(null);

  const { user } = useServerAuth();

  const vibeSegments = [
    { 
      id: 'productive', 
      emoji: '🔥', 
      label: 'Productive', 
      subtitle: 'Action',
      color: 'from-red-400 to-orange-500',
      message: 'time to crush your tasks!',
      vibeType: 'motivated'
    },
    { 
      id: 'calm', 
      emoji: '😌', 
      label: 'Calm', 
      subtitle: 'Relax',
      color: 'from-blue-400 to-cyan-500',
      message: 'take it easy and breathe.',
      vibeType: 'calm'
    },
    { 
      id: 'energetic', 
      emoji: '⚡', 
      label: 'Energetic', 
      subtitle: 'Excited',
      color: 'from-yellow-400 to-orange-500',
      message: 'perfect for tackling challenges!',
      vibeType: 'energetic'
    },
    { 
      id: 'rest', 
      emoji: '🌙', 
      label: 'Rest', 
      subtitle: 'Slow Down',
      color: 'from-indigo-400 to-purple-500',
      message: 'recharge and don\'t overthink.',
      vibeType: 'peaceful'
    },
    { 
      id: 'balanced', 
      emoji: '🧘', 
      label: 'Balanced', 
      subtitle: 'Centered',
      color: 'from-green-400 to-teal-500',
      message: 'focus on keeping harmony.',
      vibeType: 'focused'
    },
    { 
      id: 'creative', 
      emoji: '🎨', 
      label: 'Creative', 
      subtitle: 'Inspired',
      color: 'from-pink-400 to-purple-500',
      message: 'let ideas flow freely.',
      vibeType: 'creative'
    }
  ];

  useEffect(() => {
    checkTodaysSpin();
  }, [user]);

  const checkTodaysSpin = async () => {
    if (!user) return;
    
    try {
      const today = new Date().toDateString();
      const lastSpin = localStorage.getItem(`vibeWheel_${user.id}_${today}`);
      if (lastSpin) {
        const spinData = JSON.parse(lastSpin);
        setSelectedVibe(spinData);
        setHasSpunToday(true);
      }
    } catch (error) {
      console.error('Error checking today\'s spin:', error);
    }
  };

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    
    // Generate random rotation with proper physics
    const segmentAngle = 360 / vibeSegments.length; // 60 degrees per segment
    const minSpins = 4;
    const maxSpins = 7;
    const spins = minSpins + Math.random() * (maxSpins - minSpins);
    
    // Random target segment (0-5)
    const targetSegment = Math.floor(Math.random() * vibeSegments.length);
    
    // Calculate final rotation
    // We need to account for the pointer being at the top (0 degrees)
    // and segments being arranged clockwise starting from top
    const targetAngle = targetSegment * segmentAngle;
    const finalRotation = (spins * 360) + targetAngle;
    
    // Add some visual feedback
    toast.loading('Spinning the wheel...', { 
      id: 'wheel-spin',
      icon: '🎡',
      duration: 3800
    });
    
    setRotation(prev => prev + finalRotation);

    // Show result after animation completes
    setTimeout(() => {
      const selectedSegment = vibeSegments[targetSegment];
      setSelectedVibe(selectedSegment);
      setIsSpinning(false);
      setHasSpunToday(true);
      
      // Save today's spin
      const today = new Date().toDateString();
      localStorage.setItem(`vibeWheel_${user.id}_${today}`, JSON.stringify(selectedSegment));
      
      // Debug info for testing
      console.log(`🎡 Wheel Spin Result:`, {
        targetSegment,
        selectedSegment: selectedSegment.label,
        finalRotation: finalRotation,
        spins: spins.toFixed(1)
      });
      
      // Dismiss loading toast and show result
      toast.dismiss('wheel-spin');
      toast.success(`Your vibe: ${selectedSegment.emoji} ${selectedSegment.label}!`, {
        icon: '🎡',
        duration: 4000
      });

      // Callback for parent component
      if (onVibeSelected) {
        onVibeSelected(selectedSegment);
      }
    }, 4000); // Increased to 4 seconds for better animation
  };

  const resetWheel = () => {
    if (isSpinning) return;
    
    setSelectedVibe(null);
    setHasSpunToday(false);
    // Don't reset rotation to 0, keep current position for visual continuity
    
    // Clear today's spin from storage
    const today = new Date().toDateString();
    localStorage.removeItem(`vibeWheel_${user.id}_${today}`);
    
    toast.success('Wheel reset! Spin again for a new vibe ✨');
  };

  const shareVibeWithCommunity = async () => {
    if (!selectedVibe || !user) return;

    try {
      // Create a check-in with the vibe wheel result
      const checkInData = {
        thought: `🎡 Spun the vibe wheel and got: ${selectedVibe.emoji} ${selectedVibe.label}! ${selectedVibe.message}`,
        isPublic: true
      };

      await checkInService.createCheckIn(user.id, user, checkInData);
      toast.success('Vibe shared with community! 🌟');
    } catch (error) {
      console.error('Error sharing vibe:', error);
      toast.error('Failed to share vibe');
    }
  };

  const logVibeToTracker = async () => {
    if (!selectedVibe || !user) return;

    try {
      const vibeData = {
        vibeType: selectedVibe.vibeType,
        intensity: 2, // Medium intensity for wheel spins
        note: `Vibe Wheel: ${selectedVibe.label} - ${selectedVibe.message}`
      };

      await vibeService.saveVibe(user.id, vibeData);
      toast.success('Vibe logged to your tracker! ✨');
    } catch (error) {
      console.error('Error logging vibe:', error);
      toast.error('Failed to log vibe');
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          <h3 className="text-xl font-bold text-gray-900">Spin Your Vibe for Today!</h3>
          <span className="text-2xl">🌈</span>
        </div>
        <p className="text-gray-600 text-sm">
          Tap the wheel and see what energy the universe has for you today ✨
        </p>
      </div>

      {/* Wheel Container */}
      <div className="relative flex justify-center mb-6">
        <div className="relative w-80 h-80">
          {/* Spinning Indicator */}
          {isSpinning && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black bg-opacity-20 rounded-full">
              <div className="bg-white rounded-full px-4 py-2 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium text-gray-800">Spinning...</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Wheel */}
          <div
            ref={wheelRef}
            className={`w-full h-full rounded-full border-4 border-white shadow-2xl wheel-spin ${
              isSpinning ? 'spinning wheel-spinning' : ''
            }`}
            style={{
              transform: `rotate(${rotation}deg)`,
              background: `conic-gradient(
                from 0deg,
                #ef4444 0deg 60deg,
                #3b82f6 60deg 120deg,
                #eab308 120deg 180deg,
                #6366f1 180deg 240deg,
                #10b981 240deg 300deg,
                #ec4899 300deg 360deg
              )`
            }}
          >
            {/* Wheel Segments */}
            {vibeSegments.map((segment, index) => {
              // Position segments starting from top (0 degrees) going clockwise
              const angle = (index * 60); // 60 degrees per segment
              const radians = (angle * Math.PI) / 180;
              const radius = 110; // Distance from center
              const x = Math.sin(radians) * radius;
              const y = -Math.cos(radians) * radius;
              
              return (
                <div
                  key={segment.id}
                  className="absolute w-16 h-16 flex flex-col items-center justify-center text-white font-bold pointer-events-none"
                  style={{
                    left: `calc(50% + ${x}px - 32px)`,
                    top: `calc(50% + ${y}px - 32px)`,
                    transform: `rotate(${angle}deg)`
                  }}
                >
                  <div className="text-2xl mb-1 transform" style={{ transform: `rotate(-${angle}deg)` }}>
                    {segment.emoji}
                  </div>
                  <div className="text-xs text-center leading-tight transform" style={{ transform: `rotate(-${angle}deg)` }}>
                    <div>{segment.label}</div>
                    <div className="opacity-80">{segment.subtitle}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center shadow-lg">
            <div className="text-2xl">🎡</div>
          </div>

          {/* Pointer */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="w-0 h-0 border-l-6 border-r-6 border-b-8 border-l-transparent border-r-transparent border-b-yellow-500 drop-shadow-lg filter"></div>
          </div>
        </div>
      </div>

      {/* Result Display */}
      {selectedVibe && !isSpinning && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <div className="text-center">
            <div className="text-4xl mb-2">{selectedVibe.emoji}</div>
            <h4 className="text-lg font-bold text-purple-900 mb-1">
              Your energy today: {selectedVibe.label}
            </h4>
            <p className="text-purple-800 text-sm">
              {selectedVibe.message}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {!hasSpunToday ? (
          <button
            onClick={spinWheel}
            disabled={isSpinning}
            className={`
              w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center space-x-2
              ${isSpinning
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105'
              }
            `}
          >
            {isSpinning ? (
              <>
                <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span>Spinning...</span>
              </>
            ) : (
              <>
                <span className="text-2xl">🎡</span>
                <span>Spin the Wheel</span>
              </>
            )}
          </button>
        ) : (
          <div className="space-y-2">
            {/* Action Buttons for After Spin */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={logVibeToTracker}
                className="flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                <Heart className="w-4 h-4" />
                <span>Log Vibe</span>
              </button>
              
              {showCommunityPrompt && (
                <button
                  onClick={shareVibeWithCommunity}
                  className="flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-teal-700 transition-all duration-200"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              )}
            </div>
            
            {/* Reset Button */}
            <button
              onClick={resetWheel}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Spin Again</span>
            </button>
          </div>
        )}
      </div>

      {/* Community Prompt */}
      {selectedVibe && showCommunityPrompt && (
        <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <p className="text-center text-sm text-yellow-800">
            <span className="font-medium">Feeling this vibe?</span> Share it with the community! 🌟
          </p>
        </div>
      )}

      {/* Fun Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-purple-600">🎡</div>
            <div className="text-xs text-gray-600">Daily Spin</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">+1</div>
            <div className="text-xs text-gray-600">Engagement</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">✨</div>
            <div className="text-xs text-gray-600">Universe Vibe</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VibeWheel;