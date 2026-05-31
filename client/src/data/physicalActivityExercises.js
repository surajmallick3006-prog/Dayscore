// MET values for common exercises (calories = MET × weight(kg) × duration(hours))

export const EXERCISES = {
  running: { met: 9.8, intensity: 'High', name: 'Running', icon: '🏃' },
  gym: { met: 6.0, intensity: 'Moderate', name: 'Gym / Weights', icon: '🏋️' },
  yoga: { met: 3.0, intensity: 'Light', name: 'Yoga', icon: '🧘' },
  cycling: { met: 8.0, intensity: 'High', name: 'Cycling', icon: '🚴' },
  swimming: { met: 8.3, intensity: 'High', name: 'Swimming', icon: '🏊' },
  walking: { met: 3.5, intensity: 'Light', name: 'Walking', icon: '🚶' },
  football: { met: 7.0, intensity: 'Moderate', name: 'Football', icon: '⚽' },
  hiking: { met: 6.5, intensity: 'Moderate', name: 'Hiking', icon: '⛰️' },
  dance: { met: 5.0, intensity: 'Moderate', name: 'Dance', icon: '💃' },
};

export const EXERCISE_LIST = Object.entries(EXERCISES).map(([id, data]) => ({
  id,
  ...data,
}));
