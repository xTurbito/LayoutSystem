import ReactSelect from 'react-select';
import FormField from './FormField';
import { getReactSelectClassNames } from './reactSelectClassNames';

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  label?: string;
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  name?: string;
}

export default function Combobox({
  label,
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  error,
  disabled,
  name,
}: ComboboxProps) {
  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <FormField label={label} name={name} error={error}>
      <ReactSelect
        inputId={name}
        options={options}
        value={selected}
        onChange={(opt) => onChange(opt?.value ?? '')}
        placeholder={placeholder}
        isDisabled={disabled}
        isClearable
        unstyled
        classNames={getReactSelectClassNames(Boolean(error))}
      />
    </FormField>
  );
}
