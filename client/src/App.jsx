/**
 * @fileoverview Root application component configuring router, accessible layouts,
 * authentication guards, and global providers for JanSathi AI.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext.jsx';
import { OptionsProvider } from './context/OptionsContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';

import AppLayout from './components/layout/AppLayout.jsx';
import ProtectedRoute from './components/navigation/ProtectedRoute.jsx';
import AdminRoute from './components/navigation/AdminRoute.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

import AssistantPage from './pages/AssistantPage.jsx';
import EligibilityPage from './pages/EligibilityPage.jsx';
import ExplainerPage from './pages/ExplainerPage.jsx';
import VerifyPage from './pages/VerifyPage.jsx';

import DocumentsPage from './pages/DocumentsPage.jsx';
import DocumentDetailPage from './pages/DocumentDetailPage.jsx';
import UploadPage from './pages/UploadPage.jsx';

import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminDocumentsPage from './pages/admin/AdminDocumentsPage.jsx';
import AdminJobsPage from './pages/admin/AdminJobsPage.jsx';
import AdminSourcesPage from './pages/admin/AdminSourcesPage.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage.jsx';
import AdminSystemStatusPage from './pages/admin/AdminSystemStatusPage.jsx';

import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <OptionsProvider>
          <AuthProvider>
            <LanguageProvider>
              <Routes>
                {/* Public & Protected Citizen Routes under AppLayout */}
                <Route path="/" element={<AppLayout />}>
                  {/* Public Routes */}
                  <Route index element={<HomePage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />

                  {/* Protected Citizen Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="assistant" element={<AssistantPage />} />
                    <Route path="eligibility" element={<EligibilityPage />} />
                    <Route path="explainer" element={<ExplainerPage />} />
                    <Route path="explainer/:documentId" element={<ExplainerPage />} />
                    <Route path="verify" element={<VerifyPage />} />
                    <Route path="documents" element={<DocumentsPage />} />
                    <Route path="documents/:id" element={<DocumentDetailPage />} />
                    <Route path="upload" element={<UploadPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                  </Route>

                  {/* Catch-all 404 Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* Protected Admin Routes with Dedicated Shell Layout */}
                <Route element={<AdminRoute />}>
                  <Route path="admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="documents" element={<AdminDocumentsPage />} />
                    <Route path="jobs" element={<AdminJobsPage />} />
                    <Route path="sources" element={<AdminSourcesPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="analytics" element={<AdminAnalyticsPage />} />
                    <Route path="system-status" element={<AdminSystemStatusPage />} />
                  </Route>
                </Route>
              </Routes>
            </LanguageProvider>
          </AuthProvider>
        </OptionsProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
