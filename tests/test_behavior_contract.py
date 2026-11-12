"""Regression checks for the shipped behavior-contract validator."""
import copy
import importlib.util
import json
from pathlib import Path
import unittest


SKILL = Path(__file__).resolve().parents[1] / ".agents/skills/dcl-design"
SPEC = importlib.util.spec_from_file_location("behavior_validator", SKILL / "scripts/validate_behavior.py")
VALIDATOR = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(VALIDATOR)


def contract(name):
    return json.loads((SKILL / "references" / name).read_text(encoding="utf-8"))


class BehaviorContractTests(unittest.TestCase):
    def setUp(self):
        self.contract = contract("linked-record-operation.json")
        self.expected = VALIDATOR.expected_traces(self.contract)
        self.observed = copy.deepcopy(self.expected)

    def test_legacy_state_only_trace(self):
        expected = VALIDATOR.expected_traces(contract("interruptible-panel.json"))
        self.assertEqual(
            expected["interrupted-exit"], ["opening", "open", "closing", "opening", "open"]
        )
        VALIDATOR.compare_traces(expected, expected)

    def test_all_linked_record_scenarios(self):
        self.assertEqual(set(self.expected), {"cancel", "confirm", "repeat", "recover"})
        self.assertEqual(self.expected["confirm"][-1]["facts"]["targetCount"], 1)
        self.assertIsNone(self.expected["cancel"][-1]["facts"]["linkedTarget"])
        self.observed["confirm"][-1]["facts"]["diagnostic"] = "extra"
        VALIDATOR.compare_traces(self.expected, self.observed)

    def test_rejects_duplicate_target_with_success_state(self):
        self.observed["repeat"][-1]["facts"]["targetCount"] = 2
        with self.assertRaisesRegex(ValueError, r"repeat, step 4: fact 'targetCount'"):
            VALIDATOR.compare_traces(self.expected, self.observed)

    def test_rejects_wrong_link_with_success_state(self):
        self.observed["confirm"][-1]["facts"]["linkedTarget"] = "unrelated"
        with self.assertRaisesRegex(ValueError, r"confirm, step 3: fact 'linkedTarget'"):
            VALIDATOR.compare_traces(self.expected, self.observed)

    def test_rejects_missing_fact_when_expected_null(self):
        del self.observed["cancel"][-1]["facts"]["linkedTarget"]
        with self.assertRaisesRegex(ValueError, r"cancel, step 2: missing fact 'linkedTarget'"):
            VALIDATOR.compare_traces(self.expected, self.observed)

    def test_rejects_state_only_when_facts_are_required(self):
        self.observed["confirm"][-1] = "linked"
        with self.assertRaisesRegex(ValueError, r"confirm, step 3: observed facts are required"):
            VALIDATOR.compare_traces(self.expected, self.observed)

    def test_rejects_boolean_instead_of_numeric_count(self):
        self.observed["confirm"][-1]["facts"]["targetCount"] = True
        with self.assertRaisesRegex(ValueError, r"confirm, step 3: fact 'targetCount'"):
            VALIDATOR.compare_traces(self.expected, self.observed)

    def test_rejects_malformed_contract_facts(self):
        for value in ({}, {"target": {"id": "one"}}, {"score": float("nan")}, None):
            with self.subTest(value=value):
                self.contract["scenarios"]["confirm"][-1]["facts"] = value
                with self.assertRaisesRegex(ValueError, r"confirm, step 3: facts need"):
                    VALIDATOR.expected_traces(self.contract)


if __name__ == "__main__":
    unittest.main()
