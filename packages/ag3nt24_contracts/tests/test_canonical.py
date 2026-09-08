"""Tests for the canonical serializer and the evidence hash.

The receipt chain is only as trustworthy as this file. A hash that varies with
dict insertion order, or that two different payloads can share, breaks chain
verification for reasons that have nothing to do with tampering.
"""

from __future__ import annotations

import datetime as dt
import hashlib
import math
import re

import pytest

from ag3nt24_contracts import CanonicalizationError, canonical_json, evidence_hash

# --- happy path -------------------------------------------------------------


def test_serializes_with_sorted_keys_and_no_whitespace() -> None:
    assert canonical_json({"b": 1, "a": 2}) == '{"a":2,"b":1}'


def test_key_order_does_not_change_the_hash() -> None:
    forward = {"agent": "chon-ji", "slot": 1, "findings": ["a", "b"]}
    reversed_insertion = {"findings": ["a", "b"], "slot": 1, "agent": "chon-ji"}

    assert evidence_hash(forward) == evidence_hash(reversed_insertion)


def test_nested_key_order_does_not_change_the_hash() -> None:
    first = {"outer": {"z": {"b": 1, "a": 2}, "y": [{"q": 1, "p": 2}]}}
    second = {"outer": {"y": [{"p": 2, "q": 1}], "z": {"a": 2, "b": 1}}}

    assert evidence_hash(first) == evidence_hash(second)


def test_list_order_does_change_the_hash() -> None:
    """Sequence order is meaning, not formatting. It must survive into the hash."""
    assert evidence_hash(["a", "b"]) != evidence_hash(["b", "a"])


def test_hash_is_sixty_four_lowercase_hex_characters() -> None:
    assert re.fullmatch(r"[0-9a-f]{64}", evidence_hash({"any": "payload"}))


def test_hash_is_a_stable_known_vector() -> None:
    """Pinned so a future change to the serializer cannot pass silently.

    The digest is computed here from the literal canonical bytes rather than
    copied in, so the vector proves itself. A legitimate change to the canonical
    form fails at the byte level, which is where the decision actually is.
    """
    expected = hashlib.sha256(b'{"a":1,"b":2}').hexdigest()

    assert evidence_hash({"b": 2, "a": 1}) == expected
    assert expected == "43258cff783fe7036d8a43033f830adfc60ec037382473548ac742b888292777"


def test_non_ascii_is_emitted_literally_not_escaped() -> None:
    assert canonical_json({"name": "Ge-Baek — 12"}) == '{"name":"Ge-Baek — 12"}'


def test_none_and_empty_mapping_are_different_evidence() -> None:
    assert evidence_hash(None) != evidence_hash({})


def test_true_and_one_are_different_evidence() -> None:
    """``bool`` subclasses ``int`` in Python. JSON keeps them apart, so must we."""
    assert canonical_json({"gated": True}) == '{"gated":true}'
    assert canonical_json({"gated": 1}) == '{"gated":1}'
    assert evidence_hash({"gated": True}) != evidence_hash({"gated": 1})


# --- failure paths ----------------------------------------------------------


@pytest.mark.parametrize("value", [math.nan, math.inf, -math.inf])
def test_non_finite_floats_are_refused(value: float) -> None:
    with pytest.raises(CanonicalizationError) as caught:
        canonical_json({"latency_ms": value})

    assert caught.value.path == "$.latency_ms"


def test_non_string_mapping_keys_are_refused() -> None:
    """``{1: "x"}`` and ``{"1": "x"}`` would otherwise share a hash."""
    with pytest.raises(CanonicalizationError) as caught:
        canonical_json({1: "x"})

    assert caught.value.path == "$"
    assert "collide" in str(caught.value)


@pytest.mark.parametrize(
    "value",
    [
        dt.datetime(2026, 9, 5, tzinfo=dt.UTC),
        {"a", "b"},
        ("a", "b"),
        object(),
    ],
)
def test_types_with_no_unambiguous_json_form_are_refused(value: object) -> None:
    with pytest.raises(CanonicalizationError):
        canonical_json({"field": value})


def test_tuples_are_refused_rather_than_silently_read_as_lists() -> None:
    """Coercion here would be a decision about what the evidence said."""
    with pytest.raises(CanonicalizationError) as caught:
        canonical_json({"pages": ("a", "b")})

    assert caught.value.path == "$.pages"
    assert "tuple" in str(caught.value)


# --- edge cases -------------------------------------------------------------


def test_the_error_path_locates_the_element_inside_nested_containers() -> None:
    payload = {"evidence": {"pages": [{"url": "/"}, {"fetched_at": dt.date(2026, 9, 5)}]}}

    with pytest.raises(CanonicalizationError) as caught:
        canonical_json(payload)

    assert caught.value.path == "$.evidence.pages[1].fetched_at"


def test_a_bad_element_deep_in_a_list_is_still_found() -> None:
    with pytest.raises(CanonicalizationError) as caught:
        canonical_json([[[{"ok": 1}, {"bad": {1: "x"}}]]])

    assert caught.value.path == "$[0][0][1].bad"


def test_empty_containers_round_trip() -> None:
    assert canonical_json({"a": [], "b": {}}) == '{"a":[],"b":{}}'


def test_a_rejected_payload_produces_no_hash_at_all() -> None:
    """No partial hashing. A refused payload leaves nothing behind to record."""
    with pytest.raises(CanonicalizationError):
        evidence_hash({"ok": 1, "bad": math.nan})


def test_nesting_past_the_cap_is_refused_as_a_contract_error() -> None:
    """Not a RecursionError. Evidence is untrusted input (ADR-0016 rule 2), and a
    node adapter catches CanonicalizationError and nothing else."""
    deep: dict[str, object] = {}
    cursor = deep
    for _ in range(500):
        nxt: dict[str, object] = {}
        cursor["n"] = nxt
        cursor = nxt

    with pytest.raises(CanonicalizationError) as caught:
        canonical_json(deep)

    assert "deeper than" in str(caught.value)


def test_the_depth_error_message_stays_readable() -> None:
    """At 100 levels the raw path is 100 copies of one segment, which buries the
    sentence that says what went wrong."""
    nested: object = "leaf"
    for _ in range(400):
        nested = {"deeply_named_channel": nested}

    with pytest.raises(CanonicalizationError) as caught:
        canonical_json(nested)

    assert "..." in caught.value.path
    assert len(caught.value.path) < 80


def test_a_reference_cycle_is_refused_rather_than_exhausting_the_stack() -> None:
    """A caller assembling evidence from a graph walk can make one by accident."""
    looped: dict[str, object] = {}
    looped["self"] = looped

    with pytest.raises(CanonicalizationError):
        canonical_json(looped)


def test_nesting_just_inside_the_cap_is_accepted() -> None:
    """The cap refuses what is past it and nothing before it."""
    nested: object = "leaf"
    for _ in range(90):
        nested = [nested]

    assert canonical_json(nested).endswith('"leaf"' + "]" * 90)
