import { PHASE_BOOSTS } from '../data/wellnessHubData';

export const getTodayKey = () => new Date().toLocaleDateString('en-CA');

export const getUserId = (user) => user?.id || user?._id || 'guest';

export const storageKey = (user, key) => `dayscore_wellness_${getUserId(user)}_${key}`;

export function getCurrentPhase(cycleData) {
  if (!cycleData?.lastPeriod) return null;

  const start = new Date(cycleData.lastPeriod);
  const today = new Date();
  const elapsed = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  const cycleLen = cycleData.cycleLen || 28;
  const periodLen = cycleData.periodLen || 5;
  const dayOfCycle = (elapsed % cycleLen) + 1;

  if (dayOfCycle <= periodLen) return { phase: 'menstrual', day: dayOfCycle };
  if (dayOfCycle <= periodLen + 8) return { phase: 'follicular', day: dayOfCycle };
  if (dayOfCycle <= periodLen + 11) return { phase: 'ovulation', day: dayOfCycle };
  return { phase: 'luteal', day: dayOfCycle };
}

export function getDaysUntilNextPeriod(cycleData) {
  if (!cycleData?.lastPeriod) return null;

  const start = new Date(cycleData.lastPeriod);
  const today = new Date();
  const elapsed = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  const cycleLen = cycleData.cycleLen || 28;
  return cycleLen - (elapsed % cycleLen);
}

export function buildCycleRingSegments(cycleLen, periodLen) {
  return [
    { phase: 'menstrual', start: 0, len: periodLen },
    { phase: 'follicular', start: periodLen, len: 8 },
    { phase: 'ovulation', start: periodLen + 8, len: 3 },
    { phase: 'luteal', start: periodLen + 11, len: cycleLen - (periodLen + 11) },
  ];
}

export function intensityClass(intensity) {
  return `intensity-${intensity.toLowerCase().replace(/[^a-z]/g, '-')}`;
}

export function syncPhaseBonusToStorage(user, phase) {
  if (!phase || !user) return;
  const bonus = PHASE_BOOSTS[phase];
  if (!bonus) return;

  localStorage.setItem(
    storageKey(user, 'phaseBonus'),
    JSON.stringify({
      phase,
      boost: bonus.boost,
      date: getTodayKey(),
    })
  );
}

export function getPhaseBonusFromStorage(user) {
  try {
    const raw = localStorage.getItem(storageKey(user, 'phaseBonus'));
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.date === getTodayKey()) return data;
    return null;
  } catch {
    return null;
  }
}
