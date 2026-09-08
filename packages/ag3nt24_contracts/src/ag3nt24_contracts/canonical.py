"""Canonical serialization and evidence hashing.

Every hash in the receipt chain (ADR-0008) is taken over the output of
:func:`canonical_json`. The chain is only verifiable if the same evidence
produces the same hash on every run and on every machine, so the serialization
is pinned here and nowhere else.

The shape is lifted from the ended a-24 line (ADR-0014): SHA-256 over
sorted-key stable JSON. The code is not ported; the discipline is.

Deliberately strict, because a hash that quietly accepts an ambiguous input is
worse than one that refuses it. Three refusals in particular:

* **Non-string mapping keys.** ``{1: "x"}`` and ``{"1": "x"}`` both serialize to
  ``{"1":"x"}``, so two different payloads would share a hash. Refused.
* **Non-finite floats.** ``NaN`` and ``Infinity`` are not JSON. Python emits them
  anyway by default, producing a document no other parser will read back.
* **Tuples, sets, datetimes, and every other non-JSON type.** Coercing them is a
  silent decision about what the evidence said. The caller makes that decision.

Known limitations, documented rather than hidden:

* Floats serialize through Python's shortest-round-trip ``repr``. That is stable
  across Python versions but is not guaranteed to match another language's
  formatter. Prefer strings or integers in evidence payloads.
* Unicode is hashed exactly as given, with no NFC/NFD normalization. Two visually
  identical strings in different normal forms hash differently, which is correct
  for evidence: the bytes are not altered before they are recorded.
* ``-0.0`` and ``0.0`` are arithmetically equal and hash differently, because
  ``json.dumps`` writes ``-0.0``. Another reason to keep floats out of evidence.
* Nesting is capped at 100 levels. Deeper input is refused rather than allowed to
  exhaust the stack.

The payload is walked once to validate and once again by ``json.dumps``. That
second pass is bought deliberately: it is what makes an error read
``$.evidence.pages[1].fetched_at`` instead of naming a type and leaving the
reader to find it. Receipt payloads are small, and one large enough for two
passes to matter is itself the problem.
"""

from __future__ import annotations

import hashlib
import json
import math

__all__ = ["CanonicalizationError", "JsonValue", "canonical_json", "evidence_hash"]

#: The value space this module accepts. Evidence fields on the models of
#: ADR-0011 annotate with it, so "what can be hashed" has one definition.
type JsonValue = bool | int | float | str | list["JsonValue"] | dict[str, "JsonValue"] | None

_ROOT_PATH = "$"

#: Deepest nesting accepted. Generous for an evidence payload and well under
#: Python's frame limit, which matters because ``json.dumps`` recurses again
#: over the same structure after the walk clears it.
_MAX_DEPTH = 100

#: How much of a path to show before eliding the middle. Only the depth error
#: gets near it: at 100 levels the full path is 100 repetitions of the same
#: segment, which hides the one useful sentence behind it.
_MAX_PATH_CHARS = 60


class CanonicalizationError(ValueError):
    """A value cannot be canonicalized, with the path to the offending element.

    Attributes:
        path: JSONPath-style location of the problem, e.g. ``$.findings[2].seen_at``.
    """

    def __init__(self, path: str, reason: str) -> None:
        self.path = path
        super().__init__(f"{path}: {reason}")


def canonical_json(value: object) -> str:
    """Serialize ``value`` to the one JSON form Ag3nt24 hashes.

    Object keys are sorted, separators carry no whitespace, and non-ASCII
    characters are emitted literally as UTF-8 rather than escaped.

    Args:
        value: A JSON-shaped payload. Typed as ``object`` on purpose: this runs at
            a trust boundary, so the input is unknown until it is checked.

    Returns:
        The canonical JSON text. Encode it as UTF-8 before hashing or storing.

    Raises:
        CanonicalizationError: The value contains something that cannot be
            canonicalized without an ambiguity. The message names the path.
    """
    _reject_uncanonicalizable(value, _ROOT_PATH)
    return json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
        allow_nan=False,
    )


def evidence_hash(value: object) -> str:
    """Return the SHA-256 hex digest of ``value`` in its canonical form.

    This is the ``evidence_hash`` field of a receipt. ``None`` and ``{}`` are
    distinct inputs and hash differently; callers that mean "no evidence" should
    pick one and use it consistently.

    Args:
        value: A JSON-shaped payload, checked by :func:`canonical_json`.

    Returns:
        64 lowercase hex characters.

    Raises:
        CanonicalizationError: Propagated from :func:`canonical_json`.
    """
    return hashlib.sha256(canonical_json(value).encode("utf-8")).hexdigest()


def _elide(path: str) -> str:
    """Shorten a path that has grown too long to read.

    Kept out of the ordinary refusal paths, where the whole point is a location
    precise enough to open the file at.
    """
    if len(path) <= _MAX_PATH_CHARS:
        return path
    keep = _MAX_PATH_CHARS // 2
    return f"{path[:keep]}...{path[-keep:]}"


def _reject_uncanonicalizable(value: object, path: str, depth: int = 0) -> None:
    """Walk ``value`` and raise on the first element that cannot be canonicalized.

    Walked ahead of ``json.dumps`` so the error names the path rather than the
    type alone. ``$.evidence.pages[3].fetched_at is a datetime`` is actionable at
    3am; ``Object of type datetime is not JSON serializable`` is not.

    ``depth`` is what keeps a hostile or looping payload inside the contract.
    Without it both cases exit as ``RecursionError``, which no caller is told to
    expect and no node adapter catches.
    """
    if depth > _MAX_DEPTH:
        raise CanonicalizationError(
            _elide(path),
            f"nested deeper than {_MAX_DEPTH} levels; evidence this deep is "
            "either a defect or a reference cycle",
        )

    if value is None or isinstance(value, str | bool):
        return

    if isinstance(value, int):  # after bool: bool is a subclass of int
        return

    if isinstance(value, float):
        if not math.isfinite(value):
            raise CanonicalizationError(
                path,
                f"{value!r} is not representable in JSON; "
                "record a string or omit the field instead",
            )
        return

    if isinstance(value, list):
        for index, item in enumerate(value):
            _reject_uncanonicalizable(item, f"{path}[{index}]", depth + 1)
        return

    if isinstance(value, dict):
        for key, item in value.items():
            if not isinstance(key, str):
                raise CanonicalizationError(
                    path,
                    f"mapping key {key!r} is {type(key).__name__}, not str; "
                    "non-string keys collide once serialized",
                )
            _reject_uncanonicalizable(item, f"{path}.{key}", depth + 1)
        return

    raise CanonicalizationError(
        path,
        f"{type(value).__name__} has no unambiguous JSON form; "
        "convert it at the call site so the choice is recorded",
    )
