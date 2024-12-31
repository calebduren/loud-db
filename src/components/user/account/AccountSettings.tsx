import React from 'react';
import { ProfileForm } from './ProfileForm';
import { EmailForm } from './EmailForm';
import { PasswordForm } from './PasswordForm';
import { DeleteAccount } from './DeleteAccount';

export function AccountSettings() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      
      <div className="space-y-8">
        <ProfileForm />
        <EmailForm />
        <PasswordForm />
        <DeleteAccount />
      </div>
    </div>
  );
}