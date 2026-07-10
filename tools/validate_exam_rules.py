#!/usr/bin/env python3
"""Validiert die Jahresreihe der Biologie-Prüfungsvorgaben 2023–2025."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "data" / "pruefungsvorgaben.json"
EXPECTED = {
    ("AG", 2023),
    ("AG", 2024),
    ("AG", 2025),
    ("BG", 2023),
    ("BG", 2024),
    ("BG", 2025),
}


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
        if not isinstance(item_id, str) or not item_id.strip():
            errors.append(f"Eintrag {index} besitzt keine ID")
        elif item_id in seen_ids:
            errors.append(f"Doppelte ID: {item_id}")
        else:
            seen_ids.add(item_id)

        system = item.get("system")
        year = item.get("year")
        if system not in {"AG", "BG"}:
            errors.append(f"{item_id or index}: unbekanntes System {system!r}")
        if not isinstance(year, int) or year not in {2023, 2024, 2025}:
            errors.append(f"{item_id or index}: ungültiges Jahr {year!r}")
        if system in {"AG", "BG"} and isinstance(year, int):
            pair = (system, year)
            if pair in pairs:
                errors.append(f"Doppelter System-Jahr-Eintrag: {system} {year}")
            pairs.add(pair)

        written = item.get("written")
        if not isinstance(written, dict):
            errors.append(f"{item_id or index}: Feld written fehlt")
            continue

        for field in ("duration_minutes", "tasks_offered", "tasks_required"):
            value = written.get(field)
            if not isinstance(value, int) or value <= 0:
                errors.append(f"{item_id or index}: written.{field} muss eine positive Ganzzahl sein")

        offered = written.get("tasks_offered")
        required = written.get("tasks_required")
        if isinstance(offered, int) and isinstance(required, int) and required > offered:
            errors.append(f"{item_id or index}: mehr Pflicht- als angebotene Aufgaben")

        topics = written.get("topics")
        if system == "BG" and (not isinstance(topics, list) or not topics):
            errors.append(f"{item_id or index}: BG-Eintrag benötigt schriftliche Themen")

        exclusions = written.get("exclusions")
        if not isinstance(exclusions, list):
            errors.append(f"{item_id or index}: written.exclusions muss eine Liste sein")

        source = item.get("source")
        if not isinstance(source, dict):
            errors.append(f"{item_id or index}: Quellenmetadaten fehlen")
        else:
            for field in ("filename", "pages", "sha256", "bytes"):
                if not source.get(field):
                    errors.append(f"{item_id or index}: source.{field} fehlt")
            sha = source.get("sha256")
            if isinstance(sha, str) and (len(sha) != 64 or any(char not in "0123456789abcdef" for char in sha.lower())):
                errors.append(f"{item_id or index}: ungültiger SHA-256")

        if system == "AG":
            basis = item.get("basisfach")
            if not isinstance(basis, dict) or basis.get("central_written") is not False:
                errors.append(f"{item_id or index}: Basisfach muss als nicht zentral schriftlich dokumentiert sein")

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
