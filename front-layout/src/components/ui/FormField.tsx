import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

interface FormFieldProps {
  label?: string;
  name?: string;
  disclaimer?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export default function FormField({ label, name, disclaimer, error, children, className = '' }: FormFieldProps) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-2 block text-sm font-bold text-text" htmlFor={name}>
          {label}
        </label>
      )}
      {children}
      {error && (
        <p
          id={name ? `${name}-error` : undefined}
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 text-xs font-semibold text-error"
        >
          <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
      {disclaimer && (
        <div className="mt-1.5 flex items-start gap-1.5">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
          <p className="text-xs font-semibold text-secondary">{disclaimer}</p>
        </div>
      )}
    </div>
  );
}
