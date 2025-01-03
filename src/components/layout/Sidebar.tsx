import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Logo } from "../ui/Logo";
import { cn } from "../../lib/utils";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import { useProfile } from "../../hooks/useProfile";

const activeBarStyles = `
  @keyframes activateBar {
    from { width: 0; }
    to { width: 20px; }
  }
  
  @keyframes deactivateBar {
    from { width: 20px; }
    to { width: 0; }
  }

  .nav-bar {
    width: 0;
    height: 1px;
    background: rgb(255 255 255 / 0.6);
  }

  .nav-bar-active {
    animation: activateBar 300ms ease-out forwards;
  }

  .nav-bar-deactivate {
    animation: deactivateBar 300ms ease-out forwards;
  }
`;

export function Sidebar() {
  const { user } = useAuth();
  const { isAdmin, isCreator } = usePermissions();
  const { profile } = useProfile(user?.id);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 px-4 py-2 text-[15px] transition-colors",
      isActive ? "text-white" : "text-white/60 hover:text-white"
    );

  const NavItem = ({
    to,
    children,
  }: {
    to: string;
    children: React.ReactNode;
  }) => {
    const [wasActive, setWasActive] = useState(false);
    const barRef = useRef<HTMLDivElement>(null);

    return (
      <NavLink to={to} className={linkClass}>
        {({ isActive }) => {
          useEffect(() => {
            if (!isActive && wasActive) {
              // Only apply deactivate animation if this item was previously active
              barRef.current?.classList.add("nav-bar-deactivate");
            }
            setWasActive(isActive);
          }, [isActive]);

          return (
            <>
              <div
                ref={barRef}
                className={cn("nav-bar", isActive && "nav-bar-active")}
                onAnimationEnd={() => {
                  if (!isActive) {
                    barRef.current?.classList.remove("nav-bar-deactivate");
                  }
                }}
              />
              <span>{children}</span>
            </>
          );
        }}
      </NavLink>
    );
  };

  if (!profile) return null;

  return (
    <>
      <style>{activeBarStyles}</style>
      <aside className="w-64 h-screen bg-[#121212] text-white flex flex-col fixed left-0 top-0">
        {/* Logo section */}
        <div className="p-4">
          <Logo className="text-white h-6" />
        </div>

        {/* Main navigation */}
        <nav className="flex-1">
          <ul className="flex flex-col">
            <li>
              <NavItem to="/">New music</NavItem>
            </li>
            <li>
              <NavItem to="/likes">Your likes</NavItem>
            </li>
            {(isAdmin || isCreator) && (
              <li>
                <NavItem to="/created">Created by you</NavItem>
              </li>
            )}
            {isAdmin && (
              <>
                <li>
                  <NavItem to="/admin/users">Users</NavItem>
                </li>
                <li>
                  <NavItem to="/admin/genres">Genres</NavItem>
                </li>
                <li>
                  <NavItem to="/admin/invites">Invites</NavItem>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="mt-auto">
          <ul className="flex flex-col">
            <li>
              <NavItem to={`/${profile.username}`}>Profile</NavItem>
            </li>
            <li>
              <NavItem to="/preferences">Preferences</NavItem>
            </li>
            <li>
              <NavItem to="/account">Account</NavItem>
            </li>
          </ul>

          {/* Footer links */}
          <div className="px-4 py-4 mt-4 text-[13px] border-t border-white/10">
            <ul className="flex flex-col gap-2 text-white/40">
              <li>
                <a href="/privacy" className="hover:text-white/60">
                  Privacy policy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-white/60">
                  Terms of service
                </a>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
}
