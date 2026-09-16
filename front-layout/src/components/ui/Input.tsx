import { Eye, EyeOff } from 'lucide-react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { useState } from 'react';
import FormField from './FormField';

type InputKind = 'text' | 'integer' | 'decimal' | 'money' | 'phone' | 'letters';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  containerClassName?: string;
  disclaimer?: string;
  errorMessage?: string;
  leadingIcon?: ReactNode;
  inputKind?: InputKind;
}

const inputModeByKind: Partial<Record<InputKind, InputHTMLAttributes<HTMLInputElement>['inputMode']>> = {
  integer: 'numeric',
  decimal: 'decimal',
  money: 'decimal',
  phone: 'tel',
};

const pickerInputTypes = new Set(['date', 'time', 'datetime-local', 'month', 'week', 'color', 'file']);

function sanitizeValue(value: string, kind: InputKind) {
  switch (kind) {
    case 'integer':
      return value.replace(/\D/g, '');
    case 'decimal': {
      const normalized = value.replace(',', '.').replace(/[^\d.]/g, '');
      const [whole, ...decimal] = normalized.split('.');
      return decimal.length ? `${whole}.${decimal.join('')}` : whole;
    }
    case 'money': {
      const normalized = value.replace(',', '.').replace(/[^\d.]/g, '');
      const [whole, ...decimal] = normalized.split('.');
      return decimal.length ? `${whole}.${decimal.join('').slice(0, 2)}` : whole;
    }
    case 'phone':
      return value.replace(/[^\d+\-()\s]/g, '');
    case 'letters':
      return value.replace(/[^\p{L}\s.'-]/gu, '');
    default:
      return value;
  }
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
  inputKind = 'text',
  onChange,
  inputMode,
  autoComplete,
  ...rest
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const shouldSanitize = inputKind !== 'text';
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : shouldSanitize ? 'text' : type;
  const resolvedInputMode = inputMode ?? inputModeByKind[inputKind];
  const cursorClasses = pickerInputTypes.has(resolvedType) ? 'cursor-pointer' : '';

  const borderClasses = errorMessage
    ? 'border-error focus-visible:border-error focus-visible:shadow-[0_0_0_3px_rgba(186,26,26,0.22)]'
    : 'border-border focus-visible:border-primary';

  const pl = leadingIcon ? 'pl-10' : 'pl-3';
  const pr = isPassword ? 'pr-10' : 'pr-3';

  const handleChange: InputHTMLAttributes<HTMLInputElement>['onChange'] = (event) => {
    if (shouldSanitize) {
      event.currentTarget.value = sanitizeValue(event.currentTarget.value, inputKind);
    }

    onChange?.(event);
  };

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
          type={resolvedType}
          inputMode={resolvedInputMode}
          aria-invalid={errorMessage ? true : undefined}
          aria-describedby={errorMessage && name ? `${name}-error` : undefined}
          className={`block w-full material-control py-2.5 ${pl} ${pr} ${cursorClasses} placeholder:text-secondary/75 material-state disabled:cursor-not-allowed ${borderClasses} ${className}`}
          onChange={handleChange}
          autoComplete={autoComplete}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-secondary material-state hover:bg-primary/8 hover:text-primary active:bg-primary/12 material-focus"
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </FormField>
  );
}
