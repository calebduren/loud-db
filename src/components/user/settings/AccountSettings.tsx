import React from "react";
import { ProfileForm } from "./ProfileForm";
import { EmailForm } from "./EmailForm";
import { PasswordForm } from "./PasswordForm";
import { DeleteAccount } from "./DeleteAccount";
import { PageTitle } from "../../layout/PageTitle";
import { SpotifyConnection } from "./SpotifyConnection";

export function AccountSettings() {
  return (
    <div>
      <PageTitle
        title="Account Settings"
        subtitle="Manage your account details and preferences"
      />

      <div className="container--narrow">
        <ProfileForm />
        <EmailForm />
        <PasswordForm />
        <SpotifyConnection />
        <DeleteAccount />
      </div>
    </div>
  );
}
