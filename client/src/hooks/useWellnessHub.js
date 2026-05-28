import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useServerAuth } from '../context/ServerAuthContext';
import {
  PHASES,
  PHASE_DESCRIPTIONS,
  HORMONE_INFO,
  NUTRITION,
  FITNESS,
  MINDSET,
  SELF_CARE,
  PHASE_BOOSTS,
  NUTRIENTS_BY_PHASE,
} from '../data/wellnessHubData';
import {
  getTodayKey,
  storageKey,
  getCurrentPhase,
  getDaysUntilNextPeriod,
  buildCycleRingSegments,
  syncPhaseBonusToStorage,
} from '../utils/wellnessHub';

export default function useWellnessHub() {
  const { user } = useServerAuth();
  const today = getTodayKey();

  const [cycleData, setCycleData] = useState({});
  const [wellnessLog, setWellnessLog] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [showCycleSetup, setShowCycleSetup] = useState(true);
  const [cycleLen, setCycleLen] = useState(28);
  const [periodLen, setPeriodLen] = useState(5);
  const [lastPeriodDate, setLastPeriodDate] = useState('');

  const currentPhase = useMemo(() => getCurrentPhase(cycleData), [cycleData]);
  const daysUntilPeriod = useMemo(() => getDaysUntilNextPeriod(cycleData), [cycleData]);
  const todayLog = wellnessLog[today] || {};

  const loadData = useCallback(() => {
    if (!user) return;
    try {
      const cycle = JSON.parse(localStorage.getItem(storageKey(user, 'cycle')) || '{}');
      const log = JSON.parse(localStorage.getItem(storageKey(user, 'log')) || '{}');
      setCycleData(cycle);
      setWellnessLog(log);
      if (cycle.lastPeriod) {
        setLastPeriodDate(cycle.lastPeriod);
        setCycleLen(cycle.cycleLen || 28);
        setPeriodLen(cycle.periodLen || 5);
        setShowCycleSetup(false);
        const phase = getCurrentPhase(cycle);
        if (phase) syncPhaseBonusToStorage(user, phase.phase);
      }
    } catch {
      setCycleData({});
      setWellnessLog({});
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const persistCycle = useCallback(
    (data) => {
      if (!user) return;
      localStorage.setItem(storageKey(user, 'cycle'), JSON.stringify(data));
      setCycleData(data);
      const phase = getCurrentPhase(data);
      if (phase) syncPhaseBonusToStorage(user, phase.phase);
    },
    [user]
  );

  const persistLog = useCallback(
    (log) => {
      if (!user) return;
      localStorage.setItem(storageKey(user, 'log'), JSON.stringify(log));
      setWellnessLog(log);
    },
    [user]
  );

  const updateTodayLog = useCallback(
    (patch) => {
      const next = { ...wellnessLog, [today]: { ...todayLog, ...patch } };
      persistLog(next);
      return next;
    },
    [wellnessLog, today, todayLog, persistLog]
  );

  const saveCycleData = useCallback(() => {
    if (!lastPeriodDate) {
      toast.error('Please select your last period start date');
      return;
    }
    const data = { lastPeriod: lastPeriodDate, cycleLen, periodLen };
    persistCycle(data);
    setShowCycleSetup(false);
    toast.success('Cycle saved! Your insights are ready 🌸');
  }, [lastPeriodDate, cycleLen, periodLen, persistCycle]);

  const openCycleSetup = useCallback(() => setShowCycleSetup(true), []);

  const logMood = useCallback(
    (moodId) => {
      const moods = todayLog.moods || [];
      const nextMoods = moods.includes(moodId)
        ? moods.filter((m) => m !== moodId)
        : [...moods, moodId];
      updateTodayLog({ moods: nextMoods });
    },
    [todayLog, updateTodayLog]
  );

  const toggleSymptom = useCallback(
    (symptomLabel) => {
      const symptoms = todayLog.symptoms || [];
      const next = symptoms.includes(symptomLabel)
        ? symptoms.filter((s) => s !== symptomLabel)
        : [...symptoms, symptomLabel];
      updateTodayLog({ symptoms: next });
    },
    [todayLog, updateTodayLog]
  );

  const saveSymptoms = useCallback(() => {
    toast.success("Daily log saved 💕");
  }, []);

  const toggleSelfCare = useCallback(
    (idx) => {
      const selfCare = todayLog.selfCare || [];
      const next = selfCare.includes(idx)
        ? selfCare.filter((i) => i !== idx)
        : [...selfCare, idx];
      updateTodayLog({ selfCare: next });
    },
    [todayLog, updateTodayLog]
  );

  const greeting = useMemo(() => {
    const name = user?.name?.split(' ')[0] || 'there';
    return `Hello, ${name} 💕 Your Wellness Hub`;
  }, [user]);

  const quickStats = useMemo(() => {
    const allLogs = Object.keys(wellnessLog).length;
    const selfCareDone = (todayLog.selfCare || []).length;
    const moodCount = (todayLog.moods || []).length;
    return [
      { icon: '📅', val: allLogs, label: 'Days Logged' },
      { icon: '✅', val: selfCareDone, label: 'Self-Care Done' },
      { icon: '😊', val: moodCount, label: 'Moods Logged' },
      { icon: '🌸', val: currentPhase ? currentPhase.day : '—', label: 'Cycle Day' },
    ];
  }, [wellnessLog, todayLog, currentPhase]);

  const upcomingPhases = useMemo(() => {
    if (!cycleData.lastPeriod) return [];
    const start = new Date(cycleData.lastPeriod);
    const len = cycleData.cycleLen || 28;
    const pLen = cycleData.periodLen || 5;
    const upcoming = [];
    for (let i = 0; i < 3; i++) {
      const cs = new Date(start);
      cs.setDate(cs.getDate() + i * len);
      upcoming.push({ phase: 'menstrual', date: new Date(cs), len: pLen });
      const f = new Date(cs);
      f.setDate(f.getDate() + pLen);
      upcoming.push({ phase: 'follicular', date: f, len: 8 });
      const o = new Date(cs);
      o.setDate(o.getDate() + pLen + 8);
      upcoming.push({ phase: 'ovulation', date: o, len: 3 });
      const l = new Date(cs);
      l.setDate(l.getDate() + pLen + 11);
      upcoming.push({ phase: 'luteal', date: l, len: len - pLen - 11 });
    }
    return upcoming.filter((u) => u.date >= new Date()).slice(0, 8);
  }, [cycleData]);

  const logHistory = useMemo(() => {
    return Object.entries(wellnessLog)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 7);
  }, [wellnessLog]);

  const activePhaseKey = currentPhase?.phase || 'follicular';

  return {
    user,
    today,
    activeTab,
    setActiveTab,
    cycleData,
    cycleLen,
    setCycleLen,
    periodLen,
    setPeriodLen,
    lastPeriodDate,
    setLastPeriodDate,
    showCycleSetup,
    currentPhase,
    daysUntilPeriod,
    todayLog,
    greeting,
    quickStats,
    upcomingPhases,
    logHistory,
    activePhaseKey,
    saveCycleData,
    openCycleSetup,
    logMood,
    toggleSymptom,
    saveSymptoms,
    toggleSelfCare,
    stepCycle: (d) => setCycleLen((v) => Math.max(21, Math.min(40, v + d))),
    stepPeriod: (d) => setPeriodLen((v) => Math.max(2, Math.min(10, v + d))),
    PHASES,
    PHASE_DESCRIPTIONS,
    HORMONE_INFO,
    NUTRITION,
    FITNESS,
    MINDSET,
    SELF_CARE,
    PHASE_BOOSTS,
    NUTRIENTS_BY_PHASE,
    buildCycleRingSegments,
  };
}
