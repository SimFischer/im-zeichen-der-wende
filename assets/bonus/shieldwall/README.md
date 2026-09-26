# Schildwall – Grafiken (optional)

Übergangslösung ohne diese Dateien:

- **Kulisse:** Ausschnitt aus dem Lager-Gemälde (`assets/backgrounds/v3-camp.png`) mit Tiber, Milvischer Brücke und Rom, abgedunkelt zur Abendstimmung.
- **Gezeichnet in `bonus/schildwall.js`:** Ufer, Standarten, der Trupp aus fünf Legionären, Schilde, Pfeile und Effekte.

Fertige Dateien hier ablegen und in `bonus/schildwall.js` unter `ART.available` eintragen, z. B. `available:['bg','arrows']`. Nur eingetragene Dateien werden geladen (keine 404-Fehler).

| Schlüssel | Datei | Inhalt und Aufbau |
|---|---|---|
| `bg` | `shieldwall-bg.png` | **Wichtigste Datei.** Tiberufer vor Rom im Abendlicht, Milvische Brücke gut sichtbar (linkes oder mittleres Drittel), Lager/Standarten angedeutet, untere 40 % ruhig (dort steht der Trupp). 16:9, mind. 1920 × 1080 px. |
| `squad` | `shieldwall-squad.png` | Trupp ohne Schilde, transparent, Füße am unteren Rand, Breite = Formationsbreite. |
| `left`, `up`, `right` | `shieldwall-shields-left.png`, `-up.png`, `-right.png` | Schildreihe in der jeweiligen Stellung, gleiche Maße wie `squad`, wird darüber gelegt. |
| `arrows` | `shieldwall-arrows.png` | Ein Pfeil, Spitze rechts, transparent (Seitenverhältnis etwa 4 : 1). |
| `ui` | `shieldwall-ui.png` | Tafel hinter Zeit und Bestzeit (wird gestreckt). |
| `hit`, `impact`, `bridge`, `banners`, `gameover` | `shieldwall-hit.png`, `-impact.png`, `-bridge-silhouette.png`, `-banners.png`, `-gameover.png` | Vorgesehen für spätere Feinheiten; derzeit gezeichnet bzw. nicht nötig. |

Stil: handgezeichnet wie die übrigen Szenen, Dämmerung, rote Scuta mit goldener Bemalung. Kein Blut, keine Verletzten.
