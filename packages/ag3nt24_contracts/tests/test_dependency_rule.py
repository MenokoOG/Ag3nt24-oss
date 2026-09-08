"""The one dependency rule that is enforceable while only this package exists.

ADR-0020 fixes the rule: every package may import ``ag3nt24_contracts``;
``ag3nt24_contracts`` imports none of them; ``ag3nt24_control`` and
``ag3nt24_runtime`` never import each other. The second half of that rule gets
its own check when a second package lands (P1-31).

This half is the one worth having first. Contracts is the highest-blast-radius
package in the repository, and an import reaching back out of it inverts the
dependency graph everything else assumes.
"""

from __future__ import annotations

import ast
import tomllib
from pathlib import Path

import ag3nt24_contracts

PACKAGE_ROOT = Path(ag3nt24_contracts.__file__).parent
OWN_NAME = "ag3nt24_contracts"


def _imported_module_names(source: Path) -> set[str]:
    tree = ast.parse(source.read_text(encoding="utf-8"), filename=str(source))
    names: set[str] = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            names.update(alias.name for alias in node.names)
        # level > 0 is a relative import, which cannot reach another
        # distribution, so it is skipped deliberately.
        elif isinstance(node, ast.ImportFrom) and node.module is not None and node.level == 0:
            names.add(node.module)
    return names


def test_contracts_imports_no_other_workspace_package() -> None:
    modules = sorted(PACKAGE_ROOT.rglob("*.py"))
    assert modules, f"no modules found under {PACKAGE_ROOT}"

    offenders: dict[str, set[str]] = {}
    for module in modules:
        reaching_out = {
            name
            for name in _imported_module_names(module)
            if name.startswith("ag3nt24") and name.split(".")[0] != OWN_NAME
        }
        if reaching_out:
            offenders[module.name] = reaching_out

    assert not offenders, f"ag3nt24_contracts must not import workspace packages: {offenders}"


def test_contracts_has_no_third_party_dependencies_declared() -> None:
    """The hashing primitive is stdlib-only, and staying that way is deliberate.

    Pydantic arrives with the models at P1-13. This test is expected to be updated
    then, by hand, so the addition is a visible diff rather than a silent one.

    Parsed as TOML rather than matched as a substring: a substring passes on a
    comment, on ``optional-dependencies``, or on a stale empty line left behind
    next to a real dependency. A test that can pass for the wrong reason buys
    confidence it has not earned.
    """
    manifest = PACKAGE_ROOT.parents[1] / "pyproject.toml"
    assert manifest.is_file(), f"package manifest not found at {manifest}"

    parsed = tomllib.loads(manifest.read_text(encoding="utf-8"))

    assert parsed["project"]["dependencies"] == []
