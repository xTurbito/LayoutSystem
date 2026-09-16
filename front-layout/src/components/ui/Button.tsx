import type { ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

// Elevación (shadow-2) al hover en vez de scale: da sensación de "levantarse" sin
// arriesgar el solape visual que un transform de escala causaría en botones de
// acción apretados dentro de filas de tabla.
const variantClasses: Record<ButtonVariant, string> = {
  primary:   'bg-primary text-on-primary shadow-[var(--shadow-1)] hover:bg-primary-hover hover:shadow-[var(--shadow-2)] active:bg-primary-hover',
  secondary: 'border border-border bg-surface text-text shadow-[var(--shadow-1)] hover:bg-primary/8 hover:shadow-[var(--shadow-2)] active:bg-primary/12',
  danger:    'bg-error text-surface shadow-[var(--shadow-1)] hover:opacity-90 hover:shadow-[var(--shadow-2)] active:opacity-80',
  ghost:     'bg-transparent text-text hover:bg-primary/8 active:bg-primary/12',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: LucideIcon;
  variant?: ButtonVariant;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  label,
  icon: Icon,
  variant = 'primary',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      title={label ? undefined : rest['aria-label']}
      className={clsx(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold',
        'material-state cursor-pointer select-none',
        'material-focus',
        'motion-safe:active:scale-[0.98] motion-reduce:transform-none',
        'disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100',
        variantClasses[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {isLoading
        ? <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
        : Icon && <Icon className="w-4 h-4 shrink-0" />
      }
      {label && <span className="truncate">{label}</span>}
    </button>
  );
}
