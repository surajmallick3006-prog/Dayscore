import React, { useState, useEffect } from 'react';
import { Menu, Bell, Search, User, Command } from 'lucide-react';
import { useServerAuth } from '../context/ServerAuthContext';
import { useNavigate } from 'react-router-dom';
import SearchModal from './SearchModal';

const Header = ({ onMenuClick }) => {
  const { user } = useServerAuth();
  const navigate = useNavigate();
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Global keyboard shortcut for search
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Cmd+K or Ctrl+K to open search modal
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 sm:h-[4.5rem] lg:h-20 shrink-0 items-center gap-x-2 sm:gap-x-4 border-b border-gray-100 bg-white/95 backdrop-blur-sm px-3 sm:px-4 lg:px-6 shadow-sm min-w-0">
      <button
        type="button"
        className="-m-2 p-2 text-gray-700 lg:hidden rounded-lg hover:bg-gray-100 shrink-0"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="h-6 w-px bg-gray-200 lg:hidden shrink-0" />

      <div className="flex flex-1 gap-x-2 sm:gap-x-4 min-w-0 lg:gap-x-6">
        <div className="relative flex flex-1 min-w-0 max-w-full lg:max-w-md">
          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            className="w-full flex items-center h-10 sm:h-12 rounded-xl border border-gray-200 bg-gray-50 px-2 sm:px-4 text-left hover:bg-white hover:border-blue-500 hover:ring-2 hover:ring-blue-500/20 transition-all group min-w-0"
            aria-label="Open search"
          >
            <Search className="h-5 w-5 text-gray-400 shrink-0 sm:mr-3 group-hover:text-blue-500" />
            <span className="text-sm text-gray-400 flex-1 truncate hidden xs:block sm:inline">
              Search tasks, pages…
            </span>
            <div className="hidden md:flex items-center gap-1 text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded-md shrink-0">
              <Command className="h-3 w-3" />
              <span>K</span>
            </div>
          </button>
        </div>

        {/* Search Modal */}
        <SearchModal 
          isOpen={showSearchModal} 
          onClose={() => setShowSearchModal(false)} 
        />

        <div className="flex items-center gap-x-2 sm:gap-x-4 lg:gap-x-6 ml-auto shrink-0">
          {/* Notifications */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

          {/* Profile section - Direct navigation to profile */}
          <button
            onClick={() => navigate('/app/profile')}
            className="flex items-center gap-x-2 sm:gap-x-3 hover:bg-gray-50 rounded-xl px-1 sm:px-3 py-2 transition-colors"
          >
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-sm shrink-0">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="hidden lg:block text-left min-w-0 max-w-[140px] xl:max-w-[200px]">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || ''}
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;