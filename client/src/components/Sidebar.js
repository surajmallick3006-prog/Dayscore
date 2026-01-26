import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  X, 
  BarChart3, 
  CheckSquare, 
  Clock, 
  Heart, 
  Smile, 
  TrendingUp, 
  User,
  Home
} from 'lucide-react';
import clsx from 'clsx';
import Logo from './Logo';

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: Home },
  { name: 'Tasks & Productivity', href: '/app/tasks', icon: CheckSquare },
  { name: 'Time Tracker', href: '/app/time-tracker', icon: Clock },
  { name: 'Health & Activity', href: '/app/health', icon: Heart },
  { name: 'Mood & Wellness', href: '/app/mood', icon: Smile },
  { name: 'Analytics', href: '/app/analytics', icon: TrendingUp },
  { name: 'Profile', href: '/app/profile', icon: User },
];

const Sidebar = ({ open, setOpen }) => {
  const location = useLocation();

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6">
        <div className="flex items-center space-x-3">
          <Logo size={32} />
          <span className="text-xl font-bold text-gray-900">DayScore</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-6 pb-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={clsx(
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      )}
                      onClick={() => setOpen(false)}
                    >
                      <item.icon
                        className={clsx(
                          'h-5 w-5 shrink-0',
                          isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'
                        )}
                      />
                      {item.name}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
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
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl">
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center space-x-3">
                  <Logo size={32} />
                  <span className="text-xl font-bold text-gray-900">DayScore</span>
                </div>
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 px-6 pb-4">
                <nav className="space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={clsx(
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors',
                          isActive
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        )}
                        onClick={() => setOpen(false)}
                      >
                        <item.icon
                          className={clsx(
                            'h-5 w-5 shrink-0',
                            isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'
                          )}
                        />
                        {item.name}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white">
          <SidebarContent />
        </div>
      </div>
    </>
  );
};

export default Sidebar;