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

Die überarbeitete AG-Primärfassung vom 08.03.2022 wird als nachvollziehbare Evidenzschicht eingebunden:

- `data/quellen_ergaenzungen.json`
- `data/kompetenzen_ag_2022.json`
- `data/befunde_ag_2022.json`
- `assets/ag-2022-overrides.js`

Dadurch bleiben frühere Datenstände erhalten, während die Oberfläche die korrigierten AG-Kompetenzen und Befunde verwendet.

## Daten prüfen

Vor einem Commit mit fachlichen Änderungen:

```bash
python tools/validate_data.py
python tools/validate_competencies.py
python tools/validate_exam_rules.py
python tools/validate_ag_2022.py
```

Die Validatoren prüfen insbesondere:

- gültige JSON-Syntax,
- fehlende und doppelte IDs,
- tote Quellen- und Dateiverweise,
- `BELEGT`-Einträge ohne Quelle und Fundstelle,
- für jede Kompetenz getrennte Belege zu Basisfach, Leistungsfach und regulärem BG,
- seitengenaue Fundstellen, bevor eine Kompetenzzelle `BELEGT` heißen darf,
- die vollständige Trennung und Belegung des optionalen Zusatzfachs,
- die fachlichen Korrekturen aus der überarbeiteten AG-Fassung von 2022,
- widersprüchliche Summen der Anforderungsbereiche bei Prüfungsaufgaben,
- erwartete System-Jahr-Paare der Prüfungsvorgaben,
- vollständige Quellenmetadaten und SHA-256-Werte,
- die lückenlose 120-BE-Notenskala der AG-Korrekturrichtlinie 2027.

GitHub Actions führt alle vier Prüfungen bei Änderungen an `data/`, `sources/` oder den Validatoren automatisch aus.

## Fachliche Daten

- `data/quellen.json`
- `data/quellen_ergaenzungen.json`
- `data/themen.json`
- `data/kompetenzen.json`
- `data/kompetenzen_ag_2022.json`
- `data/kompetenzen_zusatzfach.json`
- `data/sondergebiete.json`
- `data/pruefungen.json`
- `data/pruefungsvorgaben.json`
- `data/befunde.json`
- `data/befunde_ag_2022.json`
- `data/offene_fragen.json`

`data/befunde.json` bleibt die historische kanonische Erkenntnisdatei. Betroffene Aussagen werden in der Oberfläche ID-basiert durch `data/befunde_ag_2022.json` aktualisiert.

In `data/kompetenzen.json` besitzt jede Schulvariante eine eigene Bewertung, einen eigenen Belegstatus und eigene Fundstellen. Eine Quelle darf nicht automatisch mehrere Varianten belegen.
