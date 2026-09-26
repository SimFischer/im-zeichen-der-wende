// Run: npm install --no-save linkedom; node tests/scenegames.cjs
// Prüft die überarbeiteten Szenen-Rätsel: geöffnete Stadt, Konzil, Chronik.
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom'),root=path.resolve(__dirname,'..');
let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++;};
function boot(){
 const {window}=parseHTML('<!doctype html><html lang="de"><body><div id="work"></div></body></html>');
 const timers=[];const wins=[];
 window.HTMLElement.prototype.focus=function(){};
 window.document.addEventListener('minigame-win',e=>wins.push(e.detail));
 const ctx={window,document:window.document,console,CustomEvent:window.CustomEvent,setTimeout:(f,t)=>{timers.push(f);return timers.length;},clearTimeout(){}};
 vm.createContext(ctx);
 for(const f of ['data/game-data.js','scenegames.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
 const flush=()=>{while(timers.length)timers.shift()();};
 return {window,G:window.GAME,M:window.MiniGames,work:window.document.querySelector('#work'),wins,flush};
}
const txt=el=>el.textContent.replace(/\s+/g,' ').trim();

/* ---------- Die geöffnete Stadt ---------- */
{
 const {G,M,work,wins,flush}=boot();const cfg=G.minigames.change;
 ok(cfg.type==='citychange','Stadt nutzt das neue Vorher/Nachher-Rätsel');
 ok(cfg.art.bg==='assets/minigames/open-city/open-city.png','Stadt-Hintergrund aus open-city');
 const city=G.scenes.find(s=>s.id==='city');
 ok(city.image==='assets/minigames/open-city/open-city.png'&&city.discover,'Szene zeigt das neue Stadtbild als Entdeckungsszene');
 const changes=city.hotspots.filter(h=>h[3]==='talk').map(h=>h[4]);
 for(const k of ['openchurch','returned','building','sign','cults'])ok(changes.includes(k)&&G.talks[k],'Veränderung auffindbar: '+k);
 ok(changes.every(k=>G.talks[k][1].length<=130),'Erklärungen sind kurz');
 ok(city.hotspots.some(h=>h[3]==='puzzle'&&h[4]==='change'),'Rätsel-Hotspot vorhanden');
 M.citychange('change',cfg,work);
 const root=work.querySelector('.city-game'),voice=()=>txt(root.querySelector('.sg-voice'));
 const card=t=>[...root.querySelectorAll('.city-card')].find(c=>txt(c).includes(t));
 const board=s=>root.querySelector(`[data-target="${s}"]`);
 ok(root.querySelectorAll('.city-card').length===7,'Sieben Wachstafeln');
 ok(['Gottesdienste verboten','Besitz beschlagnahmt','Schriften zerstört','Religionsausübung erlaubt','Besitz zurückgegeben','Kirchenbau gefördert'].every(t=>card(t)),'Alle Vorher/Nachher-Tafeln vorhanden');
 // Die falsche Aussage wird ausdrücklich abgefangen
 card('einzigen erlaubten Religion').click();board('danach').click();
 ok(voice()==='Nein. Andere Religionen und traditionelle römische Kulte bestanden zunächst weiter.','Falsche 313-Aussage wird mit der vorgegebenen Rückmeldung abgelehnt');
 ok(!card('einzigen erlaubten Religion').classList.contains('placed'),'Falsche Aussage bleibt liegen');
 card('Gottesdienste verboten').click();board('danach').click();ok(!card('Gottesdienste verboten').classList.contains('placed'),'Falsche Seite wird nicht angenommen');
 card('Kirchenbau gefördert').click();board('falsch').click();ok(voice().includes('Diese Tafel stimmt'),'Richtige Aussage gehört nicht zum Altar');
 for(const c of cfg.cards.filter(c=>c.side!=='falsch')){card(c.text).click();board(c.side).click();ok(card(c.text).classList.contains('placed'),'Abgelegt: '+c.text);}
 ok(!wins.length,'Noch kein Abschluss ohne die falsche Tafel');
 card('einzigen erlaubten Religion').click();board('falsch').click();ok(voice().includes('Andere Religionen und traditionelle römische Kulte bestanden zunächst weiter'),'Falsche Aussage am Altar erkannt');
 flush();root.querySelector('.sg-next').click();ok(wins.join()==='change','Abschluss meldet den Sieg');
}
/* ---------- Konzil ---------- */
{
 const {G,M,work,wins,flush}=boot();const cfg=G.minigames.council;
 ok(cfg.type==='konzil','Konzil nutzt die neue Beratung');ok(cfg.rounds.length>=5,'Mindestens fünf Dialogrunden ('+cfg.rounds.length+')');
 ok(cfg.art.bg.endsWith('council/council-scene.png')&&cfg.art.people.endsWith('council/council-officials.png'),'Konzil-Grafiken eingebunden');
 ok(cfg.rounds.every(r=>r.options.filter(o=>o.ok).length===1&&r.options.length>=3&&r.options.every(o=>o.reply)),'Jede Runde: eine passende, zwei falsche Antworten mit Reaktion');
 ok(cfg.synthesis==='Kirchliche Einheit konnte für Konstantin auch politische Stabilität bedeuten.','Synthese wie vorgegeben');
 M.konzil('council',cfg,work);const root=work.querySelector('.council-game');
 ok(root.querySelectorAll('.council-person').length>=5,'Mehrere große Gesprächspartner');
 cfg.rounds.forEach((R,i)=>{
  ok(root.__debug.round()===i,'Runde '+(i+1)+' aktiv');
  ok(txt(root.querySelector('.council-bubble p'))===R.q,'Frage erscheint in der Sprechblase');
  const wrong=R.options.findIndex(o=>!o.ok),right=R.options.findIndex(o=>o.ok);
  root.querySelector(`.council-answer[data-i="${wrong}"]`).click();
  ok(txt(root.querySelector('.council-bubble p'))===R.options[wrong].reply,'Falsche Antwort: fachliche Reaktion einer Figur');
  ok(root.__debug.round()===i,'Falsche Antwort führt nicht weiter');
  root.querySelector(`.council-answer[data-i="${right}"]`).click();
  ok(root.querySelector('.council-bubble').classList.contains('good'),'Richtige Antwort: zustimmende Reaktion');
  ok(root.querySelector('.council-person.speaking'),'Eine Figur tritt hervor');
  flush();
 });
 ok(txt(root.querySelector('.sg-synth'))===cfg.synthesis,'Synthese am Ende');ok(!wins.length,'Abschluss erst nach dem Weiter-Knopf');
 root.querySelector('.sg-next').click();ok(wins.join()==='council','Konzil meldet den Sieg');
}
/* Physical chronicle, feedback and transfer question: chronicle-lifecycle.cjs. */
/* ---------- Grafiken und Ersatz ---------- */
{
 const files=['council/council-scene.png','council/council-officials.png','timeline/chronicle-room.png','timeline/timeline-assets.png','open-city/open-city.png','amphora/amphora-dock.png','amphora/amphora-assets.png','amphora/amphora-merchant.png'];
 const code=fs.readFileSync(path.join(root,'data/game-data.js'),'utf8')+fs.readFileSync(path.join(root,'scenegames.js'),'utf8')+fs.readFileSync(path.join(root,'bonus/amphoren.js'),'utf8');
 for(const f of files){ok(code.includes('assets/minigames/'+f),'Pfad im Code: '+f);ok(fs.existsSync(path.join(root,'assets/minigames',f)),'Datei vorhanden: '+f);}
 const css=fs.readFileSync(path.join(root,'scenegames.css'),'utf8');ok(css.includes('.sg-no-art'),'Ersatzdarstellung für fehlende Grafiken');
}

/* ---------- Die Mosaik des Kaisers ---------- */
{
 const {G,M,work,wins,flush,window}=boot();const cfg=G.minigames.motives;const choices=[];window.document.addEventListener('minigame-choice',e=>choices.push(e.detail));
 ok(cfg.type==='mosaic'&&cfg.cards.length===7&&cfg.bins.join()==='Glaube,Politik / Herrschaft,Zusammenspiel','Mosaik: sieben Karten, drei Schalen');
 cfg.cards.forEach(c=>{ok(c.ok.includes(c.best)&&c.why,'Schwerpunkt und Erklärung: '+c.text);[0,1,2].filter(b=>!c.ok.includes(b)).forEach(b=>ok(c.wrong&&c.wrong[b]&&!/^\s*falsch/i.test(c.wrong[b]),'Fachliche Rückmeldung für unpassende Schale: '+c.text));});
 ok(cfg.cards.find(c=>/Überzeugung/.test(c.text)).ok.join()==='0','Persönliche Überzeugung gehört eindeutig zum Glauben');
 ok(cfg.cards.find(c=>/Förderung/.test(c.text)).ok.length===3,'Mehrdeutige Karte (Förderung) wird nirgends als falsch bewertet');
 ok(cfg.reasons===G.puzzles.motives.reasons&&cfg.reasons.options.filter(o=>o.ok).length>=2,'Begründungen aus dem Rätsel, mehrere tragfähig');
 M.mosaic('motives',cfg,work);const root=work.querySelector('.mosaic-game'),voice=()=>txt(root.querySelector('.sg-voice'));
 const card=t=>[...root.querySelectorAll('.wg-card')].find(c=>txt(c)===t),pan=b=>root.querySelector(`.mosaic-field[data-target="${b}"]`);
 ok(!root.querySelector('textarea,input'),'Kein Textfeld');
 card('Persönliche religiöse Überzeugung').click();pan(1).click();
 ok(!card('Persönliche religiöse Überzeugung').classList.contains('placed')&&/kein politisches Ziel/.test(voice()),'Unpassende Schale: Karte bleibt liegen, fachliche Rückmeldung');
 cfg.cards.forEach(c=>{card(c.text).click();pan(c.best).click();ok(card(c.text).classList.contains('placed'),'Abgelegt: '+c.text);});
 ok(root.__debug.placed()===7&&root.classList.contains('assembled'),'Seven motifs form the complete picture');ok(!root.querySelector('.wg-beam'),'No scale or tilt');
 flush();ok(root.__debug.phase()==='reason'&&root.querySelectorAll('.wg-reason').length===4,'Danach: Begründung wählen');
 const bad=[...root.querySelectorAll('.wg-reason')].find(b=>!cfg.reasons.options[+b.dataset.k].ok);bad.click();
 ok(bad.classList.contains('tried')&&!choices.length&&!wins.length,'Untragfähige Begründung: Rückmeldung, kein Abschluss');
 const good=[...root.querySelectorAll('.wg-reason')].find(b=>cfg.reasons.options[+b.dataset.k].ok);good.click();
 ok(choices.length===1&&choices[0].id==='motives','Gewählte Begründung fürs Notizbuch gemeldet');
 flush();root.querySelector('.sg-next').click();ok(wins.join()==='motives','Abschluss meldet den Sieg');
}
console.log(`PASS: Stadt, Mosaik, Konzil (${6} Runden), Chronik, Asset-Pfade – ${checks} Prüfungen`);
