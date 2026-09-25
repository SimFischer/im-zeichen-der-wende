# Qualitätsprüfung – iPad, Fachlichkeit, Didaktik (25.09.2026)

Branch: `quality/ipad-review` (auf Basis von `feature/visual-minigame-overhaul`)

## Vorgehen

- **Automatische Layout-Prüfung** in Chromium, bei 1024×768, 1180×820, 1366×1024 und 820×1180 (Hochformat). Geprüft wurden:
  - alle 12 Szenen
  - alle 12 Rätsel, jeweils Start- und Spielzustand
  - Karte, Notizbuch, Botenbeutel und Menü
  - alle 9 Bonusspiele, jeweils Startkarte und Spiel
- **Gemessen** wurde je Ansicht:
  - Schrift unter 13 px
  - Touchziele unter 40 px
  - abgeschnittener Text
  - Text, der von anderen Elementen verdeckt wird
  - Scrollen im Fenster
  - JS-Fehler und fehlgeschlagene Ladevorgänge
- **Inhalt:** Alle rund 740 Texte aus `data/game-data.js` und die Texte der Bonusspiele wurden fachlich gegengelesen.

## Umgesetzt

**Layout und Touch** (`ipad.css`, wird zuletzt geladen)
- Untergrenzen für Schrift und Touchziele:
  - Schrift mindestens 12,5–13,5 px: Walzen, Seilzug-Etiketten, Kartenbrett, Stadtkarte, „Rätsel gelöst“, Kicker, Tempo- und Pausenknöpfe
  - Touchziele mindestens 40–48 px: Schließen, Walzenpfeile, Holzklötze, Kartenetiketten, Griff, Tempo- und Pausenknöpfe
- Minispiel-Fenster mit kompakterer Kopfzeile. Das Kartenbrett passt in der Höhe, „Karte prüfen“ und „Zurück“ sind ohne Scrollen sichtbar.
- **Startkarten der Minispiele:**
  - Der doppelte Titel ist entfernt.
  - Der Startknopf bleibt immer sichtbar. Vorher war „Lampe hochhalten“ im Archiv bei 1024×768 abgeschnitten.
  - Die Startkarte des Archivs ist kürzer.
- **Hochformat:** Szenen standen vorher klein zwischen großen leeren Flächen. Jetzt füllen sie die Höhe und lassen sich seitlich verschieben. Beim Ortswechsel steht die Mitte im Blick, dazu erscheint kurz der Hinweis „Zum Umsehen wischen“.
- Rom brennt!: Zeittafel im Hochformat lesbar.
- Schildwall: Bedienhinweis nicht mehr zerquetscht.

**Didaktik und Spielerlebnis**
- **Die Waage des Kaisers** ist jetzt eine eigene Szene. Vorher war sie das letzte Rätsel mit langer Formular-Ansicht und rund 1 000 px Scrollen.
  - Sieben Karten kommen in die Schalen Glaube, Politik oder Beides, der Waagebalken neigt sich.
  - Mehrdeutige Karten sind in mehreren Schalen richtig. Eindeutige Fehlgriffe erhalten eine fachliche Rückmeldung, zum Beispiel: „Persönliche Überzeugung ist kein politisches Ziel …“.
  - Danach wählt man eine Begründung. Die gewählte Begründung steht im Notizbuch.
  - Kein Freitext, alle 12 Rätsel sind jetzt Szenen.
- **Vorher/Nachher:** Die falsche Tafel „313 … einzige erlaubte Religion“ zeigte ein durchgestrichenes Symbol und verriet damit die Lösung. Sie hat jetzt ein neutrales Erlass-Symbol.
- **Kürzere Texte:** Die Waage hat nur noch einen Satz Anleitung.

**Fachliche Präzisierungen**
- **Chronistin:** Hauptquelle für die Verfolgung unter Nero ist Tacitus, christliche Autoren erst später. Vorher stand, auch Christen selbst hätten davon geschrieben.
- **Diokletian:** „die letzte große und besonders harte Verfolgung“ statt „die längste und härteste“. Die neue Formulierung vermeidet einen unnötigen Superlativ.
- **Nicäa:** „Bischöfe aus vielen Teilen des Reiches – die meisten kamen aus dem Osten“ statt „aus dem ganzen Reich“.
- **Kontrolleur:** „Kaiser Decius hat befohlen …“. Damit ist die Opferpflicht zeitlich verortet.
- **Konzil:** „Vor gut zwanzig Jahren“ (303 → 325) statt „vor wenigen Jahrzehnten“.
- **Brücke, Phase B:** „beschreibt die Lage differenziert“ statt „Genau so war es“, damit nicht zu viel Gewissheit behauptet wird.

**Tests**
- Neu:
  - `tests/ipad-layout.cjs`: Lade-Reihenfolge, Untergrenzen, Hochformat, keine verräterischen Symbole
  - Waage-Prüfungen in `tests/scenegames.cjs`
- `tests/archive-flow.cjs` gehört jetzt zu `npm test`.

## Geprüft und für gut befunden (keine Änderung nötig)

- **Chronologie** 64, um 112, 249/250, 257/258, 303, 311, 312, 313, 325, 337. Theodosius ist als Wegbereiter der Staatsreligion genannt.
- **Quellenkritik:** gut belegt, unsicher und nicht sicher feststellbar werden klar unterschieden, bei der Vision später berichtet und nicht sicher feststellbar.
- **Verfolgung:** lokal im 1.–2. Jahrhundert, staatliche Opferpflicht unter Decius, systematisch ab 303. Die Mailänder Vereinbarung wird korrekt nicht als Staatsreligion dargestellt.
- **Kein Pflicht-Freitext:** Einzige Texteingabe ist der Fortsetzungscode.

## Bewusst nicht umgesetzt (Empfehlungen)

1. **Gemalte Grafiken** für Rom brennt!, das geheime Zeichen (eigene Marktszene) und die Argumentationsbrücke. Die Pfade und READMEs liegen bereit.
2. **Hub-Hotspots im Hochformat:** Ausgänge am Bildrand liegen jetzt außerhalb des ersten Blicks, man erreicht sie per Wischen. Eine eigene Pfeilleiste wäre komfortabler.
3. **Bonusspiele Tiber, Wagen, Circus** sind spielerisch gut, fachlich aber dünn. Ein Satz Einordnung auf der Siegkarte ist vorhanden. Mehr Fachinhalt würde sie verlängern.
4. **Test auf echten iPads** mit Safari, dazu ein Unterrichtstest zur tatsächlichen Spieldauer (geplant 35–45 Minuten).
5. **Fachliche Endabnahme** der Texte durch eine Fachkollegin oder einen Fachkollegen.
