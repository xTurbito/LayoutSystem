interface StatCardProps {
  label: string;
  value: number | string | undefined;
  isLoading?: boolean;
}

export default function StatCard({ label, value, isLoading }: StatCardProps) {
  return (
    <div className="rounded-[var(--radius-card)] bg-surface-container px-3 py-3 sm:px-6 sm:py-5">
      <p className="truncate text-[10px] font-bold uppercase tracking-wide text-secondary sm:text-xs">{label}</p>
      {isLoading ? (
        <div className="mt-2 h-6 w-10 animate-pulse rounded bg-border sm:h-7 sm:w-12" />
      ) : (
        <p className="mt-1 text-lg font-bold text-text tabular-nums sm:text-2xl">{value ?? '—'}</p>
      )}
    </div>
  );
}
