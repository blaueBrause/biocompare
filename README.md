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

## Daten prüfen

Vor einem Commit mit fachlichen Änderungen:

```bash
python tools/validate_data.py
```

Der Validator prüft insbesondere:

- gültige JSON-Syntax,
- fehlende und doppelte IDs,
- tote Quellen- und Dateiverweise,
- `BELEGT`-Einträge ohne Quelle und Fundstelle,
- widersprüchliche Summen der Anforderungsbereiche bei Prüfungsaufgaben.

GitHub Actions führt diese Prüfung bei Änderungen an `data/`, `sources/` oder dem Validator automatisch aus.

## Fachliche Daten

- `data/quellen.json`
- `data/themen.json`
- `data/kompetenzen.json`
- `data/pruefungen.json`
- `data/befunde.json`
- `data/offene_fragen.json`

`data/befunde.json` ist die kanonische Erkenntnisdatei. Das HTML enthält keine eigene Kopie der fachlichen Daten.
