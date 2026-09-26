# Argumentationsbrücke – Grafiken (optional)

Die Szene läuft ohne diese Dateien: `argbridge.js` zeichnet Brücke, Platten und Symbolmedaillons selbst und nutzt die Basilika (`assets/backgrounds/v3-basilica.png`) als Kulisse.
Fertige Grafiken hier ablegen und in `data/game-data.js` eintragen, zum Beispiel:

```js
window.GAME.minigames.bridge.art.available=['scene','icons'];
```

Nur eingetragene Dateien werden geladen. Fehlende Dateien erzeugen deshalb keine 404-Fehler.

| Schlüssel | Datei | Inhalt und Aufbau |
|---|---|---|
| `scene` | `argument-bridge-scene.png` | Hintergrund: Halle der Basilika, 16:9 (mind. 1920 × 1080 px), Mitte ruhig für die Brücke |
| `segments` | `argument-bridge-segments.png` | Brücke als ein Bild im Seitenverhältnis 1060 : 410, zwei Zeilen untereinander: oben unvollständig (vier leere Bögen), unten fertig. Ersetzt die gezeichnete Brücke; Bögen an denselben Stellen (je 250 Einheiten breit, Rasterbeginn bei x = −30) |
| `tokens` | `argument-bridge-tokens.png` | Inschriftplatte in drei Zuständen nebeneinander: normal, richtig, gesprungen |
| `icons` | `argument-bridge-icons.png` | Symbolmedaillons im Raster 5 × 2, Reihenfolge: Ketten, Erlass, Basilika, Wendebrücke, Krone, Menschen, Flamme, Tempel, Herz, Namensschild |

Stil: handgezeichnet, warm, römisch-spätantik, Stein und Bronze wie das Siegelsystem. Keine Texte in die Bilder malen – alle Beschriftungen sind HTML.
