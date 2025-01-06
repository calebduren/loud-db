import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Sidebar } from "./layout/Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen text-white">
        <div className="mx-auto p-10">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative">
      <Sidebar />
      <main className="ml-60 relative z-0">
        <div className="mx-auto p-10">{children}</div>
      </main>
    </div>
  );
}
