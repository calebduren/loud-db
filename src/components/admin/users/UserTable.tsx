import React from 'react';
import { Ban, CheckCircle } from 'lucide-react';
import { Profile, UserRole } from '../../../types/database';
import { formatDate } from '../../../lib/utils/dateUtils';

interface UserTableProps {
  users: (Profile & { email: string })[];
  onUpdateRole: (userId: string, role: UserRole) => Promise<void>;
  onToggleSuspension: (userId: string, suspend: boolean) => Promise<void>;
}

export function UserTable({ users, onUpdateRole, onToggleSuspension }: UserTableProps) {
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-left">
        <thead className="text-sm text-white/60 border-b border-white/10">
          <tr>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Joined</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {users.map((user) => (
            <tr key={user.id} className="text-sm">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/10" />
                  )}
                  <span>{user.username}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-white/60">{user.email}</td>
              <td className="px-4 py-3">
                <select
                  value={user.role}
                  onChange={(e) => onUpdateRole(user.id, e.target.value as UserRole)}
                  className="bg-white/5 border border-white/10 rounded px-2 py-1"
                >
                  <option value="user">User</option>
                  <option value="creator">Creator</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="px-4 py-3 text-white/60">
                {formatDate(user.created_at)}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  user.suspended 
                    ? 'bg-red-500/10 text-red-500' 
                    : 'bg-green-500/10 text-green-500'
                }`}>
                  {user.suspended ? (
                    <>
                      <Ban className="w-3 h-3" />
                      Suspended
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </>
                  )}
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onToggleSuspension(user.id, !user.suspended)}
                  className={`text-sm ${
                    user.suspended
                      ? 'text-green-500 hover:text-green-400'
                      : 'text-red-500 hover:text-red-400'
                  }`}
                >
                  {user.suspended ? 'Unsuspend' : 'Suspend'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}