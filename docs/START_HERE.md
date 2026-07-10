# START_HERE

Stand: 2026-07-10

1. `docs/PROJECT_CONTEXT.md`
2. `docs/ENTSCHEIDUNGEN.md`
3. `docs/QUELLENSTRATEGIE.md`
4. `data/quellen.json`
5. `data/kompetenzen.json`
6. `data/kompetenzen_zusatzfach.json`
7. `data/befunde.json`
8. `data/sondergebiete.json`
9. `data/pruefungen.json`
10. `data/offene_fragen.json`

`data/befunde.json` ist die einzige maßgebliche Erkenntnisdatei.
`data/kompetenzen.json` ist die maßgebliche Vergleichsmatrix für AG Basisfach, AG Leistungsfach und reguläres BG.
`data/kompetenzen_zusatzfach.json` ergänzt für jede Kompetenz die optionale, schulabhängige vierte Vergleichsspalte.
`data/erkenntnisse.json` ist zu löschen.

Wichtige Regeln:
- Zielfall SGG Soziales.
- Gesundheit und Biologie wird nicht verwendet.
- Sondergebiete nur optional und schulabhängig.
- Keine Aussage ohne Fundstelle.
- Jede der vier Schulvarianten besitzt eigene Belege; Quellen werden nicht zwischen Varianten übertragen.
- Merkmale wie Experiment, Datenauswertung, Modellierung und Bewertung sind positive Nachweise, keine Punktwertung.
- Ein nicht angezeigtes Merkmal bedeutet nicht, dass es fehlt.
