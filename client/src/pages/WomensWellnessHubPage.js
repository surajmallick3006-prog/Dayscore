import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useWellnessHub from '../hooks/useWellnessHub';
import CycleRing from '../components/wellness/CycleRing';
import { intensityClass } from '../utils/wellnessHub';
import { MOOD_OPTIONS, SYMPTOM_OPTIONS } from '../data/wellnessHubData';
import '../styles/womens-wellness-hub.css';

const TABS = [
  { id: 'overview', label: '🌸 Overview' },
  { id: 'cycle', label: '🔄 Cycle Tracker' },
  { id: 'nutrition', label: '🥗 Nutrition' },
  { id: 'fitness', label: '🏃 Fitness' },
  { id: 'mindset', label: '🧠 Mindset' },
  { id: 'log', label: '📓 Daily Log' },
];

const WomensWellnessHubPage = () => {
  const hub = useWellnessHub();
  const {
    activeTab,
    setActiveTab,
    cycleData,
    cycleLen,
    periodLen,
    lastPeriodDate,
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
    stepCycle,
    stepPeriod,
    setLastPeriodDate,
    PHASES,
    PHASE_DESCRIPTIONS,
    HORMONE_INFO,
    NUTRITION,
    FITNESS,
    MINDSET,
    SELF_CARE,
    PHASE_BOOSTS,
    NUTRIENTS_BY_PHASE,
  } = hub;

  const phase = activePhaseKey;
  const p = PHASES[phase];
  const hasCycle = Boolean(cycleData.lastPeriod);

  const heroBadge = currentPhase ? (
    <div
      className="phase-hero-badge"
      style={{ background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.4)' }}
    >
      <div className="phb-phase">
        {PHASES[currentPhase.phase].emoji} {PHASES[currentPhase.phase].name} Phase
      </div>
      <div className="phb-day">
        Day {currentPhase.day} of {cycleLen} · {daysUntilPeriod} days to next period
      </div>
      <div className="phb-hormone">{PHASES[currentPhase.phase].hormone}</div>
    </div>
  ) : null;

  const goToCycleTab = () => setActiveTab('cycle');

  return (
    <div className="wellness-hub">
      <div className="wellness-hero">
        <div className="wellness-hero-bg" />
        <div className="wellness-hero-inner">
          <div className="wellness-hero-left">
            <Link
              to="/app/dashboard"
              className="inline-flex items-center gap-1 text-sm text-white/90 hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <div className="wellness-hero-tag">🌸 Women&apos;s Wellness Hub</div>
            <h1 className="wellness-hero-title">{greeting}</h1>
            <p className="wellness-hero-desc">
              Science-backed cycle tracking, phase-based productivity insights, and daily wellness
              guidance — all in one place.
            </p>
          </div>
          <div className="wellness-hero-right">{heroBadge}</div>
        </div>
      </div>

      <div className="wellness-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`wtab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="wellness-body">
          <div className="wellness-left">
            <div className="wcard">
              <div className="wcard-title">🌙 Current Cycle Phase</div>
              {!hasCycle ? (
                <div className="setup-prompt">
                  <div className="setup-icon">🌸</div>
                  <p>
                    Set up your cycle tracker to unlock personalized insights based on your
                    hormonal phases.
                  </p>
                  <button type="button" className="btn-wellness-save" onClick={goToCycleTab}>
                    Set Up Cycle Tracker →
                  </button>
                </div>
              ) : (
                <CycleRing
                  cycleLen={cycleLen}
                  periodLen={periodLen}
                  currentPhase={currentPhase.phase}
                  day={currentPhase.day}
                  daysLeft={daysUntilPeriod}
                />
              )}
            </div>

            <div className="wcard">
              <div className="wcard-title">📅 Upcoming Phases</div>
              {!hasCycle ? (
                <div className="wellness-empty">Set up your cycle to see upcoming phases.</div>
              ) : (
                upcomingPhases.map((u, i) => {
                  const ph = PHASES[u.phase];
                  const isNow = currentPhase?.phase === u.phase;
                  return (
                    <div
                      key={`${u.phase}-${i}`}
                      className={`phase-cal-item ${isNow ? 'phase-cal-active' : ''}`}
                      style={{ borderLeft: `3px solid ${ph.color}` }}
                    >
                      <div className="phase-cal-emoji">{ph.emoji}</div>
                      <div>
                        <div className="phase-cal-name">
                          {ph.name} {isNow && <span className="now-badge">NOW</span>}
                        </div>
                        <div className="phase-cal-date">
                          {u.date.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          · {u.len} days
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="wellness-right">
            <div
              className="wcard phase-today-card"
              style={
                hasCycle
                  ? {
                      background: `linear-gradient(135deg,${p.light},#fff)`,
                      borderColor: p.color,
                    }
                  : undefined
              }
            >
              <div className="wcard-title">✨ Today&apos;s Phase Insights</div>
              {!hasCycle ? (
                <div className="wellness-empty">
                  Set up your cycle tracker to see today&apos;s insights.
                </div>
              ) : (
                <>
                  <div className="phase-today-big">{p.emoji}</div>
                  <div className="phase-today-name" style={{ color: p.color }}>
                    {p.name} Phase
                  </div>
                  <div className="phase-today-desc">{PHASE_DESCRIPTIONS[currentPhase.phase]}</div>
                  <div className="phase-today-stats">
                    <div className="pts-stat">
                      <div className="pts-stat-val">{p.energy}</div>
                      <div className="pts-stat-label">Energy</div>
                    </div>
                    <div className="pts-stat">
                      <div className="pts-stat-val">{p.focus}</div>
                      <div className="pts-stat-label">Focus</div>
                    </div>
                    <div className="pts-stat">
                      <div className="pts-stat-val">{p.days}</div>
                      <div className="pts-stat-label">Typical</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="wcard">
              <div className="wcard-title">🔬 What&apos;s Happening Hormonally</div>
              {!hasCycle ? (
                <div className="wellness-empty">Set up your cycle to see hormonal insights.</div>
              ) : (
                <>
                  <div className="hormone-tags">
                    {HORMONE_INFO[currentPhase.phase].hormones.map((hm) => (
                      <span
                        key={hm}
                        className="hormone-tag"
                        style={{ borderColor: p.color, color: p.color }}
                      >
                        {hm}
                      </span>
                    ))}
                  </div>
                  <p className="hormone-effect">{HORMONE_INFO[currentPhase.phase].effect}</p>
                </>
              )}
            </div>

            <div className="wcard">
              <div className="wcard-title">📊 Wellness Overview</div>
              <div className="wellness-quick-stats">
                {quickStats.map((s) => (
                  <div key={s.label} className="wqs-card">
                    <div className="wqs-icon">{s.icon}</div>
                    <div className="wqs-val">{s.val}</div>
                    <div className="wqs-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cycle' && (
        <div className="wellness-body">
          <div className="wellness-left">
            <div className="wcard">
              <div className="wcard-title">⚙️ Cycle Settings</div>
              {showCycleSetup ? (
                <div className="cycle-setup">
                  <div className="info-box info-blue">
                    <strong>ℹ️ About Cycle Tracking</strong>
                    <br />
                    The average menstrual cycle is 21–35 days. Tracking helps you understand your
                    body&apos;s natural rhythms and optimize your daily productivity accordingly.
                  </div>
                  <div className="wform-group">
                    <label htmlFor="lastPeriodDate">First Day of Last Period</label>
                    <input
                      type="date"
                      id="lastPeriodDate"
                      value={lastPeriodDate}
                      onChange={(e) => setLastPeriodDate(e.target.value)}
                    />
                    <span className="field-hint">This is Day 1 of your cycle</span>
                  </div>
                  <div className="wform-group">
                    <label>Average Cycle Length</label>
                    <div className="stepper-row">
                      <div className="stepper">
                        <button type="button" onClick={() => stepCycle(-1)}>
                          −
                        </button>
                        <span>{cycleLen}</span>
                        <button type="button" onClick={() => stepCycle(1)}>
                          +
                        </button>
                      </div>
                      <span className="stepper-unit">days (typical: 21–35)</span>
                    </div>
                  </div>
                  <div className="wform-group">
                    <label>Average Period Duration</label>
                    <div className="stepper-row">
                      <div className="stepper">
                        <button type="button" onClick={() => stepPeriod(-1)}>
                          −
                        </button>
                        <span>{periodLen}</span>
                        <button type="button" onClick={() => stepPeriod(1)}>
                          +
                        </button>
                      </div>
                      <span className="stepper-unit">days (typical: 3–7)</span>
                    </div>
                  </div>
                  <button type="button" className="btn-wellness-save" onClick={saveCycleData}>
                    💾 Save & Start Tracking
                  </button>
                </div>
              ) : (
                <button type="button" className="btn-wellness-outline" onClick={openCycleSetup}>
                  ✏️ Edit Cycle Settings
                </button>
              )}
            </div>

            <div className="wcard">
              <div className="wcard-title">📖 Understanding Your Phases</div>
              <div className="phase-explainer">
                {[
                  { key: 'menstrual', border: '#ef4444', title: 'Menstrual Phase (Days 1–5)', emoji: '🌑' },
                  { key: 'follicular', border: '#f59e0b', title: 'Follicular Phase (Days 6–13)', emoji: '🌒' },
                  { key: 'ovulation', border: '#10b981', title: 'Ovulation Phase (Days 14–16)', emoji: '🌕' },
                  { key: 'luteal', border: '#8b5cf6', title: 'Luteal Phase (Days 17–28)', emoji: '🌘' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="phase-exp-item"
                    style={{ borderLeft: `4px solid ${item.border}` }}
                  >
                    <div className="phase-exp-header">
                      <span>{item.emoji}</span>
                      <strong>{item.title}</strong>
                    </div>
                    <p>{PHASE_DESCRIPTIONS[item.key]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="wellness-right">
            <div className="wcard">
              <div className="wcard-title">📈 Cycle Phase Info</div>
              {!hasCycle ? (
                <div className="wellness-empty">Save your cycle settings to see phase details.</div>
              ) : (
                <>
                  <div
                    style={{
                      background: p.light,
                      border: `1px solid ${p.color}`,
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: 6 }}>{p.emoji}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: p.color }}>
                      {p.name} Phase
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--wh-text-muted)', marginTop: 4 }}>
                      Day {currentPhase.day} · {daysUntilPeriod} days until next period
                    </div>
                  </div>
                  {[
                    { label: 'Cycle Day', val: `${currentPhase.day} of ${cycleLen}` },
                    { label: 'Phase', val: `${p.name} (${p.days})` },
                    { label: 'Dominant Hormone', val: p.hormone },
                    { label: 'Energy Level', val: p.energy },
                    { label: 'Focus Level', val: p.focus },
                    { label: 'Next Period', val: `In ${daysUntilPeriod} days` },
                  ].map((row) => (
                    <div key={row.label} className="phase-info-row">
                      <span className="phase-info-label">{row.label}</span>
                      <span className="phase-info-val" style={{ color: p.color }}>
                        {row.val}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="wcard">
              <div className="wcard-title">⭐ DayScore Wellness Bonus</div>
              {!hasCycle ? (
                <div className="wellness-empty">Set up your cycle to see your wellness bonus.</div>
              ) : (
                <>
                  <div
                    className="wellness-boost-badge"
                    style={{ background: p.light, border: `1px solid ${p.color}` }}
                  >
                    <div className="boost-val" style={{ color: p.color }}>
                      +{PHASE_BOOSTS[currentPhase.phase].boost}
                    </div>
                    <div>
                      <div className="boost-label">{p.name} Phase Bonus</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--wh-text-muted)' }}>
                        Added to your DayScore
                      </div>
                    </div>
                  </div>
                  <p className="boost-reason">{PHASE_BOOSTS[currentPhase.phase].reason}</p>
                  <div className="boost-tip">
                    💡 This bonus is automatically applied when you generate your AI Report on the
                    main dashboard.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'nutrition' && (
        <div className="wellness-body">
          <div className="wellness-left">
            <div className="wcard">
              <div className="wcard-title">🥗 Phase-Based Nutrition Guide</div>
              <div
                className="info-box"
                style={{ background: p.light, borderColor: p.color, marginBottom: 16 }}
              >
                <strong>
                  {p.emoji} {p.name} Phase Focus:
                </strong>{' '}
                {NUTRITION[phase].focus}
              </div>
              {NUTRITION[phase].foods.map((f) => (
                <div key={f.item} className="nutrition-item">
                  <div className="nutrition-item-name">{f.item}</div>
                  <div className="nutrition-item-detail">{f.detail}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="wellness-right">
            <div className="wcard">
              <div className="wcard-title">💊 Key Nutrients This Phase</div>
              <div className="info-box info-blue">
                Based on your current {p.name} phase, focus on these key nutrients for optimal
                hormonal health and productivity.
              </div>
              {NUTRIENTS_BY_PHASE[phase].map((n) => (
                <div key={n.name} className="nutrient-item">
                  <div className="nutrient-name">{n.name}</div>
                  <div className="nutrient-why">{n.why}</div>
                  <div className="nutrient-sources">Sources: {n.sources}</div>
                </div>
              ))}
            </div>
            <div className="wcard">
              <div className="wcard-title">🚫 Foods to Limit This Phase</div>
              {NUTRITION[phase].avoid.map((a) => (
                <div key={a} className="avoid-item">
                  {a}
                </div>
              ))}
            </div>
            <div className="wcard">
              <div className="wcard-title">💧 Hydration Guide</div>
              <div className="hydration-text">{NUTRITION[phase].hydration}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fitness' && (
        <div className="wellness-body">
          <div className="wellness-left">
            <div className="wcard">
              <div className="wcard-title">🏃 Phase-Based Exercise Guide</div>
              <div
                className="info-box"
                style={{ background: p.light, borderColor: p.color, marginBottom: 16 }}
              >
                <strong>
                  {p.emoji} {p.name} Phase:
                </strong>{' '}
                {FITNESS[phase].overview}
              </div>
            </div>
          </div>
          <div className="wellness-right">
            <div className="wcard">
              <div className="wcard-title">💪 Recommended Workouts</div>
              {FITNESS[phase].workouts.map((w) => (
                <div key={w.type} className="workout-item">
                  <div className="workout-type">{w.type}</div>
                  <div className={`workout-intensity ${intensityClass(w.intensity)}`}>
                    {w.intensity}
                  </div>
                  <div className="workout-benefit">{w.benefit}</div>
                </div>
              ))}
            </div>
            <div className="wcard">
              <div className="wcard-title">⚡ Energy & Recovery Tips</div>
              <div className="recovery-text">{FITNESS[phase].recovery}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'mindset' && (
        <div className="wellness-body">
          <div className="wellness-left">
            <div className="wcard">
              <div className="wcard-title">🧠 Mental Wellness This Phase</div>
              <div
                className="info-box"
                style={{ background: p.light, borderColor: p.color, marginBottom: 16 }}
              >
                {MINDSET[phase].overview}
              </div>
            </div>
            <div className="wcard">
              <div className="wcard-title">🧘 Recommended Practices</div>
              {MINDSET[phase].practices.map((pr) => (
                <div key={pr} className="wellness-tip">
                  {pr}
                </div>
              ))}
            </div>
          </div>
          <div className="wellness-right">
            <div className="wcard">
              <div className="wcard-title">💡 Productivity Strategy</div>
              <div className="info-box info-blue">{MINDSET[phase].productivity}</div>
            </div>
            <div className="wcard">
              <div className="wcard-title">💬 Affirmations for This Phase</div>
              {MINDSET[phase].affirmations.map((a) => (
                <div key={a} className="affirmation-item">
                  {a}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'log' && (
        <div className="wellness-body">
          <div className="wellness-left">
            <div className="wcard">
              <div className="wcard-title">😊 Mood Log</div>
              <p className="cycle-intro">How are you feeling today? Select all that apply.</p>
              <div className="mood-log-grid">
                {MOOD_OPTIONS.map((m) => (
                  <div
                    key={m.id}
                    role="button"
                    tabIndex={0}
                    className={`mood-log-item ${(todayLog.moods || []).includes(m.id) ? 'active' : ''}`}
                    onClick={() => logMood(m.id)}
                    onKeyDown={(e) => e.key === 'Enter' && logMood(m.id)}
                  >
                    <span>{m.emoji}</span>
                    <div>{m.label}</div>
                  </div>
                ))}
              </div>
              {(todayLog.moods || []).length > 0 && (
                <div className="mood-log-note">✓ Logged: {(todayLog.moods || []).join(', ')}</div>
              )}
            </div>

            <div className="wcard">
              <div className="wcard-title">📝 Physical Symptoms</div>
              <p className="cycle-intro">Log any symptoms you&apos;re experiencing today.</p>
              <div className="symptom-tags">
                {SYMPTOM_OPTIONS.map((sym) => {
                  const label = sym.replace(/^\S+\s/, '');
                  return (
                    <span
                      key={sym}
                      role="button"
                      tabIndex={0}
                      className={`sym-tag ${(todayLog.symptoms || []).includes(label) ? 'active' : ''}`}
                      onClick={() => toggleSymptom(label)}
                      onKeyDown={(e) => e.key === 'Enter' && toggleSymptom(label)}
                    >
                      {sym}
                    </span>
                  );
                })}
              </div>
              <button
                type="button"
                className="btn-wellness-save"
                style={{ marginTop: 16 }}
                onClick={saveSymptoms}
              >
                💾 Save Today&apos;s Log
              </button>
            </div>
          </div>

          <div className="wellness-right">
            <div className="wcard">
              <div className="wcard-title">✅ Self-Care Checklist</div>
              {!hasCycle ? (
                <div className="wellness-empty">
                  Set up your cycle to see personalized self-care tasks.
                </div>
              ) : (
                SELF_CARE[currentPhase.phase].map((item, i) => {
                  const done = (todayLog.selfCare || []).includes(i);
                  return (
                    <div
                      key={item}
                      role="button"
                      tabIndex={0}
                      className={`selfcare-item ${done ? 'done' : ''}`}
                      onClick={() => toggleSelfCare(i)}
                      onKeyDown={(e) => e.key === 'Enter' && toggleSelfCare(i)}
                    >
                      <div className={`selfcare-check ${done ? 'checked' : ''}`} />
                      <span>{item}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="wcard">
              <div className="wcard-title">📊 Log History (Last 7 Days)</div>
              {logHistory.length === 0 ? (
                <div className="wellness-empty">No logs yet. Start logging today!</div>
              ) : (
                logHistory.map(([date, log]) => {
                  const d = new Date(`${date}T00:00:00`);
                  const moods = (log.moods || []).slice(0, 3).join(', ');
                  const symptoms = (log.symptoms || []).length;
                  const selfCare = (log.selfCare || []).length;
                  return (
                    <div key={date} className="log-history-item">
                      <div className="log-history-date">
                        {d.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="log-history-detail">
                        {moods && <span>😊 {moods}</span>}
                        {symptoms > 0 && <span>📝 {symptoms} symptoms</span>}
                        {selfCare > 0 && <span>✅ {selfCare} self-care</span>}
                        {!moods && !symptoms && !selfCare && (
                          <span style={{ color: 'var(--wh-text-light)' }}>No details logged</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="wcard">
              <div className="wcard-title">⚠️ When to See a Doctor</div>
              <p className="doctor-intro">
                Track patterns over time. Consult a healthcare provider if you experience:
              </p>
              <ul className="doctor-list">
                <li>Periods lasting more than 7 days or very heavy bleeding</li>
                <li>Cycles shorter than 21 days or longer than 35 days consistently</li>
                <li>Severe pain that disrupts daily activities (may indicate endometriosis)</li>
                <li>Missed periods for 3+ months (not due to pregnancy)</li>
                <li>Extreme mood changes that affect relationships or work</li>
                <li>Unusual discharge, odor, or itching</li>
              </ul>
              <div className="info-box info-pink">
                🩺 This app provides wellness guidance only and is not a substitute for medical
                advice.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WomensWellnessHubPage;
