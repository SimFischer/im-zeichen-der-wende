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
