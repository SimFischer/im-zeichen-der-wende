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
