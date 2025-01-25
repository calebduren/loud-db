import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Sidebar } from "./layout/Sidebar";
import { Menu } from "lucide-react";
import { Toaster } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const context = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!context?.user) {
    return (
      <div className="min-h-screen">
        {children}
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
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
      <main className="layout">{children}</main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
