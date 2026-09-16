import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { SlidersHorizontal } from 'lucide-react';
import clsx from 'clsx';
import { getDatePopoverPosition } from './dateFieldUtils';

interface FilterPopoverProps {
  children: ReactNode;
  label?: string;
  activeCount?: number;
  panelClassName?: string;
}

export default function FilterPopover({
  children,
  label = 'Filtros',
  activeCount = 0,
  panelClassName,
}: FilterPopoverProps) {
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
      const target = event.target as HTMLElement;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      // El menú de SelectField (react-select) se renderiza en un portal fuera
      // del árbol del popover — sin este check, elegir una opción lo cerraba
      // antes de que el click llegara a registrarse.
      if (target.closest('.select-menu-portal')) return;
      setOpen(false);
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
        aria-expanded={open}
        onClick={() => {
          setPosition((p) => ({ ...p, ready: false }));
          setOpen((v) => !v);
        }}
        className="inline-flex min-h-10 cursor-pointer select-none items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-bold text-text shadow-[var(--shadow-1)] material-state material-focus hover:bg-primary/8 hover:shadow-[var(--shadow-2)] active:bg-primary/12"
      >
        <SlidersHorizontal size={16} className="shrink-0" />
        <span>{label}</span>
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-label={label}
          className={clsx(
            'fixed z-[1000] w-64 max-w-[calc(100vw-1rem)] rounded-[var(--radius-card)] border border-border bg-surface p-3 shadow-[var(--shadow-3)]',
            panelClassName,
          )}
          style={{ left: position.left, top: position.top, visibility: position.ready ? 'visible' : 'hidden' }}
        >
          <div className="flex flex-col gap-3">{children}</div>
        </div>,
        document.body,
      )}
    </>
  );
}
