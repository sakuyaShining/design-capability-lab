# Behavior contracts

Model a bounded user-visible workflow. Treat execution phase, derived eligibility and browsing position separately when they can vary independently. Keep role checks, revision conflicts and validation conditions in a transition table or business logic. Record which branch a trigger took as the event when guards yield distinct outcomes.

The [example](interruptible-panel.json) is a DCL-authored model of an interruptible panel. It draws on the [Endfield Menu open/close implementation](https://github.com/ccdr4gon/endfield_menu/blob/8d3f3ae592c9573da888599fb4e1b9804f0e2e36/components/app.js#L42-L103). Its states and event names are an abstraction for testing a new implementation.

The JSON contract lists state names, the initial state, transitions and named scenarios. Each transition defines `from`, `event` and `to`. Each scenario starts from the initial state and lists `event` and expected `state` for each step. Use a state-changing or a self-loop event to represent an intentional outcome, including denied actions that preserve state. Add scenarios for applicable normal, rejected, interrupted and recovery paths.

Run from the skill folder with Python 3.

```sh
python scripts/validate_behavior.py references/interruptible-panel.json
python scripts/validate_behavior.py contract.json --observed observed-states.json
```

The first form validates references, determinism, reachability and scenario consistency. For the second, an actual browser test should reset to the initial state for each scenario, perform each action, read the visible state or an accessible state marker, and write an object mapping scenario names to arrays of observed states after each action. The validator compares that file to the contract. An example shape is `{"interrupted-exit":["opening","open","closing","opening","open"]}`. Derive observations from the running UI. Keep assertions about permissions, focus, input preservation, downstream side effects and timing in project tests.
