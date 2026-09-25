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


## Szenen-Überarbeitung (Branch `feature/visual-minigame-overhaul`)

`npm test` führt alle Tests aus; Ergebnis beim Abschluss:

- `tests/continuation.cjs`: bestanden.
- `tests/playthrough.cjs`: 359 Prüfungen bestanden. Neu: Stadtbild und Entdeckungsszene, Rätsel erst nach dem Entdecken, Zähler, richtige Spieltypen für Stadt, Konzil und Chronik, Belohnung „Verfügung von 313“ bleibt.
- `tests/bonus-unlocks.cjs`: bestanden.
- `tests/scenegames.cjs` (neu): 110 Prüfungen. Stadt: alle fünf Veränderungen, sieben Tafeln, falsche 313-Aussage mit genau der vorgegebenen Rückmeldung, Abschluss erst bei vollständiger Zuordnung. Konzil: sechs Runden, falsche Antworten mit fachlicher Reaktion ohne Weiterschalten, Synthese, Sieg. Chronik: alle sechs Jahre, falsche Zuordnung mit Rückmeldung, Transferfrage erst bei vollständiger Chronik, falsche und richtige Stelle. Alle neuen Asset-Pfade im Code und im Repository, Ersatzdarstellung vorhanden.
- `tests/amphoren.cjs` (neu): 26 Prüfungen. Keine alten Sprites, neue Grafiken werden geladen, Händlergröße, Touch-Ziehen und Tippen, Fangen über dem Korb, kein Fangen daneben, Begriffe der dritten Runde.

Zusätzlich in Chromium (Playwright) geprüft: alle drei Szenen-Rätsel real durchgespielt (Spielstand gespeichert, Belohnungsfenster erscheint), Ziehen mit Pointer Events, Größen 1180×820, 1024×600 und 820×1180 ohne Scrollen des Fensters, Ersatzdarstellung bei blockierten Grafiken, Amphoren-Chaos auf 1180×820 und 1024×768 (nach dem Schließen keine Animation mehr, Spielstand unverändert). Keine JavaScript-Fehler; die einzigen 404-Meldungen betreffen die optionalen Schriftdateien in `assets/fonts/`, die schon vorher fehlten.

Noch offen: echtes iPad-Safari (Touch-Genauigkeit, `:has()` wird ab iPadOS 15.4 unterstützt) und ein Unterrichtstest.

- Nachtrag: Kurierfahrt als Bonusspiel (Notizbuch-Start, Sieg, nach dem Schließen keine Animation mehr, Spielstand unverändert) und Schrift EB Garamond (normal und kursiv geladen, keine 404-Meldungen mehr) in Chromium geprüft. `npm test` bestanden (Bonus-Test jetzt mit neun Spielen).


## Quellenkritik und Begründungen ohne Freitext (25.09.2026)

`npm test` bestanden: continuation, playthrough (397 Prüfungen), bonus-unlocks, scenegames (110), amphoren (26) und neu `tests/sources-and-reasons.cjs` (99 Prüfungen).

- Schild/Vision: Jede Aussage hat genau eine Kategorie. Jede falsche Kategorie hat eine eigene fachliche Rückmeldung. Die Berichtsaussage wird als „später berichtet“ gewertet, „tatsächlich gesehen“ als „nicht sicher feststellbar“. Minispiel und klassische Fassung stimmen überein.
- Echo der Quellen: Mehrdeutige Behauptungen (Neros Brandstiftung, Brandlegung durch Christen) akzeptieren „unsicher“ und „nicht sicher feststellbar“. Die Existenz antiker Berichte gilt als gut belegt, nicht jedes Detail darin.
- Kein Textfeld im Spielcode. Die einzige Texteingabe ist der Fortsetzungscode. Keine Längenbedingung für Fortschritt.
- Waage und Brücke: Ohne Begründung kein Abschluss. Eine falsche Begründung zeigt ihre Rückmeldung und schaltet nicht frei. Eine richtige wird als Text gespeichert und schließt ab. Alle Rätsel sind ohne Tippen lösbar.
- Alte Spielstände mit Freitext bleiben gültig. Der Fortschritt bleibt erhalten, der alte Text erscheint im Notizbuch als „frühere Notiz“.
- Chromium (Playwright), 1024×768 und 768×1024: Waage und Brücke real durchgespielt, Schildpuzzle gelöst und Quiz mit falschen Antworten geprüft. Aussage, Antworten und Rückmeldung sind ohne Scrollen sichtbar. Keine JS-Fehler.


## Siegelsystem (25.09.2026)

`npm test` bestanden, neu `tests/seals.cjs` (71 Prüfungen). Der Durchlauf (`tests/playthrough.cjs`) setzt die Siegel jetzt über die neuen Fassungen.

- Designsystem: eigenes Motiv und eigene Farbe je Siegel, gemeinsame SVG-Definitionen nur einmal im Dokument, Bildbeschreibung je Medaillon, vier Zustände mit Klasse, Beschriftung und Ansage.
- Belohnung: Siegel wird wie bisher vergeben. Banner, großes Medaillon und Sammlung erscheinen, „Weiter erkunden“ ist sofort verfügbar. Erneutes Lösen vergibt kein doppeltes Siegel und zeigt keine Animation.
- Siegelrad: Setzen ohne Auswahl und in eine falsche Fassung wird abgelehnt, erneutes Antippen hebt die Auswahl auf, alle sechs Siegel setzen `sealsPlaced`. Ein alter Spielstand mit zwei eingesetzten Siegeln öffnet korrekt und lässt sich abschließen. Mit weniger als sechs Siegeln erscheint die Sammlung mit leeren Fassungen.
- Bilddateien: Ein eingetragenes Bild ersetzt nur sein eigenes Siegel. Ohne Eintrag werden keine Bilddateien angefordert.
- Chromium (Playwright) mit Touch-Eingabe (`tap`) bei 1180×820, 820×1180, 1024×768, 768×1024 und 390×844: alle sechs Siegel per Antippen eingesetzt, kein Scrollen im Siegelrad, keine horizontale Verschiebung, Fassungen 119–163 px (iPad), Beschriftung 14,6–16 px, keine JS-Fehler. Belohnungsfenster bei 1024×768, 768×1024 und 390×844 geprüft.
- Noch offen: echtes iPad-Safari (`:has()` und Container-Einheiten ab iPadOS 16).


## Argumentationsbrücke (25.09.2026)

`npm test` bestanden, neu `tests/argbridge.cjs` (107 Prüfungen). Geprüft werden:

- vier Satzanfänge mit je einer richtigen und zwei falschen Platten, alle mit fachlicher Rückmeldung
- die Kernaussage in den richtigen Platten
- vier Vereinfachungen und zwei tragfähige Aussagen, eine beste Inschrift
- nie mehr als drei Platten gleichzeitig
- falsche Platten und Inschriften bauen nichts und speichern nichts
- keine Texteingabe
- die gewählte Inschrift wird fürs Notizbuch gemeldet, der Sieg genau einmal
- eingetragene Grafiken ersetzen die gezeichneten; ohne Eintrag wird keine Datei angefordert

Der Durchlauf öffnet das Finale jetzt als Brückenszene.

Chromium (Playwright) mit Touch-Eingabe bei 1024×768, 1180×820, 768×1024 und 820×1180: alle drei Phasen gespielt, einschließlich falscher Platten, tragfähiger Aussage und falscher Inschrift.

- Die Rätselseite scrollt nicht.
- Platten sind 52–78 px hoch, Schrift 14,5–18,5 px.
- Das Rätsel wird gespeichert, das Ende der Chronik erscheint, die gewählte Inschrift steht im Spielstand.
- Keine JS-Fehler.


## Bonusspiel „Das geheime Zeichen“ (25.09.2026)

`npm test` bestanden, neu `tests/zeichen.cjs` (46 Prüfungen). Geprüft werden:

- keine laufenden Mini-Figuren mehr; die Figuren sind im Szenenbild beschrieben
- vier Runden in fester Folge; drei Zielzeichen auf der Holztafel
- Zeichen an ihren Stellen in unterschiedlicher Machart; Tafel füllt sich
- Adler, Lorbeer und Rosette erhalten eine fachliche Rückmeldung; das Christusmonogramm wird mit Konstantin eingeordnet
- vier Antworten ohne Texteingabe, Erklärung bei falscher Antwort
- der Sieg wird nur im Bonusfortschritt gespeichert, der Hauptspielstand bleibt unverändert
- eingetragene Grafiken (Szene, Figurenebene, Tafel, Zeichenbogen) werden verwendet; ohne Eintrag wird keine Datei angefordert

Chromium (Playwright) mit echter Touch-Eingabe (`tap`) bei 1024×768, 1180×820, 768×1024 und 820×1180:

- alle vier Runden gespielt, einschließlich Fehltipps (Hinweis nach drei Fehlversuchen), Lorbeer und falscher Antwort
- Tippbereiche 61–80 px
- Fenster scrollt nicht; keine JS-Fehler
- Hochformat: Tafel, Sprechblase und Antworten unter der Szene
