"""Ag3nt24 system contracts.

The four Pydantic models of ADR-0011 (`AgentSpec`, `GraphState`, `GateRequest`,
`Receipt`) land here at P1-13, once ADR-0011's field lists and ADR-0016's node
contract are ruled. Until then this package holds the canonical hashing
primitive the receipt chain is built on.

This package imports nothing else in the workspace, by rule (ADR-0020). Every
other package may import it; it may import none of them.
"""

from importlib.metadata import PackageNotFoundError, version

from ag3nt24_contracts.canonical import (
    CanonicalizationError,
    JsonValue,
    canonical_json,
    evidence_hash,
)

try:
    __version__ = version("ag3nt24-contracts")
except PackageNotFoundError:  # pragma: no cover - only when running from a raw checkout
    __version__ = "0.0.0+unknown"

__all__ = [
    "CanonicalizationError",
    "JsonValue",
    "__version__",
    "canonical_json",
    "evidence_hash",
]
