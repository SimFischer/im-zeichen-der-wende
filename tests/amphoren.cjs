// Run: npm install --no-save linkedom; node tests/amphoren.cjs
// Amphoren-Chaos: neue Hafenszene, große Händlerfigur, Steuerung und Fanglogik (Canvas wird simuliert).
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom'),root=path.resolve(__dirname,'..');
let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++;};
const src=fs.readFileSync(path.join(root,'bonus/amphoren.js'),'utf8');
ok(!/leute\.webp|forum-blur/.test(src),'Keine alten Leute-Sprites oder Forum-Hintergründe mehr');
ok(!/HAENDLER|people:/.test(src),'Keine Ausschnitt-Logik für den Händler mehr');
const {window}=parseHTML('<!doctype html><html><body><dialog id="modal"></dialog></body></html>');
window.HTMLElement.prototype.focus=function(){};
const requested=[];let rafs=[];
class FakeImage{set src(v){this._src=v;requested.push(v);const size=v.includes('merchant')?[207,400]:[1672,941];this.width=size[0];this.height=size[1];setTimeout(()=>this.onload&&this.onload(),0);}get src(){return this._src;}}
const g2d=new Proxy({},{get:(t,k)=>k==='measureText'?(s=>({width:String(s).length*9})):k==='createLinearGradient'||k==='createRadialGradient'?(()=>({addColorStop(){}})):(()=>{}),set:()=>true});
window.HTMLCanvasElement.prototype.getContext=function(){return g2d;};
window.HTMLElement.prototype.getBoundingClientRect=function(){return {left:0,top:0,width:1000,height:560,right:1000,bottom:560};};
window.HTMLElement.prototype.setPointerCapture=function(){};
const storage=new Map();
window.WendeUI={open:(t,html)=>{window.document.querySelector('#modal').innerHTML=html;},close(){}};
const ctx={window,document:window.document,console,Image:FakeImage,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},
 requestAnimationFrame:f=>{rafs.push(f);return rafs.length;},cancelAnimationFrame(){},setTimeout,clearTimeout,setInterval:()=>0,clearInterval(){},matchMedia:()=>({matches:false}),ResizeObserver:class{constructor(f){this.f=f;}observe(){setTimeout(()=>this.f([]),0);}disconnect(){}}};
window.devicePixelRatio=1;vm.createContext(ctx);
vm.runInContext(fs.readFileSync(root+'/bonusgames.js','utf8'),ctx);
vm.runInContext(src,ctx);
const B=window.BonusGames;B.update({solved:['conflict','sources','cases']});
(async()=>{
 B.start('amphoren');const stage=window.document.querySelector('.bonus-stage');ok(stage,'Spielfenster geöffnet');
 await new Promise(r=>setTimeout(r,20));
 const D=stage.__debug;ok(D,'Spiel eingerichtet');
 ok(D.art.dock==='assets/minigames/amphora/amphora-dock.png','Hintergrund: Hafenlager');
 ok(D.art.merchant==='assets/minigames/amphora/amphora-merchant.png','Eigene Händlerfigur');
 ok(D.art.items==='assets/minigames/amphora/amphora-assets.png','Gegenstände aus dem neuen Bogen');
 ok(['amphora-dock','amphora-merchant','amphora-assets'].every(n=>requested.some(u=>u.includes(n))),'Alle drei Grafiken werden geladen');
 ok(D.loaded.dock&&D.loaded.merchant&&D.loaded.items,'Hintergrund und Händler geladen');
 const L=D.L();ok(L.mh/L.H>=.25&&L.mh/L.H<=.35,'Händler 25–35 % der Spielfeldhöhe ('+Math.round(L.mh/L.H*100)+' %)');
 ok(L.r/L.H>=.06,'Gegenstände deutlich größer als früher');ok(L.bw>=L.mw,'Fangkorb breiter als die Figur');
 window.document.querySelector('.bonus-introcard .primary').click();
 let now=0;const frame=(n=1)=>{for(let k=0;k<n;k++){now+=1000/60;const fs2=rafs;rafs=[];fs2.forEach(f=>f(now));}};
 frame(3);
 // Touch: Finger ziehen, Händler folgt nur waagerecht
 const c=stage.querySelector('canvas');const pe=(t,x)=>{const e=new window.Event(t,{bubbles:true});e.pointerId=5;e.clientX=x;e.clientY=450;e.pointerType='touch';c.dispatchEvent(e);};
 pe('pointerdown',500);for(let x=500;x>=200;x-=50)pe('pointermove',x);pe('pointerup',200);
 ok(Math.abs(D.tx()-.2)<.02,'Finger bestimmt das Ziel');frame(60);ok(Math.abs(D.bx()-.2)<.03,'Händler folgt dem Finger');
 pe('pointerdown',900);pe('pointerup',900);ok(D.tx()>.3,'Tippen rechts: ein Schritt nach rechts');
 // Fanglogik: Amphore über dem Korb fällt hinein
 D.setX(.5);D.setRound(0);const before=D.stats().amph;const it={kind:'amphore',v:0,x:L.W*.5,y:L.rim-L.H*.25,vx:0,vy:0,rot:0,vr:0,r:L.r,gf:1,st:'fall',t:0};D.items().push(it);
 frame(90);ok(D.stats().amph===before+1,'Amphore über dem Korb wird gefangen');
 const miss={...it,x:L.W*.05,y:L.rim-L.H*.2,st:'fall'};D.items().push(miss);frame(120);ok(!D.items().includes(miss)||miss.st!=='caught','Amphore neben dem Korb wird nicht gefangen');
 // Runde 3: Begriffe
 D.setRound(2);const t0=D.stats().terms,w0=D.stats().wrong;
 D.catchIt({kind:'schriftrolle',term:'Verhaftungen',ok:true,st:'fall'});ok(D.stats().terms===t0+1,'Passender Begriff zählt');
 D.catchIt({kind:'schriftrolle',term:'Nero',ok:false,why:'x',st:'fall'});ok(D.stats().wrong===w0+1,'Unpassender Begriff wird erkannt');
 for(const t of ['Gottesdienstverbot','Schriften vernichten','Kirchen zerstören','Verhaftungen','Mailand 313','Konzil 325','Nero'])ok(src.includes(`'${t}'`),'Begriff vorhanden: '+t);
 console.log(`PASS: Amphoren-Chaos – ${checks} Prüfungen`);
})().catch(e=>{console.error(e);process.exitCode=1;});
