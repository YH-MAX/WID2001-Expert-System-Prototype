import {
  GITHUB_OPTIONS,
  RESUME_OPTIONS,
  SCENARIOS,
  TARGET_ROLES,
  TECH_SKILLS,
} from '../lib/constants'

function FieldLabel({ children }) {
  return (
    <span className="mb-1.5 block text-sm font-medium text-ink">{children}</span>
  )
}

function selectClassName() {
  return 'w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
}

function inputClassName() {
  return 'w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
}

export default function StudentQuestionnaire({
  form,
  onChange,
  onEvaluate,
  onReset,
  onScenario,
  loading = false,
}) {
  const toggleSkill = (skill) => {
    const exists = form.techSkills.includes(skill)
    onChange({
      techSkills: exists
        ? form.techSkills.filter((item) => item !== skill)
        : [...form.techSkills, skill],
    })
  }

  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] lg:p-7">
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">
          Student Questionnaire
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-ink sm:text-[1.35rem]">
          Portfolio Facts
        </h2>
      </div>

      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault()
          onEvaluate()
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <FieldLabel>CGPA</FieldLabel>
            <input
              className={inputClassName()}
              type="number"
              min="0"
              max="4"
              step="0.01"
              value={form.cgpa}
              onChange={(event) => onChange({ cgpa: Number(event.target.value) })}
            />
          </label>

          <label>
            <FieldLabel>Technical projects completed</FieldLabel>
            <input
              className={inputClassName()}
              type="number"
              min="0"
              max="20"
              step="1"
              value={form.projects}
              onChange={(event) => onChange({ projects: Number(event.target.value) })}
            />
          </label>
        </div>

        <label>
          <FieldLabel>Target role</FieldLabel>
          <select
            className={selectClassName()}
            value={form.targetRole}
            onChange={(event) => onChange({ targetRole: event.target.value })}
          >
            {TARGET_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend className="mb-3 text-sm font-medium text-ink">
            Technical stack evidence
          </legend>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {TECH_SKILLS.map((skill) => {
              const checked = form.techSkills.includes(skill)
              return (
                <label
                  key={skill}
                  className={[
                    'flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition',
                    checked
                      ? 'border-brand-300 bg-brand-50 text-brand-700'
                      : 'border-line bg-white text-muted hover:border-brand-200',
                  ].join(' ')}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500"
                    checked={checked}
                    onChange={() => toggleSkill(skill)}
                  />
                  <span>{skill}</span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <FieldLabel>GitHub / portfolio visibility</FieldLabel>
            <select
              className={selectClassName()}
              value={form.githubActivity}
              onChange={(event) => onChange({ githubActivity: event.target.value })}
            >
              {GITHUB_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <FieldLabel>Resume status</FieldLabel>
            <select
              className={selectClassName()}
              value={form.resumeStatus}
              onChange={(event) => onChange({ resumeStatus: event.target.value })}
            >
              {RESUME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <FieldLabel>Soft skill readiness</FieldLabel>
            <span className="rounded-md bg-brand-50 px-2 py-0.5 text-sm font-semibold tabular-nums text-brand-700">
              {form.softSkills} / 5
            </span>
          </div>
          <input
            className="h-2 w-full cursor-pointer accent-brand-600"
            type="range"
            min="1"
            max="5"
            step="1"
            value={form.softSkills}
            onChange={(event) => onChange({ softSkills: Number(event.target.value) })}
          />
        </div>

        <fieldset>
          <legend className="mb-3 text-sm font-medium text-ink">Preparation checklist</legend>
          <div className="grid gap-2.5">
            {[
              ['liveDeployments', 'Has live deployments'],
              ['professionalCerts', 'Has professional certification'],
              ['interviewPrep', 'Has interview preparation'],
            ].map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line px-3 py-2.5 text-sm text-ink hover:bg-surface/80"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500"
                  checked={form[key]}
                  onChange={(event) => onChange({ [key]: event.target.checked })}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-success-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-success-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Evaluating...' : 'Evaluate Readiness'}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            Reset
          </button>
        </div>

        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted">
            Scenario presets
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SCENARIOS).map(([key, scenario]) => (
              <button
                key={key}
                type="button"
                onClick={() => onScenario(scenario.values)}
                className="rounded-full border border-line bg-surface/80 px-3.5 py-1.5 text-xs font-semibold text-ink transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 sm:text-[13px]"
              >
                {scenario.label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </section>
  )
}
