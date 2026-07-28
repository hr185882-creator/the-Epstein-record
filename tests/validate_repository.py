from __future__ import annotations

import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "example-claim-ledger.json"
SCHEMA_PATH = ROOT / "schema" / "claim-ledger.schema.json"


def fail(message: str) -> None:
    print(f"ERROR: {message}")
    raise SystemExit(1)


def main() -> None:
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))

    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    schema_errors = sorted(validator.iter_errors(data), key=lambda error: list(error.path))
    if schema_errors:
        for error in schema_errors:
            location = ".".join(str(part) for part in error.path) or "<root>"
            print(f"SCHEMA ERROR at {location}: {error.message}")
        raise SystemExit(1)

    claim_ids: set[str] = set()
    for record in data["records"]:
        claim_id = record["claim_id"]
        if claim_id in claim_ids:
            fail(f"duplicate claim_id: {claim_id}")
        claim_ids.add(claim_id)

        state = record["state"]
        sources = record["sources"]
        source_ids = [source["source_id"] for source in sources]
        if len(source_ids) != len(set(source_ids)):
            fail(f"{claim_id} contains duplicate source identifiers")

        if state in {"adjudicated", "verified_record"} and not any(
            source["independent"] for source in sources
        ):
            fail(f"{claim_id} uses a high evidence state without an independent source")

        if state == "not_established" and not record["evidence_ceiling"].lower().startswith(
            "the available material"
        ):
            fail(f"{claim_id} must explain the evidentiary gap in its evidence ceiling")

        privacy_status = record["privacy_review"]["status"]
        if privacy_status in {"restricted", "rejected"}:
            fail(f"{claim_id} is not eligible for a public export")

        subject = record["subject"]
        if subject["entity_type"] == "fictional_person" and not data["notice"].lower().startswith(
            "all people"
        ):
            fail("the dataset must prominently state that all people are fictional")

        if not record["revision_conditions"]:
            fail(f"{claim_id} has no revision conditions")

    print(
        f"Validated {len(data['records'])} fictional claim records against JSON Schema "
        "and publication-control rules."
    )


if __name__ == "__main__":
    main()
