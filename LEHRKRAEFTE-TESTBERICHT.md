# Lehrkräftekompendium – Umsetzung und Prüfung

Stand: 8. November 2026. Analysierte Ausgangsversion: `34b19ac`.

## Umsetzung

| Datei | Aufgabe |
| --- | --- |
| `lehrkraefte.html` | Separate Handbuchseite mit vier Bereichen und ungeschütztem, ausdrücklich bewusst zu öffnendem Lösungsteil |
| `lehrkraefte-data.js` | Schnellhilfe, Stationen, Voraussetzungen, Fachziele und 31 FAQ |
| `lehrkraefte.js` | Navigation, Suche, Checklistenansicht, Lösungen aus aktiven Spieldaten, Druckvorbereitung und Wiederherstellung |
| `lehrkraefte.css` | Pergamentgestaltung, bestehende Garamond-Schrift und Assets, responsive Darstellung, Drucklayout |
| `script.js` | Ausschließlich ein Handbuchlink im lokalen Lehrkraftmodus samt Link-Helfer; vorhandene Spiel-, Freigabe- und Speicherlogik unverändert |
| `tests/teacher-handbook.cjs` | Inhaltliche Abdeckung, Antworten, Alternativen, FAQ, Druckzustand und Trennung vom Spielstand |
| `tests/teacher-handbook-browser.cjs` | Reale Chromium-Bedienung und Layout, emulierte Touchbedienung, beide Druckvarianten |
| `package.json` | Handbuchprüfung in bestehende Test- und Build-Befehle aufgenommen |
| `README.md` | Zugang, Wartung und Testaufrufe beschrieben |

Keine Projektabhängigkeit hinzugefügt, keine Änderung an Rätseldaten, historischen Spieltexten, Inventar, Fortschrittsformaten oder Server-API. Das Handbuch liest und schreibt keinen Spielstand und ruft keinen Online-Speicherdienst auf.

## Inhaltsabgleich mit dem Code

Maßgeblich sind `index.html`, `data/game-data.js`, `script.js`, `adventure.js`, `minigames.js`, `scenegames.js`, `argbridge.js`, `finale.js`, `continuation.js`, `api/continuation.js`, das Bonussystem und die fünf Bonusmodule. Die vorhandenen Berichte und die ältere Wurzeldatei `game-data.js` sind nicht die verlässliche Grundlage der aktuellen Lösungen.

- Zwölf Orte: Stadttor, Wohnviertel, Forum, Amtsstube, Kontrollstelle, Archivar, Archiv, Tiberlager, geöffnete Stadt, Motive, Nicäa und Basilika. Wohnviertel und Forum sind zunächst parallel zugänglich. Die bestehende Testausgabe nennt statisch noch elf Szenen; die tatsächlich aktive Ortsliste enthält zwölf.
- Zwölf Haupträtsel: Türschloss, Echo der Quellen, Stempel, Seilzüge, Archivmechanismus, Kartenbrett, Schild mit Quellenquiz, Vorher/Nachher, Mosaik, Konzil, Zeitmechanik und Argumentationsbrücke.
- Alle Informationsfreigaben, Botenpass, Lampe/Feuerstein, Schlüssel, drei Archivrollen und deren nachträgliche Ablage werden berücksichtigt.
- Genau sechs Erkenntnis-Siegel. Mosaik: alle akzeptierten Felder und beide richtigen Begründungen aus dem Code übernommen.
- Die aktuelle Argumentationsbrücke umfasst vier Bögen und eine Inschrift. Ein in älteren Kommentaren erwähnter zusätzlicher Prüfschritt ist nicht Bestandteil dieser Brücke. Die Abschlusssequenz enthält eine eigene Auswahl von drei richtigen Aussagen und wird separat erklärt.
- Fünf freiwillige Bonusspiele, ihre Auslöser und Unterstützungswege; keine erfundenen weiteren Bonusspiele oder Pflichtsiege.
- Automatisches lokales Speichern und ausdrücklich erzeugte Online-Momentaufnahmen unterschieden. Codegültigkeit von 90 Tagen, Übernahmebestätigung, fehlende Kontowiederherstellung und eingeschränkte Speicherung laufender Minispielrunden sind erklärt. Notizbuch-Textdateien sind keine importierbaren Spielstände.
- Keine zentrale Lehrkräfte-Auswertung oder Kursverwaltung behauptet. Der vorhandene Lehrkraftmodus ist ein lokaler Testzugang ohne Passwortschutz und keine Fernsteuerung.
- Unterrichtsimpulse und eine ausdrücklich ungemessene Schätzung von drei Unterrichtsstunden sind von digital implementierten Abläufen getrennt.

## Erfolgreiche Prüfungen

- `npm test`: sämtliche bestehenden Tests sowie neue Handbuchprüfung bestanden. Enthalten sind der natürliche logische Gesamtablauf mit Minispiel-Platzhaltern, Freigaben, Inventar, Archivablage, Finale, Speicherwiederaufnahme, Codeverschlüsselung mit simuliertem Server, Haupt- und Bonusmechaniken sowie Lebenszyklusprüfungen.
- `npm run build`: Syntaxprüfung, Fortsetzungscodes und Handbuchprüfung bestanden.
- `git diff --check`: keine Formatierungsfehler.
- Neuer Handbuch-Browsertest mit installiertem Chrome/Playwright: 1440×1000, 1024×768, 768×1024 und 390×844 ohne horizontalen Überlauf. Zusätzliche Tippbedienung in emuliertem Tablet-Quer- und Hochformat.
- Vier Bereiche, aktuelle Navigation, alle zwölf Ortskarten, FAQ-Suche einschließlich erfolgloser Suche und Zurücksetzen, aufklappbare Antworten, bewusstes Öffnen und Schließen der Lösungen, alle Antworttabellen und Rückkehr zur App geprüft.
- Im normalen Start-/Spielmenü erscheint kein Handbuchlink. Fünf Sekunden Halten des Titels öffnet den Lehrkraftmodus; dessen Handbuchlink öffnet einen eigenen Tab; der lokale Hauptspielstand bleibt beim Öffnen und bei Rückkehr unverändert. Die Handbuchinhalte werden nicht als Spielskripte in `index.html` geladen.
- Druckbutton und Browser-Druckereignisse geprüft: gesamte Anleitung und alle FAQ einschließlich ausgefilterter bzw. geschlossener Fragen werden gedruckt. Lösungen erscheinen nur nach bewusstem Öffnen und zusätzlichem Druck-Opt-in. Bedienelemente und Navigation sind ausgeblendet; Aufklappzustände werden anschließend wiederhergestellt.
- Beide A4-Druckvarianten wurden als Browser-PDF erzeugt, gerendert und visuell auf Seitenaufteilung, abgeschnittene Inhalte und Tabellen geprüft. Prüfausgaben und Screenshots liegen außerhalb des Repositorys im Arbeitsordner; sie werden nicht mit der App ausgeliefert.
- Keine Browser-JavaScriptfehler oder fehlenden Handbuch-Assets im neuen Browsertest.

## Grenzen und bestehende Auffälligkeiten

Ein vollständiger visueller Durchlauf aller aktuellen Spielmechaniken konnte nicht erfolgreich beendet werden. Diese Einschränkung wird ausdrücklich nicht durch den bestandenen logischen Durchspieltest ersetzt:

1. Die unveränderte bestehende Prüfung `tests/production-browser.cjs` wurde mit Chrome bei 1440 Pixeln gestartet. Am Siegelrad fängt die Radfläche den mittigen Klick auf eine Fassung ab. Mit echten Fokus-/Enter-Eingaben wurden diagnostisch alle sechs Fassungen erfolgreich eingesetzt; diese Alternative ist im FAQ beschrieben. Bei 1024 Pixeln mit emulierter Tippbedienung bestand derselbe Siegelabschnitt ohne diese Alternative.
2. Im bestehenden Archiv-Browsertest kam der Tablet-Durchlauf beim Zuordnen von Spuren nicht weiter. Am Desktop wurde zudem ein Klick auf eine Archivspur von der Raumfläche abgefangen. Beim separaten Fortsetzen der Browserdiagnose wurde am Kartenbrett ebenfalls eine vom Kartenhintergrund abgefangene Zielbetätigung beobachtet. Quellenrätsel und beide Seilzüge wurden in realer Browserbedienung erfolgreich abgeschlossen. Die Ursachen der übrigen bestehenden Spieloberflächenprobleme wurden nicht durch Änderungen an der Spiellogik oder Spielgestaltung umgangen.
3. Für die weiterführende Diagnose wurden nur außerhalb des Repositorys Testannahmen an die aktuelle Abschlusssequenz und fünf statt acht Bonusspiele angepasst und am Siegelrad echte Tastatureingaben verwendet. Das ist kein erfolgreich bestandener ursprünglicher Browser-Gesamttest. Die bestehenden Spieldateien wurden dafür nicht verändert.

Nicht geprüft: physische iPads, Safari/iOS, andere reale Schulgeräte, Unterrichtsdauer mit einer 7. Klasse, schulische Filterkonfiguration und der produktive Online-Speicherdienst. Die Fortsetzungs-API wurde durch automatisierte Tests mit simulierten Antworten geprüft; es wurden keine produktiven Spielstände angelegt oder geladen.

Ausführungsumgebung: Node 24.19.0; das Projekt deklariert Node 22.x. Tests und Build bestanden unter der vorhandenen Umgebung. Ein zusätzlicher Lauf unter Node 22 wurde nicht durchgeführt.
