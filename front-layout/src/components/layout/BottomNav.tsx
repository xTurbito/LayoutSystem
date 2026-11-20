import { NavLink, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { getIcon } from '../lib/iconMapper';
import { preloadRoute } from '../../router/preload';
import { getBottomNavModules, getNavModules } from './navModules';

interface BottomNavProps {
  onOpenMenu: () => void;
}

const itemClass =
  'material-state flex min-h-14 min-w-0 cursor-pointer flex-col items-center justify-center gap-0.5 px-1 text-[0.6875rem] no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/45';

const iconPillClass = 'flex h-8 w-14 items-center justify-center rounded-full transition-colors';

export function BottomNav({ onOpenMenu }: BottomNavProps) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const items = getBottomNavModules(getNavModules(user?.role.modules));
  // Modules that don't fit live behind "Más"; light it up so the user still sees where they are.
  const enMas = !items.some((m) => pathname === m.route || pathname.startsWith(`${m.route}/`));

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-20 grid border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden"
      style={{ gridTemplateColumns: `repeat(${items.length + 1}, minmax(0, 1fr))` }}
    >
      {items.map((mod) => {
        const Icon = getIcon(mod.icon);
        return (
          <NavLink
            key={mod.route}
            to={mod.route}
            onPointerDown={() => preloadRoute(mod.route)}
            className={({ isActive }) =>
              clsx(itemClass, isActive ? 'font-semibold text-primary' : 'text-secondary')
            }
          >
            {({ isActive }) => (
              <>
                <span className={clsx(iconPillClass, isActive && 'bg-primary/12')}>
                  <Icon size={22} className="shrink-0" />
                </span>
                <span className="max-w-full truncate">{mod.name}</span>
              </>
            )}
          </NavLink>
        );
      })}
      <button
        type="button"
        onClick={onOpenMenu}
        aria-current={enMas ? 'page' : undefined}
        className={clsx(itemClass, enMas ? 'font-semibold text-primary' : 'text-secondary')}
      >
        <span className={clsx(iconPillClass, enMas && 'bg-primary/12')}>
          <Menu size={22} className="shrink-0" />
        </span>
        <span>Más</span>
      </button>
    </nav>
  );
}
