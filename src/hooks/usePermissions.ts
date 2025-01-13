import { useAuth } from './useAuth';

/**
 * @deprecated Use AuthContext directly
 */
export function usePermissions() {
  const { isAdmin, canManageReleases } = useAuth();
  return { isAdmin, canManageReleases };
}