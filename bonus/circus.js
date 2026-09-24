'use strict';
/* Bonusspiel 5: Circus Maximus – Das Rennen.
   Draufsicht mit mitdrehender Kamera auf die ovale Rennbahn. Der Wagen fährt selbst;
   gesteuert wird nur die Spur. Innen ist der Weg durch die Kurven kürzer.
   Sieben Runden – gezählt mit den sieben Delfinen auf der spina (wie im antiken Circus). */
(()=>{
 if(!window.BonusGames)return;
 const LW=100,R=560,LS=1800,LAPS=7,LANES=[-1.5,-.5,.5,1.5];
 const LAP=2*LS+2*Math.PI*R;
 const QUESTIONS=[
  {q:'Wer beendete 311 die Verfolgung weitgehend?',a:['311 · Galerius','313 · Nero']},
  {q:'Was regelte die Mailänder Vereinbarung 313?',a:['Religionsfreiheit','Nur Christen erlaubt']},
  {q:'Wann begann die große Verfolgung unter Diokletian?',a:['303','325']},
  {q:'Wo siegte Konstantin 312?',a:['Milvische Brücke','Nicäa']}];
 const COLORS={gruen:['#3f7a4a','Grün'],rot:['#a8432a','Rot'],weiss:['#e8e0cc','Weiß'],blau:['#3a5f8a','Blau']};

 function pos(p,d){p=((p%LAP)+LAP)%LAP;const r=R+d*LW;
  if(p<LS)return {x:-LS/2+p,y:r,h:0};
  if(p<LS+Math.PI*R){const t=(p-LS)/R,f=Math.PI/2-t;return {x:LS/2+r*Math.cos(f),y:r*Math.sin(f),h:f-Math.PI/2};}
  if(p<2*LS+Math.PI*R){const q=p-LS-Math.PI*R;return {x:LS/2-q,y:-r,h:Math.PI};}
  const t=(p-2*LS-Math.PI*R)/R,f=-Math.PI/2-t;return {x:-LS/2+r*Math.cos(f),y:r*Math.sin(f),h:f-Math.PI/2};}
 const inCurve=p=>{p=((p%LAP)+LAP)%LAP;return (p>=LS&&p<LS+Math.PI*R)||p>=2*LS+Math.PI*R;};
 function pattern(g,draw,size){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);return g.createPattern(c,'repeat');}

 window.BonusGames.register({
  id:'circus',title:'Circus Maximus – Das Rennen',kicker:'Bonusspiel · Nach der Chronik',scene:'city',
  spot:[16,31,'Ankündigung: Wagenrennen'],
  when:state=>!!state.flags?.finished, // erst nach dem Abschluss der Hauptgeschichte
  intro:{text:'Großer Renntag im Circus Maximus! Du lenkst das grüne Gespann. Der Wagen fährt von selbst – du wählst die Spur. Sieben Runden, gezählt mit den Delfinen auf der Mittelmauer.',
   controls:['<b>Wischen</b> oder links/rechts ins Bild <b>tippen</b>: eine Spur nach links oder rechts<span class="mg-keys"> (am PC Pfeiltasten)</span>.','In den Kurven ist die <b>innere Spur</b> kürzer.','Sand, Radspuren und Amphoren bremsen nur. Sammle <b>Lorbeerzweige</b>.','An drei Toren entscheidet dein Wissen über den kürzeren Weg.'],start:'Zum Start'},
  setup(ctx){
   const view=ctx.canvas({maxDpr:2}),g=view.g;let pats=null;
   const q=ctx.layer('circus-q');q.hidden=true;
   const pad=ctx.layer('circus-pad','<button type="button" data-d="-1" aria-label="Spur nach links">◀</button><button type="button" data-d="1" aria-label="Spur nach rechts">▶</button>');
   let P,ais,things,dust,gates,laurel,finished,countdown,cam,camH,msgT,crowdT,results;
   function newRacer(color,lane,speed,ai){return {color,lane,d:LANES[lane],p:-40*lane,lap:0,mult:1,boost:0,slow:0,speed,ai,swayT:Math.random()*5,next:1+Math.random()*2,done:false,time:0};}
   function reset(){P=newRacer('gruen',2,1,false);ais=[newRacer('rot',0,.945,true),newRacer('weiss',1,.965,true),newRacer('blau',3,.985,true)];ais.forEach((a,i)=>a.p=-40*a.lane);
    things=[];dust=[];laurel=0;finished=false;countdown=3.2;cam=null;camH=null;msgT=0;results=null;
    const qs=[...QUESTIONS].sort(()=>Math.random()-.5).slice(0,3);gates=qs.map((qq,i)=>({lap:1+i*2,p:LS*.62,q:qq.q,correctInner:Math.random()<.5,a:qq.a,done:false,shown:false}));
    q.hidden=true;ctx.setTask('Runde 1 von 7');}
   const total=r=>r.lap*LAP+r.p;
   function spawnAhead(){const ahead=total(P)+1400+Math.random()*900;const lap=Math.floor(ahead/LAP),p=ahead-lap*LAP;
    if(gates.some(gt=>gt.lap===lap&&Math.abs(gt.p-p)<700))return;
    const r=Math.random();const kind=r<.34?'lorbeer':r<.55?'sand':r<.75?'rille':'amphore';things.push({kind,lap,p,lane:Math.floor(Math.random()*4),hit:false,rot:Math.random()*6});}
   let nextSpawn=600;
   function laneChange(r,dir){r.lane=Math.max(0,Math.min(3,r.lane+dir));}
   /* Eingabe */
   pad.querySelectorAll('button').forEach(b=>ctx.on(b,'pointerdown',e=>{e.preventDefault();if(ctx.running&&!ctx.paused)laneChange(P,+b.dataset.d);}));
   let sw=null;
   ctx.on(view.canvas,'pointerdown',e=>{sw={x:e.clientX,y:e.clientY,moved:false,id:e.pointerId};try{view.canvas.setPointerCapture(e.pointerId);}catch(_){}});
   ctx.on(view.canvas,'pointermove',e=>{if(!sw||sw.moved||e.pointerId!==sw.id)return;const dx=e.clientX-sw.x;if(Math.abs(dx)>26&&Math.abs(dx)>Math.abs(e.clientY-sw.y)){sw.moved=true;if(ctx.running&&!ctx.paused)laneChange(P,dx<0?-1:1);}});
   ctx.on(view.canvas,'pointerup',e=>{if(sw&&!sw.moved&&ctx.running&&!ctx.paused){const r=view.canvas.getBoundingClientRect();laneChange(P,e.clientX-r.left<r.width/2?-1:1);}sw=null;});
   ctx.on(view.canvas,'pointercancel',()=>{sw=null;});
   ctx.on(window,'keydown',e=>{if(!ctx.running||e.repeat)return;if(['ArrowLeft','a','A'].includes(e.key)){laneChange(P,-1);e.preventDefault();}if(['ArrowRight','d','D'].includes(e.key)){laneChange(P,1);e.preventDefault();}});

   /* Bewegung */
   function move(r,dt,base){r.d+=(LANES[r.lane]-r.d)*Math.min(1,dt*7);
    if(r.boost>0){r.boost-=dt;r.mult+=(1.32-r.mult)*Math.min(1,dt*3);}else if(r.slow>0){r.slow-=dt;r.mult+=(.72-r.mult)*Math.min(1,dt*3);}else r.mult+=(1-r.mult)*Math.min(1,dt*.9);
    let v=base*r.speed*r.mult;
    // Blockiert durch einen Wagen direkt davor in derselben Spur
    for(const o of [P,...ais]){if(o===r)continue;const gap=total(o)-total(r);if(gap>0&&gap<150&&Math.abs(o.d-r.d)<.6){v=Math.min(v,base*o.speed*o.mult*.98);}}
    const ds=inCurve(r.p)?v*R/(R+r.d*LW):v;r.p+=ds*dt;if(r.p>=LAP){r.p-=LAP;r.lap++;}
    // Hindernisse und Lorbeer
    things.forEach(t=>{if(t.hit)return;const gap=(t.lap*LAP+t.p)-total(r);if(Math.abs(gap)<55&&Math.abs(LANES[t.lane]-r.d)<.55){if(t.kind==='lorbeer'){if(r===P){t.hit=true;laurel++;ctx.say('Lorbeer! ('+laurel+')',900);}}else{if(r===P){t.hit=true;r.mult=Math.min(r.mult,.55);{ctx.say(t.kind==='sand'?'Sandhaufen – kurz langsamer.':t.kind==='rille'?'Radspur – der Wagen holpert.':'Eine Amphore! Ausgewichen … fast.',1300);shake=.35;}}else if(!(r.bumped||(r.bumped=new Set())).has(t)){r.bumped.add(t);r.mult=Math.min(r.mult,.6);}}}});
    // Tore
    gates.forEach(gt=>{if(r.gates?.includes(gt))return;const gap=(gt.lap*LAP+gt.p)-total(r);if(gap<0&&gap>-120){r.gates=[...(r.gates||[]),gt];const inner=r.d<0;const right=inner===gt.correctInner;if(right)r.boost=3.2;else r.slow=2.6;
      if(r===P){gt.done=true;q.hidden=true;ctx.say(right?'Richtig – der kürzere Weg!':'Das war der Umweg. Richtig wäre: '+gt.a[0]+'.',2600);}}});}
   let shake=0;
   function aiThink(a,dt){a.next-=dt;const ahead=a.p+500;
    // In Kurven nach innen, sonst gelegentlich wechseln; Hindernissen meist ausweichen (nicht immer)
    const obst=things.find(t=>!t.hit&&t.kind!=='lorbeer'&&t.lane===a.lane&&(t.lap*LAP+t.p)-total(a)>0&&(t.lap*LAP+t.p)-total(a)<260);
    if(obst&&!a.dodged){a.dodged=true;if(Math.random()<.65)laneChange(a,a.lane>0&&Math.random()<.6?-1:1);}if(!obst)a.dodged=false;
    const gt=gates.find(x=>!(a.gates||[]).includes(x)&&(x.lap*LAP+x.p)-total(a)>0&&(x.lap*LAP+x.p)-total(a)<500);if(gt&&!a.gpick){a.gpick=true;const good=Math.random()<.6;const inner=good?gt.correctInner:!gt.correctInner;a.lane=inner?(Math.random()<.5?0:1):(Math.random()<.5?2:3);}if(!gt)a.gpick=false;
    if(a.next<=0){a.next=1.5+Math.random()*2.5;if(inCurve(ahead)&&Math.random()<.7)laneChange(a,-1);else if(Math.random()<.35)laneChange(a,Math.random()<.5?-1:1);}}
   function update(dt,t){if(finished){P.mult*=Math.pow(.4,dt);move(P,dt,300);ais.forEach(a=>{if(!a.done)move(a,dt,300);});return;}
    if(countdown>0){countdown-=dt;if(countdown<=0)ctx.say('Los!',900);return;}
    const base=320;move(P,dt,base);ais.forEach(a=>{aiThink(a,dt);move(a,dt,base);});P.time+=dt;
    [P,...ais].forEach(r=>{if(r.lap>=LAPS&&!r.done){r.done=true;r.time=P.time;}});
    if(total(P)>nextSpawn){spawnAhead();nextSpawn=total(P)+380+Math.random()*420;}
    things=things.filter(t=>(t.lap*LAP+t.p)-total(P)>-600);
    // Frage einblenden, wenn ein Tor naht
    const gt=gates.find(x=>!x.done);if(gt){const gap=(gt.lap*LAP+gt.p)-total(P);if(gap<2400&&gap>0&&!gt.shown){gt.shown=true;q.hidden=false;const inner=gt.correctInner?gt.a[0]:gt.a[1],outer=gt.correctInner?gt.a[1]:gt.a[0];q.innerHTML=`<p>${gt.q}</p><div class="circus-q-opts"><span>◀ innen: <b>${inner}</b></span><span>außen: <b>${outer}</b> ▶</span></div>`;}}
    ctx.setTask(`Runde ${Math.min(LAPS,P.lap+1)} von ${LAPS} · Platz ${1+ais.filter(a=>total(a)>total(P)).length}`);
    if(P.lap>=LAPS){finished=true;q.hidden=true;const place=1+ais.filter(a=>a.done&&a.time<P.time||!a.done&&total(a)>total(P)).length;results={place};ctx.after(1800,()=>win(place));}
    // Staub
    [P,...ais].forEach(r=>{if(Math.random()<dt*14){const w=pos(r.p-60,r.d);dust.push({x:w.x+(Math.random()-.5)*30,y:w.y+(Math.random()-.5)*30,t:0,s:8+Math.random()*10});}});
    dust.forEach(d=>d.t+=dt);dust=dust.filter(d=>d.t<1.2);shake=Math.max(0,shake-dt);
   }
   function win(place){const lines=[`Lorbeer gesammelt: ${laurel}`];if(place>1)lines.unshift(`Ziel erreicht – Platz ${place} von 4`);
    ctx.win({title:'',lines,html:`<div class="schild-banner circus-banner"><span>${place===1?'VICTOR!':'BENE CUCURRISTI!'}</span></div>${place===1?'<p class="schild-sub">Du hast das Rennen gewonnen!</p>':'<p class="schild-sub">„Gut gelaufen!“ – Beim nächsten Mal vielleicht der Sieg.</p>'}<p class="muted" style="text-align:center">Im antiken Circus fuhren die Gespanne sieben Runden. Die Zuschauer hielten zu den Farben Grün, Blau, Rot oder Weiß.</p>`,backLabel:'Zurück zur Stadt'});}

   /* Zeichnen */
   function makePatterns(){pats={sand:pattern(g,(o,s)=>{o.fillStyle='#d8bd87';o.fillRect(0,0,s,s);for(let k=0;k<700;k++){o.fillStyle=['#c9a86b','#e6d0a0','#bfa070','#f0dcb0'][k%4];o.globalAlpha=.35;o.fillRect(Math.random()*s,Math.random()*s,1+Math.random()*2.5,1+Math.random()*2);}o.globalAlpha=1;},256),
    crowd:pattern(g,(o,s)=>{o.fillStyle='#8a7658';o.fillRect(0,0,s,s);for(let r=0;r<8;r++){o.fillStyle='#6f5e44';o.fillRect(0,r*16+12,s,4);for(let k=0;k<11;k++){const x=k*11.6+(r%2)*5+Math.random()*3,y=r*16+6;o.fillStyle=['#a8432a','#efe2c4','#3a5f8a','#3f7a4a','#c98a3e','#6b4a2a','#d9c49a'][Math.floor(Math.random()*7)];o.beginPath();o.arc(x,y+2,4,0,7);o.fill();o.fillStyle=['#c89a6e','#a8784e','#8a5a3a','#d9b08a'][Math.floor(Math.random()*4)];o.beginPath();o.arc(x,y-3,2.6,0,7);o.fill();}}},128)};}
   function ovalPath(r){g.beginPath();g.moveTo(-LS/2,r);g.lineTo(LS/2,r);g.arc(LS/2,0,r,Math.PI/2,-Math.PI/2,true);g.lineTo(-LS/2,-r);g.arc(-LS/2,0,r,-Math.PI/2,Math.PI/2,true);g.closePath();}
   function chariot(r,t){const w=pos(r.p,r.d);const col=COLORS[r.color][0];g.save();g.translate(w.x,w.y);g.rotate(w.h);g.scale(1.3,1.3);
    const gallop=Math.sin(t*14+r.swayT)*4;
    g.fillStyle='#00000030';g.beginPath();g.ellipse(18,6,90,34,0,0,7);g.fill();
    // zwei Pferde
    [-15,15].forEach((oy,i)=>{g.fillStyle=i?'#7a4a2a':'#5a3520';g.beginPath();g.ellipse(58+(i?gallop:-gallop)*.4,oy,34,11,0,0,7);g.fill();g.beginPath();g.ellipse(92+(i?gallop:-gallop)*.4,oy,12,7,0,0,7);g.fill();g.strokeStyle='#2a1a10';g.lineWidth=3;g.beginPath();g.moveTo(40,oy-9);g.lineTo(34+gallop,oy-15);g.moveTo(76,oy+9);g.lineTo(82-gallop,oy+15);g.stroke();g.fillStyle='#2a1a10';g.beginPath();g.moveTo(84,oy-4);g.quadraticCurveTo(70,oy,50,oy-2);g.lineTo(84,oy-6);g.fill();});
    g.strokeStyle='#8a6a3e';g.lineWidth=3;g.beginPath();g.moveTo(10,0);g.lineTo(60,0);g.moveTo(60,-18);g.lineTo(60,18);g.stroke();
    // Wagenkasten und Räder
    g.fillStyle='#3b2a1c';g.fillRect(-14,-30,12,8);g.fillRect(-14,22,12,8);
    g.fillStyle=col;g.beginPath();g.moveTo(-12,-22);g.lineTo(6,-22);g.quadraticCurveTo(20,0,6,22);g.lineTo(-12,22);g.closePath();g.fill();g.strokeStyle='#d9a441';g.lineWidth=2.5;g.stroke();
    g.fillStyle='#c89a6e';g.beginPath();g.arc(-2,0,9,0,7);g.fill();g.fillStyle=col;g.beginPath();g.arc(-4,0,7,-1.9,1.9,true);g.fill();
    g.strokeStyle='#5a3a1c';g.lineWidth=1.5;g.beginPath();g.moveTo(0,-6);g.lineTo(60,-15);g.moveTo(0,6);g.lineTo(60,15);g.stroke();
    if(r===P){g.strokeStyle='rgba(247,220,147,.8)';g.lineWidth=3;g.beginPath();g.ellipse(18,0,98,40,0,0,7);g.stroke();}
    g.restore();}
   function thing(tn){const w=pos(tn.p,LANES[tn.lane]);g.save();g.translate(w.x,w.y);g.rotate(w.h);
    if(tn.kind==='lorbeer'){g.strokeStyle='#4a6a2a';g.lineWidth=3;g.beginPath();g.moveTo(-26,0);g.quadraticCurveTo(0,-8,26,0);g.stroke();for(let k=0;k<6;k++){const x=-20+k*8;g.fillStyle=k%2?'#5f8a3a':'#6f9a44';g.beginPath();g.ellipse(x,-7+(k%2)*14,8,4,(k%2?.6:-.6),0,7);g.fill();}const gl=(Math.sin(performance.now()/200)+1)/2;g.fillStyle=`rgba(255,240,180,${.25+.3*gl})`;g.beginPath();g.arc(0,0,30,0,7);g.fill();}
    else if(tn.kind==='sand'){g.fillStyle='#c9a86b';g.beginPath();g.ellipse(0,0,40,30,0,0,7);g.fill();g.fillStyle='#e0c690';g.beginPath();g.ellipse(-6,-6,24,16,0,0,7);g.fill();}
    else if(tn.kind==='rille'){g.strokeStyle='#8a6a3e';g.lineWidth=5;g.beginPath();g.moveTo(-45,-18);g.quadraticCurveTo(0,-4,45,-20);g.moveTo(-45,16);g.quadraticCurveTo(0,4,45,18);g.stroke();}
    else{g.rotate(tn.rot);g.fillStyle='#b5673a';g.beginPath();g.ellipse(0,0,26,14,0,0,7);g.fill();g.strokeStyle='#7a3a1a';g.lineWidth=2;g.stroke();g.fillStyle='#8a4a24';g.fillRect(22,-5,10,10);g.fillStyle='#b5673a';for(let k=0;k<3;k++){g.beginPath();g.moveTo(-40+k*12,18);g.lineTo(-32+k*12,24);g.lineTo(-36+k*12,28);g.fill();}}
    g.restore();}
   function gateDraw(gt){const lap=gt.lap;if(Math.abs((lap*LAP+gt.p)-total(P))>3000)return;const a=pos(gt.p,-2.1),b=pos(gt.p,2.1),m=pos(gt.p,0);
    g.save();g.translate(m.x,m.y);g.rotate(m.h);
    g.fillStyle='#b8a888';g.fillRect(-18,-2.2*LW,36,26);g.fillRect(-18,2.2*LW-26,36,26);g.fillRect(-18,-14,36,28);
    g.fillStyle='#8c2a1a';g.fillRect(-10,-2*LW,20,2*LW-14);g.fillStyle='#2d5a4b';g.fillRect(-10,14,20,2*LW-14);
    const inner=gt.correctInner?gt.a[0]:gt.a[1],outer=gt.correctInner?gt.a[1]:gt.a[0];
    g.save();g.rotate(Math.PI/2);g.fillStyle='#f7ecd2';g.font='600 22px Georgia,serif';g.textAlign='center';g.textBaseline='middle';g.fillText(inner,-LW,0);g.fillText(outer,LW,0);g.restore();
    g.restore();}
   function draw(t){if(!view.W)return;const W=view.W,H=view.H;if(!pats)makePatterns();
    const zoom=Math.max(.42,Math.min(W/1450,H/820));
    const w=pos(P.p,P.d-2.2);if(!cam){cam={x:w.x,y:w.y};camH=w.h;}cam.x+=(w.x-cam.x)*.25;cam.y+=(w.y-cam.y)*.25;let dh=w.h-camH;while(dh>Math.PI)dh-=2*Math.PI;while(dh<-Math.PI)dh+=2*Math.PI;camH+=dh*.18;
    g.save();g.fillStyle='#6f5e44';g.fillRect(0,0,W,H);
    g.translate(W/2+(shake?(Math.random()-.5)*6:0),H*.64);g.scale(zoom,zoom);g.rotate(-Math.PI/2-camH);g.translate(-cam.x,-cam.y);
    // Tribünen mit Publikum
    g.fillStyle=pats.crowd;ovalPath(R+2*LW+420);g.fill();
    g.fillStyle='#b8a888';ovalPath(R+2*LW+44);g.fill();
    g.fillStyle=pats.sand;ovalPath(R+2*LW+20);g.fill();
    // Banner an der Außenmauer (wehen leicht)
    for(let k=0;k<24;k++){const bp=pos(k*LAP/24,2.35);g.save();g.translate(bp.x,bp.y);g.rotate(bp.h);g.fillStyle=k%2?'#8c2a1a':'#2d5a4b';const sw=Math.sin(t*3+k)*4;g.beginPath();g.moveTo(-18,0);g.lineTo(18,0);g.lineTo(18+sw,34);g.lineTo(-18+sw,34);g.fill();g.fillStyle='#d9a441';g.fillRect(-18,0,36,4);g.restore();}
    // Spurlinien (geharkt)
    g.strokeStyle='rgba(150,120,80,.28)';g.lineWidth=3;g.setLineDash([40,30]);[-1,0,1].forEach(k=>{ovalPath(R+k*LW);g.stroke();});g.setLineDash([]);
    // Ziellinie
    const f1=pos(0,-2),f2=pos(0,2);g.strokeStyle='#f7f2e2';g.lineWidth=10;g.beginPath();g.moveTo(f1.x,f1.y);g.lineTo(f2.x,f2.y);g.stroke();
    // spina mit Obelisk, metae und Delfinen
    g.fillStyle='#9a8a6a';g.beginPath();g.roundRect?g.roundRect(-LS/2-40,-38,LS+80,76,30):g.rect(-LS/2-40,-38,LS+80,76);g.fill();g.fillStyle='#4a7a8a';g.fillRect(-LS/2+40,-20,LS-80,40);g.fillStyle='#b8a888';g.fillRect(-LS/2+40,-6,LS-80,12);
    [-1,1].forEach(s=>{for(let k=0;k<3;k++){g.fillStyle='#c9a45a';g.beginPath();g.arc(s*(LS/2+10),-24+k*24,13,0,7);g.fill();g.fillStyle='#8a5a1c';g.beginPath();g.arc(s*(LS/2+10),-24+k*24,6,0,7);g.fill();}});
    g.fillStyle='#00000040';g.save();g.translate(0,0);g.rotate(.5);g.fillRect(0,-11,150,22);g.restore();g.fillStyle='#c9b48a';g.fillRect(-22,-22,44,44);g.fillStyle='#e0cfa6';g.fillRect(-12,-12,24,24);
    for(let k=0;k<LAPS;k++){const x=-LS/2+140+k*60,down=k<P.lap;g.save();g.translate(x,0);g.rotate(down?.9:-.3);g.fillStyle='#b88a3a';g.beginPath();g.ellipse(0,0,20,8,0,0,7);g.fill();g.beginPath();g.moveTo(18,0);g.lineTo(28,-8);g.lineTo(28,8);g.fill();g.restore();}
    gates.forEach(gateDraw);
    things.forEach(tn=>{if(!tn.hit)thing(tn);});
    dust.forEach(d=>{g.fillStyle=`rgba(230,210,170,${.45*(1-d.t/1.2)})`;g.beginPath();g.arc(d.x,d.y,d.s*(1+d.t),0,7);g.fill();});
    [...ais,P].sort((a,b)=>total(a)-total(b)).forEach(r=>chariot(r,t));
    g.restore();
    if(countdown>0){g.fillStyle='rgba(20,14,8,.35)';g.fillRect(0,0,W,H);g.fillStyle='#f7ecd2';g.font=`600 ${Math.round(H*.16)}px Georgia,serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(countdown>2.2?'III':countdown>1.2?'II':'I',W/2,H*.4);}
   }
   ctx.loop({update,draw});
   ctx.stage.__debug={P:()=>P,ais:()=>ais,things:()=>things,gates:()=>gates,total,LANES,LAP,setLane:l=>P.lane=l,finished:()=>finished,laurel:()=>laurel,skip:n=>{P.lap+=n;ais.forEach(a=>a.lap+=n);}};
   reset();
   return {start(){reset();}};
  }
 });
})();
