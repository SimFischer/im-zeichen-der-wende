'use strict';
/* Bonusspiel: Rom brennt! – seitlich scrollender Plattformer in einer brennenden Gasse (Jahr 64).
   Wasser an Brunnen und Zisterne schöpfen, drei Brandstellen auf den Dächern löschen.
   Keine Person in Gefahr, kein „Tod“: Wer stolpert, steht am letzten sicheren Punkt wieder auf.

   Leveldesign ohne Sackgassen: Die Straße ist durchgehend begehbar (keine Gruben), jedes Dach hat
   eine Leiter oder Stufen zur Straße, und von jedem Dach kann man gefahrlos hinunterspringen.
   tests/rombrennt.cjs prüft das für jede erreichbare Stelle.

   Grafik: alles gezeichnet (Kulisse, Häuser, Figur, Feuer). Fertige Grafiken aus
   assets/bonus/rome-burns/ werden nur geladen, wenn sie in ART.available stehen (keine 404-Fehler).
   Zeit und Bestzeit: Die Zeit läuft ab „Los!“, stoppt beim letzten gelöschten Brand und pausiert
   mit dem Spiel. Die Bestzeit steht in localStorage unter BEST_KEY. */
(()=>{
 if(!window.BonusGames)return;
 const ART={dir:'assets/bonus/rome-burns/',files:{bg:'rome-burns-bg.png',tiles:'rome-burns-tiles.png',player:'rome-burns-player.png',jar:'rome-burns-water-jar.png',fire:'rome-burns-fire.png',fg:'rome-burns-fg.png',ui:'rome-burns-ui.png',smoke:'rome-burns-smoke.png',platforms:'rome-burns-platforms.png',goal:'rome-burns-goal.png'},available:[]};
 const BEST_KEY='im-zeichen-der-wende:rombrennt-best-v1';
 const loadBest=()=>{try{const v=JSON.parse(localStorage.getItem(BEST_KEY));const ms=v&&v.ms;return Number.isFinite(ms)&&ms>0&&ms<3600000?ms:null;}catch(e){return null;}};
 const saveBest=ms=>{try{localStorage.setItem(BEST_KEY,JSON.stringify({ms:Math.round(ms)}));}catch(e){}};
 const fmt=ms=>{if(ms==null)return '–';const s=ms/1000;const m=Math.floor(s/60),r=s-m*60;return `${m}:${r<10?'0':''}${r.toFixed(1).replace('.',',')}`;};

 /* ---------- Level: Rechtecke in Kacheln. Straße = Zeilen 12–13 ---------- */
 const LW=64,LH=14,GROUND=12;
 const LEVEL={
  start:{x:2.5,y:GROUND},
  // Häuser stehen hinter der Straße (man läuft davor entlang); nur ihre Dachkante trägt
  houses:[{x:9,y:8,w:6,tint:0,name:'Haus der Walker'},{x:29,y:5,w:7,tint:1,name:'Mietshaus'},{x:50,y:8,w:9,tint:2,name:'Bäckerei'}],
  tower:{x:59,y:3,w:4},
  // Kisten sind höchstens zwei Kacheln hoch – von beiden Seiten überspringbar
  crates:[{x:16,y:11},{x:47,y:11},{x:48,y:11},{x:48,y:10}],
  awnings:[{x:15,y:9,w:3},{x:48,y:9,w:2}],
  ladders:[{x:8,top:8},{x:28,top:5}],
  water:[{x:5,kind:'brunnen'},{x:21,kind:'brunnen'},{x:41.5,kind:'zisterne'}],
  fires:[{x:11.5,y:8},{x:32.5,y:5},{x:55,y:8}],
  embers:[{x:25.5},{x:45}],
  beams:[{x:38.5,top:6,period:4.6,off:1.2}],
  smoke:[{x:33,y:4,rx:1.6}]
 };
 function buildGrid(){
  const g=Array.from({length:LH},()=>Array(LW).fill(' '));
  const rect=(x,y,w,h,c)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(i>=0&&i<LW&&j>=0&&j<LH)g[j][i]=c;};
  rect(0,GROUND,LW,LH-GROUND,'#');rect(0,0,1,GROUND,'#');rect(LW-1,0,1,GROUND,'#');
  LEVEL.houses.forEach(h=>rect(h.x,h.y,h.w,1,'='));LEVEL.crates.forEach(c=>rect(c.x,c.y,1,1,'#'));
  LEVEL.awnings.forEach(a=>rect(a.x,a.y,a.w,1,'='));
  LEVEL.ladders.forEach(l=>{for(let j=l.top;j<GROUND;j++)g[j][l.x]='H';});
  return g;
 }
 /* Physik-Konstanten (auch für den Erreichbarkeitstest) */
 const PHYS={G:38,JUMP:13.6,RUN:5.6,CLIMB:5,PW:.3,PH:1.45};
 PHYS.jumpHeight=PHYS.JUMP*PHYS.JUMP/(2*PHYS.G);

 /* Kleiner Zufallsgenerator mit Startwert – die Kulisse sieht bei jedem Aufbau gleich aus */
 const rng=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};

 window.BonusGames.register({
  id:'rombrennt',title:'Rom brennt!',kicker:'Bonusspiel · Erinnerung an das Jahr 64',scene:'forum',
  spot:[33,44,'Glühendes Kohlebecken'],
  intro:{text:'Ein großer Stadtbrand. Schöpfe Wasser an Brunnen und Zisterne und lösche die drei Brandstellen auf den Dächern – so schnell du kannst. (Das Spiel zeigt keine bestimmte Person und keine belegte Einzelszene.)',
   controls:['<b>◀ ▶</b> laufen, <b>Sprung</b> springen<span class="mg-keys"> – am PC Pfeiltasten und Leertaste</span>.','An einer Leiter <b>Sprung</b> gedrückt halten: Die Figur klettert hinauf. Von jedem Dach kannst du gefahrlos hinunterspringen.','Am Wasser füllt sich dein Krug von selbst, am Feuer löschst du von selbst.','Die Zeit läuft ab „Los!“. <b>↺ Neu</b> startet die Runde jederzeit neu.'],start:'Zum Brunnen'},
  setup(ctx){
   const has=k=>ART.available.includes(k),src=k=>ART.dir+ART.files[k];
   const view=ctx.canvas({maxDpr:2}),g=view.g;
   const imgs={};Object.keys(ART.files).filter(has).forEach(k=>{if(typeof Image==='undefined')return;const im=new Image();im.onload=()=>{imgs[k]=im;staticLayer=null;};im.src=src(k);});
   const hud=ctx.layer('rom-hud'+(has('ui')?' art-ui':''),`<div class="rom-tablet" role="timer" aria-live="off"><span class="rom-label">Zeit</span><span class="rom-time">0:00,0</span><span class="rom-bestline">Bestzeit <b class="rom-best">${fmt(loadBest())}</b></span></div><div class="rom-fires" aria-label="Gelöschte Brände"></div><button type="button" class="rom-restart" aria-label="Runde neu starten">↺ Neu</button>`);
   const pad=ctx.layer('rom-pad','<div class="rom-dir"><button type="button" data-k="l" aria-label="Nach links">◀</button><button type="button" data-k="r" aria-label="Nach rechts">▶</button></div><button type="button" class="rom-jump" data-k="j" aria-label="Springen und klettern">Sprung</button>');
   const count=ctx.layer('rom-count','');count.setAttribute('aria-live','polite');
   const timeEl=hud.querySelector('.rom-time'),bestEl=hud.querySelector('.rom-best'),firesEl=hud.querySelector('.rom-fires');
   // Bestzeit auf der Startkarte
   const note=ctx.stage.querySelector('.bonus-introcard .bonus-note');if(note){const b=loadBest();note.insertAdjacentHTML('beforebegin',`<p class="rom-best-note">${b?`Deine Bestzeit: <b>${fmt(b)}</b>`:'Noch keine Bestzeit – die erste Runde setzt sie.'}</p>`);}

   let grid,P,keys,fires,jar,beams,parts,smoke,safe,phase,clock,phaseT,cam,T=48,staticLayer=null,skyLayer=null,msgCool=0,stumble=0,lastShown=-1,result=null;
   const tile=(x,y)=>x<0||x>=LW?'#':y<0||y>=LH?' ':grid[y][x];
   const solid=(x,y)=>tile(x,y)==='#';
   const ladderAt=(x,y)=>tile(x,y)==='H';
   const oneWay=(x,y)=>tile(x,y)==='='||(tile(x,y)==='H'&&tile(x,y-1)!=='H');

   function reset(){grid=buildGrid();P={x:LEVEL.start.x,y:LEVEL.start.y,vx:0,vy:0,on:true,face:1,coyote:0,buffer:0,climb:false,run:0,inv:0,slow:0};
    keys={l:false,r:false,j:false};jar={full:false,fill:0};fires=LEVEL.fires.map(f=>({...f,out:false,level:1,spray:0}));
    beams=LEVEL.beams.map(b=>({...b,t:b.off,y:b.top,state:'wait'}));parts=[];smoke=[];safe={x:P.x,y:P.y};
    phase='count';phaseT=0;clock=0;stumble=0;msgCool=0;lastShown=-1;result=null;cam={x:P.x+3,y:8};
    pad.querySelectorAll('button').forEach(b=>b.classList.remove('on'));
    renderFires();showTime(true);countdown('Bereit …');ctx.setTask('Fülle deinen Krug am Brunnen.');}
   function countdown(t){count.textContent=t;count.className='rom-count'+(t?' show':'');}
   function renderFires(){const n=fires?fires.filter(f=>f.out).length:0;firesEl.innerHTML=(fires||LEVEL.fires).map((f,i)=>`<span class="rom-flame${fires&&fires[i].out?' out':''}" aria-hidden="true"></span>`).join('')+`<span class="rom-firecount">${n}/${LEVEL.fires.length}</span>`;firesEl.setAttribute('aria-label',`Gelöschte Brände: ${n} von ${LEVEL.fires.length}`);}
   function showTime(force){const tenth=Math.floor(clock*10);if(!force&&tenth===lastShown)return;lastShown=tenth;timeEl.textContent=fmt(clock*1000);}

   /* ---------- Eingabe: Pointer Events, kein Doppeltipp-Zoom ---------- */
   pad.querySelectorAll('button').forEach(b=>{const k=b.dataset.k;
    const down=e=>{e.preventDefault();if(!keys[k]&&k==='j')P.buffer=.15;keys[k]=true;b.classList.add('on');try{b.setPointerCapture(e.pointerId);}catch(_){} };
    const up=()=>{keys[k]=false;b.classList.remove('on');};
    ctx.on(b,'pointerdown',down);ctx.on(b,'pointerup',up);ctx.on(b,'pointercancel',up);ctx.on(b,'lostpointercapture',up);ctx.on(b,'contextmenu',e=>e.preventDefault());});
   const KM={ArrowLeft:'l',a:'l',A:'l',ArrowRight:'r',d:'r',D:'r',' ':'j',ArrowUp:'j',w:'j',W:'j'};
   ctx.on(window,'keydown',e=>{const k=KM[e.key];if(!k||!ctx.running)return;e.preventDefault();if(!keys[k]&&k==='j')P.buffer=.15;keys[k]=true;});
   ctx.on(window,'keyup',e=>{const k=KM[e.key];if(k)keys[k]=false;});
   ctx.on(window,'blur',()=>{if(keys){keys.l=keys.r=keys.j=false;}});
   hud.querySelector('.rom-restart').onclick=()=>{if(!ctx.running)return;reset();ctx.say('Neue Runde – die Zeit beginnt von vorn.',1600);};

   /* ---------- Physik ---------- */
   const {G,JUMP,RUN,CLIMB,PW,PH}=PHYS;
   function moveX(dx){P.x+=dx;const top=Math.floor(P.y-PH+.02),bot=Math.floor(P.y-.02);
    const edge=dx>0?Math.floor(P.x+PW):Math.floor(P.x-PW);
    for(let y=top;y<=bot;y++)if(solid(edge,y)){
     // Kantenhilfe: fehlt nur ein kleines Stück bis zur Oberkante, hebt die Figur sich hinauf
     const lip=P.y-y;if(!P.on&&lip>0&&lip<=.6&&!solid(edge,y-1)&&!solid(edge,y-2)&&!solid(Math.floor(P.x),y-1)&&!solid(Math.floor(P.x),y-2)){P.y=y;P.vy=0;P.on=true;return;}
     P.x=dx>0?edge-PW-.001:edge+1+PW+.001;P.vx=0;return;}}
   function update(dt){
    msgCool=Math.max(0,msgCool-dt);
    beams.forEach(b=>{b.t+=dt;const ph=b.t%b.period;if(ph<b.period-2.1){b.state='wait';b.y=b.top;}else if(ph<b.period-.9){b.state='warn';b.y=b.top;}else{b.state='fall';const e=(ph-(b.period-.9))/.9;b.y=b.top+(GROUND-b.top)*Math.min(1,e*e*1.3);}});
    fires.forEach(f=>{if(f.out)f.level=Math.max(0,f.level-dt*1.4);f.spray=Math.max(0,f.spray-dt);
     if(f.level>0&&Math.random()<dt*22*f.level)parts.push({x:f.x+(Math.random()-.5)*1.4,y:f.y-.2,vx:(Math.random()-.5)*.8,vy:-2.2-Math.random()*2,t:0,k:'ember',life:.9});
     if((f.level>0||f.spray>0)&&Math.random()<dt*(f.out?9:4))smoke.push({x:f.x+(Math.random()-.5),y:f.y-1.3,vx:.35+Math.random()*.3,vy:-1-Math.random()*.4,t:0,s:f.out?.25+Math.random()*.25:.45+Math.random()*.5,steam:f.out});});
    parts.forEach(p=>{p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.k==='drop')p.vy+=16*dt;if(p.k==='dust')p.vy+=6*dt;});parts=parts.filter(p=>p.t<p.life);
    smoke.forEach(p=>{p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;});smoke=smoke.filter(p=>p.t<3.6);
    if(phase==='count'){phaseT+=dt;if(phaseT>=.9&&count.textContent!=='Los!')countdown('Los!');if(phaseT>=1.4){phase='play';countdown('');}camFollow(dt);return;}
    if(phase==='done'){camFollow(dt);return;}
    clock+=dt;showTime();
    if(stumble>0){stumble-=dt;if(stumble<=0){P.x=safe.x;P.y=safe.y;P.vx=P.vy=0;P.climb=false;P.on=true;P.inv=1.2;}camFollow(dt);return;}
    P.inv=Math.max(0,P.inv-dt);P.slow=Math.max(0,P.slow-dt);P.buffer=Math.max(0,P.buffer-dt);
    const dir=(keys.r?1:0)-(keys.l?1:0);if(dir)P.face=dir;
    const cx=Math.floor(P.x),lad=LEVEL.ladders.find(l=>l.x===cx&&P.y>l.top+.05&&P.y<=GROUND+.01);
    // Leiter: Sprung halten = hinaufklettern; loslassen = festhalten; seitwärts = loslassen
    if(!P.climb&&lad&&(keys.j||P.buffer>0)){P.climb=lad;P.buffer=0;P.vx=0;P.vy=0;}
    if(P.climb){const L=P.climb;P.x+=(L.x+.5-P.x)*Math.min(1,dt*14);if(keys.j){P.y-=CLIMB*dt;P.run+=dt*7;}
     if(P.y<=L.top){P.y=L.top;P.climb=false;P.on=true;P.vy=0;P.buffer=0;}
     else if(dir){P.climb=false;P.vx=dir*RUN*.6;}
     camFollow(dt);interact(dt);return;}
    const max=RUN*(P.slow>0?.6:1),acc=P.on?60:34;
    if(dir){const want=dir*max;P.vx+=Math.sign(want-P.vx)*Math.min(Math.abs(want-P.vx),acc*dt);}else P.vx*=Math.pow(P.on?.0004:.25,dt);
    if(P.on)P.coyote=.11;else P.coyote=Math.max(0,P.coyote-dt);
    if(P.buffer>0&&P.coyote>0){P.vy=-JUMP;P.on=false;P.coyote=0;P.buffer=0;}
    if(!keys.j&&P.vy<-4)P.vy+=G*dt*1.3;
    P.vy=Math.min(18,P.vy+G*dt);
    // in kleinen Schritten bewegen: keine Kachel wird übersprungen
    const steps=Math.max(1,Math.ceil(Math.max(Math.abs(P.vx),Math.abs(P.vy))*dt/.3));
    let landed=false;
    for(let s=0;s<steps;s++){
     if(P.vx)moveX(P.vx*dt/steps);
     const prevY=P.y;P.y+=P.vy*dt/steps;
     if(P.vy>0){const y=Math.floor(P.y);for(const x of [Math.floor(P.x-PW+.02),Math.floor(P.x+PW-.02)]){if(solid(x,y)||(oneWay(x,y)&&prevY<=y+.02)){P.y=y;P.vy=0;landed=true;break;}}}
     else if(P.vy<0){const y=Math.floor(P.y-PH);for(const x of [Math.floor(P.x-PW+.02),Math.floor(P.x+PW-.02)])if(solid(x,y)){P.y=y+1+PH;P.vy=0;break;}}
    }
    // steht die Figur noch auf etwas?
    P.on=landed||(P.vy>=0&&[Math.floor(P.x-PW+.02),Math.floor(P.x+PW-.02)].some(x=>{const y=Math.floor(P.y+.02);return Math.abs(P.y-Math.round(P.y))<.03&&(solid(x,y)||oneWay(x,y));}));
    if(P.on&&P.vy>0)P.vy=0;
    P.run+=Math.abs(P.vx)*dt*1.5;
    if(P.on&&!nearDanger())safe={x:P.x,y:P.y};
    if(P.y>LH+2||P.x<0||P.x>LW)respawn('Zurück auf die Straße.');
    hazards();camFollow(dt);interact(dt);
   }
   function nearDanger(){return LEVEL.embers.some(h=>Math.abs(h.x-P.x)<1.8&&P.y>GROUND-.5)||beams.some(b=>Math.abs(b.x-P.x)<1.4)||P.slow>0;}
   function respawn(msg){P.x=safe.x;P.y=safe.y;P.vx=P.vy=0;P.climb=false;ctx.say(msg,1400);}
   function hit(msg){if(P.inv>0||stumble>0)return;stumble=.7;P.vx=0;ctx.say(msg,1500);for(let i=0;i<10;i++)parts.push({x:P.x,y:P.y-.3,vx:(Math.random()-.5)*3,vy:-Math.random()*3,t:0,k:'dust',life:.9});}
   function hazards(){const bx0=P.x-PW,bx1=P.x+PW,by0=P.y-PH,by1=P.y;
    LEVEL.embers.forEach(h=>{if(bx1>h.x-.42&&bx0<h.x+.42&&by1>GROUND-.55)hit('Glut! Du stolperst zurück.');});
    beams.forEach(b=>{if(b.state==='fall'&&Math.abs(b.x-P.x)<.95&&by0<b.y+.3&&by1>b.y-.4)hit('Ein Balken! Zum Glück nur ein Schreck.');});
    LEVEL.smoke.forEach(s=>{if(Math.abs(s.x-P.x)<s.rx&&P.y<=s.y+1.2&&P.y>s.y-1){if(P.slow<=0&&msgCool<=0){ctx.say('Rauch! Du hustest und wirst langsamer.',1300);msgCool=2.5;}P.slow=.5;}});}
   function camFollow(dt){const W=(view.W||800)/T,H=(view.H||450)/T;const tx=P.x+P.face*1.8,ty=P.y-2.4;cam.x+=(tx-cam.x)*Math.min(1,dt*3.4);cam.y+=(ty-cam.y)*Math.min(1,dt*2.6);cam.x=Math.max(W/2,Math.min(LW-W/2,cam.x));const pad=(view.H>view.W?140:0)/T;cam.y=Math.max(Math.min(H/2-.5,LH-H/2+pad),Math.min(LH-H/2+pad,cam.y));}
   function interact(dt){
    const w=LEVEL.water.find(w=>Math.abs(w.x-P.x)<1.4&&Math.abs(P.y-GROUND)<.2);
    if(w&&!jar.full){jar.fill+=dt;if(Math.random()<dt*30)parts.push({x:w.x+(Math.random()-.5)*.6,y:GROUND-1,vx:(Math.random()-.5)*1.2,vy:-1.5-Math.random(),t:0,k:'drop',life:.6});
     if(jar.fill>=.35){jar.full=true;jar.fill=0;ctx.say('Der Krug ist voll.',1100);task();}}else if(!w)jar.fill=0;
    const f=fires.find(f=>!f.out&&Math.abs(f.x-P.x)<1.9&&Math.abs(f.y-P.y)<1.2);
    if(f){if(jar.full){jar.full=false;f.out=true;f.spray=1;for(let i=0;i<30;i++)parts.push({x:P.x+P.face*.5,y:P.y-1.2,vx:(f.x-P.x)*1.5+(Math.random()-.5)*1.6,vy:-2.5-Math.random()*2.5,t:0,k:'drop',life:1});
      const n=fires.filter(x=>x.out).length;renderFires();firesEl.classList.remove('pop');void firesEl.offsetWidth;firesEl.classList.add('pop');
      if(n<fires.length){ctx.say(`Gelöscht! ${n} von ${fires.length}`,1600);task();}else finish();}
     else if(msgCool<=0){ctx.say('Dein Krug ist leer – schöpfe Wasser am Brunnen oder an der Zisterne.',1800);msgCool=3;}}}
   function task(){const n=fires.filter(x=>x.out).length;ctx.setTask(jar.full?`Bring das Wasser zum nächsten Brand · ${n}/${fires.length}`:`Fülle den Krug am Wasser · ${n}/${fires.length}`);}
   function finish(){phase='done';const ms=Math.round(clock*1000);showTime(true);const old=loadBest();const record=old==null||ms<old;if(record){saveBest(ms);bestEl.textContent=fmt(ms);}
    result={ms,best:record?ms:old,record,previous:old};
    ctx.setTask('Die Gasse ist gerettet.');ctx.say(record?(old==null?'Geschafft! Deine erste Bestzeit.':'Neue Bestzeit!'):'Alle Brände gelöscht!',2200);
    ctx.after(1800,()=>ctx.win({title:'Die Brände sind gelöscht.',lines:[`Deine Zeit: ${fmt(ms)}`,record?(old==null?'Das ist deine erste Bestzeit.':`Neue Bestzeit! Vorher: ${fmt(old)}`):`Bestzeit: ${fmt(old)}`],
     html:`<div class="rom-chron"><img src="assets/puzzles/forum/chronistin-face.webp" alt=""><div><p class="rom-who">Die Chronistin</p><p>„Der große Brand von Rom im Jahr 64 ist gut belegt. Wer ihn verursachte, lässt sich dagegen nicht sicher feststellen.“</p></div></div><p class="muted" style="text-align:center">Ereignis ≠ sichere Kenntnis der Ursache.</p>`,backLabel:'Zurück zum Forum'}));}

   /* ---------- Zeichnen ---------- */
   function layout(){T=Math.max(30,Math.round(Math.min((view.H||450)/9.4,(view.W||800)/11.5)));staticLayer=null;skyLayer=null;}
   view.resize=()=>layout();
   const wob=(r,a)=>(r()-.5)*a;
   function roughRect(o,x,y,w,h,r,j){o.beginPath();o.moveTo(x+wob(r,j),y+wob(r,j));const n=Math.max(2,Math.round(w/(T*.8)));for(let i=1;i<=n;i++)o.lineTo(x+w*i/n+wob(r,j),y+wob(r,j));const m=Math.max(2,Math.round(h/(T*.8)));for(let i=1;i<=m;i++)o.lineTo(x+w+wob(r,j),y+h*i/m+wob(r,j));for(let i=n-1;i>=0;i--)o.lineTo(x+w*i/n+wob(r,j),y+h+wob(r,j));for(let i=m-1;i>0;i--)o.lineTo(x+wob(r,j),y+h*i/m+wob(r,j));o.closePath();}
   const PLASTER=[['#e4b77a','#c98d52'],['#d9a07a','#b06a44'],['#e8cf9a','#c4a066'],['#caa27a','#9c7650']];
   function facade(o,x,y,w,h,tint,r,opts={}){
    const X=x*T,Y=y*T,W=w*T,H=h*T,[c1,c2]=PLASTER[tint%PLASTER.length];
    const gr=o.createLinearGradient(0,Y,0,Y+H);gr.addColorStop(0,c1);gr.addColorStop(1,c2);
    roughRect(o,X,Y,W,H,r,T*.05);o.fillStyle=imgs.tiles?o.createPattern(imgs.tiles,'repeat'):gr;o.fill();
    o.save();o.clip();
    // Putz, abgeplatzte Stellen mit Ziegeln, warmes Streiflicht vom Brand
    for(let i=0;i<w*h*1.4;i++){o.fillStyle=r()<.5?'#ffffff14':'#5a2a0e14';o.beginPath();o.ellipse(X+r()*W,Y+r()*H,T*(.2+r()*.5),T*(.08+r()*.2),r()*3,0,7);o.fill();}
    for(let i=0;i<Math.max(1,w*h/10);i++){const bx=X+r()*(W-T),by=Y+r()*(H-T*.6);for(let k=0;k<5;k++){o.fillStyle='#9a4a2a';o.fillRect(bx+(k%2)*T*.28,by+k*T*.1,T*.25,T*.08);}}
    const glow=o.createLinearGradient(0,Y+H,0,Y);glow.addColorStop(0,'#ff8a3a38');glow.addColorStop(1,'#ff8a3a00');o.fillStyle=glow;o.fillRect(X,Y,W,H);
    o.restore();
    o.lineWidth=Math.max(2,T*.05);o.strokeStyle='#4a2a14';roughRect(o,X,Y,W,H,r,T*.05);o.stroke();
    // Fenster mit Bogen und Läden
    for(let j=0;j<Math.floor(h/2);j++)for(let i=0;i<Math.floor(w/2);i++){const wx=X+(i*2+1)*T-T*.26,wy=Y+(j*2)*T+T*.55;if(opts.door&&j===Math.floor(h/2)-1&&i===Math.floor(w/4))continue;
     o.fillStyle='#2a140a';o.beginPath();o.moveTo(wx,wy+T*.8);o.lineTo(wx,wy+T*.22);o.quadraticCurveTo(wx+T*.26,wy-T*.08,wx+T*.52,wy+T*.22);o.lineTo(wx+T*.52,wy+T*.8);o.closePath();o.fill();
     o.fillStyle=`rgba(255,${140+r()*60|0},60,${.25+r()*.35})`;o.fill();
     o.fillStyle='#6a3a1a';o.fillRect(wx-T*.2,wy+T*.1,T*.18,T*.7);o.fillRect(wx+T*.54,wy+T*.1,T*.18,T*.7);
     o.strokeStyle='#3a1e0c';o.lineWidth=1.5;o.strokeRect(wx-T*.2,wy+T*.1,T*.18,T*.7);o.strokeRect(wx+T*.54,wy+T*.1,T*.18,T*.7);
     o.fillStyle='#d8c29a';o.fillRect(wx-T*.08,wy+T*.8,T*.68,T*.08);}
    if(opts.door){const dx=X+Math.floor(w/2)*T-T*.45,dy=Y+H-T*1.35;o.fillStyle='#4a2a14';o.beginPath();o.moveTo(dx,Y+H);o.lineTo(dx,dy+T*.4);o.quadraticCurveTo(dx+T*.45,dy-T*.1,dx+T*.9,dy+T*.4);o.lineTo(dx+T*.9,Y+H);o.fill();o.strokeStyle='#2a1408';o.lineWidth=2;o.stroke();o.beginPath();o.moveTo(dx+T*.45,dy+T*.1);o.lineTo(dx+T*.45,Y+H);o.stroke();}
    // Dach: Ziegelreihe mit Überstand und Balkenkante
    if(opts.roof!==false){const ry=Y-T*.1;o.fillStyle='#6a3a1a';o.fillRect(X-T*.2,ry+T*.12,W+T*.4,T*.1);
     o.fillStyle='#a8482a';roughRect(o,X-T*.22,ry-T*.14,W+T*.44,T*.26,r,T*.03);o.fill();o.strokeStyle='#5a220e';o.lineWidth=1.5;o.stroke();
     for(let k=0;k<(W+T*.4)/(T*.28);k++){const tx=X-T*.2+k*T*.28;o.fillStyle=k%2?'#c4623a':'#b8562e';o.beginPath();o.arc(tx+T*.14,ry-T*.12,T*.14,Math.PI,0);o.fill();o.strokeStyle='#6a2a12';o.lineWidth=1;o.stroke();}}
   }
   function renderStatic(){
    const W=LW*T,H=LH*T;staticLayer=document.createElement('canvas');const dp=Math.min(1.5,view.dpr||1);staticLayer.width=Math.round(W*dp);staticLayer.height=Math.round(H*dp);const o=staticLayer.getContext('2d');o.scale(dp,dp);o.lineJoin='round';o.lineCap='round';
    const r=rng(64);
    // Hinterhäuser: durchgehende Straßenfront, dunkler, ohne Kollision
    let x=1;while(x<LW-1){const w=3+Math.floor(r()*4),h=5+Math.floor(r()*4);o.save();o.globalAlpha=.9;facade(o,x,GROUND-h,w,h,3,r,{});o.fillStyle='#1e0e0898';o.fillRect(x*T-2,(GROUND-h-.45)*T,w*T+4,(h+.45)*T);o.restore();x+=w;}
    // Straße: Pflastersteine
    o.fillStyle='#6d5238';o.fillRect(0,GROUND*T,W,H-GROUND*T);
    for(let row=0;row<4;row++)for(let i=0;i<LW*2.2;i++){const sx=(i+(row%2)*.5)*T/2.2,sy=GROUND*T+row*T*.45+T*.08;{const v=r()*26|0;o.fillStyle=`rgb(${146+v},${110+v},${78+(v*.7|0)})`;}o.beginPath();o.ellipse(sx,sy+T*.18,T*.2,T*.14,0,0,7);o.fill();o.strokeStyle='#3e2a18';o.lineWidth=1;o.stroke();o.fillStyle='#ffd8a022';o.beginPath();o.ellipse(sx-T*.05,sy+T*.12,T*.1,T*.05,0,0,7);o.fill();}
    o.fillStyle='#ffb86a30';o.fillRect(0,GROUND*T,W,T*.08);
    // Häuser
    const tw=LEVEL.tower;facade(o,tw.x,tw.y,tw.w,GROUND-tw.y,1,r,{door:false});
    LEVEL.houses.forEach(h=>{facade(o,h.x,h.y,h.w,GROUND-h.y,h.tint,r,{door:GROUND-h.y>=4});
     // begehbare Dachkante: heller Gesimsstein, damit man tragende Dächer sofort erkennt
     o.fillStyle='#f0dcae';o.fillRect(h.x*T-T*.18,h.y*T-T*.02,h.w*T+T*.36,T*.1);o.strokeStyle='#5a3a1a';o.lineWidth=1.5;o.strokeRect(h.x*T-T*.18,h.y*T-T*.02,h.w*T+T*.36,T*.1);});
    // Kisten
    LEVEL.crates.forEach(c=>{const X=c.x*T,Y=c.y*T;o.fillStyle='#9a6a3a';roughRect(o,X+1,Y+1,T-2,T-2,r,T*.03);o.fill();o.strokeStyle='#4a2a12';o.lineWidth=2;o.stroke();o.beginPath();o.moveTo(X+T*.1,Y+T*.1);o.lineTo(X+T*.9,Y+T*.9);o.moveTo(X+T*.9,Y+T*.1);o.lineTo(X+T*.1,Y+T*.9);o.moveTo(X,Y+T*.5);o.lineTo(X+T,Y+T*.5);o.stroke();});
    // Markisen (tragen): gestreiftes Tuch mit Bogenkante
    LEVEL.awnings.forEach(a=>{const X=a.x*T,Y=a.y*T,W2=a.w*T;o.strokeStyle='#5a3a1c';o.lineWidth=Math.max(3,T*.08);o.beginPath();o.moveTo(X+W2-T*.1,Y+T*.2);o.lineTo(X+W2-T*.1,GROUND*T);o.stroke();
     for(let k=0;k<a.w*3;k++){o.fillStyle=k%2?'#efe2c4':'#a8322a';o.fillRect(X+k*T/3,Y,T/3+.5,T*.3);}
     for(let k=0;k<a.w*3;k++){o.fillStyle=k%2?'#efe2c4':'#a8322a';o.beginPath();o.arc(X+k*T/3+T/6,Y+T*.3,T/6,0,Math.PI);o.fill();}
     o.strokeStyle='#5a220e';o.lineWidth=1.5;o.strokeRect(X,Y,W2,T*.3);});
    // Leitern
    LEVEL.ladders.forEach(l=>{const X=l.x*T,Y0=l.top*T-T*.35,Y1=GROUND*T;o.strokeStyle='#7a4a24';o.lineWidth=Math.max(3,T*.09);o.beginPath();o.moveTo(X+T*.22,Y0);o.lineTo(X+T*.2,Y1);o.moveTo(X+T*.78,Y0);o.lineTo(X+T*.8,Y1);o.stroke();o.lineWidth=Math.max(2,T*.07);o.beginPath();for(let y=Y0+T*.3;y<Y1;y+=T*.42){o.moveTo(X+T*.22,y+wob(r,2));o.lineTo(X+T*.78,y+wob(r,2));}o.stroke();});
    // Wasserstellen: Brunnen mit Löwenkopf, Zisterne als großes Tongefäß
    LEVEL.water.forEach(w=>{const X=w.x*T,Y=GROUND*T;
     if(w.kind==='zisterne'){o.fillStyle='#b8683a';o.beginPath();o.ellipse(X,Y-T*.75,T*.62,T*.72,0,0,7);o.fill();o.strokeStyle='#5a2a10';o.lineWidth=2;o.stroke();o.fillStyle='#8a4a24';o.fillRect(X-T*.35,Y-T*1.55,T*.7,T*.2);o.fillStyle='#4a86a0';o.beginPath();o.ellipse(X,Y-T*1.45,T*.32,T*.08,0,0,7);o.fill();o.strokeStyle='#e8b27a88';o.beginPath();o.arc(X-T*.2,Y-T*.9,T*.35,Math.PI*.9,Math.PI*1.4);o.stroke();}
     else{o.fillStyle='#a8987a';o.beginPath();o.moveTo(X-T*.95,Y);o.lineTo(X-T*.85,Y-T*.8);o.quadraticCurveTo(X,Y-T*.95,X+T*.85,Y-T*.8);o.lineTo(X+T*.95,Y);o.closePath();o.fill();o.strokeStyle='#4a3a28';o.lineWidth=2;o.stroke();
      o.fillStyle='#4a86a0';o.beginPath();o.ellipse(X,Y-T*.82,T*.78,T*.1,0,0,7);o.fill();
      o.fillStyle='#c8b894';roughRect(o,X-T*.3,Y-T*2.1,T*.6,T*1.3,r,T*.03);o.fill();o.stroke();o.fillStyle='#8a7a5a';o.beginPath();o.arc(X,Y-T*1.7,T*.2,0,7);o.fill();o.stroke();}});
   }
   function renderSky(){const W=view.W,H=view.H;skyLayer=document.createElement('canvas');skyLayer.width=Math.round(W*2);skyLayer.height=Math.round(H);const o=skyLayer.getContext('2d');const r=rng(7);
    const sky=o.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#3a2236');sky.addColorStop(.45,'#9a3a2a');sky.addColorStop(.8,'#e0803a');sky.addColorStop(1,'#f0b060');o.fillStyle=sky;o.fillRect(0,0,W*2,H);
    const sun=o.createRadialGradient(W*.7,H*.62,0,W*.7,H*.62,H*.5);sun.addColorStop(0,'#ffe6a0cc');sun.addColorStop(.25,'#ffb86a88');sun.addColorStop(1,'#ffb86a00');o.fillStyle=sun;o.fillRect(0,0,W*2,H);
    // ferne Stadt: Hügel, Tempel mit Giebeln, Kuppeln, Zypressen, Aquädukt
    o.fillStyle='#5a2a2a';o.beginPath();o.moveTo(0,H);for(let x=0;x<=W*2;x+=W/12)o.lineTo(x,H*.62-Math.sin(x*.004)*H*.06-r()*H*.03);o.lineTo(W*2,H);o.fill();
    for(let k=0;k<22;k++){const x=k*W*2/22+r()*30,b=H*.64,s=H*(.06+r()*.07);o.fillStyle='#4a2226';
     const t=r();if(t<.3){o.fillRect(x,b-s,s*1.6,s);o.beginPath();o.moveTo(x-s*.1,b-s);o.lineTo(x+s*.8,b-s*1.45);o.lineTo(x+s*1.7,b-s);o.fill();for(let c=0;c<4;c++)o.fillRect(x+c*s*.45,b-s,s*.12,s);}
     else if(t<.5){o.fillRect(x,b-s*.8,s*1.2,s*.8);o.beginPath();o.arc(x+s*.6,b-s*.8,s*.6,Math.PI,0);o.fill();}
     else if(t<.75){o.beginPath();o.ellipse(x,b-s*.9,s*.16,s*.9,0,0,7);o.fill();}
     else{o.fillRect(x,b-s*.7,s*1.4,s*.7);}}
    o.strokeStyle='#4a2226';o.lineWidth=H*.012;for(let k=0;k<14;k++){const x=W*.2+k*H*.09;o.beginPath();o.arc(x,H*.6,H*.04,Math.PI,0);o.stroke();}o.fillStyle='#4a2226';o.fillRect(W*.2-H*.04,H*.55,14*H*.09,H*.012);}
   function draw(t){if(!view.W||!grid)return;const W=view.W,H=view.H;
    if(!staticLayer)renderStatic();if(!skyLayer||skyLayer.height!==Math.round(H))renderSky();
    const ox=W/2-cam.x*T,oy=H/2-cam.y*T;
    // Kulisse mit Parallaxe (oder Grafik rome-burns-bg.png)
    if(imgs.bg){const bw=imgs.bg.width*H/imgs.bg.height,px=((ox*.25)%bw+bw)%bw-bw;for(let x=px;x<W;x+=bw)g.drawImage(imgs.bg,x,0,bw,H);}
    else{const px=Math.max(-W,Math.min(0,ox*.18));g.drawImage(skyLayer,px,0,W*2,H);}
    // große Rauchsäulen in der Ferne
    for(let k=0;k<5;k++){const bx=((k*W*.45+ox*.3)%(W*1.6)+W*1.6)%(W*1.6)-W*.3,sw=Math.sin(t*.4+k)*20;const grd=g.createRadialGradient(bx+sw,H*.3,0,bx+sw,H*.3,H*.45);grd.addColorStop(0,'#3a2a2a66');grd.addColorStop(1,'#3a2a2a00');g.fillStyle=grd;g.fillRect(bx-H*.5,0,H,H*.8);}
    g.drawImage(staticLayer,ox,oy,LW*T,LH*T);if(oy+LH*T<H){g.fillStyle='#5a4230';g.fillRect(0,oy+LH*T-1,W,H-(oy+LH*T)+1);}
    // Wasserstrahl der Brunnen
    LEVEL.water.forEach(w=>{if(w.kind!=='brunnen')return;const X=ox+w.x*T,Y=oy+GROUND*T;g.strokeStyle='#8ac4dccc';g.lineWidth=Math.max(2,T*.07);g.beginPath();g.moveTo(X,Y-T*1.6);g.quadraticCurveTo(X+T*.35,Y-T*1.4+Math.sin(t*9)*2,X+T*.3,Y-T*.85);g.stroke();});
    // Glutnester auf der Straße
    LEVEL.embers.forEach(h=>{const x=ox+h.x*T,y=oy+GROUND*T;g.fillStyle='#2a1408';g.beginPath();g.ellipse(x,y-2,T*.5,T*.13,0,0,7);g.fill();for(let k=0;k<5;k++){const f=1+.3*Math.sin(t*9+k*2);g.fillStyle=k%2?'#f6b64a':'#e0602a';g.beginPath();g.moveTo(x-T*.42+k*T*.2,y-2);g.quadraticCurveTo(x-T*.34+k*T*.2,y-T*.6*f,x-T*.26+k*T*.2,y-2);g.fill();}});
    // Balken: Warnung durch rieselnden Staub, dann Fall
    beams.forEach(b=>{const x=ox+b.x*T;const hy=oy+(b.top-.5)*T,gy=oy+GROUND*T;
     // brennendes Baugerüst: Stangen stehen auf der Straße, oben liegt der lose Balken
     g.strokeStyle='#5a341a';g.lineWidth=Math.max(3,T*.1);g.beginPath();g.moveTo(x-T*1.25,gy);g.lineTo(x-T*1.2,hy-T*.2);g.moveTo(x+T*1.25,gy);g.lineTo(x+T*1.2,hy-T*.2);g.moveTo(x-T*1.2,hy+T*2);g.lineTo(x+T*1.2,hy+T*3.2);g.moveTo(x+T*1.2,hy+T*2);g.lineTo(x-T*1.2,hy+T*3.2);g.stroke();
     g.fillStyle='#4a2a14';g.fillRect(x-T*1.3,hy-T*.12,T*2.6,T*.22);g.fillStyle='#f07a2a';for(let k=0;k<3;k++){const f=1+.3*Math.sin(t*9+k);g.beginPath();g.moveTo(x-T*1.2+k*T*.35,hy-T*.1);g.quadraticCurveTo(x-T*1.05+k*T*.35,hy-T*.6*f,x-T*.9+k*T*.35,hy-T*.1);g.fill();}
     if(b.state==='warn'){for(let k=0;k<5;k++){g.fillStyle='rgba(230,210,170,.85)';g.fillRect(x-T*.4+Math.random()*T*.8,hy+Math.random()*T*4,2,5);}}
     const y=oy+b.y*T;g.save();g.translate(x,y);g.rotate(b.state==='fall'?.12:0);g.fillStyle='#5a341a';g.fillRect(-T*.8,-T*.15,T*1.6,T*.3);g.strokeStyle='#2a1408';g.lineWidth=2;g.strokeRect(-T*.8,-T*.15,T*1.6,T*.3);g.fillStyle='#e0602a';g.fillRect(T*.4,-T*.15,T*.4,T*.3);g.restore();});
    // Brandstellen
    fires.forEach((f,i)=>{const x=ox+f.x*T,y=oy+f.y*T;
     if(f.level>0){g.save();g.globalCompositeOperation='lighter';const gl=g.createRadialGradient(x,y-T*.6,0,x,y-T*.6,T*3.2*f.level);gl.addColorStop(0,`rgba(255,150,60,${.5*f.level})`);gl.addColorStop(1,'rgba(255,150,60,0)');g.fillStyle=gl;g.fillRect(x-T*3.5,y-T*4,T*7,T*7);g.restore();
      if(imgs.fire){const fr=Math.floor(t*10)%4,fw=imgs.fire.width/4;g.drawImage(imgs.fire,fr*fw,0,fw,imgs.fire.height,x-T*1.1,y-T*2.2*f.level,T*2.2,T*2.2*f.level);}
      else for(let layer=0;layer<3;layer++){const cols=['#c83a1a','#f07a2a','#ffd070'][layer],sc=[1,.72,.45][layer]*f.level;g.fillStyle=cols;g.beginPath();g.moveTo(x-T*.9*sc,y);
       for(let k=0;k<=6;k++){const px=x-T*.9*sc+k*T*1.8*sc/6,hh=T*(1.2+((k*37)%5)*.2)*sc*(1+.18*Math.sin(t*(8+k)+k*1.3+i));g.quadraticCurveTo(px-T*.15*sc,y-hh*.55,px,y-hh*(k%2?1:.6));}
       g.lineTo(x+T*.9*sc,y);g.closePath();g.fill();}}
     else{g.fillStyle='#2a1a1a88';g.beginPath();g.ellipse(x,y-2,T*.9,T*.18,0,0,7);g.fill();}
     if(!f.out){g.fillStyle='rgba(255,246,224,.95)';g.strokeStyle='#3a1a0a';g.lineWidth=3;g.font=`700 ${Math.round(T*.32)}px Georgia,serif`;g.textAlign='center';g.strokeText(`Brand ${i+1}`,x,y-T*2.2);g.fillText(`Brand ${i+1}`,x,y-T*2.2);}});
    parts.forEach(p=>{const x=ox+p.x*T,y=oy+p.y*T,a=1-p.t/p.life;if(p.k==='ember'){g.fillStyle=`rgba(255,${160+(p.x*97%80|0)},60,${a})`;g.beginPath();g.arc(x,y,T*.06+T*.05*a,0,7);g.fill();}else if(p.k==='drop'){g.fillStyle=`rgba(130,190,225,${a})`;g.beginPath();g.arc(x,y,T*.08,0,7);g.fill();}else{g.fillStyle=`rgba(200,170,120,${.6*a})`;g.beginPath();g.arc(x,y,T*.12+p.t*T*.2,0,7);g.fill();}});
    drawPlayer(ox+P.x*T,oy+P.y*T,t);
    smoke.forEach(p=>{const x=ox+p.x*T,y=oy+p.y*T;const a=Math.sin(Math.min(1,p.t/3.6)*Math.PI)*(p.steam?.28:.22);g.fillStyle=p.steam?`rgba(240,240,236,${a})`:`rgba(70,60,60,${a})`;g.beginPath();g.arc(x,y,T*p.s*(1+p.t*.45),0,7);g.fill();});
    LEVEL.smoke.forEach(s=>{const x=ox+s.x*T,y=oy+s.y*T;for(let k=0;k<3;k++){g.fillStyle='rgba(90,80,80,.13)';g.beginPath();g.ellipse(x+Math.sin(t*.8+k)*T*.4,y-1*T-k*T*.35,T*s.rx*.6,T*.45,0,0,7);g.fill();}});
    if(imgs.fg){const fw=imgs.fg.width*H/imgs.fg.height,px=((ox*1.25)%fw+fw)%fw-fw;for(let x=px;x<W;x+=fw)g.drawImage(imgs.fg,x,0,fw,H);}
    if(stumble>0&&stumble<.35){g.fillStyle=`rgba(20,12,8,${(.35-stumble)/.35*.6})`;g.fillRect(0,0,W,H);}
   }
   function drawJar(x,y,s,full){if(imgs.jar){g.drawImage(imgs.jar,x-s*.4,y-s*.9,s*.8,s*.9);return;}
    g.fillStyle='#b8683a';g.beginPath();g.moveTo(x-s*.12,y-s*.78);g.quadraticCurveTo(x-s*.42,y-s*.55,x-s*.28,y-s*.15);g.quadraticCurveTo(x,y+s*.02,x+s*.28,y-s*.15);g.quadraticCurveTo(x+s*.42,y-s*.55,x+s*.12,y-s*.78);g.closePath();g.fill();g.strokeStyle='#5a2a10';g.lineWidth=Math.max(1.5,s*.05);g.stroke();
    g.fillStyle='#8a4a24';g.fillRect(x-s*.16,y-s*.9,s*.32,s*.14);g.beginPath();g.moveTo(x+s*.14,y-s*.8);g.quadraticCurveTo(x+s*.38,y-s*.8,x+s*.3,y-s*.5);g.stroke();
    if(full){g.fillStyle='#6ab0d4';g.beginPath();g.ellipse(x,y-s*.88,s*.14,s*.05,0,0,7);g.fill();g.fillStyle='#ffffff55';g.fillRect(x-s*.2,y-s*.6,s*.06,s*.3);}}
   function drawPlayer(x,y,t){const s=T;const f=P.face;
    if(imgs.player){const fr=P.climb?7:!P.on?6:Math.abs(P.vx)>.4?1+Math.floor(P.run*2)%4:0,fw=imgs.player.width/8;g.save();g.translate(x,y);g.scale(f,1);g.drawImage(imgs.player,fr*fw,0,fw,imgs.player.height,-s*.6,-s*1.6,s*1.2,s*1.6);g.restore();return;}
    g.save();g.translate(x,y);if(stumble>0)g.rotate(f*.8*Math.min(1,(.7-stumble)*4));if(P.inv>0&&Math.floor(t*12)%2)g.globalAlpha=.55;
    g.fillStyle='#00000040';g.beginPath();g.ellipse(0,0,s*.32,s*.07,0,0,7);g.fill();g.scale(f,1);g.lineCap='round';g.lineJoin='round';
    const run=P.on&&Math.abs(P.vx)>.3?Math.sin(P.run*2.2):0,air=!P.on&&!P.climb;
    const l1=P.climb?Math.sin(P.run)*.4:air?.55:run*.7,l2=P.climb?-Math.sin(P.run)*.4:air?-.35:-run*.7;
    [l2,l1].forEach((l,k)=>{const hx=0,hy=-s*.58,kx=hx+Math.sin(l)*s*.28,ky=hy+Math.cos(l)*s*.28,fx=kx+Math.sin(l*.4)*s*.28,fy=ky+Math.cos(l*.4)*s*.28;g.strokeStyle=k?'#c8905e':'#b07a50';g.lineWidth=s*.11;g.beginPath();g.moveTo(hx,hy);g.lineTo(kx,ky);g.lineTo(fx,fy);g.stroke();g.strokeStyle='#5a3a1c';g.lineWidth=s*.07;g.beginPath();g.moveTo(fx-s*.04,fy);g.lineTo(fx+s*.13,fy);g.stroke();g.lineWidth=1.5;g.beginPath();g.moveTo(kx+s*.02,ky+s*.1);g.lineTo(fx,fy-s*.05);g.stroke();});
    // Tunika mit Gürtel und Saum
    g.fillStyle='#b8462a';g.beginPath();g.moveTo(-s*.2,-s*1.18);g.quadraticCurveTo(0,-s*1.24,s*.2,-s*1.18);g.lineTo(s*.28,-s*.52);g.quadraticCurveTo(0,-s*.46,-s*.28,-s*.52);g.closePath();g.fill();g.strokeStyle='#5a1a0a';g.lineWidth=Math.max(1.5,s*.035);g.stroke();
    g.strokeStyle='#e8c07a';g.lineWidth=s*.03;g.beginPath();g.moveTo(-s*.27,-s*.56);g.quadraticCurveTo(0,-s*.5,s*.27,-s*.56);g.stroke();
    g.fillStyle='#6a4020';g.fillRect(-s*.23,-s*.84,s*.46,s*.06);
    // Kopf mit Locken
    g.fillStyle='#c8905e';g.beginPath();g.arc(s*.04,-s*1.34,s*.16,0,7);g.fill();g.strokeStyle='#6a3a1a';g.lineWidth=1.5;g.stroke();
    g.fillStyle='#3a2212';for(let k=0;k<6;k++){g.beginPath();g.arc(-s*.08+k*s*.045,-s*1.46+Math.sin(k*2)*s*.03,s*.07,0,7);g.fill();}g.beginPath();g.arc(-s*.1,-s*1.36,s*.07,0,7);g.fill();
    g.fillStyle='#2a1408';g.beginPath();g.arc(s*.12,-s*1.35,s*.02,0,7);g.fill();
    // Arme und Krug auf der Schulter
    const climbArm=P.climb?Math.sin(P.run*1.2)*.5:0;
    g.strokeStyle='#c8905e';g.lineWidth=s*.085;g.beginPath();g.moveTo(-s*.05,-s*1.1);g.lineTo(P.climb?-s*.02:s*.1,P.climb?-s*1.55-climbArm*s*.1:-s*1.32);g.stroke();
    g.beginPath();g.moveTo(s*.05,-s*1.08);g.lineTo(P.climb?s*.12:s*.18+run*s*.08,P.climb?-s*1.5+climbArm*s*.1:-s*.8);g.stroke();
    if(!P.climb)drawJar(s*.02,-s*1.3,s*.62,jar.full);
    g.restore();}
   ctx.loop({update,draw});
   ctx.stage.__debug={P:()=>P,keys:()=>keys,jar:()=>jar,fires:()=>fires,phase:()=>phase,clock:()=>clock,result:()=>result,grid:()=>grid,level:LEVEL,phys:PHYS,update,reset,tp:(x,y)=>{P.x=x;P.y=y;P.vx=P.vy=0;P.climb=false;},art:ART,BEST_KEY};
   reset();
   return {start(){reset();}};
  }
 });
 window.BonusGames.games.rombrennt.art=ART;
 window.BonusGames.games.rombrennt.BEST_KEY=BEST_KEY;
})();
