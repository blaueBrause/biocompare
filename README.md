# Biologie-Vergleich BW

Quellenbasierte Entscheidungshilfe zur Schulwahl zwischen allgemeinbildendem Gymnasium und Beruflichem Gymnasium, insbesondere SGG Soziales.

## Einstieg

Projektkontext und Arbeitsregeln: `docs/START_HERE.md`

## Anwendung

Die Oberfläche liegt in `index.html` und lädt die fachlichen Inhalte ausschließlich aus den Dateien unter `data/`.

Für den lokalen, internetunabhängigen Betrieb im Repository-Verzeichnis:

```bash
python -m http.server 8000
```

Danach im Browser öffnen: `http://localhost:8000`

Auf GitHub Pages funktioniert die Anwendung ohne Build-Schritt.

Die Ansicht **Zusatzfach** führt `Sondergebiete der Biowissenschaften` als optionale und schulabhängige BG-Erweiterung. Diese Inhalte werden ausdrücklich nicht dem regulären BG-Pflichtfach zugerechnet.

Die Ansicht **Prüfungen** enthält eine getrennte Zeitreihe der amtlichen Biologie-Prüfungsvorgaben 2023–2027. Jahresbezogene Prüfungsausschlüsse werden nicht als Curriculumslücken interpretiert.

## Daten prüfen

Vor einem Commit mit fachlichen Änderungen:

```bash
python tools/validate_data.py
python tools/validate_competencies.py
python tools/validate_exam_rules.py
```

Die Validatoren prüfen insbesondere:

- gültige JSON-Syntax,
- fehlende und doppelte IDs,
- tote Quellen- und Dateiverweise,
- `BELEGT`-Einträge ohne Quelle und Fundstelle,
- für jede Kompetenz getrennte Belege zu Basisfach, Leistungsfach und regulärem BG,
- seitengenaue Fundstellen, bevor eine Kompetenzzelle `BELEGT` heißen darf,
- die vollständige Trennung und Belegung des optionalen Zusatzfachs,
- widersprüchliche Summen der Anforderungsbereiche bei Prüfungsaufgaben,
- erwartete System-Jahr-Paare der Prüfungsvorgaben,
- vollständige Quellenmetadaten und SHA-256-Werte,
- die lückenlose 120-BE-Notenskala der AG-Korrekturrichtlinie 2027.

GitHub Actions führt alle drei Prüfungen bei Änderungen an `data/`, `sources/` oder den Validatoren automatisch aus.

## Fachliche Daten

- `data/quellen.json`
- `data/themen.json`
- `data/kompetenzen.json`
- `data/kompetenzen_zusatzfach.json`
- `data/sondergebiete.json`
- `data/pruefungen.json`
- `data/pruefungsvorgaben.json`
- `data/befunde.json`
- `data/offene_fragen.json`

`data/befunde.json` ist die kanonische Erkenntnisdatei. Das HTML enthält keine eigene Kopie der fachlichen Daten.

In `data/kompetenzen.json` besitzt jede Schulvariante eine eigene Bewertung, einen eigenen Belegstatus und eigene Fundstellen. Eine Quelle darf nicht automatisch mehrere Varianten belegen.
