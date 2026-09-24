# Asset-Map – Im Zeichen der Wende

Dieses Paket ist für das Repository `SimFischer/im-zeichen-der-wende` vorbereitet.

## Zielstruktur

### Die geöffnete Stadt
- `assets/minigames/open-city/open-city.png`
  - Neuer Hintergrund für die Szene nach 313.
  - Sichtbar: geöffnete christliche Räume, Kirchenbau und weiterhin vorhandene römische Kulte.

### Ein Band zwischen Kirche und Reich
- `assets/minigames/council/council-scene.png`
  - Hintergrund für die überarbeitete Konzil-/Beratungsszene.
- `assets/minigames/council/council-officials.png`
  - Figuren-/Amtsträger-Sheet für sichtbare Gesprächspartner im Konzil.

### Die Zeitmechanik
- `assets/minigames/timeline/chronicle-room.png`
  - Hintergrund als Chronistenraum mit großer aufgeschlagener Chronik.
- `assets/minigames/timeline/timeline-assets.png`
  - Jahresmedaillons, Ereignisbilder und Chronik-UI-Elemente.

### Amphoren-Chaos
- `assets/minigames/amphora/amphora-dock.png`
  - Neuer Hafen-/Lagerhaus-Hintergrund.
- `assets/minigames/amphora/amphora-assets.png`
  - Amphoren, Körbe, Kisten und Figuren im Stil des Gesamtspiels.
- `assets/minigames/amphora/amphora-merchant.png`
  - Separat ausgeschnittener Händler für die Spielfigur.
  - Transparenter Hintergrund.
  - Der Fangkorb kann weiterhin separat durch Canvas/CSS dargestellt werden.

## Einbau

Den Inhalt dieses ZIPs im Stammverzeichnis des GitHub-Repositories entpacken.
Die Ordnerstruktur beginnt bereits mit `assets/`.

Danach sollte der Codex-Umbau genau diese Pfade verwenden.

## Hinweise

- Die Figuren- und Objekt-Sheets haben transparenten Hintergrund.
- Die Hintergrundbilder sind 1672 × 941 px und für eine breite iPad-Spielansicht ausgelegt.
- Für Touch-Interaktionen sollten Hotspots unabhängig von der sichtbaren Objektgröße großzügig angelegt werden.
- `assets/minigames/leute.webp` und `assets/minigames/forum-blur.jpg` sollten im Amphorenspiel nicht mehr als primäre Darstellung verwendet werden.
