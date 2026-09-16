import { CalendarDays } from 'lucide-react';
import { useCallback, useId, useRef, useState } from 'react';
import { useCoarsePointer } from '../../hooks/useCoarsePointer';
import DatePickerPopover from './DatePickerPopover';
import FormField from './FormField';
import { acceptsDateChange, canClearDate, parseLocalDate } from './dateFieldUtils';

interface DateFieldBaseProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  ref?: (instance: HTMLInputElement | HTMLButtonElement | null) => void;
  id?: string;
  name?: string;
  error?: string;
  help?: string;
  required?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  yearNavigation?: boolean;
  min?: string;
  max?: string;
  className?: string;
}

type DateFieldProps = DateFieldBaseProps & (
  | { label: string; 'aria-label'?: never }
  | { label?: never; 'aria-label': string }
);

export default function DateField({
  value, onChange, onBlur, ref, id, name, label, error, help, required, disabled, clearable, yearNavigation,
  min, max, className, 'aria-label': ariaLabel,
}: DateFieldProps) {
  const generatedId = useId().replaceAll(':', '');
  const inputId = id ?? name ?? `date-${generatedId}`;
  const helpId = help ? `${inputId}-help` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const nativeRef = useRef<HTMLInputElement>(null);
  const native = useCoarsePointer(() => setOpen(false));
  const setNativeRef = useCallback((input: HTMLInputElement | null) => {
    nativeRef.current = input;
    ref?.(input);
  }, [ref]);
  const setTriggerRef = useCallback((button: HTMLButtonElement | null) => {
    triggerRef.current = button;
    ref?.(button);
  }, [ref]);
  const fieldContext = label ?? ariaLabel;
  const selected = parseLocalDate(value);
  const displayValue = selected
    ? new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }).format(selected)
    : 'Seleccionar fecha…';
  const closePopover = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);
  const clear = () => {
    onChange('');
    onBlur?.();
    closePopover(true);
  };
  const borderClasses = error
    ? 'border-error focus-visible:border-error focus-visible:shadow-[0_0_0_3px_rgba(229,62,62,0.22)]'
    : 'border-border focus-visible:border-primary';

  return (
    <FormField label={label} name={inputId} error={error} className={className}>
      {native ? (
        <input
          ref={setNativeRef}
          id={inputId}
          name={name}
          type="date"
          lang="es-MX"
          value={value}
          min={min}
          max={max}
          required={required}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => {
            if (acceptsDateChange(event.currentTarget.value, clearable)) onChange(event.currentTarget.value);
          }}
          onBlur={onBlur}
          className={`block w-full cursor-pointer material-control px-3 py-2.5 text-sm material-state disabled:cursor-not-allowed disabled:opacity-60 ${borderClasses}`}
        />
      ) : (
        <>
          <button
            ref={setTriggerRef}
            id={inputId}
            type="button"
            disabled={disabled}
            aria-label={ariaLabel}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            onClick={() => setOpen((current) => !current)}
            onBlur={onBlur}
            className={`flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border bg-surface px-3 py-2.5 text-left text-sm shadow-[var(--shadow-1)] material-state hover:bg-primary/8 active:bg-primary/12 focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 ${borderClasses}`}
          >
            <span className={value ? 'text-text' : 'text-secondary'}>{displayValue}</span>
            <CalendarDays className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          </button>
          {name && <input type="hidden" name={name} value={value} />}
          {open && (
            <DatePickerPopover
              label={fieldContext}
              value={value}
              min={min}
              max={max}
              yearNavigation={yearNavigation}
              triggerRef={triggerRef}
              onChange={onChange}
              onClear={canClearDate(value, clearable, disabled) ? clear : undefined}
              onClose={closePopover}
            />
          )}
        </>
      )}
      {help && <p id={helpId} className="mt-1.5 text-xs font-semibold text-secondary">{help}</p>}
    </FormField>
  );
}
