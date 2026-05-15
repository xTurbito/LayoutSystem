import type { SelectHTMLAttributes, ReactNode } from 'react';
import FormField from './FormField';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  disclaimer?: string;
  error?: string;
  children: ReactNode;
}

export default function Select({ label, disclaimer, error, children, className = '', name, ...rest }: SelectProps) {
  const borderClass = error ? 'border-red-500' : 'border-border';

  return (
    <FormField label={label} name={name} disclaimer={disclaimer} error={error}>
      <div className="relative">
        <select
          id={name}
          name={name}
          className={`block w-full rounded-md border bg-surface py-2 px-3 pr-8 text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors duration-150 appearance-none ${borderClass} ${className}`}
          {...rest}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-secondary">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </FormField>
  );
}
