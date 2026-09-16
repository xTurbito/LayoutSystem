import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import ProgressRing from './ProgressRing';

interface MetricCardProps {
  title: string;
  value: ReactNode;
  helper: string;
  icon: LucideIcon;
  tone?: 'primary' | 'success' | 'danger' | 'warning';
  progress?: number;
  /** aria-label del anillo de progreso; por default usa "{title} {progress}%". */
  progressLabel?: string;
}

export default function MetricCard({ title, value, helper, icon: Icon, tone = 'primary', progress, progressLabel }: MetricCardProps) {
  const toneClass = {
    primary: 'bg-primary-container text-primary',
    success: 'bg-success-container text-success',
    danger: 'bg-error-container text-error',
    warning: 'bg-warning-container text-warning',
  }[tone];

  return (
    <section className="min-h-[112px] rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-[var(--shadow-2)] transition duration-200 motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black text-secondary">{title}</p>
          <p className="mt-1.5 truncate text-xl font-black tabular-nums text-text sm:text-2xl">{value}</p>
          <p className="mt-1.5 text-xs font-bold text-secondary">{helper}</p>
        </div>
        {typeof progress === 'number' ? (
          <ProgressRing value={progress} label={progressLabel ?? `${title} ${progress}%`} color="var(--color-success)" />
        ) : (
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${toneClass}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
      </div>
    </section>
  );
}
