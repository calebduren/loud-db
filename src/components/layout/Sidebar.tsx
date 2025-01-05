import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Logo } from "../ui/Logo";
import { cn } from "../../lib/utils";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../hooks/usePermissions";
import { useProfile } from "../../hooks/useProfile";
import { Button } from "../ui/button";
import { Plus, ListMusic } from "lucide-react";
import { ReleaseFormModal } from "../admin/ReleaseFormModal";
import { PlaylistImportModal } from "../admin/PlaylistImportModal";

export function Sidebar() {
  const { user } = useAuth();
  const { isAdmin, canManageReleases, loading } = usePermissions();
  const { profile } = useProfile(user?.id);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  // Get initials from name
  const getInitials = (name?: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 font-medium px-4 py-2 text-[15px] transition-colors",
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

  if (!profile || loading) return null;

  return (
    <>
      <aside className="w-64 h-screen text-white flex flex-col fixed left-0 top-0 z-10 p-6">
        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {canManageReleases && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 w-full"
            >
              <Plus className="w-4 h-4" />
              Add Release
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => setIsPlaylistModalOpen(true)}
              className="flex items-center gap-2 w-full"
            >
              <ListMusic className="w-4 h-4" />
              Import Playlist
            </Button>
          )}
        </div>

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
            {(isAdmin || profile?.role === "creator") && (
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
              <NavItem to={`/${profile?.username}`}>Profile</NavItem>
            </li>
            <li>
              <NavItem to="/preferences">Preferences</NavItem>
            </li>
            <li>
              <NavItem to="/account">Account</NavItem>
            </li>
          </ul>

          {/* Footer links */}
          <div className="mt-4 text-[13px] border-t border-white/10">
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

        {/* Modals */}
        <ReleaseFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            window.location.reload();
          }}
        />

        <PlaylistImportModal
          isOpen={isPlaylistModalOpen}
          onClose={() => setIsPlaylistModalOpen(false)}
          onSuccess={() => {
            setIsPlaylistModalOpen(false);
            window.location.reload();
          }}
        />
      </aside>
    </>
  );
}
