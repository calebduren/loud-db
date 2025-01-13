import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoadingSpinner } from './components/LoadingSpinner';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AllReleases } from './components/releases/AllReleases';
import { UserProfileLayout } from './components/user/profile/UserProfileLayout';
import { LikedReleases } from './components/user/LikedReleases';
import { CreatedReleases } from './components/user/CreatedReleases';
import { PreferenceSettings } from './components/user/settings/PreferenceSettings';
import { AccountSettings } from './components/user/settings/AccountSettings';
import { AdminLayout } from './components/admin/AdminLayout';
import { UserManagement } from './components/admin/users/UserManagement';
import { GenreMappingManager } from './components/admin/genres/GenreMappingManager';
import { InviteCodeManager } from './components/admin/invites/InviteCodeManager';
import { ComponentLibrary } from './components/admin/ComponentLibrary';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Terms } from './pages/Terms';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const RESERVED_PATHS = ['u', 'r', 'admin', 'privacy', 'terms'];

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

function AppRoutes() {
  const { user, loading: authLoading, isAdmin } = useAuth();

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Layout>
      <Routes>
        {!user ? (
          <Route path="*" element={<WelcomeScreen />} />
        ) : (
          <>
            {/* Main Routes */}
            <Route path="/" element={<AllReleases />} />
            <Route path="/likes" element={<LikedReleases />} />
            <Route path="/created" element={<CreatedReleases />} />
            
            {/* Own Profile Routes */}
            <Route path="/u/me" element={<UserProfileLayout />}>
              <Route index element={<Navigate to="likes" replace />} />
              <Route path="likes" element={<LikedReleases />} />
              <Route path="created" element={<CreatedReleases />} />
            </Route>
            <Route path="/preferences" element={<PreferenceSettings />} />
            <Route path="/account" element={<AccountSettings />} />

            {/* Public Profile Routes */}
            <Route path="/u/:username" element={
              <RestrictedRoute reservedPaths={RESERVED_PATHS}>
                <UserProfileLayout />
              </RestrictedRoute>
            }>
              <Route index element={<LikedReleases />} />
              <Route path="likes" element={<LikedReleases />} />
              <Route path="created" element={<CreatedReleases />} />
            </Route>

            {/* Admin Routes */}
            {isAdmin && (
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="users" replace />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="genres" element={<GenreMappingManager />} />
                <Route path="invites" element={<InviteCodeManager />} />
                <Route path="components" element={<ComponentLibrary />} />
              </Route>
            )}

            {/* Legal Routes */}
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />

            {/* Legacy Profile Route Redirect */}
            <Route path="/profile/*" element={<Navigate to="/u/me" replace />} />
            <Route path="/:username" element={<Navigate to="/u/:username" replace />} />
          </>
        )}
      </Routes>
    </Layout>
  );
}

function RestrictedRoute({ children, reservedPaths }: { children: React.ReactNode, reservedPaths: string[] }) {
  const { username } = useParams();
  
  if (username && reservedPaths.includes(username)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}