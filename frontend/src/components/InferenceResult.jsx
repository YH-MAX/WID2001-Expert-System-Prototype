import { AlertCircle, CheckCircle2, Lightbulb, Workflow } from 'lucide-react'
import { getVerdictColor } from '../lib/expertSystem'
import ScoreCard from './ScoreCard'
import TraceCard from './TraceCard'

function BulletList({ items, icon: Icon, iconClassName }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-sm leading-6 text-muted">
          <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconClassName}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function ScoreRing({ score }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
      <svg className="-rotate-90" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke="#22c55e"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums text-ink">{score}</span>
        <span className="text-xs font-medium text-muted">/ 100</span>
      </div>
    </div>
  )
}

function verdictStyles(tone) {
  if (tone === 'success') {
    return {
      title: 'text-success-700',
      bar: 'bg-success-500',
      label: 'text-success-600',
    }
  }
  if (tone === 'amber') {
    return {
      title: 'text-amber-700',
      bar: 'bg-amber-500',
      label: 'text-amber-600',
    }
  }
  return {
    title: 'text-red-700',
    bar: 'bg-red-500',
    label: 'text-red-600',
  }
}

export default function InferenceResult({ result, evaluated, loading = false }) {
  const tone = getVerdictColor(result.verdict)
  const styles = verdictStyles(tone)

  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] lg:p-7">
      <div className="mb-6">
        <p className={`text-[11px] font-bold uppercase tracking-[0.14em] ${styles.label}`}>
          Inference Result
        </p>
        <h2 className={`mt-1 text-xl font-bold tracking-tight sm:text-[1.35rem] ${styles.title}`}>
          {loading
            ? 'Evaluating...'
            : evaluated
              ? `Final Verdict: ${result.verdict}`
              : 'Awaiting Evaluation'}
        </h2>
      </div>

      <div className="flex flex-col gap-5 border-b border-line pb-6 sm:flex-row sm:items-center">
        <ScoreRing score={evaluated ? result.score : 0} />
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-6 text-muted">
            {evaluated
              ? result.summary
              : 'Complete the questionnaire and click Evaluate Readiness to run the inference engine.'}
          </p>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-line">
            <div
              className={`h-full rounded-full transition-all duration-700 ${styles.bar}`}
              style={{ width: evaluated ? `${result.score}%` : '0%' }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <ScoreCard label="Academic" value={result.breakdown.academic} max={20} />
        <ScoreCard label="Projects" value={result.breakdown.projects} max={25} />
        <ScoreCard
          label="Technical Stack"
          value={result.breakdown.technicalStack}
          max={15}
        />
        <ScoreCard label="Preparedness" value={result.breakdown.preparedness} max={40} />
      </div>

      <div className="mt-8 space-y-6">
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
            <CheckCircle2 className="h-4 w-4 text-success-600" />
            Strengths Detected
          </h3>
          <BulletList
            items={result.strengths}
            icon={CheckCircle2}
            iconClassName="text-success-600"
          />
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            Weaknesses Detected
          </h3>
          <BulletList
            items={result.weaknesses}
            icon={AlertCircle}
            iconClassName="text-amber-600"
          />
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
            <Lightbulb className="h-4 w-4 text-brand-600" />
            Recommended Actions
          </h3>
          <BulletList
            items={result.recommendations}
            icon={Lightbulb}
            iconClassName="text-brand-600"
          />
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
            <Workflow className="h-4 w-4 text-brand-600" />
            Expert System Trace
          </h3>
          {evaluated && result.firedRules.length > 0 ? (
            <div className="space-y-3">
              {result.firedRules.map((rule) => (
                <TraceCard
                  key={rule.id}
                  ruleId={rule.id}
                  name={rule.name}
                  reason={rule.reason}
                  highlighted={rule.selected}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-line bg-surface/50 px-4 py-6 text-sm text-muted">
              {evaluated
                ? 'No rules fired. Weighted score was used for the verdict.'
                : 'Rule trace will appear here after evaluation.'}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
