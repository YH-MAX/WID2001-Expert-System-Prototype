from __future__ import annotations

import collections
import collections.abc
from dataclasses import dataclass
from typing import Any, Callable


Facts = dict[str, Any]

if not hasattr(collections, "Mapping"):
    collections.Mapping = collections.abc.Mapping

try:
    from experta import Fact, KnowledgeEngine, P, Rule as ExpertaRule

    EXPERTA_AVAILABLE = True
except Exception:
    Fact = object  # type: ignore[assignment]
    KnowledgeEngine = object  # type: ignore[assignment]
    P = None  # type: ignore[assignment]
    ExpertaRule = None  # type: ignore[assignment]
    EXPERTA_AVAILABLE = False


@dataclass(frozen=True)
class Rule:
    rule_id: str
    name: str
    category: str
    priority: int
    condition: Callable[[Facts], bool]
    conclusion: str
    explanation: str
    recommendations: tuple[str, ...] = ()
    verdict: str | None = None


IN_DEMAND_SKILLS = {
    "Full-stack web",
    "REST API / backend",
    "Database / SQL",
    "Python / data",
    "AI / machine learning",
    "Cloud / DevOps",
    "Cybersecurity",
}


def _as_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _as_int(value: Any, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def normalize_facts(raw: Facts) -> Facts:
    skills = raw.get("techSkills") or []
    if isinstance(skills, str):
        skills = [skills]

    facts: Facts = {
        "cgpa": max(0.0, min(4.0, _as_float(raw.get("cgpa")))),
        "projects": max(0, _as_int(raw.get("projects"))),
        "tech_skills": [str(skill) for skill in skills],
        "live_deployments": bool(raw.get("liveDeployments")),
        "github_activity": str(raw.get("githubActivity", "none")),
        "resume_status": str(raw.get("resumeStatus", "not_started")),
        "professional_certs": bool(raw.get("professionalCerts")),
        "soft_skills": max(1, min(5, _as_int(raw.get("softSkills"), 1))),
        "interview_prep": bool(raw.get("interviewPrep")),
    }
    facts["in_demand_stack"] = len(set(facts["tech_skills"]) & IN_DEMAND_SKILLS) >= 2
    return facts


def score_facts(facts: Facts) -> dict[str, int]:
    cgpa = facts["cgpa"]
    projects = facts["projects"]
    skill_count = len(set(facts["tech_skills"]) & IN_DEMAND_SKILLS)

    if cgpa >= 3.5:
        academic = 20
    elif cgpa >= 3.0:
        academic = 16
    elif cgpa >= 2.5:
        academic = 10
    else:
        academic = 4

    if projects >= 4:
        project_score = 25
    elif projects == 3:
        project_score = 20
    elif projects == 2:
        project_score = 14
    elif projects == 1:
        project_score = 8
    else:
        project_score = 0

    if skill_count >= 4:
        technical = 15
    elif skill_count == 3:
        technical = 12
    elif skill_count == 2:
        technical = 9
    elif skill_count == 1:
        technical = 5
    else:
        technical = 0

    preparation = 0
    preparation += 8 if facts["live_deployments"] else 0
    preparation += {"none": 0, "basic": 5, "active": 10}.get(facts["github_activity"], 0)
    preparation += {"not_started": 0, "draft": 5, "reviewed": 10}.get(facts["resume_status"], 0)
    preparation += 7 if facts["soft_skills"] >= 4 else 4 if facts["soft_skills"] == 3 else 1
    preparation += 5 if facts["interview_prep"] else 0
    preparation += 5 if facts["professional_certs"] else 0

    total = min(100, academic + project_score + technical + preparation)
    return {
        "academic": academic,
        "projects": project_score,
        "technical_stack": technical,
        "preparation": min(40, preparation),
        "total": total,
    }


RULES: tuple[Rule, ...] = (
    Rule(
        "R1",
        "Ideal Candidate - Balanced Weight",
        "final",
        80,
        lambda f: f["cgpa"] >= 3.0 and f["projects"] >= 3 and f["in_demand_stack"],
        "Strong academic baseline is validated by practical technical execution.",
        "CGPA, project count, and in-demand skills jointly support a strong internship profile.",
        (
            "Prepare applications for competitive software engineering or IT placements.",
            "Use the strongest deployed project as the lead portfolio item in the resume.",
        ),
        "Highly Competitive",
    ),
    Rule(
        "R2",
        "Heavy Project Weight - Compensating for Grades",
        "final",
        90,
        lambda f: f["cgpa"] < 3.0 and f["projects"] >= 4 and f["live_deployments"],
        "A high volume of deployed work compensates for a minor academic dip.",
        "The profile shows industry-facing proof of ability through several live projects.",
        (
            "Lead with deployed project links and GitHub repositories during applications.",
            "Briefly explain the academic dip while emphasizing delivery and technical ownership.",
        ),
        "Highly Competitive",
    ),
    Rule(
        "R3",
        "Academic Trap - Missing Practical Weight",
        "final",
        95,
        lambda f: f["cgpa"] >= 3.5 and f["projects"] == 0,
        "High academic theory is not enough without practical proof.",
        "A strong CGPA is present, but the missing project portfolio creates a major hiring risk.",
        (
            "Build at least two GitHub-ready projects before applying to top-tier firms.",
            "Start with one full-stack or API-based project that solves a real student problem.",
        ),
        "Low Competitiveness",
    ),
    Rule(
        "R4",
        "Mid-Tier - Needs Skill Specialization",
        "final",
        50,
        lambda f: f["cgpa"] >= 2.5 and f["projects"] >= 1 and not f["professional_certs"],
        "The student meets a minimum baseline but needs stronger specialization.",
        "The profile is viable, but it lacks an extra signal such as certification or deep project complexity.",
        (
            "Add one specialized credential or project track, such as AI, cloud, cybersecurity, or data engineering.",
            "Improve the resume by connecting each project to measurable technical outcomes.",
        ),
        "Moderately Competitive",
    ),
    Rule(
        "R5",
        "Critical Gap",
        "final",
        100,
        lambda f: f["cgpa"] < 2.5 and f["projects"] == 0,
        "Applications should pause until a basic portfolio foundation exists.",
        "Both academic standing and project evidence are currently below the internship baseline.",
        (
            "Halt applications temporarily and build a foundational GitHub portfolio.",
            "Complete one course-aligned project and one practical web or data project within four weeks.",
        ),
        "Low Competitiveness",
    ),
    Rule(
        "R6",
        "Portfolio Visibility Gap",
        "supporting",
        30,
        lambda f: f["projects"] > 0 and f["github_activity"] == "none",
        "Project evidence exists but is not visible to recruiters.",
        "Recruiters need GitHub, screenshots, README files, or live demos to verify claimed skills.",
        (
            "Upload project source code to GitHub with clear README files.",
            "Add screenshots, setup steps, and a short explanation of your contribution.",
        ),
    ),
    Rule(
        "R7",
        "Resume Preparation Gap",
        "supporting",
        30,
        lambda f: f["resume_status"] != "reviewed",
        "The resume is not yet recruiter-ready.",
        "A weak or unreviewed resume can hide otherwise strong technical evidence.",
        (
            "Revise the resume so each project includes tech stack, role, and measurable outcome.",
            "Ask an internship coordinator, lecturer, or senior student to review the resume.",
        ),
    ),
    Rule(
        "R8",
        "Soft Skill Risk",
        "supporting",
        25,
        lambda f: f["soft_skills"] <= 2,
        "Communication readiness is below workplace expectation.",
        "Industrial training requires clear reporting, collaboration, and basic interview communication.",
        (
            "Practice a one-minute self-introduction and one project walkthrough.",
            "Join mock interviews or team presentations to improve confidence.",
        ),
    ),
    Rule(
        "R9",
        "Interview Preparation Gap",
        "supporting",
        20,
        lambda f: not f["interview_prep"],
        "The student has not prepared for internship screening.",
        "Even a good portfolio may underperform if the student cannot explain decisions and trade-offs.",
        (
            "Prepare answers for project challenges, teamwork, debugging, and learning goals.",
            "Practice explaining one technical project using problem, method, result, and reflection.",
        ),
    ),
)


if EXPERTA_AVAILABLE:

    class StudentProfile(Fact):
        """Student facts submitted through the questionnaire."""


    class ReasonovaKnowledgeEngine(KnowledgeEngine):
        def __init__(self) -> None:
            super().__init__()
            self.fired_rule_ids: list[str] = []

        def _fire(self, rule_id: str) -> None:
            self.fired_rule_ids.append(rule_id)

        @ExpertaRule(StudentProfile(cgpa=P(lambda value: value >= 3.0), projects=P(lambda value: value >= 3), in_demand_stack=True))
        def ideal_candidate(self) -> None:
            self._fire("R1")

        @ExpertaRule(StudentProfile(cgpa=P(lambda value: value < 3.0), projects=P(lambda value: value >= 4), live_deployments=True))
        def heavy_project_weight(self) -> None:
            self._fire("R2")

        @ExpertaRule(StudentProfile(cgpa=P(lambda value: value >= 3.5), projects=0))
        def academic_trap(self) -> None:
            self._fire("R3")

        @ExpertaRule(StudentProfile(cgpa=P(lambda value: value >= 2.5), projects=P(lambda value: value >= 1), professional_certs=False))
        def mid_tier(self) -> None:
            self._fire("R4")

        @ExpertaRule(StudentProfile(cgpa=P(lambda value: value < 2.5), projects=0))
        def critical_gap(self) -> None:
            self._fire("R5")

        @ExpertaRule(StudentProfile(projects=P(lambda value: value > 0), github_activity="none"))
        def portfolio_visibility_gap(self) -> None:
            self._fire("R6")

        @ExpertaRule(StudentProfile(resume_status=P(lambda value: value != "reviewed")))
        def resume_preparation_gap(self) -> None:
            self._fire("R7")

        @ExpertaRule(StudentProfile(soft_skills=P(lambda value: value <= 2)))
        def soft_skill_risk(self) -> None:
            self._fire("R8")

        @ExpertaRule(StudentProfile(interview_prep=False))
        def interview_preparation_gap(self) -> None:
            self._fire("R9")


def _experta_fired_rule_ids(facts: Facts) -> list[str] | None:
    if not EXPERTA_AVAILABLE:
        return None

    engine = ReasonovaKnowledgeEngine()
    engine.reset()
    engine.declare(StudentProfile(**facts))
    engine.run()
    return engine.fired_rule_ids


def _score_verdict(score: int) -> str:
    if score >= 75:
        return "Highly Competitive"
    if score >= 55:
        return "Moderately Competitive"
    return "Low Competitiveness"


def evaluate_student(raw_facts: Facts) -> dict[str, Any]:
    facts = normalize_facts(raw_facts)
    scores = score_facts(facts)
    experta_fired_ids = _experta_fired_rule_ids(facts)
    if experta_fired_ids is None:
        fired_rules = [rule for rule in RULES if rule.condition(facts)]
    else:
        fired_id_set = set(experta_fired_ids)
        fired_rules = [rule for rule in RULES if rule.rule_id in fired_id_set]
    final_rules = sorted(
        [rule for rule in fired_rules if rule.category == "final"],
        key=lambda rule: rule.priority,
        reverse=True,
    )

    if final_rules and final_rules[0].priority >= 90:
        selected_rule = final_rules[0]
        verdict = selected_rule.verdict or _score_verdict(scores["total"])
    elif scores["total"] >= 75 and any(rule.rule_id in {"R1", "R2"} for rule in final_rules):
        selected_rule = next(rule for rule in final_rules if rule.rule_id in {"R1", "R2"})
        verdict = selected_rule.verdict or "Highly Competitive"
    elif final_rules:
        selected_rule = final_rules[0]
        verdict = selected_rule.verdict or _score_verdict(scores["total"])
        if scores["total"] >= 75 and verdict == "Moderately Competitive":
            verdict = "Highly Competitive"
    else:
        selected_rule = None
        verdict = _score_verdict(scores["total"])

    recommendations: list[str] = []
    for rule in fired_rules:
        for item in rule.recommendations:
            if item not in recommendations:
                recommendations.append(item)

    if facts["projects"] < 3 and "Build at least three portfolio projects: one web/API project, one data or AI project, and one team-based project." not in recommendations:
        recommendations.append(
            "Build at least three portfolio projects: one web/API project, one data or AI project, and one team-based project."
        )
    if not facts["in_demand_stack"]:
        recommendations.append(
            "Strengthen the technical stack with at least two in-demand areas such as backend APIs, databases, cloud, AI, or cybersecurity."
        )
    if not recommendations:
        recommendations.append(
            "Keep the portfolio active and tailor applications to roles that match your strongest project evidence."
        )

    trace = [
        {
            "id": rule.rule_id,
            "name": rule.name,
            "conclusion": rule.conclusion,
            "explanation": rule.explanation,
            "selected": selected_rule is not None and rule.rule_id == selected_rule.rule_id,
        }
        for rule in fired_rules
    ]

    summary = selected_rule.explanation if selected_rule else (
        "No high-priority override rule fired, so the inference engine used the weighted readiness score."
    )

    return {
        "verdict": verdict,
        "score": scores["total"],
        "scoreBreakdown": scores,
        "summary": summary,
        "recommendations": recommendations[:6],
        "firedRules": trace,
        "facts": facts,
    }


def list_rules() -> list[dict[str, str]]:
    return [
        {
            "id": rule.rule_id,
            "name": rule.name,
            "category": rule.category,
            "conclusion": rule.conclusion,
            "explanation": rule.explanation,
        }
        for rule in RULES
    ]
