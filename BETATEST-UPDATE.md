> **Hinweis (Asset-Integration, Branch `feature/asset-integration`):** Die hier beschriebenen Punkte sind in die gemalten
> Nahansichten übernommen. Mosaik, Zeitmechanik und Endsequenz verwenden jetzt die Illustrationen aus dem Assetpaket
> (`assets/puzzles/`, `assets/finale/`) statt der SVG-Fassung; `chronicle.js`/`chronicle.css` und die zugehörigen
> Tests wurden dadurch ersetzt. Übernommen wurden: gespeicherte Jahres-Verriegelungen und Fehlversuche je Tafel,
> ausdrücklich gewählte vollständige Zeitfolge, Aufräumen von Timern/Listenern beim Schließen, Abschlussbedingung
> (alle Rätsel + sechs Siegel), „Neues Spiel“ mit Abbrechen zurück zur Abschlussansicht, Abschlussansicht nach dem
> Laden eines abgeschlossenen Spielstands. Details: README.md und TESTREPORT.md.

# Betatest-Überarbeitung · 26. September 2026

Integriert auf Basis von `0df52659920580accd5a32156cff17e801a76661`. Die zwischenzeitlich ergänzten Szenenspiele, Begründungsauswahlen, Siegel, Argumentationsbrücke, Schriftarten und iPad-Regeln bleiben erhalten.

## Verhalten und Gestaltung

- Erste Szeneneinstiege heißen **Szene erkunden**; echte Rückkehraktionen behalten ihre Beschriftung.
- Drei Schriftrollen zeigen unverändert die drei vorhandenen Archivabsätze als scharfen HTML-Text auf Pergament mit Rollenstäben und Patina. Lesen, Inventar, Ablage und Freischaltung bleiben gekoppelt.
- **Archivmechanismus** bzw. **Archivmechanismus – gelöst** ersetzt die unklare Hotspotbezeichnung.
- Personenhotspots verwenden für Beschriftung, Hover, Fokus und Klickfläche dieselbe Buttonfläche. Die Position kommt ausschließlich aus den Szenendaten. Das betrifft auch Bote und Beraterin.
- **Mosaik der Motive**: drei feste Bereiche, sieben sich ergänzende Reliefteile, bestehende vertretbare Zuordnungen und Begründungsauswahl. Keine Neigung, Gewichte oder Balanceberechnung. Unterschiedliche Mengen pro Bereich sind ausdrücklich möglich.
- **Chronikmaschine**: Holz, Bronze, sechs Jahresfassungen, einrastende Tafeln, Verriegelungen, Zahnräder und Hebel. Tippen/Klicken auf Tafel und Jahresring funktioniert ohne Hover oder Ziehen; native Buttons sind per Tastatur bedienbar.
- Notizbuchhinweis und direkter Zugang gehören zur normalen Aufgabe. Fehler verraten keine Lösung: zuerst allgemeine Rückmeldung, ab dem zweiten Versuch desselben Elements Verweis auf die Zeitspuren. Die vollständige Zeitfolge benötigt eine ausdrücklich gewählte Hilfsaktion.
- Die vorhandene zusätzliche Frage zum Beginn des Wandels bleibt nach den sechs Jahresringen erhalten. Erst danach wird die Argumentationsbrücke freigegeben.
- Nach der letzten Inschrift der Argumentationsbrücke beginnt direkt eine endliche Abschlusssequenz: sechs Siegel, Mechanik, öffnende Chronik, acht Rückblenden mit bestehenden Szenenbildern und dauerhafte Abschlussansicht. Kein automatischer Sprung zum Stadttor.
- **Stadt weiter erkunden** führt ausdrücklich zurück in die Welt. **Neues Spiel** verlangt die bestehende Sicherheitsabfrage; Abbrechen führt zurück zur Abschlussansicht.
- `prefers-reduced-motion` zeigt unmittelbar den gleichwertigen ruhigen Abschluss. Die Sequenz lässt sich außerdem zur Abschlussansicht überspringen.

## Dateien

| Datei | Änderung |
| --- | --- |
| `script.js` | Einstiegstexte, Schriftrollen, Modal-Aufräumen, Timeline-Anbindung, Hilfen und finale Bedingungen/Spielstand |
| `data/game-data.js` | Namen und Aufgabenrahmung; historische Inhalte und Zuordnungen weiterverwendet |
| `adventure.js`, `adventure.css` | gemeinsame Personenfläche; Motivrelief in Szene und klassischer Darstellung |
| `scenegames.js`, `scenegames.css` | Mosaik ersetzt Waage; alte Chronikdarstellung durch eigenes Modul ersetzt; Timerverwaltung |
| `argbridge.js` | direkter Übergang vom letzten Rätsel zur Abschlusssequenz; Timerverwaltung |
| `minigames.js` | Aufräumen von Timern, Animationsframes, globalen Listenern und ResizeObservern |
| `chronicle.js`, `chronicle.css` (neu) | Chronikmaschine, Fehlerstufen, Abschlusssequenz, responsive Materialdarstellung |
| `index.html`, `package.json` | Module und Stile laden; neue Tests einbinden |
| `tests/archive-flow.cjs`, `tests/playthrough.cjs`, `tests/scenegames.cjs`, `tests/seals.cjs`, `tests/argbridge.cjs`, `tests/ipad-layout.cjs` | Integration an die neuen Abläufe angepasst |
| `tests/chronicle-lifecycle.cjs`, `tests/betatest-browser.cjs` (neu) | Ressourcen, Wiederöffnen, Feedback, Endbedingungen und echte Browserbedienung |

`continuation.js` und das Spielstandformat Version 1 bleiben kompatibel. Ergänzt werden ausschließlich Flags für verriegelte Jahresringe, elementbezogene Fehlversuche, die Transferfrage und die bereits gezeigte Abschlusssequenz. Bereits gelöste alte Spielstände behalten ihren Fortschritt; alte freie Begründungen bleiben im Notizbuch sichtbar.

## Neue Assets

- `assets/puzzles/papyrus-grain.svg`: dezente Pergamentstruktur; sämtliche Fachtexte bleiben HTML.
- `assets/puzzles/motive-relief.svg`: eigenständiges Motivrelief mit Medaillon und sieben Feldern.
- `assets/puzzles/bronze-gear.svg`: mechanisches Zahnrad.

Die vorhandenen Siegel aus `seals.js`, die Chronikraum-Illustration und die Szenenbilder werden wiederverwendet. Keine benötigten Alt-Assets gelöscht, keine neuen extern zu liefernden Illustrationen oder Platzhalter erforderlich. Die bereits bestehenden optionalen Asset-Slots anderer Module bleiben erhalten.

## Prüfung

- `npm test`: sämtliche bestehenden Tests sowie der neue Lifecycle-Test bestanden. Der vollständige Fortschrittstest umfasst alle zwölf Haupträtsel; dort werden Canvas-Minispiele ausdrücklich durch Stubs ersetzt.
- Syntaxprüfung sämtlicher JavaScript- und CJS-Dateien; `git diff --check` bestanden.
- Echter Chromium/Edge: Desktop 1440 × 1000 und Touch-Emulation 1024 × 768. Geprüft wurden Schriftrollen, Personenhotspots, Militärlager, Mosaik mit ungleichen Kategorienmengen, Chronikfehler und Wiederöffnen, Notizbuch, weitgehende Hilfe, Verriegelung, Transferfrage, alle drei Phasen der echten Argumentationsbrücke und die vollständige Abschlusssequenz.
- Zusätzlich: echtes Archivrätsel mit Maus/Touch und Schriftrollenablage, mehrmaliges Öffnen/Schließen des Quellen-Minispiels, Speichern/Laden, bestätigungspflichtiger Neustart, fehlende Finalbedingungen, reduzierte Bewegung und keine JavaScript-Fehler.
- Screenshots von Schriftrollen, Lager, Motivszene, Mosaik, Chronikmaschine und mehreren Finalphasen visuell geprüft. Überläufe und Überdeckung der Mosaik-Begründungen werden zusätzlich im Browser geprüft.
- Lifecycle-Test: 32 Prüfungen für Timer, Frames, globale Listener, Observer, teilweise gelöste Rätsel, erhaltene Transferfrage und wiederholt gestartete/abgebrochene Abschlusssequenzen.

Nicht auf einem physischen iPad oder in Safari/iPadOS ausgeführt. Die Touch- und Bildschirmprüfungen sind Chromium-Emulation; eine Unterrichtsdauer von 35–45 Minuten wurde nicht simuliert.

Browserprüfung: Playwright bereitstellen, bei Bedarf `PLAYWRIGHT_BROWSER` auf Chrome/Edge setzen, dann `npm run test:browser`. Optional speichert `WENDE_SCREENSHOTS` die visuellen Prüfstände. Die Tests starten selbst einen lokalen Webserver.
