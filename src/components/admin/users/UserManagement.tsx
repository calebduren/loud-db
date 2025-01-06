import React from 'react';
import { useUsers } from '../../../hooks/admin/useUsers';
import { UserTable } from './UserTable';
import { ReservedUsernames } from './ReservedUsernames';
import { PageHeader } from '../../layout/PageHeader';
import { LoadingSpinner } from '../../LoadingSpinner';

export function UserManagement() {
  const { users, loading, updateUserRole, toggleSuspension } = useUsers();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader 
        title="Users" 
        subtitle="Manage user accounts and permissions"
      />
      <div className="space-y-8">
        <UserTable 
          users={users}
          onUpdateRole={updateUserRole}
          onToggleSuspension={toggleSuspension}
        />
        <ReservedUsernames />
      </div>
    </div>
  );
}