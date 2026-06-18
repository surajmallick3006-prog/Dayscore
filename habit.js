// ══════════════════════════════════════════════════════════════════════════
// DayScore — Habits Feature
// Depends on: habits[], TODAY, saveHabits(), showToast(), esc() from app.js
// ══════════════════════════════════════════════════════════════════════════

const CAT_META = {
  health:      { icon:'🏃', color:'#10b981', bg:'#d1fae5' },
  mind:        { icon:'🧠', color:'#8b5cf6', bg:'#ede9fe' },
  productivity:{ icon:'💼', color:'#6366f1', bg:'#e0e7ff' },
  wellness:    { icon:'🌿', color:'#06b6d4', bg:'#cffafe' },
  social:      { icon:'👥', color:'#f59e0b', bg:'#fef3c7' },
  finance:     { icon:'💰', color:'#f97316', bg:'#ffedd5' },
};

let habitFilter = 'all';

// ── CRUD ───────────────────────────────────────────────────────────────────
window.addHabit = function() {
  const name = document.getElementById('habitName').value.trim();
  if (!name) return;
  habits.push({
    id: Date.now(),
    name,
    cat:    document.getElementById('habitCat').value,
    freq:   document.getElementById('habitFreq').value,
    time:   document.getElementById('habitTime').value,
    target: parseInt(document.getElementById('habitTarget').value) || 0,
    streak: 0,
    completedDates: [],
    createdAt: new Date().toISOString(),
  });
  saveHabits();
  renderHabits();
  document.getElementById('habitName').value = '';
};

window.toggleHabit = function(id) {
  const h = habits.find(h => h.id === id);
  if (!h) return;
  const idx = h.completedDates.indexOf(TODAY);
  if (idx === -1) { h.completedDates.push(TODAY); h.streak = calcStreak(h.completedDates); }
  else            { h.completedDates.splice(idx, 1); h.streak = calcStreak(h.completedDates); }
  saveHabits();
  renderHabits();
};

window.deleteHabit = function(id) {
  habits = habits.filter(h => h.id !== id);
  saveHabits();
  renderHabits();
};

function calcStreak(dates) {
  let s = 0;
  const d = new Date();
  while (true) {
    const k = d.toLocaleDateString('en-CA');
    if (dates.includes(k)) { s++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return s;
}

// ── Tab / Filter Navigation ────────────────────────────────────────────────
window.switchHabitTab = function(tab, btn) {
  document.querySelectorAll('.hstab-content').forEach(e => e.classList.remove('active'));
  document.querySelectorAll('.hstab').forEach(e => e.classList.remove('active'));
  document.getElementById('hstab-' + tab).classList.add('active');
  if (btn) btn.classList.add('active');
  if (tab === 'heatmap')   renderHeatmap();
  if (tab === 'analytics') renderHabitAnalytics();
  if (tab === 'library')   renderHabitLibrary();
};

window.filterHabitList = function(filter, btn) {
  habitFilter = filter;
  document.querySelectorAll('.habit-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderHabitList();
};

// ── Main render entry ──────────────────────────────────────────────────────
function renderHabits() {
  renderHabitsHero();
  renderHabitList();
  renderHabitTodayProgress();
  renderHabitStreakLeader();
  renderHabitSmartTip();
}

// ── Hero Stats ─────────────────────────────────────────────────────────────
function renderHabitsHero() {
  const el = document.getElementById('habitsHeroStats');
  if (!el) return;
  const total = habits.length;
  const doneToday  = habits.filter(h => h.completedDates.includes(TODAY)).length;
  const bestStreak = habits.length ? Math.max(...habits.map(h => h.streak || 0)) : 0;
  const totalChecks = habits.reduce((s, h) => s + h.completedDates.length, 0);
  const pct = total ? Math.round((doneToday / total) * 100) : 0;
  el.innerHTML = `
    <div class="hh-stat"><div class="hh-val">${total}</div><div class="hh-label">Habits</div></div>
    <div class="hh-stat"><div class="hh-val">${doneToday}/${total}</div><div class="hh-label">Done Today</div></div>
    <div class="hh-stat"><div class="hh-val">${pct}%</div><div class="hh-label">Completion</div></div>
    <div class="hh-stat"><div class="hh-val">${bestStreak}🔥</div><div class="hh-label">Best Streak</div></div>
    <div class="hh-stat"><div class="hh-val">${totalChecks}</div><div class="hh-label">Total Check-ins</div></div>`;
}

// ── Habit List ─────────────────────────────────────────────────────────────
function renderHabitList() {
  const list = document.getElementById('habitList');
  if (!list) return;
  const filterRow = document.getElementById('habitFilterRow');
  if (filterRow && !filterRow.innerHTML) {
    const cats = ['all', ...new Set(habits.map(h => h.cat || 'health'))];
    filterRow.innerHTML = cats.map(c =>
      `<button class="habit-filter-btn ${c === habitFilter ? 'active' : ''}" onclick="filterHabitList('${c}',this)">
        ${c === 'all' ? 'All' : (CAT_META[c]?.icon || '') + ' ' + c.charAt(0).toUpperCase() + c.slice(1)}
      </button>`
    ).join('');
  }
  let filtered = habits;
  if (habitFilter !== 'all') filtered = habits.filter(h => (h.cat || 'health') === habitFilter);
  if (!filtered.length) { list.innerHTML = '<div class="empty-state">No habits yet — add one above</div>'; return; }

  list.innerHTML = filtered.map(h => {
    const done = h.completedDates.includes(TODAY);
    const cat = h.cat || 'health', meta = CAT_META[cat] || CAT_META.health;
    const totalDone = h.completedDates.length;
    const days = Math.max(1, h.createdAt ? Math.floor((Date.now() - new Date(h.createdAt)) / (1000 * 60 * 60 * 24)) : totalDone);
    const rate = Math.round((totalDone / days) * 100);
    const timeLabel = h.time ? { morning:'🌅 Morning', afternoon:'☀️ Afternoon', evening:'🌙 Evening', anytime:'⏰ Anytime' }[h.time] : '';
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.toLocaleDateString('en-CA');
      last7.push({ date: d.toLocaleDateString('en-US', { weekday:'short' }), done: h.completedDates.includes(k) });
    }
    return `<div class="habit-card ${done ? 'habit-done' : ''}">
      <div class="habit-card-left"><div class="habit-cat-icon" style="background:${meta.bg};color:${meta.color}">${meta.icon}</div></div>
      <div class="habit-card-body">
        <div class="habit-card-top">
          <div class="habit-card-name">${esc(h.name)}</div>
          <div class="habit-card-check ${done ? 'checked' : ''}" onclick="toggleHabit(${h.id})">${done ? '✓' : ''}</div>
        </div>
        <div class="habit-card-meta">
          <span class="habit-tag" style="background:${meta.bg};color:${meta.color}">${meta.icon} ${cat}</span>
          <span class="habit-freq-tag">${h.freq || 'daily'}</span>
          ${timeLabel ? `<span class="habit-time-tag">${timeLabel}</span>` : ''}
          ${h.target ? `<span class="habit-target-tag">🎯 ${h.target}m</span>` : ''}
        </div>
        <div class="habit-card-stats">
          <span class="hcs-streak">🔥 ${h.streak || 0} day streak</span>
          <span class="hcs-rate">📊 ${rate}% rate</span>
          <span class="hcs-total">✅ ${totalDone} total</span>
        </div>
        <div class="habit-mini-calendar">
          ${last7.map(d => `<div class="hmc-day ${d.done ? 'hmc-done' : ''}" title="${d.date}">${d.done ? '✓' : ''}</div>`).join('')}
          <span class="hmc-label">Last 7 days</span>
        </div>
      </div>
      <button class="del-btn" onclick="deleteHabit(${h.id})">✕</button>
    </div>`;
  }).join('');
}

// ── Today's Progress Ring ──────────────────────────────────────────────────
function renderHabitTodayProgress() {
  const el = document.getElementById('habitTodayProgress');
  if (!el || !habits.length) { if (el) el.innerHTML = '<div class="wellness-empty">Add habits to track progress</div>'; return; }
  const done = habits.filter(h => h.completedDates.includes(TODAY)).length, total = habits.length;
  const pct = Math.round((done / total) * 100);
  const color = pct === 100 ? '#10b981' : pct >= 60 ? '#6366f1' : '#f59e0b';
  el.innerHTML = `
    <div class="htp-ring-wrap">
      <svg viewBox="0 0 80 80" style="width:80px;height:80px">
        <circle cx="40" cy="40" r="32" fill="none" stroke="#f1f3f9" stroke-width="7"/>
        <circle cx="40" cy="40" r="32" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round"
          stroke-dasharray="201" stroke-dashoffset="${201 - (pct / 100) * 201}"
          transform="rotate(-90 40 40)" style="transition:stroke-dashoffset .8s ease"/>
      </svg>
      <div class="htp-ring-center"><div class="htp-pct" style="color:${color}">${pct}%</div></div>
    </div>
    <div class="htp-info">
      <div class="htp-count">${done} / ${total} done</div>
      <div class="htp-label">${pct === 100 ? '🎉 All complete!' : pct >= 60 ? '💪 Great progress!' : '🌱 Keep going!'}</div>
    </div>
    <div class="htp-list">${habits.map(h => {
      const d = h.completedDates.includes(TODAY);
      const m = CAT_META[h.cat || 'health'] || CAT_META.health;
      return `<div class="htp-item ${d ? 'done' : ''}" onclick="toggleHabit(${h.id})">
        <span>${m.icon}</span><span class="htp-name">${esc(h.name)}</span><span class="htp-check">${d ? '✅' : '⬜'}</span>
      </div>`;
    }).join('')}</div>`;
}

// ── Top Streaks Sidebar ────────────────────────────────────────────────────
function renderHabitStreakLeader() {
  const el = document.getElementById('habitStreakLeader');
  if (!el) return;
  if (!habits.length) { el.innerHTML = '<div class="wellness-empty">No habits yet</div>'; return; }
  const sorted = [...habits].sort((a, b) => (b.streak || 0) - (a.streak || 0)).slice(0, 5);
  el.innerHTML = sorted.map((h, i) => {
    const m = CAT_META[h.cat || 'health'] || CAT_META.health;
    return `<div class="hsl-item">
      <div class="hsl-rank">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#' + (i + 1)}</div>
      <div class="hsl-icon" style="background:${m.bg};color:${m.color}">${m.icon}</div>
      <div class="hsl-info"><div class="hsl-name">${esc(h.name)}</div><div class="hsl-streak">🔥 ${h.streak || 0} days</div></div>
    </div>`;
  }).join('');
}

// ── Smart Coaching Tip ─────────────────────────────────────────────────────
function renderHabitSmartTip() {
  const el = document.getElementById('habitSmartTip');
  if (!el) return;
  const done = habits.filter(h => h.completedDates.includes(TODAY)).length, total = habits.length;
  const bestStreak = habits.length ? Math.max(...habits.map(h => h.streak || 0)) : 0;
  const weakest = [...habits].sort((a, b) => (a.streak || 0) - (b.streak || 0))[0];
  let tip = '';
  if (!total)              tip = '🌱 Start by adding 1–3 habits. Small consistent actions build lasting change.';
  else if (done === total) tip = '🎉 All habits done today! You\'re building real discipline. Keep the streak alive tomorrow.';
  else if (bestStreak >= 7) tip = `🔥 ${bestStreak}-day streak! You're in the habit-building zone. Research shows 66 days to form a habit.`;
  else if (weakest)        tip = `💡 "${weakest.name}" needs attention (${weakest.streak || 0} day streak). Try habit stacking — attach it to an existing routine.`;
  else                     tip = '⏰ Set a specific time for each habit. "I will [habit] at [time] in [location]" increases success by 91%.';
  el.innerHTML = `<div class="habit-smart-tip">${tip}</div>`;
}

// ── Heatmap ────────────────────────────────────────────────────────────────
window.renderHeatmap = function() {
  const select = document.getElementById('heatmapHabitSelect');
  const wrap   = document.getElementById('heatmapWrap');
  const months = document.getElementById('heatmapMonths');
  if (!select || !wrap) return;
  if (!habits.length) { wrap.innerHTML = '<div class="wellness-empty">Add habits to see your heatmap</div>'; return; }
  if (!select.innerHTML) select.innerHTML = habits.map(h => `<option value="${h.id}">${esc(h.name)}</option>`).join('');
  const habit = habits.find(h => h.id === parseInt(select.value)) || habits[0];
  if (!habit) return;
  const today = new Date(), cells = [];
  for (let i = 111; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('en-CA');
    cells.push({ key, date: d, done: habit.completedDates.includes(key) });
  }
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  wrap.innerHTML = `<div class="heatmap-grid">${weeks.map(week =>
    `<div class="hm-week">${week.map(c =>
      `<div class="hm-cell ${c.done ? 'hm-done' : ''}" title="${c.date.toLocaleDateString('en-US', { month:'short', day:'numeric' })}${c.done ? ' ✓' : ''}"></div>`
    ).join('')}</div>`
  ).join('')}</div>`;
  const monthsSeen = new Set();
  if (months) months.innerHTML = `<div class="hm-months-row">${weeks.map(week => {
    const m = week[0].date.toLocaleDateString('en-US', { month:'short' });
    if (!monthsSeen.has(m)) { monthsSeen.add(m); return `<div class="hm-month-label">${m}</div>`; }
    return '<div class="hm-month-label"></div>';
  }).join('')}</div>`;
};

// ── Analytics ──────────────────────────────────────────────────────────────
function renderHabitAnalytics() { renderHabitPerformance(); renderHabitWeeklyChart(); renderHabitAchievements(); renderHabitAIInsights(); }

function renderHabitPerformance() {
  const el = document.getElementById('habitPerformance');
  if (!el || !habits.length) { if (el) el.innerHTML = '<div class="wellness-empty">No habits to analyze</div>'; return; }
  el.innerHTML = habits.map(h => {
    const total = h.completedDates.length;
    const days  = Math.max(1, h.createdAt ? Math.floor((Date.now() - new Date(h.createdAt)) / (1000 * 60 * 60 * 24)) : total);
    const rate  = Math.round((total / days) * 100);
    const m = CAT_META[h.cat || 'health'] || CAT_META.health;
    const color = rate >= 80 ? '#10b981' : rate >= 50 ? '#6366f1' : '#f59e0b';
    return `<div class="hp-row">
      <div class="hp-icon" style="background:${m.bg};color:${m.color}">${m.icon}</div>
      <div class="hp-info">
        <div class="hp-name">${esc(h.name)}</div>
        <div class="hp-meta">🔥 ${h.streak || 0} streak · ✅ ${total} total · ${days} days tracked</div>
        <div class="hp-bar-wrap"><div class="hp-bar" style="width:${rate}%;background:${color}"></div></div>
      </div>
      <div class="hp-rate" style="color:${color}">${rate}%</div>
    </div>`;
  }).join('');
}

function renderHabitWeeklyChart() {
  const el = document.getElementById('habitWeeklyChart'); if (!el) return;
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], today = new Date();
  const dayData = days.map((label, i) => {
    const d = new Date(today); const diff = (today.getDay() || 7) - (i + 1); d.setDate(d.getDate() - diff);
    const key  = d.toLocaleDateString('en-CA');
    const done = habits.filter(h => h.completedDates.includes(key)).length;
    const pct  = habits.length ? Math.round((done / habits.length) * 100) : 0;
    return { label, done, pct };
  });
  const max = Math.max(...dayData.map(d => d.pct), 1);
  el.innerHTML = `<div class="hwc-bars">${dayData.map(d =>
    `<div class="hwc-col">
      <div class="hwc-val">${d.pct}%</div>
      <div class="hwc-bar-wrap"><div class="hwc-bar" style="height:${Math.max(4, (d.pct / max) * 120)}px;background:${d.pct >= 80 ? '#10b981' : d.pct >= 50 ? '#6366f1' : '#f59e0b'}"></div></div>
      <div class="hwc-label">${d.label}</div>
    </div>`
  ).join('')}</div>`;
}

function renderHabitAchievements() {
  const el = document.getElementById('habitAchievements'); if (!el) return;
  const bestStreak  = habits.length ? Math.max(...habits.map(h => h.streak || 0)) : 0;
  const totalChecks = habits.reduce((s, h) => s + h.completedDates.length, 0);
  const achievements = [
    { icon:'🌱', name:'First Habit',   desc:'Added your first habit',        unlocked: habits.length >= 1 },
    { icon:'🔥', name:'7-Day Streak',  desc:'Maintained a 7-day streak',     unlocked: bestStreak >= 7 },
    { icon:'💪', name:'30-Day Streak', desc:'Maintained a 30-day streak',    unlocked: bestStreak >= 30 },
    { icon:'✅', name:'10 Check-ins',  desc:'Completed 10 habit check-ins',  unlocked: totalChecks >= 10 },
    { icon:'🏆', name:'100 Check-ins', desc:'Completed 100 habit check-ins', unlocked: totalChecks >= 100 },
    { icon:'🎯', name:'5 Habits',      desc:'Tracking 5 or more habits',     unlocked: habits.length >= 5 },
  ];
  el.innerHTML = achievements.map(a =>
    `<div class="ha-item ${a.unlocked ? 'unlocked' : 'locked'}">
      <div class="ha-icon">${a.icon}</div>
      <div class="ha-info"><div class="ha-name">${a.name}</div><div class="ha-desc">${a.desc}</div></div>
      ${a.unlocked ? '<span class="ha-check">✓</span>' : '<span class="ha-lock">🔒</span>'}
    </div>`
  ).join('');
}

function renderHabitAIInsights() {
  const el = document.getElementById('habitAIInsights'); if (!el) return;
  const bestStreak = habits.length ? Math.max(...habits.map(h => h.streak || 0)) : 0;
  const avgRate = habits.length ? Math.round(
    habits.reduce((s, h) => s + (h.completedDates.length / Math.max(1,
      h.createdAt ? Math.floor((Date.now() - new Date(h.createdAt)) / (1000 * 60 * 60 * 24)) : h.completedDates.length
    )), 0) / habits.length * 100
  ) : 0;
  const insights = [];
  if (avgRate >= 80)      insights.push('🌟 Excellent consistency! You\'re in the top 10% of habit trackers.');
  else if (avgRate >= 60) insights.push('💪 Good consistency. Focus on your weakest habit to push above 80%.');
  else                    insights.push('🎯 Consistency needs work. Try reducing to 2–3 core habits and master those first.');
  if (bestStreak >= 21)   insights.push('🧠 21+ day streak! Neuroscience shows habits become automatic around this point.');
  if (habits.length > 7)  insights.push('⚠️ You have many habits. Research suggests focusing on 3–5 habits at a time for best results.');
  insights.push('💡 Best time to build habits: attach them to existing routines (habit stacking).');
  el.innerHTML = insights.map(i => `<div class="hai-item">${i}</div>`).join('');
}

// ── Habit Library ──────────────────────────────────────────────────────────
const HABIT_LIBRARY = [
  { name:'Morning Meditation',   cat:'mind',         icon:'🧘', time:'morning',   target:10, desc:'5–10 min mindfulness to start the day with clarity',          science:'Reduces cortisol by 23%' },
  { name:'Daily Exercise',       cat:'health',       icon:'🏃', time:'morning',   target:30, desc:'30 min of any physical activity',                             science:'Boosts mood for 12 hours' },
  { name:'Read 30 Minutes',      cat:'mind',         icon:'📚', time:'evening',   target:30, desc:'Read non-fiction or fiction daily',                            science:'Reduces stress by 68%' },
  { name:'Drink 8 Glasses',      cat:'wellness',     icon:'💧', time:'anytime',   target:0,  desc:'Stay hydrated throughout the day',                             science:'Improves focus by 14%' },
  { name:'Gratitude Journal',    cat:'wellness',     icon:'📓', time:'evening',   target:5,  desc:'Write 3 things you\'re grateful for',                          science:'Increases happiness by 25%' },
  { name:'Cold Shower',          cat:'health',       icon:'🚿', time:'morning',   target:5,  desc:'End shower with 30–60 sec cold water',                         science:'Boosts alertness & immunity' },
  { name:'No Phone Before 9am',  cat:'productivity', icon:'📵', time:'morning',   target:0,  desc:'Avoid screens for the first hour of the day',                  science:'Improves focus & reduces anxiety' },
  { name:'Sleep by 11pm',        cat:'health',       icon:'😴', time:'evening',   target:0,  desc:'Consistent sleep schedule for better recovery',                science:'Improves memory consolidation' },
  { name:'Daily Walk',           cat:'health',       icon:'🚶', time:'afternoon', target:20, desc:'20-min walk for movement and fresh air',                       science:'Reduces depression risk by 26%' },
  { name:'No Sugar Day',         cat:'wellness',     icon:'🚫', time:'anytime',   target:0,  desc:'Avoid added sugars for the day',                               science:'Stabilizes energy & mood' },
  { name:'Deep Work Block',      cat:'productivity', icon:'🎯', time:'morning',   target:90, desc:'90 min of uninterrupted focused work',                         science:'4x more productive than shallow work' },
  { name:'Evening Stretch',      cat:'health',       icon:'🤸', time:'evening',   target:10, desc:'10 min stretching before bed',                                 science:'Improves sleep quality by 30%' },
  { name:'Learn Something New',  cat:'mind',         icon:'🧠', time:'anytime',   target:20, desc:'20 min of learning a new skill daily',                         science:'Builds neuroplasticity' },
  { name:'Budget Review',        cat:'finance',      icon:'💰', time:'evening',   target:5,  desc:'5 min daily spending review',                                  science:'Reduces overspending by 40%' },
  { name:'Connect with Someone', cat:'social',       icon:'👥', time:'anytime',   target:10, desc:'Meaningful conversation with a friend or family',              science:'Increases longevity by 50%' },
  { name:'Breathwork',           cat:'wellness',     icon:'🌬️',time:'morning',   target:5,  desc:'5 min box breathing or Wim Hof method',                        science:'Activates parasympathetic nervous system' },
];

let libraryFilter = 'all';

window.filterLibrary    = function(q)        { renderLibraryGrid(HABIT_LIBRARY.filter(h => h.name.toLowerCase().includes(q.toLowerCase()) || h.cat.toLowerCase().includes(q.toLowerCase()))); };
window.filterLibraryCat = function(cat, btn) {
  libraryFilter = cat;
  document.querySelectorAll('.lib-cat-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderLibraryGrid(cat === 'all' ? HABIT_LIBRARY : HABIT_LIBRARY.filter(h => h.cat === cat));
};

function renderHabitLibrary() {
  const catsEl = document.getElementById('libraryCats');
  if (catsEl && !catsEl.innerHTML) {
    const cats = ['all', ...Object.keys(CAT_META)];
    catsEl.innerHTML = cats.map(c =>
      `<button class="lib-cat-btn ${c === libraryFilter ? 'active' : ''}" onclick="filterLibraryCat('${c}',this)">
        ${c === 'all' ? 'All' : (CAT_META[c]?.icon || '') + ' ' + c.charAt(0).toUpperCase() + c.slice(1)}
      </button>`
    ).join('');
  }
  renderLibraryGrid(HABIT_LIBRARY);
}

function renderLibraryGrid(list) {
  const el = document.getElementById('habitLibraryGrid'); if (!el) return;
  el.innerHTML = list.map(h => {
    const m = CAT_META[h.cat] || CAT_META.health;
    const added = habits.some(hab => hab.name.toLowerCase() === h.name.toLowerCase());
    return `<div class="lib-card">
      <div class="lib-card-header" style="background:linear-gradient(135deg,${m.bg},#fff)">
        <div class="lib-icon" style="color:${m.color}">${h.icon}</div>
        <div class="lib-cat-tag" style="background:${m.bg};color:${m.color}">${m.icon} ${h.cat}</div>
      </div>
      <div class="lib-card-body">
        <div class="lib-name">${h.name}</div>
        <div class="lib-desc">${h.desc}</div>
        <div class="lib-science">🔬 ${h.science}</div>
        <div class="lib-meta">${h.time ? `<span>⏰ ${h.time}</span>` : ''}${h.target ? `<span>🎯 ${h.target}m</span>` : ''}</div>
        <button class="lib-add-btn ${added ? 'lib-added' : ''}"
          onclick="addLibraryHabit('${h.name}','${h.cat}','${h.time || 'anytime'}',${h.target || 0})"
          ${added ? 'disabled' : ''}>${added ? '✓ Added' : '+ Add Habit'}</button>
      </div>
    </div>`;
  }).join('');
}

window.addLibraryHabit = function(name, cat, time, target) {
  if (habits.some(h => h.name.toLowerCase() === name.toLowerCase())) { showToast('Already in your habits!'); return; }
  habits.push({ id:Date.now(), name, cat, time, target, freq:'daily', streak:0, completedDates:[], createdAt:new Date().toISOString() });
  saveHabits(); renderHabits(); renderHabitLibrary(); showToast('"' + name + '" added! 🎯');
};

window.addCommunityHabit = function(name) {
  if (habits.find(h => h.name.toLowerCase() === name.toLowerCase())) { showToast('You already have this habit!'); return; }
  habits.push({ id:Date.now(), name, cat:'health', freq:'daily', streak:0, completedDates:[], createdAt:new Date().toISOString() });
  saveHabits(); renderHabits(); showToast('"' + name + '" added to your habits ✓');
};
