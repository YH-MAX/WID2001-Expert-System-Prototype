export default function ScoreCard({ label, value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0

  return (
    <div className="rounded-xl border border-line bg-surface/70 px-4 py-3.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
        <p className="text-lg font-bold tabular-nums text-ink">
          {value}
          <span className="text-sm font-medium text-muted"> / {max}</span>
        </p>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
