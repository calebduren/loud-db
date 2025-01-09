import React from "react";
import { Profile, UserRole } from "../../../types/database";
import { formatDate } from "../../../lib/utils/dateUtils";
import { Link } from "react-router-dom";
import { PixelAvatar } from "../../user/profile/PixelAvatar";

interface UserTableProps {
  users: Profile[];
  onUpdateRole: (userId: string, role: UserRole) => Promise<void>;
  onToggleSuspension: (userId: string, suspend: boolean) => Promise<void>;
}

export function UserTable({
  users,
  onUpdateRole,
  onToggleSuspension,
}: UserTableProps) {
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-left">
        <thead className="text-sm text-white/60 border-b border-white/10">
          <tr>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Joined</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {users.map((user) => (
            <tr key={user.id} className="text-sm">
              <td className="px-4 py-3">
                <Link
                  to={`/u/${user.username}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <PixelAvatar seed={user.username} size={32} />
                  )}
                  <div>@{user.username}</div>
                </Link>
              </td>
              <td className="px-4 py-3">
                <select
                  value={user.role}
                  onChange={(e) =>
                    onUpdateRole(user.id, e.target.value as UserRole)
                  }
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
                <select
                  value={user.suspended ? "suspended" : "active"}
                  onChange={(e) =>
                    onToggleSuspension(user.id, e.target.value === "suspended")
                  }
                  className={`bg-white/5 border border-white/10 rounded px-2 py-1 ${
                    user.suspended ? "text-red-500" : "text-green-500"
                  }`}
                >
                  <option value="active" className="text-green-500">
                    Active
                  </option>
                  <option value="suspended" className="text-red-500">
                    Suspended
                  </option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
