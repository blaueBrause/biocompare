#!/usr/bin/env python3
"""Validiert die Evidenzschicht des überarbeiteten AG-Bildungsplans vom 08.03.2022."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
VALID_STATUSES = {"BELEGT", "TEILWEISE BELEGT", "OFFEN"}
VALID_FEATURES = {"experiment", "datenauswertung", "modellierung", "quantitativ", "bewertung"}
EXPECTED_HASH = "5da86e9fd32f198df4980c819ff7f4c1bf368cd1bd4dceeef22d406739f78653"
EXPECTED_BYTES = 2262208


def load_list(filename: str) -> list[dict[str, Any]]:
    path = DATA / filename
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise ValueError(f"FEHLT: data/{filename}") from None
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"UNGÜLTIGES JSON: data/{filename}:{exc.lineno}:{exc.colno} – {exc.msg}"
        ) from None
    if not isinstance(value, list) or not all(isinstance(item, dict) for item in value):
        raise ValueError(f"FALSCHER DATENTYP: data/{filename} muss eine Objektliste sein")
    return value


def precise_page(value: Any) -> bool:
    return bool(re.search(r"\bS\.?\s*\d+", str(value or ""), re.IGNORECASE))


def validate_cell(label: str, cell: Any, source_ids: set[str], errors: list[str]) -> None:
    if not isinstance(cell, dict):
        errors.append(f"{label}: Kompetenzzelle fehlt")
        return

    status = str(cell.get("status") or "").upper()
    if status not in VALID_STATUSES:
        errors.append(f"{label}: ungültiger Status {status!r}")

    assessment = str(cell.get("assessment") or "").strip()
    if not assessment:
        errors.append(f"{label}: Bewertungstext fehlt")

    evidence = cell.get("evidence")
    if not isinstance(evidence, list):
        errors.append(f"{label}: evidence muss eine Liste sein")
        return

    for entry in evidence:
        if not isinstance(entry, dict):
            errors.append(f"{label}: ungültige Fundstelle")
            continue
        source = str(entry.get("source") or "")
        location = entry.get("location")
        if source not in source_ids:
            errors.append(f"{label}: tote Quellen-ID {source!r}")
        if not location:
            errors.append(f"{label}: Fundstellenort fehlt")

    if status == "BELEGT":
        if not evidence:
            errors.append(f"{label}: BELEGT ohne Fundstelle")
        elif not any(precise_page(entry.get("location")) for entry in evidence if isinstance(entry, dict)):
            errors.append(f"{label}: BELEGT ohne Seitenangabe")
    if status == "TEILWEISE BELEGT" and not evidence:
        errors.append(f"{label}: TEILWEISE BELEGT ohne Fundstelle")
    if status == "OFFEN" and evidence:
        errors.append(f"{label}: OFFEN darf keine positive Fundstelle besitzen")

    features = cell.get("features", [])
    if not isinstance(features, list):
        errors.append(f"{label}: features muss eine Liste sein")
    else:
        unknown = set(map(str, features)) - VALID_FEATURES
        if unknown:
            errors.append(f"{label}: unbekannte Merkmale {sorted(unknown)}")


def main() -> int:
    errors: list[str] = []
    try:
        sources = load_list("quellen.json") + load_list("quellen_ergaenzungen.json")
        competencies = load_list("kompetenzen.json")
        overrides = load_list("kompetenzen_ag_2022.json")
        findings = load_list("befunde_ag_2022.json")
        questions = load_list("offene_fragen.json")
    except ValueError as exc:
        print(f"FEHLER: {exc}")
        return 1

    source_ids = {str(item.get("id") or "") for item in sources}
    competence_ids = {str(item.get("id") or "") for item in competencies}

    source = next((item for item in sources if item.get("id") == "SRC-014"), None)
    if not source:
        errors.append("SRC-014 fehlt")
    else:
        if source.get("sha256") != EXPECTED_HASH:
            errors.append("SRC-014: SHA-256 stimmt nicht")
        if source.get("bytes") != EXPECTED_BYTES:
            errors.append("SRC-014: Dateigröße stimmt nicht")
        if "08.03.2022" not in str(source.get("published") or ""):
            errors.append("SRC-014: Veröffentlichungsstand 08.03.2022 fehlt")

    seen: set[str] = set()
    override_map: dict[str, dict[str, Any]] = {}
    for item in overrides:
        item_id = str(item.get("id") or "")
        if item_id in seen:
            errors.append(f"Doppelte Override-ID: {item_id}")
        seen.add(item_id)
        if item_id not in competence_ids:
            errors.append(f"Override ohne Basiskompetenz: {item_id}")
        override_map[item_id] = item
        validate_cell(f"{item_id}/ag_basisfach", item.get("ag_basisfach"), source_ids, errors)
        validate_cell(f"{item_id}/ag_leistungsfach", item.get("ag_leistungsfach"), source_ids, errors)

    expected_semantics = {
        ("K-003", "ag_basisfach"): "BELEGT",
        ("K-004", "ag_basisfach"): "BELEGT",
        ("K-009", "ag_leistungsfach"): "TEILWEISE BELEGT",
        ("K-011", "ag_basisfach"): "BELEGT",
        ("K-011", "ag_leistungsfach"): "BELEGT",
        ("K-013", "ag_basisfach"): "BELEGT",
        ("K-014", "ag_leistungsfach"): "BELEGT",
        ("K-018", "ag_leistungsfach"): "OFFEN",
    }
    for (item_id, variant), expected in expected_semantics.items():
        actual = str(override_map.get(item_id, {}).get(variant, {}).get("status") or "")
        if actual != expected:
            errors.append(f"{item_id}/{variant}: erwartet {expected}, gefunden {actual or 'fehlend'}")

    finding_ids: set[str] = set()
    for finding in findings:
        finding_id = str(finding.get("id") or "")
        if not finding_id:
            errors.append("Befund ohne ID")
            continue
        if finding_id in finding_ids:
            errors.append(f"Doppelter Befund: {finding_id}")
        finding_ids.add(finding_id)
        for competence_id in finding.get("competency_ids", []):
            if str(competence_id) not in competence_ids:
                errors.append(f"{finding_id}: tote Kompetenz-ID {competence_id}")
        for entry in finding.get("evidence", []):
            if str(entry.get("source") or "") not in source_ids:
                errors.append(f"{finding_id}: tote Quellen-ID {entry.get('source')}")
            if not precise_page(entry.get("location")):
                errors.append(f"{finding_id}: nicht seitengenaue Fundstelle")

    if any(item.get("id") == "O-006" for item in questions):
        errors.append("O-006 muss nach Sicherung der Primärfassung geschlossen sein")

    for error in errors:
        print(f"FEHLER: {error}")
    if errors:
        print(f"\nAG-2022-Validierung fehlgeschlagen: {len(errors)} Fehler.")
        return 1

    print(
        f"AG-2022-Validierung erfolgreich: {len(overrides)} Kompetenzkorrekturen, "
        f"{len(findings)} Befundkorrekturen, 0 Fehler."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
