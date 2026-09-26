# Das geheime Zeichen – Grafiken (optional)

Übergangslösung ohne diese Dateien: Das Forum-Gemälde `assets/backgrounds/v3-forum.png` ist die Szene. Die Chronistin und der Mann im roten Mantel sind dort Teil des Bildes. Sie stehen groß im Mittelgrund und haben echten Bodenkontakt. Die Zeichen, die Holztafel und die Sprechblase zeichnet `bonus/zeichen.js` selbst.

Fertige Dateien hier ablegen und in `bonus/zeichen.js` unter `ART.available` eintragen, zum Beispiel `available:['scene','symbols']`. Nur eingetragene Dateien werden geladen, fehlende erzeugen deshalb keine 404-Fehler.

| Schlüssel | Datei | Inhalt und Aufbau |
|---|---|---|
| `scene` | `secret-signs-scene.png` | Markt- oder Forumsszene mit Marktstand, Kisten, Tüchern, Amphoren, Steinblöcken; zwei bis drei Figuren **im Bild** (Hauptfigur links oder rechts im Vordergrund). Seitenverhältnis 3:2, mind. 1536 × 1024 px. **Wichtig:** Für ein neues Bild in `LAYOUTS.custom` eigene Zeichenstellen eintragen (x/y in %, Machart `wood`, `stone`, `cloth`, `paint`, `scratch`, `lamp` oder `tablet`, kurze Ortsangabe) sowie die Position der erklärenden Figur (`guide`). |
| `characters` | `secret-signs-characters.png` | Optional: Figuren als transparente Ebene **in voller Szenengröße** (gleiche Pixelmaße wie die Szene), damit Stand und Maßstab exakt passen. Keine einzelnen Freisteller. |
| `stall` | `secret-signs-stall.png` | Optional: Marktstand als transparente Ebene in voller Szenengröße. |
| `symbols` | `secret-signs-symbols.png` | Zeichen im Raster 4 × 2: Fisch, Anker, Taube, Chi-Rho, Adler, Lorbeer, Rosette (letztes Feld frei). Transparent, als Relief- oder Ritzzeichnung. |
| `panel` | `secret-signs-panel.png` | Hölzerne Hängetafel für „Gesucht“ (wird gestreckt, Rand ruhig halten). |
| `guide` | `secret-signs-npc-guide.png` | Kleines Brustbild der erklärenden Figur für die Sprechblase (quadratisch). |

Stil: handgezeichnet, warm, gleiche Farbwelt wie die übrigen Szenen. Keine Texte ins Bild malen.
