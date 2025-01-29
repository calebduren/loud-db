import React from "react";
import { useDeleteAccount } from "../../../hooks/settings/useDeleteAccount";
import { Button } from "../../ui/button";

export function DeleteAccount() {
  const { handleDelete, deleting, error } = useDeleteAccount();

  return (
    <div className="card border-red-500/20">
      <h2 className="card__title text-red-500">Delete Account</h2>

      <div className="space-y-6">
        <p className="text-white/60 text-sm">
          This action cannot be undone. This will permanently delete your
          account and remove your data from our servers.
        </p>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <Button
          variant="destructive"
          onClick={handleDelete}
          loading={deleting}
          disabled={deleting}
        >
          Delete Account
        </Button>
      </div>
    </div>
  );
}
