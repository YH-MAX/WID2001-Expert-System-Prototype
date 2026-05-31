import { Sparkles } from 'lucide-react'
import { NAV_ITEMS } from '../lib/constants'

export default function Header() {
  return (
    <header className="rounded-2xl border border-line bg-white px-6 py-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] lg:px-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-200">
            <Sparkles className="h-6 w-6" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[1.65rem]">
              Reasonova
            </h1>
            <p className="mt-0.5 text-sm font-medium text-muted">
              Internship Readiness Expert System
            </p>
          </div>
        </div>

        <p className="max-w-xl text-sm leading-6 text-muted xl:flex-1 xl:px-4">
          Evaluate UM Computer Science students&apos; internship competitiveness using
          SME-inspired rules for CGPA, projects, technical skills, GitHub, resume
          preparation, and soft skills.
        </p>

        <nav
          className="flex flex-wrap gap-2 xl:justify-end"
          aria-label="Expert system flow"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = item === 'UI'
            return (
              <button
                key={item}
                type="button"
                className={[
                  'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors sm:text-[13px]',
                  isActive
                    ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                    : 'border-line bg-white text-muted hover:border-brand-200 hover:text-brand-600',
                ].join(' ')}
              >
                {item}
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
