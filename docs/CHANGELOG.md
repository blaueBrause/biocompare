# Changelog

## 2026-07-10 – Seitengenaue Kompetenzmatrix
- Kompetenzmatrix von 11 auf 12 Einträge erweitert; Hardy-Weinberg als eigener Vergleichspunkt ergänzt.
- Zellbiologie, Enzymatik, Genetik, PCR/Gelelektrophorese, Neurobiologie und Evolution für Basisfach, Leistungsfach und reguläres BG mit Seiten, BPE-Unterpunkten und Teilkompetenzen präzisiert.
- Dissimilation und Assimilation für Leistungsfach und BG seitengenau belegt; Basisfach bleibt mangels positiver Oberstufen-Fundstelle offen.
- Hormonsystem, Immunbiologie und Ökologie differenzierter bewertet, statt pauschale Gleichwertigkeit zu behaupten.
- Kompetenzansicht um eine Belegübersicht je Schulvariante ergänzt.
- Hardy-Weinberg verweist aus der Kompetenzmatrix auf den getrennten Zusatzfachdatensatz `SG-004`.
- Kompetenzvalidator prüft nun auch Teilbelege und tote Zusatzfachreferenzen.

## 2026-07-10 – Zellenweise Kompetenzbelege
- `data/kompetenzen.json` auf getrennte Variantenobjekte für Basisfach, Leistungsfach und reguläres BG umgestellt.
- Bewertungen ohne eigene Fundstelle auf `OFFEN` oder `TEILWEISE BELEGT` zurückgestuft, statt Belege zwischen Schulvarianten zu übertragen.
- Kompetenzansicht als Kartenvergleich mit eigenem Status und eigenen Fundstellen pro Variante neu aufgebaut.
- `tools/validate_competencies.py` ergänzt: prüft Pflichtvarianten, tote Quellen-IDs, alte Schemafelder und seitengenaue Fundstellen für `BELEGT`.
- GitHub Actions führt nun allgemeine Datenvalidierung und Kompetenzvalidierung gemeinsam aus.
- JSON der Kompetenzmatrix lesbar formatiert.

## 2026-07-10 – Amtliche BG-Abiturprüfung 2025
- Amtlichen Haupttermin 2025 für das Prüfungsfach 4.3 Biologie als `SRC-013` erfasst.
- Vier BG-Aufgaben zu Genetik, Evolution, Neurobiologie und Ökologie in `data/pruefungen.json` ausgewertet.
- Schriftliche Biologieprüfung für EG, SGGS, TG und WG als Befund dokumentiert.
- Offene Frage zur BG-Prüfungsquellenlage auf „teilweise beantwortet“ gesetzt.
- Prüfungsansicht trennt nun amtliche BG-Aufgaben und IQB-Referenzaufgaben.
- AFB-Anteile der BG-Aufgaben werden ohne Erwartungshorizont ausdrücklich nicht geschätzt.
- Ausschluss populationsgenetischer Allelhäufigkeiten im Haupttermin 2025 beim Hardy-Weinberg-Vergleich ergänzt.

## 2026-07-10 – BG-Zusatzfach
- `data/sondergebiete.json` als eigene Datenebene ergänzt.
- Neue Ansicht „Zusatzfach“ in Navigation und Dashboard integriert.
- Sondergebiete der Biowissenschaften ausdrücklich als optional und schulabhängig gekennzeichnet.
- Hardy-Weinberg für reguläres BG, Zusatzfach und AG-Leistungsfach mit getrennten Fundstellen gegenübergestellt.
- Validator um Zusatzfach-Daten und Vergleichsfelder erweitert.

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
