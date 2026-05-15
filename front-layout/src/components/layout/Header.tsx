import { LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import ModalShell from '../ui/ModalShell';
import Button from '../ui/Button';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

interface HeaderProps {
  onMenuClick: () => void;
}

const iconBtnClass =
  'text-secondary hover:text-text p-2.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50';

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const [showLogoutDlg, setShowLogoutDlg] = useState(false);

  return (
    <>
      <ModalShell
        open={showLogoutDlg}
        onClose={() => setShowLogoutDlg(false)}
        title="Cerrar sesión"
        description="¿Estás seguro que querés cerrar tu sesión?"
        icon={<LogOut className="w-5 h-5 text-red-500" />}
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

      <header className="bg-surface border-b border-border flex items-center justify-between px-4 lg:justify-end lg:px-6">

        {/* Hamburger — solo móvil */}
        <button
          className={`lg:hidden ${iconBtnClass}`}
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-3">
          <Link
            to="/perfil"
            aria-label="Ver perfil"
            className="cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {user ? getInitials(user.name) : '?'}
            </div>
          </Link>

          <div className="flex flex-col leading-none">
            <span className="text-sm font-medium text-text">{user?.name}</span>
            <span className="text-xs text-secondary mt-0.5">{user?.role.name}</span>
          </div>

          <button
            className="text-secondary hover:text-red-500 p-2.5 rounded-md flex items-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
            onClick={() => setShowLogoutDlg(true)}
            aria-label="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        </div>

      </header>
    </>
  );
}
