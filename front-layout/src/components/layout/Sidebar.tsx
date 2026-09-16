import { NavLink, Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  LayoutGrid,
  Settings,
  ChevronUp,
  ChevronDown,
  LogOut,
  Palette,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { getIcon } from '../lib/iconMapper';
import { preloadRoute } from '../../router/preload';
import { useTheme } from '../../theme/useTheme';
import { PALETTES, type PaletteId } from '../../theme/palette';
import { getNextThemePreference, type ThemePreference } from '../../theme/theme';
import ModalShell from '../ui/ModalShell';
import Button from '../ui/Button';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface TooltipState {
  label: string;
  y: number;
  x: number;
}

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} satisfies Record<ThemePreference, typeof Sun>;

const themeLabels = { light: 'claro', dark: 'oscuro', system: 'del sistema' } satisfies Record<ThemePreference, string>;

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const { preference, setPreference, palette, setPalette } = useTheme();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [showLogoutDlg, setShowLogoutDlg] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!settingsOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) setSettingsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSettingsOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [settingsOpen]);

  const modules = user?.role.modules
    .filter((m) => m.isActive && m.actions > 0)
    .sort((a, b) => a.order - b.order) ?? [];

  // padding/margin quedan fijos (no condicionados a collapsed): la marca del
  // aside ya anima su ancho via CSS grid (220ms, ver .app-layout en index.css);
  // si el padding tambien cambiara de golpe al flippear collapsed, el icono
  // "saltaba" a su posicion final antes de que el contenedor terminara de
  // encogerse. Lo unico que anima ahora es el label (ver navLabelClass).
  const linkClass = (isActive: boolean) =>
    clsx(
      'material-state flex min-h-10 cursor-pointer items-center gap-2.5 overflow-hidden rounded-full text-sm no-underline whitespace-nowrap mx-2 px-3 py-2',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
      isActive
        ? 'bg-primary-container text-primary font-black shadow-[var(--shadow-1)]'
        : 'text-secondary hover:bg-primary/8 hover:text-primary',
    );

  const settingsRowClass = clsx(
    'material-state flex min-h-10 w-full cursor-pointer items-center gap-2.5 overflow-hidden rounded-full text-sm no-underline whitespace-nowrap text-left mx-2 px-3 py-2',
    'text-secondary hover:bg-primary/8 hover:text-primary',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
  );

  // El label se queda montado siempre y se achica junto con el contenedor
  // (misma duracion/easing que .app-layout en index.css) en vez de desmontarse
  // de golpe -- antes el texto desaparecia instantaneo mientras el aside
  // todavia tardaba 220ms en terminar de encogerse, y se sentia como un lag.
  const navLabelClass = clsx(
    'overflow-hidden transition-[max-width,opacity] duration-200 ease-[cubic-bezier(0.2,0,0,1)]',
    collapsed ? 'max-w-0 opacity-0' : 'ml-0 max-w-[10rem] opacity-100',
  );

  function showTooltip(e: React.MouseEvent<HTMLElement>, label: string) {
    if (!collapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ label, y: rect.top + rect.height / 2, x: rect.right });
  }

  function handleSettingsClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (collapsed) {
      onToggle();
      setSettingsOpen(true);
      return;
    }
    showTooltip(e, 'Configuración');
    setSettingsOpen((v) => !v);
  }

  const ThemeIcon = themeIcons[preference];
  const nextPreference = getNextThemePreference(preference);
  const themeDescription = `Tema actual: ${themeLabels[preference]}. Cambiar a tema ${themeLabels[nextPreference]}.`;

  return (
    <aside className={clsx(
      'fixed top-0 left-0 z-30 w-55',
      'lg:relative lg:z-auto lg:w-auto',
      'flex flex-col h-screen bg-surface overflow-hidden',
      collapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0',
      'transition-transform duration-200 ease-in-out lg:transition-none motion-reduce:transition-none',
    )}>

      <ModalShell
        open={showLogoutDlg}
        onClose={() => setShowLogoutDlg(false)}
        title="Cerrar sesión"
        description="¿Estás seguro que querés cerrar tu sesión?"
        icon={<LogOut className="w-5 h-5 text-error" />}
      >
        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            label="Cancelar"
            variant="secondary"
            onClick={() => setShowLogoutDlg(false)}
          />
          <Button
            type="button"
            label="Cerrar sesión"
            variant="danger"
            onClick={logout}
          />
        </div>
      </ModalShell>

      {/* Tooltip — portal para escapar transforms/overflow del aside */}
      {tooltip && collapsed && createPortal(
        <div
          className="fixed z-[100] -translate-y-1/2 rounded-md bg-navy-deep px-2 py-1 text-xs font-medium whitespace-nowrap text-white shadow-[var(--shadow-2)] pointer-events-none"
          style={{ top: tooltip.y, left: tooltip.x + 8 }}
        >
          {tooltip.label}
        </div>,
        document.body
      )}

      {/* Header */}
      <div
        className="flex items-center justify-between px-3 shrink-0"
        style={{ height: 'var(--header-height)' }}
      >
        {!collapsed && (
          <Link
            to="/dashboard"
            className="flex min-w-0 items-center gap-2.5 rounded-lg no-underline material-focus"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary shadow-[var(--shadow-1)]">
              <LayoutGrid size={15} />
            </div>
            <div className="min-w-0">
              <span className="block font-black text-sm text-text truncate">LayoutSystem</span>
            </div>
          </Link>
        )}
        <button
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-secondary material-state hover:bg-primary/8 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
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
          onMouseEnter={(e) => { showTooltip(e, 'Dashboard'); preloadRoute('/dashboard'); }}
          onFocus={() => preloadRoute('/dashboard')}
          onMouseLeave={() => setTooltip(null)}
        >
          <LayoutDashboard size={16} className="shrink-0" />
          <span className={navLabelClass}>Dashboard</span>
        </NavLink>

        {modules.map((mod) => {
          const Icon = getIcon(mod.icon);
          return (
            <NavLink
              key={mod.route}
              to={mod.route}
              className={({ isActive }) => linkClass(isActive)}
              aria-label={collapsed ? mod.name : undefined}
              onMouseEnter={(e) => { showTooltip(e, mod.name); preloadRoute(mod.route); }}
              onFocus={() => preloadRoute(mod.route)}
              onMouseLeave={() => setTooltip(null)}
            >
              <Icon size={16} className="shrink-0" />
              <span className={navLabelClass}>{mod.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Configuración — reemplaza al header: tema, perfil y cierre de sesión.
          El panel se despliega hacia arriba porque el botón vive al fondo del sidebar. */}
      <div ref={settingsRef} className="shrink-0 py-2">
        {settingsOpen && !collapsed && (
          <div className="mb-1 flex flex-col gap-1">
            <button
              type="button"
              className={settingsRowClass}
              onClick={() => setAppearanceOpen((v) => !v)}
              aria-expanded={appearanceOpen}
            >
              <Palette size={16} />
              <span className="flex-1">Apariencia</span>
              {appearanceOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>

            {appearanceOpen && (
              <div className="mx-2 flex flex-col gap-2 rounded-lg border border-border bg-surface-container/50 p-2">
                <div className="flex flex-wrap gap-1.5 px-1">
                  {Object.entries(PALETTES).map(([id, def]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPalette(id as PaletteId)}
                      aria-label={`Color ${def.label}`}
                      aria-pressed={palette === id}
                      title={def.label}
                      className={clsx(
                        'h-6 w-6 shrink-0 cursor-pointer rounded-full material-focus',
                        palette === id && 'ring-2 ring-primary ring-offset-2 ring-offset-surface',
                      )}
                      style={{ backgroundColor: def.swatch }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  aria-label={themeDescription}
                  title={themeDescription}
                  onClick={() => setPreference(nextPreference)}
                  className="material-state flex min-h-9 w-full cursor-pointer items-center gap-2 rounded-md px-1.5 text-xs text-secondary hover:bg-primary/8 hover:text-primary"
                >
                  <ThemeIcon size={14} className="shrink-0" />
                  <span>Tema {themeLabels[preference]}</span>
                </button>
              </div>
            )}

            <Link to="/perfil" className={settingsRowClass}>
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white">
                {user ? getInitials(user.name) : '?'}
              </div>
              <span className="truncate">{user?.name ?? 'Perfil'}</span>
            </Link>

            <button
              type="button"
              className={clsx(settingsRowClass, 'hover:bg-error/10 hover:text-error')}
              onClick={() => setShowLogoutDlg(true)}
            >
              <LogOut size={16} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        )}

        <button
          type="button"
          className={settingsRowClass}
          onClick={handleSettingsClick}
          onMouseEnter={(e) => showTooltip(e, 'Configuración')}
          onMouseLeave={() => setTooltip(null)}
          aria-expanded={settingsOpen}
          aria-label={collapsed ? 'Configuración' : undefined}
        >
          <Settings size={16} className="shrink-0" />
          <span className={clsx(navLabelClass, 'flex flex-1 items-center justify-between gap-2')}>
            <span>Configuración</span>
            {settingsOpen ? <ChevronDown size={14} className="shrink-0" /> : <ChevronUp size={14} className="shrink-0" />}
          </span>
        </button>
      </div>

    </aside>
  );
}
