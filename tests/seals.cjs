/* Siegelsystem: Darstellung (seals.js) und unveränderte Fortschrittslogik.
   Run: npm install --no-save linkedom; node tests/seals.cjs */
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..'),KEY='im-zeichen-der-wende:v1';let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++;};
const storage=new Map();
function boot(raw){if(raw!==undefined)storage.set(KEY,raw);const {window}=parseHTML(fs.readFileSync(path.join(root,'index.html'),'utf8'));const document=window.document;
 const localStorage={getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 document.querySelector('#modal').showModal=function(){this.open=true;};document.querySelector('#modal').close=function(){this.open=false;this.dispatchEvent(new window.Event('close'));};
 window.HTMLElement.prototype.focus=function(){};window.HTMLElement.prototype.scrollIntoView=function(){};
 window.MiniGames=new Proxy({},{get:()=>(id,cfg,work)=>{work.innerHTML='<p class="stub-minigame"></p>';return true;}});
 const matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});window.matchMedia=matchMedia;
 const context={window,document,localStorage,console,Blob,URL,matchMedia,requestAnimationFrame:()=>0,cancelAnimationFrame:()=>{},setTimeout:()=>0,clearTimeout:()=>{},setInterval:()=>0,clearInterval:()=>{}};vm.createContext(context);
 for(const f of ['data/game-data.js','adventure.js','seals.js','bonusgames.js','script.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context,{filename:f});
 return {window,document};}

/* 1. Designsystem */
let env=boot();const W=env.window,G=W.GAME,S=W.Seals,$=s=>env.document.querySelector(s),all=s=>[...env.document.querySelectorAll(s)];
ok(S&&G.seals.length===6,'Seal module and six seals');
ok(G.seals.every(n=>S.motifs.includes(n))&&S.motifs.length===6,'Own motif for every seal');
ok(new Set(G.seals.map(S.slug)).size===6&&S.slug('312')==='312'&&S.slug('Konflikt')==='konflikt','Stable file slugs');
const h=env.document.createElement('div');h.innerHTML=G.seals.map(n=>S.medal(n)).join('');
ok(all('#seal-defs').length===1,'Shared SVG definitions exist once');S.ensureDefs();S.medal('Quelle');ok(all('#seal-defs').length===1,'Definitions not duplicated');
for(const n of G.seals){const s=S.slug(n);ok($('#sm-raise-'+s)&&$('#sm-eng-'+s),'Relief motif defined: '+n);ok($('#sg-field-'+s),'Field colour defined: '+n);}
ok(h.querySelectorAll('.seal-medallion svg[role=img]').length===6,'Medallions are labelled images');
ok([...h.querySelectorAll('.seal-medallion svg')].every(svg=>/Siegel /.test(svg.getAttribute('aria-label'))),'Accessible names');
for(const st of ['locked','owned','selected','placed']){const d=env.document.createElement('div');d.innerHTML=S.token('Staat',st,{tag:'button'});const t=d.firstElementChild;
 ok(t.classList.contains('is-'+st)&&t.dataset.state===st,'State class '+st);ok(t.querySelector('.seal-name').textContent==='Staat','Readable label '+st);ok(t.getAttribute('aria-label').includes(S.STATE_TEXT[st]),'State announced '+st);
 ok(st==='locked'?!!t.querySelector('.seal-setting'):!!t.querySelector('.seal-medallion'),'Locked shows empty setting, others the medallion: '+st);}
const c=env.document.createElement('div');c.innerHTML=S.collection(['Konflikt','Quelle'],{placed:['Konflikt'],highlight:'Quelle'});
ok(c.querySelectorAll('.is-placed').length===1&&c.querySelectorAll('.is-owned').length===1&&c.querySelectorAll('.is-locked').length===4,'Collection shows placed/owned/locked');
ok(c.querySelector('.just-added [data-seal=Quelle]'),'New seal highlighted in collection');
const r=env.document.createElement('div');r.innerHTML=S.reward('Quelle',{owned:['Konflikt','Quelle'],fresh:true});
ok(r.querySelector('.seal-reward.fresh .seal-medallion.big')&&/Neues Siegel erhalten/.test(r.textContent)&&r.querySelector('.seal-banner-name').textContent==='Quelle','Reward: big medallion, banner, name');
ok(/2 von 6/.test(r.textContent),'Reward shows collection progress');
ok(!/(XP|Punkte|★|Münze|Konfetti)/.test(r.textContent),'No points/stars/coins aesthetic');
r.innerHTML=S.reward('Quelle',{owned:['Quelle'],fresh:false});ok(!r.querySelector('.fresh')&&/bereits/.test(r.textContent),'Re-solving shows calm, non-animated reward');
for(const n of G.seals)ok(G.sealInfo[n]&&G.sealInfo[n].meaning&&G.sealInfo[n].motif,'Meaning and motif text: '+n);
ok(!/<img/.test(S.medal('Quelle'))&&!/<img/.test(S.wheelSvg()),'SVG fallback while no asset is registered');
G.sealAssets.available=['quelle','wheel-frame'];
ok(S.medal('Quelle').includes('src="assets/ui/seals/seal-quelle.png"')&&!/<img/.test(S.medal('Staat')),'Registered asset replaces only its own seal');
ok(S.wheelSvg().includes('assets/ui/seals/seal-wheel-frame.png'),'Registered wheel frame used');
G.sealAssets.available=[];
for(let i=0;i<6;i++){const p=S.socketPos(i);ok(p.left>15&&p.left<85&&p.top>15&&p.top<85,'Setting inside the wheel '+i);}
const css=fs.readFileSync(path.join(root,'seals.css'),'utf8');
ok(/orientation:portrait/.test(css),'Portrait layout rules');ok(/prefers-reduced-motion/.test(css),'Reduced motion respected');
ok(/\.seal-socket\{[^}]*width:22%/.test(css),'Settings scale with the wheel (large touch targets)');
ok(fs.readFileSync(path.join(root,'index.html'),'utf8').includes('seals.js')&&fs.readFileSync(path.join(root,'index.html'),'utf8').includes('seals.css'),'Module loaded by the page');

/* 2. Vergabe und Siegelrad: Fortschrittslogik unverändert, alte Spielstände laufen weiter */
const base={version:1,started:true,scene:'forum',unlocked:['gate','house','forum'],inventory:[],solved:['conflict'],seals:['Konflikt'],notes:[],seen:[],evidence:[],drafts:{},hints:{},flags:{},progress:0};
env=boot(JSON.stringify(base));const st=()=>JSON.parse(storage.get(KEY));
env.window.document.dispatchEvent(new env.window.CustomEvent('minigame-win',{detail:'sources'}));
ok(st().seals.join()==='Konflikt,Quelle','Seal awarded as before');
ok(env.document.querySelector('#modal-content .seal-reward.fresh .seal-banner-name').textContent==='Quelle','Reward component after puzzle');
ok(env.document.querySelectorAll('#modal-content .seal-collection .is-owned').length===2,'Collection taken over in reward');
ok([...env.document.querySelectorAll('#modal-content .actions button')].some(b=>b.textContent==='Weiter erkunden'),'Continue button immediately available');
env.window.document.dispatchEvent(new env.window.CustomEvent('minigame-win',{detail:'sources'}));
ok(st().seals.length===2&&env.document.querySelector('#modal-content .seal-reward:not(.fresh)'),'Repeated solve: no duplicate seal, calm display');
// Alter Spielstand mit halb gefülltem Rad
const half={...base,scene:'basilica',unlocked:['gate','house','forum','basilica'],solved:['conflict','sources','cases','sacrifice','vision','motives'],seals:[...G.seals],flags:{sealSockets:['Konflikt','Quelle']}};
env=boot(JSON.stringify(half));const $$=s=>env.document.querySelector(s);
[...env.document.querySelectorAll('button')].find(b=>b.textContent==='Spiel fortsetzen')?.click();
env.document.querySelector('[data-hotspot=finalgate]').click();
ok($$('#modal-title').textContent==='Das Siegelrad','Wheel opens from old save');
ok(env.document.querySelectorAll('.seal-socket.fitted').length===2&&$$('.seal-rack [data-seal=Konflikt]').disabled,'Previously placed seals stay placed');
for(const n of G.seals.slice(2)){$$('.seal-rack [data-seal="'+n+'"]').click();$$('.seal-wheel [data-seal="'+n+'"]').click();}
ok(st().flags.sealsPlaced&&st().flags.sealSockets.length===6,'Completing old save sets sealsPlaced');
ok($$('#seal-finish')&&$$('.seal-chamber.complete'),'Completion shown in place with continue button');
// Weniger als sechs Siegel: Hinweis mit Sammlung statt Rad
env=boot(JSON.stringify({...half,seals:['Konflikt','312'],flags:{}}));[...env.document.querySelectorAll('button')].find(b=>b.textContent==='Spiel fortsetzen')?.click();
env.document.querySelector('[data-hotspot=finalgate]').click();
ok(env.document.querySelector('#modal-title').textContent==='Die Mechanik wartet'&&env.document.querySelectorAll('#modal-content .seal-collection .is-locked').length===4,'Missing seals shown as empty settings');
// Notizbuch zeigt die Sammlung
env.document.querySelector('#close').click();env.document.querySelector('#notebook').click();
ok(/Deine Siegelsammlung · 2 von 6/.test(env.document.querySelector('#modal-content').textContent),'Notebook lists the seal collection');
console.log(`PASS: Siegelsystem – ${checks} Prüfungen`);
