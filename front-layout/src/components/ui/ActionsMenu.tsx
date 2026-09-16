import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';
import clsx from 'clsx';
import { getDatePopoverPosition } from './dateFieldUtils';

interface ActionsMenuProps {
  children: ReactNode;
  label?: string;
  buttonClassName?: string;
}

/**
 * Menú kebab (⋮) para acciones secundarias de fila. Se renderiza en un portal
 * a document.body para no quedar recortado por el overflow-hidden/auto de la
 * tabla — se cierra al elegir un item, con click afuera, o con Escape.
 */
export default function ActionsMenu({ children, label = 'Más acciones', buttonClassName }: ActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 8, top: 8, ready: false });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const reposition = useCallback(() => {
    const anchor = triggerRef.current?.getBoundingClientRect();
    const panel = panelRef.current?.getBoundingClientRect();
    if (!anchor || !panel) return;
    setPosition({ ...getDatePopoverPosition(anchor, panel, {
      width: window.innerWidth,
      height: window.innerHeight,
    }, 'end'), ready: true });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    const initialFrame = requestAnimationFrame(reposition);
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !triggerRef.current?.contains(target)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, { capture: true, passive: true });
    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(initialFrame);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, reposition]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => {
          setPosition((p) => ({ ...p, ready: false }));
          setOpen((v) => !v);
        }}
        className={clsx(
          'flex cursor-pointer items-center justify-center rounded-full text-secondary material-state hover:bg-primary/8 hover:text-primary material-focus',
          buttonClassName ?? 'h-10 w-10',
        )}
      >
        <MoreVertical size={18} />
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={panelRef}
          role="menu"
          aria-label={label}
          onClick={() => setOpen(false)}
          className="fixed z-[1000] w-48 overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-3)]"
          style={{ left: position.left, top: position.top, visibility: position.ready ? 'visible' : 'hidden' }}
        >
          {children}
        </div>,
        document.body,
      )}
    </>
  );
}
