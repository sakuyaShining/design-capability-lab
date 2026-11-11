"""Validate a DCL behavior contract and optionally compare observed UI states."""
import argparse
import json
from pathlib import Path


def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8-sig"))


def is_name(value):
    return isinstance(value, str) and bool(value.strip())


def expected_traces(contract):
    if not isinstance(contract, dict):
        raise ValueError("Contract must be an object.")
    states = contract.get("states")
    if not isinstance(states, list) or not states or not all(map(is_name, states)):
        raise ValueError("states must be a nonempty list of names.")
    if len(states) != len(set(states)):
        raise ValueError("State names must be unique.")
    initial = contract.get("initial")
    if initial not in states:
        raise ValueError("initial must name a declared state.")

    transitions = contract.get("transitions")
    if not isinstance(transitions, list) or not transitions:
        raise ValueError("transitions must be a nonempty list.")
    edges = {state: {} for state in states}
    for index, transition in enumerate(transitions, start=1):
        if not isinstance(transition, dict):
            raise ValueError(f"Transition {index} must be an object.")
        source, event, target = (transition.get(key) for key in ("from", "event", "to"))
        if source not in states or target not in states or not is_name(event):
            raise ValueError(f"Transition {index} needs valid from, event and to fields.")
        if event in edges[source]:
            raise ValueError(f"Ambiguous transition from {source!r} on {event!r}.")
        edges[source][event] = target

    reached = {initial}
    pending = [initial]
    while pending:
        for target in edges[pending.pop()].values():
            if target not in reached:
                reached.add(target)
                pending.append(target)
    unreachable = sorted(set(states) - reached)
    if unreachable:
        raise ValueError(f"Unreachable states: {', '.join(unreachable)}.")

    scenarios = contract.get("scenarios")
    if not isinstance(scenarios, dict) or not scenarios:
        raise ValueError("scenarios must be a nonempty object.")
    traces = {}
    for name, steps in scenarios.items():
        if not is_name(name) or not isinstance(steps, list) or not steps:
            raise ValueError(f"Scenario {name!r} must have a name and a nonempty step list.")
        current = initial
        trace = []
        for index, step in enumerate(steps, start=1):
            if not isinstance(step, dict) or not is_name(step.get("event")):
                raise ValueError(f"{name}, step {index}: an event name is required.")
            event, expected = step["event"], step.get("state")
            target = edges[current].get(event)
            if target is None:
                raise ValueError(f"{name}, step {index}: {event!r} unavailable from {current!r}.")
            if target != expected:
                raise ValueError(f"{name}, step {index}: contract leads to {target!r}, expected {expected!r}.")
            trace.append(target)
            current = target
        traces[name] = trace
    return traces


def compare_traces(expected, observed):
    if not isinstance(observed, dict) or observed.keys() != expected.keys():
        raise ValueError("Observed traces must use exactly the contract's scenario names.")
    for name, states in expected.items():
        if observed[name] != states:
            raise ValueError(f"{name}: expected {states!r}, observed {observed[name]!r}.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("contract")
    parser.add_argument("--observed", help="JSON file produced by a browser test")
    args = parser.parse_args()
    try:
        traces = expected_traces(read_json(args.contract))
        if args.observed:
            compare_traces(traces, read_json(args.observed))
    except (OSError, ValueError) as error:
        parser.exit(1, f"FAIL: {error}\n")
    check = "contract and observed traces" if args.observed else "contract"
    print(f"PASS: {check}, {len(traces)} scenarios.")


if __name__ == "__main__":
    main()
