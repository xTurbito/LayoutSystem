import ReactSelect from 'react-select';
import FormField from './FormField';

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

  const borderBase = error ? 'border-red-500' : 'border-border';
  const borderFocus = error
    ? '!border-red-500 ring-2 ring-red-500/20'
    : '!border-primary ring-2 ring-primary/20';

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
        classNames={{
          control: ({ isFocused }) =>
            `border rounded-md bg-surface px-2 py-[3px] transition-colors duration-150 ${borderBase} ${isFocused ? borderFocus : ''}`,
          menu: () =>
            'bg-surface border border-border rounded-md shadow-lg mt-1 overflow-hidden z-50 origin-top motion-safe:animate-[stagger-in_150ms_cubic-bezier(0.2,0,0,1)] motion-reduce:animate-none',
          option: ({ isFocused, isSelected }) =>
            `px-3 py-2 text-sm cursor-pointer ${isSelected ? 'font-semibold text-primary' : 'text-text'} ${isFocused ? 'bg-bg' : ''}`,
          placeholder: () => 'text-secondary text-sm',
          singleValue: () => 'text-text text-sm',
          input: () => 'text-text text-sm',
          indicatorSeparator: () => 'hidden',
          clearIndicator: () => 'text-secondary hover:text-text cursor-pointer px-1',
          dropdownIndicator: () => 'text-secondary px-1',
          noOptionsMessage: () => 'px-3 py-2 text-sm text-secondary',
        }}
      />
    </FormField>
  );
}
