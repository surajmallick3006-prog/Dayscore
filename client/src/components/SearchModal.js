import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, CheckSquare, Heart, Smile, TrendingUp, BarChart3, User, ArrowRight, Flower2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

const SearchModal = ({ isOpen, onClose }) => {
  const { tasks, timeLogs } = useData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Search categories
  const searchCategories = [
    { name: 'Dashboard', path: '/app/dashboard', icon: BarChart3, color: 'text-green-500', description: 'View your daily score and overview' },
    { name: 'Tasks & Productivity', path: '/app/tasks', icon: CheckSquare, color: 'text-orange-500', description: 'Manage your tasks and projects' },
    { name: 'Time Tracker', path: '/app/time-tracker', icon: Clock, color: 'text-orange-400', description: 'Track study and work sessions' },
    { name: 'Health & Activity', path: '/app/health', icon: Heart, color: 'text-green-500', description: 'Monitor sleep, activity, and water intake' },
    { name: 'Mood & Wellness', path: '/app/mood', icon: Smile, color: 'text-purple-500', description: 'Log your emotional state and wellness' },
    { name: "Women's Wellness Hub", path: '/app/wellness-hub', icon: Flower2, color: 'text-pink-600', description: 'Cycle tracking, phase-based nutrition, fitness & daily log' },
    { name: 'Analytics', path: '/app/analytics', icon: TrendingUp, color: 'text-blue-500', description: 'View reports and trends' },
    { name: 'Profile', path: '/app/profile', icon: User, color: 'text-pink-500', description: 'Manage your account settings' },
  ];

  // Perform comprehensive search
  const performSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results = [];
    const lowerQuery = query.toLowerCase();

    // Search in navigation/pages
    searchCategories.forEach(category => {
      if (category.name.toLowerCase().includes(lowerQuery) || 
          category.description.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'page',
          title: category.name,
          subtitle: category.description,
          path: category.path,
          icon: category.icon,
          color: category.color,
          score: category.name.toLowerCase().includes(lowerQuery) ? 10 : 5
        });
      }
    });

    // Search in tasks
    if (tasks && tasks.length > 0) {
      tasks.forEach(task => {
        let score = 0;
        if (task.title.toLowerCase().includes(lowerQuery)) score += 10;
        if (task.description && task.description.toLowerCase().includes(lowerQuery)) score += 5;
        if (task.category.toLowerCase().includes(lowerQuery)) score += 3;
        
        if (score > 0) {
          results.push({
            type: 'task',
            title: task.title,
            subtitle: `${task.status} • ${task.category} • Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}`,
            path: '/app/tasks',
            icon: CheckSquare,
            color: 'text-orange-500',
            data: task,
            score
          });
        }
      });
    }

    // Search in time logs
    if (timeLogs && timeLogs.length > 0) {
      timeLogs.slice(0, 10).forEach(log => {
        let score = 0;
        if (log.type.toLowerCase().includes(lowerQuery)) score += 8;
        if (log.description && log.description.toLowerCase().includes(lowerQuery)) score += 5;
        
        if (score > 0) {
          results.push({
            type: 'timelog',
            title: `${log.type.charAt(0).toUpperCase() + log.type.slice(1)} Session`,
            subtitle: `${log.duration} minutes • ${new Date(log.startTime).toLocaleDateString()}`,
            path: '/app/time-tracker',
            icon: Clock,
            color: 'text-orange-400',
            data: log,
            score
          });
        }
      });
    }

    // Search common terms and features
    const featureSearches = [
      { query: ['day score', 'score', 'daily'], title: 'Day Score', subtitle: 'View your daily productivity score', path: '/app/dashboard', icon: BarChart3, color: 'text-green-500' },
      { query: ['productivity', 'productive'], title: 'Productivity Tracking', subtitle: 'Tasks and time management', path: '/app/tasks', icon: CheckSquare, color: 'text-orange-500' },
      { query: ['wellness', 'mental health'], title: 'Wellness Tracking', subtitle: 'Mood and mental health monitoring', path: '/app/mood', icon: Smile, color: 'text-purple-500' },
      { query: ['cycle', 'period', 'menstrual', 'ovulation', 'luteal', 'follicular', 'women', 'feminine', 'hormone'], title: "Women's Wellness Hub", subtitle: 'Cycle-aware wellness, nutrition, fitness & mindset', path: '/app/wellness-hub', icon: Flower2, color: 'text-pink-600' },
      { query: ['health', 'fitness'], title: 'Health Monitoring', subtitle: 'Sleep, activity, and wellness metrics', path: '/app/health', icon: Heart, color: 'text-green-500' },
      { query: ['sleep', 'rest'], title: 'Sleep Tracking', subtitle: 'Monitor your sleep patterns and quality', path: '/app/health', icon: Heart, color: 'text-green-500' },
      { query: ['water', 'hydration', 'drink'], title: 'Water Intake', subtitle: 'Track daily hydration goals', path: '/app/health', icon: Heart, color: 'text-green-500' },
      { query: ['mood', 'emotion', 'feeling'], title: 'Mood Tracking', subtitle: 'Log your emotional state and patterns', path: '/app/mood', icon: Smile, color: 'text-purple-500' },
      { query: ['reports', 'analytics', 'trends'], title: 'Analytics & Reports', subtitle: 'View trends and insights', path: '/app/analytics', icon: TrendingUp, color: 'text-blue-500' },
      { query: ['time', 'timer', 'tracking'], title: 'Time Tracking', subtitle: 'Monitor study and work sessions', path: '/app/time-tracker', icon: Clock, color: 'text-orange-400' },
    ];

    featureSearches.forEach(search => {
      const matchScore = search.query.find(term => 
        term.includes(lowerQuery) || lowerQuery.includes(term) || search.title.toLowerCase().includes(lowerQuery)
      );
      
      if (matchScore) {
        results.push({
          type: 'feature',
          title: search.title,
          subtitle: search.subtitle,
          path: search.path,
          icon: search.icon,
          color: search.color,
          score: search.title.toLowerCase().includes(lowerQuery) ? 8 : 6
        });
      }
    });

    // Sort by relevance score and limit results
    const sortedResults = results
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 12);

    setSearchResults(sortedResults);
    setSelectedIndex(0);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    performSearch(query);
  };

  // Handle result selection
  const handleResultClick = (result) => {
    navigate(result.path);
    onClose();
    setSearchQuery('');
    setSearchResults([]);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleResultClick(searchResults[selectedIndex]);
      }
    }
  };

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-[100dvh] items-start sm:items-center justify-center p-2 sm:p-4 pt-4 sm:pt-16">
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden />

        <div className="relative w-full max-w-2xl bg-white rounded-xl sm:rounded-2xl shadow-2xl max-h-[calc(100dvh-1rem)] flex flex-col">
          {/* Search Input */}
          <div className="flex items-center border-b border-gray-200 p-4">
            <Search className="h-6 w-6 text-gray-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search tasks, pages, features..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="flex-1 text-lg placeholder-gray-400 border-0 focus:ring-0 focus:outline-none"
            />
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto max-h-[min(24rem,calc(100dvh-12rem))] sm:max-h-96">
            {searchResults.length > 0 ? (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2">
                  {searchResults.length} Results
                </div>
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleResultClick(result)}
                    className={`w-full flex items-center gap-x-4 px-3 py-3 text-left rounded-xl transition-all ${
                      index === selectedIndex 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg bg-gray-100 ${result.color}`}>
                      <result.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {result.subtitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-x-2">
                      <span className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-1 rounded-full">
                        {result.type}
                      </span>
                      <ArrowRight className="h-4 w-4 text-gray-300" />
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="p-8 text-center">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">No results found</p>
                <p className="text-sm text-gray-500">
                  Try searching for tasks, pages, or features like "dashboard", "mood", or "analytics"
                </p>
              </div>
            ) : (
              <div className="p-4">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2 mb-2">
                  Quick Access
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {searchCategories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => handleResultClick({
                        title: category.name,
                        path: category.path,
                        icon: category.icon,
                        color: category.color
                      })}
                      className="flex items-center gap-x-3 px-3 py-3 text-left hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <category.icon className={`h-5 w-5 ${category.color}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{category.name}</p>
                        <p className="text-xs text-gray-500">{category.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-3 sm:px-4 py-3 bg-gray-50 rounded-b-xl sm:rounded-b-2xl shrink-0">
            <div className="flex flex-col xs:flex-row items-center justify-between gap-2 text-xs text-gray-500">
              <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>Esc Close</span>
              </div>
              <span className="hidden sm:inline">Powered by DayScore Search</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;