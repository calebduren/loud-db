import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

export function usePermissions() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);

  const canManageReleases = profile?.role === 'admin' || profile?.role === 'creator';
  const isAdmin = profile?.role === 'admin';

  return {
    canManageReleases,
    isAdmin
  };
}