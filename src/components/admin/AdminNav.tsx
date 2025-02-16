import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const navItems = [
  { path: "users", label: "Users" },
  { path: "genres", label: "Genres" },
  { path: "invites", label: "Invites" },
];

export function AdminNav() {
  const location = useLocation();
  const currentPath = location.pathname.split("/")[2] || "users";

  return (
    <nav className="mb-8">
      <Tabs value={currentPath} className="tabs">
        <TabsList className="tabs__list">
          {navItems.map(({ path, label }) => (
            <TabsTrigger
              key={path}
              value={path}
              className="tabs__trigger"
              asChild
            >
              <NavLink to={`/admin/${path}`}>
                <span className="tabs__trigger-icon">{label}</span>
              </NavLink>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </nav>
  );
}
