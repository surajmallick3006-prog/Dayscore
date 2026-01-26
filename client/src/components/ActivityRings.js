import React from 'react';

const ActivityRings = ({ healthData }) => {
  const steps = healthData?.activity?.steps || 0;
  const activeMinutes = healthData?.activity?.activeMinutes || 0;
  
  const stepsGoal = 10000;
  const activeGoal = 60; // minutes
  
  const stepsProgress = Math.min((steps / stepsGoal) * 100, 100);
  const activeProgress = Math.min((activeMinutes / activeGoal) * 100, 100);

  const createRing = (progress, color, size = 60) => {
    const radius = size / 2 - 4;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="4"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
    );
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Progress</h3>
      
      <div className="space-y-4">
        {/* Steps Ring */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            {createRing(stepsProgress, '#10b981')}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-900">
                {Math.round(stepsProgress)}%
              </span>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">Steps</div>
            <div className="text-xs text-gray-500">
              {steps.toLocaleString()} / {stepsGoal.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Active Minutes Ring */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            {createRing(activeProgress, '#8b5cf6')}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-900">
                {Math.round(activeProgress)}%
              </span>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">Active Minutes</div>
            <div className="text-xs text-gray-500">
              {activeMinutes} / {activeGoal} min
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityRings;