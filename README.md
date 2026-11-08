# Im Zeichen der Wende

Historisches Point-and-Click-Lernspiel zur Christenverfolgung und Konstantinischen Wende.

## Lehrkräftekompendium

Ausschließlich im vorhandenen lokalen Lehrkraftmodus führt der Link **Lehrkräftekompendium ↗** zur separaten Seite `lehrkraefte.html`. Sie öffnet sich in einem neuen Tab; das Spiel bleibt geöffnet. Der bestehende Lehrkraftmodus ist weiterhin durch fünf Sekunden Halten des Spieltitels oder Umschalt + Enter erreichbar. Weder Modus noch Handbuch sind ein passwortgeschützter Adminbereich.

Das Kompendium enthält einen interaktiven Schnellstart, einen Leitfaden zu allen zwölf Orten, 31 durchsuchbare FAQ sowie bewusst zu öffnende Lösungen für alle zwölf Haupträtsel, die Abschlusssequenz und die fünf freiwilligen Bonusspiele. **Anleitung drucken / Als PDF speichern** druckt Vorbereitung, Leitfaden und alle FAQ, unabhängig vom Suchfilter. Nach dem Öffnen des Lösungsteils können dessen Inhalte optional mitgedruckt werden. Geöffnete und geschlossene Hilfetexte werden nach dem Druck wiederhergestellt.

Redaktionelle Inhalte stehen in `lehrkraefte-data.js`, Darstellung und Bedienung in `lehrkraefte.html`, `lehrkraefte.css` und `lehrkraefte.js`. Lösungen werden aus der von `index.html` tatsächlich verwendeten Datei `data/game-data.js` abgeleitet. Die ältere Datei `game-data.js` im Repository-Hauptverzeichnis wird dafür nicht verwendet. Bei Spieländerungen auch Voraussetzungen, Hilfen und Fachhinweise im Kompendium prüfen.

`npm test` und `npm run build` enthalten die neuen Handbuchprüfungen. Für die zusätzliche Browserprüfung: Playwright über die Umgebung bereitstellen, gegebenenfalls `PLAYWRIGHT_BROWSER` auf ein installiertes Chromium setzen und `node tests/teacher-handbook-browser.cjs` ausführen. Mit `HANDBOOK_OUTPUT` lassen sich Prüf-PDFs und Bildschirmbilder speichern; keine neue Playwright-Projektabhängigkeit ist erforderlich.

Ergebnisse, Grenzen der Prüfung und bekannte bestehende Spielprobleme: siehe [LEHRKRAEFTE-TESTBERICHT.md](LEHRKRAEFTE-TESTBERICHT.md).

## Neue Bonusspiel-Assets

Dieses Paket enthält separat ausgeschnittene Produktionsgrafiken für drei Bonusspiele:

- `assets/bonus/secret-code/` – neues Merk-/Sequenzspiel „Das geheime Zeichen“
- `assets/bonus/tiber-topdown/` – neue Top-down-Version „Über den Tiber!“
- `assets/bonus/catacombs/` – zusätzliche Top-down- und Interaktionsassets für den Katakombenlauf

## Wichtig

Die Dateien wurden aus den freigegebenen, neu erzeugten Asset-Sheets dieser Unterhaltung als einzelne PNGs exportiert. Die großen Boards unter `source-sheets/` dienen nur als visuelle Referenz und sollen **nicht direkt im Spiel** verwendet werden.

### Asset-Regel
Bestehende ältere Assets haben keinen Bestandsschutz. Wenn sie unscharf, verzerrt oder perspektivisch falsch sind, diese neuen Assets bevorzugen bzw. neue Varianten erzeugen. Für `Über den Tiber!` ausschließlich echte Top-down-Darstellung verwenden.

### Das geheime Zeichen
`codeboard.png` ist das eigentliche Codebrett. Für Fisch, Anker, Taube und Chi-Rho liegen jeweils `normal`, `active` und `error` vor. `success-effect.png` und `error-effect.png` sind optionale Rückmeldeeffekte.

### Über den Tiber!
`tiber-background.png` ist eine echte Top-down-Grundszene. Bewegliche Objekte liegen als einzelne PNGs vor. Die vier Spieleransichten sind getrennt exportiert.

### Katakombenlauf
Die vorhandene Spiellogik kann erhalten bleiben, aber die neuen Boden-/Wand-/Objektgrafiken können die bisherigen schwächeren Darstellungen ersetzen. Die Symbole und Inschriftgrafik sind für den neuen didaktischen Erkundungsloop vorgesehen.
