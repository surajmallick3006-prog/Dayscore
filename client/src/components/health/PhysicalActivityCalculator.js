import React, { useEffect, useMemo, useState } from 'react';
import { EXERCISE_LIST } from '../../data/physicalActivityExercises';
import { calculateCaloriesBurned } from '../../utils/physicalActivityCalc';

const WEIGHT_STORAGE_KEY = 'dayscore_physical_weight';

const PhysicalActivityCalculator = ({ onLogActivity }) => {
  const [selectedExercise, setSelectedExercise] = useState('running');
  const [weight, setWeight] = useState('');
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    const saved = localStorage.getItem(WEIGHT_STORAGE_KEY);
    if (saved) setWeight(saved);
  }, []);

  useEffect(() => {
    if (weight) {
      localStorage.setItem(WEIGHT_STORAGE_KEY, weight);
    }
  }, [weight]);

  const weightKg = parseFloat(weight) || 0;
  const durationMin = parseInt(duration, 10) || 0;

  const result = useMemo(
    () => calculateCaloriesBurned(selectedExercise, weightKg, durationMin),
    [selectedExercise, weightKg, durationMin]
  );

  const canLog = weightKg > 0 && durationMin > 0 && selectedExercise;

  const handleLog = () => {
    if (!canLog || !onLogActivity) return;
    const exercise = EXERCISE_LIST.find((e) => e.id === selectedExercise);
    onLogActivity({
      exerciseId: selectedExercise,
      exerciseName: exercise?.name,
      met: result.met,
      intensity: result.intensity,
      duration: durationMin,
      calories: result.calories,
      weightKg,
    });
  };

  return (
    <div className="physical-activity-modal">
      <div className="physical-header">
        <div className="physical-header-left">
          <div className="physical-icon">🏋️</div>
          <div>
            <div className="physical-title">Physical Activity</div>
            <div className="physical-subtitle">Calorie burn & MET-based workout analysis</div>
          </div>
        </div>
      </div>

      <div className="physical-content">
        <div className="activity-summary">
          <div className="calorie-circle">
            <div className="calorie-value" id="caloriesBurned">
              {result.calories}
            </div>
            <div className="calorie-unit">kcal</div>
          </div>

          <div className="summary-info">
            <div className="summary-item">
              <div className="summary-value" id="metValue">
                {result.met ?? '—'}
              </div>
              <div className="summary-label">MET Value</div>
            </div>
            <div className="summary-item">
              <div className="summary-value" id="durationValue">
                {result.durationLabel}
              </div>
              <div className="summary-label">Duration</div>
            </div>
            <div className="summary-item">
              <div className="summary-value" id="intensityValue">
                {result.intensity}
              </div>
              <div className="summary-label">Intensity</div>
            </div>
          </div>
        </div>

        <div className="weight-box">
          <span className="weight-label">Your weight (for calorie calc):</span>
          <div className="weight-input-wrap">
            <input
              type="number"
              id="weightInput"
              className="weight-input"
              placeholder="kg"
              min="1"
              max="300"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <span className="weight-unit">kg</span>
          </div>
        </div>

        <div className="duration-box">
          <span className="duration-label">Workout duration:</span>
          <div className="duration-input-wrap">
            <input
              type="number"
              id="durationInput"
              className="duration-input"
              placeholder="min"
              min="1"
              max="300"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <span className="duration-unit">min</span>
          </div>
        </div>

        <div className="exercise-title">
          <span>EXERCISE TYPE</span>
        </div>

        <div className="exercise-grid">
          {EXERCISE_LIST.map((ex) => (
            <button
              key={ex.id}
              type="button"
              className={`exercise-card ${selectedExercise === ex.id ? 'active' : ''}`}
              data-exercise={ex.id}
              onClick={() => setSelectedExercise(ex.id)}
            >
              <div className="exercise-emoji">{ex.icon}</div>
              <div className="exercise-name">{ex.name}</div>
              <div className="exercise-met">MET {ex.met}</div>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="physical-log-btn"
          disabled={!canLog}
          onClick={handleLog}
        >
          💾 Log Activity & Save to Health
        </button>
      </div>
    </div>
  );
};

export default PhysicalActivityCalculator;
