import React, { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { TopNav } from "./layout/TopNav";
import { Toaster } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const context = useContext(AuthContext);

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
      <TopNav />
      <main className="layout pt-16">{children}</main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
