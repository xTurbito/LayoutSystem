import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  labelPosition?: 'left' | 'right';
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    label,
    labelPosition = 'left',
    className,
    disabled,
    ...props
  },
  ref,
) {
  const control = (
    <span className="relative inline-flex h-8 w-13 shrink-0 rounded-full bg-surface-high material-state peer-checked:bg-primary peer-disabled:opacity-60 after:absolute after:left-1 after:top-1 after:h-6 after:w-6 after:rounded-full after:bg-surface after:shadow-[var(--shadow-1)] after:transition-transform after:duration-[180ms] after:ease-out peer-checked:after:translate-x-5 peer-focus-visible:shadow-[var(--focus-ring)]" />
  );

  return (
    <label
      className={clsx(
        // relative: el input real es sr-only (position:absolute). Sin un ancestro
        // posicionado propio se ancla al contenedor de más arriba (ej. el diálogo),
        // y al enfocarlo el navegador scrollea ese contenedor hasta el origen.
        'relative inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-text',
        disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
        className,
      )}
    >
      <input ref={ref} type="checkbox" className="sr-only peer" disabled={disabled} {...props} />
      {labelPosition === 'left' && label && <span>{label}</span>}
      {control}
      {labelPosition === 'right' && label && <span>{label}</span>}
    </label>
  );
});

export default Switch;
