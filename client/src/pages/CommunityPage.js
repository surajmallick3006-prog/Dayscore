import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, TrendingUp, Calendar, Award, Flame, Plus, X, Lock, Globe, Search, UserPlus, Crown, BookOpen, Dumbbell, Brain, Heart, Code, Music, Send } from 'lucide-react';
import { useServerAuth } from '../context/ServerAuthContext';
import DailyCheckIn from '../components/DailyCheckIn';
import CommunityWall from '../components/CommunityWall';
import checkInService from '../services/checkInService';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = { Study: BookOpen, Fitness: Dumbbell, Mental: Brain, Health: Heart, Tech: Code, Music: Music, General: Users };
const CATEGORY_COLORS = { Study: 'from-blue-500 to-indigo-600', Fitness: 'from-green-500 to-teal-500', Mental: 'from-purple-500 to-pink-500', Health: 'from-rose-500 to-pink-400', Tech: 'from-gray-700 to-gray-900', Music: 'from-yellow-500 to-orange-500', General: 'from-purple-500 to-blue-500' };

const DEMO_GROUPS = [
  { id: 'g1', name: 'GATE 2026 Prep', category: 'Study', description: 'Daily study accountability for GATE aspirants. Share progress, doubts, and wins.', members: 34, isPrivate: false, tags: ['engineering', 'exam', 'daily-goals'], topScore: 89, avgScore: 74, joined: false },
  { id: 'g2', name: 'Morning Warriors', category: 'Fitness', description: '5AM club. Track workouts, steps, and healthy habits together.', members: 21, isPrivate: false, tags: ['fitness', 'morning', 'habits'], topScore: 94, avgScore: 81, joined: true },
  { id: 'g3', name: 'Anxiety Support Circle', category: 'Mental', description: 'A safe, private space to share mental wellness journeys without judgment.', members: 12, isPrivate: true, tags: ['mental-health', 'support', 'wellness'], topScore: 72, avgScore: 63, joined: false },
  { id: 'g4', name: 'Startup Builders', category: 'Tech', description: 'Founders and builders tracking productivity while building their products.', members: 18, isPrivate: false, tags: ['startup', 'productivity', 'tech'], topScore: 91, avgScore: 78, joined: false },
  { id: 'g5', name: 'Mindful Living', category: 'Health', description: 'Water intake, sleep, meditation — building holistic daily wellness habits.', members: 27, isPrivate: false, tags: ['mindfulness', 'sleep', 'water'], topScore: 86, avgScore: 77, joined: true },
];

// Create Group Modal
const CreateGroupModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({ name: '', category: 'Study', description: '', isPrivate: false, tags: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = () => {
    if (!form.name.trim() || !form.description.trim()) { toast.error('Fill in name and description'); return; }
    onCreate({ ...form, id: `g${Date.now()}`, members: 1, topScore: 0, avgScore: 0, joined: true, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) });
    toast.success('Group created! 🎉');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Create a Group</h2>
            <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <p className="text-purple-100 text-sm mt-1">Build a focused community around a shared goal</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Group Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. JEE 2026 Grind"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.keys(CATEGORY_ICONS).map(cat => {
                const Icon = CATEGORY_ICONS[cat];
                return (
                  <button key={cat} onClick={() => set('category', cat)}
                    className={`flex flex-col items-center p-2 rounded-xl border-2 text-xs font-medium transition-all ${form.category === cat ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:border-purple-300'}`}>
                    <Icon className="w-4 h-4 mb-1" />{cat}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
              placeholder="What's this group about? What's the shared goal?"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Tags (comma separated)</label>
            <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="study, exam, daily-goals"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-2">
              {form.isPrivate ? <Lock className="w-4 h-4 text-gray-600" /> : <Globe className="w-4 h-4 text-gray-600" />}
              <div>
                <div className="text-sm font-medium text-gray-800">{form.isPrivate ? 'Private Group' : 'Public Group'}</div>
                <div className="text-xs text-gray-500">{form.isPrivate ? 'Invite only' : 'Anyone can join'}</div>
              </div>
            </div>
            <button onClick={() => set('isPrivate', !form.isPrivate)}
              className={`w-12 h-6 rounded-full transition-colors ${form.isPrivate ? 'bg-purple-500' : 'bg-gray-300'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${form.isPrivate ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          <button onClick={handleCreate}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity">
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

// Group Card
const GroupCard = ({ group, onJoin, onView }) => {
  const Icon = CATEGORY_ICONS[group.category] || Users;
  const gradient = CATEGORY_COLORS[group.category] || 'from-purple-500 to-blue-500';
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
      <div className={`bg-gradient-to-r ${gradient} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-sm">{group.name}</h3>
                {group.isPrivate && <Lock className="w-3 h-3 text-white/70" />}
              </div>
              <span className="text-white/70 text-xs">{group.category}</span>
            </div>
          </div>
          {group.joined && (
            <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center space-x-1">
              <Crown className="w-3 h-3" /><span>Joined</span>
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{group.description}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {group.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">#{tag}</span>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span className="flex items-center space-x-1"><Users className="w-3 h-3" /><span>{group.members} members</span></span>
          {group.avgScore > 0 && <span className="flex items-center space-x-1">⭐ <span>Avg {group.avgScore}</span></span>}
          {group.topScore > 0 && <span className="flex items-center space-x-1">🏆 <span>Top {group.topScore}</span></span>}
        </div>
        <div className="flex space-x-2">
          <button onClick={() => onView(group)}
            className="flex-1 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
            View
          </button>
          <button onClick={() => onJoin(group)}
            className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${group.joined ? 'bg-gray-100 text-gray-500' : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'}`}>
            {group.joined ? 'Leave' : group.isPrivate ? '🔒 Request' : 'Join'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Domain-specific demo chats per group category
const DOMAIN_CHATS = {
  Study: [
    { id: 1, sender: 'Aryan Mehta', initials: 'AM', gradient: 'from-blue-500 to-purple-600', text: 'Just finished 3 hours of Data Structures. Trees and graphs done 📚', time: '9:10 AM', isMe: false, type: 'text' },
    { id: 2, sender: 'Priya Sharma', initials: 'PS', gradient: 'from-pink-500 to-rose-500', text: 'Anyone else struggling with Dynamic Programming? I keep forgetting the recurrence relations 😅', time: '9:25 AM', isMe: false, type: 'text' },
    { id: 3, sender: 'Rohan Verma', initials: 'RV', gradient: 'from-green-500 to-teal-500', text: 'DP tip: always draw the state table first. Helped me a lot for GATE prep 💡', time: '9:30 AM', isMe: false, type: 'text' },
    { id: 4, sender: 'You', initials: 'Y', gradient: 'from-purple-500 to-pink-500', text: 'Sharing my study score for today 📊', time: '9:45 AM', isMe: true, type: 'score', score: 82 },
    { id: 5, sender: 'Sneha K.', initials: 'SK', gradient: 'from-orange-400 to-pink-500', text: 'Target: 6 hours today. Currently at 4. Pushing through! ⏱️', time: '10:00 AM', isMe: false, type: 'text' },
    { id: 6, sender: 'Aryan Mehta', initials: 'AM', gradient: 'from-blue-500 to-purple-600', text: 'Mock test tomorrow 9AM — everyone joining? 🎯', time: '10:15 AM', isMe: false, type: 'text' },
    { id: 7, sender: 'Priya Sharma', initials: 'PS', gradient: 'from-pink-500 to-rose-500', text: 'In! Let\'s do this 💪', time: '10:16 AM', isMe: false, type: 'text' },
  ],
  Fitness: [
    { id: 1, sender: 'Rohan Verma', initials: 'RV', gradient: 'from-green-500 to-teal-500', text: '5AM run done ✅ 6.2km in 34 mins. New PR! 🏃', time: '5:40 AM', isMe: false, type: 'text' },
    { id: 2, sender: 'Aryan Mehta', initials: 'AM', gradient: 'from-blue-500 to-purple-600', text: 'Chest + shoulders today. Hit 80kg bench for the first time 💪🔥', time: '7:15 AM', isMe: false, type: 'text' },
    { id: 3, sender: 'Sneha K.', initials: 'SK', gradient: 'from-orange-400 to-pink-500', text: 'Yoga + 8k steps done. Feeling so calm and energized 🧘', time: '8:00 AM', isMe: false, type: 'text' },
    { id: 4, sender: 'You', initials: 'Y', gradient: 'from-purple-500 to-pink-500', text: 'Sharing today\'s fitness score 📊', time: '8:30 AM', isMe: true, type: 'score', score: 88 },
    { id: 5, sender: 'Priya Sharma', initials: 'PS', gradient: 'from-pink-500 to-rose-500', text: 'Rest day for me but hit 10k steps just walking. Does that count? 😄', time: '9:00 AM', isMe: false, type: 'text' },
    { id: 6, sender: 'Rohan Verma', initials: 'RV', gradient: 'from-green-500 to-teal-500', text: 'Absolutely counts! Active recovery is real recovery 🙌', time: '9:05 AM', isMe: false, type: 'text' },
    { id: 7, sender: 'Aryan Mehta', initials: 'AM', gradient: 'from-blue-500 to-purple-600', text: 'Week 3 streak for the whole group 🔥 Let\'s keep it going!', time: '9:20 AM', isMe: false, type: 'text' },
  ],
  Mental: [
    { id: 1, sender: 'Priya Sharma', initials: 'PS', gradient: 'from-pink-500 to-rose-500', text: 'Morning meditation done 🧘 10 mins but it made such a difference', time: '8:05 AM', isMe: false, type: 'text' },
    { id: 2, sender: 'Sneha K.', initials: 'SK', gradient: 'from-orange-400 to-pink-500', text: 'Had a rough night. Anxiety was high. Anyone else feel this way before exams?', time: '8:30 AM', isMe: false, type: 'text' },
    { id: 3, sender: 'Aryan Mehta', initials: 'AM', gradient: 'from-blue-500 to-purple-600', text: 'You\'re not alone Sneha 💙 Box breathing helped me a lot — 4 in, 4 hold, 4 out', time: '8:35 AM', isMe: false, type: 'text' },
    { id: 4, sender: 'Priya Sharma', initials: 'PS', gradient: 'from-pink-500 to-rose-500', text: 'Also journaling before bed. Gets the thoughts out of your head 📓', time: '8:40 AM', isMe: false, type: 'text' },
    { id: 5, sender: 'You', initials: 'Y', gradient: 'from-purple-500 to-pink-500', text: 'Sharing my wellness score today 📊', time: '9:00 AM', isMe: true, type: 'score', score: 71 },
    { id: 6, sender: 'Sneha K.', initials: 'SK', gradient: 'from-orange-400 to-pink-500', text: 'Thank you all 🌱 Feeling a bit better already just talking about it', time: '9:10 AM', isMe: false, type: 'text' },
    { id: 7, sender: 'Rohan Verma', initials: 'RV', gradient: 'from-green-500 to-teal-500', text: 'This group is a safe space. No judgment here ever 💜', time: '9:12 AM', isMe: false, type: 'text' },
  ],
  Health: [
    { id: 1, sender: 'Sneha K.', initials: 'SK', gradient: 'from-orange-400 to-pink-500', text: 'Water check! I\'m at 2.5L already by noon 💧', time: '12:05 PM', isMe: false, type: 'text' },
    { id: 2, sender: 'Priya Sharma', initials: 'PS', gradient: 'from-pink-500 to-rose-500', text: 'Only 1L here 😬 Need to catch up. Setting a reminder every hour', time: '12:10 PM', isMe: false, type: 'text' },
    { id: 3, sender: 'Aryan Mehta', initials: 'AM', gradient: 'from-blue-500 to-purple-600', text: 'Sleep was 7.5hrs last night. Feeling way more focused today 😴✅', time: '12:20 PM', isMe: false, type: 'text' },
    { id: 4, sender: 'Rohan Verma', initials: 'RV', gradient: 'from-green-500 to-teal-500', text: 'Meal prep Sunday saved me this week. Eating clean every day 🥗', time: '12:35 PM', isMe: false, type: 'text' },
    { id: 5, sender: 'You', initials: 'Y', gradient: 'from-purple-500 to-pink-500', text: 'Sharing my health score 📊', time: '12:45 PM', isMe: true, type: 'score', score: 79 },
    { id: 6, sender: 'Sneha K.', initials: 'SK', gradient: 'from-orange-400 to-pink-500', text: 'Great score! What\'s your sleep goal set to?', time: '12:47 PM', isMe: false, type: 'text' },
    { id: 7, sender: 'Priya Sharma', initials: 'PS', gradient: 'from-pink-500 to-rose-500', text: 'Reminder: no screens 30 mins before bed tonight everyone 📵', time: '1:00 PM', isMe: false, type: 'text' },
  ],
  Tech: [
    { id: 1, sender: 'Rohan Verma', initials: 'RV', gradient: 'from-green-500 to-teal-500', text: 'Shipped the auth module today. JWT + refresh tokens done ✅', time: '11:00 AM', isMe: false, type: 'text' },
    { id: 2, sender: 'Aryan Mehta', initials: 'AM', gradient: 'from-blue-500 to-purple-600', text: 'Nice! I\'m stuck on the MongoDB aggregation pipeline for analytics. Anyone done this before?', time: '11:15 AM', isMe: false, type: 'text' },
    { id: 3, sender: 'Sneha K.', initials: 'SK', gradient: 'from-orange-400 to-pink-500', text: 'Yes! Use $group + $project. Happy to share my pipeline code 🔧', time: '11:20 AM', isMe: false, type: 'text' },
    { id: 4, sender: 'You', initials: 'Y', gradient: 'from-purple-500 to-pink-500', text: 'Sharing my productivity score for today 📊', time: '11:30 AM', isMe: true, type: 'score', score: 85 },
    { id: 5, sender: 'Priya Sharma', initials: 'PS', gradient: 'from-pink-500 to-rose-500', text: 'Just deployed to Vercel. First time the CI/CD pipeline ran clean 🚀', time: '11:45 AM', isMe: false, type: 'text' },
    { id: 6, sender: 'Rohan Verma', initials: 'RV', gradient: 'from-green-500 to-teal-500', text: 'Let\'s do a build review call this weekend? Share what everyone\'s building 💻', time: '12:00 PM', isMe: false, type: 'text' },
    { id: 7, sender: 'Aryan Mehta', initials: 'AM', gradient: 'from-blue-500 to-purple-600', text: 'In! Saturday 4PM works for me 🙌', time: '12:02 PM', isMe: false, type: 'text' },
  ],
  Music: [
    { id: 1, sender: 'Priya Sharma', initials: 'PS', gradient: 'from-pink-500 to-rose-500', text: 'Practice log: 45 mins piano today. Finally nailed the Chopin piece 🎹', time: '3:00 PM', isMe: false, type: 'text' },
    { id: 2, sender: 'Aryan Mehta', initials: 'AM', gradient: 'from-blue-500 to-purple-600', text: 'Guitar session was 1hr. Working on fingerpicking patterns 🎸', time: '3:20 PM', isMe: false, type: 'text' },
    { id: 3, sender: 'Sneha K.', initials: 'SK', gradient: 'from-orange-400 to-pink-500', text: 'Recorded a cover today! First time posting online 😬🎤', time: '3:45 PM', isMe: false, type: 'text' },
    { id: 4, sender: 'Rohan Verma', initials: 'RV', gradient: 'from-green-500 to-teal-500', text: 'That\'s huge Sneha!! Share the link here 🔥', time: '3:46 PM', isMe: false, type: 'text' },
    { id: 5, sender: 'You', initials: 'Y', gradient: 'from-purple-500 to-pink-500', text: 'Sharing my focus score after practice 📊', time: '4:00 PM', isMe: true, type: 'score', score: 76 },
    { id: 6, sender: 'Priya Sharma', initials: 'PS', gradient: 'from-pink-500 to-rose-500', text: 'Music really boosts the DayScore. Creativity = wellness 🎵', time: '4:10 PM', isMe: false, type: 'text' },
    { id: 7, sender: 'Aryan Mehta', initials: 'AM', gradient: 'from-blue-500 to-purple-600', text: 'Weekly jam session Sunday? We can share recordings in here 🎶', time: '4:20 PM', isMe: false, type: 'text' },
  ],
  General: [
    { id: 1, sender: 'Aryan Mehta', initials: 'AM', gradient: 'from-blue-500 to-purple-600', text: 'Hey everyone! Just hit 87 today 🔥', time: '10:32 AM', isMe: false, type: 'text' },
    { id: 2, sender: 'Rohan Verma', initials: 'RV', gradient: 'from-green-500 to-teal-500', text: 'Congrats! I got 91 today, new personal best 🏆', time: '10:35 AM', isMe: false, type: 'text' },
    { id: 3, sender: 'Priya Sharma', initials: 'PS', gradient: 'from-pink-500 to-rose-500', text: 'Amazing scores! I had a slow day at 72 but showed up 💪', time: '10:40 AM', isMe: false, type: 'text' },
    { id: 4, sender: 'You', initials: 'Y', gradient: 'from-purple-500 to-pink-500', text: 'Consistency > perfection! Great work everyone 🙌', time: '10:42 AM', isMe: true, type: 'text' },
    { id: 5, sender: 'Sneha K.', initials: 'SK', gradient: 'from-orange-400 to-pink-500', text: 'Rough day for me (58) but tomorrow is a new day 🌱', time: '11:05 AM', isMe: false, type: 'text' },
    { id: 6, sender: 'Aryan Mehta', initials: 'AM', gradient: 'from-blue-500 to-purple-600', text: 'You showed up Sneha, that\'s what matters! 💙', time: '11:07 AM', isMe: false, type: 'text' },
  ],
};

// Group Chat
const GroupChat = ({ group, user }) => {
  const domainMsgs = DOMAIN_CHATS[group.category] || DOMAIN_CHATS.General;
  // Personalize "You" initials
  const personalizedMsgs = domainMsgs.map(m => m.isMe ? { ...m, initials: user?.name?.charAt(0)?.toUpperCase() || 'Y' } : m);

  const [messages, setMessages] = useState(personalizedMsgs);
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = React.useRef(null);
  const EMOJIS = ['😊','🔥','💪','🏆','🙌','💙','🌱','😔','🤩','✅','📚','⚡'];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(), sender: 'You', initials: user?.name?.charAt(0) || 'Y',
      gradient: 'from-purple-500 to-pink-500', text: input.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isMe: true, type: 'text'
    }]);
    setInput('');
    setShowEmoji(false);
  };

  const shareScore = () => {
    setMessages(prev => [...prev, {
      id: Date.now(), sender: 'You', initials: user?.name?.charAt(0) || 'Y',
      gradient: 'from-purple-500 to-pink-500',
      text: '📊 Shared my DayScore', score: Math.floor(Math.random() * 30) + 65,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isMe: true, type: 'score'
    }]);
    toast.success('Score shared in group! 🎉');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col" style={{ height: '520px' }}>
      {/* Chat Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {['from-blue-500 to-purple-600','from-pink-500 to-rose-500','from-green-500 to-teal-500'].map((g,i) => (
              <div key={i} className={`w-7 h-7 rounded-full bg-gradient-to-br ${g} border-2 border-white`} />
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-800">{group.name}</span>
          <span className="text-xs text-gray-400">· {group.members} members</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Date divider */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400 font-medium">Today</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {messages.map(msg => (
          <div key={msg.id} className={`flex items-end space-x-2 ${msg.isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
            {!msg.isMe && (
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${msg.gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                {msg.initials}
              </div>
            )}
            <div className={`max-w-xs ${msg.isMe ? 'items-end' : 'items-start'} flex flex-col`}>
              {!msg.isMe && <span className="text-xs text-gray-400 mb-1 ml-1">{msg.sender}</span>}
              {msg.type === 'score' ? (
                <div className={`px-4 py-3 rounded-2xl ${msg.isMe ? 'rounded-br-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'rounded-bl-sm bg-gray-100 text-gray-800'}`}>
                  <div className="text-xs font-medium mb-1 opacity-80">📊 DayScore Shared</div>
                  <div className="text-3xl font-bold">{msg.score}</div>
                  <div className="text-xs opacity-70 mt-0.5">/ 100 today</div>
                </div>
              ) : (
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.isMe ? 'rounded-br-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'rounded-bl-sm bg-gray-100 text-gray-800'}`}>
                  {msg.text}
                </div>
              )}
              <span className="text-xs text-gray-300 mt-1 mx-1">{msg.time}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="px-4 py-3 border-t border-gray-100">
        {showEmoji && (
          <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 rounded-xl">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setInput(i => i + e)} className="text-xl hover:scale-125 transition-transform">{e}</button>
            ))}
          </div>
        )}
        <div className="flex items-center space-x-2">
          <button onClick={shareScore} title="Share your DayScore"
            className="w-9 h-9 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-colors flex-shrink-0 text-sm font-bold">
            📊
          </button>
          <button onClick={() => setShowEmoji(s => !s)}
            className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0 text-lg">
            😊
          </button>
          <div className="flex-1 flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:border-purple-400 focus-within:bg-white transition-all">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
              placeholder="Message the group..."
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400" />
          </div>
          <button onClick={sendMessage} disabled={!input.trim()}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-all flex-shrink-0 ${input.trim() ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 scale-100' : 'bg-gray-200 text-gray-400'}`}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Group Detail View
const GroupDetail = ({ group, onBack, user }) => {
  const [activeTab, setActiveTab] = useState(group.joined ? 'chat' : 'about');
  const Icon = CATEGORY_ICONS[group.category] || Users;
  const gradient = CATEGORY_COLORS[group.category] || 'from-purple-500 to-blue-500';
  const DEMO_MEMBERS = [
    { name: 'Aryan Mehta', initials: 'AM', score: 87, role: 'Admin', streak: 7, gradient: 'from-blue-500 to-purple-600' },
    { name: 'Priya Sharma', initials: 'PS', score: 72, role: 'Member', streak: 4, gradient: 'from-pink-500 to-rose-500' },
    { name: 'Rohan Verma', initials: 'RV', score: 91, role: 'Member', streak: 12, gradient: 'from-green-500 to-teal-500' },
    { name: 'Sneha K.', initials: 'SK', score: 58, role: 'Member', streak: 2, gradient: 'from-orange-400 to-pink-500' },
  ];

  const tabs = [
    ...(group.joined ? [{ id: 'chat', label: 'Group Chat', icon: MessageSquare }] : []),
    { id: 'about', label: 'About', icon: Users },
    { id: 'members', label: `Members (${group.members})`, icon: Crown },
  ];

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium text-sm">
        <span>←</span><span>Back to Groups</span>
      </button>

      {/* Group Header */}
      <div className={`bg-gradient-to-r ${gradient} rounded-2xl p-5 text-white`}>
        <div className="flex items-center space-x-4 mb-3">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold">{group.name}</h2>
              {group.isPrivate && <Lock className="w-4 h-4 text-white/70" />}
              {group.joined && <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center space-x-1"><Crown className="w-3 h-3" /><span>Joined</span></span>}
            </div>
            <div className="flex items-center space-x-3 text-white/70 text-sm mt-0.5">
              <span>{group.members} members</span><span>·</span><span>{group.category}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {[{ label: 'Members', value: group.members, emoji: '👥' }, { label: 'Avg Score', value: group.avgScore || '—', emoji: '⭐' }, { label: 'Top Score', value: group.topScore || '—', emoji: '🏆' }].map((s, i) => (
            <div key={i} className="bg-white/15 rounded-xl p-3 text-center">
              <div className="text-lg">{s.emoji}</div>
              <div className="text-lg font-bold">{s.value}</div>
              <div className="text-xs text-white/70">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => {
            const TIcon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-purple-500 text-purple-600 bg-purple-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                <TIcon className="w-4 h-4" /><span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && group.joined && <GroupChat group={group} user={user} />}

      {/* About Tab */}
      {activeTab === 'about' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
            <p className="text-gray-600 text-sm leading-relaxed">{group.description}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {group.tags.map(tag => <span key={tag} className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium">#{tag}</span>)}
            </div>
          </div>
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
            {group.isPrivate ? <Lock className="w-4 h-4 text-gray-500" /> : <Globe className="w-4 h-4 text-gray-500" />}
            <span className="text-sm text-gray-600">{group.isPrivate ? 'Private group — invite only' : 'Public group — anyone can join'}</span>
          </div>
          {!group.joined && (
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-center">
              <MessageSquare className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-purple-800">Join this group to access the group chat</p>
              <p className="text-xs text-purple-600 mt-1">Connect and share your progress with members</p>
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="space-y-3">
            {DEMO_MEMBERS.map((m, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white text-sm font-bold`}>
                    {m.initials}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 text-sm">{m.name}</span>
                      {m.role === 'Admin' && <Crown className="w-3 h-3 text-yellow-500" />}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-orange-500">
                      <Flame className="w-3 h-3" /><span>{m.streak}d streak</span>
                    </div>
                  </div>
                </div>
                <div className={`text-sm font-bold px-3 py-1 rounded-full ${m.score >= 80 ? 'bg-green-50 text-green-600' : m.score >= 65 ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'}`}>
                  {m.score}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Groups Tab Content
const GroupsTab = () => {
  const [groups, setGroups] = useState(DEMO_GROUPS);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [viewGroup, setViewGroup] = useState(null);
  const { user } = useServerAuth();

  const filtered = groups.filter(g =>
    (filterCat === 'All' || g.category === filterCat) &&
    (g.name.toLowerCase().includes(search.toLowerCase()) || g.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleJoin = (group) => {
    setGroups(prev => prev.map(g => g.id === group.id ? { ...g, joined: !g.joined, members: g.joined ? g.members - 1 : g.members + 1 } : g));
    toast.success(group.joined ? 'Left group' : `Joined ${group.name}! 🎉`);
  };

  if (viewGroup) return <GroupDetail group={groups.find(g => g.id === viewGroup.id) || viewGroup} onBack={() => setViewGroup(null)} user={user} />;

  return (
    <div className="space-y-4">
      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} onCreate={g => setGroups(prev => [g, ...prev])} />}

      {/* My Groups */}
      {groups.filter(g => g.joined).length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <Crown className="w-4 h-4 text-yellow-500" /><span>My Groups</span>
          </h3>
          <div className="flex space-x-3 overflow-x-auto pb-1">
            {groups.filter(g => g.joined).map(g => {
              const Icon = CATEGORY_ICONS[g.category] || Users;
              const gradient = CATEGORY_COLORS[g.category] || 'from-purple-500 to-blue-500';
              return (
                <button key={g.id} onClick={() => setViewGroup(g)}
                  className="flex-shrink-0 flex flex-col items-center space-y-2 p-3 bg-gray-50 rounded-2xl hover:bg-purple-50 transition-colors w-24">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight">{g.name}</span>
                  <span className="text-xs text-gray-400">{g.members} members</span>
                </button>
              );
            })}
            <button onClick={() => setShowCreate(true)}
              className="flex-shrink-0 flex flex-col items-center justify-center space-y-2 p-3 border-2 border-dashed border-purple-300 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-colors w-24">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Plus className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-xs font-medium text-purple-600 text-center">New Group</span>
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <div className="flex items-center space-x-3">
          <div className="flex-1 flex items-center space-x-2 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 focus-within:border-purple-400 transition-colors">
            <Search className="w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search groups..."
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400" />
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
            <Plus className="w-4 h-4" /><span>Create</span>
          </button>
        </div>
        <div className="flex space-x-2 overflow-x-auto pb-1">
          {['All', ...Object.keys(CATEGORY_ICONS)].map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterCat === cat ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(g => <GroupCard key={g.id} group={g} onJoin={handleJoin} onView={setViewGroup} />)}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 font-medium">No groups found</p>
          <p className="text-gray-400 text-sm mt-1">Try a different search or create your own</p>
          <button onClick={() => setShowCreate(true)}
            className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90">
            Create a Group
          </button>
        </div>
      )}
    </div>
  );
};

// Main CommunityPage
const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState('wall');
  const [analytics, setAnalytics] = useState(null);
  const { user } = useServerAuth();

  useEffect(() => {
    if (user) checkInService.getCheckInAnalytics(user.id, 30).then(setAnalytics).catch(() => {});
  }, [user]);

  const tabs = [
    { id: 'wall', label: 'Feed', icon: Users },
    { id: 'groups', label: 'Groups', icon: UserPlus },
    { id: 'checkin', label: 'Check-In', icon: MessageSquare },
    { id: 'insights', label: 'Insights', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gray-50 -m-6 p-6">
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 rounded-2xl p-6 mb-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <Users className="w-7 h-7" />
              <h1 className="text-2xl font-bold">Community</h1>
            </div>
            <p className="text-purple-100 text-sm">Share your day. Join groups. Grow together.</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{analytics?.checkInFrequency ?? 0}%</div>
              <div className="text-xs text-purple-200">Check-in Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold flex items-center justify-center space-x-1">
                <Flame className="w-5 h-5 text-orange-300" /><span>{analytics?.currentStreak ?? 0}</span>
              </div>
              <div className="text-xs text-purple-200">Day Streak</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-purple-500 text-purple-600 bg-purple-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                <Icon className="w-4 h-4" /><span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'wall' && <CommunityWall />}
      {activeTab === 'groups' && <GroupsTab />}
      {activeTab === 'checkin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DailyCheckIn />
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
            <div className="flex items-center space-x-2"><MessageSquare className="w-5 h-5 text-blue-500" /><h3 className="text-lg font-semibold text-gray-900">How Check-Ins Work</h3></div>
            {[
              { icon: '🤖', title: 'Auto-Detection', desc: 'DayScore and mood auto-calculated from your activity.', bg: 'from-blue-50 to-purple-50', border: 'border-blue-200', text: 'text-blue-800', head: 'text-blue-900' },
              { icon: '✍️', title: 'Personal Touch', desc: 'Add a thought — a win, challenge, or feeling.', bg: 'from-green-50 to-emerald-50', border: 'border-green-200', text: 'text-green-800', head: 'text-green-900' },
              { icon: '💬', title: 'Community Support', desc: 'Share publicly or keep private. Community is here for you.', bg: 'from-purple-50 to-pink-50', border: 'border-purple-200', text: 'text-purple-800', head: 'text-purple-900' },
            ].map((item, i) => (
              <div key={i} className={`p-4 bg-gradient-to-r ${item.bg} rounded-xl border ${item.border}`}>
                <h4 className={`font-semibold ${item.head} mb-1`}>{item.icon} {item.title}</h4>
                <p className={`text-sm ${item.text}`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-6"><TrendingUp className="w-5 h-5 text-green-500" /><h3 className="text-lg font-semibold">Your Analytics</h3></div>
            {analytics ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[{ label: 'Total Check-ins', value: analytics.totalCheckIns, bg: 'bg-blue-50', text: 'text-blue-600' }, { label: 'Consistency', value: `${analytics.checkInFrequency}%`, bg: 'bg-purple-50', text: 'text-purple-600' }, { label: 'Avg DayScore', value: analytics.averageDayScore, bg: 'bg-green-50', text: 'text-green-600' }, { label: 'Avg Mood', value: analytics.averageMood, bg: 'bg-orange-50', text: 'text-orange-600' }].map((m, i) => (
                    <div key={i} className={`text-center p-4 ${m.bg} rounded-xl`}>
                      <div className={`text-2xl font-bold ${m.text}`}>{m.value}</div>
                      <div className="text-sm text-gray-600">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                <p className="text-sm">No data yet — start checking in daily</p>
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-6"><Award className="w-5 h-5 text-yellow-500" /><h3 className="text-lg font-semibold">Community Impact</h3></div>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                <h4 className="font-semibold text-yellow-900 mb-3">🏆 Your Contributions</h4>
                {[{ label: 'Check-ins shared', value: analytics?.totalCheckIns ?? 0 }, { label: 'Support given', value: '-' }, { label: 'Likes received', value: '-' }].map((r, i) => (
                  <div key={i} className="flex justify-between text-sm text-yellow-800 py-1"><span>{r.label}</span><span className="font-semibold">{r.value}</span></div>
                ))}
              </div>
              <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
                <h4 className="font-semibold text-pink-900 mb-2">💝 Why It Matters</h4>
                <ul className="text-sm text-pink-800 space-y-1">
                  {['Daily reflection builds self-awareness', 'Groups create focused accountability', 'Supporting others builds empathy', 'Community reduces isolation'].map((t, i) => <li key={i}>• {t}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
