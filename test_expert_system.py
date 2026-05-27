import unittest

from expert_system import evaluate_student


class ReasonovaExpertSystemTests(unittest.TestCase):
    def test_high_cgpa_without_projects_is_low(self):
        result = evaluate_student(
            {
                "cgpa": 3.9,
                "projects": 0,
                "techSkills": ["Python / data"],
                "githubActivity": "none",
                "resumeStatus": "draft",
                "softSkills": 3,
            }
        )

        self.assertEqual(result["verdict"], "Low Competitiveness")
        self.assertTrue(any(rule["id"] == "R3" and rule["selected"] for rule in result["firedRules"]))

    def test_balanced_candidate_is_highly_competitive(self):
        result = evaluate_student(
            {
                "cgpa": 3.4,
                "projects": 3,
                "techSkills": ["Full-stack web", "REST API / backend", "Database / SQL"],
                "liveDeployments": True,
                "githubActivity": "active",
                "resumeStatus": "reviewed",
                "softSkills": 4,
                "interviewPrep": True,
            }
        )

        self.assertEqual(result["verdict"], "Highly Competitive")
        self.assertTrue(any(rule["id"] == "R1" for rule in result["firedRules"]))

    def test_project_heavy_profile_can_compensate_for_cgpa(self):
        result = evaluate_student(
            {
                "cgpa": 2.8,
                "projects": 5,
                "techSkills": ["Full-stack web", "AI / machine learning", "Cloud / DevOps"],
                "liveDeployments": True,
                "githubActivity": "active",
                "resumeStatus": "reviewed",
                "softSkills": 4,
                "interviewPrep": True,
            }
        )

        self.assertEqual(result["verdict"], "Highly Competitive")
        self.assertTrue(any(rule["id"] == "R2" and rule["selected"] for rule in result["firedRules"]))

    def test_critical_gap_is_low(self):
        result = evaluate_student(
            {
                "cgpa": 2.1,
                "projects": 0,
                "techSkills": [],
                "githubActivity": "none",
                "resumeStatus": "not_started",
                "softSkills": 1,
            }
        )

        self.assertEqual(result["verdict"], "Low Competitiveness")
        self.assertTrue(any(rule["id"] == "R5" and rule["selected"] for rule in result["firedRules"]))


if __name__ == "__main__":
    unittest.main()
