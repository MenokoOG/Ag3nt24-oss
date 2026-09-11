# ADR-0031: Durable orchestration for the HADES sort, with the gate as a terminator

- Status: Proposed
- Date: 2026-09-11
- Deciders: Lawrence Jefferson II
- Related: ADR-0006, ADR-0008, ADR-0023, ADR-0027, ADR-0029

## Context

HADES owns the ETL sort into `good`, `bad`, `messy`, `work-data` and `new` (ADR-0027). Those runs are long, they read a legacy estate over the wire, and they fail partway. Restarting a whole sort after a crash re-reads the estate and can re-propose work a human has already seen.

The sort is also what produces escalations. `bad` goes to a sandbox, then a security audit, then the Human Authorized Data Eradication Sequence, where a human signs. `messy` parks for a human call. The pipeline routes into the gate by design, so any orchestration choice has to state what happens at that boundary, not avoid it.

`pg_durable` is a PostgreSQL extension from Microsoft that provides checkpointed, resumable workflows inside the database. PostgreSQL is already the `db` container (ADR-0029), and the extension is published under the PostgreSQL License, which is compatible with this repository's Apache-2.0 distribution. It is in preview, and its own documentation states that the published Docker image is for evaluation and learning only.

## Decision

Durable in-database orchestration is adopted for the HADES ingest and sort, and only there. Three constraints hold, and they are the reason the adoption is safe.

1. **The gate terminates a run.** A durable run reaches an escalation point, writes the proposal row with its evidence hash, and ends. It does not wait for a human.
2. **A signature starts a new run.** The human signature is an external event recorded by the gate route. Work that follows the signature is a separate durable run, keyed on the Decision Certificate id. A resumed checkpoint from the first run carries no signature and therefore cannot advance past the escalation, however many times it replays.
3. **No in-engine approval wait.** The extension's approval and external-event primitives are not used for the human gate. An in-workflow wait holds the signature inside engine checkpoint state, where a replay defect or a hand-raised event can advance an eradication with no human in the path.

The gate, the receipt writer and the eradication step stay in Python, under the repository's `ruff`, `mypy --strict` and `pytest` gate. The receipt schema keeps its own write credential (ADR-0006), and no workflow role holds it. Verdicts remain evidence; signatures remain authority (ADR-0008).

The kernel is unaffected. `ag3nt24_kernel` imports nothing from `core` or `hades` and gains no dependency here. The boundary ACL is still the kernel (ADR-0023).

## Consequences

- The sort becomes resumable. A crash mid-estate no longer costs a full re-read, and retry logic stops being hand-written per pipeline.
- `db` stops being stock `postgres:17`. The extension requires `shared_preload_libraries` and a background worker running as a superuser role, so the image is ours to build, patch and pin. That superuser worker sits in the same container as the receipt schema, which is why constraint 3 is not optional.
- Managed PostgreSQL is ruled out for this container. RDS and Azure Flexible Server will not load the extension. Any future cloud target inherits that and takes its own ADR, as ADR-0025 already requires.
- The orchestration is authored in SQL and sits outside the Python test gate. Every workflow gets a `pytest` test that drives it against a disposable database, including a crash-and-resume case and a case that asserts a replayed run cannot cross an escalation.
- Preview status is the accepted risk. Revisit at the extension's first stable release, or sooner if a defect touches checkpoint replay.

## Alternatives considered

- **A step table of our own, with `FOR UPDATE SKIP LOCKED` and advisory locks.** A few hundred lines, no superuser surface, stock `postgres:17`, entirely inside the Python test gate. Rejected on the grounds that checkpointing, scheduling and retry semantics are the part that is easy to get subtly wrong and expensive to prove. Kept as the fallback if the extension is withdrawn or the preview stalls.
- **Airflow or Temporal.** Rejected: a second orchestration service to deploy, monitor and secure, for pipelines whose entire state already lives in this database.
- **Defer until module 6 is being built.** Rejected as a decision, accepted as sequencing. The ruling is made now because it changes the `db` image and the gate contract, and both are cheaper to fix on paper. No code lands until module 6.
