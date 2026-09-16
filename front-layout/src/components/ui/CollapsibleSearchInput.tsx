import { useEffect, useId, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

interface CollapsibleSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Buscador que arranca como botón circular (solo ícono) y se despliega al
 * click/foco — el ícono queda fijo a la izquierda y el input se revela
 * empujado a su derecha. Se vuelve a colapsar al perder el foco si quedó vacío.
 */
export default function CollapsibleSearchInput({ value, onChange, placeholder = 'Buscar…', className }: CollapsibleSearchInputProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState(Boolean(value));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (value) setExpanded(true);
  }, [value]);

  const expand = () => {
    setExpanded(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleBlur = () => {
    if (!value) setExpanded(false);
  };

  return (
    <div
      className={`box-content flex items-center overflow-hidden rounded-full border border-border bg-surface shadow-[var(--shadow-1)] transition-[width] duration-300 ease-out ${
        expanded ? `w-full focus-within:border-primary/40 ${className ?? 'sm:w-56'}` : 'w-10'
      }`}
    >
      <label htmlFor={id} className="sr-only">Buscar</label>
      <button
        type="button"
        onClick={expand}
        tabIndex={expanded ? -1 : 0}
        aria-hidden={expanded}
        aria-label="Buscar"
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-secondary material-focus ${!expanded ? 'cursor-pointer' : ''}`}
      >
        <Search size={16} />
      </button>
      <input
        ref={inputRef}
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={expand}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent py-2.5 pr-3 text-sm text-text outline-none placeholder:text-secondary/75"
        type="text"
      />
      {value && expanded && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center text-secondary material-state hover:text-primary"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
