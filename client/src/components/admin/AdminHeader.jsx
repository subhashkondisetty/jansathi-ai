/**
 * @fileoverview Administrative header topbar with mobile drawer trigger,
 * breadcrumbs, language switcher, and logout actions.
 */

import { Menu, LogOut, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import LanguageSelector from '../navigation/LanguageSelector.jsx';
import Button from '../common/Button.jsx';

export const AdminHeader = ({ onOpenSidebar }) => {
  const { logout, user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  // Compute breadcrumb from current path
  const path = location.pathname;
  let sectionTitle = t('admin_nav_overview', 'Overview');
  if (path.includes('/documents')) sectionTitle = t('admin_nav_documents', 'Documents');
  else if (path.includes('/jobs')) sectionTitle = t('admin_nav_jobs', 'Ingestion Jobs');
  else if (path.includes('/sources')) sectionTitle = t('admin_nav_sources', 'Official Sources');
  else if (path.includes('/users')) sectionTitle = t('admin_nav_users', 'User Accounts');
  else if (path.includes('/analytics')) sectionTitle = t('admin_nav_analytics', 'Analytics');
  else if (path.includes('/system-status')) sectionTitle = t('admin_nav_system', 'System Status');

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Sidebar Trigger & Breadcrumbs */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="lg:hidden text-slate-600 hover:text-slate-900 p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Open sidebar navigation"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>

          <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold">
            <span className="text-slate-500">Admin</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold">{sectionTitle}</span>
          </div>
        </div>

        {/* Right: Actions (Citizen Portal, Language Selector, Sign Out) */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link
            to="/"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Switch to citizen portal view"
          >
            <Home className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Citizen Portal</span>
          </Link>

          <LanguageSelector />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={logout}
            className="text-xs text-rose-700 hover:bg-rose-50 border-rose-200"
            title={`Signed in as ${user?.name || 'Administrator'}. Click to sign out.`}
          >
            <LogOut className="w-3.5 h-3.5 mr-1 text-rose-600" aria-hidden="true" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
