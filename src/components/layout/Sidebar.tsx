import React from "react";
import { NavLink } from "react-router-dom";
import { Logo } from "../ui/Logo";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";
import { useProfile } from "../../hooks/useProfile";
import { PrivacyPolicyModal } from "../legal/PrivacyPolicyModal";
import { TermsModal } from "../legal/TermsModal";
import { SignOutButton } from "../SignOutButton";

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar = ({ onClose }: SidebarProps) => {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const [isPrivacyOpen, setIsPrivacyOpen] = React.useState(false);
  const [isTermsOpen, setIsTermsOpen] = React.useState(false);

  const isAdmin = profile?.role === "admin";
  const isCreator = profile?.role === "creator";

  console.log("Auth state:", { isAdmin, isCreator, user, profile });

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn("sidebar__nav-item", isActive && "sidebar__nav-item--active");

  // Handle navigation click on mobile
  const handleNavClick = () => {
    if (onClose) onClose();
  };

  const NavItem = ({
    to,
    children,
  }: {
    to: string;
    children: React.ReactNode;
  }) => {
    return (
      <NavLink to={to} className={linkClass} onClick={handleNavClick}>
        {({ isActive }) => (
          <div className="flex items-center">
            <div
              className={cn(
                "nav-indicator",
                isActive && "nav-indicator--active"
              )}
            />
            <span>{children}</span>
          </div>
        )}
      </NavLink>
    );
  };

  if (!profile) return null;

  return (
    <>
      {/* Logo section */}
      <NavLink to="/" className="sidebar__logo-container">
        <div className="sidebar__logo">
          <Logo className="text-white h-6" />
        </div>
      </NavLink>

      {/* Main navigation */}
      <nav className="sidebar__nav">
        <div className="sidebar__list">
          <div>
            <NavItem to="/">New music</NavItem>
          </div>
          <div>
            <NavItem to="/likes">Likes</NavItem>
          </div>
          {(isAdmin || isCreator) && (
            <div>
              <NavItem to="/created">Submissions</NavItem>
            </div>
          )}
          {isAdmin && (
            <>
              <div>
                <NavItem to="/admin/users">Users</NavItem>
              </div>
              <div>
                <NavItem to="/admin/components">Components</NavItem>
              </div>
              <div>
                <NavItem to="/admin/genres">Genres</NavItem>
              </div>
              <div>
                <NavItem to="/admin/invites">Invites</NavItem>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Footer navigation */}
      <div className="sidebar__bottom">
        <nav className="sidebar__footer">
          <div className="sidebar__footer-links">
            <div>
              <NavItem to={`/u/${profile.username}`}>Profile</NavItem>
            </div>
            <div>
              <NavItem to="/preferences">Preferences</NavItem>
            </div>
            <div>
              <NavItem to="/account">Account</NavItem>
            </div>
            <div className="sidebar__footer-legal">
              <SignOutButton />
              <button
                onClick={() => setIsPrivacyOpen(true)}
                className="sidebar__footer-legal-link"
              >
                Privacy policy
              </button>
              <div>
                <button
                  onClick={() => setIsTermsOpen(true)}
                  className="sidebar__footer-legal-link"
                >
                  Terms of service
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </>
  );
};
