import { type ReactNode, useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  description?: string;
  children: ReactNode;
}

export default function ModalShell({
  open,
  onClose,
  title,
  icon,
  description,
  children
}: ModalShellProps) {
  const [mounted, setMounted] = useState(open);
  const closing = mounted && !open;

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 ${closing ? 'animate-[modal-backdrop-out_200ms_ease-in_forwards]' : 'animate-[modal-backdrop-in_200ms_ease-out_forwards]'}`}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`bg-surface rounded-2xl shadow-2xl mx-auto border border-border relative w-full max-w-sm sm:max-w-md max-h-[90vh] flex flex-col ${closing ? 'animate-[modal-out_200ms_ease-in_forwards]' : 'animate-[modal-in_220ms_ease-out_forwards]'}`}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={() => { if (closing) setMounted(false); }}
      >
        <button
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-secondary hover:text-text transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-md"
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
