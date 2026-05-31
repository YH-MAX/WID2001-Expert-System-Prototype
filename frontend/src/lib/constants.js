export const TECH_SKILLS = [
  'Full-stack web',
  'Database / SQL',
  'AI / machine learning',
  'Cybersecurity',
  'REST API / backend',
  'Python / data',
  'Cloud / DevOps',
  'Mobile development',
]

export const TARGET_ROLES = [
  'Software Engineering',
  'Data Science',
  'AI / Machine Learning',
  'Cybersecurity',
  'Web Development',
]

export const GITHUB_OPTIONS = [
  { value: 'active', label: 'Active GitHub portfolio' },
  { value: 'basic', label: 'Basic GitHub profile' },
  { value: 'none', label: 'No portfolio' },
]

export const RESUME_OPTIONS = [
  { value: 'reviewed', label: 'Reviewed and ready' },
  { value: 'draft', label: 'Draft only' },
  { value: 'not_prepared', label: 'Not prepared' },
]

export const NAV_ITEMS = ['UI', 'Student Facts', 'Inference Engine', 'Knowledge Base', 'Verdict']

export const IN_DEMAND_SKILLS = new Set([
  'Full-stack web',
  'REST API / backend',
  'Database / SQL',
  'Python / data',
  'AI / machine learning',
  'Cloud / DevOps',
  'Cybersecurity',
])

/** Matches the original vanilla UI defaults. */
export const DEFAULT_FORM = {
  cgpa: 3.2,
  projects: 3,
  targetRole: 'Software Engineering',
  techSkills: ['Full-stack web', 'REST API / backend'],
  githubActivity: 'active',
  resumeStatus: 'reviewed',
  softSkills: 4,
  liveDeployments: true,
  professionalCerts: false,
  interviewPrep: true,
}

/** Demo profiles from the original app.js — aligned with Python expert_system.py tests. */
export const SCENARIOS = {
  ideal: {
    label: 'Ideal profile',
    values: {
      cgpa: 3.6,
      projects: 4,
      targetRole: 'Software Engineering',
      techSkills: ['Full-stack web', 'REST API / backend', 'Database / SQL', 'Cloud / DevOps'],
      githubActivity: 'active',
      resumeStatus: 'reviewed',
      softSkills: 4,
      liveDeployments: true,
      professionalCerts: true,
      interviewPrep: true,
    },
  },
  academicTrap: {
    label: 'High CGPA, no projects',
    values: {
      cgpa: 3.9,
      projects: 0,
      targetRole: 'Software Engineering',
      techSkills: ['Python / data'],
      githubActivity: 'none',
      resumeStatus: 'draft',
      softSkills: 3,
      liveDeployments: false,
      professionalCerts: false,
      interviewPrep: false,
    },
  },
  projectHeavy: {
    label: 'Project-heavy profile',
    values: {
      cgpa: 2.8,
      projects: 5,
      targetRole: 'Web Development',
      techSkills: ['Full-stack web', 'REST API / backend', 'AI / machine learning'],
      githubActivity: 'active',
      resumeStatus: 'reviewed',
      softSkills: 4,
      liveDeployments: true,
      professionalCerts: false,
      interviewPrep: true,
    },
  },
  criticalGap: {
    label: 'Critical gap',
    values: {
      cgpa: 2.2,
      projects: 0,
      targetRole: 'Software Engineering',
      techSkills: [],
      githubActivity: 'none',
      resumeStatus: 'not_prepared',
      softSkills: 2,
      liveDeployments: false,
      professionalCerts: false,
      interviewPrep: false,
    },
  },
}
