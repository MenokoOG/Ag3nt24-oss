# ADR-0007: MD-spec charters are authored; Bedrock Prompt Management is the deployed artifact

- Status: Superseded by ADR-0025 and ADR-0027 (2026-09-09). The prompt store is in HADES. Text unchanged.
- Date: 2026-08-28
- Deciders: Lawrence Jefferson II
- Related: ADR-0006, ADR-0011

## Context

Each of the 24 roles needs a charter: its domain, its scope limits, its refusal conditions, its output contract. Two bad options exist at the extremes. Prompts hard-coded in Python make every wording change a code deploy. Prompts edited live in a console make the running system untraceable to any reviewed source.

## Decision

The Markdown charter in this repository is the authored source of truth. It is reviewed as a diff and versioned in Git and S3.

Bedrock Prompt Management holds the deployed runtime artifact. Each node loads its prompt by ARN at invoke time, pinned to a specific version.

Publishing a charter from Markdown into Prompt Management is a manual gate. A human runs it, having seen the diff. There is no auto-deploy path from a merged Markdown file to a live prompt version.

A node never carries an inline prompt string as a fallback. A missing or unreachable prompt ARN is a hard failure, logged and surfaced, not a silent degrade to some embedded default.

## Consequences

- Two artifacts to keep in step, and drift is possible. The publish tool records the source commit SHA in the prompt version description so drift is detectable.
- Prompt changes ship without a code deploy, which is the point, and they still cannot ship without a human.
- Rollback is a version pin change in configuration rather than a redeploy.
- The publish tool is the one place allowed to write to Prompt Management. Console edits are a policy violation, and a version whose description carries no source SHA is treated as untrusted.

## Alternatives considered

- Prompts as Python constants. Rejected: couples wording to the release cycle and buries the review in a code diff.
- Prompt Management as the only source. Rejected: no diff review, no offline history, and the charters stop being readable as documents.
- Auto-publish on merge to main. Rejected: agents propose, humans sign. A prompt is the agent's operating instruction, and it does not reach production without a signature.
