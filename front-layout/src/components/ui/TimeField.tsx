import SelectField from './SelectField';

function formatHora(hhmm: string) {
  const [hours, minutes] = hhmm.split(':').map(Number);
  const date = new Date(2000, 0, 1, hours, minutes);
  return date.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' });
}

interface TimeFieldBaseProps {
  value: string;
  onChange: (value: string) => void;
  opciones: string[];
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

type TimeFieldProps = TimeFieldBaseProps & (
  | { label: string; 'aria-label'?: never }
  | { label?: never; 'aria-label': string }
);

export default function TimeField({
  value,
  onChange,
  opciones,
  disabled = false,
  className,
  placeholder = 'Elegir hora…',
  label,
  'aria-label': ariaLabel,
}: TimeFieldProps) {
  const selectProps = label
    ? { label }
    : { 'aria-label': ariaLabel! };

  return (
    <SelectField
      {...selectProps}
      className={className}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      options={opciones.map((hora) => ({ value: hora, label: formatHora(hora) }))}
    />
  );
}
