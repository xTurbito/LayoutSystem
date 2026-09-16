import { useId } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Input de búsqueda reutilizable, extraído de GenericTable (SRP).
 * Usa useId() para generar IDs únicos y evitar conflictos.
 */
export default function SearchInput({ value, onChange, placeholder = 'Buscar…', className }: SearchInputProps) {
  const id = useId();

  return (
    <div className={`relative w-full ${className ?? 'sm:w-64'}`}>
      <label htmlFor={id} className="sr-only">Buscar</label>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
        <Search size={16} />
      </span>
      <input
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full material-control py-2.5 pl-10 pr-12 text-sm placeholder:text-secondary/75 material-state focus-visible:border-primary"
        type="text"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          className="absolute right-0.5 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-secondary material-state hover:bg-primary/8 hover:text-primary active:bg-primary/12 material-focus"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
