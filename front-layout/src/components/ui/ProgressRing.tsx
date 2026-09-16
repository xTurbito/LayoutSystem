import type { LucideIcon } from 'lucide-react';
import { Check } from 'lucide-react';

interface ProgressRingProps {
  value: number;
  label: string;
  icon?: LucideIcon;
  /** Variable CSS de color a usar en el anillo (ej. 'var(--color-success)'). */
  color?: string;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Anillo circular de progreso (conic-gradient), genérico — sin ningún
 * dominio de negocio. `label` es el aria-label completo, a cargo de quien
 * lo use (ej. "Asistencia 87%", "Meta 42%").
 */
export default function ProgressRing({ value, label, icon: Icon = Check, color = 'var(--color-primary)' }: ProgressRingProps) {
  const safeValue = clamp(value);
  return (
    <span
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(${color} ${safeValue}%, var(--color-surface-high) 0)` }}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-surface" style={{ color }}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
    </span>
  );
}
