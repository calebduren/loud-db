import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Sidebar } from "./layout/Sidebar";
import { Menu } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const context = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!context?.user) {
    return (
      <div className="min-h-screen text-white">
        <div className="mx-auto">{children}</div>
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
        <Menu size={24} strokeWidth={1.5} />
      </button>

      <div className={`sidebar ${isSidebarOpen ? "sidebar--open" : ""}`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <main className="mt-12 sm:mt-0 sm:ml-60 relative z-0 p-10">
        <div className="mx-auto">{children}</div>
      </main>
    </div>
  );
}
