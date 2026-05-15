import { useId } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Input de búsqueda reutilizable, extraído de GenericTable (SRP).
 * Usa useId() para generar IDs únicos y evitar conflictos.
 */
export default function SearchInput({ value, onChange, placeholder = 'Buscar...' }: SearchInputProps) {
  const id = useId();

  return (
    <div className="relative w-full sm:w-64">
      <label htmlFor={id} className="sr-only">Buscar</label>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
        <Search size={16} />
      </span>
      <input
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface rounded-lg py-2 pl-10 pr-10 text-sm text-text placeholder:text-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition"
        type="text"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-primary bg-surface w-7 h-7 flex items-center justify-center rounded-full"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
