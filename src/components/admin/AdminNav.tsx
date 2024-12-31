import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Tags, Ticket } from 'lucide-react';

export function AdminNav() {
  const linkClass = ({ isActive }: { isActive: boolean }) => `
    flex items-center gap-2 px-4 py-2 text-sm
    ${isActive 
      ? 'text-white bg-white/10' 
      : 'text-white/60 hover:text-white hover:bg-white/5'
    }
    rounded-md transition-all duration-200
  `;

  return (
    <nav className="flex gap-2">
      <NavLink to="/admin/users" className={linkClass}>
        <Users className="w-4 h-4" />
        Users
      </NavLink>
      <NavLink to="/admin/genres" className={linkClass}>
        <Tags className="w-4 h-4" />
        Genres
      </NavLink>
      <NavLink to="/admin/invites" className={linkClass}>
        <Ticket className="w-4 h-4" />
        Invites
      </NavLink>
    </nav>
  );
}