import React from 'react';
import { ProfileForm } from './ProfileForm';
import { EmailForm } from './EmailForm';
import { PasswordForm } from './PasswordForm';
import { DeleteAccount } from './DeleteAccount';

export function AccountSettings() {
  return (
    <div className="space-y-8">
      <ProfileForm />
      <EmailForm />
      <PasswordForm />
      <DeleteAccount />
    </div>
  );
}