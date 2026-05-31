export default function TraceCard({ ruleId, name, reason, highlighted = false }) {
  return (
    <div
      className={[
        'rounded-xl border px-4 py-3.5 text-sm',
        highlighted
          ? 'border-success-500/40 bg-success-50 ring-1 ring-success-500/20'
          : 'border-line bg-surface/60',
      ].join(' ')}
    >
      <p className="font-semibold text-ink">
        {ruleId} fired: {name}
      </p>
      <p className="mt-1.5 leading-6 text-muted">
        <span className="font-medium text-ink/80">Reason:</span> {reason}
      </p>
    </div>
  )
}
