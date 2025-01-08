import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Sidebar } from "./layout/Sidebar";
import { Menu } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen text-white">
        <div className="mx-auto p-10">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="sidebar-toggle"
        aria-label="Toggle navigation menu"
      >
        <Menu size={24} />
      </button>

      <div className={`sidebar ${isSidebarOpen ? 'sidebar--open' : ''}`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <main className="sm:ml-60 relative z-0">
        <div className="mx-auto p-10">{children}</div>
      </main>
    </div>
  );
}
