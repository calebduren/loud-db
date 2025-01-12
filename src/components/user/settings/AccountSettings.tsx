import React from "react";
import { ProfileForm } from "./ProfileForm";
import { EmailForm } from "./EmailForm";
import { PasswordForm } from "./PasswordForm";
import { DeleteAccount } from "./DeleteAccount";
import { PageTitle } from "../../layout/PageTitle";

export function AccountSettings() {
  return (
    <div>
      <PageTitle
        title="Account Settings"
        subtitle="Manage your account details and preferences"
      />

      <div className="max-w-2xl space-y-8">
        <ProfileForm />
        <EmailForm />
        <PasswordForm />
        <DeleteAccount />
      </div>
    </div>
  );
}
