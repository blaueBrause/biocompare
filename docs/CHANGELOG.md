# Changelog

## 2026-07-10 – Datenqualität
- `tools/validate_data.py` ergänzt.
- Prüfung auf ungültiges JSON, doppelte IDs, tote Quellenverweise und unbelegte `BELEGT`-Einträge eingeführt.
- AFB-Summen der Prüfungsdatensätze werden gegen die Gesamt-Bewertungseinheiten geprüft.
- GitHub-Action zur automatischen Validierung bei Änderungen an Daten und Quellen ergänzt.

## 2026-07-10 – Oberfläche
- Alten Self-Contained-Prototyp ersetzt.
- Fachliche Daten aus `index.html` entfernt.
- Datengetriebene Single-Page-Oberfläche mit `assets/app.js` und `assets/styles.css` erstellt.
- Ansichten für Überblick, Befunde, Kompetenzen, Themen, Prüfungen, Quellen, offene Fragen und Glossar ergänzt.
- Filter, Suche, responsive Navigation und Druckdarstellung ergänzt.
- Lokalen Betrieb über einen statischen Webserver dokumentiert.
- Keine Fortschrittswertung oder Rangliste eingeführt.

## 2026-07-10 – Audit-Fix
- Audit-Lücken geschlossen.
- START_HERE und QUELLENSTRATEGIE ergänzt.
- Kompetenz- und Prüfungsdaten ergänzt.
- Quellenmetadaten um URL, Herausgeber, Hash und Lizenzstatus ergänzt.
- `data/befunde.json` als kanonische Erkenntnisdatei festgelegt.
