import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { AuthContext } from "../../contexts/AuthContext";
import { cn } from '../../lib/utils';
import { useProfile } from "../../hooks/useProfile";

export function ProfileNav() {
  const { username } = useParams();
  const auth = React.useContext(AuthContext);
  const { profile } = useProfile(auth?.user?.id);
  const isOwnProfile = !username || profile?.username === username;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'block px-4 py-2 rounded-lg transition-colors',
      isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
    );

  if (!isOwnProfile) {
    return (
      <nav>
        <ul className="flex flex-col gap-1">
          <li>
            <NavLink to="likes" className={linkClass}>
              Likes
            </NavLink>
          </li>
        </ul>
      </nav>
    );
  }

  return (
    <nav>
      <ul className="flex flex-col gap-1">
        <li>
          <NavLink to="likes" className={linkClass}>
            Likes
          </NavLink>
        </li>
        <li>
          <NavLink to="preferences" className={linkClass}>
            Preferences
          </NavLink>
        </li>
        <li>
          <NavLink to="account" className={linkClass}>
            Account
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}