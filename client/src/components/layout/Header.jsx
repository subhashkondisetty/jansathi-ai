/**
 * @fileoverview Responsive civic navigation bar with adaptive desktop/drawer navigation,
 * seamless Indian language support (Tamil, Telugu, Hindi, English), and high-contrast controls.
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import LanguageSelector from '../navigation/LanguageSelector.jsx';
import {
  Menu,
  X,
  FileText,
  Sparkles,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  UploadCloud,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Shield,
} from 'lucide-react';
import clsx from 'clsx';

export const Header = () => {
  const { user, status, isAdmin, logout } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: t('nav_assistant'), path: '/assistant', icon: Sparkles },
    { name: t('nav_eligibility'), path: '/eligibility', icon: CheckCircle },
    { name: t('nav_explainer'), path: '/explainer', icon: HelpCircle },
    { name: t('nav_verify'), path: '/verify', icon: ShieldAlert },
    { name: t('nav_documents'), path: '/documents', icon: FileText },
    { name: t('nav_upload'), path: '/upload', icon: UploadCloud },
  ];

  const adminLinks = [
    { name: 'Overview', path: '/admin' },
    { name: 'Sources', path: '/admin/sources' },
    { name: 'Ingestion Jobs', path: '/admin/jobs' },
    { name: 'Review Docs', path: '/admin/documents' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-16 py-2.5 gap-2 sm:gap-4">
          {/* Civic Brand & Logo */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 flex-shrink-0">
            <Link
              to="/"
              className="flex items-center space-x-2.5 group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg p-1"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-800 to-teal-700 flex items-center justify-center text-white shadow-sm shadow-emerald-900/20 group-hover:scale-105 transition-transform flex-shrink-0">
                <span className="font-extrabold text-sm tracking-wider">JS</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 leading-none whitespace-nowrap">
                    {t('brand_title')}
                  </span>
                  <span className="hidden sm:inline-flex text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide whitespace-nowrap">
                    {t('brand_theme')}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5 hidden 2xl:block truncate max-w-[200px]">
                  {t('brand_tagline')}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links — Shown at xl and 2xl breakpoints to accommodate Indic text length */}
          <nav
            className="hidden xl:flex items-center space-x-1 flex-shrink-0"
            aria-label="Main Navigation"
          >
            {navLinks.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    'px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 whitespace-nowrap',
                    active
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )}
                >
                  <item.icon
                    className={clsx(
                      'w-3.5 h-3.5 flex-shrink-0',
                      active ? 'text-emerald-700' : 'text-slate-400'
                    )}
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Admin Badge & Link */}
            {isAdmin && (
              <div className="relative group pl-1">
                <Link
                  to="/admin"
                  className={clsx(
                    'px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 whitespace-nowrap',
                    isActive('/admin')
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
                  )}
                >
                  <Shield className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" aria-hidden="true" />
                  <span>Admin</span>
                </Link>
              </div>
            )}
          </nav>

          {/* Right Controls: Language Selector & Auth (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center space-x-2.5 flex-shrink-0">
            <LanguageSelector />

            <div className="h-5 w-px bg-slate-200" aria-hidden="true" />

            {status === 'authenticated' && user ? (
              <div className="flex items-center space-x-1.5">
                <Link
                  to="/profile"
                  className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-xs"
                >
                  <User className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate max-w-[100px] 2xl:max-w-[140px]">
                    {user.name || user.email}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => logout()}
                  title={t('sign_out')}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
                  aria-label={t('sign_out')}
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            ) : status === 'unauthenticated' ? (
              <div className="flex items-center space-x-1.5">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" aria-hidden="true" />
                  <span>{t('sign_in')}</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 rounded-xl shadow-xs transition-colors whitespace-nowrap"
                >
                  <UserPlus className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  <span>{t('register')}</span>
                </Link>
              </div>
            ) : (
              <div className="w-20 h-7 bg-slate-100 animate-pulse rounded-lg" />
            )}
          </div>

          {/* Tablet & Mobile Right Area: Language + Hamburger */}
          <div className="flex items-center space-x-2 xl:hidden flex-shrink-0">
            {/* Language Selector visible on mobile header */}
            <div className="sm:hidden">
              <LanguageSelector />
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={clsx(
                'px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors',
                isActive('/')
                  ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80 shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              )}
            >
              {t('brand_title')}
            </Link>
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  'px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-3 transition-colors',
                  isActive(item.path)
                    ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80 shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                <item.icon className="w-4 h-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            ))}

            {isAdmin && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
                  Admin Governance
                </span>
                {adminLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      'px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors',
                      isActive(item.path)
                        ? 'text-amber-800 font-bold bg-amber-50'
                        : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <Shield
                      className="w-3.5 h-3.5 text-amber-600 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </nav>

          {/* Mobile & Tablet Auth Actions */}
          <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
            {status === 'authenticated' && user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 text-xs font-semibold text-slate-800 p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <User className="w-4 h-4 text-slate-500 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {t('my_profile')}: {user.name || user.email}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center space-x-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 p-2.5 rounded-xl transition-colors border border-rose-200/60"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  <span>{t('sign_out')}</span>
                </button>
              </>
            ) : status === 'unauthenticated' ? (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 py-2.5 rounded-xl transition-colors"
                >
                  {t('sign_in')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  {t('register')}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
