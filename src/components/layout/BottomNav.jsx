/**
 * src/components/layout/BottomNav.jsx
 * Mobile bottom navigation — 4 tabs: Feed, Check-In, Upgrade, Profile
 */

import { Link, useLocation } from 'react-router-dom';
import { Newspaper, Sparkles, Zap, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';

const NAV_ITEMS = [
  { to: '/feed',     icon: Newspaper, label: 'Feed',      id: 'bn-feed' },
  { to: '/check-in', icon: Sparkles,  label: 'Check-In',  id: 'bn-checkin' },
  { to: '/upgrade',  icon: Zap,       label: 'Upgrade',   id: 'bn-upgrade' },
  { to: '/profile',  icon: User,      label: 'Profile',   id: 'bn-profile' },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface/90 backdrop-blur-md border-t border-primary/8 safe-bottom"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-[var(--bottom-nav-height)] px-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label, id }) => {
          const active = pathname === to || pathname.startsWith(to + '/');
          return (
            <Link
              key={to}
              to={to}
              id={id}
              className={[
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 tap-highlight-none min-w-[60px]',
                active
                  ? 'text-primary'
                  : 'text-mid hover:text-primary',
              ].join(' ')}
              aria-current={active ? 'page' : undefined}
            >
              <div className={[
                'p-1.5 rounded-lg transition-all duration-200',
                active ? 'bg-soft' : '',
              ].join(' ')}>
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={active ? 'text-primary' : 'text-mid'}
                />
              </div>
              <span className={[
                'text-2xs font-medium leading-none',
                active ? 'text-primary font-semibold' : 'text-mid',
              ].join(' ')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
