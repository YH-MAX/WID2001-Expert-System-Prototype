import { IN_DEMAND_SKILLS } from './constants'

function asFloat(value, defaultValue = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : defaultValue
}

function asInt(value, defaultValue = 0) {
  const parsed = parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : defaultValue
}

export function formToPayload(form) {
  return {
    cgpa: form.cgpa,
    projects: form.projects,
    techSkills: form.techSkills,
    liveDeployments: form.liveDeployments,
    githubActivity: form.githubActivity,
    resumeStatus: form.resumeStatus === 'not_prepared' ? 'not_started' : form.resumeStatus,
    professionalCerts: form.professionalCerts,
    softSkills: form.softSkills,
    interviewPrep: form.interviewPrep,
  }
}

export function normalizeFacts(raw) {
  let skills = raw.techSkills || []
  if (typeof skills === 'string') skills = [skills]

  const facts = {
    cgpa: Math.max(0, Math.min(4, asFloat(raw.cgpa))),
    projects: Math.max(0, asInt(raw.projects)),
    tech_skills: skills.map(String),
    live_deployments: Boolean(raw.liveDeployments),
    github_activity: String(raw.githubActivity || 'none'),
    resume_status: String(raw.resumeStatus || 'not_started'),
    professional_certs: Boolean(raw.professionalCerts),
    soft_skills: Math.max(1, Math.min(5, asInt(raw.softSkills, 1))),
    interview_prep: Boolean(raw.interviewPrep),
  }

  const inDemandCount = facts.tech_skills.filter((skill) => IN_DEMAND_SKILLS.has(skill)).length
  facts.in_demand_stack = inDemandCount >= 2

  return facts
}

export function scoreFacts(facts) {
  const { cgpa, projects, tech_skills: techSkills } = facts
  const skillCount = new Set(techSkills.filter((skill) => IN_DEMAND_SKILLS.has(skill))).size

  let academic
  if (cgpa >= 3.5) academic = 20
  else if (cgpa >= 3.0) academic = 16
  else if (cgpa >= 2.5) academic = 10
  else academic = 4

  let projectScore
  if (projects >= 4) projectScore = 25
  else if (projects === 3) projectScore = 20
  else if (projects === 2) projectScore = 14
  else if (projects === 1) projectScore = 8
  else projectScore = 0

  let technical
  if (skillCount >= 4) technical = 15
  else if (skillCount === 3) technical = 12
  else if (skillCount === 2) technical = 9
  else if (skillCount === 1) technical = 5
  else technical = 0

  let preparation = 0
  preparation += facts.live_deployments ? 8 : 0
  preparation += { none: 0, basic: 5, active: 10 }[facts.github_activity] ?? 0
  preparation += { not_started: 0, draft: 5, reviewed: 10 }[facts.resume_status] ?? 0
  preparation += facts.soft_skills >= 4 ? 7 : facts.soft_skills === 3 ? 4 : 1
  preparation += facts.interview_prep ? 5 : 0
  preparation += facts.professional_certs ? 5 : 0

  const cappedPreparation = Math.min(40, preparation)
  const total = Math.min(100, academic + projectScore + technical + cappedPreparation)

  return {
    academic,
    projects: projectScore,
    technical_stack: technical,
    preparation: cappedPreparation,
    total,
  }
}

const RULES = [
  {
    rule_id: 'R1',
    name: 'Ideal Candidate - Balanced Weight',
    category: 'final',
    priority: 80,
    condition: (facts) => facts.cgpa >= 3.0 && facts.projects >= 3 && facts.in_demand_stack,
    conclusion: 'Strong academic baseline is validated by practical technical execution.',
    explanation:
      'CGPA, project count, and in-demand skills jointly support a strong internship profile.',
    recommendations: [
      'Prepare applications for competitive software engineering or IT placements.',
      'Use the strongest deployed project as the lead portfolio item in the resume.',
    ],
    verdict: 'Highly Competitive',
  },
  {
    rule_id: 'R2',
    name: 'Heavy Project Weight - Compensating for Grades',
    category: 'final',
    priority: 90,
    condition: (facts) => facts.cgpa < 3.0 && facts.projects >= 4 && facts.live_deployments,
    conclusion: 'A high volume of deployed work compensates for a minor academic dip.',
    explanation:
      'The profile shows industry-facing proof of ability through several live projects.',
    recommendations: [
      'Lead with deployed project links and GitHub repositories during applications.',
      'Briefly explain the academic dip while emphasizing delivery and technical ownership.',
    ],
    verdict: 'Highly Competitive',
  },
  {
    rule_id: 'R3',
    name: 'Academic Trap - Missing Practical Weight',
    category: 'final',
    priority: 95,
    condition: (facts) => facts.cgpa >= 3.5 && facts.projects === 0,
    conclusion: 'High academic theory is not enough without practical proof.',
    explanation:
      'A strong CGPA is present, but the missing project portfolio creates a major hiring risk.',
    recommendations: [
      'Build at least two GitHub-ready projects before applying to top-tier firms.',
      'Start with one full-stack or API-based project that solves a real student problem.',
    ],
    verdict: 'Low Competitiveness',
  },
  {
    rule_id: 'R4',
    name: 'Mid-Tier - Needs Skill Specialization',
    category: 'final',
    priority: 50,
    condition: (facts) =>
      facts.cgpa >= 2.5 && facts.projects >= 1 && !facts.professional_certs,
    conclusion: 'The student meets a minimum baseline but needs stronger specialization.',
    explanation:
      'The profile is viable, but it lacks an extra signal such as certification or deep project complexity.',
    recommendations: [
      'Add one specialized credential or project track, such as AI, cloud, cybersecurity, or data engineering.',
      'Improve the resume by connecting each project to measurable technical outcomes.',
    ],
    verdict: 'Moderately Competitive',
  },
  {
    rule_id: 'R5',
    name: 'Critical Gap',
    category: 'final',
    priority: 100,
    condition: (facts) => facts.cgpa < 2.5 && facts.projects === 0,
    conclusion: 'Applications should pause until a basic portfolio foundation exists.',
    explanation:
      'Both academic standing and project evidence are currently below the internship baseline.',
    recommendations: [
      'Halt applications temporarily and build a foundational GitHub portfolio.',
      'Complete one course-aligned project and one practical web or data project within four weeks.',
    ],
    verdict: 'Low Competitiveness',
  },
  {
    rule_id: 'R6',
    name: 'Portfolio Visibility Gap',
    category: 'supporting',
    priority: 30,
    condition: (facts) => facts.projects > 0 && facts.github_activity === 'none',
    conclusion: 'Project evidence exists but is not visible to recruiters.',
    explanation:
      'Recruiters need GitHub, screenshots, README files, or live demos to verify claimed skills.',
    recommendations: [
      'Upload project source code to GitHub with clear README files.',
      'Add screenshots, setup steps, and a short explanation of your contribution.',
    ],
    verdict: null,
  },
  {
    rule_id: 'R7',
    name: 'Resume Preparation Gap',
    category: 'supporting',
    priority: 30,
    condition: (facts) => facts.resume_status !== 'reviewed',
    conclusion: 'The resume is not yet recruiter-ready.',
    explanation: 'A weak or unreviewed resume can hide otherwise strong technical evidence.',
    recommendations: [
      'Revise the resume so each project includes tech stack, role, and measurable outcome.',
      'Ask an internship coordinator, lecturer, or senior student to review the resume.',
    ],
    verdict: null,
  },
  {
    rule_id: 'R8',
    name: 'Soft Skill Risk',
    category: 'supporting',
    priority: 25,
    condition: (facts) => facts.soft_skills <= 2,
    conclusion: 'Communication readiness is below workplace expectation.',
    explanation:
      'Industrial training requires clear reporting, collaboration, and basic interview communication.',
    recommendations: [
      'Practice a one-minute self-introduction and one project walkthrough.',
      'Join mock interviews or team presentations to improve confidence.',
    ],
    verdict: null,
  },
  {
    rule_id: 'R9',
    name: 'Interview Preparation Gap',
    category: 'supporting',
    priority: 20,
    condition: (facts) => !facts.interview_prep,
    conclusion: 'The student has not prepared for internship screening.',
    explanation:
      'Even a good portfolio may underperform if the student cannot explain decisions and trade-offs.',
    recommendations: [
      'Prepare answers for project challenges, teamwork, debugging, and learning goals.',
      'Practice explaining one technical project using problem, method, result, and reflection.',
    ],
    verdict: null,
  },
]

function scoreVerdict(score) {
  if (score >= 75) return 'Highly Competitive'
  if (score >= 55) return 'Moderately Competitive'
  return 'Low Competitiveness'
}

export function evaluateStudent(rawFacts) {
  const facts = normalizeFacts(rawFacts)
  const scores = scoreFacts(facts)
  const firedRules = RULES.filter((rule) => rule.condition(facts))

  const finalRules = firedRules
    .filter((rule) => rule.category === 'final')
    .sort((a, b) => b.priority - a.priority)

  let selectedRule = null
  let verdict

  if (finalRules.length > 0 && finalRules[0].priority >= 90) {
    selectedRule = finalRules[0]
    verdict = selectedRule.verdict || scoreVerdict(scores.total)
  } else if (
    scores.total >= 75 &&
    finalRules.some((rule) => rule.rule_id === 'R1' || rule.rule_id === 'R2')
  ) {
    selectedRule = finalRules.find((rule) => rule.rule_id === 'R1' || rule.rule_id === 'R2')
    verdict = selectedRule?.verdict || 'Highly Competitive'
  } else if (finalRules.length > 0) {
    selectedRule = finalRules[0]
    verdict = selectedRule.verdict || scoreVerdict(scores.total)
    if (scores.total >= 75 && verdict === 'Moderately Competitive') {
      verdict = 'Highly Competitive'
    }
  } else {
    verdict = scoreVerdict(scores.total)
  }

  const recommendations = []
  for (const rule of firedRules) {
    for (const item of rule.recommendations) {
      if (!recommendations.includes(item)) recommendations.push(item)
    }
  }

  if (
    facts.projects < 3 &&
    !recommendations.includes(
      'Build at least three portfolio projects: one web/API project, one data or AI project, and one team-based project.',
    )
  ) {
    recommendations.push(
      'Build at least three portfolio projects: one web/API project, one data or AI project, and one team-based project.',
    )
  }

  if (
    !facts.in_demand_stack &&
    !recommendations.includes(
      'Strengthen the technical stack with at least two in-demand areas such as backend APIs, databases, cloud, AI, or cybersecurity.',
    )
  ) {
    recommendations.push(
      'Strengthen the technical stack with at least two in-demand areas such as backend APIs, databases, cloud, AI, or cybersecurity.',
    )
  }

  if (recommendations.length === 0) {
    recommendations.push(
      'Keep the portfolio active and tailor applications to roles that match your strongest project evidence.',
    )
  }

  const trace = firedRules.map((rule) => ({
    id: rule.rule_id,
    name: rule.name,
    conclusion: rule.conclusion,
    explanation: rule.explanation,
    selected: selectedRule !== null && rule.rule_id === selectedRule.rule_id,
  }))

  const summary = selectedRule
    ? selectedRule.explanation
    : 'No high-priority override rule fired, so the inference engine used the weighted readiness score.'

  return {
    verdict,
    score: scores.total,
    scoreBreakdown: scores,
    summary,
    recommendations: recommendations.slice(0, 6),
    firedRules: trace,
    facts,
  }
}

function buildStrengths(facts) {
  const strengths = []

  if (facts.cgpa >= 3.5) strengths.push('Strong CGPA supports academic credibility.')
  else if (facts.cgpa >= 3.0) strengths.push('Solid CGPA meets the baseline academic expectation.')

  if (facts.projects >= 3) strengths.push('Multiple relevant projects demonstrate applied skills.')
  else if (facts.projects >= 1) strengths.push('Project evidence shows practical experience.')

  if (facts.in_demand_stack) strengths.push('In-demand technical stack is well represented.')
  if (facts.github_activity === 'active') {
    strengths.push('Active GitHub portfolio improves recruiter visibility.')
  }
  if (facts.resume_status === 'reviewed') {
    strengths.push('Resume is reviewed and ready for applications.')
  }
  if (facts.soft_skills >= 4) strengths.push('Soft skill readiness supports interview performance.')

  if (strengths.length === 0) strengths.push('Some foundational elements are present to build upon.')

  return strengths.slice(0, 4)
}

function buildWeaknesses(facts, firedRules) {
  const weaknesses = []
  const firedIds = new Set(firedRules.map((rule) => rule.id))

  if (facts.projects === 0) weaknesses.push('No technical projects weaken practical credibility.')
  else if (facts.projects < 2) {
    weaknesses.push('Limited project count may not satisfy competitive employers.')
  }

  if (!facts.tech_skills.includes('Cloud / DevOps')) {
    weaknesses.push('More cloud/DevOps exposure is recommended.')
  }

  const inDemandCount = facts.tech_skills.filter((skill) => IN_DEMAND_SKILLS.has(skill)).length
  if (inDemandCount < 4) weaknesses.push('Technical stack depth can be improved.')

  if (facts.github_activity !== 'active') {
    weaknesses.push('GitHub or portfolio visibility needs improvement.')
  }
  if (facts.resume_status !== 'reviewed') {
    weaknesses.push('Resume is not yet recruiter-ready.')
  }
  if (facts.soft_skills <= 2) {
    weaknesses.push('Soft skill readiness is below workplace expectation.')
  }
  if (!facts.interview_prep) weaknesses.push('Interview preparation is missing.')

  if (firedIds.has('R3')) {
    weaknesses.push('High CGPA without projects creates an academic trap for recruiters.')
  }

  if (weaknesses.length === 0) weaknesses.push('Minor gaps remain in specialization depth.')

  return weaknesses.slice(0, 4)
}

export function adaptResultForUi(apiResult) {
  const breakdown = apiResult.scoreBreakdown

  return {
    verdict: apiResult.verdict,
    score: apiResult.score,
    breakdown: {
      academic: breakdown.academic,
      projects: breakdown.projects,
      technicalStack: breakdown.technical_stack,
      preparedness: breakdown.preparation,
    },
    summary: apiResult.summary,
    recommendations: apiResult.recommendations,
    firedRules: apiResult.firedRules.map((rule) => ({
      id: rule.id,
      name: rule.name,
      reason: rule.explanation,
      conclusion: rule.conclusion,
      selected: rule.selected,
    })),
    strengths: buildStrengths(apiResult.facts),
    weaknesses: buildWeaknesses(apiResult.facts, apiResult.firedRules),
  }
}

export async function evaluateReadiness(form) {
  const payload = formToPayload(form)

  try {
    const response = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      return adaptResultForUi(await response.json())
    }
  } catch {
    // Fall back to the in-browser engine when the API is unavailable (e.g. Vite dev).
  }

  return adaptResultForUi(evaluateStudent(payload))
}

export function listRules() {
  return RULES.map((rule) => ({
    id: rule.rule_id,
    name: rule.name,
    category: rule.category,
    conclusion: rule.conclusion,
    explanation: rule.explanation,
  }))
}

export function getVerdictColor(verdict) {
  if (verdict.includes('Highly')) return 'success'
  if (verdict.includes('Moderately')) return 'amber'
  return 'danger'
}
