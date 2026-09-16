import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import clsx from 'clsx';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const location = useLocation();
  const toggle = () => setCollapsed((c) => !c);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (window.innerWidth < 1024) setCollapsed(true);
  }, [location.pathname]);

  return (
    <div className={clsx('app-layout', collapsed && 'app-layout--collapsed')}>

      {/* Skip link — primer foco del teclado, salta la navegación */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        Saltar al contenido
      </a>

      {/* Backdrop — solo móvil cuando el sidebar está abierto */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-20 bg-[var(--scrim)] lg:hidden"
          onClick={toggle}
        />
      )}

      <Sidebar collapsed={collapsed} onToggle={toggle} />

      {/* Hamburger flotante — solo móvil, cuando el sidebar está cerrado */}
      {collapsed && (
        <button
          className="fixed top-3 left-3 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-surface text-secondary shadow-[var(--shadow-1)] material-state hover:bg-primary/8 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-bg lg:hidden"
          onClick={toggle}
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
      )}

      <main id="main-content" className="app-layout__content">
        {/* h-full: sin esto ninguna pagina puede usar h-full/flex-1 de forma
            confiable (el padre de arriba, app-layout__content, si tiene altura
            fija via h-screen, pero esta caja intermedia quedaba en auto) */}
        <div key={location.pathname} className="h-full animate-page-in">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
