import React from 'react';
import { UserManagement } from '@/components/UserManagement';

export const UserManagementPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage users, roles, and permissions in the system
        </p>
      </div>

      {/* User Management Component */}
      <UserManagement />
    </div>
  );
};
