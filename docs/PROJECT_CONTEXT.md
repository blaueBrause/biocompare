# PROJECT_CONTEXT.md

## Zweck dieser Datei

Diese Datei ist das zentrale Projektgedächtnis für das Repository `blaueBrause/biocompare`.
Ein neuer Chat soll diese Datei zuerst lesen und danach ohne den bisherigen Chatverlauf weiterarbeiten können.

---

# 1. Projektziel

Es geht um eine quellenbasierte Entscheidungshilfe zur Schulwahl.

Die konkrete Leitfrage lautet:

> Ist ein Wechsel auf das Berufliche Gymnasium, insbesondere SGG Soziales, für eine biologisch interessierte Schülerin fachlich ein Nachteil gegenüber dem Verbleib am allgemeinbildenden Gymnasium mit Biologie-Leistungsfach?

Die Seite soll keine allgemeine Biologie-Enzyklopädie und kein Ranking von Schularten werden. Sie soll der Familie helfen, die fachlichen Folgen einer möglichen Schulwahl realistisch einzuschätzen.

---

# 2. Zielfall

Aktuelle Betrachtung:

- Schülerin am allgemeinbildenden Gymnasium
- Interesse an Biologie
- Vergleich mit Beruflichem Gymnasium, insbesondere SGG Soziales
- Ziel ist nicht BTG oder SGG Gesundheit, sondern SGG Soziales

Wichtig:

- Am SGG Soziales ist das Profilfach nicht Biologie, sondern Pädagogik/Psychologie.
- Biologie ist dort reguläres Fach bzw. ggf. mündliches Prüfungsfach.
- Deshalb dürfen Quellen zu bio-nahen Profilfächern nicht automatisch verwendet werden.

---

# 3. Nicht verwenden

Die Handreichung **„Gesundheit und Biologie“** wird für diesen Vergleich nicht verwendet.

Grund:

- Sie gehört zum Profilfach Gesundheit und Biologie.
- Dieses Profil ist nicht identisch mit SGG Soziales.
- Die Verwendung würde den Vergleich verfälschen.
- Sie soll weder im Text, noch in der Quellenliste, noch in der Datenbank erscheinen.

---

# 4. Vergleichsgegenstände

Verglichen werden:

## Allgemeinbildendes Gymnasium

- Basisfach Biologie
- Leistungsfach Biologie

## Berufliches Gymnasium

- reguläres Fach Biologie
- Ergänzungsfach Sondergebiete der Biowissenschaften

Das Ergänzungsfach Sondergebiete wird nur als optionale/schulabhängige Vertiefung berücksichtigt. Es darf nicht automatisch zum Pflichtumfang des Beruflichen Gymnasiums addiert werden.

---

# 5. Arbeitsregeln

1. Keine Aussage ohne Quelle.
2. Keine Vermutungen als Tatsachen.
3. Beleglage immer markieren.
4. Offene Punkte ausdrücklich offen lassen.
5. Keine wertende Sprache wie „besser“, „schlechter“, „spannender“, wenn dies nicht quellenbasiert präzisiert wird.
6. Sachlich schreiben.
7. Abkürzungen sparsam verwenden.
8. Glossar anlegen.
9. Quellen, Erkenntnisse und offene Punkte im Repository speichern.
10. Repository ist die Quelle der Wahrheit, nicht der Chat.

Belegstatus:

- BELEGT
- TEILWEISE BELEGT
- OFFEN / NICHT ÖFFENTLICH BELEGBAR

---

# 6. Gewünschte Produktform

Eine statische HTML-Anwendung:

- `index.html`
- self-contained oder mit minimalen Daten-Dateien
- offline nutzbar
- keine Frameworks
- keine externen Abhängigkeiten
- ruhige Farbgebung
- Suchfunktion
- Filter
- Quellenansicht
- Glossar
- Druckansicht wünschenswert

---

# 7. Geplante Repository-Struktur

```text
README.md
index.html
docs/
  PROJECT_CONTEXT.md
  CHAT_BACKUP.md
  ENTSCHEIDUNGEN.md
  CHANGELOG.md
  ROADMAP.md
  GLOSSAR.md
  QUELLENSTRATEGIE.md
data/
  quellen.json
  themen.json
  kompetenzen.json
  pruefungen.json
  befunde.json
  offene_fragen.json
sources/
  README.md
```

PDFs können in `sources/` abgelegt werden, sofern urheberrechtlich zulässig. Kommerzielle Leseproben nicht vollständig übernehmen, wenn unklar.

---

# 8. Bisherige Quellenbasis

## Bildungspläne

- Bildungsplan 2016 Baden-Württemberg – Gymnasium Biologie
- Berufliches Gymnasium – Biologie, Bildungsplan 2021
- Sondergebiete der Biowissenschaften, Bildungsplan 2021

## Jahresplanungen

- Jahresplanung Biologie Basisfach
- Jahresplanung Biologie Leistungsfach

## Prüfungsvorgaben

- KM Baden-Württemberg: Anforderungen Abitur 2026 Berufliche Gymnasien
- Prüfungsrelevante Stoffgebiete, soweit verfügbar

## Prüfungsaufgaben / Beispielaufgaben

- IQB 2025 grundlegendes Niveau: Kultivierung von Algen
- IQB 2025 erhöhtes Niveau: Cyanobakterien als Fotosynthesespezialisten
- IQB 2025 erhöhtes Niveau: Elefanten und Stoßzähne
- IQB 2025 erhöhtes Niveau: Farbenblindheit
- STARK Leseprobe Leistungsfach Biologie Baden-Württemberg
- STARK Leseprobe Biologie Berufliches Gymnasium Baden-Württemberg

STARK nur ergänzend verwenden, nicht als amtliche Primärquelle.

---

# 9. Gesicherte Erkenntnisse

## 9.1 Themenfelder

Nach bisherigem Stand behandeln beide Systeme zentrale biologische Themenfelder:

- Zellbiologie
- Stoffwechsel
- Genetik / Molekularbiologie
- Evolution
- Ökologie
- Neurobiologie
- Immunbiologie in relevanten Kontexten

Daraus folgt: Das Berufliche Gymnasium ist biologisch nicht einfach „leer“ oder „vereinfachter Nebenunterricht“.

## 9.2 Leistungsfach

Das Leistungsfach am allgemeinbildenden Gymnasium ist in mehreren Bereichen stärker als vertieftes, schriftlich geprüftes Fach dokumentiert:

- molekularbiologische Verfahren
- Gentechnik
- CRISPR/Cas
- Gentherapie
- vernetzte schriftliche Prüfungsaufgaben
- Materialauswertung auf erhöhtem Niveau
- Bewertungskompetenz

## 9.3 Berufliches Gymnasium

Das reguläre Fach Biologie am Beruflichen Gymnasium enthält substanzielle biologische Inhalte. Der entscheidende Unterschied liegt nicht darin, dass die großen Themen fehlen, sondern in:

- Prüfungsrolle
- Verbindlichkeit
- konkreter Unterrichtsumsetzung
- Zusatzangeboten
- schulabhängigem Ergänzungsfach

## 9.4 Sondergebiete der Biowissenschaften

Sondergebiete können fachlich attraktiv sein, dürfen aber nur als optionale/schulabhängige Zusatzchance bewertet werden.

Offen bleibt:

- Wird das Fach an der Zielschule angeboten?
- Welche Module werden angeboten?
- Kommt ein Kurs zustande?

## 9.5 SGG Soziales

Für die eigentliche Schulwahl ist entscheidend:

- SGG Soziales hat Pädagogik/Psychologie als Profilfach.
- Biologie ist nicht das Profilfach.
- Deshalb ist der Vergleich mit einem Biologie-Leistungsfach nicht symmetrisch.
- Entscheidend ist, ob reguläre Biologie plus ggf. Sondergebiete den fachlichen Anspruch der Schülerin ausreichend abdecken.

---

# 10. Zentrale offene Fragen

1. Welche Sondergebiete-Module bietet die konkrete Zielschule an?
2. Wird Biologie am SGG Soziales regelmäßig als mündliches Prüfungsfach eingerichtet?
3. Gibt es Labor-, Projekt- oder Kooperationsangebote mit biologischem Bezug?
4. Gibt es frei zugängliche amtliche BG-Biologie-Musterprüfungen mit Erwartungshorizont?
5. Wie wird reguläre BG-Biologie an der konkreten Schule umgesetzt?
6. Welche Wochenstundenzahl hat Biologie in J1/J2 am Ziel-BG?
7. Welche Prüfungsoptionen bestehen konkret in der Kursstufe?

---

# 11. Arbeitsprodukt – gewünschte Gliederung der HTML-Seite

## Start

- Leitfrage
- Kurzfazit
- Belegstatus
- Was sicher ist / was offen ist

## Entscheidungssicht

- Was spricht fachlich für Verbleib im Leistungsfach?
- Was spricht fachlich gegen einen Nachteil beim Wechsel?
- Welche Fragen muss die Zielschule beantworten?

## Lehrplanvergleich

- nicht als Selbstzweck
- nur als Belegbasis
- Themenfelder:
  - Zellbiologie
  - Stoffwechsel
  - Genetik
  - Gentechnik
  - Neurobiologie
  - Hormonsystem
  - Immunbiologie
  - Evolution
  - Ökologie

## Unterricht

- Allgemeinbildendes Gymnasium gut dokumentiert durch Jahresplanungen
- Reguläre BG-Biologie öffentlich schwächer dokumentiert
- Diese Lücke transparent markieren

## Prüfungen

- IQB grundlegend
- IQB erhöht
- STARK ergänzend
- BG-Prüfungsrahmen
- Vergleich nach:
  - Materialarten
  - Operatoren
  - Anforderungsbereiche
  - Bewertungseinheiten
  - Transfer
  - Datenanalyse
  - Bewertung/Argumentation

## Glossar

- Basisfach
- Leistungsfach
- Berufliches Gymnasium
- SGG Soziales
- Sondergebiete der Biowissenschaften
- Bildungsplaneinheit
- IQB
- Anforderungsbereich
- Operator

---

# 12. Fehler / Korrekturen aus dem Chat

- Es wurde zu viel geplant und zu wenig direkt geschrieben.
- Teilweise wurde behauptet, im Hintergrund weiterzuarbeiten; das ist in ChatGPT nicht möglich.
- GitHub-Schreibzugriff funktionierte zeitweise, dann waren die Tools nicht mehr verfügbar.
- Die Handreichung Gesundheit und Biologie wurde anfangs diskutiert, später aber ausgeschlossen.
- Die Datenblöcke waren zunächst zu klein; größere Handoff-Pakete sind sinnvoller.

---

# 13. Übergabehinweis für neuen Chat

Ein neuer Chat soll zuerst lesen:

1. `docs/PROJECT_CONTEXT.md`
2. `docs/ENTSCHEIDUNGEN.md`
3. `data/quellen.json`
4. `data/befunde.json`
5. `data/offene_fragen.json`

Danach kann die Arbeit fortgeführt werden.

Wichtig: Keine Nutzung der Handreichung Gesundheit und Biologie.
