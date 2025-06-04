import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="bg-background min-h-screen font-inter">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="md:ml-64 flex flex-col min-h-screen">
        <Topbar setSidebarOpen={setSidebarOpen} />
        <main className="p-4 sm:p-6 md:p-8 flex-1 w-full max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}

export default Layout; 