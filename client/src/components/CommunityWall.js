import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare, Users, RefreshCw, Send, Award, Flame, Star, X, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useServerAuth } from '../context/ServerAuthContext';
import checkInService from '../services/checkInService';
import toast from 'react-hot-toast';

const DEMO_POSTS = [
  {
    id: 'demo1', userName: 'Aryan Mehta', initials: 'AM',
    gradient: 'from-blue-500 to-purple-600',
    dayScore: 87, dayScoreEmoji: '🌟', mood: 8, moodEmoji: '😊', moodLabel: 'Happy',
    thought: 'Crushed 5 tasks today and hit my study goal. Feeling unstoppable this week!',
    likes: ['u1','u2','u3','u4'], likeCount: 14,
    supportMessages: [{ id: 's1', userName: 'Priya S.', message: 'Keep it up! 🔥', timestamp: new Date(Date.now() - 3600000) }],
    supportCount: 3, timestamp: new Date(Date.now() - 1800000), badge: 'Top Scorer', streak: 7, isDemo: true
  },
  {
    id: 'demo2', userName: 'Priya Sharma', initials: 'PS',
    gradient: 'from-pink-500 to-rose-500',
    dayScore: 72, dayScoreEmoji: '💪', mood: 6, moodEmoji: '🙂', moodLabel: 'Calm',
    thought: 'Slow day but I showed up. Sometimes consistency matters more than perfection.',
    likes: ['u1','u3'], likeCount: 9, supportMessages: [], supportCount: 1,
    timestamp: new Date(Date.now() - 7200000), badge: null, streak: 4, isDemo: true
  },
  {
    id: 'demo3', userName: 'Rohan Verma', initials: 'RV',
    gradient: 'from-green-500 to-teal-500',
    dayScore: 91, dayScoreEmoji: '🏆', mood: 9, moodEmoji: '🤩', moodLabel: 'Energized',
    thought: 'New personal best! 91 DayScore. Sleep, workout, 6 tasks done. This is what peak feels like.',
    likes: ['u1','u2','u3','u4','u5'], likeCount: 21,
    supportMessages: [
      { id: 's2', userName: 'Aryan M.', message: 'Absolute beast mode 🏆', timestamp: new Date(Date.now() - 1800000) },
      { id: 's3', userName: 'Sneha K.', message: 'Goals!! 🙌', timestamp: new Date(Date.now() - 900000) }
    ],
    supportCount: 5, timestamp: new Date(Date.now() - 3600000), badge: 'On Fire', streak: 12, isDemo: true
  },
  {
    id: 'demo4', userName: 'Sneha Kulkarni', initials: 'SK',
    gradient: 'from-orange-400 to-pink-500',
    dayScore: 58, dayScoreEmoji: '🌱', mood: 4, moodEmoji: '😔', moodLabel: 'Tired',
    thought: 'Rough day. Barely slept and missed half my tasks. But I still checked in — that counts.',
    likes: ['u2','u4'], likeCount: 17, supportMessages: [
      { id: 's4', userName: 'Priya S.', message: 'Rest is productive too 💙', timestamp: new Date(Date.now() - 600000) }
    ],
    supportCount: 8, timestamp: new Date(Date.now() - 5400000), badge: null, streak: 2, isDemo: true
  }
];

const STORY_USERS = [
  { name: 'Aryan', initials: 'AM', gradient: 'from-blue-500 to-purple-600', score: 87, thought: 'Crushed 5 tasks today and hit my study goal!', moodEmoji: '😊', badge: 'Top Scorer', streak: 7 },
  { name: 'Priya', initials: 'PS', gradient: 'from-pink-500 to-rose-500', score: 72, thought: 'Slow day but I showed up. Consistency > perfection.', moodEmoji: '🙂', badge: null, streak: 4 },
  { name: 'Rohan', initials: 'RV', gradient: 'from-green-500 to-teal-500', score: 91, thought: 'New personal best! This is what peak feels like.', moodEmoji: '🤩', badge: 'On Fire', streak: 12 },
  { name: 'Sneha', initials: 'SK', gradient: 'from-orange-400 to-pink-500', score: 58, thought: 'Rough day but still checked in. That counts.', moodEmoji: '😔', badge: null, streak: 2 },
  { name: 'Karan', initials: 'KP', gradient: 'from-indigo-500 to-blue-600', score: 76, thought: 'Solid focus session today. 3 hours deep work done!', moodEmoji: '😎', badge: null, streak: 5 },
];

const getScoreColor = (s) => s >= 80 ? 'text-green-500' : s >= 65 ? 'text-blue-500' : s >= 50 ? 'text-yellow-500' : 'text-red-500';
const getScoreBg = (s) => s >= 80 ? 'bg-green-50 border-green-200 text-green-700' : s >= 65 ? 'bg-blue-50 border-blue-200 text-blue-700' : s >= 50 ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-red-50 border-red-200 text-red-600';

const formatTimeAgo = (ts) => {
  const t = ts?.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - t) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return t.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Story Viewer Modal
const StoryViewer = ({ stories, startIndex, onClose, currentUser }) => {
  const [idx, setIdx] = useState(startIndex);
  const [progress, setProgress] = useState(0);

  const story = idx === -1 ? null : stories[idx];

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => setProgress(p => {
      if (p >= 100) { handleNext(); return 0; }
      return p + 2;
    }), 100);
    return () => clearInterval(interval);
  }, [idx]);

  const handleNext = () => { if (idx < stories.length - 1) { setIdx(i => i + 1); } else { onClose(); } };
  const handlePrev = () => { if (idx > 0) setIdx(i => i - 1); };

  if (idx === -1) {
    // "Your Story" — show user's own check-in prompt
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
        <div className="relative w-80 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 text-white text-center shadow-2xl" onClick={e => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 text-4xl">
            {currentUser?.name?.charAt(0) || 'Y'}
          </div>
          <h3 className="text-xl font-bold mb-1">{currentUser?.name || 'You'}</h3>
          <p className="text-white/70 text-sm mb-6">You haven't shared your day yet</p>
          <div className="bg-white/10 rounded-2xl p-4 mb-4">
            <p className="text-sm text-white/80">Share how your day went with the community. Your score, mood, and a thought.</p>
          </div>
          <button onClick={onClose} className="w-full bg-white text-purple-600 font-semibold py-3 rounded-xl hover:bg-purple-50 transition-colors">
            Share My Day
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-80 rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex space-x-1 p-3">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div className={`h-full bg-white rounded-full transition-all duration-100 ${i < idx ? 'w-full' : i === idx ? '' : 'w-0'}`}
                style={i === idx ? { width: `${progress}%` } : {}} />
            </div>
          ))}
        </div>

        {/* Story Card */}
        <div className={`bg-gradient-to-br ${story.gradient} min-h-96 p-6 pt-10 flex flex-col`}>
          <button onClick={onClose} className="absolute top-4 right-4 z-10 text-white/70 hover:text-white"><X className="w-5 h-5" /></button>

          <div className="flex items-center space-x-3 mb-6 mt-2">
            <div className={`w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold`}>
              {story.initials}
            </div>
            <div>
              <div className="text-white font-semibold">{story.name}</div>
              <div className="flex items-center space-x-1 text-white/70 text-xs">
                <Flame className="w-3 h-3 text-orange-300" />
                <span>{story.streak} day streak</span>
              </div>
            </div>
            {story.badge && (
              <span className="ml-auto bg-white/20 text-white text-xs px-2 py-1 rounded-full font-medium">{story.badge}</span>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="bg-white/15 rounded-2xl p-5 mb-4 text-center">
              <div className="text-5xl mb-2">{story.moodEmoji}</div>
              <div className="text-white/80 text-sm mb-3">Today's DayScore</div>
              <div className={`text-5xl font-bold text-white mb-1`}>{story.score}</div>
              <div className="text-white/60 text-xs">/ 100</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white text-sm italic text-center">"{story.thought}"</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 text-white/60 text-xs">
            <span>DayScore Community</span>
            <Star className="w-3 h-3" />
          </div>
        </div>

        {/* Nav buttons */}
        {idx > 0 && (
          <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-white hover:bg-black/50">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {idx < stories.length - 1 && (
          <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-white hover:bg-black/50">
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const CommunityWall = () => {
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('recent');
  const [supportMessage, setSupportMessage] = useState('');
  const [showSupportFor, setShowSupportFor] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [storyViewer, setStoryViewer] = useState(null); // null | { index }
  const { user } = useServerAuth();

  useEffect(() => { loadCommunityCheckIns(); }, [filter]);

  const loadCommunityCheckIns = async () => {
    setLoading(true);
    try {
      const data = await checkInService.getCommunityCheckIns(20);
      let posts = data && data.length > 0 ? data : DEMO_POSTS;
      if (filter === 'trending') {
        posts = [...posts].sort((a, b) => ((b.likeCount || 0) + (b.supportCount || 0)) - ((a.likeCount || 0) + (a.supportCount || 0)));
      }
      setCheckIns(posts);
    } catch {
      setCheckIns(DEMO_POSTS);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (checkIn) => {
    if (checkIn.isDemo) {
      setLikedPosts(prev => {
        const isLiked = prev[checkIn.id];
        setCheckIns(posts => posts.map(p => p.id === checkIn.id ? { ...p, likeCount: isLiked ? p.likeCount - 1 : p.likeCount + 1 } : p));
        return { ...prev, [checkIn.id]: !isLiked };
      });
      return;
    }
    const isLiked = checkIn.likes?.includes(user?.id);
    checkInService[isLiked ? 'unlikeCheckIn' : 'likeCheckIn'](checkIn.id, user?.id).catch(() => toast.error('Failed'));
    setCheckIns(prev => prev.map(p => {
      if (p.id !== checkIn.id) return p;
      const newLikes = isLiked ? p.likes.filter(id => id !== user?.id) : [...(p.likes || []), user?.id];
      return { ...p, likes: newLikes, likeCount: newLikes.length };
    }));
  };

  const handleSendSupport = async (checkInId) => {
    if (!supportMessage.trim()) return;
    const newMsg = { id: Date.now(), userName: user?.name || 'You', message: supportMessage.trim(), timestamp: new Date() };
    setCheckIns(prev => prev.map(p => p.id === checkInId
      ? { ...p, supportCount: (p.supportCount || 0) + 1, supportMessages: [...(p.supportMessages || []), newMsg] }
      : p
    ));
    if (!checkIns.find(c => c.id === checkInId)?.isDemo) {
      checkInService.addSupportMessage(checkInId, user?.id, user?.name, supportMessage.trim()).catch(() => {});
    }
    setSupportMessage('');
    setShowSupportFor(null);
    toast.success('Support sent! 💙');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
            <div className="flex space-x-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-1/6" />
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Story Viewer */}
      {storyViewer !== null && (
        <StoryViewer
          stories={STORY_USERS}
          startIndex={storyViewer}
          onClose={() => setStoryViewer(null)}
          currentUser={user}
        />
      )}

      {/* Stories Row */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex space-x-4 overflow-x-auto pb-1">
          {/* Your Story */}
          <div className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer group" onClick={() => setStoryViewer(-1)}>
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg ring-2 ring-offset-2 ring-purple-400 group-hover:ring-purple-600 transition-all shadow-md">
                {user?.name?.charAt(0)?.toUpperCase() || 'Y'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center border-2 border-white">
                <Plus className="w-3 h-3 text-white" />
              </div>
            </div>
            <span className="text-xs text-gray-700 font-semibold">You</span>
            <span className="text-xs text-purple-500 font-medium">Add</span>
          </div>

          {/* Other users */}
          {STORY_USERS.map((s, i) => (
            <div key={i} className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer group" onClick={() => setStoryViewer(i)}>
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white font-bold text-sm ring-2 ring-offset-2 ring-purple-400 group-hover:ring-purple-600 transition-all shadow-md`}>
                {s.initials}
              </div>
              <span className="text-xs text-gray-600 font-medium">{s.name}</span>
              <span className={`text-xs font-bold ${getScoreColor(s.score)}`}>{s.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
          {[{ id: 'recent', label: 'Recent', icon: RefreshCw }, { id: 'trending', label: 'Trending', icon: Flame }].map(f => {
            const Icon = f.icon;
            return (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`flex items-center space-x-1.5 px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filter === f.id ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <Icon className="w-3.5 h-3.5" /><span>{f.label}</span>
              </button>
            );
          })}
        </div>
        <button onClick={loadCommunityCheckIns} className="p-2 text-gray-400 hover:text-purple-500 transition-colors rounded-lg hover:bg-purple-50">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Posts Feed */}
      {checkIns.map((checkIn) => {
        const isLiked = checkIn.isDemo ? !!likedPosts[checkIn.id] : checkIn.likes?.includes(user?.id);
        const showingSupport = showSupportFor === checkIn.id;

        return (
          <div key={checkIn.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
            <div className="p-5 pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${checkIn.gradient || 'from-blue-500 to-purple-600'} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm`}>
                    {checkIn.initials || checkIn.userName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="font-semibold text-gray-900">{checkIn.userName}</span>
                      {checkIn.badge && (
                        <span className="flex items-center space-x-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs rounded-full font-medium">
                          {checkIn.badge === 'On Fire' ? <Flame className="w-3 h-3" /> : <Award className="w-3 h-3" />}
                          <span>{checkIn.badge}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-400 mt-0.5">
                      <span>{formatTimeAgo(checkIn.timestamp)}</span>
                      {checkIn.streak > 0 && (<>
                        <span>·</span>
                        <span className="flex items-center space-x-0.5 text-orange-500 font-medium">
                          <Flame className="w-3 h-3" /><span>{checkIn.streak}d streak</span>
                        </span>
                      </>)}
                    </div>
                  </div>
                </div>
                <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl border text-sm font-bold ${getScoreBg(checkIn.dayScore)}`}>
                  <span>{checkIn.dayScoreEmoji}</span>
                  <span>{checkIn.dayScore}</span>
                </div>
              </div>

              <div className="mt-3">
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                  <span>{checkIn.moodEmoji}</span><span>Feeling {checkIn.moodLabel}</span>
                </span>
              </div>

              {checkIn.thought && (
                <p className="mt-3 text-gray-800 text-sm leading-relaxed">{checkIn.thought}</p>
              )}
            </div>

            {checkIn.supportMessages?.length > 0 && (
              <div className="px-5 pb-3 space-y-2">
                {checkIn.supportMessages.slice(-2).map(msg => (
                  <div key={msg.id} className="flex items-start space-x-2 bg-blue-50 rounded-xl p-2.5">
                    <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                      {msg.userName?.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-blue-800">{msg.userName} </span>
                      <span className="text-xs text-blue-700">{msg.message}</span>
                    </div>
                  </div>
                ))}
                {checkIn.supportMessages.length > 2 && (
                  <p className="text-xs text-gray-400 pl-1">+{checkIn.supportMessages.length - 2} more replies</p>
                )}
              </div>
            )}

            <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center space-x-5">
                <button onClick={() => handleLike(checkIn)}
                  className={`flex items-center space-x-1.5 text-sm font-medium transition-all duration-150 ${isLiked ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-red-400'}`}>
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{checkIn.likeCount || 0}</span>
                </button>
                <button onClick={() => setShowSupportFor(showingSupport ? null : checkIn.id)}
                  className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${showingSupport ? 'text-blue-500' : 'text-gray-400 hover:text-blue-400'}`}>
                  <MessageSquare className="w-5 h-5" />
                  <span>{checkIn.supportCount || 0}</span>
                </button>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-300">
                <Star className="w-3 h-3" /><span>DayScore</span>
              </div>
            </div>

            {showingSupport && (
              <div className="px-5 pb-4 pt-1 border-t border-gray-50">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {user?.name?.charAt(0) || 'Y'}
                  </div>
                  <div className="flex-1 flex items-center space-x-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:border-purple-400 focus-within:bg-white transition-all">
                    <input type="text" value={supportMessage} onChange={e => setSupportMessage(e.target.value)}
                      placeholder="Send support..." maxLength={100}
                      className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
                      onKeyPress={e => e.key === 'Enter' && handleSendSupport(checkIn.id)} />
                    <button onClick={() => handleSendSupport(checkIn.id)} disabled={!supportMessage.trim()}
                      className={`transition-colors ${supportMessage.trim() ? 'text-purple-500 hover:text-purple-600' : 'text-gray-300'}`}>
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Stats Footer */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-purple-600">{checkIns.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">Check-ins Today</div>
          </div>
          <div>
            <div className="text-xl font-bold text-pink-500">{checkIns.reduce((s, c) => s + (c.likeCount || 0), 0)}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total Likes</div>
          </div>
          <div>
            <div className="text-xl font-bold text-blue-500">{checkIns.reduce((s, c) => s + (c.supportCount || 0), 0)}</div>
            <div className="text-xs text-gray-500 mt-0.5">Support Sent</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityWall;
