---
name: dcl-design
description: Design and implement interactive web software from a product brief or existing codebase. Use for new workflows or substantive redesigns that require behavior modeling, information architecture, visual direction, frontend implementation, and browser validation.
metadata:
  version: "0.1.0"
---

# DCL Design

Use the product brief, repository and available fixtures as inputs. Ask about missing domain decisions only when guessing would materially alter the product. Record consequential assumptions and identify how to verify them.

1. Define the user, work object, goal, success condition and highest-risk operation. Inspect existing data, terminology and architecture before changing them.
2. Model the action that carries risk. Separate business state, derived eligibility and view state. State who can act, the guard, visible result, failure and recovery. For a lifecycle with multiple states, write a behavior contract and run `python scripts/validate_behavior.py <contract.json>` using the script from this skill folder. See [behavior contract](references/behavior.md).
3. Organize the interface around the current object, what it needs and what the user can do. If exploring alternatives, change the organizing structure or interaction path and compare on the same task. Give surfaces, typography, color and motion specific jobs. Read [interaction and visual decisions](references/design.md) for tradeoffs and [upstream precedents](references/precedents.md) when one helps.
4. Implement the agreed scope in the project's stack. Wire controls to observable state changes, including recovery for the modeled failure. Preserve user inputs through recoverable errors. Use reproducible component and styling rules for essential visual guidance.
5. Run relevant project checks and real browser actions on a representative viewport and a narrow viewport where applicable. Capture meaningful states, including a failure or recovery when in scope. Record commands and observed results. Provide evidence for [human review](references/review.md), record reviewer and outcome if reviewed, and mark pending checks explicitly.

Hand off the runnable entry, significant product and design decisions, behavior contract when applicable, evidence, and gaps. Record the skill version and any optional tools used. When a finding warrants changing this skill, record the failing task, change the smallest applicable rule, and compare a fresh transfer task and an existing regression.
