export function ProgressBar({ value, label }: { value: number; label: string }) {
  const safe = Math.min(100, Math.max(0, value));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold text-[var(--muted)]">
        <span>{label}</span><span>{safe.toFixed(1)}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-2)]" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(safe)}>
        <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${safe}%` }} />
      </div>
    </div>
  );
}
