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
        <main className="app-layout__content">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
