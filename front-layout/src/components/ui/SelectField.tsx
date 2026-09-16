import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import ReactSelect, { type SingleValue, type StylesConfig } from 'react-select';
import FormField from './FormField';
import { getReactSelectClassNames } from './reactSelectClassNames';
import { findSelectedOption, getMenuPortalStyle, shouldUseNativeSelect, type SelectFieldOption } from './selectFieldUtils';
import { useCoarsePointer } from '../../hooks/useCoarsePointer';

interface SelectFieldBaseProps {
  options: SelectFieldOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  ref?: (instance: { focus: () => void } | null) => void;
  id?: string;
  name?: string;
  error?: string;
  help?: string;
  disabled?: boolean;
  loading?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  size?: 'default' | 'compact';
}

type SelectFieldProps = SelectFieldBaseProps & (
  | { label: string; 'aria-label'?: never }
  | { label?: never; 'aria-label': string }
);

const portalStyles: StylesConfig<SelectFieldOption, false> = {
  menuPortal: (base) => getMenuPortalStyle(base),
};

export default function SelectField({
  options,
  value,
  onChange,
  onBlur,
  ref,
  id,
  name,
  label,
  error,
  help,
  disabled = false,
  loading = false,
  required = false,
  placeholder = 'Seleccionar…',
  className,
  size = 'default',
  'aria-label': ariaLabel,
}: SelectFieldProps) {
  const generatedId = useId().replaceAll(':', '');
  const inputId = id ?? name ?? `select-${generatedId}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helpId = help ? `${inputId}-help` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;
  const hasCoarsePointer = useCoarsePointer();
  const useNative = shouldUseNativeSelect(hasCoarsePointer);

  return (
    <FormField label={label} name={inputId} error={error} className={className}>
      {useNative ? (
        <div className="relative">
          <select
            ref={(instance) => ref?.(instance)}
            id={inputId}
            name={name}
            value={value}
            disabled={disabled}
            required={required}
            aria-label={ariaLabel}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            className={`block w-full appearance-none cursor-pointer border bg-surface text-sm focus-visible:border-primary focus-visible:shadow-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 ${size === 'compact' ? 'min-h-9 rounded-full py-1.5 pl-2.5 pr-8 text-xs font-semibold sm:pl-3' : 'min-h-10 rounded-xl py-2.5 pl-3 pr-9 shadow-[var(--shadow-1)]'} ${error ? 'border-error' : 'border-border'}`}
          >
            {placeholder && !options.some((option) => option.value === '') && <option value="" disabled={required}>{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>
            ))}
          </select>
          <ChevronDown
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-secondary ${size === 'compact' ? 'right-2.5 w-3.5 h-3.5' : 'right-3 w-4 h-4'} ${disabled ? 'opacity-60' : ''}`}
          />
        </div>
      ) : (
        <ReactSelect<SelectFieldOption, false>
          ref={(instance) => ref?.(instance)}
          inputId={inputId}
          instanceId={inputId}
          name={name}
          options={options}
          value={findSelectedOption(options, value)}
          onChange={(option: SingleValue<SelectFieldOption>) => onChange(option?.value ?? '')}
          onBlur={onBlur}
          isOptionDisabled={(option) => Boolean(option.disabled)}
          isDisabled={disabled}
          isLoading={loading}
          isSearchable={false}
          required={required}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          styles={portalStyles}
          unstyled
          classNames={getReactSelectClassNames(Boolean(error), size)}
        />
      )}
      {help && <p id={helpId} className="mt-1.5 text-xs font-semibold text-secondary">{help}</p>}
    </FormField>
  );
}
