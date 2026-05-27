const form = document.querySelector("#readiness-form");
const verdictEl = document.querySelector("#verdict");
const scoreEl = document.querySelector("#score");
const summaryEl = document.querySelector("#summary");
const meterFill = document.querySelector("#meterFill");
const recommendationsEl = document.querySelector("#recommendations");
const traceEl = document.querySelector("#trace");
const breakdownEl = document.querySelector("#breakdown");
const rulesEl = document.querySelector("#rules");
const softSkills = document.querySelector("#softSkills");
const softSkillsValue = document.querySelector("#softSkillsValue");

const samples = {
  ideal: {
    cgpa: 3.6,
    projects: 4,
    techSkills: ["Full-stack web", "REST API / backend", "Database / SQL", "Cloud / DevOps"],
    liveDeployments: true,
    githubActivity: "active",
    resumeStatus: "reviewed",
    professionalCerts: true,
    softSkills: 4,
    interviewPrep: true
  },
  academicTrap: {
    cgpa: 3.9,
    projects: 0,
    techSkills: ["Python / data"],
    liveDeployments: false,
    githubActivity: "none",
    resumeStatus: "draft",
    professionalCerts: false,
    softSkills: 3,
    interviewPrep: false
  },
  projectHeavy: {
    cgpa: 2.8,
    projects: 5,
    techSkills: ["Full-stack web", "REST API / backend", "AI / machine learning"],
    liveDeployments: true,
    githubActivity: "active",
    resumeStatus: "reviewed",
    professionalCerts: false,
    softSkills: 4,
    interviewPrep: true
  },
  criticalGap: {
    cgpa: 2.2,
    projects: 0,
    techSkills: [],
    liveDeployments: false,
    githubActivity: "none",
    resumeStatus: "not_started",
    professionalCerts: false,
    softSkills: 2,
    interviewPrep: false
  }
};

function collectFacts() {
  const data = new FormData(form);
  return {
    cgpa: Number(data.get("cgpa")),
    projects: Number(data.get("projects")),
    techSkills: data.getAll("techSkills"),
    liveDeployments: data.get("liveDeployments") === "on",
    githubActivity: data.get("githubActivity"),
    resumeStatus: data.get("resumeStatus"),
    professionalCerts: data.get("professionalCerts") === "on",
    softSkills: Number(data.get("softSkills")),
    interviewPrep: data.get("interviewPrep") === "on"
  };
}

function setFacts(facts) {
  form.cgpa.value = facts.cgpa;
  form.projects.value = facts.projects;
  form.githubActivity.value = facts.githubActivity;
  form.resumeStatus.value = facts.resumeStatus;
  form.liveDeployments.checked = facts.liveDeployments;
  form.professionalCerts.checked = facts.professionalCerts;
  form.interviewPrep.checked = facts.interviewPrep;
  form.softSkills.value = facts.softSkills;
  softSkillsValue.value = `${facts.softSkills} / 5`;

  document.querySelectorAll("input[name='techSkills']").forEach((input) => {
    input.checked = facts.techSkills.includes(input.value);
  });
}

function verdictClass(verdict) {
  if (verdict.includes("Highly")) return "verdict-high";
  if (verdict.includes("Moderately")) return "verdict-moderate";
  return "verdict-low";
}

function renderResult(result) {
  verdictEl.textContent = result.verdict;
  verdictEl.className = verdictClass(result.verdict);
  scoreEl.textContent = result.score;
  summaryEl.textContent = result.summary;
  meterFill.style.width = `${result.score}%`;

  if (result.verdict.includes("Highly")) {
    meterFill.style.background = "var(--green)";
  } else if (result.verdict.includes("Moderately")) {
    meterFill.style.background = "var(--gold)";
  } else {
    meterFill.style.background = "var(--red)";
  }

  const metrics = [
    ["Academic", result.scoreBreakdown.academic, "max 20"],
    ["Projects", result.scoreBreakdown.projects, "max 25"],
    ["Technical Stack", result.scoreBreakdown.technical_stack, "max 15"],
    ["Preparation", result.scoreBreakdown.preparation, "max 40"]
  ];

  breakdownEl.innerHTML = metrics
    .map(([label, value, max]) => `<div class="metric"><strong>${value}</strong><span>${label} (${max})</span></div>`)
    .join("");

  recommendationsEl.innerHTML = result.recommendations.map((item) => `<li>${item}</li>`).join("");

  if (result.firedRules.length === 0) {
    traceEl.innerHTML = "<p>No rules fired. Weighted score was used.</p>";
    return;
  }

  traceEl.innerHTML = result.firedRules
    .map((rule) => {
      const selected = rule.selected ? " selected" : "";
      return `
        <div class="trace-item${selected}">
          <strong>${rule.id}: ${rule.name}</strong>
          <p>${rule.explanation}</p>
        </div>
      `;
    })
    .join("");
}

async function evaluate() {
  const response = await fetch("/api/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(collectFacts())
  });

  if (!response.ok) {
    throw new Error(`Evaluation failed with status ${response.status}`);
  }

  renderResult(await response.json());
}

async function loadRules() {
  const response = await fetch("/api/rules");
  const data = await response.json();
  rulesEl.innerHTML = data.rules
    .filter((rule) => rule.category === "final")
    .map((rule) => `
      <article class="rule-item">
        <strong>${rule.id}: ${rule.name}</strong>
        <p>${rule.conclusion}</p>
      </article>
    `)
    .join("");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await evaluate();
  } catch (error) {
    verdictEl.textContent = "Evaluation Error";
    verdictEl.className = "verdict-low";
    summaryEl.textContent = error.message;
  }
});

document.querySelector("#resetButton").addEventListener("click", () => {
  form.reset();
  softSkillsValue.value = `${form.softSkills.value} / 5`;
});

document.querySelectorAll("[data-sample]").forEach((button) => {
  button.addEventListener("click", async () => {
    setFacts(samples[button.dataset.sample]);
    await evaluate();
  });
});

softSkills.addEventListener("input", () => {
  softSkillsValue.value = `${softSkills.value} / 5`;
});

loadRules();
evaluate();
