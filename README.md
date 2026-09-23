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

- 11 Orte, 12 Rätsel/Mechanismen und ein Ereignis 311.
- Frei wählbarer Einstieg ins Wohnviertel oder Forum; weitere Orte öffnen sich durch Erkenntnisse.
- Sechs Siegel: Konflikt, Quelle, Anzeige, Staat, 312, Wende.
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

Die Motivwaage kennt mehrere mögliche Zuordnungen. Freie Begründungen werden gespeichert, **nicht automatisch fachlich bewertet**. Die Mindestlänge ist nur eine Eingabehilfe. Ein reflektierender Abgleich und eine ausdrückliche Bestätigung schließen die Waage ab. Im Finale ergänzt die eigene Begründung die Satzbausteine (AFB III).

## Unterricht und Spielzeit

Ziel: 35–45 Minuten, vorzugsweise zu zweit. Die Dauer ist eine Planungsannahme, noch kein gemessener Unterrichtstest. Richtwerte: Tor/Bedienung 2 Min.; Wohnviertel/Forum 7; Amt 4; Tempel/Archiv/311 8; Lager/Stadt 7; Motive/Nicäa 6; Finale 6. Die Zeit hängt vom Lesen und dem Gespräch über offene Begründungen ab. Bei Bedarf die freien Texte mündlich vorbereiten.

Sicherung: Notizbuch öffnen, Veränderungen im 1., 2., 3. und frühen 4. Jahrhundert vergleichen. Danach die Wende mit zwei Ereignissen begründen. Diskussionsfrage: Warum ist „313 waren nur noch Christen erlaubt“ eine falsche Zusammenfassung?

## Bilder und Bearbeitung

Drei vom Nutzer bereitgestellte Spielgrafiken sind enthalten. `scene-gate.png` und `scene-city-313.png` sind Einzelszenen; `scene-atlas.png` enthält neun Szenen, die CSS als Ausschnitte darstellt. Die Beratung von Nicäa hat einen eigenen Hintergrund. Der Szenenatlas wurde ohne eingebrannte Überschriften neu erstellt; acht Figuren sind als transparente Grafik eingebunden. Die Atlas-Ausschnitte haben geringere Detailauflösung als die Einzelbilder. Illustrationen sind keine historischen Belegbilder.

Texte, Rätsel, Dialoge, Hilfen, akzeptierte Antworten und fachliches Feedback: `data/game-data.js`. Mechanik, Speicherlogik und globale Bedienungstexte: `script.js`. Szenenfiguren und unterschiedliche Rätseloberflächen: `adventure.js`. Darstellung: `style.css` und `adventure.css`. Eine Zeile eines Rätsels enthält Optionen, akzeptierte Antwortindizes und erklärendes Feedback. Bei inhaltlichen Änderungen Lösungsschlüssel und Hilfen zusammen pflegen.

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
