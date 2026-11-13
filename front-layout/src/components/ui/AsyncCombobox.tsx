import { useCallback, useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import type { SingleValue, StylesConfig } from 'react-select';
import FormField from './FormField';
import { getReactSelectClassNames } from './reactSelectClassNames';
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

// Visuals come from the shared react-select classNames (same as Combobox and
// SelectField). Only the portal z-index needs an inline style.
const portalStyles: StylesConfig<ComboboxOption, false> = {
  menuPortal: (base) => getMenuPortalStyle(base),
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
        styles={portalStyles}
        unstyled
        classNames={getReactSelectClassNames(Boolean(error))}
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
