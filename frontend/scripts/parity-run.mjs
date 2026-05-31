import { evaluateStudent } from '../src/lib/expertSystem.js'

const cases = JSON.parse(process.argv[2])
const output = {}

for (const [name, payload] of Object.entries(cases)) {
  const resumeStatus =
    payload.resumeStatus === 'not_prepared' ? 'not_started' : payload.resumeStatus
  const result = evaluateStudent({ ...payload, resumeStatus })
  output[name] = {
    verdict: result.verdict,
    score: result.score,
    scoreBreakdown: result.scoreBreakdown,
    summary: result.summary,
    recommendations: result.recommendations,
    firedRules: result.firedRules.map((rule) => ({
      id: rule.id,
      selected: rule.selected,
    })),
  }
}

process.stdout.write(JSON.stringify(output))
