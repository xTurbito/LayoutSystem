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
        <label className="block text-sm font-semibold text-text mb-2" htmlFor={name}>
          {label}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {disclaimer && (
        <div className="flex items-center gap-1 mt-1.5">
          <CircleAlert className="w-4 h-4 text-secondary" />
          <p className="text-xs font-bold text-secondary">{disclaimer}</p>
        </div>
      )}
    </div>
  );
}
