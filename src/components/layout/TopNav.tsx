import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Logo } from "../ui/Logo";
import { cn } from "../../lib/utils";
import { PrivacyPolicyModal } from "../legal/PrivacyPolicyModal";
import { TermsModal } from "../legal/TermsModal";
import { SignOutButton } from "../SignOutButton";
import { useProfile } from "../../hooks/useProfile";
import { useAuth } from "../../contexts/AuthContext";
import { Menu } from "@headlessui/react";
import { Menu as MenuIcon, X, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { ReleaseFormModal } from "../admin/ReleaseFormModal";
import { PlaylistImportModal } from "../admin/PlaylistImportModal";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { importFromReddit } from "../../api/reddit";
import { PixelAvatar } from "../user/profile/PixelAvatar";
import { SpotifyConnectModal } from "../spotify/SpotifyConnectModal";
import { useSpotifyConnection } from "../../hooks/useSpotifyConnection";

interface TopNavProps {
  className?: string;
}

export const TopNav = React.memo(({ className }: TopNavProps) => {
  const { user, isAdmin, canManageReleases } = useAuth();
  const { profile } = useProfile(user?.id);
  const { isConnected, loading, connect, disconnect } = useSpotifyConnection();
  const [isPrivacyOpen, setIsPrivacyOpen] = React.useState(false);
  const [isTermsOpen, setIsTermsOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = React.useState(false);
  const location = useLocation();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn("top-nav__nav-item", isActive && "top-nav__nav-item--active");

  const handleRedditImport = async () => {
    try {
      setIsImporting(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("You must be logged in to import albums");
        return;
      }

      const result = await importFromReddit(session.user.id);

      if (result) {
        const successCount = result.created.length;
        const failCount = result.errors.length;

        if (successCount > 0) {
          toast.success(
            `Successfully imported ${successCount} album${
              successCount === 1 ? "" : "s"
            }`
          );
        }

        if (failCount > 0) {
          toast.error(
            `Failed to import ${failCount} album${failCount === 1 ? "" : "s"}`
          );
        }
      }
    } catch (error) {
      console.error("Error importing from Reddit:", error);
      toast.error("Failed to import from Reddit");
    } finally {
      setIsImporting(false);
    }
  };

  const NavItem = ({
    to,
    children,
  }: {
    to: string;
    children: React.ReactNode;
  }) => {
    return (
      <NavLink
        to={to}
        className={linkClass}
        onClick={() => setIsMobileMenuOpen(false)}
      >
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

  const SpotifyIcon = () => (
    <button
      onClick={() => setIsSpotifyModalOpen(true)}
      className="transition-opacity hover:opacity-80"
      title={
        profile?.spotify_connected
          ? "Connected to Spotify"
          : "Connect to Spotify"
      }
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14 0C6.2805 0 0 6.2805 0 14C0 21.7195 6.2805 28 14 28C21.7195 28 28 21.7201 28 14C28 6.27989 21.7195 0 14 0ZM19.9258 20.2927C19.7499 20.5567 19.4603 20.6991 19.1652 20.6991C18.9912 20.6991 18.8153 20.6498 18.6596 20.5458C17.1549 19.5424 14.603 18.8731 12.4734 18.8737C10.2136 18.875 8.51962 19.4299 8.50259 19.4353C8.02555 19.5972 7.50776 19.3368 7.34834 18.8585C7.18893 18.3803 7.44752 17.8631 7.92577 17.7043C8.00608 17.6775 9.9209 17.0502 12.4734 17.049C14.603 17.0478 17.565 17.6221 19.6726 19.0271C20.0925 19.307 20.2057 19.8734 19.9258 20.2927ZM21.7463 16.5567C21.5485 16.8744 21.2072 17.049 20.8585 17.049C20.6699 17.049 20.4789 16.9985 20.3073 16.8908C17.5789 15.1908 14.7752 14.8312 12.3596 14.8524C9.63249 14.8768 7.45178 15.397 7.41466 15.408C6.86279 15.565 6.28232 15.2425 6.12473 14.6882C5.96714 14.1326 6.29023 13.5552 6.84515 13.3982C7.01369 13.3502 9.19014 12.8147 12.1698 12.7898C14.8865 12.7673 18.272 13.1609 21.4128 15.1177C21.9014 15.422 22.0517 16.0669 21.7463 16.5567ZM23.5625 12.188C23.3356 12.5738 22.9291 12.7886 22.5117 12.7886C22.3024 12.7886 22.0907 12.7344 21.8966 12.6212C18.7168 10.7545 14.8506 10.3584 12.1673 10.3547C12.1545 10.3547 12.1418 10.3547 12.129 10.3547C8.88409 10.3547 6.38515 10.9255 6.36021 10.9315C5.70429 11.0818 5.05141 10.6766 4.8993 10.0219C4.74719 9.36781 5.15303 8.71433 5.80712 8.56161C5.91968 8.53544 8.5896 7.9209 12.129 7.9209C12.143 7.9209 12.157 7.9209 12.171 7.9209C15.1555 7.92516 19.4792 8.37907 23.1293 10.5221C23.7085 10.8628 23.9026 11.6088 23.5625 12.188Z"
          fill={profile?.spotify_connected ? "#1DB954" : "currentColor"}
          className="opacity-32"
        />
      </svg>
    </button>
  );

  if (!user) return null;

  return (
    <>
      <header
        className={cn(
          "top-nav",
          className,
          isMobileMenuOpen && "top-nav--mobile-open"
        )}
      >
        <div className="top-nav__container">
          {/* Logo and mobile menu button */}
          <div className="top-nav__left">
            <NavLink to="/" className="top-nav__logo">
              <Logo className="text-white h-6" />
            </NavLink>
            <button
              className="top-nav__mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Main navigation */}
          <nav
            className={cn(
              "top-nav__nav",
              isMobileMenuOpen && "top-nav__nav--mobile-open"
            )}
          >
            <div className="top-nav__list">
              <NavItem to="/">New music</NavItem>
              <NavItem to="/likes">Likes</NavItem>
              {(isAdmin || canManageReleases) && (
                <NavItem to="/submissions">Submissions</NavItem>
              )}
              {isAdmin && (
                <>
                  <NavItem to="/admin/users">Users</NavItem>
                  <NavItem to="/admin/components">Components</NavItem>
                  <NavItem to="/admin/genres">Genres</NavItem>
                  <NavItem to="/admin/invites">Invites</NavItem>
                </>
              )}
            </div>
          </nav>

          {/* Right side actions */}
          <div className="top-nav__actions">
            {/* Page-specific actions */}
            <div className="hidden sm:flex items-center gap-2">
              {isAdmin && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => setIsPlaylistModalOpen(true)}
                  >
                    Import playlist
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleRedditImport}
                    disabled={isImporting}
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      "Reddit Scraper"
                    )}
                  </Button>
                </>
              )}
              {(isAdmin || canManageReleases) && (
                <Button
                  variant="primary"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Add release
                </Button>
              )}
            </div>

            <SpotifyIcon />
            <Menu as="div" className="top-nav__user-menu">
              <Menu.Button className="top-nav__user-button">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PixelAvatar seed={profile?.username || ""} size={32} />
                  )}
                </div>
              </Menu.Button>
              <Menu.Items className="top-nav__user-menu-items">
                <div className="top-nav__user-info">
                  <div className="font-medium">{profile?.username}</div>
                  <div className="text-sm text-white/60">{user.email}</div>
                </div>
                <div className="top-nav__user-menu-links">
                  <Menu.Item>
                    {({ active }) => (
                      <NavLink
                        to="/profile"
                        className={cn(
                          "top-nav__user-menu-item",
                          active && "top-nav__user-menu-item--active"
                        )}
                      >
                        Profile
                      </NavLink>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <NavLink
                        to="/account"
                        className={cn(
                          "top-nav__user-menu-item",
                          active && "top-nav__user-menu-item--active"
                        )}
                      >
                        Account
                      </NavLink>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <NavLink
                        to="/preferences"
                        className={cn(
                          "top-nav__user-menu-item",
                          active && "top-nav__user-menu-item--active"
                        )}
                      >
                        Preferences
                      </NavLink>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    <SignOutButton className="top-nav__user-menu-item" />
                  </Menu.Item>
                </div>
                <div className="top-nav__user-menu-footer">
                  <button
                    onClick={() => setIsPrivacyOpen(true)}
                    className="top-nav__user-menu-footer-link"
                  >
                    Privacy policy
                  </button>
                  <button
                    onClick={() => setIsTermsOpen(true)}
                    className="top-nav__user-menu-footer-link"
                  >
                    Terms of service
                  </button>
                </div>
              </Menu.Items>
            </Menu>
          </div>
        </div>
      </header>

      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <ReleaseFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <PlaylistImportModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
      />
      <SpotifyConnectModal
        isOpen={isSpotifyModalOpen}
        onClose={() => setIsSpotifyModalOpen(false)}
        isConnected={isConnected}
        onConnect={connect}
        onDisconnect={disconnect}
        loading={loading}
      />
    </>
  );
});
