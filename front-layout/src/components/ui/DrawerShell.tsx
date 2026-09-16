import { type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface DrawerShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  // Accion secundaria junto al titulo (ej. un "+" para crear), antes de la X de cerrar.
  headerAction?: ReactNode;
}

const FOCUSABLE =
  'a[href],area[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Modal lateral (panel deslizante desde la derecha). Misma mecánica de
 * accesibilidad que ModalShell (focus trap, Escape, scroll lock, restaurar foco)
 * y transición por keyframes CSS (drawer-in/out) — sin dependencias externas.
 */
export default function DrawerShell({
  open,
  onClose,
  title,
  icon,
  description,
  children,
  footer,
  headerAction,
}: DrawerShellProps) {
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
    dialogRef.current?.focus();
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
      className={`fixed inset-0 z-50 bg-[var(--scrim)] ${closing ? 'animate-[modal-backdrop-out_200ms_ease-in_forwards]' : 'animate-[modal-backdrop-in_200ms_ease-out_forwards]'}`}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`fixed inset-x-0 bottom-0 flex h-[calc(100dvh_-_env(safe-area-inset-top))] w-full max-w-full flex-col overflow-hidden rounded-t-2xl border border-b-0 border-border bg-surface shadow-[var(--shadow-3)] outline-none md:inset-y-0 md:left-auto md:right-0 md:h-auto md:max-w-[520px] md:rounded-l-[var(--radius-sheet)] md:rounded-tr-none md:border-b md:border-l ${closing ? 'animate-[sheet-out_220ms_ease-in_forwards] md:animate-[drawer-out_220ms_ease-in_forwards]' : 'animate-[sheet-in_240ms_ease-out_forwards] md:animate-[drawer-in_240ms_ease-out_forwards]'}`}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={() => { if (closing) setMounted(false); }}
      >
        <div className="flex h-5 shrink-0 items-center justify-center md:hidden" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-border" />
        </div>
        <div
          className="flex shrink-0 items-start justify-between gap-3 px-4 pb-3 pt-1 sm:px-5 md:py-4"
          style={{ paddingTop: 'max(0.25rem, env(safe-area-inset-top))' }}
        >
          <div className="flex min-w-0 items-start gap-3">
            {icon && (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center sm:h-10 sm:w-10">
                {icon}
              </span>
            )}
            <div className="flex flex-col min-w-0">
              <h2 id={titleId} className="truncate text-base font-bold text-text sm:text-lg">{title}</h2>
              {description && (
                <p id={descriptionId} className="mt-1 line-clamp-2 text-xs text-secondary sm:text-sm">{description}</p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {headerAction}
            <button
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-secondary material-state hover:bg-primary/8 hover:text-text active:bg-primary/12 material-focus"
              onClick={onClose}
              aria-label="Cerrar"
              type="button"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <hr className="w-full border-border shrink-0" />
        <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-4 sm:px-5">{children}</div>
        {footer && (
          <div
            className="shrink-0 border-t border-border bg-surface-container/70 px-4 py-3 sm:px-5 sm:py-4"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
