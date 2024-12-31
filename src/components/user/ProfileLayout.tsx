import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ProfileNav } from "./ProfileNav";
import { useAuth } from "../../hooks/useAuth";
import { LoadingSpinner } from "../LoadingSpinner";

export function ProfileLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return (
    <div className="space-y-8">
      <ProfileNav />
      <Outlet />
    </div>
  );
}
