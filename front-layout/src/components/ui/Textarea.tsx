import type { TextareaHTMLAttributes } from 'react';
import FormField from './FormField';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  containerClassName?: string;
  disclaimer?: string;
  errorMessage?: string;
}

export default function Textarea({
  name,
  label,
  className = '',
  containerClassName = '',
  disclaimer,
  errorMessage,
  rows = 4,
  ...rest
}: TextareaProps) {
  const borderClasses = errorMessage
    ? 'border-error focus-visible:border-error focus-visible:shadow-[0_0_0_3px_rgba(229,62,62,0.22)]'
    : 'border-border focus-visible:border-primary';

  return (
    <FormField label={label} name={name} disclaimer={disclaimer} error={errorMessage} className={containerClassName}>
      <textarea
        id={name}
        name={name}
        rows={rows}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={errorMessage && name ? `${name}-error` : undefined}
        className={`block w-full material-control resize-y py-2.5 px-3 placeholder:text-secondary/75 material-state disabled:cursor-not-allowed disabled:opacity-60 ${borderClasses} ${className}`}
        {...rest}
      />
    </FormField>
  );
}
