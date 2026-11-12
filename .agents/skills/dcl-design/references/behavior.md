# Behavior contracts

Model a bounded user-visible workflow. Treat execution phase, derived eligibility and browsing position separately when they can vary independently. Keep role checks, revision conflicts and validation conditions in a transition table or business logic. Record which branch a trigger took as the event when guards yield distinct outcomes.

The [example](interruptible-panel.json) is a DCL-authored model of an interruptible panel. It draws on the [Endfield Menu open/close implementation](https://github.com/ccdr4gon/endfield_menu/blob/8d3f3ae592c9573da888599fb4e1b9804f0e2e36/components/app.js#L42-L103). Its states and event names are an abstraction for testing a new implementation.

The JSON contract lists state names, the initial state, transitions and named scenarios. Each transition defines `from`, `event` and `to`. Each scenario starts from the initial state and lists `event` and expected `state` for each step. Use a state-changing or a self-loop event to represent an intentional outcome, including denied actions that preserve state. Add scenarios for applicable normal, rejected, interrupted and recovery paths.

Run from the skill folder with Python 3.

```sh
python scripts/validate_behavior.py references/interruptible-panel.json
python scripts/validate_behavior.py references/linked-record-operation.json
python scripts/validate_behavior.py contract.json --observed observed-states.json
```

Without `--observed`, the script validates references, determinism, reachability and scenario consistency. With `--observed`, supply an object mapping scenario names to arrays of observations, one for each step. Reset the implementation for each scenario and capture observations after performing the actions.

For state-only contracts, a string remains valid, for example `"linked"`. When a scenario step adds a `facts` object with named scalar JSON values, the matching observation needs `state` and `facts` fields, for example `{"state":"linked","facts":{"targetCount":1,"linkedTarget":"shortlist-1"}}`. The script checks every fact named by the contract and allows extra observed facts. Read target counts, identities and relationships from rendered results or persisted test state. The [cross-object guide](object-changes.md) explains how to select meaningful facts, and the [linked-record example](linked-record-operation.json) illustrates cancellation, success, repeating the same intent and recovering an uncertain result.

Keep checks that need interaction semantics, such as focus or whether a link actually opens, in project tests. A passed comparison covers the specified state and facts at captured steps. Reachability of every relevant business outcome and completeness of the chosen scenarios require separate review.
