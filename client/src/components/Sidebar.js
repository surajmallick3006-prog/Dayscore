import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  X, 
  CheckSquare, 
  Clock, 
  Heart, 
  Smile, 
  TrendingUp, 
  User,
  Home,
  LogOut,
  Sparkles,
  Users,
  Flower2
} from 'lucide-react';
import clsx from 'clsx';
import Logo from './Logo';
import { useServerAuth } from '../context/ServerAuthContext';

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: Home, color: 'text-green-500' },
  { name: 'Tasks & Productivity', href: '/app/tasks', icon: CheckSquare, color: 'text-orange-500' },
  { name: 'Time Tracker', href: '/app/time-tracker', icon: Clock, color: 'text-orange-400' },
  { name: 'Health & Activity', href: '/app/health', icon: Heart, color: 'text-green-500' },
  { name: 'Mood & Wellness', href: '/app/mood', icon: Smile, color: 'text-purple-500' },
  { name: "Women's Wellness Hub", href: '/app/wellness-hub', icon: Flower2, color: 'text-pink-600' },
  { name: 'Daily Horoscope', href: '/app/horoscope', icon: Sparkles, color: 'text-indigo-500' },
  { name: 'Community', href: '/app/community', icon: Users, color: 'text-purple-500' },
  { name: 'Analytics', href: '/app/analytics', icon: TrendingUp, color: 'text-blue-500' },
  { name: 'Profile', href: '/app/profile', icon: User, color: 'text-pink-500' },
];

const Sidebar = ({ open, setOpen }) => {
  const location = useLocation();
  const { logout } = useServerAuth();

  const handleLogout = () => {
    logout();
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white">
      {/* Logo Section */}
      <div className="flex h-20 shrink-0 items-center px-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Logo size={40} />
          <span className="text-2xl font-bold text-gray-900">DayScore</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-4 py-6">
        <ul className="flex flex-1 flex-col space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={clsx(
                    'group flex items-center gap-x-4 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gray-50 text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                  onClick={() => setOpen(false)}
                >
                  <item.icon
                    className={clsx(
                      'h-6 w-6 shrink-0',
                      isActive ? item.color : 'text-gray-400 group-hover:' + item.color
                    )}
                  />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              </li>
            );
          })}
          
          {/* Logout Button */}
          <li className="mt-auto pt-6 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="group flex items-center gap-x-4 rounded-xl px-4 py-3 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 w-full"
            >
              <LogOut className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-gray-600" />
              <span className="truncate">Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-gray-900/80"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-[min(100vw,20rem)] sm:w-80 bg-white shadow-2xl">
            <div className="flex h-full flex-col">
              <div className="flex h-20 items-center justify-between px-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <Logo size={40} />
                  <span className="text-2xl font-bold text-gray-900">DayScore</span>
                </div>
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 px-4 py-6">
                <nav className="space-y-2">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={clsx(
                          'group flex items-center gap-x-4 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200',
                          isActive
                            ? 'bg-gray-50 text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        )}
                        onClick={() => setOpen(false)}
                      >
                        <item.icon
                          className={clsx(
                            'h-6 w-6 shrink-0',
                            isActive ? item.color : 'text-gray-400 group-hover:' + item.color
                          )}
                        />
                        <span className="truncate">{item.name}</span>
                      </NavLink>
                    );
                  })}
                  
                  {/* Mobile Logout Button */}
                  <div className="pt-6 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="group flex items-center gap-x-4 rounded-xl px-4 py-3 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 w-full"
                    >
                      <LogOut className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-gray-600" />
                      <span className="truncate">Logout</span>
                    </button>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-80 lg:flex-col">
        <div className="flex grow flex-col overflow-y-auto bg-white shadow-xl">
          <SidebarContent />
        </div>
      </div>
    </>
  );
};

export default Sidebar;