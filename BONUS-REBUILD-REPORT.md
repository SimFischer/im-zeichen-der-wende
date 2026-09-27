# Bonusspiele: Umsetzung und Prüfung

Stand: 27.09.2026. Ausgangspunkt: Commit 13bec1a auf main. Keine ZIPs importiert, keine Bilddateien neu erzeugt, keine Historie umgeschrieben.

## Entfernte Spiele und Bereinigung (A–C)

Rom brennt!, Schildwall und Amphoren-Chaos sind aus Modulen, Skriptimporten, Registrierung, Meilensteinen, Menü und spielbezogenem CSS entfernt. Ihre Tests und exklusiven Grafiken wurden gelöscht. Das frühere Werkzeug zur Wiederherstellung alter Asset-Pakete wurde ebenfalls entfernt.

Die Bonus-Speicherung verwendet ausschließlich `im-zeichen-der-wende:bonus-v2` mit den fünf zulässigen IDs zeichen, katakomben, tiber, bilder, circus. Unbekannte IDs und Duplikate werden beim Lesen und Übernehmen verworfen. Bildpuzzle-Abschlüsse verwenden `im-zeichen-der-wende:bonus-bilder-v2` mit vier zulässigen Bild-IDs. Es gibt keine Migration alter Bonusspielstände. Alte Browser-Schlüssel werden nicht mehr gelesen oder geschrieben; bereits auf einem Gerät vorhandene Altwerte werden nicht physisch gelöscht. Laufende Runden starten beim erneuten Öffnen frisch, erfolgreiche Abschlüsse bleiben gespeichert. Hauptspiel-Persistenz bleibt bestehen.

## Neues Merkspiel (D–E)

Fünf Runden mit einer wachsenden zufälligen Folge aus Fisch, Anker, Taube und Chi-Rho. Während der Wiedergabe sind Eingaben gesperrt. Fehler wiederholen dieselbe Runde ohne Fortschrittsverlust. Die Folge kann auf Wunsch erneut gezeigt werden. Pause stoppt auch die Wiedergabe. Vier große Symboltasten, Tastaturfokus und beschriftete Eingaben. Der Geheimcode wird ausdrücklich als erfundene Spielsituation eingeordnet.

Verwendete Dateien:
- assets/bonus/secret-code/codeboard.png
- assets/bonus/secret-code/fish-normal.png
- assets/bonus/secret-code/anchor-normal.png
- assets/bonus/secret-code/dove-normal.png
- assets/bonus/secret-code/chi-rho-normal.png

Die gelieferten active/error-Dateien tragen teilweise Dateibeschriftungen; success-effect und error-effect zeigen Flussausschnitte. Deshalb sind diese Dateien nicht eingebunden. Leuchten und Fehlerrückmeldung entstehen mit CSS und Textsymbolen auf den sauberen normalen Bildern. Die alte Marktsuche und ihre Assets sind entfernt.

## Neues Tiberspiel (F–G)

Ein Top-down-Spielfeld mit diskreten Schritten, sechs beweglichen Plattformreihen, einer Felsenreihe als Zwischenhalt und einem Nordufer als Ziel. Plattformen tragen die Figur mit. Wasser und Abtreiben über den Rand lösen Splash und Rücksetzung zum letzten sicheren Halt aus. Touchpfeile und Pfeiltasten/WASD reagieren ohne Trägheit. Die Brücke ist im begleitenden Schauplatzbild sichtbar. Kollisionen berücksichtigen die tatsächlich gezeichneten Plattformbreiten; Canvas berücksichtigt DPR bis 2.

Verwendete Dateien:
- assets/bonus/tiber-topdown/tiber-background.png
- assets/bonus/tiber-topdown/bank-start.png
- assets/bonus/tiber-topdown/bank-goal.png
- assets/bonus/tiber-topdown/log-large.png
- assets/bonus/tiber-topdown/log-small.png
- assets/bonus/tiber-topdown/plank.png
- assets/bonus/tiber-topdown/raft.png
- assets/bonus/tiber-topdown/boat-large.png
- assets/bonus/tiber-topdown/rock-large.png
- assets/bonus/tiber-topdown/island-small.png
- assets/bonus/tiber-topdown/player-up.png
- assets/bonus/tiber-topdown/player-down.png
- assets/bonus/tiber-topdown/splash-small.png
- assets/bonus/tiber-topdown/goal-banner.png

water-tile enthält Boot und Beschriftung; current/waves sowie seitliche Figuren enthalten Nachbarobjekte oder abgeschnittene Motive. Sie werden nicht verwendet. Das Wasser wird im Canvas gezeichnet. Links/rechts entstehen durch Rotation der vollständigen neuen Draufsicht. Die große Splash-Datei enthält Wellen; verwendet wird splash-small. Alte Tiber-Sheets sind gelöscht.

## Katakombenlauf (H–I)

Labyrinth und begrenztes Licht bleiben als Grundprinzip erhalten. Eine kompakte zusammenhängende Karte ersetzt das frühere zufällige große Labyrinth. Vier Fundstellen: Fischbild, Ankerzeichen, beschädigte Inschrift, Grabnische. Fragen unterscheiden Beobachtung, vorsichtige Deutung und unbelegte Behauptung. Falsche Antworten erhalten fachliche Rückmeldung und können korrigiert werden. Richtige Antworten geben einmalig Öl und größere Sicht; die vierte Spur zeigt den Grundriss deutlicher. Drei gelöste Deutungen öffnen den Ausgang. Während einer Frage verbraucht die Lampe kein Öl; eine Mindesthelligkeit verhindert völlige Orientierungslosigkeit. Die Bilder sind als Spielillustrationen gekennzeichnet.

Verwendete Dateien:
- assets/bonus/catacombs/floor-straight.png
- assets/bonus/catacombs/wall.png
- assets/bonus/catacombs/symbol-fish.png
- assets/bonus/catacombs/symbol-anchor.png
- assets/bonus/catacombs/inscription.png
- assets/bonus/catacombs/grave-niche.png
- assets/bonus/catacombs/player-up.png
- assets/bonus/catacombs/player-down.png

Seitliche Spielerbilder sind unvollständige Ausschnitte und wurden durch gedrehte vollständige Figuren ersetzt. oil-lamp zeigt einen Säulenrand, exit enthält eine Dateibeschriftung; beide werden nicht eingesetzt. Die alten Katakomben-Sheets sind gelöscht. Licht und Ausgangsmarkierung entstehen im Canvas.

Fachliche Orientierung: [Päpstliche Kommission für christliche Archäologie](https://www.catacombeditalia.va/content/archeologiasacra/en/christian-catacombs.html), [Vatikanische Museen: Anker und Fisch auf einer Grabinschrift](https://www.museivaticani.va/content/museivaticani/en/collezioni/musei/galleria-lapidaria/sezione-xv--iscrizioni-dei-cristiani-in-lingua-greca/epitaffio-con-augurio-di-pace-nellaldila-e-ancora.html). Die konkreten Aufgaben sind didaktische Spielsituationen, keine Edition realer Fundstücke.

## Behaltene Darstellungen und Grenzen (J–K, O)

Circus Maximus behält Rennstrecke, sieben Runden, Spurwechsel, Hindernisse und Wissensfragen. Seitenansicht-Wagen, unpassende Hindernisgrafiken und das sichtbar wiederholte Tribünenbild wurden ausgeschlossen und gelöscht. Die vorhandene Canvas-Draufsicht bleibt erhalten. Lorbeer und Staubgrafik werden weiter genutzt; circus-bg bleibt als vorhandene Panoramaressource im Assetregister. Die vier Bilder für Zerbrochene Bilder bleiben unverändert. Der Circus ist dadurch perspektivisch konsistent, wirkt aber weiterhin einfacher und stärker geometrisch als die gemalten Tafeln. Eine vollständige stilistische Gleichheit ist nicht erreicht. Die kleinen Originalgrafiken begrenzen außerdem die Detailwirkung auf hochauflösenden Retina-Displays; sie werden nicht großflächig hochskaliert.

## Tests (L)

- npm test: 16 Testsuiten bestanden, einschließlich Hauptspiel, Fortsetzung, Freischaltungen und neuer Spiele.
- npm run build: Syntaxprüfung von 17 JavaScript-Dateien und Fortsetzungsprüfung bestanden; Build funktioniert nun auch unter Windows.
- zeichen.cjs: Wiedergabesperre, Folgenwachstum, Fehler, Wiederholung und fünf erfolgreiche Runden.
- tiber.cjs: Rasterbewegung, fehlende Trägheit, Plattformmitnahme, Wasser-/Randreset, Zwischenhalt, regulär erreichbares Ziel.
- katakomben.cjs: alle Spuren erreichbar, richtige/falsche Antworten, einmalige Belohnungen, Ölminimum, Ausgangsbedingung, vollständiger Weg.
- bonus-lifecycle.cjs: alle fünf real registrierten Spiele über DOM-Eingaben bis zum Abschluss, danach Öffnen/Schließen sowie Timer-/RAF-Bereinigung. Canvas-Zeichenoperationen sind in diesem Node-Test simuliert; dies ist kein manueller vollständiger Browserdurchlauf.
- bonus-assets.cjs: 30 PNG-Dateien und gemeinsamer Ladecache einschließlich Fehlercache.
- bonus-integrity.cjs: fünf Spiele, keine alten Laufzeitverweise, vorhandene referenzierte Dateien.
- Chrome: alle fünf Spiele in 1024×768, 1180×820 und 1366×1024 gestartet; keine horizontalen Seitenüberläufe, defekten Bild-Elemente oder sichtbaren Schaltflächen unter 44 px. Konsole ohne Warnungen/Fehler. Sichtprüfungen der Szenen sowie Klicktests von Steuerung und Katakomben-Fehlantwort/Belohnung.
- bonus-browser.cjs wurde auf die aktuelle Struktur umgestellt und ist als zusätzlicher Playwright-Touchtest ausführbar. Dieser separate Playwright-Lauf wurde hier nicht ausgeführt; die Browserkontrolle erfolgte über die verbundene Chrome-Instanz.

## Commits und Pushes (M–N)

- 83078b0 remove obsolete bonus games
- d7484ea update full playthrough for five bonus games
- b7c2755 rebuild secret code memory game
- 5afdd8b rebuild Tiber top down crossing game
- b6d3c48 expand catacombs learning gameplay
- ca5179b clean bonus menu and unlock logic
- Der abschließende Commit heißt final bonus games regression fixes.

Jeder oben genannte Commit wurde direkt nach Erstellung auf origin/main gepusht. Beim ersten Block wurde eine veraltete Acht-Spiele-Erwartung im Gesamtdurchlauftest erst nach dem ersten Push erkannt und unmittelbar in einem zusätzlichen Commit korrigiert. Die geforderte Reihenfolge war damit an dieser Stelle nicht vollständig eingehalten; keine Historie wurde nachträglich umgeschrieben.

## Noch auf echtem iPad prüfen (P)

Safari/iPadOS und physischer Touch wurden hier nicht geprüft. Bitte alle fünf Spiele einmal mit Fingerbedienung abschließen, bei Merkspiel/Katakomben Fehlversuche auslösen, beim Tiber ins Wasser fallen und im Circus falsche Tore wählen. Zusätzlich Hintergrundwechsel/Pause, schnelles mehrmaliges Tippen, Rotation, Safari-Leisten, Retina-Schärfe und Wiederöffnen nach einem Abschluss prüfen. Die vollständigen Siege sind bisher automatisiert in der DOM-Integration belegt, nicht durch vollständige manuelle Browserdurchläufe aller fünf Spiele. Diese Geräte- und manuelle Endabnahme sowie die verbleibenden Stilunterschiede sind offen; die strengen Akzeptanzkriterien sind daher nicht vollständig abgenommen.

## Vollständige Liste gelöschter Dateien

- assets/bonus/catacombs/catacombs-bg.png
- assets/bonus/catacombs/catacombs-exit-ui.png
- assets/bonus/catacombs/catacombs-objects.png
- assets/bonus/catacombs/catacombs-player.png
- assets/bonus/catacombs/catacombs-symbols.png
- assets/bonus/catacombs/catacombs-tiles.png
- assets/bonus/circus/circus-chariots.png
- assets/bonus/circus/circus-crowd.png
- assets/bonus/circus/circus-track.png
- assets/bonus/rome-burns/README.md
- assets/bonus/rome-burns/rome-burns-bg.png
- assets/bonus/rome-burns/rome-burns-fire.png
- assets/bonus/rome-burns/rome-burns-goal.png
- assets/bonus/rome-burns/rome-burns-platforms.png
- assets/bonus/rome-burns/rome-burns-player.png
- assets/bonus/rome-burns/rome-burns-smoke.png
- assets/bonus/rome-burns/rome-burns-tiles.png
- assets/bonus/rome-burns/rome-burns-water-jar.png
- assets/bonus/secret-signs/README.md
- assets/bonus/secret-signs/secret-signs-characters.png
- assets/bonus/secret-signs/secret-signs-npc-guide.png
- assets/bonus/secret-signs/secret-signs-panel.png
- assets/bonus/secret-signs/secret-signs-scene.png
- assets/bonus/secret-signs/secret-signs-stall.png
- assets/bonus/secret-signs/secret-signs-symbols.png
- assets/bonus/shieldwall/README.md
- assets/bonus/shieldwall/shieldwall-arrows.png
- assets/bonus/shieldwall/shieldwall-banners.png
- assets/bonus/shieldwall/shieldwall-bg.png
- assets/bonus/shieldwall/shieldwall-gameover.png
- assets/bonus/shieldwall/shieldwall-hit.png
- assets/bonus/shieldwall/shieldwall-impact.png
- assets/bonus/shieldwall/shieldwall-shields-left.png
- assets/bonus/shieldwall/shieldwall-shields-right.png
- assets/bonus/shieldwall/shieldwall-shields-up.png
- assets/bonus/shieldwall/shieldwall-squad.png
- assets/bonus/tiber/tiber-bank-views.png
- assets/bonus/tiber/tiber-bg.png
- assets/bonus/tiber/tiber-decor.png
- assets/bonus/tiber/tiber-platforms.png
- assets/bonus/tiber/tiber-player.png
- assets/bonus/tiber/tiber-splash.png
- assets/bonus/tiber/tiber-target-bank.png
- assets/minigames/amphora/amphora-assets.png
- assets/minigames/amphora/amphora-dock.png
- assets/minigames/amphora/amphora-merchant.png
- bonus/amphoren.js
- bonus/rombrennt.js
- bonus/schildwall.js
- tests/amphoren.cjs
- tests/rombrennt.cjs
- tests/schildwall.cjs
- tools/prepare-bonus-assets.cjs
