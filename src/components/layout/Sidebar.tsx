import React from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';

export function Sidebar() {
  const { user } = useAuth();
  const { isAdmin } = usePermissions();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'block px-4 py-2 rounded-lg transition-colors',
      isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
    );

  return (
    <aside className="w-64 h-screen bg-black text-white flex flex-col fixed left-0 top-0">
      {/* Logo section */}
      <div className="p-4">
        <Logo className="text-white" />
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-2">
        <ul className="flex flex-col gap-1">
          <li>
            <NavLink to="/" className={linkClass}>
              New music
            </NavLink>
          </li>
          <li>
            <NavLink to="/likes" className={linkClass}>
              Your likes
            </NavLink>
          </li>
          <li>
            <NavLink to="/created" className={linkClass}>
              Created by you
            </NavLink>
          </li>

          {/* Admin-only navigation */}
          {isAdmin && (
            <>
              <li className="mt-4 mb-2">
                <div className="px-4 text-sm font-medium text-white/40">Admin</div>
              </li>
              <li>
                <NavLink to="/admin/users" className={linkClass}>
                  Users
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/genres" className={linkClass}>
                  Genres
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/invites" className={linkClass}>
                  Invites
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="mt-auto px-2 pb-4">
        <ul className="flex flex-col gap-1">
          <li>
            <NavLink to="/profile" className={linkClass}>
              Profile
            </NavLink>
          </li>
          <li>
            <NavLink to="/preferences" className={linkClass}>
              Preferences
            </NavLink>
          </li>
          <li>
            <NavLink to="/account" className={linkClass}>
              Account
            </NavLink>
          </li>
        </ul>

        {/* Footer links */}
        <div className="mt-4 px-4 text-sm">
          <ul className="flex flex-col gap-2 text-white/40">
            <li>
              <a href="/privacy" className="hover:text-white/60">
                Privacy policy
              </a>
            </li>
            <li>
              <a href="/terms" className="hover:text-white/60">
                Terms of service
              </a>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
