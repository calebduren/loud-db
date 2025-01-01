import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoadingSpinner } from './components/LoadingSpinner';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AllReleases } from './components/releases/AllReleases';
import { ProfileLayout } from './components/user/ProfileLayout';
import { LikedReleases } from './components/user/LikedReleases';
import { CreatedReleases } from './components/user/CreatedReleases';
import { PreferenceSettings } from './components/user/preferences/PreferenceSettings';
import { AccountSettings } from './components/user/account/AccountSettings';
import { AdminLayout } from './components/admin/AdminLayout';
import { UserManagement } from './components/admin/users/UserManagement';
import { GenreMappingManager } from './components/admin/genres/GenreMappingManager';
import { InviteCodeManager } from './components/admin/invites/InviteCodeManager';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Terms } from './pages/Terms';
import { ToastContainer } from './components/ui/ToastContainer';
import { useAuth } from './hooks/useAuth';
import { usePermissions } from './hooks/usePermissions';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin } = usePermissions();

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Layout>
        <Routes>
          {!user ? (
            <Route path="*" element={<WelcomeScreen />} />
          ) : (
            <>
              {/* Main Routes */}
              <Route path="/" element={<AllReleases />} />
              
              {/* Profile Routes */}
              <Route path="/profile/*" element={<ProfileLayout />}>
                <Route index element={<Navigate to="/profile/likes" replace />} />
                <Route path="likes" element={<LikedReleases />} />
                <Route path="created" element={<CreatedReleases />} />
                <Route path="preferences" element={<PreferenceSettings />} />
                <Route path="account" element={<AccountSettings />} />
              </Route>

              {/* Admin Routes */}
              {isAdmin && (
                <Route path="/admin/*" element={<AdminLayout />}>
                  <Route path="users" element={<UserManagement />} />
                  <Route path="genres" element={<GenreMappingManager />} />
                  <Route path="invites" element={<InviteCodeManager />} />
                </Route>
              )}

              {/* Legal Pages */}
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
            </>
          )}
        </Routes>
      </Layout>
      <ToastContainer />
    </>
  );
}