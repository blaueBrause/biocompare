#!/usr/bin/env python3
"""Prüft die zellenweise Evidenz aller vier Kompetenzvarianten."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
REQUIRED_REGULAR_VARIANTS = ("ag_basisfach", "ag_leistungsfach", "bg_regulaer")
LEGACY_FIELDS = ("basisfach", "ag_basisfach", "leistungsfach", "ag_leistungsfach", "bg", "status", "evidence")
VALID_STATUSES = {"BELEGT", "TEILWEISE BELEGT", "OFFEN"}
VALID_FEATURES = {"experiment", "datenauswertung", "modellierung", "quantitativ", "bewertung"}
VAGUE_COMPARISONS = re.compile(r"\b(vertieft|tiefer|höherwertig|anspruchsvoller)\b", re.IGNORECASE)


def load_list(filename: str) -> list[dict[str, Any]]:
    path = DATA / filename
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise ValueError(f"FEHLT: data/{filename}") from None
    except json.JSONDecodeError as exc:
        raise ValueError(f"UNGÜLTIGES JSON: data/{filename}:{exc.lineno}:{exc.colno} – {exc.msg}") from None
    if not isinstance(value, list) or not all(isinstance(item, dict) for item in value):
        raise ValueError(f"FALSCHER DATENTYP: data/{filename} muss eine Liste aus Objekten enthalten")
    return value


def precise_page(location: Any) -> bool:
    return bool(re.search(r"(?:\bS\.?\s*\d+|\bSeite\s+\d+|\bp\.?\s*\d+)", str(location or ""), re.IGNORECASE))


def validate_cell(
    label: str,
    cell: Any,
    source_ids: set[str],
    errors: list[str],
    warnings: list[str],
) -> None:
    if not isinstance(cell, dict):
        errors.append(f"FEHLENDE VARIANTE: {label}")
        return

    assessment = str(cell.get("assessment") or "").strip()
    if not assessment:
        errors.append(f"FEHLENDE BEWERTUNG: {label}")
    elif VAGUE_COMPARISONS.search(assessment):
        errors.append(f"UNOPERATIONALISIERTE VERGLEICHSAUSSAGE: {label} – {assessment}")

    status = str(cell.get("status") or "").strip().upper()
    if status not in VALID_STATUSES:
        errors.append(f"UNGÜLTIGER STATUS: {label} – {status or 'leer'}")

    evidence = cell.get("evidence")
    if not isinstance(evidence, list):
        errors.append(f"FALSCHE FUNDSTELLENSTRUKTUR: {label}")
        return

    valid_evidence: list[dict[str, Any]] = []
    for entry in evidence:
        if not isinstance(entry, dict):
            errors.append(f"FALSCHE FUNDSTELLE: {label}")
            continue
        source_id = entry.get("source") or entry.get("source_id")
        location = entry.get("location") or entry.get("fundstelle")
        if not source_id:
            errors.append(f"FUNDSTELLE OHNE QUELLE: {label}")
        elif str(source_id) not in source_ids:
            errors.append(f"TOTE QUELLEN-ID: {label} verweist auf {source_id}")
        if not location:
            errors.append(f"FUNDSTELLE OHNE ORT: {label}")
        if source_id and location:
            valid_evidence.append(entry)

    features = cell.get("features", [])
    if not isinstance(features, list):
        errors.append(f"FALSCHE MERKMALSSTRUKTUR: {label}")
    else:
        duplicate_features = {feature for feature in features if features.count(feature) > 1}
        if duplicate_features:
            errors.append(f"DOPPELTE MERKMALE: {label} – {', '.join(sorted(duplicate_features))}")
        unknown_features = {str(feature) for feature in features} - VALID_FEATURES
        if unknown_features:
            errors.append(f"UNBEKANNTE MERKMALE: {label} – {', '.join(sorted(unknown_features))}")
        if features and not valid_evidence:
            errors.append(f"MERKMALE OHNE FUNDSTELLE: {label}")

    if status == "BELEGT":
        if not valid_evidence:
            errors.append(f"BELEGT OHNE FUNDSTELLE: {label}")
        elif not any(precise_page(entry.get("location") or entry.get("fundstelle")) for entry in valid_evidence):
            errors.append(f"BELEGT OHNE SEITENGENAUE FUNDSTELLE: {label}")
    elif status == "TEILWEISE BELEGT" and not valid_evidence:
        errors.append(f"TEILWEISE BELEGT OHNE FUNDSTELLE: {label}")
    elif status == "OFFEN" and valid_evidence:
        warnings.append(f"OFFEN MIT FUNDSTELLE: {label}; Status prüfen")


def validate() -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    try:
        sources = load_list("quellen.json")
        competencies = load_list("kompetenzen.json")
        supplementary = load_list("sondergebiete.json")
        supplementary_competencies = load_list("kompetenzen_zusatzfach.json")
    except ValueError as exc:
        return [str(exc)], []

    source_ids = {str(item.get("id") or item.get("source_id")) for item in sources}
    supplementary_ids = {str(item.get("id") or item.get("supplement_id")) for item in supplementary}
    competence_ids: set[str] = set()

    if len(competencies) < 20:
        warnings.append(f"KOMPETENZMATRIX KLEINER ALS ZIELUMFANG: {len(competencies)} Einträge")

    for item in competencies:
        competence_id = str(item.get("id") or item.get("competence_id") or "").strip()
        if not competence_id:
            errors.append("KOMPETENZ OHNE ID")
            continue
        if competence_id in competence_ids:
            errors.append(f"DOPPELTE KOMPETENZ-ID: {competence_id}")
        competence_ids.add(competence_id)

        legacy = [field for field in LEGACY_FIELDS if field in item]
        if legacy:
            errors.append(f"ALTES SCHEMA: {competence_id} enthält {', '.join(legacy)}")

        related = item.get("related_supplementary", [])
        if not isinstance(related, list):
            errors.append(f"FALSCHE ZUSATZFACH-REFERENZ: {competence_id}")
        else:
            for supplement_id in related:
                if str(supplement_id) not in supplementary_ids:
                    errors.append(f"TOTE ZUSATZFACH-ID: {competence_id} verweist auf {supplement_id}")

        variants = item.get("variants")
        if not isinstance(variants, dict):
            errors.append(f"FEHLENDE VARIANTEN: {competence_id}")
            continue

        unexpected_variants = set(variants) - set(REQUIRED_REGULAR_VARIANTS)
        if unexpected_variants:
            errors.append(f"UNBEKANNTE REGULÄRE VARIANTEN: {competence_id} – {', '.join(sorted(unexpected_variants))}")

        for variant_key in REQUIRED_REGULAR_VARIANTS:
            validate_cell(
                f"{competence_id}/{variant_key}",
                variants.get(variant_key),
                source_ids,
                errors,
                warnings,
            )

    supplementary_by_id: dict[str, dict[str, Any]] = {}
    for cell in supplementary_competencies:
        competence_id = str(cell.get("id") or cell.get("competence_id") or "").strip()
        if not competence_id:
            errors.append("ZUSATZFACH-KOMPETENZ OHNE ID")
            continue
        if competence_id in supplementary_by_id:
            errors.append(f"DOPPELTE ZUSATZFACH-KOMPETENZ-ID: {competence_id}")
        supplementary_by_id[competence_id] = cell

    missing_supplementary = competence_ids - set(supplementary_by_id)
    extra_supplementary = set(supplementary_by_id) - competence_ids
    for competence_id in sorted(missing_supplementary):
        errors.append(f"FEHLENDE ZUSATZFACH-SPALTE: {competence_id}")
    for competence_id in sorted(extra_supplementary):
        errors.append(f"ZUSATZFACH-SPALTE OHNE KOMPETENZ: {competence_id}")

    for competence_id in sorted(competence_ids & set(supplementary_by_id)):
        validate_cell(
            f"{competence_id}/bg_zusatzfach",
            supplementary_by_id[competence_id],
            source_ids,
            errors,
            warnings,
        )

    return errors, warnings


def main() -> int:
    errors, warnings = validate()
    for message in warnings:
        print(f"WARNUNG: {message}")
    for message in errors:
        print(f"FEHLER: {message}")
    if errors:
        print(f"\nKompetenzvalidierung fehlgeschlagen: {len(errors)} Fehler, {len(warnings)} Warnungen.")
        return 1
    print(f"Kompetenzvalidierung erfolgreich: 0 Fehler, {len(warnings)} Warnungen.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
