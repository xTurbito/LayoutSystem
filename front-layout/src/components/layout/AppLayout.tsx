import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import clsx from 'clsx';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const toggle = () => setCollapsed((c) => !c);

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
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={toggle}
        />
      )}

      <Sidebar collapsed={collapsed} onToggle={toggle} />

      <div className="app-layout__main">
        <Header onMenuClick={toggle} />
        <main id="main-content" className="app-layout__content">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
