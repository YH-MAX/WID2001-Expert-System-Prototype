import { listRules } from '../lib/expertSystem'
import RuleCard from './RuleCard'

export default function KnowledgeBase() {
  const rules = listRules().filter((rule) => rule.category === 'final')

  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] lg:p-7">
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">
          Knowledge Base
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-ink sm:text-[1.35rem]">
          Core IF–THEN Rules
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rules.map((rule) => (
          <RuleCard
            key={rule.id}
            title={`${rule.id}: ${rule.name}`}
            text={rule.conclusion}
          />
        ))}
      </div>
    </section>
  )
}
