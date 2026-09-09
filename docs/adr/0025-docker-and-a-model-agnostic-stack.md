# ADR-0025: Docker and a model-agnostic stack

- Status: Accepted
- Date: 2026-09-09
- Deciders: Lawrence Jefferson II
- Supersedes: ADR-0003, ADR-0004, ADR-0005, ADR-0007, ADR-0009
- Amends: ADR-0006, ADR-0010, ADR-0021
- Related: ADR-0008, ADR-0011, ADR-0016, ADR-0023, ADR-0027

## Context

ADRs 0003 through 0010 built the design on AWS Bedrock AgentCore, LangGraph, Bedrock Prompt Management and CloudWatch. The stated goal for the framework is now: runs in Docker, as small as possible, talks to any AI system, returns valid data for planning and implementation once humans decide in HADES. A managed-cloud dependency with no portability layer contradicts every part of that sentence. The open-source-only rule of 2026-08-16 was never struck and AWS services do not satisfy it.

## Decision

Ag3nt24 ships as one `docker compose` file with four containers. Target under 500 MB total.

- `kernel`: Debian slim, GnuCOBOL, the four gates built at image build from `kernel/*.cbl`, the Node bridges, and a small HTTP shim. Conformance runs as the image test and must print `5/5 match`.
- `core`: Python 3.13. The protocol droid, the 24-slot pattern registry, the scout runners, and one thin model adapter.
- `hades`: Python 3.13, FastAPI. The human gate, receipt writer, prompt store, ETL sort, telemetry, and the legacy-AI channel. The only container a human touches.
- `db`: PostgreSQL. Run state, prompts, telemetry. Receipts in their own schema with a write credential held only by the gate route.

The model adapter presents one request and response shape and speaks to Anthropic, OpenAI-compatible endpoints, and local runtimes (Ollama or equivalent), chosen by environment. No provider-specific type crosses the adapter. Tool access stays MCP, hosted by `core`, with no gateway product in between.

What each superseded ADR becomes:

- ADR-0003 (LangGraph supervisor, Strands leaf): the supervisor is the protocol droid in `core`, plain Python. No graph framework is required; one may be adopted later on merit as an implementation detail behind the ADR-0016 node contract.
- ADR-0004 (AgentCore deploy target): Docker is the target. AWS or any cloud is an optional deploy target and takes its own ADR when there is a reason.
- ADR-0005 (MCP through AgentCore Gateway): MCP stays, Gateway goes. Each MCP server still declares read-only or control-affecting.
- ADR-0007 (Bedrock Prompt Management): the prompt store lives in HADES (ADR-0027). Markdown charters in this repository remain the authored source; publishing to the store stays a manual human step with the commit SHA recorded.
- ADR-0009 (CloudWatch telemetry): one pipeline, tagged by ITF slot at the source, lands in HADES. OpenTelemetry format so any backend can read it.

What is amended:

- ADR-0006: four storage concerns, still never collapsed. Charters: this repository. Run state: `db`. Vectors: a local vector store as derived data. Receipts: their own schema and credential in `db`, append-only, hash-chained. The DynamoDB versus S3 Object Lock question closes as moot.
- ADR-0010: Python 3.13 and the control-plane split stand. `hades` is the control plane, `core` is the runtime, and they still import only `ag3nt24_contracts`.
- ADR-0021: Windows was the development constraint for the port. The `kernel` image is the second build platform. Conformance must be `5/5 match` on both, and the build manifest records which platform produced it.

What stands unchanged: ADR-0008 (human gate, one receipt per decision; the interrupt is a run pause in `core`), ADR-0011, ADR-0012, ADR-0013, ADR-0016, ADR-0017 and ADR-0018 (still open), ADR-0019 (still open), ADR-0020 as amended by ADR-0027.

## Consequences

- The design no longer depends on a vendor to run. Anyone with Docker can run the kernel, the registry, and a scout on day one.
- Provider quality differences become the adapter's problem and are measured, not assumed. No capability claim about any provider before it is exercised.
- Two languages in the image set (COBOL and Node in `kernel`, Python elsewhere). Accepted: the kernel is carried as source and the bridges are its tested interface.
- The CI kernel job on Ubuntu is now consistent with doctrine.

## Alternatives considered

- Keep AWS as the production target, Docker for development only. Rejected: two targets doubles every deploy decision before there is one working run.
- Decide after the plan. Rejected: the plan depends on this.
