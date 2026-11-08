(() => {
  'use strict';
  const G = window.GAME, H = window.TeacherHandbook;
  const $ = s => document.querySelector(s);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const list = values => `<ul>${values.map(v => `<li>${esc(v)}</li>`).join('')}</ul>`;
  const puzzleName = id => G.minigames[id]?.title || G.puzzles[id].title;
  const sceneName = id => G.scenes.find(s => s.id === id).name;
  const bonuses = [
    {id:'zeichen',title:'Das geheime Zeichen',after:'conflict',task:'Eine wachsende Folge aus Fisch, Anker, Taube und Chi-Rho merken und wiederholen. Ein Fehler beendet den Durchlauf; kein festes Endlevel.',help:'Während der Vorführung warten, erst danach eingeben. Kurze Folgen laut benennen; einen neuen Durchlauf beginnen. Der Rekord ist Spielleistung, keine historische Bewertung.'},
    {id:'katakomben',title:'Katakombenlauf',after:'archive',task:'Unterirdische Begräbnisstätte schrittweise erkunden und vier Befunde deuten. Drei gelöste Spuren öffnen den Ausgang im Nordosten.',help:'Fisch = beobachtbares Bild; Anker kann Hoffnung ausdrücken; unsichere Inschrift nicht als Tatsache ergänzen; Grabnische weist auf Bestattung hin. Die richtigen Antworten sind in dieser Reihenfolge 1, 2, 3, 1. Nicht als Beweis dauerhafter christlicher Verstecke deuten.'},
    {id:'tiber',title:'Über den Tiber!',after:'vision',task:'Mit Richtungspfeilen oder WASD/Pfeiltasten über bewegte Plattformen zum Nordufer gelangen. Fundstücke sind optional.',help:'Plattformen beobachten, sichere Felsen in der Mitte nutzen. Wasserlandung setzt zur letzten sicheren Stelle zurück. Keine vorgegebene einmalige Route; Geschicklichkeitsmodell, keine historische Rekonstruktion der Schlacht.'},
    {id:'bilder',title:'Zerbrochene Bilder',after:'change',task:'Verfügbare Motive der Reise ohne Zeitdruck wieder zusammensetzen. Weitere Bilder hängen von gelösten Orten ab.',help:'Ausschnitte und gemeinsame Bildkanten vergleichen; Muster am Rand beginnen. Es gibt keine feste Zahlenlösung für wechselnde Anordnungen.'},
    {id:'circus',title:'Circus Maximus – Das Rennen',after:'bridge',task:'Das grüne Gespann durch Spurwechsel über sieben Runden lenken. Der Wagen fährt selbst; auch eine andere Platzierung als Platz 1 erreicht das Ziel.',help:'Spurwechsel sparsam einsetzen und Hindernisse beobachten. Als freiwilligen Abschluss behandeln; die Rennplatzierung ist keine Bedingung für die historische Chronik.'}
  ];

  $('#route-map').innerHTML = H.stations.map((s,i) => `<a href="#ort-${s.id}"><span>${String(i+1).padStart(2,'0')}</span>${esc(sceneName(s.id))}</a>`).join('');
  $('#station-list').innerHTML = H.stations.map((s,i) => {
    const sc = G.scenes.find(x => x.id === s.id);
    return `<article class="paper station" id="ort-${s.id}" data-scene="${s.id}"><div class="station-heading"><span class="station-number">${String(i+1).padStart(2,'0')}</span><div><p class="eyebrow">${esc(sc.era)}</p><h2>${esc(sc.name)}</h2><p class="station-focus">${esc(s.focus)}</p></div></div>${s.puzzles?`<p class="puzzle-chips">${s.puzzles.map(id=>`<span>${esc(puzzleName(id))}</span>`).join('')}</p>`:''}<dl class="station-grid"><div><dt>Spielauftrag</dt><dd>${esc(s.task)}</dd></div><div><dt>Fachlich</dt><dd>${esc(s.learn)}</dd></div><div><dt>Erfolgreich abgeschlossen</dt><dd>${esc(s.success)}</dd></div><div><dt>Weiterkommen</dt><dd>${esc(s.gate)}</dd></div></dl><details class="station-help"><summary>Typische Schwierigkeit &amp; konkrete Lehrkräftehilfe</summary><p>${esc(s.help)}</p></details><p class="transfer"><b>Transfer · Unterrichtsimpuls</b> ${esc(s.transfer)}</p></article>`;
  }).join('');
  $('#bonus-overview').innerHTML = bonuses.map(b=>`<article class="bonus-card"><h3>${esc(b.title)}</h3><p class="eyebrow">Nach: ${esc(puzzleName(b.after))}</p><p>${esc(b.task)}</p></article>`).join('');
  $('#faq-list').innerHTML = H.faq.map(([category,entries],i)=>`<section class="paper faq-group" aria-labelledby="faq-group-${i}"><h2 id="faq-group-${i}">${esc(category)}</h2>${entries.map(([question,cause,solution])=>`<details class="faq-item"><summary>${esc(question)}</summary><dl><div><dt>Problem</dt><dd>${esc(question)}</dd></div><div><dt>Mögliche Ursache / bestätigtes Verhalten</dt><dd>${esc(cause)}</dd></div><div><dt>Konkrete Lösung / Einschränkung</dt><dd>${esc(solution)}</dd></div></dl></details>`).join('')}</section>`).join('');
  const faqItems = [...document.querySelectorAll('.faq-item')];
  function search() {
    const term = $('#faq-search').value.trim().toLocaleLowerCase('de');
    let count = 0;
    faqItems.forEach(el=>{el.hidden=!el.textContent.toLocaleLowerCase('de').includes(term);if(!el.hidden)count++;});
    document.querySelectorAll('.faq-group').forEach(el=>{el.hidden=![...el.querySelectorAll('.faq-item')].some(x=>!x.hidden);});
    $('#faq-empty').hidden=count>0;
    $('#faq-count').textContent=`${count} von ${faqItems.length} Fragen`;
  }
  $('#faq-search').addEventListener('input',search);
  $('#clear-search').addEventListener('click',()=>{$('#faq-search').value='';search();$('#faq-search').focus();});
  search();

  function showView(hash, focus = true) {
    if(hash==='handbook-content'){$('#handbook-content').focus();return;}
    const id = ['schnellstart','ablauf','faq','loesungen'].includes(hash) ? hash : hash.startsWith('ort-') ? 'ablauf' : 'schnellstart';
    document.querySelectorAll('.book-view').forEach(el=>{el.hidden=el.id!==id;});
    document.querySelectorAll('#book-nav a').forEach(el=>{if(el.getAttribute('href')==='#'+id)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
    if(hash.startsWith('ort-') && document.getElementById(hash)) document.getElementById(hash).scrollIntoView();
    else if(focus) {$('#'+id+' h1').focus();window.scrollTo(0,0);}
    document.title=($('#'+id+' h1').textContent.replace(/\s+/g,' '))+' · Lehrkräftekompendium';
  }
  window.addEventListener('hashchange',()=>showView(location.hash.slice(1)));
  showView(location.hash.slice(1),false);

  // Answers come from the configuration used by index.html, never the obsolete root copy.
  function answerPairs(id) {
    const m=G.minigames[id], p=G.puzzles[id];
    switch(m.type) {
      case 'lock': return m.rings.map(r=>[r.question,r.options[r.answer]]);
      case 'classify': return m.items.map(r=>[r.text,r.ok.map(n=>m.choices[n]).join(' / ')]);
      case 'stamp': return m.items.map(r=>[r.text,r.ok.map(n=>m.choices[n].label).join(' / ')]);
      case 'ropes': return [...m.lines.map(r=>[r.title,r.answer.join(' → ')]),[m.compare.q,m.compare.options[m.compare.answer]]];
      case 'darkroom': return [...m.spots.map(r=>[r.name,m.measures[r.answer]]),[m.final.q,m.final.options[m.final.answer]]];
      case 'battlemap': return p.rows.map(r=>[r.label,r.answer.map(n=>r.options[n]).join(' / ')]);
      case 'slider': return m.quiz.items.map(r=>[r.text,r.ok.map(n=>m.quiz.choices[n]).join(' / ')]);
      case 'citychange': return m.cards.map(r=>[r.text,({vorher:'Vorher',danach:'Nachher',falsch:'Falsch → römischer Altar'})[r.side]]);
      case 'mosaik': return m.cards.map(r=>[r.text,r.ok.map(n=>m.bins[n]).join(' ODER ')]);
      case 'konzil': return m.rounds.map(r=>[r.q,r.options.filter(o=>o.ok).map(o=>o.text).join(' ODER ')]);
      case 'chronik': return [...m.years.map(r=>[String(r.year),r.title]),[m.question,`${m.years[m.gapAnswer].year}–${m.years[m.gapAnswer+1].year}`]];
      case 'argbridge': return [...m.arches.map(r=>[r.head,r.right.text]),[m.final.q,m.final.options.filter(o=>o.ok).map(o=>o.text).join(' ODER ')]];
      default: throw new Error('Unbekannter Rätseltyp: '+m.type);
    }
  }
  function table(pairs) {return `<table><thead><tr><th>Aufgabe / Aussage</th><th>Akzeptierte Lösung</th></tr></thead><tbody>${pairs.map(([a,b])=>`<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('')}</tbody></table>`;}
  const supplements = {
    conflict:'Die drei Walzen richtig einstellen, dann den Griff ziehen. Siegel „Konflikt“ und Botenpass werden erst durch den erfolgreichen Abschluss vergeben.',
    sources:'Acht richtige Zuordnungen aus dem wechselnden Aussagenpool erreichen. „Ruhig“ ist das langsamste der drei Tempi; es ist trotzdem ein Zeitspiel. Nicht mit einer festen Reihenfolge von acht Aussagen rechnen.',
    cases:'Acht richtige Akten aus dem wechselnden Pool bearbeiten. Es gibt keinen Zeitdruck. Die Akten unten sind alle möglichen Fälle, keine feste achtteilige Reihenfolge.',
    sacrifice:'Beide Wege vollständig legen, Hebel ziehen und die Vergleichsfrage beantworten. Erst der gesamte Abschluss gibt Schlüssel und Siegel „Staat“.',
    archive:'Vier Spuren zuordnen und die Schlussfrage beantworten. Danach „Weiter“ und im erhellten Archiv die Schriftrollen auf dem freien Regalplatz ablegen. Dies ist eine zusätzliche Lieferhandlung; die nachfolgende Galerius-Nachricht führt zu 311.',
    map312:'Jeden Marker zuerst antippen, dann das passende Kartenziel wählen und die Karte prüfen. Abschluss mit „Weiter“ bestätigen.',
    vision:'Neun Bildteile zum Christusmonogramm zusammensetzen. Im Modus „Tauschen“ zwei Teile nacheinander antippen; „Vorlage zeigen“ hilft. „Schieben“ ist eine zusätzliche anspruchsvollere Bedienvariante. Danach die vier Aussagen unten einordnen; erst beides zusammen ergibt das Siegel „312“.',
    change:'Drei Tafeln nach „Vorher“, drei nach „Nachher“ und die unzutreffende Alleinreligions-Aussage zum römischen Altar legen.',
    motives:'Alle sieben Tafeln vertretbar zuordnen; die Verteilung muss nicht gleichmäßig sein. Danach eine der zwei akzeptierten Begründungen wählen. „ODER“ in der Tabelle bedeutet: Jedes dieser Felder wird vom Spiel akzeptiert.',
    council:'Sechs Gedanken passend fortsetzen. Rückmeldungen abwarten; die Reihenfolge folgt der Beratung, nicht einer chronologischen Datensortierung.',
    timeline:'Erst sechs Siegel einsetzen. Sechs Ereignisse passend zuordnen; richtige Jahresfelder werden verriegelt und gespeichert. Anschließend die Lücke zwischen 303 und 311 wählen. Die gesamte Wende umfasst auch 313 und die spätere Förderung; die engere Frage hier nennt ausdrücklich Galerius.',
    bridge:'Alle anderen Haupträtsel und eingesetzte Siegel sind Voraussetzung. Vier Bögen nacheinander mit der richtigen Inschriftplatte schließen; danach eine Schlussinschrift wählen. Kein separater dritter Durchgang zum Markieren einfacher Aussagen. „Weiter“ startet das Finale.'
  };
  $('#reveal-solutions').addEventListener('click',()=>{
    if(!$('#solution-content').hidden)return;
    const ids=H.stations.flatMap(s=>s.puzzles||[]);
    $('#solution-content').innerHTML=`<div class="callout warning"><strong>Lehrkräftehilfe geöffnet</strong><p>Erst einen Denkanstoß geben, dann die passende Quelle erneut lesen lassen, zuletzt gemeinsam lösen. Nur bei anhaltender technischer Blockade den lokalen Testmodus gezielt nutzen.</p><button id="hide-solutions" class="button">Lösungsteil wieder schließen</button></div>
      <section class="paper"><h2>Vorbereitende Gegenstände &amp; Siegel</h2><p>Feuerstein am Stadttor und Öllampe im Wohnviertel aufnehmen; beide im Botenbeutel kombinieren. Beim Archivar Rollen übernehmen, drei Seiten lesen und am Ende bestätigen. Den Archivschlüssel gibt der Seilzug; nach dem Archivrätsel die Rollen ablegen.</p>${table(Object.entries(G.puzzles).filter(([,p])=>p.seal).map(([id,p])=>[puzzleName(id),`Siegel „${p.seal}“${p.reward?' · '+G.items[p.reward]:''}`]))}<p>Die sechs gesammelten Siegel in der Basilika zuerst auswählen, dann in die Fassung mit gleicher Bezeichnung setzen.</p></section>
      ${ids.map(id=>`<article class="paper solution" data-puzzle="${id}"><p class="eyebrow">${esc(sceneName(H.stations.find(s=>s.puzzles?.includes(id)).id))}</p><h2>${esc(puzzleName(id))}</h2><p>${esc(supplements[id])}</p><div class="hint-ladder"><h3>Gestuft unterstützen</h3><ol><li><b>Denkanstoß:</b> ${esc(G.puzzles[id].hints[0])}</li><li><b>Gezielter Hinweis:</b> ${esc(G.puzzles[id].hints[1])}</li><li><b>Wenn das nicht reicht:</b> Einen passenden Fall gemeinsam bearbeiten und die untenstehende Lösung begründen lassen. Danach selbstständig weiterarbeiten lassen.</li></ol></div><details class="answer-key"><summary>Erwartete Lösungen / akzeptierte Alternativen</summary>${id==='vision'?`<img class="shield-reference" src="${esc(G.minigames.vision.image)}" alt="Fertiges Schild mit Christusmonogramm als Lösungsvorlage">`:''}${table(answerPairs(id))}${id==='motives'?`<h3>Beide akzeptierten Begründungen</h3>${list(G.minigames.motives.reasons.options.filter(o=>o.ok).map(o=>o.text))}`:''}</details><p class="transfer"><b>Fachlicher Hintergrund &amp; typische Fehlvorstellung</b> ${esc(H.misconceptions[id])}</p></article>`).join('')}
      <section class="paper"><h2>Abschlusssequenz: Drei treffende Aussagen</h2><p>Nach der Brücke beginnt eine weitere Sicherungsaufgabe: Aus sechs Aussagen drei zutreffende auswählen. Erst dann erwacht die Chronik. Richtige Aussagen sind:</p>${list(H.finaleStatements)}<p>Die übrigen Aussagen („immer und überall verfolgt“, „313 sofort die einzige Religion“, „Taufe kurz nach dem Sieg“) sind zu verwerfen. Konstantin wird erst 337 getauft. Nach den drei Treffern kann der Rückblick mit „Rückblick überspringen“ beendet werden; am Ende stehen „Stadt weiter erkunden“, „Neues Spiel“ und „Notizbuch öffnen“ zur Verfügung.</p><div class="hint-ladder"><b>Gestufte Hilfe:</b> Erst nach den Jahreszahlen fragen, dann 311/313 von 337 unterscheiden lassen, zuletzt die drei Aussagen gemeinsam am Notizbuch prüfen.</div></section>
      <section class="paper"><h2>Bonusspiele: Unterstützung ohne Pflichtlösung</h2>${bonuses.map(b=>`<details class="answer-key"><summary>${esc(b.title)}</summary><p>${esc(b.task)}</p><p>${esc(b.help)}</p></details>`).join('')}</section>
      <section class="paper"><h2>Wenn trotz Hilfe nichts weitergeht</h2><p>Zuerst Voraussetzungen und FAQ prüfen; aktuelle Sicherung erzeugen. Der vorhandene lokale „Lehrkraftmodus“ öffnet sich durch fünf Sekunden Halten des Spieltitels oder mit Fokus auf dem Titel und Umschalt + Enter.</p><ul><li>„Ort direkt öffnen“ schaltet einen Ort frei; andere Voraussetzungen können weiterhin fehlen.</li><li>„Rätsel gelöst / ungelöst“ verändert den lokalen Hauptspielstand; „Gegenstände hinzufügen“ ergänzt das Inventar.</li><li>„Alle sechs Siegel geben“ gibt Siegel, löst aber nicht automatisch alle Haupträtsel.</li><li>„Finale direkt testen“ öffnet die Basilika mit Siegeln; es umgeht die übrigen Abschlussvoraussetzungen nicht vollständig.</li><li>Beim Zurücknehmen einzelner Rätsel bleiben bereits geöffnete Orte zugänglich. „Spielstand löschen“ führt zur Bestätigung für ein neues Spiel.</li></ul><p class="warning-text">Dieser Modus ist kein geschützter Adminbereich und keine Fernhilfe. Nur am betroffenen Gerät bewusst eingreifen und der Klasse den fachlichen Schritt anschließend erklären.</p></section>`;
    $('#solution-gate').hidden=true;$('#solution-content').hidden=false;
    $('#print-solutions').disabled=false;
    $('#hide-solutions').addEventListener('click',()=>{
      $('#solution-content').replaceChildren();$('#solution-content').hidden=true;$('#solution-gate').hidden=false;
      $('#print-solutions').checked=false;$('#print-solutions').disabled=true;$('#reveal-solutions').focus();
    });
    $('#hide-solutions').focus();
  });

  // Print all instructional sections, including filtered/closed FAQ; solutions opt in.
  let printState=null;
  const preparePrint=()=>{
    if(printState)return;
    printState=[...document.querySelectorAll('details')].map(el=>[el,el.open]);
    printState.forEach(([el])=>{el.open=true;});
    document.body.classList.add('print-handbook');
    document.body.classList.toggle('with-solutions',$('#print-solutions').checked&&!$('#solution-content').hidden);
  };
  const finishPrint=()=>{
    document.body.classList.remove('print-handbook','with-solutions');
    printState?.forEach(([el,open])=>{el.open=open;});printState=null;
  };
  window.addEventListener('beforeprint',preparePrint);
  window.addEventListener('afterprint',finishPrint);
  $('#print-book').addEventListener('click',()=>{preparePrint();try{window.print();}finally{finishPrint();}});
})();
