import { useCallback, useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import type { SingleValue, StylesConfig } from 'react-select';
import FormField from './FormField';
import { createDebouncedLoader } from './asyncComboboxUtils';
import { getMenuPortalStyle } from './selectFieldUtils';

export interface ComboboxOption {
  value: string;
  label: string;
}

interface AsyncComboboxProps {
  name?: string;
  label?: string;
  placeholder?: string;
  /** Full option object (value + label) for controlled display; null when nothing is selected. */
  value: ComboboxOption | null;
  onChange: (option: ComboboxOption | null) => void;
  loadOptions: (inputValue: string) => Promise<ComboboxOption[]>;
  error?: string;
  disabled?: boolean;
}

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const customStyles: StylesConfig<ComboboxOption, false> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'var(--color-surface, #ffffff)',
    borderColor:     state.isFocused ? 'var(--color-primary)' : 'var(--color-border)',
    borderRadius:    'var(--radius-control, 0.75rem)',
    boxShadow:       state.isFocused ? 'var(--focus-ring)' : 'var(--shadow-1)',
    minHeight:       '44px',
    fontSize:        '0.9375rem',
    transition:      'transform 180ms var(--motion-standard), opacity 160ms var(--motion-standard)',
    cursor:          state.isDisabled ? 'not-allowed' : 'pointer',
    opacity:         state.isDisabled ? 0.6 : 1,
    '&:hover': { borderColor: 'var(--color-primary)' },
  }),
  placeholder:      (base) => ({ ...base, color: 'var(--color-secondary)', fontSize: '0.9375rem' }),
  singleValue:      (base) => ({ ...base, color: 'var(--color-text)' }),
  input:            (base) => ({ ...base, color: 'var(--color-text)' }),
  menu:             (base) => ({
    ...base,
    backgroundColor: 'var(--color-surface, #ffffff)',
    borderRadius: 'var(--radius-control, 0.75rem)',
    border:       '1px solid var(--color-border)',
    boxShadow:    'var(--shadow-3)',
    overflow:     'hidden',
    zIndex:       50,
    transformOrigin: 'top',
    animation:    prefersReducedMotion
      ? undefined
      : 'stagger-in 150ms var(--motion-standard)',
  }),
  menuPortal:       (base) => getMenuPortalStyle(base),
  menuList:         (base) => ({ ...base, padding: '0.25rem' }),
  option:           (base, state) => ({
    ...base,
    borderRadius:    '0.625rem',
    minHeight:       '44px',
    display:         'flex',
    alignItems:      'center',
    backgroundColor: state.isSelected
      ? 'var(--color-primary-container)'
      : state.isFocused
        ? 'var(--state-primary-hover)'
        : 'transparent',
    color:           state.isSelected ? 'var(--color-primary)' : 'var(--color-text)',
    fontSize:        '0.9375rem',
    fontWeight:      state.isSelected ? 700 : 500,
    padding:         '0.5rem 0.75rem',
    cursor:          'pointer',
  }),
  loadingMessage:      (base) => ({ ...base, color: 'var(--color-secondary)', fontSize: '0.9375rem' }),
  noOptionsMessage:    (base) => ({ ...base, color: 'var(--color-secondary)', fontSize: '0.9375rem' }),
  indicatorSeparator:  () => ({ display: 'none' }),
  dropdownIndicator:   (base) => ({ ...base, color: 'var(--color-secondary)', cursor: 'pointer', padding: '0 8px' }),
  clearIndicator:      (base) => ({ ...base, color: 'var(--color-secondary)', cursor: 'pointer' }),
};

const DEBOUNCE_MS = 300;

export default function AsyncCombobox({
  name,
  label,
  placeholder = 'Buscar…',
  value,
  onChange,
  loadOptions,
  error,
  disabled = false,
}: AsyncComboboxProps) {
  const [loader] = useState(() => createDebouncedLoader(loadOptions, DEBOUNCE_MS));
  useEffect(() => {
    loader.setLoadOptions(loadOptions);
  }, [loadOptions, loader]);
  useEffect(() => () => loader.dispose(), [loader]);

  const debouncedLoad = useCallback(
    (inputValue: string) => loader.load(inputValue),
    [loader],
  );

  const handleChange = (opt: SingleValue<ComboboxOption>) => {
    onChange(opt ?? null);
  };

  return (
    <FormField label={label} name={name} error={error}>
      <AsyncSelect<ComboboxOption, false>
        inputId={name}
        name={name}
        placeholder={placeholder}
        isClearable
        isDisabled={disabled}
        cacheOptions
        defaultOptions
        loadOptions={debouncedLoad}
        value={value}
        onChange={handleChange}
        styles={customStyles}
        loadingMessage={() => 'Buscando…'}
        noOptionsMessage={({ inputValue }) =>
          inputValue.length < 1 ? 'Escribe para buscar…' : 'Sin resultados'
        }
        menuPortalTarget={document.body}
        menuPosition="fixed"
      />
    </FormField>
  );
}
