# The Epstein Record — Sanitized Public Reference

[![Quality checks](https://github.com/hr185882-creator/the-Epstein-record/actions/workflows/quality.yml/badge.svg)](https://github.com/hr185882-creator/the-Epstein-record/actions/workflows/quality.yml)
[![Live product smoke test](https://github.com/hr185882-creator/the-Epstein-record/actions/workflows/live-smoke.yml/badge.svg)](https://github.com/hr185882-creator/the-Epstein-record/actions/workflows/live-smoke.yml)

A public-safe reference architecture for a source-first research product that distinguishes what records establish from what they merely suggest, repeat, or fail to prove.

- Live product: https://the-epstein-record.vercel.app/
- Version: `1.1.0`
- Portfolio: https://github.com/hr185882-creator
- Creator: Hasan Raza Kazmi

## Verified package scope

- 1 formal Draft 2020-12 JSON Schema
- 7 controlled evidence states
- 2 fictional claim-ledger records
- 2 fictional source records
- 1 executable domain-validation suite
- 1 scheduled production smoke test
- 3 automated GitHub workflows

These counts describe the public-safe reference package, not the production corpus.

## Why this repository exists

The production product incorporates large public-record collections, reviewed research notes, privacy decisions, and publication controls that should not be copied wholesale into an open repository. This repository exposes the analytical and technical design without publishing sensitive records, private-person information, victim-identifying material, credentials, or unsupported allegations.

This is a reference implementation and documentation package, not a byte-for-byte copy of the production deployment.

## Demonstrated capabilities

- Claim-level evidence classification
- Source provenance and source-chain separation
- Association-versus-culpability safeguards
- Adjudicated, alleged, disputed, unresolved, and not-established states
- Privacy and public-interest review boundaries
- Corrections, retractions, and revision history
- Sanitized record schemas and deterministic validation
- Public-facing research-product architecture

## Repository map

- `schema/claim-ledger.schema.json` — machine-enforced public schema
- `tests/validate_repository.py` — domain and publication-control tests
- `docs/ARCHITECTURE.md` — system boundaries, data flow, and release gates
- `docs/PRIVACY_AND_CORRECTIONS.md` — privacy, corrections, and contested-claim controls
- `data/example-claim-ledger.json` — fictional public-safe schema examples
- `.github/workflows/quality.yml` — schema, domain, and link validation
- `.github/workflows/live-smoke.yml` — scheduled production-endpoint verification
- `.github/workflows/dependency-review.yml` — high-severity dependency review on pull requests
- `SECURITY.md` — responsible disclosure and sensitive-data handling
- `CHANGELOG.md` — material release history
- `RELEASE_NOTES.md` — release-ready version notes
- `CITATION.cff` — citation metadata

## Evidence states

- `adjudicated` — established through a controlling legal disposition or equivalent official record
- `verified_record` — directly supported by an authenticated primary record
- `supported_reporting` — reliably reported but not independently established by this project
- `alleged` — attributed allegation with clear sourcing and no claim of adjudication
- `disputed` — materially contested by credible evidence or a named response
- `unresolved` — consequential claim for which the available record is insufficient
- `not_established` — the reviewed record does not support the proposition

## Non-negotiable analytical rules

1. Appearance in a contact book, calendar, photograph, address record, or flight record is not proof of criminal conduct.
2. Association is not culpability.
3. Allegations must remain attributed and labeled.
4. Legal outcomes and official records take precedence over repetition volume.
5. Privacy harm must be weighed independently from public curiosity.
6. Material corrections must preserve a visible revision record.
7. Fictional examples in this repository are not factual claims about real people.

## Authorship and AI assistance

Hasan Raza Kazmi directs the research questions, evidence standards, analytical framework, product architecture, editorial judgment, QA, and publication decisions. AI systems may assist with coding, synthesis, formatting, or production, but do not replace source verification or final human judgment.

## Security and responsible disclosure

Do not submit credentials, private personal information, victim-identifying material, sealed records, or illegal content through public issues. Follow `SECURITY.md` for responsible disclosure.

## License boundary

The original reference documentation, fictional schemas, and example records may be reused with attribution. Underlying court records, government documents, journalism, photographs, and third-party materials retain their original rights and restrictions. No third-party corpus is redistributed here.
