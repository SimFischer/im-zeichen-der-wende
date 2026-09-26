/* Bonusspiel „Schildwall“: gemeinsame Abwehrrichtung, Salven, drei Treffer, Überlebenszeit, Bestzeit.
   Run: npm install --no-save linkedom; node tests/schildwall.cjs */
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom'),root=path.resolve(__dirname,'..');
let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++;};
const storage=new Map();
function boot(avail){
 const {window}=parseHTML('<html><body><dialog id="modal"></dialog></body></html>');
 window.HTMLElement.prototype.focus=function(){};
 window.HTMLCanvasElement.prototype.getContext=function(){return new Proxy({},{get:(t,k)=>k in t?t[k]:()=>({addColorStop(){}}),set:(t,k,v)=>{t[k]=v;return true;}});};
 const timers=[];window.WendeUI={open:(t,html)=>{window.document.querySelector('#modal').innerHTML=html;},close(){}};
 const ctx={window,document:window.document,console,localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,v)},requestAnimationFrame:()=>1,cancelAnimationFrame(){},
  setTimeout:f=>{timers.push(f);return timers.length;},clearTimeout(){},setInterval:()=>0,clearInterval(){},matchMedia:()=>({matches:false}),ResizeObserver:class{observe(){}disconnect(){}}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(root+'/bonusgames.js','utf8'),ctx);vm.runInContext(fs.readFileSync(root+'/bonus/schildwall.js','utf8'),ctx);
 const B=window.BonusGames;if(avail)B.games.schildwall.art.available=avail;
 B.update({solved:['map312']});B.start('schildwall',true);
 const $=s=>window.document.querySelector(s),all=s=>[...window.document.querySelectorAll(s)];
 return {window,B,$,all,timers,flush:()=>{while(timers.length)timers.shift()();}};
}
const src=fs.readFileSync(root+'/bonus/schildwall.js','utf8');
ok(!/leute\.webp|soldiers\[|sel=-1|'down'/.test(src),'Alte Einzel-Schild-Mechanik entfernt (keine Einzelsoldaten, kein „unten“)');
let env=boot();const {$,all}=env;
ok(/Milvischen Brücke/.test($('.bonus-introcard').textContent),'Einleitung verortet das Spiel an der Milvischen Brücke');
$('.bonus-introcard .primary').click();
let D=$('.bonus-stage').__debug,S=D.S();
ok(S.phase==='play'&&S.lives===3&&S.clock===0,'Start: drei Treffer frei, Zeit 0');
const btns=all('.sw-pad button');ok(btns.map(b=>b.dataset.d).join()==='left,up,right','Drei große Richtungsknöpfe: links, oben, rechts');
ok(btns.every(b=>/Links|Oben|Rechts/.test(b.textContent)),'Knöpfe beschriftet');
ok(!$('.schild-pad')&&!/Soldat antippen/.test($('.bonus-stage').innerHTML),'Keine Auswahl einzelner Soldaten');
btns[0].dispatchEvent(new env.window.Event('pointerdown'));S=D.S();ok(S.dir==='left'&&btns[0].classList.contains('on'),'Knopf reagiert sofort (pointerdown)');
for(let i=0;i<10;i++)D.update(1/60);ok(S.tilt.left>.9&&S.tilt.up<.1,'Alle Schilde schwenken gemeinsam (eine Stellung für den ganzen Trupp)');
ok(/for\(const pass of \['body','shield'\]\)men\.forEach/.test(src),'Formation: fünf Legionäre, gezeichnet als geschlossene Schildreihe');
D.update(.5);ok(S.clock>.6,'Zeit läuft');
// Salve abwehren
const until=(f,max=600)=>{let n=0;while(!f()&&n++<max)D.update(1/60);};
S.next=0;D.update(1/60);let v=S.volleys[S.volleys.length-1];ok(v&&['left','up','right'].includes(v.dir)&&v.arrows.length>=5,'Pfeilsalve mit mehreren Pfeilen aus einer Richtung');
D.setDir(v.dir);S.next=99;until(()=>v.done);ok(S.blocked===1&&S.lives===3,'Richtige Richtung: Salve abgewehrt');ok(S.fx.some(f=>f.k==='block'),'Blockeffekt');
ok($('.sw-waves b').textContent==='1','Anzeige abgewehrter Salven');
// Treffer
S.next=0;D.update(1/60);v=S.volleys[S.volleys.length-1];D.setDir(['left','up','right'].find(d=>d!==v.dir));S.next=99;until(()=>v.done);
ok(S.lives===2&&S.fx.some(f=>f.k==='hit')&&all('.sw-life.lost').length===1,'Falsche Richtung: Treffer, Anzeige zeigt noch zwei');
for(let k=0;k<2;k++){S.next=0;D.update(1/60);v=S.volleys[S.volleys.length-1];D.setDir(['left','up','right'].find(d=>d!==v.dir));S.next=99;until(()=>v.done);}
ok(S.lives===0&&S.phase==='over','Nach drei Treffern ist Schluss');
const t1=S.clock;D.update(1);ok(S.clock===t1,'Zeit stoppt beim Spielende');
const key=env.B.games.schildwall.BEST_KEY;ok(key==='im-zeichen-der-wende:schildwall-best-v1','Eigener Speicherschlüssel');
ok(JSON.parse(storage.get(key)).ms===Math.round(t1*1000)&&S.result.record,'Erste Zeit wird Bestzeit');
env.flush();ok(/Durchgehalten/.test($('.bonus-endcard').textContent)&&/Abgewehrte Salven: 1/.test($('.bonus-endcard').textContent),'Abschluss zeigt Zeit und abgewehrte Salven');
ok(/Laktanz/.test($('.bonus-endcard').textContent),'Vorsichtige historische Einordnung');
ok(env.B.progress().won.includes('schildwall'),'Bonusfortschritt gespeichert');
// Kürzere Zeit überschreibt nicht, längere schon
const best=JSON.parse(storage.get(key)).ms;
const quickLoss=()=>{const S=D.S();for(let k=0;k<3;k++){S.next=0;D.update(1/60);const v=S.volleys[S.volleys.length-1];D.setDir(['left','up','right'].find(d=>d!==v.dir));S.next=99;let n=0;while(!v.done&&n++<600)D.update(1/60);}return S;};
env=boot();env.$('.bonus-introcard .primary').click();D=env.$('.bonus-stage').__debug;

S=D.S();S.clock=0;S.next=99;let r=quickLoss();ok(r.clock*1000<best&&!r.result.record&&JSON.parse(storage.get(key)).ms===best,'Kürzere Zeit überschreibt die Bestzeit nicht');
env=boot();ok(/Deine längste Zeit/.test(env.$('.bonus-introcard').textContent)&&env.$('.sw-best').textContent!=='–','Bestzeit bleibt nach dem Neuladen');
env.$('.bonus-introcard .primary').click();D=env.$('.bonus-stage').__debug;S=D.S();S.next=99;D.update(30);r=quickLoss();ok(r.result.record&&JSON.parse(storage.get(key)).ms>best,'Längere Zeit wird neue Bestzeit');
storage.set(key,'kaputt');env=boot();ok(env.$('.sw-best').textContent==='–','Kaputter Speicherwert: sicherer Standard');
// Schwierigkeit
const p0=D.pace(0),p60=D.pace(60),p200=D.pace(200);ok(p0.gap>p60.gap&&p60.gap>=p200.gap&&p0.fly>p200.fly&&p200.gap>=.9&&p200.fly>=.9,'Tempo steigt an, bleibt aber fair (Flugzeit ≥ 0,9 s)');
ok(p0.double===0&&p200.double>0,'Doppelsalven erst nach einer Eingewöhnung');
// Fairness: ein Spieler mit 0,45 s Reaktionszeit hält mindestens 90 Sekunden durch
{const e=boot();e.$('.bonus-introcard .primary').click();const D=e.$('.bonus-stage').__debug;const S=D.S();const dt=1/60;
 for(let i=0;i<60*120&&S.phase==='play';i++){const v=S.volleys.filter(v=>!v.done&&v.t>=.45).sort((a,b)=>(b.t/b.fly)-(a.t/a.fly))[0];if(v)D.setDir(v.dir);D.update(dt);}
 ok(S.clock>=90,'Fair: mit 0,45 s Reaktionszeit ≥ 90 s durchgehalten ('+S.clock.toFixed(0)+' s, '+S.blocked+' Salven)');}
// Pause
env=boot();env.$('.bonus-introcard .primary').click();env.$('.bonus-pause').click();ok(env.$('.bonus-pausecard'),'Pause funktioniert');
// Grafiken
ok(!/assets\/bonus\/shieldwall/.test(env.$('.bonus-stage').innerHTML),'Ohne Eintrag werden keine Bilddateien angefordert');
env=boot(['ui']);ok(env.$('.sw-hud').classList.contains('art-ui'),'Eingetragene UI-Grafik wird verwendet');
const A=env.B.games.schildwall.art;ok(A.dir==='assets/bonus/shieldwall/'&&['shieldwall-bg.png','shieldwall-squad.png','shieldwall-shields-left.png','shieldwall-shields-up.png','shieldwall-shields-right.png','shieldwall-arrows.png','shieldwall-hit.png','shieldwall-ui.png'].every(f=>Object.values(A.files).includes(f)),'Asset-Pfade vorbereitet');
console.log(`PASS: Schildwall – ${checks} Prüfungen`);
