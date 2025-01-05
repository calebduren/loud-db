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
    cn("sidebar__nav-item", isActive ? "sidebar__nav-item--active" : "");

  const NavItem = ({
    to,
    children,
  }: {
    to: string;
    children: React.ReactNode;
  }) => {
    const [wasActive, setWasActive] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [wasHovered, setWasHovered] = useState(false);
    const barRef = useRef<HTMLDivElement>(null);

    return (
      <NavLink 
        to={to} 
        className={linkClass}
        onMouseEnter={() => {
          setIsHovered(true);
          setWasHovered(true);
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        {({ isActive }) => {
          useEffect(() => {
            if (!isActive && wasActive) {
              // Start deactivation animation
              barRef.current?.classList.add("nav-bar-deactivate");
            }
            setWasActive(isActive);
          }, [isActive]);

          return (
            <>
              <div
                ref={barRef}
                className={cn(
                  "nav-bar",
                  isActive && (!wasActive ? "nav-bar-activate" : "nav-bar-active"),
                  isHovered && !isActive && !wasActive && "nav-bar-hover",
                  !isHovered && wasHovered && !isActive && !wasActive && "nav-bar-unhover"
                )}
                onAnimationEnd={() => {
                  if (!isActive && wasActive) {
                    barRef.current?.classList.remove("nav-bar-deactivate");
                    setWasActive(false);
                  }
                  if (!isHovered) {
                    setWasHovered(false);
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
    <aside className="sidebar">
      {/* Action Buttons */}
      <div className="sidebar__actions">
        {canManageReleases && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="sidebar__action-button"
          >
            <Plus className="w-4 h-4" />
            Add Release
          </Button>
        )}
        {isAdmin && (
          <Button
            variant="outline"
            onClick={() => setIsPlaylistModalOpen(true)}
            className="sidebar__action-button"
          >
            <ListMusic className="w-4 h-4" />
            Import Playlist
          </Button>
        )}
      </div>

      {/* Logo section */}
      <div className="sidebar__logo">
        <Logo className="text-white h-6" />
      </div>

      {/* Main navigation */}
      <nav className="sidebar__nav">
        <div className="sidebar__list">
          <NavItem to="/">New music</NavItem>
          <NavItem to="/likes">Your likes</NavItem>
          {(isAdmin || profile?.role === "creator") && (
            <NavItem to="/created">Created by you</NavItem>
          )}
          {isAdmin && (
            <>
              <NavItem to="/admin/users">Users</NavItem>
              <NavItem to="/admin/genres">Genres</NavItem>
              <NavItem to="/admin/invites">Invites</NavItem>
            </>
          )}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="sidebar__bottom">
        <div className="sidebar__list">
          <NavItem to={`/${profile?.username}`}>Profile</NavItem>
          <NavItem to="/preferences">Preferences</NavItem>
          <NavItem to="/account">Account</NavItem>
        </div>

        {/* Footer links */}
        <div className="sidebar__footer">
          <div className="sidebar__footer-links">
            <a href="/privacy" className="sidebar__footer-link">
              Privacy policy
            </a>
            <a href="/terms" className="sidebar__footer-link">
              Terms of service
            </a>
          </div>
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
  );
}
