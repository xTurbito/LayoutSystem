import type { ClassNamesConfig } from 'react-select';
import type { SelectFieldOption } from './selectFieldUtils';

export function getReactSelectClassNames(
  error = false,
  size: 'default' | 'compact' = 'default',
): ClassNamesConfig<SelectFieldOption, false> {
  const border = error ? 'border-error' : 'border-border';
  const focus = error
    ? '!border-error shadow-[var(--focus-ring-error)]'
    : '!border-primary shadow-[var(--focus-ring)]';

  return {
    control: ({ isDisabled, isFocused }) =>
      // react-select le pone `cursor: default` a .control de forma incondicional
      // (incluso con unstyled) — necesita !important para ganarle a esa regla.
      `${size === 'compact' ? 'min-h-9 rounded-full px-1.5 py-0 text-xs font-semibold sm:px-2' : 'min-h-10 rounded-xl px-2 py-1 text-sm shadow-[var(--shadow-1)]'} border bg-surface ${border} ${isFocused ? focus : ''} ${isDisabled ? '!cursor-not-allowed opacity-60' : '!cursor-pointer material-state'}`,
    menu: () =>
      'mt-1 origin-top overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-[var(--shadow-3)] motion-safe:animate-[stagger-in_150ms_var(--motion-standard)] motion-reduce:animate-none',
    menuPortal: () => 'z-[1000] select-menu-portal',
    option: ({ isDisabled, isFocused, isSelected }) =>
      // Mismo caso que .control: react-select fuerza `cursor: default` en .option.
      `flex min-h-10 items-center rounded-[0.625rem] px-3 py-2 text-sm ${isDisabled ? '!cursor-not-allowed text-secondary opacity-50' : '!cursor-pointer'} ${isSelected ? 'bg-primary-container font-bold text-primary' : 'text-text'} ${isFocused && !isDisabled ? 'bg-primary/8' : ''}`,
    placeholder: () => 'text-secondary text-sm',
    singleValue: () => 'text-text text-sm',
    input: () => 'text-text text-sm cursor-pointer',
    indicatorSeparator: () => 'hidden',
    clearIndicator: () => 'flex min-h-10 cursor-pointer items-center px-1 text-secondary hover:text-primary',
    dropdownIndicator: () => 'flex min-h-10 cursor-pointer items-center px-1 text-secondary hover:text-primary',
    noOptionsMessage: () => 'px-3 py-2 text-sm text-secondary',
  };
}
