import { useCallback, useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import InferenceResult from './components/InferenceResult'
import KnowledgeBase from './components/KnowledgeBase'
import StudentQuestionnaire from './components/StudentQuestionnaire'
import { DEFAULT_FORM } from './lib/constants'
import { evaluateReadiness } from './lib/expertSystem'

const EMPTY_RESULT = {
  verdict: 'Awaiting Evaluation',
  score: 0,
  breakdown: { academic: 0, projects: 0, technicalStack: 0, preparedness: 0 },
  summary: '',
  strengths: [],
  weaknesses: [],
  recommendations: [],
  firedRules: [],
}

export default function App() {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [evaluated, setEvaluated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(EMPTY_RESULT)

  const runEvaluation = useCallback(async (nextForm) => {
    setLoading(true)
    try {
      const nextResult = await evaluateReadiness(nextForm)
      setResult(nextResult)
      setEvaluated(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    runEvaluation(DEFAULT_FORM)
  }, [runEvaluation])

  const handleChange = useCallback((patch) => {
    setForm((current) => ({ ...current, ...patch }))
  }, [])

  const handleEvaluate = useCallback(() => {
    runEvaluation(form)
  }, [form, runEvaluation])

  const handleReset = useCallback(() => {
    setForm(DEFAULT_FORM)
    runEvaluation(DEFAULT_FORM)
  }, [runEvaluation])

  const handleScenario = useCallback(
    (values) => {
      setForm(values)
      runEvaluation(values)
    },
    [runEvaluation],
  )

  const displayResult = useMemo(
    () => (evaluated ? result : EMPTY_RESULT),
    [evaluated, result],
  )

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]">
      <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Header />

        <main className="mt-6 space-y-6 lg:mt-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:items-start">
            <StudentQuestionnaire
              form={form}
              onChange={handleChange}
              onEvaluate={handleEvaluate}
              onReset={handleReset}
              onScenario={handleScenario}
              loading={loading}
            />
            <InferenceResult result={displayResult} evaluated={evaluated} loading={loading} />
          </div>

          <KnowledgeBase />
        </main>

        <footer className="mt-8 pb-2 text-center text-xs text-muted">
          Reasonova · WID2001 Knowledge Representation and Reasoning · UM Computer Science
        </footer>
      </div>
    </div>
  )
}
