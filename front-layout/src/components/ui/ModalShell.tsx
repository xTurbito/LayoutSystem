import { type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  description?: string;
  children: ReactNode;
  // 'lg' para superficies de trabajo con layout de dos columnas; el default
  // deja intactos los diálogos de confirmación existentes.
  size?: 'sm' | 'lg';
  hideDivider?: boolean;
  // Título como label chico/mudo en vez de heading — para diálogos donde el
  // peso visual debe estar en el contenido (ej. la pregunta de un confirm).
  subtleTitle?: boolean;
}

const FOCUSABLE =
  'a[href],area[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),[tabindex]:not([tabindex="-1"])';

export default function ModalShell({
  open,
  onClose,
  title,
  icon,
  description,
  children,
  size = 'sm',
  hideDivider = false,
  subtleTitle = false,
}: ModalShellProps) {
  const [mounted, setMounted] = useState(open);
  const closing = mounted && !open;
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => { onCloseRef.current = onClose; });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setMounted(true);
  }, [open]);

  // Focus inicial + bloqueo de scroll del body + restaurar foco al cerrar
  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus(); // el lector de pantalla anuncia el título
    return () => {
      document.body.style.overflow = prevOverflow;
      lastFocused.current?.focus?.();
    };
  }, [open]);

  // Escape + focus trap (Tab no escapa; onCloseRef evita re-montar el listener)
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(document.activeElement)) return;
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const node = dialogRef.current;
      if (!node) return;
      const items = Array.from(
        node.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null);
      if (items.length === 0) {
        e.preventDefault();
        node.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || !node.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !node.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[var(--scrim)] p-4 ${closing ? 'animate-[modal-backdrop-out_200ms_ease-in_forwards]' : 'animate-[modal-backdrop-in_200ms_ease-out_forwards]'}`}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`relative mx-auto flex max-h-[90vh] w-full flex-col rounded-[var(--radius-sheet)] border border-border bg-surface shadow-[var(--shadow-3)] outline-none ${size === 'lg' ? 'max-w-sm sm:max-w-2xl lg:max-w-4xl' : 'max-w-sm sm:max-w-md'} ${closing ? 'animate-[modal-out_200ms_ease-in_forwards]' : 'animate-[modal-in_220ms_ease-out_forwards]'}`}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={() => { if (closing) setMounted(false); }}
      >
        <button
          className="absolute top-2 right-2 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-secondary material-state hover:bg-primary/8 hover:text-text active:bg-primary/12 material-focus sm:top-3 sm:right-3"
          onClick={onClose}
          aria-label="Cerrar"
          type="button"
        >
          <X size={18} />
        </button>
        <div className="flex items-start gap-3 p-4 pb-3 pr-10 shrink-0">
          {icon && (
            <span className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
              {icon}
            </span>
          )}
          <div className="flex flex-col min-w-0">
            <h2
              id={titleId}
              className={
                subtleTitle
                  ? 'truncate text-xs font-bold uppercase tracking-wide text-secondary'
                  : 'text-base sm:text-lg font-bold text-text truncate'
              }
            >
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-xs sm:text-sm text-secondary mt-1 line-clamp-2">{description}</p>
            )}
          </div>
        </div>
        {!hideDivider && <hr className="w-full border-border shrink-0" />}
        <div className="p-4 overflow-y-auto overscroll-contain flex-1">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
