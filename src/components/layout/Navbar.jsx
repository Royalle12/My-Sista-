/**
 * src/components/layout/Navbar.jsx
 * Top navigation bar — shows on desktop, hides on mobile (BottomNav handles mobile).
 */

import { Link, useLocation } from 'react-router-dom';
import { Flame, BookmarkIcon, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

export default function Navbar() {
  const { pathname } = useLocation();
  const { isAuthenticated, profile, tier, logout } = useAuth();

  const navLinks = [
    { to: '/feed',     label: 'Feed' },
    { to: '/check-in', label: 'Check-In' },
    { to: '/upgrade',  label: 'Upgrade', highlight: tier === 'free' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[var(--nav-height)] bg-surface/80 backdrop-blur-md border-b border-primary/8">
      <div className="container-app h-full flex items-center justify-between">

        {/* Logo */}
        <Link to={isAuthenticated ? '/feed' : '/'} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-soft group-hover:shadow-glow transition-shadow duration-300">
            <span className="text-white text-sm font-bold font-display">S</span>
          </div>
          <span className="font-display font-semibold text-lg text-dark hidden sm:block">
            My <span className="text-gradient">Sista</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map(({ to, label, highlight }) => (
              <Link
                key={to}
                to={to}
                className={[
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  pathname === to
                    ? 'bg-soft text-primary font-semibold'
                    : highlight
                    ? 'text-secondary hover:bg-blush'
                    : 'text-mid hover:text-primary hover:bg-soft',
                ].join(' ')}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Streak badge */}
              {(profile?.check_in_streak ?? 0) > 0 && (
                <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-soft rounded-full border border-primary/10">
                  <Flame size={14} className="text-orange-500" />
                  <span className="text-xs font-semibold text-dark">
                    {profile.check_in_streak}
                  </span>
                </div>
              )}

              {/* Avatar / Profile link */}
              <Link
                to="/profile"
                id="nav-profile-link"
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-soft transition-colors"
                aria-label="Profile"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {(profile?.display_name ?? 'S')[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </Link>

              {/* Logout — desktop only */}
              <button
                onClick={logout}
                id="nav-logout-btn"
                className="hidden md:flex btn-ghost p-2 rounded-xl"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <Link to="/auth" id="nav-signin-btn" className="btn-primary btn-sm">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
