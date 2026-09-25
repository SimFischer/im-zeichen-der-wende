# Rom brennt! – Grafiken (optional)

Ohne diese Dateien zeichnet `bonus/rombrennt.js` alles selbst: die Abendkulisse mit ferner Stadt und Rauchsäulen, Häuser mit Putz, Fensterläden und Ziegeldächern, Pflaster, Markisen, Kisten, Leitern, Brunnen, Zisterne, Feuer und die Figur mit Wasserkrug.
Fertige Dateien hier ablegen und in `bonus/rombrennt.js` unter `ART.available` eintragen, zum Beispiel `available:['bg','player']`. Nur eingetragene Dateien werden geladen, fehlende erzeugen deshalb keine 404-Fehler.

| Schlüssel | Datei | Inhalt und Aufbau |
|---|---|---|
| `bg` | `rome-burns-bg.png` | Hintergrund: Skyline Roms bei Abendrot mit Rauch. Wird waagerecht wiederholt und mit Parallaxe verschoben; Höhe = Spielhöhe. |
| `tiles` | `rome-burns-tiles.png` | Nahtlose Putz- oder Mauertextur für die Hausfassaden (wird als Muster gekachelt). |
| `player` | `rome-burns-player.png` | Figur als Streifen mit 8 gleich breiten Bildern: Stand, Laufen 1–4, Sprung, (frei), Klettern. Blickrichtung rechts, Füße am unteren Rand. |
| `jar` | `rome-burns-water-jar.png` | Wasserkrug, den die Figur trägt. |
| `fire` | `rome-burns-fire.png` | Feuer als Streifen mit 4 Bildern, Flammenfuß unten. |
| `fg` | `rome-burns-fg.png` | Vordergrund (Rauch, Balken, Pflanzen) mit transparentem Mittelteil, wird waagerecht wiederholt. |
| `ui` | `rome-burns-ui.png` | Tafel hinter Zeit und Bestzeit (wird gestreckt). |
| `smoke`, `platforms`, `goal` | `rome-burns-smoke.png`, `rome-burns-platforms.png`, `rome-burns-goal.png` | Vorgesehen für spätere Feinheiten; derzeit gezeichnet. |

Das Level (Kacheln, Leitern, Dächer) steht in `LEVEL` in `bonus/rombrennt.js`. Wer es ändert, prüft mit `node tests/rombrennt.cjs`, dass es keine Sackgassen gibt.

Stil: handgezeichnet, warme Brand- und Abendfarben, römische Häuser, keine Kachel- oder Pixeloptik.
