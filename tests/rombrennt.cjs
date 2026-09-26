/* Bonusspiel „Rom brennt!“: Leveldesign ohne Sackgassen, kompletter Lauf mit Autopilot, Timer und Bestzeit.
   Run: npm install --no-save linkedom; node tests/rombrennt.cjs */
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom'),root=path.resolve(__dirname,'..');
let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++;};
const storage=new Map();
function boot(avail){
 const {window}=parseHTML('<html><body><dialog id="modal"></dialog></body></html>');
 window.HTMLElement.prototype.focus=function(){};window.HTMLElement.prototype.setPointerCapture=function(){};
 window.HTMLCanvasElement.prototype.getContext=function(){return new Proxy({},{get:(t,k)=>k in t?t[k]:()=>({addColorStop(){}}),set:(t,k,v)=>{t[k]=v;return true;}});};
 const timers=[];
 window.WendeUI={open:(t,html)=>{window.document.querySelector('#modal').innerHTML=html;},close(){}};
 const ctx={window,document:window.document,console,localStorage:{getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,v)},requestAnimationFrame:()=>1,cancelAnimationFrame(){},
  setTimeout:f=>{timers.push(f);return timers.length;},clearTimeout(){},setInterval:()=>0,clearInterval(){},matchMedia:()=>({matches:false}),ResizeObserver:class{observe(){}disconnect(){}}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(root+'/bonusgames.js','utf8'),ctx);vm.runInContext(fs.readFileSync(root+'/bonus/rombrennt.js','utf8'),ctx);
 const B=window.BonusGames;if(avail)B.games.rombrennt.art.available=avail;
 B.update({solved:['sources']});B.start('rombrennt',true);
 const $=s=>window.document.querySelector(s);
 return {window,B,$,timers,flush:()=>{while(timers.length)timers.shift()();}};
}

/* ---------- 1. Level: keine Sackgassen ---------- */
let env=boot();let D=env.$('.bonus-stage').__debug;
const L=D.level,PH=D.phys,grid=D.grid(),LW=grid[0].length,LH=grid.length;
const tile=(x,y)=>x<0||x>=LW?'#':y<0||y>=LH?' ':grid[y][x];
const solid=(x,y)=>tile(x,y)==='#',oneWay=(x,y)=>tile(x,y)==='='||(tile(x,y)==='H'&&tile(x,y-1)!=='H');
ok(PH.jumpHeight>2.2&&PH.jumpHeight<2.8,'Jump height about 2.4 tiles (steps are at most 2)');
for(let x=1;x<LW-1;x++)ok(solid(x,12)&&!solid(x,11)||solid(x,11),'Street is continuous at x='+x);
ok([...Array(LW).keys()].every(x=>solid(x,12)),'No pit anywhere in the street (old softlock: 4-tile shaft between x 39–42)');
const stand=(x,y)=>(solid(x,y)||oneWay(x,y))&&!solid(x,y-1)&&!solid(x,y-2);
const nodes=[];for(let y=1;y<LH;y++)for(let x=1;x<LW-1;x++)if(stand(x,y))nodes.push(x+','+y);
const edges=new Map(nodes.map(n=>[n,new Set()]));
const land=(x,y)=>{for(let j=y;j<LH;j++)if(stand(x,j))return x+','+j;return null;};
for(const n of nodes){const [x,y]=n.split(',').map(Number);const add=m=>{if(m&&m!==n&&edges.has(m))edges.get(n).add(m);};
 for(const dx of [-1,1]){if(stand(x+dx,y))add((x+dx)+','+y);else if(!solid(x+dx,y-1)&&!solid(x+dx,y-2)&&!solid(x+dx,y))add(land(x+dx,y));}
 const maxUp=Math.floor(PH.jumpHeight);
 for(let dy=1;dy<=maxUp;dy++)for(const dx of [-3,-2,-1,0,1,2,3]){const tx=x+dx,ty=y-dy;if(!stand(tx,ty))continue;
  let clear=true;for(let cx=Math.min(x,tx);cx<=Math.max(x,tx);cx++)for(let cy=ty-2;cy<y-1;cy++){if(cx===tx&&cy>=ty)continue;if(solid(cx,cy))clear=false;}
  if(clear)add(tx+','+ty);}
 for(const dx of [-2,2,-3,3])if(stand(x+dx,y)&&!solid(x+dx/Math.abs(dx),y-1))add((x+dx)+','+y);}
L.ladders.forEach(l=>{const b=l.x+',12',t=l.x+','+l.top;ok(edges.has(b)&&edges.has(t),'Ladder '+l.x+' connects street and roof');edges.get(b).add(t);edges.get(t).add(b);});
const start=Math.floor(L.start.x)+',12';
const reach=(from,E)=>{const seen=new Set([from]),q=[from];while(q.length){const n=q.shift();for(const m of E.get(n)||[])if(!seen.has(m)){seen.add(m);q.push(m);}}return seen;};
const R=reach(start,edges);
const rev=new Map(nodes.map(n=>[n,new Set()]));for(const [n,s] of edges)for(const m of s)rev.get(m).add(n);
const back=reach(start,rev);
const dead=[...R].filter(n=>!back.has(n));
ok(dead.length===0,'From every reachable spot the street/start is reachable again (no dead end): '+dead.join(' '));
L.fires.forEach((f,i)=>ok([...R].some(n=>{const [x,y]=n.split(',').map(Number);return y===f.y&&Math.abs(x+.5-f.x)<1.9;}),'Fire '+(i+1)+' reachable'));
L.water.forEach(w=>ok(R.has(Math.floor(w.x)+',12'),'Water source at '+w.x+' on the street'));
L.houses.forEach(h=>ok([...R].some(n=>n.endsWith(','+h.y)&&+n.split(',')[0]>=h.x&&+n.split(',')[0]<h.x+h.w),'Roof of '+h.name+' reachable'));

/* ---------- 2. Kompletter Lauf mit Autopilot (feste Schritte, 60 Hz) ---------- */
function autopilot(env){const D=env.$('.bonus-stage').__debug;const K=D.keys(),P=D.P,dt=1/60;let steps=0;
 const step=()=>{D.update(dt);steps++;if(steps>60*240)throw Error('Autopilot timeout at x='+P().x.toFixed(2)+' y='+P().y.toFixed(2));};
 const wait=t=>{K.l=K.r=K.j=false;for(let i=0;i<t*60;i++)step();};
 const goTo=tx=>{let guard=0;while(Math.abs(P().x-tx)>.15&&D.phase()!=='done'){const p=P(),dir=tx>p.x?1:-1;K.r=dir>0;K.l=dir<0;
   const ahead=Math.floor(p.x+dir*(PH.PW+.35));const wall=solid(ahead,Math.floor(p.y-.5))||solid(ahead,Math.floor(p.y-1.2));
   const ember=L.embers.some(e=>(e.x-p.x)*dir>0&&(e.x-p.x)*dir<1.6&&p.y>11.5);
   if(p.on&&(wall||ember)&&!K.j){K.j=true;D.P().buffer=.15;}else if(K.j&&p.vy>=0)K.j=false;
   step();if(++guard>60*60)throw Error('goTo stuck at '+p.x.toFixed(2)+','+p.y.toFixed(2)+' target '+tx);}
  K.l=K.r=false;K.j=false;};
 // über Kisten und Markise auf ein Dach: Richtung halten, springen, sobald die Figur steht und noch zu tief ist
 const hopTo=(tx,ty)=>{let guard=0;while(!(D.P().on&&Math.abs(D.P().y-ty)<.02&&Math.abs(D.P().x-tx)<.3)){const p=D.P(),dir=tx>p.x?1:-1;K.r=dir>0;K.l=dir<0;
   if(p.on&&p.y>ty+.02&&!K.j){K.j=true;p.buffer=.15;}else if(K.j&&p.vy>=0&&!p.on)K.j=false;else if(K.j&&p.on&&p.buffer<=0)K.j=false;
   step();if(++guard>60*30)throw Error('hopTo stuck at '+p.x.toFixed(2)+','+p.y.toFixed(2));}K.l=K.r=K.j=false;};
 const climb=lx=>{goTo(lx+.5);let guard=0;K.j=true;while(D.P().climb||D.P().y>L.ladders.find(l=>l.x===lx).top+.01){step();if(++guard>600)throw Error('climb stuck');}K.j=false;};
 wait(1.5);
 goTo(5);wait(.5);ok(D.jar().full,'Jar filled at the first fountain');
 climb(8);ok(Math.abs(D.P().y-8)<.01,'Ladder leads onto the first roof');goTo(10.5);wait(.1);ok(D.fires()[0].out,'Fire 1 extinguished');
 goTo(21);wait(.5);ok(D.jar().full&&Math.abs(D.P().y-12)<.01,'Dropped safely from the roof, jar refilled');
 climb(28);goTo(31);wait(.1);ok(D.fires()[1].out,'Fire 2 extinguished');
 goTo(41.5);wait(.5);ok(D.jar().full,'Refilled at the cistern after jumping down');
 goTo(46.2);wait(.5);ok(D.P().x>45.5&&D.P().on,'Past the ember');hopTo(51,8);goTo(54);wait(.2);ok(D.fires()[2].out,'Fire 3 extinguished (crates and awning up to the roof)');
 return D;}
env.$('.bonus-introcard .primary').click();
D=autopilot(env);
ok(D.phase()==='done'&&D.result(),'Game finished');
const t1=D.clock();ok(t1>5&&t1<120,'Timer measured the run: '+t1.toFixed(1)+' s');
D.update(1);ok(D.clock()===t1,'Timer stops at the finish');
const key=env.B.games.rombrennt.BEST_KEY;ok(key==='im-zeichen-der-wende:rombrennt-best-v1','Separate storage key');
ok(JSON.parse(storage.get(key)).ms===Math.round(t1*1000)&&D.result().record,'First best time saved');
env.flush();ok(/Die Brände sind gelöscht/.test(env.$('.bonus-endcard').textContent)&&/Deine Zeit/.test(env.$('.bonus-endcard').textContent),'Finish card shows time');
ok(env.B.progress().won.includes('rombrennt'),'Bonus progress: won');

/* ---------- 3. Bestzeit: bessere überschreibt, schlechtere nicht, Reload behält ---------- */
storage.set(key,JSON.stringify({ms:999999}));
env=boot();env.$('.bonus-introcard .primary').click();D=autopilot(env);
ok(D.result().record&&JSON.parse(storage.get(key)).ms<999999,'Better time overwrites the old best');
const best=JSON.parse(storage.get(key)).ms;
env=boot();ok(/Bestzeit/.test(env.$('.bonus-introcard').textContent)&&env.$('.rom-best').textContent!=='–','Best time shown on the start card and in the HUD after reload');
env.$('.bonus-introcard .primary').click();D=env.$('.bonus-stage').__debug;
D.update(1/60);for(let i=0;i<200;i++)D.update(1/60);// langsam: warten
D=autopilot(env);ok(!D.result().record&&JSON.parse(storage.get(key)).ms===best,'Slower time does not overwrite the best');
storage.set(key,'{kaputt');env=boot();ok(env.$('.rom-best').textContent==='–','Broken storage value: safe default');
storage.set(key,JSON.stringify({ms:-5}));env=boot();ok(env.$('.rom-best').textContent==='–','Invalid value ignored');

/* ---------- 4. Timer, Countdown, Neustart, Pause ---------- */
env=boot();env.$('.bonus-introcard .primary').click();D=env.$('.bonus-stage').__debug;
ok(D.phase()==='count'&&/Bereit/.test(env.$('.rom-count').textContent),'Short countdown before the start');
for(let i=0;i<60;i++)D.update(1/60);ok(D.clock()===0&&/Los/.test(env.$('.rom-count').textContent),'Timer waits for „Los!“');
for(let i=0;i<60;i++)D.update(1/60);ok(D.phase()==='play'&&D.clock()>0,'Timer starts automatically');
D.keys().r=true;for(let i=0;i<60;i++)D.update(1/60);D.keys().r=false;ok(D.P().x>3,'Moves right');
D.tp(40,12);env.$('.rom-restart').click();ok(D.phase()==='count'&&D.clock()===0&&D.P().x===2.5,'Restart button resets round and timer');
env.$('.bonus-pause').click();ok(env.$('.bonus-pausecard'),'Pause still works');
ok(env.$('.rom-pad .rom-jump')&&env.$('.rom-pad [data-k="l"]')&&env.$('.bonus-leave'),'Controls and Back button present');
ok(!fs.readFileSync(root+'/bonus/rombrennt.js','utf8').includes("tile(x,y)==='b'"),'Old breakable bridge (cause of the softlock) removed');
/* ---------- 5. Grafiken: ohne Eintrag nichts laden, mit Eintrag verwenden ---------- */
ok(!/rome-burns/.test(env.$('.bonus-stage').innerHTML),'No missing asset requested by default');
env=boot(['ui']);ok(env.$('.rom-hud').classList.contains('art-ui'),'Registered UI panel used');
ok(Object.values(env.B.games.rombrennt.art.files).includes('rome-burns-bg.png')&&env.B.games.rombrennt.art.dir==='assets/bonus/rome-burns/','Asset paths prepared');
console.log(`PASS: Rom brennt! – ${checks} Prüfungen (Autopilot-Zeit ${t1.toFixed(1)} s)`);
