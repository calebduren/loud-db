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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative">
      <Sidebar />
      <main className="ml-64 relative z-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
