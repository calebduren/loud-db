import React from 'react';
import { useUsers } from '../../../hooks/admin/useUsers';
import { UserTable } from './UserTable';
import { LoadingSpinner } from '../../LoadingSpinner';

export function UserManagement() {
  const { users, loading, updateUserRole, toggleSuspension } = useUsers();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>
      <UserTable 
        users={users}
        onUpdateRole={updateUserRole}
        onToggleSuspension={toggleSuspension}
      />
    </div>
  );
}