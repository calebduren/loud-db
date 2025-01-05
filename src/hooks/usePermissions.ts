import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

export function usePermissions() {
  const { user } = useAuth();
  const { profile, loading } = useProfile(user?.id);

  const canManageReleases = profile?.role === 'admin' || profile?.role === 'creator';
  const isAdmin = profile?.role === 'admin';

  return {
    canManageReleases,
    isAdmin,
    loading,
    profile
  };
}