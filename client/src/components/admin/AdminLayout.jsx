/**
 * @fileoverview Administrative Shell Layout component.
 * Wraps all /admin/* routes with responsive sidebar, topbar, and accessible content container.
 */

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';
import AdminHeader from './AdminHeader.jsx';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Sidebar (Desktop fixed + Mobile sliding drawer) */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Administrative Container offset by desktop sidebar width (64 / 16rem) */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <AdminHeader onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <footer className="py-4 px-6 border-t border-slate-200 text-center text-xs text-slate-500 bg-white">
          <p>
            JanSathi AI • Official Government Civic Administration Console • FORGE &apos;26 Theme 1
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
