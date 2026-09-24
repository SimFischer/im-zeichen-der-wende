'use strict';
/* Bonusspiel 3: Schildwall – Halte die Formation!
   Militärische Übung im Lager von 312: stumpfe Übungspfeile, Sandsäckchen, Steine, Holzkugeln.
   Keine Verletzungen, keine Lebenspunkte. Ein Treffer lässt den Soldaten nur kurz stolpern. */
(()=>{
 if(!window.BonusGames)return;
 const IMG={people:'assets/minigames/leute.webp'};
 const SOLDAT=[0,101];
 const POSE={front:{dx:0,dy:-.5,rot:0,sx:1,sy:1},left:{dx:-.42,dy:-.55,rot:-.12,sx:.62,sy:1.02},right:{dx:.42,dy:-.55,rot:.12,sx:.62,sy:1.02},up:{dx:0,dy:-1.02,rot:0,sx:1.05,sy:.42}};
 // Übungen: Dauer, Abstand der Würfe, Flugzeit, erlaubte Richtungen, gleichzeitige Würfe
 const DRILLS=[{dur:14,gap:1.9,fly:1.75,dirs:['left'],multi:1,text:'Übung 1: Würfe nur von links.'},{dur:15,gap:1.7,fly:1.6,dirs:['left','right'],multi:1,text:'Übung 2: von links oder rechts.'},{dur:15,gap:1.6,fly:1.5,dirs:['left','right','up'],multi:1,text:'Übung 3: jetzt auch von oben.'},{dur:16,gap:2.2,fly:1.5,dirs:['left','right','up'],multi:2,text:'Übung 4: mehrere Soldaten gleichzeitig.'}];
 const KINDS=['pfeil','stein','sack','kugel'];
 function load(src){return new Promise(res=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>res(null);i.src=src;});}

 window.BonusGames.register({
  id:'schildwall',title:'Schildwall',kicker:'Bonusspiel · Lager am Tiber, 312',scene:'camp',
  spot:[91,43,'Übungsschilde'],
  intro:{text:'Übung im Lager: Fünf Soldaten stehen in einer Reihe. Ausbilder werfen stumpfe Übungspfeile, Sandsäckchen, Steine und Holzkugeln. Richte die Schilde rechtzeitig aus – von links, von rechts oder nach oben.',
   controls:['Einen <b>Soldaten antippen und wischen</b>: nach links, rechts oder oben. Nach unten wischen stellt den Schild wieder gerade.','Oder: Soldat antippen und die großen Knöpfe unten nutzen<span class="mg-keys"> (Tasten 1–5 wählen, Pfeiltasten richten)</span>.','Ein Schild über dem Kopf zeigt dir vorher an, woher der nächste Wurf kommt.','Vier kurze Übungen, zusammen etwa eine Minute. Treffer bringen nur kurz aus dem Tritt.'],start:'Formation bilden'},
  setup(ctx){
   const view=ctx.canvas({maxDpr:2}),g=view.g;const imgs={};let bgc=null;
   load(IMG.people).then(people=>{imgs.people=people;prepare();});
   let soldiers=[],shots=[],drill=-1,drillT=0,spawnT=0,sel=-1,blocked=0,total=0,dust=[],ended=false,banner=0,flameT=0;
   const lay=()=>{const W=view.W,H=view.H;const h=Math.min(H*.48,W*.2);return {h,feet:H*.82,xs:[0,1,2,3,4].map(i=>W*(.5+(i-2)*Math.min(.165,(h*.62)/W*1.12)))};};
   function reset(){soldiers=[0,1,2,3,4].map(i=>({dir:'front',pose:{...POSE.front},stumble:0,wobble:0,flash:0}));shots=[];drill=-1;drillT=0;spawnT=1.2;sel=-1;blocked=0;total=0;dust=[];ended=false;banner=0;renderPad();}
   view.resize=()=>prepare();
   function prepare(){if(!view.W)return;const W=view.W,H=view.H;bgc=document.createElement('canvas');bgc.width=Math.round(W*view.dpr);bgc.height=Math.round(H*view.dpr);const o=bgc.getContext('2d');o.scale(view.dpr,view.dpr);
    // Himmel und Lagerhintergrund (Ausschnitt des Lager-Gemäldes: Fluss, Brücke, Zelte)
    const sky=o.createLinearGradient(0,0,0,H*.6);sky.addColorStop(0,'#1d2a44');sky.addColorStop(1,'#3a3a4a');o.fillStyle=sky;o.fillRect(0,0,W,H);
    // Gemalte Kulisse: Hügel, Tiber mit Brücke, Zelte des Lagers
    o.fillStyle='#f3e4c522';o.beginPath();o.arc(W*.8,H*.12,H*.05,0,7);o.fill();o.fillStyle='#f6ecd0';o.beginPath();o.arc(W*.8,H*.12,H*.028,0,7);o.fill();
    o.fillStyle='#2a3a3a';o.beginPath();o.moveTo(0,H*.42);for(let x=0;x<=W;x+=W/12)o.lineTo(x,H*.36+Math.sin(x*.013)*H*.03+Math.sin(x*.041)*H*.012);o.lineTo(W,H*.5);o.lineTo(0,H*.5);o.fill();
    for(let k=0;k<14;k++){const x=W*(.05+k*.07),y=H*(.39+Math.sin(k)*.02);o.fillStyle='#1e2c2a';o.beginPath();o.ellipse(x,y,W*.008,H*.05,0,0,7);o.fill();}
    const riv=o.createLinearGradient(0,H*.44,0,H*.54);riv.addColorStop(0,'#3b5566');riv.addColorStop(1,'#243844');o.fillStyle=riv;o.fillRect(0,H*.45,W,H*.09);
    for(let k=0;k<40;k++){o.fillStyle='rgba(255,210,130,.25)';o.fillRect(Math.random()*W,H*.46+Math.random()*H*.07,6+Math.random()*16,1.5);}
    o.fillStyle='#4f4a40';const bx=W*.02,bw=W*.36,by=H*.43;o.fillRect(bx,by-H*.02,bw,H*.025);for(let k=0;k<4;k++){o.beginPath();o.moveTo(bx+k*bw/4,by);o.lineTo(bx+(k+1)*bw/4,by);o.lineTo(bx+(k+1)*bw/4,by+H*.06);o.arc(bx+(k+.5)*bw/4,by+H*.06,bw/8*.8,0,Math.PI,true);o.lineTo(bx+k*bw/4,by+H*.06);o.fill();}
    const tent=(x,y,w,h,c1,c2)=>{o.fillStyle=c2;o.beginPath();o.moveTo(x-w/2,y);o.lineTo(x,y-h);o.lineTo(x+w/2,y);o.fill();o.fillStyle=c1;o.beginPath();o.moveTo(x-w/2,y);o.lineTo(x,y-h);o.lineTo(x+w*.1,y);o.fill();o.fillStyle='#2a1a10';o.beginPath();o.moveTo(x-w*.08,y);o.lineTo(x,y-h*.45);o.lineTo(x+w*.08,y);o.fill();o.strokeStyle='#d9a441';o.lineWidth=2;o.beginPath();o.arc(x,y-h*.62,h*.1,.3,2.8);o.stroke();o.fillStyle='#4a321c';o.fillRect(x-2,y-h-10,4,12);};
    tent(W*.5,H*.57,W*.2,H*.2,'#9c3a22','#7a2a18');tent(W*.72,H*.56,W*.16,H*.16,'#a8683a','#865028');tent(W*.9,H*.575,W*.18,H*.18,'#9c3a22','#7a2a18');tent(W*.3,H*.565,W*.14,H*.14,'#a8683a','#865028');
    [[W*.4,H*.58],[W*.62,H*.58]].forEach(([x,y])=>{o.fillStyle='#4a321c';o.fillRect(x-2,y-H*.3,4,H*.3);o.fillStyle='#8c2a1a';o.fillRect(x+2,y-H*.29,W*.035,H*.09);o.strokeStyle='#d9a441';o.lineWidth=1.5;o.strokeRect(x+2,y-H*.29,W*.035,H*.09);});
    // Übungsplatz
    const gr=o.createLinearGradient(0,H*.55,0,H);gr.addColorStop(0,'#6b5234');gr.addColorStop(1,'#9a7a4e');o.fillStyle=gr;o.fillRect(0,H*.58,W,H*.42);
    const haze=o.createLinearGradient(0,H*.5,0,H*.66);haze.addColorStop(0,'rgba(60,45,35,0)');haze.addColorStop(1,'rgba(107,82,52,.85)');o.fillStyle=haze;o.fillRect(0,H*.5,W,H*.16);
    for(let k=0;k<160;k++){o.fillStyle=Math.random()<.5?'#5a4428':'#b8986a';o.globalAlpha=.25;o.fillRect(Math.random()*W,H*.6+Math.random()*H*.4,2+Math.random()*3,1+Math.random()*2);}o.globalAlpha=1;
    // Holzpfähle (Palisade) links und rechts, Waffenständer
    const post=(x,y,h)=>{o.fillStyle='#4a321c';o.fillRect(x-5,y-h,10,h);o.fillStyle='#6b4a2a';o.fillRect(x-5,y-h,4,h);o.beginPath();o.moveTo(x-6,y-h);o.lineTo(x,y-h-12);o.lineTo(x+6,y-h);o.fillStyle='#4a321c';o.fill();};
    for(let k=0;k<5;k++){post(W*.03+k*14,H*.66,H*.14+k%2*8);post(W*.97-k*14,H*.66,H*.14+(k+1)%2*8);}
    o.strokeStyle='#3b2a1c';o.lineWidth=4;o.beginPath();o.moveTo(W*.1,H*.6);o.lineTo(W*.1,H*.44);o.moveTo(W*.1-24,H*.5);o.lineTo(W*.1+24,H*.5);o.stroke();
    for(let k=0;k<4;k++){o.strokeStyle='#5a3a1c';o.lineWidth=3;o.beginPath();o.moveTo(W*.1-18+k*12,H*.6);o.lineTo(W*.1-22+k*12,H*.4);o.stroke();o.fillStyle='#b8b8b0';o.beginPath();o.moveTo(W*.1-22+k*12,H*.4);o.lineTo(W*.1-25+k*12,H*.4+10);o.lineTo(W*.1-19+k*12,H*.4+10);o.fill();}
   }
   function drawShield(x,y,w,h,pose,wob,flash){g.save();g.translate(x+pose.dx*w,y+pose.dy*h*1.25);g.rotate(pose.rot+Math.sin(wob*30)*wob*.25);g.scale(pose.sx,pose.sy);
    const rw=w/2,rh=h/2;const grd=g.createLinearGradient(-rw,0,rw,0);grd.addColorStop(0,'#7a2418');grd.addColorStop(.5,'#b23a26');grd.addColorStop(1,'#6e1f14');
    g.fillStyle='#00000040';g.beginPath();g.roundRect?g.roundRect(-rw+3,-rh+4,w,h,w*.12):g.rect(-rw+3,-rh+4,w,h);g.fill();
    g.fillStyle=grd;g.beginPath();g.roundRect?g.roundRect(-rw,-rh,w,h,w*.12):g.rect(-rw,-rh,w,h);g.fill();g.strokeStyle='#d9a441';g.lineWidth=Math.max(2,w*.05);g.stroke();
    g.strokeStyle='#e6bf6a';g.lineWidth=Math.max(1.5,w*.03);g.beginPath();g.moveTo(-rw*.7,-rh*.55);g.quadraticCurveTo(0,-rh*.2,rw*.7,-rh*.55);g.moveTo(-rw*.7,rh*.55);g.quadraticCurveTo(0,rh*.2,rw*.7,rh*.55);
    for(let k=0;k<4;k++){g.moveTo(-rw*.15-k*rw*.13,-rh*.05-k*rh*.08);g.lineTo(-rw*.25-k*rw*.13,-rh*.18-k*rh*.08);g.moveTo(rw*.15+k*rw*.13,-rh*.05-k*rh*.08);g.lineTo(rw*.25+k*rw*.13,-rh*.18-k*rh*.08);}g.stroke();
    const bg=g.createRadialGradient(-w*.04,-w*.04,1,0,0,w*.16);bg.addColorStop(0,'#fbe4a0');bg.addColorStop(1,'#8a5a1c');g.fillStyle=bg;g.beginPath();g.arc(0,0,w*.15,0,7);g.fill();
    if(flash>0){g.fillStyle=`rgba(255,240,190,${flash*.6})`;g.beginPath();g.roundRect?g.roundRect(-rw,-rh,w,h,w*.12):g.rect(-rw,-rh,w,h);g.fill();}
    g.restore();}
   function drawShot(s,x,y,sz,t){g.save();g.translate(x,y);
    if(s.kind==='pfeil'){const a=Math.atan2(s.vy,s.vx);g.rotate(a);g.strokeStyle='#8a6a3e';g.lineWidth=3;g.beginPath();g.moveTo(-sz*1.2,0);g.lineTo(sz*.6,0);g.stroke();g.fillStyle='#e8dcc0';g.beginPath();g.arc(sz*.7,0,sz*.28,0,7);g.fill();g.strokeStyle='#8a6a3e';g.lineWidth=1;g.stroke();g.fillStyle='#c9a86b';g.beginPath();g.moveTo(-sz*1.2,0);g.lineTo(-sz*1.45,-sz*.25);g.lineTo(-sz*1,0);g.lineTo(-sz*1.45,sz*.25);g.fill();}
    else if(s.kind==='stein'){g.rotate(t*6);g.fillStyle='#8f887c';g.beginPath();g.moveTo(-sz*.5,-sz*.2);g.lineTo(-sz*.1,-sz*.5);g.lineTo(sz*.45,-sz*.3);g.lineTo(sz*.5,sz*.2);g.lineTo(0,sz*.5);g.lineTo(-sz*.45,sz*.3);g.closePath();g.fill();g.strokeStyle='#5a544a';g.lineWidth=1.2;g.stroke();}
    else if(s.kind==='sack'){g.rotate(Math.sin(t*5)*.4);g.fillStyle='#c9a86b';g.beginPath();g.ellipse(0,0,sz*.55,sz*.45,0,0,7);g.fill();g.strokeStyle='#7a5a2c';g.lineWidth=1.2;g.stroke();g.beginPath();g.moveTo(-sz*.1,-sz*.45);g.lineTo(0,-sz*.65);g.lineTo(sz*.1,-sz*.45);g.stroke();}
    else{g.fillStyle='#8a5a2e';g.beginPath();g.arc(0,0,sz*.42,0,7);g.fill();g.strokeStyle='#5a3a1c';g.lineWidth=1.2;g.stroke();g.strokeStyle='#b07a44';g.beginPath();g.arc(-sz*.1,-sz*.1,sz*.22,3.5,4.8);g.stroke();}
    g.restore();}
   function signum(x,y,t){ // Feldzeichen mit Übungsstand
    const h=Math.min(view.H*.42,190),w=Math.max(86,h*.62);g.save();g.translate(x,y);g.fillStyle='#4a321c';g.fillRect(-3,0,6,h);g.fillStyle='#d9a441';g.fillRect(-w*.55,h*.06,w*1.1,4);g.beginPath();g.arc(0,-2,7,0,7);g.fill();
    const sw=Math.sin(t*2)*3;g.fillStyle='#8c2a1a';g.beginPath();g.moveTo(-w/2,h*.08);g.lineTo(w/2,h*.08);g.lineTo(w/2+sw,h*.52);g.lineTo(-w/2+sw,h*.52);g.closePath();g.fill();g.strokeStyle='#d9a441';g.lineWidth=2;g.stroke();
    for(let k=0;k<5;k++){g.fillStyle='#d9a441';g.beginPath();g.moveTo(-w/2+sw+k*w/4,h*.52);g.lineTo(-w/2+sw+k*w/4+4,h*.6);g.lineTo(-w/2+sw+k*w/4-4,h*.6);g.fill();}
    g.fillStyle='#f4dc9a';g.textAlign='center';g.textBaseline='middle';g.font=`600 ${Math.round(w*.16)}px Georgia,serif`;g.fillText('ÜBUNG',sw*.5,h*.22);g.font=`600 ${Math.round(w*.24)}px Georgia,serif`;g.fillText(`${Math.max(1,drill+1)} / 4`,sw*.5,h*.38);g.restore();}

   /* Eingaben */
   const pad=ctx.layer('schild-pad','<span class="schild-hint">Soldat antippen, dann Schild richten:</span><button type="button" data-d="left">◀ links</button><button type="button" data-d="up">▲ hoch</button><button type="button" data-d="right">rechts ▶</button>');
   pad.querySelectorAll('button').forEach(b=>ctx.on(b,'pointerdown',e=>{e.preventDefault();if(sel>=0)setDir(sel,b.dataset.d);else ctx.say('Tippe zuerst einen Soldaten an.',1400);}));
   function renderPad(){pad.classList.toggle('active',sel>=0);pad.querySelector('.schild-hint').textContent=sel>=0?`Soldat ${sel+1}: Schild richten`:'Soldat antippen, dann Schild richten:';}
   function setDir(i,d){const s=soldiers[i];if(!s)return;s.dir=d;}
   function which(x){const L=lay();let best=-1,bd=1e9;L.xs.forEach((sx,i)=>{const d=Math.abs(sx-x);if(d<bd){bd=d;best=i;}});return bd<L.h*.5?best:-1;}
   let sw=null;
   ctx.on(view.canvas,'pointerdown',e=>{if(!ctx.running||ctx.paused)return;const r=view.canvas.getBoundingClientRect();const x=e.clientX-r.left;const i=which(x);sw={x:e.clientX,y:e.clientY,i,id:e.pointerId,used:false};if(i>=0){sel=i;renderPad();}try{view.canvas.setPointerCapture(e.pointerId);}catch(_){}});
   ctx.on(view.canvas,'pointermove',e=>{if(!sw||sw.used||sw.i<0||e.pointerId!==sw.id)return;const dx=e.clientX-sw.x,dy=e.clientY-sw.y;if(Math.hypot(dx,dy)<22)return;sw.used=true;const d=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'front');setDir(sw.i,d);});
   const up=()=>{sw=null;};ctx.on(view.canvas,'pointerup',up);ctx.on(view.canvas,'pointercancel',up);
   ctx.on(window,'keydown',e=>{if(!ctx.running)return;const n=+e.key;if(n>=1&&n<=5){sel=n-1;renderPad();e.preventDefault();return;}
    const d={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'front',a:'left',d:'right',w:'up',s:'front'}[e.key];if(d&&sel>=0){setDir(sel,d);e.preventDefault();}});

   /* Ablauf */
   function spawn(){const D=DRILLS[drill];const free=[0,1,2,3,4].filter(i=>!shots.some(s=>s.target===i));if(!free.length)return;
    const n=Math.min(D.multi,free.length);const pick=free.sort(()=>Math.random()-.5).slice(0,n);
    pick.forEach((i,k)=>{const dir=D.dirs[Math.floor(Math.random()*D.dirs.length)];shots.push({target:i,dir,kind:KINDS[Math.floor(Math.random()*4)],t:-k*.25,fly:D.fly,vx:1,vy:0,done:false});total++;});}
   function update(dt,t){flameT=t;
    if(!ended){drillT-=dt;if(drill<0||drillT<=0){if(drill>=DRILLS.length-1&&!shots.length){endGame();}else if(drill<DRILLS.length-1){drill++;drillT=DRILLS[drill].dur;ctx.setTask(DRILLS[drill].text);ctx.say(DRILLS[drill].text,2000);spawnT=1.4;}}
     if(drillT>0){spawnT-=dt;if(spawnT<=0){spawn();spawnT=DRILLS[drill].gap*(.85+Math.random()*.3);}}}
    const L=lay();
    soldiers.forEach(s=>{const P=POSE[s.dir];for(const k in P)s.pose[k]+=(P[k]-s.pose[k])*Math.min(1,dt*16);s.stumble=Math.max(0,s.stumble-dt*1.6);s.wobble=Math.max(0,s.wobble-dt*1.8);s.flash=Math.max(0,s.flash-dt*3);});
    shots.forEach(s=>{s.t+=dt/s.fly;if(s.t>=1&&!s.done){s.done=true;const so=soldiers[s.target];if(so.dir===s.dir){blocked++;so.flash=1;so.wobble=.5;s.bounce=0;s.bx=0;}else{so.stumble=1;so.wobble=1;s.miss=0;}
      const x=L.xs[s.target];for(let k=0;k<8;k++)dust.push({x:x+(Math.random()-.5)*L.h*.4,y:L.feet,vx:(Math.random()-.5)*60,vy:-20-Math.random()*30,t:0});}
     if(s.done){s.after=(s.after||0)+dt;}});
    shots=shots.filter(s=>!s.done||s.after<.8);
    dust.forEach(d=>{d.t+=dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.vy+=40*dt;});dust=dust.filter(d=>d.t<1);
    if(ended)banner=Math.min(1,banner+dt*1.5);
   }
   function shotPos(s,L){const x=L.xs[s.target],sh=L.h;const so=soldiers[s.target];const tx=x+(s.dir==='left'?-sh*.3:s.dir==='right'?sh*.3:0),ty=L.feet+(s.dir==='up'?-sh*1.2:-sh*.6);
    const e=Math.max(0,Math.min(1,s.t));let sx,sy;
    if(s.dir==='up'){sx=tx+(1-e)*sh*.25;sy=-40+(ty+40)*e*e;}
    else{const from=s.dir==='left'?-50:view.W+50;sx=from+(tx-from)*e;sy=view.H*.18+(ty-view.H*.18)*e-Math.sin(e*Math.PI)*view.H*.12;}
    if(s.done){const a=s.after||0;if(so.dir===s.dir){sx=tx+(s.dir==='left'?-1:s.dir==='right'?1:(s.target%2?1:-1))*a*80;sy=ty+a*a*300-a*120;}else{sx=tx+(s.dir==='left'?1:s.dir==='right'?-1:0)*a*30;sy=ty+a*a*260;}}
    return {x:sx,y:sy};}
   function endGame(){if(ended)return;ended=true;ctx.setTask('Übung beendet.');
    ctx.after(1400,()=>ctx.win({title:'',html:`<div class="schild-banner"><span>FORMATIO TENET</span></div><p class="schild-sub">Formation gehalten!</p><p class="bonus-lines" style="text-align:center">Abgewehrte Übungswürfe: ${blocked} von ${total}</p><div class="schild-comment"><span class="schild-face" aria-hidden="true"></span><p><b>Ein Legionär:</b> „Nicht schlecht. Aber meine Einheit überlasse ich dir trotzdem nicht.“</p></div>`,backLabel:'Zurück ins Lager'}));}
   function draw(t){if(!view.W)return;const W=view.W,H=view.H,L=lay();
    if(bgc)g.drawImage(bgc,0,0,W,H);else{g.fillStyle='#3a2c20';g.fillRect(0,0,W,H);}
    // Fackeln
    [[W*.18,H*.62],[W*.82,H*.62]].forEach(([x,y],k)=>{g.fillStyle='#4a321c';g.fillRect(x-3,y-H*.14,6,H*.14);const f=1+.12*Math.sin(t*11+k)+.06*Math.sin(t*27+k);g.fillStyle='#f6b64a';g.beginPath();g.moveTo(x-8,y-H*.14);g.quadraticCurveTo(x,y-H*.14-30*f,x+8,y-H*.14);g.fill();g.fillStyle='#fff1b8';g.beginPath();g.moveTo(x-4,y-H*.14);g.quadraticCurveTo(x,y-H*.14-14*f,x+4,y-H*.14);g.fill();
     g.save();g.globalCompositeOperation='lighter';const gl=g.createRadialGradient(x,y-H*.16,0,x,y-H*.16,H*.25);gl.addColorStop(0,'rgba(255,160,60,.18)');gl.addColorStop(1,'rgba(255,160,60,0)');g.fillStyle=gl;g.fillRect(x-H*.25,y-H*.41,H*.5,H*.5);g.restore();});
    signum(Math.max(60,W*.07),H*.08,t);
    // Soldaten
    const im=imgs.people;
    soldiers.forEach((s,i)=>{const x=L.xs[i],h=L.h,w=h*SOLDAT[1]/300;const st=s.stumble,off=Math.sin(st*Math.PI)*h*.06;g.save();g.translate(x+off,L.feet);g.rotate(Math.sin(st*Math.PI*2)*.06);
     g.fillStyle='#00000045';g.beginPath();g.ellipse(0,0,w*.45,h*.04,0,0,7);g.fill();
     if(sel===i){g.strokeStyle='rgba(243,220,166,.9)';g.lineWidth=3;g.beginPath();g.ellipse(0,0,w*.55,h*.06,0,0,7);g.stroke();}
     if(im)g.drawImage(im,SOLDAT[0],0,SOLDAT[1],300,-w/2,-h,w,h);else{g.fillStyle='#8c2a1a';g.fillRect(-w/3,-h,w*.66,h);}
     drawShield(0,0,h*.36,h*.5,s.pose,s.wobble,s.flash);
     // Ankündigung über dem Kopf: woher kommt der nächste Wurf?
     const inc=shots.find(q=>q.target===i&&!q.done&&q.t>-.1);if(inc){const a=Math.min(1,(inc.t+.1)*3);g.globalAlpha=a;g.fillStyle='#efe0bd';g.strokeStyle='#6e4a14';g.lineWidth=2;const bx=0,by=-h*1.28-(inc.dir==='up'?h*.08:0);g.beginPath();g.roundRect?g.roundRect(bx-20,by-16,40,32,6):g.rect(bx-20,by-16,40,32);g.fill();g.stroke();g.fillStyle='#8c2a1a';g.font='600 20px Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.fillText(inc.dir==='left'?'◀':inc.dir==='right'?'▶':'▼',bx,by+1);g.globalAlpha=1;}
     g.fillStyle='#f3e4c5';g.font=`600 ${Math.round(Math.max(13,h*.07))}px Georgia,serif`;g.textAlign='center';g.fillText(String(i+1),0,h*.08);
     g.restore();});
    shots.forEach(s=>{if(s.t<0)return;const p=shotPos(s,L);s.vx=s.dir==='left'?1:s.dir==='right'?-1:0;s.vy=s.dir==='up'?1:(s.t<.5?-.4:.5);drawShot(s,p.x,p.y,Math.max(10,L.h*.07),t);});
    dust.forEach(d=>{g.fillStyle=`rgba(200,170,120,${.5*(1-d.t)})`;g.beginPath();g.arc(d.x,d.y,4+d.t*10,0,7);g.fill();});
   }
   ctx.loop({update,draw});
   ctx.stage.__debug={soldiers:()=>soldiers,shots:()=>shots,setDir,stats:()=>({blocked,total,drill,ended})};
   reset();
   return {start(){reset();}};
  }
 });
})();
