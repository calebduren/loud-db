import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoadingSpinner } from './components/LoadingSpinner';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AllReleases } from './components/releases/AllReleases';
import { UserProfileLayout } from './components/user/profile/UserProfileLayout';
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

const RESERVED_PATHS = ['profile', 'admin', 'privacy', 'terms'];

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
              <Route path="/likes" element={<LikedReleases />} />
              <Route path="/created" element={<CreatedReleases />} />
              
              {/* Profile Routes */}
              <Route path="/profile" element={<Navigate to="/profile/likes" replace />} />
              <Route path="/profile/likes" element={<LikedReleases />} />
              <Route path="/preferences" element={<PreferenceSettings />} />
              <Route path="/account" element={<AccountSettings />} />

              {/* Public Profile Routes */}
              <Route path="/:username" element={
                <RestrictedRoute reservedPaths={RESERVED_PATHS}>
                  <UserProfileLayout />
                </RestrictedRoute>
              } />

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

function RestrictedRoute({ children, reservedPaths }: { children: React.ReactNode, reservedPaths: string[] }) {
  const { username } = useParams();
  
  if (username && reservedPaths.includes(username)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}