import clsx from 'clsx';

interface StatusBadgeProps {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

/**
 * Badge de estado activo/inactivo con contraste AA.
 * Reemplaza el patrón `bg-green-500 text-white` (≈2.3:1, falla 4.5:1).
 */
export default function StatusBadge({
  active,
  activeLabel = 'Activo',
  inactiveLabel = 'Inactivo',
}: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
        active
          ? 'bg-green-100 text-green-800'
          : 'bg-border text-secondary',
      )}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
