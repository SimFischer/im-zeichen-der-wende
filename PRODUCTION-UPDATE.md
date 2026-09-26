# Produktionsrunde: Assets, direkte Bedienung und Abschluss

Arbeitsgrundlage: Repository-Stand `5678145`; die zwischenzeitlich auf `main` hinzugekommene Korrektur `f9908d5` an den Hotspot-Beschriftungen wurde ebenfalls übernommen. Das Produktionspaket wurde einschließlich `README.md` und `ASSET-MAP.json` geprüft. Seine Dateien unter `assets/` haben Vorrang vor `base/`.

## A. Geänderte Dateien

| Datei | Änderung |
| --- | --- |
| `index.html`, `production.css` | Abschließende Gestaltungsschicht; Bildflächen, lesbarer HTML-Text, responsive Satzspiegel, direkte Touchziele und unverzerrte Grafiken. |
| `minigames.js` | Forum-Schilder und Rückmeldungsbereich; neue Figuren, Stempel und Schildgrafik; Archivobjekte direkt untersuchen; Kartenmarker ohne verschachtelte Buttons; Timer und Animationsframes aufräumen. |
| `scenegames.js` | Chronik als Buch mit sechs responsiven Schreibfeldern; gespeicherte Verriegelungen bleiben erhalten; Zielaktion vor dekorativen Kartenelementen behandeln; Timer aufräumen. |
| `argbridge.js` | Verzögerte Aktionen verwenden die gemeinsame, beim Schließen aufgeräumte Zeitsteuerung. |
| `data/game-data.js` | Zielrechtecke der bestätigten Karte und Archivobjekte; neue Schildgrafik; Aufgabenbeschreibung passend zur Buch-Chronik. Historische Aussagen und Lösungen bleiben erhalten. |
| `script.js` | Schriftrollen mit stationärem Bild und eigenem Textbereich; Abschlussstatus erst am Sequenzende; abgeschlossene Spielstände beim Fortsetzen wieder in der Endansicht. |
| `finale.js` | Vollständige Chronik, sechs Rückblicke zu je 2,2 Sekunden, getrennte Bonusbelohnung, drei Endaktionen, Fokusbegrenzung und inaktiver Hintergrund. |
| `bonusgames.css`, `closeups.css`, `layout.css`, `readability.css`, `scenes.css`, `seals.css`, `world.css` | Hover ausschließlich für Geräte mit echtem Hover und feinem Zeiger; Tastaturfokus bleibt separat erhalten. Bestehende Hotspot-Korrektur berücksichtigt. |
| `tests/closeups.cjs`, `tests/production-browser.cjs` | Aktualisierte Asset- und Interaktionstests sowie echte Browserprüfungen mit Maus und emuliertem Touch. |

## B. Neue Assets

Unverändert aus dem bevorzugten `assets/`-Ordner des Produktionspakets:

- `assets/characters/chronistin.png`
- `assets/puzzles/forum/categories/gut-belegbar.png`
- `assets/puzzles/forum/categories/unsicher.png`
- `assets/puzzles/forum/categories/nicht-sicher-feststellbar.png`
- `assets/puzzles/archive/schriftrolle-grosse-textflaeche.png`
- `assets/puzzles/camp/milvische-bruecke-karte.png`
- `assets/puzzles/office/siegelstempel-sheet.png`
- `assets/puzzles/vision/chi-rho-schild.png`
- `assets/puzzles/timeline/chronik-sechs-eintraege.png`
- `assets/finale/chronik-finale-vollstaendig.png`
- `assets/finale/bonusspiele-hinweis.png`
- `assets/finale/siegelmedaillons-sheet.png`

Zusätzlich direkt als Vektorgrafik erstellt: `assets/puzzles/sacrifice/riddle-board.svg`. Die drei Antworten am letzten Riegel stehen als HTML auf vollständigen, aufrechten Holztafeln. Die Grafik enthält keinen eingebrannten Text.

## C. Ersetzte Darstellungen

| Vorher | Jetzt |
| --- | --- |
| Kleine Forum-Fächer mit Emoji-Symbolen | Große Materialschilder aus dem Paket, HTML-Beschriftung, feste Rückmeldungszone zwischen Aussage und Auswahl. |
| Drei gerahmte Archivrollen mit variierenden Schreibflächen | Eine große, unverzerrte Papyrusrolle mit identischem sicheren Textbereich auf allen drei Seiten. |
| Altes Kartenbrett `camp/map-board.webp` | Ausschließlich die bestätigte unbeschriftete Tiberkarte; HTML-Marker werden auf Stadt, Fluss, Brücke und Heere gesetzt. |
| Kleine Jahresmedaillons im Zeitrad und separates Textfeld | Sechs direkt in den Buchseiten liegende Jahres- und Ereignisfelder. |
| Gestreckte Holztafeln beim letzten Seilzug-Riegel | Drei vollständige Tafeln im natürlichen Hochformat. |
| Ältere Chronistin, einzelne Stempel und Schild | Die entsprechenden neuen Produktionsgrafiken. |
| Breites altes Finalbuch mit darüberliegendem Abschluss | Vollständige neue Chronik; Belohnung und Aktionen daneben, auf schmalen Ansichten darunter. |

Keine bestehenden Inhalte oder Assets wurden gelöscht. Weiter verwendete Szenenbilder, Mosaikgrafiken, Siegelbedeutungen und Notizbucheinträge bleiben erhalten.

## D. Konkrete Bedienungsverbesserungen

- Ein Tipp auf ein Archivobjekt beleuchtet und untersucht es sofort. Vorheriges Hover oder ein zusätzlicher Beleuchtungstipp ist nicht erforderlich.
- Kartenziele besitzen echte Rechtecke über den dargestellten Gegenständen. Der Marker ist nach dem Einsetzen reine Dekoration innerhalb eines einzigen Zielbuttons.
- Dekorative Bilder, Canvas-Licht, Siegelgrafiken und Marker fangen keine Eingaben ab.
- Gedrückte Karten-, Archiv- und Siegelziele behalten ihre Position. Allgemeine Button-Animationen verschieben die Trefferfläche nicht mehr unter Maus oder Finger.
- Gemeinsame Auswahl-/Ablagelogik behandelt ein bereits gewähltes Element direkt am Ziel; abgelegte Dekoration blockiert das Ziel nicht.
- Die Chronik bleibt vertikal scrollbar, ohne ihre Schrift zu verkleinern. Die Kopfzeile und Schließen-/Zurück-Aktionen bleiben erreichbar.
- Falsche Chronikzuordnungen verraten weiterhin keine Lösung. Fehler je Tafel und bereits verriegelte Einträge überleben Schließen und Neuladen.
- Endaktionen: **Stadt weiter erkunden**, **Neues Spiel** mit bestehender Sicherheitsabfrage und **Notizbuch öffnen**. Kein automatischer Rücksprung ins Stadttor.

## E. Direkte Ziele

Geprüft werden insbesondere Kirchenmodell und weitere Archivspuren, alle sechs Kartenorte, alle sechs Siegelplätze sowie Bote und Beraterin. Das zweistufige Auswählen eines beweglichen Elements und anschließende Antippen seines Ziels bleibt bewusst erhalten; am Ziel selbst genügt genau ein Tipp.

## F. Prüfung und verbleibende Geräteprüfung

- `npm test`: bestehende vollständige Regressionssuite. Sie prüft unter anderem die natürliche Fortschrittsreihenfolge, zwölf Haupträtsel, Notizbuch, Inventarkombination, Siegel, Freischaltungen, Speichern/Laden, Fortsetzungscodes, alte und beschädigte Spielstände sowie Zurücksetzen. Die Minispielmechanik wird dort teilweise durch Platzhalter ersetzt; deshalb kommt zusätzlich der echte Browsertest zum Einsatz.
- `tests/production-browser.cjs`: Chromium/Edge mit Touch bei **1024 × 768**, **1180 × 820**, **1366 × 1024** und Maus bei **1440 × 1000**. Echte Klicks/Taps, keine per Debugfunktion ausgelösten Rätselsiege. Gespeicherte Meilensteine isolieren die Rätsel; Zufallszustände werden ausschließlich zum Auswählen der Testantworten gelesen.
- Vollständige Lösungen aller zwölf Haupträtsel bei 1024 × 768 mit Touch und auf dem Desktop; gezielte Fehlantworten, Chronik-Neuladen, Schließen/Wiederöffnen, Finale und Neustart-Abbruch. Auf den beiden weiteren iPad-Größen werden die Oberflächen und direkten Zielaktionen geprüft.
- Stadtkarte, Inventar, Notizbuch und Öffnen aller sieben Bonusspiele; Finale mit fehlender Voraussetzung blockiert; abgeschlossener Spielstand erneut geladen; reduzierte Bewegung ohne laufende Animationen.
- Screenshots der betroffenen Oberflächen wurden visuell kontrolliert. Keine horizontale Überbreite in den geprüften Dialogen.

**Ein physisches iPad und Safari/iPadOS standen hier nicht zur Verfügung.** Vor einem Unterrichtseinsatz dort bitte noch prüfen: Ersttipp auf Archivobjekte, Marker und Siegel; vertikales Scrollen der Chronik; Safari-Leisten beim Wechsel zwischen Vollbild und Fenster; Schließen/Wiederöffnen; Laden eines vorhandenen Spielstands; Systemeinstellung „Bewegung reduzieren“. Die Browser-Touchtests ersetzen diese Geräteprüfung nicht.

Wiederholbar nach Installation von Playwright:

```sh
node tests/production-browser.cjs
```

Optional: `PLAYWRIGHT_BROWSER` für einen vorhandenen Chromium-/Edge-Pfad, `WENDE_SCREENSHOTS` für Bildausgaben, `WENDE_WIDTH` oder `WENDE_ONLY` für gezielte Wiederholungen. Die Tests richten einen lokalen Server selbst ein.

## G. Verbleibende Stilunterschiede

Das Paket enthält unterschiedlich stark ausgearbeitete Bildstile. Die neuen realistischeren Materialgrafiken stehen weiterhin neben älteren, stärker gezeichneten Szenen und dem bestehenden SVG-Siegelrad. Eine vollständige Neuzeichnung dieser funktionierenden Teile war nicht Teil dieser gezielten Integration. Das vorhandene Mosaik der Motive und seine dreifache Differenzierung bleiben erhalten.

## H. Asset-Besonderheiten und Platzhalter

- Die drei Kategorie-PNGs enthalten bereits gerasterte Beschriftungen. Ihre Material- und Symbolgestaltung wird verwendet; die sichtbare Beschriftung darüber ist scharfes, zugängliches HTML auf einer Holzfläche. Optional könnten später textfreie Varianten der gleichen Schilder eingesetzt werden.
- Die bisherige kleine Seilzug-Tafel ist für kurze Begriffe gedacht und unten angeschnitten. Für die abschließenden Antwortsätze gibt es deshalb die neue vollständige SVG-Tafel. Die ursprüngliche Grafik bleibt für die bestehenden Seilzugteile erhalten.
- `sechs-siegel-tafel.png` wird nicht als neues Spielziel eingebunden: Ihre Motive passen nicht zu den sechs bereits erlernten Siegelbedeutungen und Fassungen. Der passende neue Medaillonbogen wird dagegen im Finale verwendet; seine anders angeordneten Motive werden ausdrücklich nach Siegelnamen zugeordnet. Die Fassungen im Spiel behalten ihre bekannten Zeichen.
- Es werden **keine extern nachzuliefernden Illustrationen und keine Asset-Platzhalter** benötigt. Die überarbeitete Fassung funktioniert mit den eingecheckten Dateien vollständig.
