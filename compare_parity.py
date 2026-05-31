"""Compare Python expert_system.py output with the React in-browser engine."""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

from expert_system import evaluate_student

ROOT = Path(__file__).resolve().parent

CASES = {
    "default_form": {
        "cgpa": 3.2,
        "projects": 3,
        "techSkills": ["Full-stack web", "REST API / backend"],
        "liveDeployments": True,
        "githubActivity": "active",
        "resumeStatus": "reviewed",
        "softSkills": 4,
        "interviewPrep": True,
    },
    "academic_trap": {
        "cgpa": 3.9,
        "projects": 0,
        "techSkills": ["Python / data"],
        "githubActivity": "none",
        "resumeStatus": "draft",
        "softSkills": 3,
    },
    "balanced": {
        "cgpa": 3.4,
        "projects": 3,
        "techSkills": ["Full-stack web", "REST API / backend", "Database / SQL"],
        "liveDeployments": True,
        "githubActivity": "active",
        "resumeStatus": "reviewed",
        "softSkills": 4,
        "interviewPrep": True,
    },
    "project_heavy": {
        "cgpa": 2.8,
        "projects": 5,
        "techSkills": ["Full-stack web", "AI / machine learning", "Cloud / DevOps"],
        "liveDeployments": True,
        "githubActivity": "active",
        "resumeStatus": "reviewed",
        "softSkills": 4,
        "interviewPrep": True,
    },
    "critical_gap": {
        "cgpa": 2.1,
        "projects": 0,
        "techSkills": [],
        "githubActivity": "none",
        "resumeStatus": "not_started",
        "softSkills": 1,
    },
    "not_prepared_resume": {
        "cgpa": 2.2,
        "projects": 0,
        "techSkills": [],
        "githubActivity": "none",
        "resumeStatus": "not_prepared",
        "softSkills": 2,
    },
}


def python_snapshot(name: str, payload: dict) -> dict:
    result = evaluate_student(payload)
    return {
        "verdict": result["verdict"],
        "score": result["score"],
        "scoreBreakdown": result["scoreBreakdown"],
        "summary": result["summary"],
        "recommendations": result["recommendations"],
        "firedRules": [
            {
                "id": rule["id"],
                "selected": rule["selected"],
            }
            for rule in result["firedRules"]
        ],
    }


def js_snapshots(cases: dict) -> dict:
    script = ROOT / "frontend" / "scripts" / "parity-run.mjs"
    payload = json.dumps(cases)
    completed = subprocess.run(
        ["node", str(script), payload],
        cwd=ROOT / "frontend",
        capture_output=True,
        text=True,
        check=False,
    )
    if completed.returncode != 0:
        print(completed.stdout)
        print(completed.stderr, file=sys.stderr)
        raise SystemExit(completed.returncode)
    return json.loads(completed.stdout)


def main() -> None:
    py = {name: python_snapshot(name, payload) for name, payload in CASES.items()}
    js = js_snapshots(CASES)

    mismatches = []
    for name in CASES:
        if py[name] != js[name]:
            mismatches.append(name)

    if mismatches:
        print("MISMATCH:")
        for name in mismatches:
            print(f"\n=== {name} ===")
            print("Python:", json.dumps(py[name], indent=2))
            print("JS:    ", json.dumps(js[name], indent=2))
        raise SystemExit(1)

    print(f"All {len(CASES)} parity cases match between Python and React logic.")
    for name, snapshot in py.items():
        selected = next((rule["id"] for rule in snapshot["firedRules"] if rule["selected"]), "score")
        fired = [rule["id"] for rule in snapshot["firedRules"]]
        print(
            f"- {name}: {snapshot['verdict']} ({snapshot['score']}/100), "
            f"selected={selected}, fired={fired}"
        )


if __name__ == "__main__":
    main()
