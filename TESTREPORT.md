## Stempelspiel und Bonusfreischaltung

- `node tests/bonus-unlocks.cjs`: alle acht Freischaltstufen, gesperrte Direktstarts, Start aus dem Notizbuch und Zurücksetzen beim neuen Spiel bestanden.
- Syntaxprüfungen für `script.js`, `minigames.js` und `bonusgames.js` bestanden.
- Chrome: neuer Spieldurchlauf zeigt acht Fragezeichen und keine Bonusfundstellen; Stempel-Anleitung, Start und korrektes Abstempeln geprüft. Bei 1024 × 768 ist der Startknopf vollständig sichtbar und 53 Pixel hoch.
- Keine Tests zur Kompatibilität mit früheren Spielständen durchgeführt. Physisches iPad/Safari nicht geprüft.

# Ergänzung: Archivar und Hotspots (24.09.2026)

- `tests/archive-flow.cjs`: 67 erfolgreiche Prüfungen zu Übergabe, vollständigem Lesen, Lampen-/Schlüsselsperre, Licht, Ablage, Ereignis 311, Neuladen, alten Spielständen, Hotspots und Szenenpfaden. Der Rätselabschluss wird über das echte `minigame-win`-Ereignis simuliert; keine Behauptung eines vollständigen Minispiel-Durchlaufs.
- `tests/continuation.cjs`: bestanden.
- Syntaxprüfung der JavaScript-Dateien: bestanden.
- Chrome: neue Szene, Lesefolge, Fortsetzen nach Neuladen und Eintritt mit Schlüssel in das dunkle Minispiel manuell geprüft.
- Der ältere Gesamttest `tests/playthrough.cjs` ist bereits auf dem unveränderten Ausgangsstand nicht grün (veraltete Sammelbeschriftung); er erwartet außerdem den inzwischen ersetzten Gesprächsdialog. Er wurde nicht als bestandener Gesamtdurchlauf gewertet.
- Nicht geprüft: physisches iPad/Safari und kompletter Unterrichtsdurchlauf.

# Überarbeitung 3 · aktueller Prüfstand

452 automatisierte Prüfungen bestanden: vollständiger Spielweg über elf Orte und zwölf Rätsel, Inventarkombination, Hinweise, Speicherung, sechs Siegel, Finale sowie sechs Vollbildprüfungen. Neu geprüft: eigenständiges Torbild, korrekt benannter Feuerstein mit Bild, Entfernung nach Aufnahme, eigener Wächterdialog mit Nahansicht und Sprechblase sowie Vor-/Zurückblättern. Keine organisatorischen Hinweise in der Schülerhilfe.

Alle neuen Illustrationen wurden einzeln visuell angesehen und die Klickkoordinaten an die tatsächlichen Objektpositionen angepasst. Dies ist keine grafische Browserprüfung. Der verfügbare Cloud-Browser kann den lokalen Testserver und lokale Datei-URLs nicht öffnen. Responsive Layout, tatsächlicher nativer Vollbildmodus und iPad-Safari sind noch praktisch zu prüfen.

Die neue Fassung ist lokal vorbereitet und nicht veröffentlicht. Die frühere automatische Freigabeprüfung blockierte den Push auf main wegen fehlender ausdrücklicher Veröffentlichungszustimmung.

---

## Frühere Prüfprotokolle (gelten nur für die jeweilige alte Fassung)

# Prüfprotokoll – 23.09.2026

## Bestanden

- Syntaxprüfung: `node --check script.js` und `node --check data/game-data.js`.
- DOM-Integrationstest: **391 Prüfungen**, alle 12 Rätsel, alle 11 Orte, vollständiger regulärer Spielweg ohne Lehrkraft-Abkürzungen.
- Falsche und unvollständige Antworten blockieren den Fortschritt und geben erklärendes Feedback.
- Teilantworten, aktueller Ort, Siegel, Inventar und eigene Texte über Neuladen hinweg erhalten.
- Erste, zweite und dritte Hilfestufe; kein Überschreiten der dritten Stufe.
- Öllampe + Feuerstein kombinieren; Archiv erst mit ausgewähltem Schlüssel öffnen.
- Dunkelheit und fehlende Beweisstücke blockieren das Archivrätsel.
- Ereignis 311 und geöffnete Hauskirche; Lagerkarte vor Zeltzugang.
- Finale erst nach sechs eingesetzten Siegeln; Argumentationsbrücke erst nach Zeitstrahl.
- Lehrkraftzugang über langes Drücken (Pointer-Ereignis und Timer im DOM-Test), Rätsel zurücksetzen, alle Siegel geben, Finale direkt testen.
- Neustart leert Fortschritt und sperrt spätere Orte wieder.
- Beschädigter gespeicherter JSON-Inhalt verhindert den Start nicht.

## Live-Prüfung auf GitHub Pages

- Pages-Deployment erfolgreich (Run 35858658180).
- https://simfischer.github.io/im-zeichen-der-wende/ geöffnet.
- Startdialog, Wechsel vom Tor ins Wohnviertel, Szenengrafiken und Hotspots geprüft.
- Nach Neuladen wird Fortsetzen angeboten; aktueller Ort bleibt erhalten.
- Lehrkraftzugang mit Umschalt + Enter und direkter Szenensprung funktionieren.
- Dies ist eine Chrome-Stichprobe, kein vollständiger Geräte- oder Safari-Test.

## Noch nicht praktisch geprüft

- Vollständige grafische Prüfung aller Szenen und Hotspotpositionen; Stadttor und Wohnviertel wurden in Chrome stichprobenartig geprüft.
- Physische Touchbedienung und iPad-Safari, Bildschirmrotation, Bildschirmtastatur.
- Gemessene Spielzeit in einer 7. Klasse (35–45 Min. ist Planungsziel).
- Abgleich mit zwei nicht verfügbaren Arbeitsblättern und `6. Stunde.pptx`.

Die CSS-Umsetzung berücksichtigt flexible Dialogbreiten, einspaltige Rätsel auf schmalen Bildschirmen, Touch-Schaltflächen, reduzierte Bewegung, Kontrast und sichtbaren Tastaturfokus. Das ersetzt keine reale Geräteprüfung.

Der verfügbare Cloud-Browser blockierte den lokalen HTTP-Testserver und lokale Datei-URLs. Diese Beschränkung wurde nicht umgangen. Die oben genannten Integrationstests laufen in Linkedom; sie sind keine Safari- oder Renderingtests.

## Erweiterung der Adventure-Oberfläche

Vollständiger DOM-Durchlauf nach Umbau aller Rätseloberflächen: 431 Prüfungen bestanden (425 Spielablauf und sechs Vollbildprüfungen); alle zwölf Rätsel und elf Orte erreichbar. Die sechs Siegel werden einzeln eingesetzt. Textentfernung und Vollbildschalter sind im Test berücksichtigt.

Die neue Bild- und Rätseloberfläche ist noch nicht in einem echten Browser oder auf iPad-Safari grafisch geprüft. Die oben dokumentierte Live-Prüfung bezieht sich auf die vorherige Veröffentlichung. Die Bereitstellung der Erweiterung wurde durch die automatische Freigabeprüfung gestoppt und benötigt ausdrückliche Zustimmung.


## Bonusspiele (Playwright/Chromium, automatisiert)

- Für jedes der acht Spiele gilt: Fundstelle anklicken, Spiel starten, automatisch bis zum Abschluss spielen, schließen. Geprüft wurde jedes Mal, dass nach dem Schließen keine Animation-Frames mehr laufen und dass der Hauptspielstand in `localStorage` byte-gleich bleibt. Bei allen acht Spielen erfüllt.
- Bildschirmgrößen: 1180×820 (iPad Air quer), 1024×768, 1366×1024, 1920×1080 und 820×560, mit Touch-Emulation (Pointer-Events). Wischgesten wurden über synthetische Pointer-Ereignisse getestet.
- Öffnen → Spielen → Schließen (✕, „Zurück“, Escape, Pause-Karte) → erneut öffnen: ohne Fehler, ohne weiterlaufende Timer.
- Circus Maximus erscheint erst nach Abschluss der Chronik, der Katakombenlauf erst nach dem Archiv-Rätsel.
- Die Haupt-Minispiele (z. B. „Das Türschloss“) öffnen weiterhin normal.
- Noch offen: Bedienung auf echtem iPad-Safari (Touch-Präzision, Bildrate) und Spielzeiten mit einer Klasse.
---

## Frühere Prüfprotokolle (gelten nur für die jeweilige alte Fassung)

# Prüfprotokoll – 23.09.2026

## Bestanden

- Syntaxprüfung: `node --check script.js` und `node --check data/game-data.js`.
- DOM-Integrationstest: **391 Prüfungen**, alle 12 Rätsel, alle 11 Orte, vollständiger regulärer Spielweg ohne Lehrkraft-Abkürzungen.
- Falsche und unvollständige Antworten blockieren den Fortschritt und geben erklärendes Feedback.
- Teilantworten, aktueller Ort, Siegel, Inventar und eigene Texte über Neuladen hinweg erhalten.
- Erste, zweite und dritte Hilfestufe; kein Überschreiten der dritten Stufe.
- Öllampe + Feuerstein kombinieren; Archiv erst mit ausgewähltem Schlüssel öffnen.
- Dunkelheit und fehlende Beweisstücke blockieren das Archivrätsel.
- Ereignis 311 und geöffnete Hauskirche; Lagerkarte vor Zeltzugang.
- Finale erst nach sechs eingesetzten Siegeln; Argumentationsbrücke erst nach Zeitstrahl.
- Lehrkraftzugang über langes Drücken (Pointer-Ereignis und Timer im DOM-Test), Rätsel zurücksetzen, alle Siegel geben, Finale direkt testen.
- Neustart leert Fortschritt und sperrt spätere Orte wieder.
- Beschädigter gespeicherter JSON-Inhalt verhindert den Start nicht.

## Live-Prüfung auf GitHub Pages

- Pages-Deployment erfolgreich (Run 35858658180).
- https://simfischer.github.io/im-zeichen-der-wende/ geöffnet.
- Startdialog, Wechsel vom Tor ins Wohnviertel, Szenengrafiken und Hotspots geprüft.
- Nach Neuladen wird Fortsetzen angeboten; aktueller Ort bleibt erhalten.
- Lehrkraftzugang mit Umschalt + Enter und direkter Szenensprung funktionieren.
- Dies ist eine Chrome-Stichprobe, kein vollständiger Geräte- oder Safari-Test.

## Noch nicht praktisch geprüft

- Vollständige grafische Prüfung aller Szenen und Hotspotpositionen; Stadttor und Wohnviertel wurden in Chrome stichprobenartig geprüft.
- Physische Touchbedienung und iPad-Safari, Bildschirmrotation, Bildschirmtastatur.
- Gemessene Spielzeit in einer 7. Klasse (35–45 Min. ist Planungsziel).
- Abgleich mit zwei nicht verfügbaren Arbeitsblättern und `6. Stunde.pptx`.

Die CSS-Umsetzung berücksichtigt flexible Dialogbreiten, einspaltige Rätsel auf schmalen Bildschirmen, Touch-Schaltflächen, reduzierte Bewegung, Kontrast und sichtbaren Tastaturfokus. Das ersetzt keine reale Geräteprüfung.

Der verfügbare Cloud-Browser blockierte den lokalen HTTP-Testserver und lokale Datei-URLs. Diese Beschränkung wurde nicht umgangen. Die oben genannten Integrationstests laufen in Linkedom; sie sind keine Safari- oder Renderingtests.

## Erweiterung der Adventure-Oberfläche

Vollständiger DOM-Durchlauf nach Umbau aller Rätseloberflächen: 431 Prüfungen bestanden (425 Spielablauf und sechs Vollbildprüfungen); alle zwölf Rätsel und elf Orte erreichbar. Die sechs Siegel werden einzeln eingesetzt. Textentfernung und Vollbildschalter sind im Test berücksichtigt.

Die neue Bild- und Rätseloberfläche ist noch nicht in einem echten Browser oder auf iPad-Safari grafisch geprüft. Die oben dokumentierte Live-Prüfung bezieht sich auf die vorherige Veröffentlichung. Die Bereitstellung der Erweiterung wurde durch die automatische Freigabeprüfung gestoppt und benötigt ausdrückliche Zustimmung.


## Bonusspiele (Playwright/Chromium, automatisiert)

- Für jedes der acht Spiele gilt: Fundstelle anklicken, Spiel starten, automatisch bis zum Abschluss spielen, schließen. Geprüft wurde jedes Mal, dass nach dem Schließen keine Animation-Frames mehr laufen und dass der Hauptspielstand in `localStorage` byte-gleich bleibt. Bei allen acht Spielen erfüllt.
- Bildschirmgrößen: 1180×820 (iPad Air quer), 1024×768, 1366×1024, 1920×1080 und 820×560, mit Touch-Emulation (Pointer-Events). Wischgesten wurden über synthetische Pointer-Ereignisse getestet.
- Öffnen → Spielen → Schließen (✕, „Zurück“, Escape, Pause-Karte) → erneut öffnen: ohne Fehler, ohne weiterlaufende Timer.
- Circus Maximus erscheint erst nach Abschluss der Chronik, der Katakombenlauf erst nach dem Archiv-Rätsel.
- Die Haupt-Minispiele (z. B. „Das Türschloss“) öffnen weiterhin normal.
- Noch offen: Bedienung auf echtem iPad-Safari (Touch-Präzision, Bildrate) und Spielzeiten mit einer Klasse.


## DOM-Durchlauf aktualisiert (`tests/playthrough.cjs`)

Der Durchlauf war seit den Sprechblasen und Minispielen veraltet und schlug schon vorher fehl („Guard opens scene dialogue“). Er ist jetzt an die aktuelle Oberfläche angepasst. 371 Prüfungen bestanden:

- Gespräche erscheinen als Sprechblase in der Szene.
- Rätsel sind gesperrt, bis alle Gespräche und Gegenstände eines Ortes angesehen wurden. Fortschrittsanzeige und Hinweistext werden geprüft.
- Jedes Rätsel mit Minispiel öffnet das Spiel, es gibt keinen Knopf „Ohne Spiel lösen“, und ein Sieg setzt das Siegel. Die Minispiele selbst sind im DOM-Test durch einen Platzhalter ersetzt; ihre Mechanik wurde in Chromium geprüft.
- Neuer Archivweg: Schriftrollen beim Archivar lesen, Lampe entzünden, Schlüssel wählen, Archiv lösen, Rollen ablegen – erst dann Ereignis 311.
- Bonusspiele: keine Fundstellen in den Szenen; das erste Rätsel schaltet ein Spiel im Notizbuch frei, nach dem Finale sind alle acht frei. Das Öffnen des Notizbuchs verändert den Spielstand nicht.
- Weiterhin geprüft: vollständiger Weg bis zum Finale, Neuladen, Hilfen, Inventar, Lehrkraftmodus, Neustart, beschädigter Spielstand, Vollbild.
- Gegenprobe: Wird die Sperre oder „Ohne Spiel lösen“ wieder eingebaut, schlägt der Test fehl.
- Ausführen: `npm install --no-save linkedom`, dann `node tests/playthrough.cjs` (ebenso `tests/bonus-unlocks.cjs`, beide bestanden).

## Kurierfahrt entfernt (26.09.2026)

Das Minispiel „Die Kurierfahrt von 313“ ist entfernt. Die Besitztruhe in der Stadt 313 öffnet jetzt das klassische Zuordnungsrätsel „Die Besitztruhe“.

- `npm test` führt alle vier Tests aus (`continuation`, `bonus-unlocks`, `archive-flow`, `playthrough`); `linkedom` steht als devDependency in `package.json`.
- `tests/playthrough.cjs` (401 Prüfungen, bestanden) prüft zusätzlich: Für „change“ ist kein Minispiel registriert, die Besitztruhe öffnet das klassische Rätsel, „Kurierfahrt“ erscheint nirgends in der Oberfläche. Ein alter Spielstand mit fremden Feldern und einer unbekannten Bonus-ID lädt fehlerfrei, das Notizbuch zeigt keinen Kurierfahrt-Eintrag, die unbekannte ID wird verworfen.
- `tests/bonus-unlocks.cjs` und `tests/archive-flow.cjs` (67 Prüfungen) bestanden unverändert; es bleibt bei acht Bonusspielen.
- Chromium: Spielstand in der Stadt 313 geladen, Besitztruhe geöffnet, Notizbuch geprüft; keine JavaScript-Fehler. (Die fehlenden EB-Garamond-Schriftdateien unter `assets/fonts/` liefern wie vorher 404; das ist unabhängig von dieser Änderung.)
