import { type ReactNode, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface DrawerShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const FOCUSABLE =
  'a[href],area[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Right-side sliding drawer panel. Mirrors ModalShell's accessibility mechanics
 * (focus trap, Escape, body scroll-lock, restore focus, mount/closing state with
 * onAnimationEnd) and uses CSS keyframes (drawer-in/out) — no framer-motion.
 */
export default function DrawerShell({
  open,
  onClose,
  title,
  icon,
  description,
  children,
  footer,
}: DrawerShellProps) {
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

  // Initial focus + body scroll-lock + restore focus on close
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

  // Escape + focus trap (Tab stays inside; onCloseRef avoids re-mounting the listener)
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
      className="fixed inset-0 z-50"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
        className={`fixed inset-y-0 right-0 w-full max-w-full md:max-w-[520px] bg-surface border-l border-border shadow-2xl flex flex-col outline-none ${closing ? 'animate-[drawer-out_220ms_ease-in_forwards]' : 'animate-[drawer-in_240ms_ease-out_forwards]'}`}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={() => { if (closing) setMounted(false); }}
      >
        <button
          className="absolute top-4 right-4 text-secondary hover:text-text transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-md cursor-pointer"
          onClick={onClose}
          aria-label="Cerrar"
          type="button"
        >
          <X size={18} />
        </button>
        <div className="flex items-start gap-3 px-5 py-4 pr-12 shrink-0">
          {icon && (
            <span className="w-10 h-10 flex items-center justify-center shrink-0">
              {icon}
            </span>
          )}
          <div className="flex flex-col min-w-0">
            <h2 id="drawer-title" className="text-base sm:text-lg font-bold text-text truncate">{title}</h2>
            {description && (
              <p className="text-xs sm:text-sm text-secondary mt-1 line-clamp-2">{description}</p>
            )}
          </div>
        </div>
        <hr className="w-full border-border shrink-0" />
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="border-t border-border bg-surface px-5 py-4 shrink-0">{footer}</div>
        )}
      </div>
    </div>
  );
}
