"""Validate a DCL behavior contract and compare observed states and facts."""
import argparse
import json
import math
from pathlib import Path


def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8-sig"))


def is_name(value):
    return isinstance(value, str) and bool(value.strip())


def is_fact_value(value):
    if isinstance(value, float):
        return math.isfinite(value)
    return value is None or isinstance(value, (str, bool, int))


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
            if "facts" in step:
                facts = step["facts"]
                if not isinstance(facts, dict) or not facts or not all(
                    is_name(key) and is_fact_value(value) for key, value in facts.items()
                ):
                    raise ValueError(f"{name}, step {index}: facts need names and scalar JSON values.")
                trace.append({"state": target, "facts": facts})
            else:
                trace.append(target)
            current = target
        traces[name] = trace
    return traces


def compare_traces(expected, observed):
    if not isinstance(observed, dict) or observed.keys() != expected.keys():
        raise ValueError("Observed traces must use exactly the contract's scenario names.")
    for name, steps in expected.items():
        actual_steps = observed[name]
        if not isinstance(actual_steps, list) or len(actual_steps) != len(steps):
            raise ValueError(f"{name}: expected {len(steps)} observed steps.")
        for index, (step, actual) in enumerate(zip(steps, actual_steps), start=1):
            compare_step(f"{name}, step {index}", step, actual)


def compare_step(label, expected, actual):
    expected_state = expected["state"] if isinstance(expected, dict) else expected
    actual_state = actual.get("state") if isinstance(actual, dict) else actual
    if actual_state != expected_state:
        raise ValueError(f"{label}: expected state {expected_state!r}, observed {actual_state!r}.")
    if isinstance(expected, str):
        return

    actual_facts = actual.get("facts") if isinstance(actual, dict) else None
    if not isinstance(actual_facts, dict):
        raise ValueError(f"{label}: observed facts are required.")
    for key, value in expected["facts"].items():
        if key not in actual_facts:
            raise ValueError(f"{label}: missing fact {key!r}.")
        seen = actual_facts[key]
        if seen != value or isinstance(seen, bool) != isinstance(value, bool):
            raise ValueError(f"{label}: fact {key!r} expected {value!r}, observed {seen!r}.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("contract")
    parser.add_argument("--observed", help="JSON state and fact traces captured by a browser or integration test")
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
