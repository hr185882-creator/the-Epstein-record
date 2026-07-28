# Release Notes

## 1.1.0 — 2026-07-28

This release upgrades the sanitized public reference from documented examples to an executable validation package.

### Added

- Draft 2020-12 JSON Schema for the fictional claim ledger.
- Domain-rule tests for unique identifiers, evidence-state constraints, privacy eligibility, independent sourcing, revision conditions, and fictional-data disclosure.
- Scheduled smoke test for the live production endpoint.
- CI installation of pinned-major validation dependencies.
- Standalone version marker and release-ready metadata.

### Public-safety boundary

No production corpus, victim-identifying information, private-person data, unpublished notes, credentials, sealed records, or unsupported allegations are included.

### Verification target

A valid release must pass the quality workflow and the live product smoke test before a GitHub Release is published.
