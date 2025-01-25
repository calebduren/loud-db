import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';

const navItems = [
  { path: 'users', label: 'Users' },
  { path: 'genres', label: 'Genre Mapping' },
  { path: 'no-genres', label: 'Missing Genres' },
  { path: 'invites', label: 'Invite Codes' },
  { path: 'components', label: 'Components' },
];

export function AdminNav() {
  return (
    <nav className="mb-8">
      <ul className="flex gap-4 border-b border-gray-200 dark:border-gray-800">
        {navItems.map(({ path, label }) => (
          <li key={path}>
            <NavLink
              to={`/admin/${path}`}
              className={({ isActive }) =>
                cn(
                  'inline-block px-4 py-2 -mb-px text-sm font-medium',
                  'hover:text-primary transition-colors',
                  'border-b-2',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground'
                )
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
