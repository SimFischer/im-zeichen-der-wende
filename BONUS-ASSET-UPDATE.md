# Bonusgrafiken – Integrationsbericht

Stand: 27. September 2026. Vanilla HTML/CSS/JS, bestehende sieben Bonusspiele und ihre Freischaltfolge bleiben erhalten. Überarbeitet wurden die sechs beauftragten Spiele; Amphoren-Chaos bleibt unverändert.

## A. Dateien

Geändert: `bonus/rombrennt.js`, `bonus/schildwall.js`, `bonus/zeichen.js`, `bonus/circus.js`, `bonus/katakomben.js`, `bonus/tiber.js`, `bonusgames.js`, `index.html`, `package.json`, `tests/zeichen.cjs`, `tests/sources-and-reasons.cjs`.

Neu: `bonus-art.css`, `tests/bonus-assets.cjs`, `tests/bonus-browser.cjs`, `tools/prepare-bonus-assets.cjs`, dieser Bericht und die aufbereiteten PNG-Dateien unter `assets/bonus/`.

Die zwischenzeitlich auf GitHub hinzugekommenen Quellen-, Text- und Touchkorrekturen wurden übernommen. Der bereits im Repository-Hauptverzeichnis hochgeladene neue Quellen-Test wurde zusätzlich an seinen tatsächlich ausgeführten Ort `tests/sources-and-reasons.cjs` übernommen. Das korrigiert den veralteten Test für die früheren Quellenkategorien, ohne die neuen fachlichen Inhalte zu ändern.

## B. Eingebundene Assets

| Spiel | Im normalen Spiel verwendete Dateien, jeweils im zugehörigen Asset-Ordner |
|---|---|
| Rom brennt | `rome-burns-bg`, `-tiles`, `-player`, `-water-jar`, `-fire`, `-smoke`, `-platforms`, `-goal` |
| Schildwall | `shieldwall-bg`, `-squad`, `-shields-left`, `-shields-up`, `-shields-right`, `-arrows`, `-hit`, `-banners`, `-impact`, `-gameover` |
| Das geheime Zeichen | `secret-signs-scene`, `-characters`, `-symbols`, `-panel`, `-npc-guide`, `-stall` |
| Circus | `circus-bg`, `-crowd`, `-chariots`, `-track`, `-dust`, `-ui-icons` |
| Katakomben | `catacombs-bg`, `-tiles`, `-player`, `-objects`, `-symbols`, `-exit-ui` |
| Tiber | `tiber-bg`, `-bank-views`, `-player`, `-platforms`, `-decor`, `-splash`, `-target-bank` |

Alle Namen haben die Endung `.png`. Die Hintergrunddateien für Circus und Katakomben stehen im Cache bereit; deren tatsächliche Spielfeldgeometrie entsteht aus den zur Physik passenden Einzelteilen. Sie werden nicht als starre Ersatzkarte über das Spielfeld gelegt.

Die Eingangsdateien waren überwiegend Ausschnitte mit Beschriftung und Pergamenthintergrund, keine fertigen transparenten Sprites. Einzelmotive wurden beschnitten, Hintergründe freigestellt und in gleich große Atlaszellen gesetzt. Texte bleiben im Code. Referenztafeln werden nicht vollständig ausgeliefert oder angezeigt.

**Paketfehler:** Die mit `tiber-` bezeichneten Eingangsdateien zeigen Katakomben. Die richtigen Flussmotive wurden aus dem Tiber-Teil von `combined-sheet.png` in die vorgesehenen Einzeldateien extrahiert. Der tatsächlich mitgelieferte Katakombenbogen heißt `source-sheets/tiber-sheet.png`; daraus stammen die detaillierten Katakomben-Tiles und die gerichteten Figuren. Die gerichtete Figur wird auch beim Tiber verwendet, weil der dortige kleine Seitenansichts-Streifen keine passenden Auf-/Ab-Ansichten enthält. Das Aufbereitungsskript dokumentiert jeden Quellausschnitt in Pixelkoordinaten. Keine neuen historischen Inhalte oder KI-Bilder wurden erzeugt.

Reproduktion mit installiertem `sharp`: `node tools/prepare-bonus-assets.cjs PFAD_ZUM_ENTPACKTEN_PAKET PFAD_ZUM_REPOSITORY`. `sharp` wird ausschließlich zur Asset-Aufbereitung benötigt, nicht im ausgelieferten Spiel.

## C. Technische Reserven

Die bisherigen Zeichnungen von Figuren, Feuer/Rauch, Schilden, Pfeilen, Fahrzeugen, Plattformen und Labyrinthflächen bleiben als Ladefehler-Fallback erhalten. Ein zentraler URL-Cache erzeugt jedes Bild einmal, merkt sich auch Fehlschläge und gibt den Start erst nach dem Ladevorgang frei. Ladefehler und Zeitüberschreitungen blockieren das Spiel nicht dauerhaft. Verzögerte Callback-Funktionen eines geschlossenen Spiels ändern dessen Oberfläche nicht mehr.

## D. Bewusst weiterhin gezeichnet

Erhalten bleiben die geometrisch exakten Dachkanten/Leitern, einzelne Straßen- und Gefahrenmarkierungen, Wasserlinien, dynamisches Licht, Hebel/Gitter, Ölstand und Fragmente mit dem bestehenden Text IN PACE, Rennbahn/Spuren/Wissenstore, Zielmarkierungen sowie funktionale Auswahl- und Warnanzeigen. Beim Tiber markiert eine durchgehende Holzfassung die vollständige tragende Plattformbreite; darüber liegen die unverzerrten Bildmotive. Die vorgesehenen drei Schilde sind Einzelobjekte, keine fertigen Formationsposen: Sie werden an fünf Legionären anhand des echten Richtungszustands zusammengesetzt.

Adler und Rosette im Suchspiel bleiben die bestehenden Vektorzeichen: Das gelieferte Symbolsheet enthält dafür keine fachlich passenden Motive. Fisch, Anker, Taube, Chi-Rho und Lorbeer verwenden das neue Sheet. Nicht passende Dekorationen und eingebrannte Punktetafeln wurden nicht als Bedienoberfläche übernommen. Einige ursprüngliche Pixelgrafiken haben eine niedrige Auflösung; hochauflösende Originale könnten diese später ersetzen, ohne die Logik zu ändern. Die Überarbeitung ist daher keine vollständige Ersetzung jeder gezeichneten Linie durch Rasterbilder.

## E. Neue Konfigurationen

Circus, Katakomben und Tiber besitzen jetzt wie die anderen drei Spiele ein zentrales `ART` mit `dir`, `files`, `available`. `BonusArt.draw` zeichnet begrenzte Atlaszellen mit proportionaler Skalierung und Clip-Bereich. `ctx.assets` verbindet den Cache mit der jeweiligen Sitzung. Bilder werden niemals im Animationstakt neu erstellt. Der Circus-Countdown ist nun HTML statt Canvas-Text. Timer für Tiber-Kommentare und gemeinsame Rückmeldungen laufen über die Sitzung und werden beim Schließen aufgeräumt.

## F. Koordinaten und Bedienung

Das Suchspiel verwendet ein eigenes Layout mit 14 neu gesetzten Positionen. Das sichtbare Zeichen liegt innerhalb desselben Buttons wie seine Trefferfläche. Spezifische Styles verhindern, dass globale Materialklassen das Bild verdecken oder die globale Active-Transformation beim Antippen den Button verschiebt. Das Hintergrundbild behält sein Seitenverhältnis; Erklärung und Suchtafel liegen oberhalb des Bildes.

Die Kollisionsraster, Laufgeschwindigkeiten, Sprungphysik, Plattformbewegung, Rennrunden, Schwierigkeitskurven, Punkte und Gewinnbedingungen wurden nicht verändert. Bilddarstellung und Richtung folgen den vorhandenen Zuständen. Touchziele werden im Browser auf mindestens 44 × 44 CSS-Pixel geprüft. Canvas-Auflösung verwendet weiterhin die vorhandene DPR-Anpassung.

## G. Prüfung

- `npm test`: alle 15 Testsuiten bestanden, einschließlich Hauptspiel, Speichern/Laden/Fortsetzung, Freischaltungen, Rom-brennt-Autopilot, Schildwall und aller Suchspielrunden.
- Neuer Asset-Test: 43 konfigurierte PNG-Dateien existieren und besitzen gültige Abmessungen; gemeinsame Preloads und Fehlercache geprüft.
- Edge/Chromium mit Touch-Emulation bei 1024×768, 1180×820 und 1366×1024; Desktop-Maus bei 1440×1000. 256 Prüfungen, keine JavaScript-Ausnahmen, keine 404, kein horizontales Überlaufen. 1366×1024 verwendet `prefers-reduced-motion: reduce`.
- Start, laufende Ansicht, Schließen/Wiederöffnen für alle sechs Spiele; alle drei Schildrichtungen; Ergebnis und Neustart bei 1024×768. Screenshots dieser Zustände wurden erstellt und visuell geprüft.
- Suchspiel-Abschluss erfolgt durch echte Touch-Eingaben. Für die längeren Actionspiele setzt der Browsertest gezielte Zustände vor dem bestehenden Abschlussübergang, um Ergebnis und Neustart reproduzierbar zu prüfen. Das ist kein behaupteter vollständiger menschlicher Durchlauf jeder Strecke. Rom brennt hat zusätzlich den bestehenden Erreichbarkeits-/Autopilot-Test.
- Gesonderter Durchlauf mit absichtlich blockierten Bonusbildern: 73 Prüfungen bestanden, weiterhin Start/Abschluss/Neustart möglich. Der Hauptspielstand bleibt beim Spielen der Boni unverändert.

## H. Noch auf echtem iPad prüfen

Safari/iPadOS konnte hier nicht auf physischer Hardware geprüft werden. Bitte insbesondere längeres Halten der Rom-Tasten, schnelle Richtungswechsel im Schildwall, Wischfolgen im Labyrinth/Tiber, Hintergrundwechsel während einer Runde sowie Safari-Leisten und Displayrotation prüfen. Die Browserprüfungen ersetzen diese Geräteprüfung nicht.
