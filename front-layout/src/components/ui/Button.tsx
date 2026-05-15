import type { ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const variantClasses: Record<ButtonVariant, string> = {
  primary:   'bg-primary hover:bg-primary-hover text-white shadow-sm',
  secondary: 'bg-surface border border-border text-text hover:bg-bg shadow-sm',
  danger:    'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  ghost:     'bg-transparent text-text hover:bg-bg',
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
      title={label || undefined}
      className={clsx(
        'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold',
        'transition-colors duration-200 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        'disabled:opacity-60 disabled:cursor-not-allowed',
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
      <span className="truncate">{label}</span>
    </button>
  );
}
