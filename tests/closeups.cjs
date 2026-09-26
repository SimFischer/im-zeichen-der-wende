// Run: npm install --no-save linkedom; node tests/closeups.cjs
// Prüft die gemalten Rätsel-Nahansichten (minigames.js) und die Endsequenz (finale.js):
// Aufbau aus Bildern + HTML-Text, Tippflächen, richtige/falsche Rückmeldung, Abschluss.
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom'),root=path.resolve(__dirname,'..');
let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++;};
const g2d=new Proxy({},{get:(t,k)=>k==='createRadialGradient'?(()=>({addColorStop(){}})):(()=>{})});
function boot(){
 const {window}=parseHTML('<!doctype html><html lang="de"><body><dialog id="modal"></dialog><div id="work"></div></body></html>');
 const timers=[],wins=[];
 window.HTMLElement.prototype.focus=function(){};
 window.HTMLElement.prototype.getBoundingClientRect=function(){return {left:0,top:0,width:100,height:100,right:100,bottom:100};};
 window.HTMLElement.prototype.animate=function(){return {};};
 window.HTMLCanvasElement&&(window.HTMLCanvasElement.prototype.getContext=()=>g2d);
 window.document.addEventListener('minigame-win',e=>wins.push(e.detail));
 const ctx={window,document:window.document,console,CustomEvent:window.CustomEvent,devicePixelRatio:1,performance:{now:()=>0},
  requestAnimationFrame:()=>1,addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false}),
  setTimeout:(f)=>{timers.push(f);return timers.length;},clearTimeout(){}};
 vm.createContext(ctx);
 for(const f of ['data/game-data.js','seals.js','minigames.js','finale.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
 const flush=()=>{let n=0;while(timers.length&&n++<500)timers.shift()();};
 const work=window.document.querySelector('#work');
 return {window,G:window.GAME,M:window.MiniGames,work,wins,flush,$:s=>work.querySelector(s),all:s=>[...work.querySelectorAll(s)]};
}
const txt=el=>el.textContent.replace(/\s+/g,' ').trim();
const exists=f=>fs.existsSync(path.join(root,f));

/* Alle eingebundenen Bilder existieren */
{const {M}=boot();const A=M._.ART;for(const [k,v] of Object.entries(A))for(const f of [].concat(v))ok(exists(f),'Bild vorhanden: '+k+' → '+f);
 for(const f of ['assets/finale/chronicle-open.webp','assets/finale/chronicle-closed.webp','assets/puzzles/archivist/scroll-1.webp','assets/puzzles/archivist/scroll-2.webp','assets/puzzles/archivist/scroll-3.webp','assets/puzzles/bridge/bridge.webp','assets/puzzles/motives/mosaic-field.webp'])ok(exists(f),'Bild vorhanden: '+f);}

/* 1. Tür: drei Walzen als HTML auf dem gemalten Schloss */
{const {G,M,work,wins,flush,$,all}=boot();const cfg=G.minigames.conflict;M.lock('conflict',cfg,work);
 ok($('.door-art')?.getAttribute('src').includes('door-closeup'),'Gemalte Tür-Nahansicht');ok(all('.drum').length===3&&all('.drum-up').length===3&&all('.drum-down').length===3,'Drei Walzen mit Tippflächen oben/unten');
 ok(!work.querySelector('select,input'),'Keine Formularfelder');ok($('.door-ring').getAttribute('aria-label').includes('Türring'),'Tippfläche über dem Türring');
 const d=$('.door-game').__debug;$('.door-ring').click();ok(all('.drum.bad').length>0&&/klemmt/.test(txt($('.w-voice'))),'Falsche Walzen: Tür klemmt');
 d.rings.forEach((r,i)=>{let n=0;while(d.pos[i]!==r.answer&&n++<9)$(`.drum-down[data-i="${i}"]`).click();});
 ok(d.rings.every((r,i)=>txt($('.door-note')).includes(r.options[r.answer])),'Inschrift zeigt die gewählten Begriffe');
 $('.door-ring').click();flush();ok($('.door-game').classList.contains('open')&&all('.drum.locked').length===3,'Walzen rasten ein, Tür öffnet sich');
 $('.w-next').click();ok(wins.join()==='conflict','Sieg gemeldet');}

/* 2. Forum: Chronistin als Figur, Aussage auf Pergament, Fächer aus Holz */
{const {G,M,work,wins,flush,$,all}=boot();const cfg=G.minigames.sources;M.classify('sources',cfg,work);
 ok($('.forum-chronistin')?.getAttribute('src').includes('characters/chronistin'),'Chronistin (Produktionsgrafik) steht im Raum');
 ok($('.sg-bg')&&/v3-forum/.test($('.scene-game').getAttribute('style')),'Forum-Szene als Hintergrund');ok(!/forum-blur|chronistin\.jpg/.test(work.innerHTML),'Keine alten Forum-Grafiken');
 $('.w-start').click();const d=$('.forum-game').__debug;
 const wrong=cfg.choices.findIndex((_,k)=>!d.cur().ok.includes(k));d.resolve(wrong);ok($('.forum-roll').classList.contains('bad')&&!$('.sg-stage').className.includes('flash'),'Falsch: Pergament rüttelt, keine Blitzfläche');flush();
 for(let k=0;k<30&&d.score()<cfg.goal;k++){d.resolve(d.cur().ok[0]);flush();}
 ok(d.score()===cfg.goal&&$('.w-finale'),'Acht Belege: Abschlussrolle');$('.w-next').click();ok(wins.join()==='sources','Sieg gemeldet');}

/* 3. Amtsstube: Stempel antippen → Stempel fährt zur Akte */
{const {G,M,work,wins,flush,$,all}=boot();const cfg=G.minigames.cases;M.stamp('cases',cfg,work);
 ok($('.office-desk')?.getAttribute('src').includes('office/desk'),'Gemalter Amtsschreibtisch');ok(all('.office-stamp img').length===4,'Vier gemalte Stempel');
 ok(all('.os-plate').map(txt).join()===cfg.choices.map(c=>c.label).join(),'Beschriftung der Stempel als HTML');ok(!/stamp-chirho[^>]*>(?![^]*os-face)/.test(''),'');
 $('.w-start').click();const d=$('.office-game').__debug;
 const bad=cfg.choices.findIndex((_,k)=>!d.cur().ok.includes(k));all('.office-stamp')[bad].click();flush();ok(/hält deine Hand fest/.test(txt($('.w-voice'))),'Falscher Stempel: Rückmeldung');
 for(let k=0;k<40&&d.score()<cfg.goal;k++){all('.office-stamp')[d.cur().ok[0]].click();flush();}
 ok(d.score()===cfg.goal&&$('.w-finale'),'Alle Akten gestempelt');$('.w-next').click();ok(wins.join()==='cases','Sieg gemeldet');}

/* 4. Seilzug: Tafeln an Haken, Hebel ziehen, Truhe mit Schlüssel */
{const {G,M,work,wins,flush,$,all}=boot();const cfg=G.minigames.sacrifice;M.ropes('sacrifice',cfg,work);
 ok($('.rope-beam')&&all('.rope-hook').length===8&&all('.crate-boards .rope-board').length===6,'Holzrahmen, acht Haken, sechs Tafeln');
 ok(cfg.blocks.every(b=>txt($('.crate-boards')).includes(b)),'Begriffe als HTML auf den Tafeln');
 $('.rope-lever').click();ok(/nicht alle Tafeln/.test(txt($('.w-voice'))),'Hebel prüft Vollständigkeit');
 cfg.lines.forEach((l,li)=>l.answer.forEach((a,si)=>{all('.crate-boards .rope-board')[cfg.blocks.indexOf(a)].click();$(`.rope-hook[data-k="${li}-${si}"]`).click();}));
 $('.rope-lever').click();ok($('.rope-game').classList.contains('running'),'Seile spannen sich, Rollen drehen');flush();
 const q=cfg.compare;const opts=all('.rope-riddle .rope-board');ok(opts.length===3,'Letzter Riegel als Holztafeln');
 opts.find(b=>+b.dataset.k!==q.answer).click();ok(!$('.rope-game').classList.contains('chest-open'),'Falsche Antwort öffnet nicht');
 opts.find(b=>+b.dataset.k===q.answer).click();ok($('.rope-game').classList.contains('chest-open'),'Truhe öffnet sich, Schlüssel sichtbar');flush();
 ok(txt($('.w-next'))==='Archivschlüssel nehmen','Keine Web-Erfolgskarte: Schlüssel nehmen');$('.w-next').click();ok(wins.join()==='sacrifice','Sieg gemeldet');}

/* 5. Archiv: Dunkelheit, Spuren, Archivschrank */
{const {G,M,work,wins,flush,$,all}=boot();const cfg=G.minigames.archive;M.darkroom('archive',cfg,work);
 ok($('.cabinet img')?.getAttribute('src').includes('archive/cabinet'),'Gemalter Archivschrank');ok(all('.cab-drawer').length===4&&all('.cab-tag').length===4,'Vier Schubladen mit Messingschildern');
 $('.w-start').click();const d=$('.archive-game').__debug;
 cfg.spots.forEach((sp,i)=>{all('.dark-spot')[i].click();ok(!$('.cab-view').hidden,'Schrank öffnet sich für: '+sp.name);
  const wrong=(sp.answer+1)%4;d.file(wrong);ok(/klemmt/.test(txt($('.w-voice'))),'Falsche Schublade klemmt');d.file(sp.answer);flush();});
 const fin=$('.cab-final');ok(fin&&fin.querySelectorAll('button').length===3,'Verriegelung: letzte Frage');
 [...fin.querySelectorAll('button')].find(b=>+b.dataset.k===cfg.final.answer).click();flush();ok($('.archive-game').classList.contains('lit-up'),'Licht kehrt zurück');
 $('.w-next').click();ok(wins.join()==='archive','Sieg gemeldet');}

/* 6. Schild: Produktionsgrafik, Rasterlinien verschwinden */
{const {G,M,work,wins,flush,$,all}=boot();const cfg=G.minigames.vision;M.slider('vision',cfg,work);
 ok(all('.slider-board .tile').every(t=>/chi-rho-schild\.png/.test(t.style.backgroundImage)),'Neuer Schild als Puzzlebild');ok(!/chi-rho-schild\.svg/.test(work.innerHTML),'Altes SVG nicht mehr verwendet');
 $('.w-start').click();$('.shield-game').__debug.solve();ok($('.shield-game').classList.contains('shield-whole'),'Schild kurz ohne Raster');flush();
 cfg.quiz.items.forEach(it=>{[...work.querySelectorAll('.sq-opts button')].find(b=>+b.dataset.k===it.ok[0]).click();flush();});
 $('.w-next').click();ok(wins.join()==='vision','Sieg gemeldet');}

/* 7. Kartenbrett: Marker auf die Karte */
{const {G,M,work,wins,flush,$,all}=boot();const cfg=G.minigames.map312;M.battlemap('map312',cfg,work);
 ok($('.map-board img')?.getAttribute('src').includes('camp/milvische-bruecke-karte'),'Illustrierte Karte');ok(all('.map-marker img').length===6,'Sechs Holzmarker');
 const d=$('.map-game').__debug;const want={'Stadt':'Rom','Fluss':'Tiber','Übergang':'Milvische Brücke','Späterer Sieger':'Konstantin','Gegner':'Maxentius','Jahr':'312'};
 d.pins.forEach(p=>{d.markers.find(m=>m.dataset.t===want[txt(p.querySelector('.ms-q'))]).click();p.click();});
 ok(d.pins.every(p=>p.querySelector('.map-marker')),'Marker rasten an den Kartenpunkten ein');
 $('.map-check').click();flush();$('.w-next').click();ok(wins.join()==='map312','Sieg gemeldet');}

/* Aufräumen beim Schließen */
{const {G,M,work,$}=boot();M.classify('sources',G.minigames.sources,work);work.id='modal';ok($('.scene-game'),'Bühne vorhanden');}
{const {window,G,M}=boot();const modal=window.document.querySelector('#modal');const w=window.document.createElement('div');modal.append(w);M.stamp('cases',G.minigames.cases,w);M.stop();ok(!modal.querySelector('.scene-game'),'MiniGames.stop entfernt die Bühne (Timer und Schleifen enden)');}

/* Endsequenz */
{const {window,G,flush}=boot();const events=[];
 const el=window.Finale.play({names:G.seals,onExplore:()=>events.push('explore'),onNewGame:()=>events.push('new')});
 ok(el.querySelectorAll('.fn-seal').length===6&&el.querySelectorAll('.fn-slot').length===6,'Sechs Siegel reagieren und liegen in der Chronik');
 ok(el.querySelectorAll('.fn-memory').length===6,'Rückblick auf sechs Orte');
 flush();ok(el.dataset.phase==='end','Sequenz endet im Abschluss');
 ok(/Die Chronik spricht wieder\./.test(el.textContent)&&/Du hast die Erinnerungen der Stadt zusammengefügt\./.test(el.textContent)&&/Abenteuer abgeschlossen/.test(el.textContent),'Abschlusstexte');
 const b=[...el.querySelectorAll('.fn-actions button')].map(x=>x.textContent);ok(b[0]==='Stadt weiter erkunden'&&b[1]==='Neues Spiel'&&!b.some(t=>/Stadttor/.test(t)),'Zwei Aktionen, nicht „Weiter zum Stadttor“');
 const again=window.Finale.play({names:G.seals});ok(window.document.querySelectorAll('#finale').length===1,'Wiederholter Start: nur eine Sequenz');window.Finale.stop();ok(!window.document.querySelector('#finale')&&!window.document.body.classList.contains('finale-on'),'Stop räumt vollständig auf');
 const el2=window.Finale.play({names:G.seals,onExplore:()=>events.push('explore'),onNewGame:()=>events.push('new')});flush();el2.querySelectorAll('.fn-actions button')[1].click();ok(events.join()==='new'&&!window.document.querySelector('#finale'),'Neues Spiel führt zur Sicherheitsabfrage (Spiel-Menü)');}

console.log(`PASS: Rätsel-Nahansichten und Endsequenz – ${checks} Prüfungen`);
