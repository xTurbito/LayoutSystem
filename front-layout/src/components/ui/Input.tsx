import { Eye, EyeOff } from 'lucide-react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { useState } from 'react';
import FormField from './FormField';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  containerClassName?: string;
  disclaimer?: string;
  errorMessage?: string;
  leadingIcon?: ReactNode;
}

export default function Input({
  type = 'text',
  name,
  label,
  className = '',
  containerClassName = '',
  disclaimer,
  errorMessage,
  leadingIcon,
  ...rest
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const borderClasses = errorMessage
    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
    : 'border-border focus:ring-2 focus:ring-primary/20 focus:border-primary';

  const pl = leadingIcon ? 'pl-10' : 'pl-3';
  const pr = isPassword ? 'pr-10' : 'pr-3';

  return (
    <FormField label={label} name={name} disclaimer={disclaimer} error={errorMessage} className={containerClassName}>
      <div className="relative">
        {leadingIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
            {leadingIcon}
          </span>
        )}
        <input
          id={name}
          name={name}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={`block w-full rounded-md border bg-surface py-2 ${pl} ${pr} text-text placeholder:text-secondary transition-colors duration-150 outline-none ${borderClasses} ${className}`}
          {...rest}
          {...(isPassword && { autoComplete: 'current-password' })}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors"
            onClick={() => setShowPassword(v => !v)}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </FormField>
  );
}
