import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";
import { LoadingSpinner } from "../LoadingSpinner";
import { AdminNav } from "./AdminNav";

export function AdminLayout() {
  const { isAdmin, loading } = usePermissions();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2 text-red-500 bg-red-500/10 px-4 py-2 rounded-lg">
          <p>You don't have permission to access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminNav />
      <div className="container mx-auto px-4">
        <Outlet />
      </div>
    </div>
  );
}
