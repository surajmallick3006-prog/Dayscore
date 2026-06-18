// ══════════════════════════════════════════════════════════════════════════
// DayScore — Community Feature
// Depends on: tasks[], habits[], history[], TODAY, SESSION_KEY,
//             calcScore(), GRADES, showToast(), esc() from app.js
// ══════════════════════════════════════════════════════════════════════════

// ── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_USERS = [
  { name:'Arjun Sharma',   score:94, streak:12, tasks:8, badge:'🚀', role:'Elite',    color:'#6366f1', city:'Mumbai',    avatar:'A' },
  { name:'Priya Patel',    score:91, streak:8,  tasks:7, badge:'⚡', role:'Champion', color:'#ec4899', city:'Delhi',     avatar:'P' },
  { name:'Rahul Verma',    score:88, streak:15, tasks:6, badge:'🏆', role:'Champion', color:'#10b981', city:'Bangalore', avatar:'R' },
  { name:'Sneha Gupta',    score:85, streak:6,  tasks:9, badge:'🌟', role:'Achiever', color:'#f59e0b', city:'Hyderabad', avatar:'S' },
  { name:'Amit Kumar',     score:82, streak:9,  tasks:8, badge:'💪', role:'Achiever', color:'#8b5cf6', city:'Chennai',   avatar:'A' },
  { name:'Neha Singh',     score:79, streak:4,  tasks:5, badge:'🎯', role:'Explorer', color:'#06b6d4', city:'Pune',      avatar:'N' },
  { name:'Vikram Joshi',   score:76, streak:11, tasks:7, badge:'🔥', role:'Explorer', color:'#f97316', city:'Kolkata',   avatar:'V' },
  { name:'Kavya Reddy',    score:73, streak:3,  tasks:6, badge:'📈', role:'Explorer', color:'#ef4444', city:'Ahmedabad', avatar:'K' },
  { name:'Rohan Mehta',    score:70, streak:7,  tasks:5, badge:'✅', role:'Beginner', color:'#14b8a6', city:'Jaipur',    avatar:'R' },
  { name:'Ananya Iyer',    score:67, streak:2,  tasks:4, badge:'🌱', role:'Beginner', color:'#a855f7', city:'Lucknow',   avatar:'A' },
  { name:'Karan Malhotra', score:65, streak:5,  tasks:5, badge:'🌱', role:'Beginner', color:'#0ea5e9', city:'Surat',     avatar:'K' },
  { name:'Divya Nair',     score:62, streak:1,  tasks:4, badge:'🌱', role:'Beginner', color:'#d946ef', city:'Nagpur',    avatar:'D' },
];

const FEED_POSTS_DEFAULT = [
  { id:1, user:'Arjun Sharma', color:'#6366f1', tag:'win',        text:'Just hit 94/100 today! Consistency is everything 🚀',                                       time:'2m ago',  likes:24, comments:5,  liked:false },
  { id:2, user:'Priya Patel',  color:'#ec4899', tag:'motivation', text:'Day 8 streak! Discipline beats motivation every time 🔥',                                   time:'18m ago', likes:31, comments:8,  liked:false },
  { id:3, user:'Rahul Verma',  color:'#10b981', tag:'tip',        text:'Pro tip: Log water every hour. Went from 3 to 8 glasses just by tracking 💧',               time:'45m ago', likes:19, comments:3,  liked:false },
  { id:4, user:'Sneha Gupta',  color:'#f59e0b', tag:'win',        text:'Unlocked the Perfect Day badge! Sleep 8h, 8 glasses, all tasks done 🏆',                    time:'1h ago',  likes:42, comments:12, liked:false },
  { id:5, user:'Amit Kumar',   color:'#8b5cf6', tag:'question',   text:'How do you handle low-energy days? Struggling to stay productive when tired 🤔',             time:'2h ago',  likes:8,  comments:15, liked:false },
  { id:6, user:'Neha Singh',   color:'#06b6d4', tag:'tip',        text:'Started Cold Shower habit 4 days ago. Energy levels noticeably higher! 🚿',                 time:'3h ago',  likes:27, comments:6,  liked:false },
];

const CHALLENGES = [
  { id:1, title:'7-Day Hydration Challenge',    icon:'💧', desc:'Drink 8 glasses of water every day for 7 days.',    reward:'+50 XP',  participants:1284, days:7,  progress:3, joined:false, difficulty:'Easy',   color:'#06b6d4' },
  { id:2, title:'Perfect Week Challenge',        icon:'🏆', desc:'Score 75+ every single day for 7 consecutive days.',reward:'+100 XP', participants:876,  days:7,  progress:2, joined:true,  difficulty:'Hard',   color:'#f59e0b' },
  { id:3, title:'Early Bird Challenge',          icon:'🌅', desc:'Wake up before 7 AM and log your day for 5 days.',  reward:'+40 XP',  participants:654,  days:5,  progress:0, joined:false, difficulty:'Medium', color:'#8b5cf6' },
  { id:4, title:'No Screen After 9PM',           icon:'📵', desc:'Log screen time under 1h after 9 PM for 5 days.',   reward:'+35 XP',  participants:432,  days:5,  progress:1, joined:false, difficulty:'Medium', color:'#ef4444' },
  { id:5, title:'30-Day Consistency Challenge',  icon:'🔥', desc:'Track your productivity every day for 30 days.',    reward:'+200 XP', participants:2341, days:30, progress:0, joined:false, difficulty:'Epic',   color:'#6366f1' },
  { id:6, title:'Sleep Optimization Week',       icon:'😴', desc:'Sleep 7.5+ hours every night for 7 days.',          reward:'+60 XP',  participants:987,  days:7,  progress:4, joined:true,  difficulty:'Medium', color:'#a855f7' },
];

// ── State ──────────────────────────────────────────────────────────────────
let lbMode = 'today';
let communityPosts = [...FEED_POSTS_DEFAULT];
let selectedPostTag = 'win';
let memberSearchQuery = '';
let memberSortMode = 'score';

// ── Tab Navigation ─────────────────────────────────────────────────────────
window.switchCommunityTab = function(tab, btn) {
  document.querySelectorAll('.cstab-content').forEach(e => e.classList.remove('active'));
  document.querySelectorAll('.cstab').forEach(e => e.classList.remove('active'));
  document.getElementById('cstab-' + tab).classList.add('active');
  if (btn) btn.classList.add('active');
  if (tab === 'challenges') renderChallenges();
  if (tab === 'feed')       renderFeed();
  if (tab === 'members')    renderMembers();
};

window.switchLeaderboard = function(mode, btn) {
  lbMode = mode;
  document.querySelectorAll('.lb-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderLeaderboard();
};

// ── Helpers ────────────────────────────────────────────────────────────────
function buildLeaderboardUsers() {
  const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  const myName  = session?.name || 'You';
  const { total } = calcScore();
  const all = [...MOCK_USERS];
  all.push({ name:myName, score:total||0, streak:calcMyStreak(), tasks:tasks.filter(t=>t.completed).length, badge:'⭐', role:'You', color:'#6366f1', avatar:myName.charAt(0).toUpperCase(), isMe:true });
  return all.sort((a, b) => b.score - a.score);
}

function calcMyStreak() {
  let s = 0; const d = new Date();
  while (true) {
    const k = d.toLocaleDateString('en-CA');
    if (history[k]?.score > 0 || k === TODAY) { s++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return s;
}

// ── Main Render ────────────────────────────────────────────────────────────
function renderCommunity() {
  const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  const myName  = session?.name || 'You';
  const { total } = calcScore();
  const myScore   = total || 0;
  const myStreak  = calcMyStreak();
  const allUsers  = buildLeaderboardUsers();
  const myRank    = allUsers.findIndex(u => u.isMe) + 1;
  const totalMembers = allUsers.length + 2847;

  document.getElementById('communityHeroStats').innerHTML = `
    <div class="ch-stat"><div class="ch-stat-val">${totalMembers.toLocaleString()}</div><div class="ch-stat-label">Members</div></div>
    <div class="ch-stat"><div class="ch-stat-val">${CHALLENGES.length}</div><div class="ch-stat-label">Challenges</div></div>
    <div class="ch-stat"><div class="ch-stat-val">#${myRank}</div><div class="ch-stat-label">Your Rank</div></div>
    <div class="ch-stat"><div class="ch-stat-val">${myStreak}</div><div class="ch-stat-label">Your Streak</div></div>`;

  const prev = myRank > 1 ? allUsers[myRank - 2] : null;
  const next = myRank < allUsers.length ? allUsers[myRank] : null;
  document.getElementById('yourRankBanner').innerHTML = `
    <div class="yrb-left">
      <div class="yrb-avatar" style="background:linear-gradient(135deg,var(--accent),var(--purple))">${myName.charAt(0).toUpperCase()}</div>
      <div class="yrb-info">
        <div class="yrb-name">${myName} <span class="yrb-you">You</span></div>
        <div class="yrb-score">${myScore} pts · 🔥 ${myStreak} day streak</div>
      </div>
    </div>
    <div class="yrb-rank">#${myRank}</div>
    <div class="yrb-right">
      ${prev ? `<div class="yrb-gap">🎯 <strong>${prev.score - myScore} pts</strong> to beat ${prev.name.split(' ')[0]}</div>` : '<div class="yrb-gap">🏆 You\'re #1!</div>'}
      ${next ? `<div class="yrb-gap" style="color:var(--success)">✅ <strong>${myScore - next.score} pts</strong> ahead of ${next.name.split(' ')[0]}</div>` : ''}
    </div>`;

  renderLeaderboard(allUsers);
  renderScoreComparison(allUsers, myScore, myRank);
  renderTrendingHabits();
  renderSharePreview(myName, myScore, myRank);
  renderFeed();
  renderTopContributors();
  renderCommunityTips();
  renderMembers();

  const pca = document.getElementById('postComposerAvatar');
  if (pca) { pca.textContent = myName.charAt(0).toUpperCase(); pca.style.background = 'linear-gradient(135deg,var(--accent),var(--purple))'; }
}

// ── Leaderboard ────────────────────────────────────────────────────────────
function renderLeaderboard(users) {
  const allUsers = users || buildLeaderboardUsers();
  const el = document.getElementById('leaderboard'); if (!el) return;
  const adjusted = allUsers.map(u => {
    let s = u.score;
    if (lbMode === 'week')    s = Math.min(100, Math.round(u.score * 0.95 + (u.isMe ? 0 : Math.random() * 5)));
    if (lbMode === 'alltime') s = Math.min(100, Math.round(u.score * 0.9  + (u.isMe ? 0 : Math.random() * 8)));
    return { ...u, displayScore: s };
  }).sort((a, b) => b.displayScore - a.displayScore);

  el.innerHTML = adjusted.slice(0, 10).map((u, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
    return `<div class="lb-row ${u.isMe ? 'lb-me' : ''}">
      <div class="lb-rank-col">${medal ? `<span class="lb-medal">${medal}</span>` : `<span class="lb-num">${i + 1}</span>`}</div>
      <div class="lb-avatar" style="background:${u.color}">${u.avatar}</div>
      <div class="lb-info">
        <div class="lb-name">${u.name}${u.isMe ? ' <span class="lb-you-tag">You</span>' : ''}</div>
        <div class="lb-meta">🔥 ${u.streak}d · ${u.tasks || 0} tasks · ${u.badge || ''} ${u.role || ''}</div>
        <div class="lb-bar-wrap"><div class="lb-bar" style="width:${u.displayScore}%;background:${u.color}"></div></div>
      </div>
      <div class="lb-score-col"><div class="lb-score">${u.displayScore}</div><div class="lb-score-label">pts</div></div>
    </div>`;
  }).join('');
}

// ── Score Comparison ───────────────────────────────────────────────────────
function renderScoreComparison(allUsers, myScore, myRank) {
  const el = document.getElementById('scoreComparison'); if (!el) return;
  const scores  = allUsers.map(u => u.score);
  const avg     = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const top10   = [...scores].sort((a, b) => b - a)[Math.floor(scores.length * 0.1)];
  const pctBeat = Math.round(((allUsers.length - myRank) / allUsers.length) * 100);
  el.innerHTML = `
    <div class="sc-row"><span class="sc-label">Your Score</span><span class="sc-val" style="color:var(--accent)">${myScore}</span></div>
    <div class="sc-row"><span class="sc-label">Community Avg</span><span class="sc-val">${avg}</span></div>
    <div class="sc-row"><span class="sc-label">Top 10%</span><span class="sc-val">${top10}+</span></div>
    <div class="sc-row"><span class="sc-label">You beat</span><span class="sc-val" style="color:var(--success)">${pctBeat}%</span></div>
    <div class="sc-bar-wrap">
      <div class="sc-bar-track">
        <div class="sc-bar-fill" style="width:${myScore}%;background:linear-gradient(90deg,var(--accent),var(--purple))"></div>
        <div class="sc-bar-avg" style="left:${avg}%"></div>
      </div>
      <div class="sc-bar-labels"><span>0</span><span>Avg ${avg}</span><span>100</span></div>
    </div>`;
}

// ── Challenges ─────────────────────────────────────────────────────────────
function renderChallenges() {
  const el = document.getElementById('challengesGrid'); if (!el) return;
  const diffColor = { Easy:'#10b981', Medium:'#f59e0b', Hard:'#ef4444', Epic:'#8b5cf6' };
  el.innerHTML = CHALLENGES.map(c => {
    const pct = Math.round((c.progress / c.days) * 100);
    return `<div class="challenge-card ${c.joined ? 'challenge-joined' : ''}">
      <div class="challenge-header" style="background:linear-gradient(135deg,${c.color}22,${c.color}11);border-bottom:2px solid ${c.color}">
        <div class="challenge-icon">${c.icon}</div>
        <div class="challenge-meta">
          <span class="challenge-diff" style="background:${diffColor[c.difficulty]}22;color:${diffColor[c.difficulty]}">${c.difficulty}</span>
          <span class="challenge-days">📅 ${c.days} days</span>
        </div>
      </div>
      <div class="challenge-body">
        <div class="challenge-title">${c.title}</div>
        <div class="challenge-desc">${c.desc}</div>
        <div class="challenge-stats"><span>👥 ${c.participants.toLocaleString()} joined</span><span class="challenge-reward" style="color:${c.color}">${c.reward}</span></div>
        ${c.joined
          ? `<div class="challenge-progress-wrap">
               <div class="challenge-progress-label">Progress: ${c.progress}/${c.days} days</div>
               <div class="challenge-progress-track"><div class="challenge-progress-fill" style="width:${pct}%;background:${c.color}"></div></div>
             </div>
             <button class="challenge-btn challenge-btn-joined" onclick="leaveChallenge(${c.id})">✓ Joined · Leave</button>`
          : `<button class="challenge-btn" style="background:linear-gradient(135deg,${c.color},${c.color}cc)" onclick="joinChallenge(${c.id})">Join Challenge →</button>`
        }
      </div>
    </div>`;
  }).join('');
}

window.joinChallenge  = function(id) { const c = CHALLENGES.find(c => c.id === id); if (c) { c.joined = true;  c.participants++; renderChallenges(); showToast('Joined "' + c.title + '" 🎯'); } };
window.leaveChallenge = function(id) { const c = CHALLENGES.find(c => c.id === id); if (c) { c.joined = false; c.participants--; renderChallenges(); showToast('Left challenge'); } };

// ── Community Feed ─────────────────────────────────────────────────────────
function renderFeed() {
  const el = document.getElementById('communityFeed'); if (!el) return;
  const tagColors = { win:'#10b981', tip:'#6366f1', motivation:'#f59e0b', question:'#ef4444' };
  const tagLabels = { win:'🏆 Win', tip:'💡 Tip', motivation:'🔥 Motivation', question:'❓ Question' };
  el.innerHTML = communityPosts.map(p => `
    <div class="feed-post">
      <div class="feed-post-header">
        <div class="feed-avatar" style="background:${p.color}">${p.user.charAt(0)}</div>
        <div class="feed-post-meta"><div class="feed-post-name">${p.user}</div><div class="feed-post-time">${p.time}</div></div>
        <span class="feed-post-tag" style="background:${tagColors[p.tag]}22;color:${tagColors[p.tag]}">${tagLabels[p.tag]}</span>
      </div>
      <div class="feed-post-text">${esc(p.text)}</div>
      <div class="feed-post-actions">
        <button class="feed-action-btn ${p.liked ? 'liked' : ''}" onclick="likePost(${p.id})">${p.liked ? '❤️' : '🤍'} ${p.likes}</button>
        <button class="feed-action-btn" onclick="showToast('Comments coming soon! 💬')">💬 ${p.comments}</button>
      </div>
    </div>`).join('');
}

window.likePost = function(id) {
  const p = communityPosts.find(p => p.id === id);
  if (p) { p.liked = !p.liked; p.likes += p.liked ? 1 : -1; renderFeed(); }
};

window.selectPostTag = function(btn) {
  document.querySelectorAll('.post-tag-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedPostTag = btn.dataset.tag;
};

window.submitPost = function() {
  const input = document.getElementById('postInput');
  const text  = input.value.trim();
  if (!text) { showToast('Write something first!'); return; }
  const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  communityPosts.unshift({ id:Date.now(), user:session?.name||'You', color:'#6366f1', tag:selectedPostTag, text, time:'Just now', likes:0, comments:0, liked:false });
  input.value = '';
  renderFeed();
  showToast('Posted to community! 🎉');
};

// ── Sidebar Widgets ────────────────────────────────────────────────────────
function renderTopContributors() {
  const el = document.getElementById('topContributors'); if (!el) return;
  el.innerHTML = MOCK_USERS.slice(0, 5).map((u, i) => `
    <div class="top-contrib-item">
      <div class="tc-rank">${i + 1}</div>
      <div class="tc-avatar" style="background:${u.color}">${u.avatar}</div>
      <div class="tc-info"><div class="tc-name">${u.name}</div><div class="tc-posts">${u.badge} ${u.role}</div></div>
      <div class="tc-score">${u.score}</div>
    </div>`).join('');
}

function renderCommunityTips() {
  const el = document.getElementById('communityTips'); if (!el) return;
  const tips = [
    '💡 Users who track sleep score 23% higher on average',
    '💧 Hydrated users complete 40% more tasks',
    '🔥 Streaks of 7+ days correlate with 15pt score boost',
    '🏃 Exercise days show 18% better focus scores',
  ];
  el.innerHTML = tips.map(t => `<div class="comm-tip">${t}</div>`).join('');
}

function renderTrendingHabits() {
  const el = document.getElementById('trendingHabits'); if (!el) return;
  const t = [
    { name:'Morning Walk',   count:3241, icon:'🚶', growth:'+12%' },
    { name:'Daily Reading',  count:2876, icon:'📚', growth:'+8%'  },
    { name:'Meditation',     count:2543, icon:'🧘', growth:'+15%' },
    { name:'No Sugar',       count:1987, icon:'🚫', growth:'+5%'  },
    { name:'Journaling',     count:1654, icon:'📓', growth:'+22%' },
  ];
  el.innerHTML = t.map((h, i) => `
    <div class="trending-item">
      <div class="trending-rank">#${i + 1}</div>
      <span class="trending-icon">${h.icon}</span>
      <div class="trending-info"><div class="trending-name">${h.name}</div><div class="trending-count">${h.count.toLocaleString()} users</div></div>
      <span class="trending-growth">${h.growth}</span>
    </div>`).join('');
}

function renderSharePreview(name, score, rank) {
  const el = document.getElementById('sharePreview'); if (!el) return;
  const grade = GRADES.find(g => score >= g.min);
  el.innerHTML = `
    <div class="share-card">
      <div class="share-card-header"><div class="share-logo">☀️ DayScore</div><div class="share-date">${new Date().toLocaleDateString('en-US', { month:'short', day:'numeric' })}</div></div>
      <div class="share-score" style="color:${grade?.color || '#6366f1'}">${score}</div>
      <div class="share-grade">${grade?.label || '—'}</div>
      <div class="share-name">${name}</div>
      <div class="share-rank">Rank #${rank} · ${calcMyStreak()} day streak 🔥</div>
    </div>`;
}

window.shareScore = function() {
  const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  const name    = session?.name || 'DayScore User';
  const { total } = calcScore();
  const grade = GRADES.find(g => total >= g.min);
  const text  = '☀️ DayScore Daily Report\n👤 ' + name + '\n🎯 Score: ' + total + '/100 — ' + (grade?.label || '') +
                '\n🔥 Streak: ' + calcMyStreak() + ' days\n📅 ' + new Date().toLocaleDateString() +
                '\n\nTrack your productivity at DayScore!';
  navigator.clipboard.writeText(text).then(() => showToast('Score card copied! 📋'));
};

// ── Members Directory ──────────────────────────────────────────────────────
function renderMembers() {
  const el = document.getElementById('membersGrid'); if (!el) return;
  const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  const myName  = session?.name || 'You';
  const { total } = calcScore();
  let all = [
    ...MOCK_USERS,
    { name:myName, score:total||0, streak:calcMyStreak(), badge:'⭐', role:'You', color:'#6366f1', city:'Your City', avatar:myName.charAt(0).toUpperCase(), isMe:true },
  ];
  if (memberSearchQuery) all = all.filter(u => u.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) || u.city?.toLowerCase().includes(memberSearchQuery.toLowerCase()));
  if (memberSortMode === 'streak') all.sort((a, b) => b.streak - a.streak);
  else if (memberSortMode === 'name') all.sort((a, b) => a.name.localeCompare(b.name));
  else all.sort((a, b) => b.score - a.score);

  el.innerHTML = all.map(u => {
    const rc = u.score >= 85 ? '#10b981' : u.score >= 70 ? '#6366f1' : u.score >= 50 ? '#f59e0b' : '#94a3b8';
    return `<div class="member-card ${u.isMe ? 'member-card-me' : ''}">
      <div class="member-avatar" style="background:${u.color}">${u.avatar || u.name.charAt(0)}</div>
      <div class="member-name">${u.name}${u.isMe ? ' (You)' : ''}</div>
      <div class="member-role">${u.badge || ''} ${u.role || ''}</div>
      <div class="member-city">📍 ${u.city || '—'}</div>
      <div class="member-stats">
        <div class="ms-item"><span class="ms-val" style="color:${rc}">${u.score}</span><span class="ms-label">Score</span></div>
        <div class="ms-item"><span class="ms-val">${u.streak}</span><span class="ms-label">Streak</span></div>
      </div>
    </div>`;
  }).join('');
}

window.filterMembers = function(q) { memberSearchQuery = q; renderMembers(); };
window.sortMembers   = function(s) { memberSortMode = s;    renderMembers(); };
