import { X } from 'lucide-react';
import ModalShell from './ModalShell';
import Button from './Button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'primary';
}

/**
 * Confirmación de acciones destructivas — mismo patrón que el modal de
 * "Cerrar sesión" del Sidebar, para no reimplementar el confirm inline en
 * cada módulo.
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  isLoading = false,
  variant = 'danger',
}: ConfirmDialogProps) {
  return (
    <ModalShell open={open} onClose={onClose} title={title} hideDivider subtleTitle>
      {description && (
        <p className="text-lg font-bold leading-snug text-text">{description}</p>
      )}
      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Cancelar"
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary-container text-primary material-state hover:bg-primary/20 active:bg-primary/25 material-focus disabled:cursor-not-allowed disabled:opacity-60"
        >
          <X size={18} />
        </button>
        <Button type="button" label={confirmLabel} variant={variant} onClick={onConfirm} isLoading={isLoading} />
      </div>
    </ModalShell>
  );
}
