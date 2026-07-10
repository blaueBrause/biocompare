#!/usr/bin/env python3
"""Validiert die Jahresreihe der Biologie-Prüfungsvorgaben 2023–2027."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "data" / "pruefungsvorgaben.json"
EXPECTED = {
    ("AG", 2023),
    ("AG", 2024),
    ("AG", 2025),
    ("AG", 2026),
    ("AG", 2027),
    ("BG", 2023),
    ("BG", 2024),
    ("BG", 2025),
}
ALLOWED_YEARS = {2023, 2024, 2025, 2026, 2027}


def valid_source(source: Any, label: str, errors: list[str]) -> None:
    if not isinstance(source, dict):
        errors.append(f"{label}: Quellenmetadaten fehlen")
        return

    for field in ("filename", "pages", "sha256", "bytes"):
        if not source.get(field):
            errors.append(f"{label}: source.{field} fehlt")

    sha = source.get("sha256")
    if isinstance(sha, str) and (
        len(sha) != 64 or any(char not in "0123456789abcdef" for char in sha.lower())
    ):
        errors.append(f"{label}: ungültiger SHA-256")

    size = source.get("bytes")
    if size is not None and (not isinstance(size, int) or size <= 0):
        errors.append(f"{label}: source.bytes muss eine positive Ganzzahl sein")


def validate_grade_scale(item_id: str, assessment: dict[str, Any], errors: list[str]) -> None:
    scale = assessment.get("grade_scale")
    if not isinstance(scale, list) or len(scale) != 16:
        errors.append(f"{item_id}: assessment.grade_scale muss 16 Notenpunktstufen enthalten")
        return

    covered: set[int] = set()
    points: set[int] = set()
    for index, row in enumerate(scale, start=1):
        if not isinstance(row, dict):
            errors.append(f"{item_id}: grade_scale[{index}] ist kein Objekt")
            continue

        minimum = row.get("min_be")
        maximum = row.get("max_be")
        notenpunkte = row.get("notenpunkte")
        if not all(isinstance(value, int) for value in (minimum, maximum, notenpunkte)):
            errors.append(f"{item_id}: grade_scale[{index}] enthält keine Ganzzahlen")
            continue
        if minimum < 0 or maximum > 120 or minimum > maximum:
            errors.append(f"{item_id}: grade_scale[{index}] hat einen ungültigen BE-Bereich")
            continue
        if not 0 <= notenpunkte <= 15:
            errors.append(f"{item_id}: grade_scale[{index}] hat ungültige Notenpunkte")
        points.add(notenpunkte)
        for value in range(minimum, maximum + 1):
            if value in covered:
                errors.append(f"{item_id}: BE {value} ist in der Notenskala doppelt")
            covered.add(value)

    if covered != set(range(121)):
        missing = sorted(set(range(121)) - covered)
        errors.append(f"{item_id}: Notenskala deckt 0–120 BE nicht vollständig ab; fehlt {missing[:8]}")
    if points != set(range(16)):
        errors.append(f"{item_id}: Notenskala deckt die Notenpunkte 0–15 nicht vollständig ab")


def main() -> int:
    errors: list[str] = []

    try:
        data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except FileNotFoundError:
        print(f"FEHLER: FEHLT: {DATA_FILE.relative_to(ROOT)}")
        return 1
    except json.JSONDecodeError as exc:
        print(f"FEHLER: UNGÜLTIGES JSON: {exc.lineno}:{exc.colno} – {exc.msg}")
        return 1

    if not isinstance(data, list):
        print("FEHLER: data/pruefungsvorgaben.json muss eine JSON-Liste enthalten")
        return 1

    seen_ids: set[str] = set()
    pairs: set[tuple[str, int]] = set()

    for index, item in enumerate(data, start=1):
        if not isinstance(item, dict):
            errors.append(f"Eintrag {index} ist kein Objekt")
            continue

        item_id = item.get("id")
        label = item_id if isinstance(item_id, str) and item_id else str(index)
        if not isinstance(item_id, str) or not item_id.strip():
            errors.append(f"Eintrag {index} besitzt keine ID")
        elif item_id in seen_ids:
            errors.append(f"Doppelte ID: {item_id}")
        else:
            seen_ids.add(item_id)

        system = item.get("system")
        year = item.get("year")
        if system not in {"AG", "BG"}:
            errors.append(f"{label}: unbekanntes System {system!r}")
        if not isinstance(year, int) or year not in ALLOWED_YEARS:
            errors.append(f"{label}: ungültiges Jahr {year!r}")
        if system in {"AG", "BG"} and isinstance(year, int):
            pair = (system, year)
            if pair in pairs:
                errors.append(f"Doppelter System-Jahr-Eintrag: {system} {year}")
            pairs.add(pair)

        written = item.get("written")
        if not isinstance(written, dict):
            errors.append(f"{label}: Feld written fehlt")
            continue

        for field in ("duration_minutes", "tasks_offered", "tasks_required"):
            value = written.get(field)
            if not isinstance(value, int) or value <= 0:
                errors.append(f"{label}: written.{field} muss eine positive Ganzzahl sein")

        offered = written.get("tasks_offered")
        required = written.get("tasks_required")
        if isinstance(offered, int) and isinstance(required, int) and required > offered:
            errors.append(f"{label}: mehr Pflicht- als angebotene Aufgaben")

        topics = written.get("topics")
        if system == "BG" and (not isinstance(topics, list) or not topics):
            errors.append(f"{label}: BG-Eintrag benötigt schriftliche Themen")

        exclusions = written.get("exclusions")
        if not isinstance(exclusions, list):
            errors.append(f"{label}: written.exclusions muss eine Liste sein")

        valid_source(item.get("source"), label, errors)

        if system == "AG":
            basis = item.get("basisfach")
            if not isinstance(basis, dict) or basis.get("central_written") is not False:
                errors.append(
                    f"{label}: Basisfach muss als nicht zentral schriftlich dokumentiert sein"
                )

        assessment = item.get("assessment")
        if assessment is not None:
            if not isinstance(assessment, dict):
                errors.append(f"{label}: assessment muss ein Objekt sein")
            else:
                if written.get("assessment_units") != 120:
                    errors.append(f"{label}: Bewertungsmaßstab setzt 120 Bewertungseinheiten voraus")
                if assessment.get("whole_units_only") is not True:
                    errors.append(f"{label}: whole_units_only muss true sein")
                penalty = assessment.get("language_form_penalty_notenpunkte")
                if penalty != [1, 2]:
                    errors.append(f"{label}: Sprach-/Formabzug muss als [1, 2] dokumentiert sein")
                valid_source(assessment.get("source"), f"{label}/assessment", errors)
                validate_grade_scale(label, assessment, errors)

    missing = EXPECTED - pairs
    extra = pairs - EXPECTED
    if missing:
        errors.append(f"Fehlende Jahrespaare: {sorted(missing)}")
    if extra:
        errors.append(f"Unerwartete Jahrespaare: {sorted(extra)}")

    for error in errors:
        print(f"FEHLER: {error}")

    if errors:
        print(f"\nValidierung fehlgeschlagen: {len(errors)} Fehler.")
        return 1

    print(f"Validierung erfolgreich: {len(data)} Prüfungsvorgaben, 0 Fehler.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
