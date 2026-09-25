# Siegelgrafiken (optional)

Das Spiel zeichnet die sechs Erkenntnis-Siegel und das Siegelrad selbst als geprägte SVG-Medaillons (`seals.js`).
Wer später gemalte Grafiken einsetzen möchte, legt sie hier ab und trägt sie in `data/game-data.js` ein:

```js
window.GAME.sealAssets={dir:'assets/ui/seals/',available:['konflikt','quelle','wheel-frame']};
```

Nur eingetragene Dateien werden geladen. Fehlende Dateien erzeugen deshalb keine 404-Fehler.

| Datei | Inhalt | Format |
|---|---|---|
| `seal-konflikt.png` | Siegel „Konflikt“ – zwei gekreuzte Schwerter | quadratisch, transparent, mind. 512 × 512 px |
| `seal-quelle.png` | Siegel „Quelle“ – Schriftrolle | wie oben |
| `seal-anzeige.png` | Siegel „Anzeige“ – Wachstafel mit Griffel | wie oben |
| `seal-staat.png` | Siegel „Staat“ – Säule mit Lorbeer | wie oben |
| `seal-312.png` | Siegel „312“ – ovaler Schild mit Christusmonogramm | wie oben |
| `seal-wende.png` | Siegel „Wende“ – Brücke mit Wendebogen | wie oben |
| `seal-wheel-frame.png` | Siegelrad ohne Siegel (Stein, Lorbeer, Bronzescheibe); Fassungen bei 0°, 60° … 300° (oben beginnend), Mittelpunkt-Abstand 25,3 % der Bildbreite | quadratisch, transparent, mind. 1200 × 1200 px |

Vorgesehen, aber derzeit nicht nötig: `seal-slot.png` (leere Fassung) und `seal-reward-glow.png` (Lichtschein der Belohnung). Beide sind im Code als CSS/SVG umgesetzt.

Stil: handgezeichnet, warm, Bronze/Gold mit Relief und Perlrand, leicht unregelmäßig. Keine flachen Icons, keine Sterne oder Münzen.
