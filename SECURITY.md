# Security Policy

## Reporting a vulnerability

Report vulnerabilities privately to **security@classhuman.org**. Do not open a public issue for a security problem.

Include what you found, where, how to reproduce it, and what you think the impact is. Encrypted mail is welcome; ask for a key in your first message.

## What to expect

- Acknowledgement within 72 hours.
- A named contact for the report.
- Status updates until the issue is resolved or declined, and credit in the fix if you want it.

## Scope

The COBOL gates, the Node bridges, the conformance suite, the Python contracts package, and the CI configuration. The code under `prior-art/a24-v1/` is an ended reference line and is not executed except by the conformance suite reading its scenarios.

## Philosophy

The system fails closed: on uncertainty, missing artifacts, invalid signatures, or anomalies, it denies. A report that shows a path around that is the most useful report we can receive.
