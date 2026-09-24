'use strict';
/* Bonusspiel 6: Rom brennt! – seitlich scrollender, „cinematischer“ Plattformer.
   Wasser vom Brunnen zu drei Brandstellen tragen. Keine Personen in Gefahr, kein Tod:
   Wer stolpert, steht am letzten sicheren Punkt wieder auf. Alles gezeichnet, keine fremden Vorlagen. */
(()=>{
 if(!window.BonusGames)return;
 const LW=66,LH=14;
 /* ---------- Level ---------- */
 function buildLevel(){
  const g=Array.from({length:LH},()=>Array(LW).fill(' '));
  const fill=(x0,x1,y0,y1,c)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)g[y][x]=c;};
  fill(0,LW-1,12,13,'#');fill(0,0,0,11,'#');fill(LW-1,LW-1,0,11,'#');
  fill(30,31,12,13,' '); // Graben
  fill(10,10,11,11,'#'); // Kiste
  // Haus 1 mit Leiter und Balkon
  fill(13,19,8,11,'#');for(let y=8;y<=11;y++)g[y][12]='H';
  fill(20,22,8,8,'=');
  fill(24,26,3,9,'#'); // hohes Haus mit Tordurchgang unten
  // Haus 2: Leiter, Block, brüchiger Steg, höherer Block
  for(let y=6;y<=11;y++)g[y][34]='H';fill(35,38,6,11,'#');fill(39,42,6,6,'b');fill(43,46,5,11,'#');
  // Treppe zum gefährdeten Häuserblock
  fill(53,53,11,11,'#');fill(54,54,10,11,'#');fill(55,55,9,11,'#');fill(56,LW-2,8,11,'#');fill(63,LW-2,2,7,'#');
  return {g,
   start:{x:2.5,y:12},bucket:{x:7.5,y:12},
   wells:[{x:4.5,y:12,kind:'brunnen'},{x:28,y:12,kind:'brunnen2'},{x:48.5,y:12,kind:'fass'}],
   fires:[{x:24.2,y:6.6,wx:24,house:'balkon'},{x:45.6,y:3.6,wx:46,house:'oben'},{x:62,y:6.2,wx:63,house:'block'}],
   hazards:[{x:16.5,y:8,kind:'glut'},{x:51.5,y:12,kind:'glut'}],
   beams:[{x:21.5,top:1.5,floor:8,period:4.2,off:0},{x:58.5,top:1,floor:8,period:3.8,off:1.5}],
   rollers:[{x:29.5,y:12,to:20.3,period:4.6,off:.5},{x:62.3,y:8,to:52,period:5.2,off:2}],
   smoke:[{x:40.5,y:4.2,rx:2.2}]};
 }
 const SOLID=c=>c==='#';
 window.BonusGames.register({
  id:'rombrennt',title:'Rom brennt!',kicker:'Bonusspiel · Erinnerung an das Jahr 64',scene:'forum',
  spot:[33,44,'Glühendes Kohlebecken'],
  intro:{text:'Ein großer Stadtbrand. Hilf dabei, Wasser vom Brunnen zu den brennenden Häusern zu bringen. Drei Brandstellen – dann ist die Gasse gerettet. (Das Spiel zeigt keine bestimmte Person und keine belegte Einzelszene.)',
   controls:['Große Knöpfe: <b>◀ ▶</b> laufen, <b>Sprung</b> springen<span class="mg-keys"> – am PC Pfeiltasten und Leertaste</span>.','Leitern und Kanten erkennt die Figur selbst: an eine Leiter laufen und springen – sie klettert. Kanten hält sie fest und zieht sich hoch.','Eimer nehmen, am Brunnen füllen, zum Feuer tragen – das Löschen geht von allein.','Wer stolpert, beginnt einfach am letzten sicheren Punkt.'],start:'Zum Brunnen'},
  setup(ctx){
   const view=ctx.canvas({maxDpr:2}),g=view.g;
   const pad=ctx.layer('rom-pad','<div class="rom-dir"><button type="button" data-k="l" aria-label="Nach links">◀</button><button type="button" data-k="r" aria-label="Nach rechts">▶</button></div><button type="button" class="rom-jump" data-k="j" aria-label="Springen">Sprung</button>');
   let L,T=48,tiles=null,P,cam,keys,fires,bucket,beams,rollers,parts,smokeParts,brk,safe,ended,calm,tt,stumble,msgCool;
   function reset(){L=buildLevel();P={x:L.start.x,y:L.start.y,vx:0,vy:0,on:false,face:1,coyote:0,buffer:0,climb:null,hang:null,run:0,inv:0,slow:0};
    keys={l:false,r:false,j:false,u:false,d:false};bucket={has:false,full:false};fires=L.fires.map(f=>({...f,out:false,level:1}));beams=L.beams.map(b=>({...b,t:b.off,y:b.top,state:'wait'}));rollers=L.rollers.map(r=>({...r,t:r.off,x0:r.x,cur:null}));
    parts=[];smokeParts=[];brk={};safe={x:P.x,y:P.y};ended=false;calm=0;stumble=0;msgCool=0;cam={x:P.x,y:P.y-3};
    if(view.W)layout();ctx.setTask('Nimm den Eimer neben dem Brunnen.');}
   function layout(){T=Math.max(34,Math.round(view.H/10.2));renderTiles();}
   view.resize=()=>layout();
   const tile=(x,y)=>{if(x<0||x>=LW)return '#';if(y<0)return ' ';if(y>=LH)return ' ';return L.g[y][x];};
   const solidAt=(x,y)=>SOLID(tile(x,y));
   const platAt=(x,y)=>{const c=tile(x,y);if(c==='=')return true;if(c==='H')return tile(x,y-1)!=='H';if(c==='b'){const s=brk[x+','+y];return !s||s.state!=='gone';}return false;};

   /* ---------- Statische Kulisse ---------- */
   function renderTiles(){const W=LW*T,H=LH*T;tiles=document.createElement('canvas');const dp=Math.min(1.5,view.dpr);tiles.width=Math.round(W*dp);tiles.height=Math.round(H*dp);const o=tiles.getContext('2d');o.scale(dp,dp);
    for(let y=0;y<LH;y++)for(let x=0;x<LW;x++){const c=L.g[y][x];const px=x*T,py=y*T;
     if(c==='#'){if(y>=12){o.fillStyle='#6d5a44';o.fillRect(px,py,T,T);o.strokeStyle='#4a3a2a';o.lineWidth=1.5;o.strokeRect(px+1,py+1,T/2-2,T/2-2);o.strokeRect(px+T/2+1,py+T/2+1,T/2-2,T/2-2);o.fillStyle='#8a7458';o.fillRect(px+3,py+3,T/2-6,3);if(y===12&&tile(x,11)!=='#'){o.fillStyle='#9a8264';o.fillRect(px,py,T,4);}}
      else{const v=((x*7+y*13)%5)*4;o.fillStyle=`rgb(${176+v},${142+v},${98+v})`;o.fillRect(px,py,T,T);o.strokeStyle='#8a6a44aa';o.lineWidth=1;const off=(y%2)*T/2;o.beginPath();o.moveTo(px,py+T/2);o.lineTo(px+T,py+T/2);for(let k=0;k<2;k++){o.moveTo(px+((off+k*T/2)%T),py);o.lineTo(px+((off+k*T/2)%T),py+T/2);o.moveTo(px+((off+T/4+k*T/2)%T),py+T/2);o.lineTo(px+((off+T/4+k*T/2)%T),py+T);}o.stroke();
       // Fenster in größeren Mauerflächen
       if(tile(x-1,y)==='#'&&tile(x+1,y)==='#'&&tile(x,y-1)==='#'&&(x+y)%3===0&&y<11){o.fillStyle='#2a1a12';o.fillRect(px+T*.28,py+T*.18,T*.44,T*.62);o.fillStyle='#e8903a55';o.fillRect(px+T*.3,py+T*.2,T*.4,T*.58);o.strokeStyle='#5a3a1c';o.lineWidth=2;o.strokeRect(px+T*.28,py+T*.18,T*.44,T*.62);}
       // Dachkante aus Ziegeln
       if(tile(x,y-1)!=='#'){o.fillStyle='#a8522e';o.fillRect(px-2,py-T*.14,T+4,T*.22);o.fillStyle='#c46a3a';for(let k=0;k<4;k++){o.beginPath();o.arc(px+k*T/4+T/8,py-T*.03,T/8,Math.PI,0);o.fill();}}}}
     if(c==='='||c==='b'){}
     if(c==='H'){o.strokeStyle='#7a5230';o.lineWidth=Math.max(3,T*.08);o.beginPath();o.moveTo(px+T*.22,py);o.lineTo(px+T*.22,py+T);o.moveTo(px+T*.78,py);o.lineTo(px+T*.78,py+T);o.stroke();o.lineWidth=Math.max(2,T*.06);o.beginPath();for(let k=0;k<3;k++){o.moveTo(px+T*.22,py+T*(k+.5)/3);o.lineTo(px+T*.78,py+T*(k+.5)/3);}o.stroke();}
    }
    // Tordurchgang
    o.fillStyle='#2a1a12';o.beginPath();o.moveTo(24*T,12*T);o.lineTo(24*T,10*T+T*.2);o.quadraticCurveTo(25.5*T,9.2*T,27*T,10*T+T*.2);o.lineTo(27*T,12*T);o.fill();
    // Brunnen
    L.wells.forEach(w=>{const x=w.x*T,y=w.y*T;if(w.kind==='fass'){o.fillStyle='#7a5230';o.beginPath();o.ellipse(x,y-T*.55,T*.5,T*.6,0,0,7);o.fill();o.strokeStyle='#3b2a1c';o.lineWidth=3;o.beginPath();o.moveTo(x-T*.5,y-T*.8);o.lineTo(x+T*.5,y-T*.8);o.moveTo(x-T*.5,y-T*.3);o.lineTo(x+T*.5,y-T*.3);o.stroke();o.fillStyle='#4a7a8a';o.beginPath();o.ellipse(x,y-T*1.12,T*.42,T*.1,0,0,7);o.fill();}
     else{o.fillStyle='#9a8a6a';o.fillRect(x-T*.8,y-T*.9,T*1.6,T*.9);o.strokeStyle='#5a4a3a';o.lineWidth=2;o.strokeRect(x-T*.8,y-T*.9,T*1.6,T*.9);o.fillStyle='#4a7a8a';o.fillRect(x-T*.7,y-T*.95,T*1.4,T*.12);
      if(w.kind==='brunnen'){o.strokeStyle='#5a3a1c';o.lineWidth=4;o.beginPath();o.moveTo(x-T*.7,y-T*.9);o.lineTo(x-T*.7,y-T*2);o.lineTo(x+T*.7,y-T*2);o.lineTo(x+T*.7,y-T*.9);o.stroke();o.fillStyle='#8a6a3e';o.fillRect(x-T*.6,y-T*1.9,T*1.2,T*.14);}
      else{o.fillStyle='#b8a888';o.fillRect(x-T*.25,y-T*1.9,T*.5,T*1);o.fillStyle='#8a7a5a';o.beginPath();o.arc(x,y-T*1.6,T*.18,0,7);o.fill();o.strokeStyle='#6aa0b0';o.lineWidth=3;o.beginPath();o.moveTo(x,y-T*1.45);o.quadraticCurveTo(x+T*.25,y-T*1.3,x+T*.3,y-T*.95);o.stroke();}}});
   }
   /* ---------- Eingabe ---------- */
   pad.querySelectorAll('button').forEach(b=>{const k=b.dataset.k;ctx.on(b,'pointerdown',e=>{e.preventDefault();keys[k]=true;if(k==='j')P.buffer=.14;b.classList.add('on');});const up=()=>{keys[k]=false;b.classList.remove('on');};ctx.on(b,'pointerup',up);ctx.on(b,'pointercancel',up);ctx.on(b,'pointerleave',up);});
   const KM={ArrowLeft:'l',a:'l',A:'l',ArrowRight:'r',d:'r',D:'r',' ':'j',ArrowUp:'u',w:'u',W:'u',ArrowDown:'d',s:'d',S:'d'};
   ctx.on(window,'keydown',e=>{const k=KM[e.key];if(!k||!ctx.running)return;e.preventDefault();if(!keys[k]&&(k==='j'||k==='u'))P.buffer=.14;keys[k]=true;});
   ctx.on(window,'keyup',e=>{const k=KM[e.key];if(k)keys[k]=false;});
   /* ---------- Physik ---------- */
   const G=38,JUMP=13.4,RUN=5.4,PW=.3,PH=1.45;
   function collideX(){const top=Math.floor(P.y-PH+.01),bot=Math.floor(P.y-.01);if(P.vx>0){const x=Math.floor(P.x+PW);for(let y=top;y<=bot;y++)if(solidAt(x,y)){P.x=x-PW-.001;P.vx=0;return x;}}else if(P.vx<0){const x=Math.floor(P.x-PW);for(let y=top;y<=bot;y++)if(solidAt(x,y)){P.x=x+1+PW+.001;P.vx=0;return x;}}return null;}
   function update(dt,t){tt=t;msgCool=Math.max(0,msgCool-dt);
    beams.forEach(b=>{b.t+=dt;const ph=b.t%b.period;if(ph<b.period-1.8){b.state='wait';b.y=b.top;}else if(ph<b.period-.9){b.state='warn';b.y=b.top;}else{b.state='fall';const e=(ph-(b.period-.9))/.9;b.y=b.top+(b.floor-b.top)*Math.min(1,e*e*1.4);}});
    rollers.forEach(r=>{r.t+=dt;const ph=r.t%r.period;const dur=(r.x0-r.to)/3.2;if(ph<dur){r.cur={x:r.x0-ph*3.2,y:r.y,rot:-ph*9};let fy=r.y;const xi=Math.floor(r.cur.x);for(let y=Math.floor(r.y-1);y<LH;y++){if(solidAt(xi,y)){fy=y;break;}}r.cur.y=fy;}else r.cur=null;});
    Object.entries(brk).forEach(([k,s])=>{s.t+=dt;if(s.state==='shake'&&s.t>.55){s.state='gone';s.t=0;const [x,y]=k.split(',').map(Number);for(let i=0;i<5;i++)parts.push({x:x+Math.random(),y:y+.2,vx:(Math.random()-.5)*2,vy:-Math.random()*2,t:0,k:'plank'});}if(s.state==='gone'&&s.t>4.5)delete brk[k];});
    fires.forEach(f=>{if(!f.out||f.level>0)f.level=f.out?Math.max(0,f.level-dt*.8):1;});
    // Flammen- und Rauchpartikel
    if(!calm)fires.forEach(f=>{if(f.level>0&&Math.random()<dt*28*f.level)parts.push({x:f.x+(Math.random()-.5)*1.2,y:f.y+.5,vx:(Math.random()-.5)*.6,vy:-2-Math.random()*2,t:0,k:'flame',s:.3+Math.random()*.3});if(f.level>0&&Math.random()<dt*5)smokeParts.push({x:f.x+(Math.random()-.5),y:f.y-.6,vx:.3+Math.random()*.4,vy:-.8-Math.random()*.5,t:0,s:.6+Math.random()*.6});});
    L.smoke.forEach(s=>{if(!calm&&Math.random()<dt*3)smokeParts.push({x:s.x+(Math.random()-.5)*s.rx*2,y:s.y+Math.random(),vx:.2+Math.random()*.3,vy:-.25,t:0,s:1+Math.random()*.8,thick:true});});
    parts.forEach(p=>{p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.k==='water'){p.vy+=14*dt;}if(p.k==='plank')p.vy+=18*dt;});parts=parts.filter(p=>p.t<(p.k==='flame'?.8:p.k==='water'?1.2:1.5));
    smokeParts.forEach(p=>{p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;});smokeParts=smokeParts.filter(p=>p.t<(p.thick?3.5:4));
    if(ended){calm=Math.min(1,calm+dt*.4);return;}
    if(stumble>0){stumble-=dt;if(stumble<=0){P.x=safe.x;P.y=safe.y;P.vx=P.vy=0;P.climb=P.hang=null;P.inv=1.2;}return;}
    P.inv=Math.max(0,P.inv-dt);P.slow=Math.max(0,P.slow-dt);
    const dir=(keys.r?1:0)-(keys.l?1:0);if(dir)P.face=dir;
    P.buffer=Math.max(0,P.buffer-dt);
    // Klettern an Leitern (automatisch nach oben)
    const cx=Math.floor(P.x),cyFeet=Math.floor(P.y-.05),cyMid=Math.floor(P.y-.7);
    const onLadder=tile(cx,cyFeet)==='H'||tile(cx,cyMid)==='H';
    if(!P.climb&&!P.hang&&onLadder&&(P.buffer>0||keys.u)){P.climb={dir:-1};P.buffer=0;P.x=cx+.5;P.vx=0;P.vy=0;}
    if(!P.climb&&!P.hang&&P.on&&keys.d&&tile(cx,Math.floor(P.y+.1))==='H'){P.climb={dir:1};P.x=cx+.5;}
    if(P.climb){const sp=4.2;P.y+=P.climb.dir*sp*dt;P.run+=dt*6;
     if(P.climb.dir<0&&tile(Math.floor(P.x),Math.floor(P.y-.05))!=='H'){P.y=Math.floor(P.y-.05)+1;P.climb=null;P.on=true;P.vy=0;}
     else if(P.climb.dir>0&&(solidAt(Math.floor(P.x),Math.floor(P.y))||platAt(Math.floor(P.x),Math.floor(P.y))&&tile(Math.floor(P.x),Math.floor(P.y))!=='H')){P.y=Math.floor(P.y);P.climb=null;}
     if(P.climb&&(keys.l||keys.r)&&P.climb.dir>0){P.climb=null;}
     camFollow(dt);interact(dt);return;}
    // An der Kante hängen und hochziehen
    if(P.hang){P.hang.t+=dt;if(P.hang.t>.28&&!P.hang.up){P.hang.up=0;}if(P.hang.up!==undefined){P.hang.up+=dt/.38;const e=Math.min(1,P.hang.up);P.x=P.hang.x0+(P.hang.x1-P.hang.x0)*e;P.y=P.hang.y0+(P.hang.y1-P.hang.y0)*Math.min(1,e*1.6);if(e>=1){P.hang=null;P.on=true;P.vy=0;}}camFollow(dt);interact(dt);return;}
    const acc=P.on?55:32,max=RUN*(P.slow>0?.55:1);
    if(dir)P.vx+=(dir*max-P.vx)*Math.min(1,acc*dt/Math.max(1,Math.abs(dir*max-P.vx)))*1;else P.vx*=P.on?Math.pow(.0005,dt):Math.pow(.3,dt);
    P.vx=Math.max(-max,Math.min(max,P.vx));
    if(P.on)P.coyote=.1;else P.coyote=Math.max(0,P.coyote-dt);
    if(P.buffer>0&&P.coyote>0){P.vy=-JUMP;P.on=false;P.coyote=0;P.buffer=0;}
    if(!keys.j&&!keys.u&&P.vy<-4)P.vy+=G*dt*1.2; // kurzer Druck = kleiner Sprung
    P.vy=Math.min(18,P.vy+G*dt);
    P.x+=P.vx*dt;const wallX=collideX();
    const prevY=P.y;P.y+=P.vy*dt;P.on=false;
    if(P.vy>0){const y=Math.floor(P.y);for(const x of [Math.floor(P.x-PW+.02),Math.floor(P.x+PW-.02)]){if(solidAt(x,y)||(platAt(x,y)&&prevY<=y+.02)){P.y=y;P.vy=0;P.on=true;const c=tile(x,y);if(c==='b'&&!brk[x+','+y]){brk[x+','+y]={state:'shake',t:0};if(msgCool<=0){ctx.say('Der Steg knackt!',1100);msgCool=2;}}break;}}}
    else if(P.vy<0){const y=Math.floor(P.y-PH);for(const x of [Math.floor(P.x-PW+.02),Math.floor(P.x+PW-.02)]){if(solidAt(x,y)){P.y=y+1+PH;P.vy=0;break;}}}
    // Kante greifen: in der Luft, fallend, gegen eine Wand, deren Oberkante frei ist
    if(!P.on&&P.vy>-2&&(dir||wallX!==null)){const fx=P.face>0?Math.floor(P.x+PW+.08):Math.floor(P.x-PW-.08);const hy=Math.floor(P.y-PH+.2);
     for(const ly of [hy,hy+1]){if(solidAt(fx,ly)&&!solidAt(fx,ly-1)&&!solidAt(fx,ly-2)&&!solidAt(Math.floor(P.x),ly-1)){const edgeY=ly;if(P.y-PH<edgeY+.55&&P.y-PH>edgeY-.8){P.hang={t:0,x0:P.x,y0:edgeY+PH*.85,x1:fx+.5,y1:edgeY};P.y=P.hang.y0;P.vx=P.vy=0;break;}}}}
    if(P.x>0)P.run+=Math.abs(P.vx)*dt*1.6;
    // sicherer Punkt
    if(P.on&&!nearDanger()&&Math.abs(P.vx)<RUN){const c=tile(Math.floor(P.x),Math.floor(P.y));if(c==='#'||c==='='){safe={x:P.x,y:P.y};}}
    if(P.y>LH+1){fall('Hinuntergefallen – zurück zum letzten sicheren Punkt.');}
    hazards();camFollow(dt);interact(dt);
   }
   function nearDanger(){return L.hazards.some(h=>Math.abs(h.x-P.x)<1.6&&Math.abs(h.y-P.y)<1.5)||beams.some(b=>Math.abs(b.x-P.x)<1.3)||rollers.some(r=>r.cur&&Math.abs(r.cur.x-P.x)<3&&Math.abs(r.cur.y-P.y)<1.5)||Math.abs(P.x-30.5)<2.5&&P.y>11;}
   function fall(msg){stumble=.7;ctx.say(msg,1500);P.vx=0;}
   function hit(msg){if(P.inv>0||stumble>0)return;stumble=.75;ctx.say(msg,1500);for(let i=0;i<8;i++)parts.push({x:P.x,y:P.y-.3,vx:(Math.random()-.5)*3,vy:-Math.random()*3,t:0,k:'dust'});}
   function hazards(){const bx0=P.x-PW,bx1=P.x+PW,by0=P.y-PH,by1=P.y;
    L.hazards.forEach(h=>{if(bx1>h.x-.45&&bx0<h.x+.45&&by1>h.y-.7&&by0<h.y)hit('Glut! Du stolperst zurück.');});
    beams.forEach(b=>{if(b.state==='fall'&&Math.abs(b.x-P.x)<.9&&by0<b.y+.3&&by1>b.y-.3)hit('Ein Balken! Zum Glück nur ein Schreck.');});
    rollers.forEach(r=>{if(r.cur&&Math.abs(r.cur.x-P.x)<.55&&Math.abs(r.cur.y-.35-(P.y-.35))<.6)hit('Eine rollende Amphore bringt dich zu Fall.');});
    L.smoke.forEach(s=>{if(Math.abs(s.x-P.x)<s.rx&&P.y-PH<s.y+1&&P.y>s.y-1){if(P.slow<=0&&msgCool<=0){ctx.say('Rauch! Du hustest und wirst langsamer.',1300);msgCool=2.5;}P.slow=.6;}});}
   function camFollow(dt){const W=view.W/T,H=view.H/T;const tx=P.x+P.face*1.6,ty=P.y-2.2;cam.x+=(tx-cam.x)*Math.min(1,dt*3.2);cam.y+=(ty-cam.y)*Math.min(1,dt*2.4);cam.x=Math.max(W/2,Math.min(LW-W/2,cam.x));cam.y=Math.max(H/2-1,Math.min(LH-H/2,cam.y));}
   function interact(dt){
    if(!bucket.has&&Math.abs(P.x-L.bucket.x)<.9&&Math.abs(P.y-L.bucket.y)<1){bucket.has=true;ctx.say('Eimer genommen. Jetzt am Brunnen füllen.',1800);task();}
    if(bucket.has&&!bucket.full){const w=L.wells.find(w=>Math.abs(w.x-P.x)<1.4&&Math.abs(w.y-P.y)<1.2);if(w){bucket.filling=(bucket.filling||0)+dt;if(bucket.filling>.7){bucket.full=true;bucket.filling=0;ctx.say('Der Eimer ist voll.',1300);task();}}else bucket.filling=0;}
    const f=fires.find(f=>!f.out&&Math.abs(f.x-P.x)<2&&Math.abs(f.y-P.y+.8)<2.4);
    if(f){if(bucket.full){bucket.full=false;f.out=true;for(let i=0;i<26;i++)parts.push({x:P.x+P.face*.4,y:P.y-1,vx:(f.x-P.x)*1.4+(Math.random()-.5)*1.5,vy:-3-Math.random()*3,t:0,k:'water'});for(let i=0;i<10;i++)smokeParts.push({x:f.x+(Math.random()-.5),y:f.y,vx:(Math.random()-.5)*.4,vy:-1.2,t:0,s:.3,steam:true});
      const n=fires.filter(x=>x.out).length;ctx.say(n<3?`Gelöscht! (${n}/3)`:'Das letzte Feuer ist aus!',1800);task();if(n===3)finish();}
     else if(msgCool<=0){ctx.say(bucket.has?'Dein Eimer ist leer – fülle ihn am nächsten Brunnen.':'Du brauchst zuerst einen Eimer.',1800);msgCool=3;}}}
   function task(){const n=fires.filter(x=>x.out).length;ctx.setTask(!bucket.has?'Nimm den Eimer neben dem Brunnen.':!bucket.full?`Fülle den Eimer am Brunnen. Gelöscht: ${n}/3`:`Bring das Wasser zum nächsten Brand. Gelöscht: ${n}/3`);}
   function finish(){ended=true;ctx.setTask('Die Gasse ist gerettet.');
    ctx.after(3600,()=>ctx.win({title:'Die Brände sind gelöscht.',html:`<div class="rom-chron"><img src="assets/minigames/chronistin.jpg" alt=""><div><p class="rom-who">Die Chronistin</p><p>„Der große Brand von Rom im Jahr 64 ist gut belegt. Wer ihn verursachte, lässt sich dagegen nicht sicher feststellen.“</p></div></div><p class="muted" style="text-align:center">Ereignis ≠ sichere Kenntnis der Ursache.</p>`,backLabel:'Zurück zum Forum'}));}

   /* ---------- Zeichnen ---------- */
   function draw(t){if(!view.W||!tiles)return;const W=view.W,H=view.H;const ox=W/2-cam.x*T,oy=H/2-cam.y*T;
    // Himmel: glühend, nach dem Löschen ruhiger
    const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,mix('#3a2230','#2a3a55',calm));sky.addColorStop(.6,mix('#b0502a','#8a6a6a',calm));sky.addColorStop(1,mix('#e0893a','#c9a07a',calm));g.fillStyle=sky;g.fillRect(0,0,W,H);
    // ferne Silhouetten (Parallaxe)
    const p1=ox*.2;g.fillStyle=mix('#3a2226','#3a3a48',calm);g.beginPath();g.moveTo(0,H);for(let x=-200;x<W+200;x+=40){const X=x+((p1%400)+400)%400-400;g.lineTo(X,H*.55-Math.abs(Math.sin(X*.01+1))*H*.08-((X|0)%160<40?H*.06:0));}g.lineTo(W,H);g.fill();
    const p2=ox*.5;for(let k=-2;k<14;k++){const bx=k*180+((p2%180)+180)%180-180,bh=H*(.22+((k*37)%5)*.04);g.fillStyle=mix('#5a3a2e','#5a5058',calm);g.fillRect(bx,H*.7-bh,140,bh+H*.3);g.fillStyle=mix('#e8903a88','#e8c07a44',calm);for(let w=0;w<3;w++)g.fillRect(bx+20+w*40,H*.7-bh+20,14,20);if(!calm&&k%3===0){const f=1+.2*Math.sin(t*8+k);g.fillStyle='#f0a040aa';g.beginPath();g.moveTo(bx+30,H*.7-bh);g.quadraticCurveTo(bx+60,H*.7-bh-50*f,bx+90,H*.7-bh);g.fill();}}
    g.drawImage(tiles,ox,oy,LW*T,LH*T);
    // brüchige und feste Stege
    for(let y=0;y<LH;y++)for(let x=0;x<LW;x++){const c=L.g[y][x];if(c!=='='&&c!=='b')continue;const s=brk[x+','+y];if(s&&s.state==='gone')continue;const sh=s&&s.state==='shake'?Math.sin(t*60)*2:0;const px=ox+x*T+sh,py=oy+y*T;
     g.fillStyle=c==='b'?'#8a6a3e':'#7a5230';g.fillRect(px,py,T,T*.26);g.strokeStyle='#3b2a1c';g.lineWidth=1.5;g.strokeRect(px,py,T,T*.26);g.beginPath();g.moveTo(px+T/2,py);g.lineTo(px+T/2,py+T*.26);g.stroke();if(c==='b'){g.beginPath();g.moveTo(px+T*.2,py+T*.05);g.lineTo(px+T*.32,py+T*.2);g.lineTo(px+T*.4,py+T*.08);g.stroke();}else{g.strokeStyle='#5a3a1c';g.lineWidth=3;g.beginPath();g.moveTo(px+T*.2,py+T*.26);g.lineTo(px+T*.5,py+T*.9);g.stroke();}}
    // Eimer (liegt)
    if(!bucket.has){drawBucket(ox+L.bucket.x*T,oy+L.bucket.y*T-T*.02,T*.5,false,0);}
    // Glut-Stellen
    L.hazards.forEach(h=>{const x=ox+h.x*T,y=oy+h.y*T;g.fillStyle='#3b2a1c';g.beginPath();g.ellipse(x,y-2,T*.45,T*.12,0,0,7);g.fill();for(let k=0;k<4;k++){const f=1+.25*Math.sin(t*9+k*2);g.fillStyle=k%2?'#f6b64a':'#e0602a';g.beginPath();g.moveTo(x-T*.35+k*T*.2,y-3);g.quadraticCurveTo(x-T*.28+k*T*.2,y-T*.55*f,x-T*.2+k*T*.2,y-3);g.fill();}});
    // Balken (mit Vorwarnung: Staub rieselt)
    beams.forEach(b=>{const rx=ox+b.x*T,ry=oy+(b.top-.45)*T;g.fillStyle='#4a321c';g.fillRect(rx-T*1.2,ry-T*.1,T*2.4,T*.2);g.fillStyle='#a8522e';g.fillRect(rx-T*1.3,ry-T*.34,T*2.6,T*.24);g.fillStyle='#3b2a1c';g.fillRect(rx-T*1.1,ry+T*.1,T*.12,T*.35);g.fillRect(rx+T*1,ry+T*.1,T*.12,T*.35);});
    beams.forEach(b=>{const x=ox+b.x*T,y=oy+b.y*T;if(b.state==='warn'){for(let k=0;k<3;k++){g.fillStyle='rgba(220,200,160,.8)';g.fillRect(x-T*.3+Math.random()*T*.6,y+Math.random()*T*3,2,4);}}
     g.save();g.translate(x,y);g.rotate(b.state==='fall'?.15:0);g.fillStyle='#5a3a1c';g.fillRect(-T*.7,-T*.14,T*1.4,T*.28);g.fillStyle='#e0602a';g.fillRect(T*.3,-T*.14,T*.4,T*.28);const f=1+.3*Math.sin(t*12);g.fillStyle='#f6b64a';g.beginPath();g.moveTo(T*.35,-T*.14);g.quadraticCurveTo(T*.5,-T*.5*f,T*.7,-T*.14);g.fill();g.restore();});
    // rollende Amphoren
    rollers.forEach(r=>{if(!r.cur)return;const x=ox+r.cur.x*T,y=oy+r.cur.y*T-T*.33;g.save();g.translate(x,y);g.rotate(r.cur.rot);g.fillStyle='#b5673a';g.beginPath();g.ellipse(0,0,T*.36,T*.28,0,0,7);g.fill();g.strokeStyle='#7a3a1a';g.lineWidth=2;g.stroke();g.fillStyle='#8a4a24';g.fillRect(T*.3,-T*.08,T*.14,T*.16);g.restore();});
    // Brandstellen
    fires.forEach(f=>{const x=ox+f.x*T,y=oy+f.y*T;if(f.level>0){g.save();g.globalCompositeOperation='lighter';const gl=g.createRadialGradient(x,y,0,x,y,T*3*f.level);gl.addColorStop(0,`rgba(255,150,60,${.4*f.level})`);gl.addColorStop(1,'rgba(255,150,60,0)');g.fillStyle=gl;g.fillRect(x-T*3,y-T*3,T*6,T*6);g.restore();
      for(let k=0;k<5;k++){const ff=f.level*(1+.25*Math.sin(t*10+k*1.7));g.fillStyle=k%2?'#f6b64a':'#e0602a';g.beginPath();g.moveTo(x-T*.7+k*T*.3,y+T*.6);g.quadraticCurveTo(x-T*.6+k*T*.3,y-T*1.1*ff,x-T*.4+k*T*.3,y+T*.6);g.fill();}}
     else{g.fillStyle='#3a2a2a88';g.beginPath();g.ellipse(x,y+T*.4,T*.8,T*.25,0,0,7);g.fill();}
     if(!f.out){g.fillStyle='rgba(255,248,230,.9)';g.font=`600 ${Math.round(T*.34)}px Georgia,serif`;g.textAlign='center';g.fillText(`Brand ${fires.indexOf(f)+1}`,x,y-T*1.45);}});
    parts.forEach(p=>{const x=ox+p.x*T,y=oy+p.y*T;if(p.k==='flame'){g.fillStyle=`rgba(255,${150+Math.random()*80|0},60,${1-p.t/.8})`;g.beginPath();g.arc(x,y,T*p.s*(1-p.t),0,7);g.fill();}else if(p.k==='water'){g.fillStyle=`rgba(120,180,220,${1-p.t/1.2})`;g.beginPath();g.arc(x,y,T*.09,0,7);g.fill();}else if(p.k==='plank'){g.fillStyle='#8a6a3e';g.fillRect(x,y,T*.3,T*.1);}else{g.fillStyle=`rgba(200,170,120,${.6*(1-p.t/1.5)})`;g.beginPath();g.arc(x,y,T*.12+p.t*T*.2,0,7);g.fill();}});
    // Spielfigur
    drawPlayer(ox+P.x*T,oy+P.y*T,t);
    smokeParts.forEach(p=>{const x=ox+p.x*T,y=oy+p.y*T;const life=p.thick?3.5:4;const a=Math.sin(Math.min(1,p.t/life)*Math.PI)*(p.steam?.5:p.thick?.55:.35);g.fillStyle=p.steam?`rgba(240,240,240,${a*.6})`:`rgba(90,80,80,${a})`;g.beginPath();g.arc(x,y,T*p.s*(1+p.t*.4),0,7);g.fill();});
    if(stumble>0&&stumble<.35){g.fillStyle=`rgba(20,12,8,${(.35-stumble)/.35*.7})`;g.fillRect(0,0,W,H);}
   }
   function mix(a,b,e){const pa=[1,3,5].map(i=>parseInt(a.substr(i,2),16)),pb=[1,3,5].map(i=>parseInt(b.substr(i,2),16));const al=a.length>7?parseInt(a.substr(7,2),16)/255:1;return `rgba(${pa.map((v,i)=>Math.round(v+(pb[i]-v)*e)).join(',')},${al})`;}
   function drawBucket(x,y,s,full,swing){g.save();g.translate(x,y);g.rotate(swing);g.fillStyle='#8a6a3e';g.beginPath();g.moveTo(-s*.45,-s*.8);g.lineTo(s*.45,-s*.8);g.lineTo(s*.35,0);g.lineTo(-s*.35,0);g.closePath();g.fill();g.strokeStyle='#3b2a1c';g.lineWidth=2;g.stroke();g.beginPath();g.moveTo(-s*.42,-s*.55);g.lineTo(s*.42,-s*.55);g.moveTo(-s*.38,-s*.2);g.lineTo(s*.38,-s*.2);g.stroke();g.beginPath();g.arc(0,-s*.8,s*.45,Math.PI,0);g.stroke();if(full){g.fillStyle='#6aa8c8';g.fillRect(-s*.43,-s*.82,s*.86,s*.1);}g.restore();}
   function drawPlayer(x,y,t){const s=T;const f=P.face;g.save();g.translate(x,y);
    if(stumble>0){g.rotate(f*.9*Math.min(1,(.75-stumble)*4));}
    const run=P.on&&Math.abs(P.vx)>.3?Math.sin(P.run*2.2):0;const air=!P.on&&!P.climb&&!P.hang;
    g.fillStyle='#00000040';g.beginPath();g.ellipse(0,0,s*.3,s*.07,0,0,7);g.fill();
    g.scale(f,1);
    // Beine
    g.strokeStyle='#b07a50';g.lineWidth=s*.1;g.lineCap='round';const l1=P.climb?Math.sin(P.run)*.5:air?.5:run*.7,l2=P.climb?-Math.sin(P.run)*.5:air?-.3:-run*.7;
    g.beginPath();g.moveTo(0,-s*.55);g.lineTo(Math.sin(l1)*s*.5,-s*.55+Math.cos(l1)*s*.52);g.moveTo(0,-s*.55);g.lineTo(Math.sin(l2)*s*.5,-s*.55+Math.cos(l2)*s*.52);g.stroke();g.strokeStyle='#5a3a1c';g.lineWidth=s*.08;g.beginPath();[l1,l2].forEach(l=>{const fx=Math.sin(l)*s*.5,fy=-s*.55+Math.cos(l)*s*.52;g.moveTo(fx-s*.02,fy);g.lineTo(fx+s*.12,fy);});g.stroke();
    // Körper (Tunika)
    g.fillStyle='#2d5a4b';g.beginPath();g.moveTo(-s*.2,-s*1.15);g.lineTo(s*.2,-s*1.15);g.lineTo(s*.26,-s*.5);g.lineTo(-s*.26,-s*.5);g.closePath();g.fill();g.fillStyle='#8a6a3e';g.fillRect(-s*.22,-s*.8,s*.44,s*.06);
    // Kopf
    g.fillStyle='#c89a6e';g.beginPath();g.arc(s*.04,-s*1.3,s*.16,0,7);g.fill();g.fillStyle='#3a2616';g.beginPath();g.arc(-s*.02,-s*1.36,s*.15,Math.PI*.9,Math.PI*2.1);g.fill();
    // Arme und Eimer
    const arm=P.climb||P.hang?-2.6:run*.6+(bucket.has?.35:0);g.strokeStyle='#2d5a4b';g.lineWidth=s*.12;g.beginPath();g.moveTo(0,-s*1.08);g.lineTo(Math.sin(arm)*s*.2,-s*1.08+Math.cos(arm)*s*.2);g.stroke();g.strokeStyle='#c89a6e';g.lineWidth=s*.075;g.beginPath();g.moveTo(Math.sin(arm)*s*.2,-s*1.08+Math.cos(arm)*s*.2);g.lineTo(Math.sin(arm)*s*.42,-s*1.08+Math.cos(arm)*s*.42);g.stroke();
    if(bucket.has&&!P.climb&&!P.hang){drawBucket(s*.28,-s*.52,s*.42,bucket.full,Math.sin(t*6)*.08*Math.abs(run));}
    g.restore();}
   ctx.loop({update,draw});
   ctx.stage.__debug={P:()=>P,keys:()=>keys,bucket:()=>bucket,fires:()=>fires,L:()=>L,tp:(x,y)=>{P.x=x;P.y=y;P.vx=P.vy=0;},ended:()=>ended};
   reset();
   return {start(){reset();}};
  }
 });
})();
