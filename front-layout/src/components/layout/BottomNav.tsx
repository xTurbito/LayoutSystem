import { NavLink } from 'react-router-dom';
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

export function BottomNav({ onOpenMenu }: BottomNavProps) {
  const { user } = useAuth();
  const items = getBottomNavModules(getNavModules(user?.role.modules));

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-20 grid border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] lg:hidden"
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
            <Icon size={22} className="shrink-0" />
            <span className="max-w-full truncate">{mod.name}</span>
          </NavLink>
        );
      })}
      <button type="button" onClick={onOpenMenu} className={clsx(itemClass, 'text-secondary')}>
        <Menu size={22} className="shrink-0" />
        <span>Más</span>
      </button>
    </nav>
  );
}
