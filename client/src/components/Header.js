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
    <div className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 border-b border-gray-100 bg-white px-6 shadow-sm">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden rounded-lg hover:bg-gray-100"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Enhanced Search with Results */}
        <div className="relative flex flex-1 max-w-md">
          <button
            onClick={() => setShowSearchModal(true)}
            className="w-full flex items-center h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-left hover:bg-white hover:border-blue-500 hover:ring-2 hover:ring-blue-500/20 transition-all group"
          >
            <Search className="h-5 w-5 text-gray-400 mr-3 group-hover:text-blue-500" />
            <span className="text-sm text-gray-400 flex-1">Search tasks, pages, or features...</span>
            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded-md">
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

        <div className="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
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
            className="flex items-center gap-x-3 hover:bg-gray-50 rounded-xl px-3 py-2 transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-sm">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-semibold text-gray-900">
                {user?.name || 'SURAJ MALLICK'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.email || 'jeetenge1231@gmail.com'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;