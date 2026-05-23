import { type ReactNode, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  description?: string;
  children: ReactNode;
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
}: ModalShellProps) {
  const [mounted, setMounted] = useState(open);
  const closing = mounted && !open;
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
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

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 ${closing ? 'animate-[modal-backdrop-out_200ms_ease-in_forwards]' : 'animate-[modal-backdrop-in_200ms_ease-out_forwards]'}`}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={`bg-surface rounded-2xl shadow-2xl mx-auto border border-border relative w-full max-w-sm sm:max-w-md max-h-[90vh] flex flex-col outline-none ${closing ? 'animate-[modal-out_200ms_ease-in_forwards]' : 'animate-[modal-in_220ms_ease-out_forwards]'}`}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={() => { if (closing) setMounted(false); }}
      >
        <button
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-secondary hover:text-text transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-md cursor-pointer"
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
            <h2 id="modal-title" className="text-base sm:text-lg font-bold text-text truncate">{title}</h2>
            {description && (
              <p className="text-xs sm:text-sm text-secondary mt-1 line-clamp-2">{description}</p>
            )}
          </div>
        </div>
        <hr className="w-full border-border shrink-0" />
        <div className="p-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
