import clsx from 'clsx';

interface StatusBadgeProps {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

/**
 * Badge de estado activo/inactivo alineado con la paleta del panel.
 */
export default function StatusBadge({
  active,
  activeLabel = 'Activo',
  inactiveLabel = 'Inactivo',
}: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-bold',
        active
          ? 'border-success/20 bg-success-container text-success'
          : 'border-error/20 bg-error-container text-error',
      )}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
