/**
 * @fileoverview Administrative sidebar navigation component.
 * Supports desktop fixed positioning, mobile drawer overlay, and active route states.
 */

import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Activity,
  Globe,
  Users,
  BarChart3,
  Server,
  X,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export const AdminSidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const navigationItems = [
    {
      name: t('admin_nav_overview', 'Overview'),
      path: '/admin',
      end: true,
      icon: LayoutDashboard,
    },
    {
      name: t('admin_nav_documents', 'Documents'),
      path: '/admin/documents',
      icon: FileText,
    },
    {
      name: t('admin_nav_jobs', 'Ingestion Jobs'),
      path: '/admin/jobs',
      icon: Activity,
    },
    {
      name: t('admin_nav_sources', 'Official Sources'),
      path: '/admin/sources',
      icon: Globe,
    },
    {
      name: t('admin_nav_users', 'User Accounts'),
      path: '/admin/users',
      icon: Users,
    },
    {
      name: t('admin_nav_analytics', 'Analytics'),
      path: '/admin/analytics',
      icon: BarChart3,
    },
    {
      name: t('admin_nav_system', 'System Status'),
      path: '/admin/system-status',
      icon: Server,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link
          to="/admin"
          onClick={onClose}
          className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg p-1"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md font-bold text-sm">
            JS
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              {t('brand_title', 'JanSathi AI')}
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                Admin
              </span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Civic Operations Hub</span>
          </div>
        </Link>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Admin Navigation">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Management Modules
        </div>

        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400',
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        <div className="pt-4 px-3">
          <Link
            to="/"
            className="flex items-center space-x-2 text-xs text-slate-400 hover:text-slate-200 transition-colors py-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Return to Citizen Portal</span>
          </Link>
        </div>
      </nav>

      {/* Authenticated Admin Identity Badge */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold text-xs">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-white truncate">
              {user?.name || 'Administrator'}
            </span>
            <span className="text-[11px] text-slate-400 truncate">
              {user?.email || 'admin@jansathi.gov.in'}
            </span>
          </div>
          <Shield
            className="w-4 h-4 text-emerald-400 flex-shrink-0"
            title="Verified Admin Role"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-30 lg:border-r lg:border-slate-800">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-slate-950/70 backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-200 ease-in-out lg:hidden shadow-2xl',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default AdminSidebar;
