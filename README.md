# Update: Szenen statt Textaufgaben (Branch `feature/visual-minigame-overhaul`)

Vier Bereiche sind als gezeichnete Szenen neu gebaut (`scenegames.js`, `scenegames.css`, Inhalte in `data/game-data.js` unter `GAME.minigames`):

- **Die geöffnete Stadt:** neues Stadtbild (`assets/minigames/open-city/open-city.png`). Fünf Veränderungen sind im Bild zu entdecken – geöffnete Tür, christliches Zeichen, zurückgegebene Truhe, Baustelle, Tempel und Altar – jeweils mit einem kurzen Satz direkt in der Szene. Danach öffnet sich an der Anschlagtafel das Rätsel „Vorher und Nachher“: Wachstafeln an die Tafeln „Vor dem Wandel“ und „Nach dem Wandel“ hängen. Die Aussage „313 wurde das Christentum zur einzigen erlaubten Religion.“ muss zum römischen Altar („Stimmt so nicht“); legt man sie auf eine Seite, antwortet das Spiel: „Nein. Andere Religionen und traditionelle römische Kulte bestanden zunächst weiter.“
- **Ein Band zwischen Kirche und Reich:** „Beratung im Konzil“ im Beratungsraum von Nicäa mit sechs großen Figuren und sechs Gesprächsrunden. Falsche Antworten beantwortet eine Figur fachlich; am Ende steht die Synthese „Kirchliche Einheit konnte für Konstantin auch politische Stabilität bedeuten.“
- **Die Zeitmechanik:** große Chronik im Chronistenraum mit sechs Jahresmedaillons (303, 311, 312, 313, 325, 337) und illustrierten Ereigniskarten. Nach der vollständigen Chronik erscheint das Band der Wende und die Transferfrage, zwischen welchen Ereignissen der entscheidende Wandel liegt (303 ↔ 311).
- **Bonus Amphoren-Chaos:** Hafenlager (`amphora-dock.png`), große Händlerfigur (`amphora-merchant.png`, 34 % der Spielfeldhöhe) mit Fangkorb, große Gegenstände aus `amphora-assets.png`. Die alten Stadtbewohner-Ausschnitte werden hier nicht mehr verwendet.

Bedienung: Karte antippen und Ziel antippen oder ziehen (Pointer Events), keine Hover-Abhängigkeit, Flächen mindestens 44 px, die Bühne passt sich an Quer- und Hochformat an, ohne dass das Fenster scrollt. Fehlt eine der Grafiken, zeigt `.sg-no-art` einen neutralen gezeichneten Ersatz.

- **Die Kurierfahrt von 313** bleibt als neuntes Bonusspiel erhalten (`bonus/kurier.js`, Inhalte in `GAME.kurier`). Sie wird durch die Waage des Kaisers freigeschaltet und im Notizbuch gestartet.
- **Schrift:** EB Garamond ist jetzt eingebunden (`assets/fonts/`, variable Schrift, normal und kursiv, Stärken 400–800, zusammen ca. 390 KB; Lizenz in `assets/fonts/OFL.txt`).

Tests: `npm install` (bringt `linkedom` als Entwicklungsabhängigkeit), dann `npm test`.

# Update: Auftrag des Archivars

Vor dem dunklen Archiv liegt jetzt die Szene „Beim Archivar“. Der Archivar übergibt Schriftrollen mit dem vorhandenen Fachtext zu 303. Alle drei Abschnitte werden vor dem Eintritt gelesen; danach bleiben sie im Botenbeutel und Notizbuch zugänglich. Brennende Öllampe und Archivschlüssel sind für den Eintritt nötig. Nach dem Rätsel ist das Archiv hell: Erst das Ablegen der Schriftrollen erfüllt den Auftrag und öffnet den Weg zur Nachricht von 311 und zum Tiber. Bereits abgeschlossene alte Spielstände bleiben zugänglich; ein noch ungelöstes Archiv führt zunächst zum Archivar. Die neue Szene verwendet die vorhandene Amtsstubenillustration.

Die Seilzüge fragen am ersten Platz „Wer ist betroffen?“ (Antwort: Bürger). Sammelgegenstände tragen nur noch ihr beiges Namensschild, ohne Plus und ohne „zum Mitnehmen“. Figuren erhalten statt des Anführungszeichens einen goldenen Randakzent.

Prüfung: `node tests/archive-flow.cjs` nach `npm install --no-save linkedom`.

# Update: Erst erkunden, dann prüfen

- Hotspots sind nach Art unterschieden: **Information** (Gespräche, Sachgegenstände) grün mit „i“, **Rätsel** terrakottafarben mit Siegelstern, **Mitnehmen** beige ohne Symbol (`hotspots.css`).
- Ein Rätsel ist erst dann offen, wenn alle Gespräche und Sachgegenstände des Ortes angesehen wurden. Bis dahin zeigt es ein Schloss und „erst Hinweise sammeln · 2/5“. Ausnahme: das Archiv, dort sind die Spuren Teil des Spiels.
- Rätsel öffnen immer direkt das Minispiel. „Ohne Spiel lösen“ gibt es nicht mehr.
- Der Stempel des Statthalters: Die Akte liegt ruhig in der Tischmitte, kein Zeitdruck. Die Symbole auf den Stempeln sind größer.

# Update: Bonusspiele

Acht freiwillige Bonusspiele werden ausschließlich im Notizbuch angeboten. Gesperrte Spiele erscheinen als „? ? ?“. Anklickbare Fundstellen in den Szenen entfallen. Freischaltungen richten sich nach gelösten Haupträtseln:

| Bonusspiel | Nach Abschluss von |
|---|---|
| Das geheime Zeichen | Türschloss im Wohnviertel |
| Rom brennt! | Echo der Quellen |
| Amphoren-Chaos | Stempel des Statthalters |
| Katakombenlauf | Archiv im Dunkeln |
| Schildwall | Kartenbrett im Lager |
| Über den Tiber! | Zeichen auf dem Schild |
| Belade den Wagen! | Kurierfahrt von 313 |
| Circus Maximus | Abschluss der Chronik |

Bonusspiele vergeben keine Siegel und sind keine Pflicht. Ein neues Spiel setzt auch den Bonusfortschritt zurück. Das Stempelspiel hat eine kompaktere Anleitung mit einem separat angeordneten, mindestens 52 Pixel hohen Startknopf sowie größere Stempel in der Hand und Abdrücke auf der Akte.

**Das geheime Zeichen** (überarbeitet) spielt auf dem Markt am Forum. Die Figuren sind Teil des Szenenbildes, es gibt keine kleinen laufenden Figuren mehr. Das Spiel hat vier Runden:

1. Die Chronistin erklärt die Zeichen. Die Holztafel oben rechts zeigt Fisch, Anker und Taube.
2. Die drei Zeichen in der Szene finden. Sie sind in Holz, Stein, Stoff, Ton, eine Öllampe oder eine Wachstafel eingearbeitet. Die Tippbereiche sind mindestens 60 px groß. Tipps daneben erzeugen nur eine Staubwolke, nach drei Fehlversuchen schimmert ein Zeichen kurz auf.
3. Christlich oder nur ähnlich? Nur Fisch, Anker, Taube und Christusmonogramm antippen, nicht Adler, Lorbeer oder Rosette. Jede Wahl wird kurz erklärt.
4. „Warum waren solche Zeichen hilfreich?“ als Auswahlfrage. Die Antworten stehen auf einer Holzleiste unten im Bild, die Chronistin bleibt sichtbar.

Grafiken optional unter `assets/bonus/secret-signs/` (siehe dortige README).

**Rom brennt!** (überarbeitet) ist ein Plattformer in einer brennenden Gasse im Abendrot. Die Kulisse ist gezeichnet: ferne Stadt, Rauchsäulen, verputzte Häuser mit Fensterläden und Ziegeldächern, Pflaster, Markisen, Brunnen und Zisterne.

- Am Wasser füllt sich der Krug der Figur, auf den drei Dächern wird gelöscht.
- Die Straße ist durchgehend begehbar. Häuser stehen hinter ihr, nur ihre Dachkanten tragen. Jedes Dach hat eine Leiter oder Kisten mit Markise, und von jedem Dach kann man hinunterspringen. So gibt es keine Sackgasse; `tests/rombrennt.cjs` prüft das für jede erreichbare Stelle.
- Kurzer Start („Bereit … Los!“), Zeit auf einer kleinen Tafel oben links, Bestzeit in `localStorage` (`im-zeichen-der-wende:rombrennt-best-v1`).
- Anzeige der gelöschten Brände (1/3 …), Knopf „↺ Neu“ für einen Neustart der Runde, große Bronzeknöpfe für die Steuerung.

Grafiken optional unter `assets/bonus/rome-burns/` (siehe dortige README).

Historische Einordnungen in den Spielen sind bewusst vorsichtig formuliert (Symbole, Brand von Rom, Katakomben als Begräbnisstätten, Tiber/Milvische Brücke). Sie sollten wie die übrigen Texte fachlich gegengelesen werden.

# Update: Minispiele

Sechs Rätsel sind jetzt eigene Minispiele (`minigames.js`, Inhalte in `data/game-data.js` unter `GAME.minigames`). Das Siegel gibt es erst, wenn das Ziel erreicht ist. Die Rätsel öffnen immer direkt das Spiel.

- **Kontrollstelle – Die beiden Seilzüge:** Holzklötze aus der Kiste an die Haken zweier Seile hängen, am Hebel ziehen, danach Vergleichsfrage; die Truhe mit dem Archivschlüssel öffnet sich.
- **Wohnviertel – Das Türschloss:** Drei Drehwalzen (Tippen, Wischen oder Pfeile) bilden einen Satz; am Griff ziehen prüft, Riegel gleitet zurück und die Tür schwingt auf.
- **Forum – Das Echo der Quellen:** Die Chronistin ruft Aussagen zu. Einordnen gegen die Zeit (belegt / unsicher / nicht feststellbar), 8 richtige Antworten.
- **Amtsstube – Der Stempel des Statthalters:** Die Akte liegt in der Tischmitte, ohne Zeitdruck. Römischen Stempel in die Hand nehmen und auf die Akte drücken; richtige Stempel hinterlassen einen Abdruck, 8 Akten.
- **Archiv – Das Archiv im Dunkeln:** Mit dem Lichtkegel der Lampe vier Spuren finden und den Maßnahmen von 303 zuordnen.
- **Lager 312 – Das Zeichen auf dem Schild:** 3×3-Puzzle (Tauschen oder Schieben) mit dem Christusmonogramm, danach Ereignis und Erzählung trennen.
- **Stadt 313 – Die Kurierfahrt:** Spurwechsel-Rennen. Richtige Aussagen über 311/313 einsammeln, falschen ausweichen, 6 Botschaften.

Wählbares Tempo, keine Leben, falsche Antworten werden erklärt. Der Fachtext-Knopf erscheint nur nach Fehlern in den klassischen Rätseln.

# Update: Fachtexte zum Einlesen

Jedes der 12 Rätsel hat einen zuschaltbaren **„📜 Fachtext“** mit einem kurzen Sachtext für Klasse 7 und, wo sinnvoll, einem kurzen Quellenzitat (Tertullian, Tacitus, Trajan an Plinius, Opferbescheinigung von 250, Eusebius, Mailänder Vereinbarung). Der Fachtext ist eine Hilfe bei Fehlern: Der Knopf „📜 Fachtext“ erscheint erst, nachdem ein Rätsel einmal falsch geprüft wurde. Die Informationen sollen zuerst aus den Gesprächen kommen. Minispiel: „Die Kurierfahrt von 313“ (Spurwechsel-Rennen, `minigames.js`) ersetzt die Besitztruhe. Gelesene Texte stehen im Notizbuch unter „Gelesene Fachtexte“ und werden mitgedruckt. Die Texte stehen in `data/game-data.js` unter `GAME.texts`, die Anleitungen unter `GAME.steps`.

**Hinweis für die Lehrkraft:** Die Fachtexte und die Quellenzitate (eigene, gekürzte Übersetzungen) wurden mit KI-Unterstützung erstellt und sind noch fachlich gegenzulesen und mit den Unterrichtsmaterialien abzugleichen.

# Update: Lesbarkeit und Wege

Größere Schrift, die mit dem Bildschirm mitwächst (`readability.css`). In jeder Szene führen Wege (➜) per Klick oder Tipp direkt zum Nachbarort; noch gesperrte Wege zeigen ein Schloss und einen Hinweis. Gespräche erscheinen als Sprechblase direkt in der Szene statt in einem eigenen Fenster. Neues Layout (`layout.css`): eine Leiste oben mit Stadtkarte, Botenbeutel, Notizbuch, Hinweis und Vollbild; die Szene füllt den restlichen Bildschirm (optimiert für iPad quer). Die Wege stehen in `data/game-data.js` unter `GAME.exits`.

# Visuelle Überarbeitung 3

Elf neu illustrierte Szenen mit integrierten Figuren, proportionaler Bilddarstellung und neu positionierten Klickflächen. Torwächtergespräch mit eigener Nahansicht und Sprechblase. Sichtbarer Feuerstein mit passendem Namen und Inventarbild. Interne Briefinghinweise aus der Schülerhilfe entfernt. Vollbild und bisheriger Spielstand bleiben erhalten.

Lokal starten: ZIP vollständig entpacken und `index.html` im Browser öffnen. Alle Bilddateien müssen im Ordner bleiben. Alternativ über einen beliebigen statischen Webserver starten. Die Version ist noch nicht auf GitHub Pages veröffentlicht. Aktuelle Prüfergebnisse: `TESTREPORT.md`.

---

# Im Zeichen der Wende

Spielbare erste Version eines historischen Point-and-Click-Adventures für Klasse 7, Evangelische Religion. HTML, CSS und Vanilla JavaScript, ohne Framework, Buildschritt, externe Schriftarten, CDN oder Serverdatenbank.

## Start

`index.html` in einem aktuellen Browser öffnen. Für zuverlässiges Speichern und Bereitstellung an iPads auf einem statischen Webserver hosten. Lokal optional: `python3 -m http.server 8000` im Projektordner; dann `http://localhost:8000` öffnen. Zum Teilen mit der Klasse die veröffentlichte HTTPS-Adresse verwenden, keine lokale Dateiadresse.

## GitHub Pages

Online: https://simfischer.github.io/im-zeichen-der-wende/

Repository: https://github.com/SimFischer/im-zeichen-der-wende

Die Veröffentlichung erfolgt aus `main` und `/ (root)` über GitHubs integrierten Pages-Workflow. Änderungen auf `main` werden automatisch veröffentlicht. Es ist kein npm-Build erforderlich. Alle Assetpfade sind relativ.

## Spiel

- 12 Orte, 12 Rätsel/Mechanismen und ein Ereignis 311.
- Frei wählbarer Einstieg ins Wohnviertel oder Forum; weitere Orte öffnen sich durch Erkenntnisse.
- Sechs Siegel: Konflikt, Quelle, Anzeige, Staat, 312, Wende. Jedes ist ein geprägtes Bronze-Medaillon mit eigenem Motiv (gekreuzte Schwerter, Schriftrolle, Wachstafel mit Griffel, Säule mit Lorbeer, Schild mit Christusmonogramm, Brücke mit Wendebogen). Siehe „Siegelsystem“.
- Inventar: Feuerstein am Tor, Lampe im Wohnviertel. Beide durch aufeinanderfolgendes Antippen kombinieren. Archivschlüssel im Beutel auswählen und das Archiv auf der Stadtkarte antippen.
- Drei gestufte Hilfen je Rätsel. Bei offenem Rätsel ist die Hinweis-Schaltfläche im Rätsel erreichbar.
- Tap-to-place statt Drag-and-drop: Baustein wählen, Platz wählen. Zahnrad durch Antippen drehen. Keine Hover-Abhängigkeit.
- Fortschritt einschließlich Teilantworten, freier Texte und Hilfestufen wird in `localStorage` gespeichert. Speicherung gilt nur auf diesem Gerät, in diesem Browser und unter derselben Adresse. Kein Abgleich zwischen Geräten.
- Notizbuch als Text exportieren oder drucken. Keine Übermittlung an einen Server.
- Kein Sound, keine Punkte, keine Ranglisten, keine automatischen Medien.

## Lehrkraftmodus

Spieltitel **5 Sekunden halten**. Tastaturalternative: Titel fokussieren, **Umschalt + Enter**. Szenen direkt öffnen, Rätsel als gelöst/ungelöst markieren, Gegenstände und Siegel geben, Finale testen, Spielstand zurücksetzen. Der Zugang ist absichtlich kein Sicherheitsmechanismus.

Wird ein einzelnes Rätsel zurückgesetzt, bleiben bereits geöffnete Orte erreichbar; das zugehörige Siegel wird entfernt. Für einen sauberen Durchlauf „Spielstand löschen“ verwenden. Bei direktem Sprung ins Archiv ggf. die brennende Lampe über den Lehrkraftmodus hinzufügen.

## Fachliche Grundlage und Grenzen

Die ausdrücklich im Nutzerbriefing festgelegten Inhalte bilden die historische Basis dieser Version. Die Fachanforderungen Evangelische Religion Schleswig-Holstein (2016), S. 15–22, wurden zu AFB I–III sowie Deutungs-, Urteils- und Dialogfähigkeit berücksichtigt. Die benannten Dateien `AB Gruppenarbeit Christenverfolgung.pdf`, `AB Die konstantinische Wende.pdf` und `6. Stunde.pptx` waren bei der Umsetzung nicht auffindbar. **Der Abgleich mit diesen Originalmaterialien steht aus.** Ein vollständiger Materialabgleich wird nicht behauptet.

Alle Figuren, Dialoge, die fiktive Stadt, Gegenstände und Mechanismen sind erfundene didaktische Rahmung, keine Originalquellen. Die Botenfigur besucht Erinnerungen aus mehreren Jahrhunderten; sie lebt nicht über diesen gesamten Zeitraum. Die Karte von 312 ist ausdrücklich eine Spielskizze, keine historische Truppenkarte.

Der Nero-Bericht wird nicht als sichere Kenntnis einer Brandstiftung dargestellt. Die Kategorien „unsicher“ und „nicht sicher feststellbar“ überlappen; für Neros Brandstiftung akzeptiert die App beide. Die Gleichzeitigkeit der Verfolgung im ganzen Reich ist nicht aus lokaler Überlieferung ableitbar.

Die Plinius-Fallentscheidungen sind im Code als didaktische Modellierung markiert und besonders am Originalarbeitsblatt zu prüfen. Erste Befragung und spätere Bestrafung bei beharrlicher Weigerung sind getrennt. Beim bloßen Gerücht ist „Anzeige zurückweisen“ im vorgegebenen Antwortschema als „kein Verfahren eröffnen“ erläutert. Das Rekonstruieren dieser Praxis bedeutet keine Zustimmung.

Die Motivwaage kennt mehrere mögliche Zuordnungen. Freitext ist nirgends eine Bedingung für den Fortschritt: Nach der Waage und im Finale (Argumentationsbrücke) wählen die Lernenden aus vier Begründungen. Zwei davon sind fachlich tragfähig und werden beide akzeptiert. Zwei sind typische Vereinfachungen und erhalten eine kurze fachliche Rückmeldung. Die gewählte Begründung erscheint im Notizbuch. Das mündliche Begründen bleibt als Gesprächsauftrag bestehen (zum Beispiel beim Konzil).

Quellenkritik mit drei Kategorien (Schild in Konstantins Zelt): **gut feststellbar** heißt, das Ereignis selbst ist durch Quellen und Folgen gesichert. **Später berichtet** heißt, die Aussage gibt wieder, was Autoren Jahre danach erzählen. **Nicht sicher feststellbar** heißt, die Aussage behauptet, wie es wirklich war, und das lässt sich nicht prüfen. Dass es eine Quelle gibt, wird nicht mit der Wahrheit ihres Inhalts gleichgesetzt. Jede falsche Wahl erhält eine eigene Rückmeldung.

## Unterricht und Spielzeit

Ziel: 35–45 Minuten, vorzugsweise zu zweit. Die Dauer ist eine Planungsannahme, noch kein gemessener Unterrichtstest. Richtwerte: Tor/Bedienung 2 Min.; Wohnviertel/Forum 7; Amt 4; Tempel/Archiv/311 8; Lager/Stadt 7; Motive/Nicäa 6; Finale 6. Die Zeit hängt vom Lesen und dem Gespräch über offene Begründungen ab. Bei Bedarf die freien Texte mündlich vorbereiten.

Sicherung: Notizbuch öffnen, Veränderungen im 1., 2., 3. und frühen 4. Jahrhundert vergleichen. Danach die Wende mit zwei Ereignissen begründen. Diskussionsfrage: Warum ist „313 waren nur noch Christen erlaubt“ eine falsche Zusammenfassung?

## Bilder und Bearbeitung

Drei vom Nutzer bereitgestellte Spielgrafiken sind enthalten. `scene-gate.png` und `scene-city-313.png` sind Einzelszenen; `scene-atlas.png` enthält neun Szenen, die CSS als Ausschnitte darstellt. Die Beratung von Nicäa hat einen eigenen Hintergrund. Der Szenenatlas wurde ohne eingebrannte Überschriften neu erstellt; acht Figuren sind als transparente Grafik eingebunden. Die Atlas-Ausschnitte haben geringere Detailauflösung als die Einzelbilder. Illustrationen sind keine historischen Belegbilder.

Texte, Rätsel, Dialoge, Hilfen, akzeptierte Antworten und fachliches Feedback: `data/game-data.js`. Mechanik, Speicherlogik und globale Bedienungstexte: `script.js`. Szenenfiguren und unterschiedliche Rätseloberflächen: `adventure.js`. Darstellung: `style.css` und `adventure.css`. Eine Zeile eines Rätsels enthält Optionen, akzeptierte Antwortindizes und erklärendes Feedback. Bei inhaltlichen Änderungen Lösungsschlüssel und Hilfen zusammen pflegen.

## Siegelsystem

`seals.js` zeichnet alle Siegel an einer Stelle; `seals.css` enthält Zustände, Belohnung und Siegelrad. Der Spielstand wird davon nicht berührt (`state.seals`, `state.flags.sealSockets`, `state.flags.sealsPlaced` bleiben wie bisher).

- **Medaillon:** unregelmäßiger Bronzerand, Perlrand, farbiges Emailfeld je Siegel, erhabenes Motiv mit Schatten, Lichtkante und Gravur. Farben und kurze Bedeutung stehen in `GAME.sealInfo`.
- **Zustände:** *fehlt noch* (leere, dunkle Fassung mit schwach eingeritztem Motiv), *erhalten*, *ausgewählt* (angehoben, goldener Schein), *eingesetzt* (im Kasten matt mit ✓, im Rad eingerastet).
- **Belohnung:** Nach jedem Rätsel mit Siegel erscheinen das große Medaillon mit kurzer Präge- und Glanzanimation, ein Pergamentbanner „Neues Siegel erhalten: …“ und die Sammlungsleiste, in der das neue Siegel aufleuchtet. Die Knöpfe zum Weiterspielen sind sofort da und bleiben sichtbar. Bei erneutem Lösen erscheint dieselbe Ansicht ruhig, ohne Animation.
- **Sammlung:** im Notizbuch („Deine Siegelsammlung“) und bei den Siegelplätzen, solange Siegel fehlen.
- **Siegelrad (Basilika):** Kulisse ist die Basilikawand mit dem Rad aus der Szene. Davor stehen ein Steinrelief mit Lorbeerkranz, eine Bronzescheibe mit Speichen und sechs Fassungen. Links (im Hochformat unten) steht der hölzerne Siegelkasten. Siegel antippen, dann die Fassung mit demselben Zeichen antippen. Falsche Fassungen wackeln kurz, richtige Siegel rasten mit Lichtring ein. Nach sechs Siegeln dreht sich die Scheibe und die Zeitmechanik wird frei.
- **Bilddateien:** optional unter `assets/ui/seals/` (siehe dortige README). Solange `GAME.sealAssets.available` leer ist, werden die SVG-Medaillons verwendet.

## Argumentationsbrücke (Finale)

`argbridge.js` und `argbridge.css`, Inhalte in `GAME.minigames.bridge`. Eine steinerne Brücke mit vier offenen Bögen steht vor der Basilika-Kulisse. Auf jedem Bogen sitzt ein Bronzeschild mit einem Satzanfang.

- **Phase A – Bögen:** Immer nur der leuchtende Bogen ist offen. Unten liegen drei Inschriftplatten mit Symbolmedaillon. Die richtige Platte rastet ein, die Steine des Bogens fallen an ihren Platz und eine kurze Bestätigung erscheint. Falsche Platten bekommen einen Riss und eine kurze fachliche Rückmeldung.
- **Phase B – Zu einfach?** Sechs Irrtums-Plaketten: vier zu starke Vereinfachungen, zwei tragfähige Aussagen. Angetippte Vereinfachungen bekommen Riss und Wachssiegel „zu einfach“, tragfähige Aussagen das Siegel „trägt“.
- **Phase C – Inschrift:** Aus vier Sätzen wird die Inschrift über der Brücke gewählt. Die richtige wird in die Brüstung gemeißelt. Danach zeigt eine Schriftrolle die ganze Argumentationskette.

Kein Freitext: Die gewählte Inschrift wird als Auswahl im Notizbuch gespeichert. Grafiken optional unter `assets/minigames/argument-bridge/` (siehe dortige README).

## iPad-Qualitätsschicht

`ipad.css` wird zuletzt geladen und setzt Untergrenzen für Schrift (mindestens 12,5–13,5 px) und Touchziele (mindestens 40–48 px), macht die Startknöpfe der Minispiele immer sichtbar und zeigt Szenen im Hochformat groß und seitlich verschiebbar. Details und offene Empfehlungen: `QUALITAETSBERICHT.md`.

## Tests

`tests/playthrough.cjs` testet den vollständigen natürlichen Weg in einer DOM-Testumgebung einschließlich Sperren, falscher/unvollständiger Antworten, Fortsetzen, Inventarkombination, Ereignis 311, Finale, Lehrkraftfunktionen und Neustart. Zur Wiederholung nur für Entwicklung `npm install --no-save linkedom`, dann `node tests/playthrough.cjs`. Linkedom gehört nicht zum Spiel und wird zum Hosten nicht benötigt.

Siehe `TESTREPORT.md` für die ausgeführten Prüfungen und Grenzen. Die veröffentlichte Seite wurde in Chrome stichprobenartig geprüft (Start, Szenenwechsel, Fortsetzen und Lehrkraftzugang). Die reale Bedienung in iPad-Safari bleibt offen.

## Neue Adventure-Oberfläche

- Schüler-Einstieg ohne organisatorischen Absatz.
- Vollbildschalter in der unteren Leiste: native Fullscreen API einschließlich WebKit-Variante. Wenn nicht vorhanden, maximierte Ansicht; Browserleisten können dort nicht automatisch ausgeblendet werden. Safari bietet dafür gegebenenfalls „Zum Home-Bildschirm“.
- Acht illustrierte Figuren, in Szenen anklickbar, und Gespräche mit kurzen Textabschnitten.
- Karten werden in Quellenfächer, Amtsentscheidungen, Archivschubladen oder Vorher/Nachher-Fächer gelegt. Ein erneuter Klick erlaubt das Umlegen.
- Seilzüge mit zwei parallelen Abläufen; schematische interaktive Lagerkarte; bewegliche Motivwaage; Jahresringe und Argumentationsbrücke.
- Sechs Siegel einzeln in das Siegelrad einsetzen.
- Stadtkarte mit Wegen und freigeschalteten Orten, auf kleinen Displays kompakt angeordnet.
- Bestehende Spielstände bleiben kompatibel.

Bedienung: kein Ziehen nötig. Karte antippen, Fach antippen. Beim Kartenbrett, Seilzug und Zeitstrahl: Baustein antippen, Platz antippen. Alle Bedienflächen sind auch mit Tastatur erreichbar.
