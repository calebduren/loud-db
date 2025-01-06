import React from "react";
import { NavLink } from "react-router-dom";
import { Logo } from "../ui/Logo";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";
import { useProfile } from "../../hooks/useProfile";
import { PrivacyPolicyModal } from "../legal/PrivacyPolicyModal";
import { TermsModal } from "../legal/TermsModal";

export const Sidebar = () => {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const [isPrivacyOpen, setIsPrivacyOpen] = React.useState(false);
  const [isTermsOpen, setIsTermsOpen] = React.useState(false);

  const isAdmin = profile?.role === "admin";
  const isCreator = profile?.role === "creator";

  console.log("Auth state:", { isAdmin, isCreator, user, profile });

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn("sidebar__nav-item", isActive && "sidebar__nav-item--active");

  const NavItem = ({
    to,
    children,
  }: {
    to: string;
    children: React.ReactNode;
  }) => {
    return (
      <NavLink to={to} className={linkClass}>
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
    <aside className="sidebar">
      {/* Logo section */}
      <NavLink to="/" className="sidebar__logo-container">
        <div className="sidebar__logo">
          <Logo className="text-white h-6" />
        </div>
      </NavLink>

      {/* Main navigation */}
      <nav className="sidebar__nav">
        <ul className="sidebar__list">
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

      {/* Footer navigation */}
      <div className="sidebar__bottom">
        <nav className="sidebar__footer">
          <ul className="sidebar__footer-links">
            <li>
              <NavItem to={`/${profile?.username}`}>Profile</NavItem>
            </li>
            <li>
              <NavItem to="/preferences">Preferences</NavItem>
            </li>
            <li>
              <NavItem to="/account">Account</NavItem>
            </li>
            <li>
              <button
                onClick={() => setIsPrivacyOpen(true)}
                className="sidebar__footer-link"
              >
                Privacy policy
              </button>
            </li>
            <li>
              <button
                onClick={() => setIsTermsOpen(true)}
                className="sidebar__footer-link"
              >
                Terms of service
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
    </aside>
  );
};
