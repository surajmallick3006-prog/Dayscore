import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="lg:pl-80 flex flex-col min-h-screen w-full min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 py-3 sm:py-4 lg:py-6 min-w-0">
          <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6 min-w-0">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm min-h-[calc(100dvh-7rem)] sm:min-h-[calc(100vh-10rem)] p-3 sm:p-4 md:p-6 overflow-x-hidden min-w-0">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;