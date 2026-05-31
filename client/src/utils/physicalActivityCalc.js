import { EXERCISES } from '../data/physicalActivityExercises';

/**
 * Calories burned = MET × weight(kg) × duration(hours)
 */
export function calculateCaloriesBurned(exerciseId, weightKg, durationMinutes) {
  const exercise = EXERCISES[exerciseId];
  if (!exercise || !weightKg || !durationMinutes) {
    return {
      calories: 0,
      met: exercise?.met ?? null,
      intensity: exercise?.intensity ?? '—',
      durationLabel: `${durationMinutes || 0}m`,
    };
  }

  const calories = exercise.met * weightKg * (durationMinutes / 60);

  return {
    calories: Math.round(calories),
    met: exercise.met,
    intensity: exercise.intensity,
    durationLabel: `${durationMinutes}m`,
  };
}
