#!/usr/bin/env python3
"""Validiert die kanonischen Biocompare-Daten ohne externe Abhängigkeiten."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Iterable

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"

FILES = {
    "sources": ("quellen.json", ("id", "source_id")),
    "topics": ("themen.json", ("id", "topic_id")),
    "competencies": ("kompetenzen.json", ("id", "competence_id")),
    "supplementary": ("sondergebiete.json", ("id", "supplement_id")),
    "exams": ("pruefungen.json", ("id", "exam_id")),
    "findings": ("befunde.json", ("id", "finding_id")),
    "questions": ("offene_fragen.json", ("id", "question_id")),
}


def first_value(item: dict[str, Any], keys: Iterable[str]) -> Any:
    for key in keys:
        if key in item:
            return item[key]
    return None


def load_list(path: Path, errors: list[str]) -> list[dict[str, Any]]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        errors.append(f"FEHLT: {path.relative_to(ROOT)}")
        return []
    except json.JSONDecodeError as exc:
        errors.append(
            f"UNGÜLTIGES JSON: {path.relative_to(ROOT)}:{exc.lineno}:{exc.colno} – {exc.msg}"
        )
        return []

    if not isinstance(data, list):
        errors.append(f"FALSCHER DATENTYP: {path.relative_to(ROOT)} muss eine JSON-Liste enthalten")
        return []

    result: list[dict[str, Any]] = []
    for index, item in enumerate(data, start=1):
        if not isinstance(item, dict):
            errors.append(f"FALSCHER EINTRAG: {path.relative_to(ROOT)}[{index}] ist kein Objekt")
            continue
        result.append(item)
    return result


def collect_evidence(item: dict[str, Any]) -> list[dict[str, Any]]:
    evidence = item.get("evidence") or item.get("fundstellen") or []
    if isinstance(evidence, list):
        return [entry for entry in evidence if isinstance(entry, dict)]
    return []


def normalize_status(value: Any) -> str:
    text = str(value or "OFFEN").strip().upper()
    if "TEILWEISE" in text:
        return "TEILWEISE BELEGT"
    if text == "BELEGT":
        return "BELEGT"
    return "OFFEN"


def validate() -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    datasets: dict[str, list[dict[str, Any]]] = {}

    for name, (filename, id_keys) in FILES.items():
        items = load_list(DATA_DIR / filename, errors)
        datasets[name] = items

        seen: set[str] = set()
        for index, item in enumerate(items, start=1):
            raw_id = first_value(item, id_keys)
            if not isinstance(raw_id, str) or not raw_id.strip():
                errors.append(f"FEHLENDE ID: data/{filename}[{index}]")
                continue
            item_id = raw_id.strip()
            if item_id in seen:
                errors.append(f"DOPPELTE ID: {item_id} in data/{filename}")
            seen.add(item_id)

    source_ids = {
        str(first_value(item, FILES["sources"][1])).strip()
        for item in datasets["sources"]
        if first_value(item, FILES["sources"][1])
    }

    for source in datasets["sources"]:
        source_id = str(first_value(source, FILES["sources"][1]) or "?")
        repo_file = source.get("file")
        if repo_file and not (ROOT / str(repo_file)).is_file():
            errors.append(f"TOTE DATEIREFERENZ: {source_id} verweist auf {repo_file}")
        if not source.get("original_url") and not repo_file:
            warnings.append(f"QUELLE OHNE ZUGRIFF: {source_id} hat weder Datei noch Original-URL")

    evidence_datasets = ("topics", "competencies", "supplementary", "findings")
    for dataset_name in evidence_datasets:
        filename, id_keys = FILES[dataset_name]
        for item in datasets[dataset_name]:
            item_id = str(first_value(item, id_keys) or "?")
            evidence = collect_evidence(item)

            for entry in evidence:
                source_id = entry.get("source") or entry.get("source_id")
                if not source_id:
                    errors.append(f"FUNDSTELLE OHNE QUELLE: {item_id} in data/{filename}")
                elif str(source_id) not in source_ids:
                    errors.append(f"TOTE QUELLEN-ID: {item_id} verweist auf {source_id}")

                location = entry.get("location") or entry.get("fundstelle")
                if not location:
                    warnings.append(f"UNPRÄZISE FUNDSTELLE: {item_id} enthält keine Ortsangabe")

            if normalize_status(item.get("status")) == "BELEGT":
                complete = any(
                    (entry.get("source") or entry.get("source_id"))
                    and (entry.get("location") or entry.get("fundstelle"))
                    for entry in evidence
                )
                if not complete:
                    errors.append(f"BELEGT OHNE FUNDSTELLE: {item_id} in data/{filename}")

    for item in datasets["supplementary"]:
        item_id = str(first_value(item, FILES["supplementary"][1]) or "?")
        if item.get("kind") == "comparison":
            for key in ("regular_bg", "supplement", "ag_lf"):
                if not item.get(key):
                    errors.append(f"UNVOLLSTÄNDIGER VERGLEICH: {item_id} enthält kein Feld {key}")
        if item.get("required") is True:
            warnings.append(
                f"OPTIONALES FACH ALS PFLICHT MARKIERT: {item_id}; fachliche Einordnung prüfen"
            )

    exam_filename, exam_id_keys = FILES["exams"]
    for exam in datasets["exams"]:
        exam_id = str(first_value(exam, exam_id_keys) or "?")
        source_id = exam.get("source") or exam.get("source_id")
        if not source_id:
            errors.append(f"PRÜFUNG OHNE QUELLE: {exam_id} in data/{exam_filename}")
        elif str(source_id) not in source_ids:
            errors.append(f"TOTE QUELLEN-ID: {exam_id} verweist auf {source_id}")

        afb = exam.get("afb")
        be = exam.get("be")
        if isinstance(afb, dict) and isinstance(be, (int, float)):
            values = [afb.get(key) for key in ("I", "II", "III")]
            if all(isinstance(value, (int, float)) for value in values):
                total = sum(values)
                if total != be:
                    errors.append(f"AFB-SUMME: {exam_id} hat {total} statt {be} Bewertungseinheiten")

    return errors, warnings


def main() -> int:
    errors, warnings = validate()

    for message in warnings:
        print(f"WARNUNG: {message}")
    for message in errors:
        print(f"FEHLER: {message}")

    if errors:
        print(f"\nValidierung fehlgeschlagen: {len(errors)} Fehler, {len(warnings)} Warnungen.")
        return 1

    print(f"Validierung erfolgreich: 0 Fehler, {len(warnings)} Warnungen.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
