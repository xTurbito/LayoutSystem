import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  LayoutGrid,
  Settings,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { getIcon } from '../lib/iconMapper';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface TooltipState {
  label: string;
  y: number;
  x: number;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useAuth();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const modules = user?.role.modules
    .filter((m) => m.isActive && m.actions > 0)
    .sort((a, b) => a.order - b.order) ?? [];

  const linkClass = (isActive: boolean) =>
    clsx(
      'flex items-center gap-2.5 rounded-lg text-sm transition-colors no-underline whitespace-nowrap',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
      collapsed ? 'justify-center mx-2 p-2' : 'px-3 py-2 mx-2',
      isActive
        ? 'bg-primary text-white font-medium shadow-sm'
        : 'text-secondary hover:bg-primary/8 hover:text-primary',
    );

  function showTooltip(e: React.MouseEvent<HTMLAnchorElement>, label: string) {
    if (!collapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ label, y: rect.top + rect.height / 2, x: rect.right });
  }

  return (
    <aside className={clsx(
      'fixed top-0 left-0 z-30 w-55',
      'lg:relative lg:z-auto lg:w-auto',
      'flex flex-col h-screen bg-surface border-r border-border overflow-hidden',
      collapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0',
      'transition-transform duration-200 ease-in-out lg:transition-none motion-reduce:transition-none',
    )}>

      {/* Tooltip — portal para escapar transforms/overflow del aside */}
      {tooltip && collapsed && createPortal(
        <div
          className="fixed z-[100] px-2 py-1 rounded-md bg-text text-surface text-xs font-medium pointer-events-none whitespace-nowrap -translate-y-1/2"
          style={{ top: tooltip.y, left: tooltip.x + 8 }}
        >
          {tooltip.label}
        </div>,
        document.body
      )}

      {/* Header */}
      <div
        className="flex items-center justify-between px-3 shrink-0 border-b border-border"
        style={{ height: 'var(--header-height)' }}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white shrink-0">
              <LayoutGrid size={15} />
            </div>
            <span className="font-semibold text-sm text-text truncate">LayoutSystem</span>
          </div>
        )}
        <button
          className="text-secondary hover:text-text p-2.5 rounded-md transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => linkClass(isActive)}
          aria-label={collapsed ? 'Dashboard' : undefined}
          onMouseEnter={(e) => showTooltip(e, 'Dashboard')}
          onMouseLeave={() => setTooltip(null)}
        >
          <LayoutDashboard size={16} />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        {modules.map((mod) => {
          const Icon = getIcon(mod.icon);
          return (
            <NavLink
              key={mod.route}
              to={mod.route}
              className={({ isActive }) => linkClass(isActive)}
              aria-label={collapsed ? mod.name : undefined}
              onMouseEnter={(e) => showTooltip(e, mod.name)}
              onMouseLeave={() => setTooltip(null)}
            >
              <Icon size={16} />
              {!collapsed && <span>{mod.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex flex-col shrink-0 py-2">
        <div className="border-t border-border my-1 mx-3" />

        <NavLink
          to="/settings"
          className={({ isActive }) => linkClass(isActive)}
          aria-label={collapsed ? 'Configuración' : undefined}
          onMouseEnter={(e) => showTooltip(e, 'Configuración')}
          onMouseLeave={() => setTooltip(null)}
        >
          <Settings size={16} />
          {!collapsed && <span>Configuración</span>}
        </NavLink>

      </div>

    </aside>
  );
}
