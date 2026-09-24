'use strict';
/* Bonusspiel 2: Das geheime Zeichen – Finde die Symbole.
   Hidden-Object/Memory auf dem belebten Forum (Hintergrund: vorhandenes Forum-Gemälde,
   Passanten: vorhandene Stadtbewohner). Falsche Tipps kosten nichts. */
(()=>{
 if(!window.BonusGames)return;
 const IMG={bg:'assets/backgrounds/v3-forum.png',blur:'assets/minigames/forum-blur.jpg',people:'assets/minigames/leute.webp'};
 const SPR={soldat:[0,101,[.47,.3]],frau:[103,94,[.5,.3]],haendler:[199,132,[.28,.52]],frau2:[333,96,[.56,.2]],schreiber:[431,108,[.22,.5]],mann:[541,107,[.62,.19]],junge:[650,91,[.3,.47]],dame:[743,98,[.33,.22]]};
 const TARGETS=['Fisch','Anker','Taube','Chi-Rho'];
 const DECOY={Fisch:'Blatt',Anker:'Dreizack',Taube:'Adler','Chi-Rho':'Stern'};
 const ART={Fisch:'ein Fisch',Anker:'ein Anker',Taube:'eine Taube','Chi-Rho':'ein Chi-Rho',Blatt:'ein Blatt',Dreizack:'ein Dreizack',Adler:'ein Adler',Stern:'ein Stern'};
 // Stellen im Bild (Anteile der Bildbreite/-höhe) mit passender Machart
 const SLOTS=[[.467,.765,'carved'],[.608,.745,'carved'],[.06,.36,'graffito'],[.93,.7,'graffito'],[.35,.565,'graffito'],[.075,.64,'painted'],[.862,.69,'carved'],[.25,.885,'mosaic'],[.585,.885,'mosaic'],[.39,.345,'graffito'],[.63,.6,'graffito'],[.1,.53,'carved'],[.57,.79,'painted'],[.56,.47,'graffito'],[.955,.86,'graffito'],[.35,.7,'carved'],[.225,.59,'pendant']];
 const ROUNDS=[{n:3,show:4200,memo:false},{n:4,show:4200,memo:false},{n:4,show:2000,memo:true},{n:5,show:2200,memo:true}];

 function path(g,name,s){g.beginPath();
  switch(name){
   case 'Fisch':g.moveTo(-s*.5,0);g.quadraticCurveTo(-s*.05,-s*.42,s*.35,s*.14);g.moveTo(-s*.5,0);g.quadraticCurveTo(-s*.05,s*.42,s*.35,-s*.14);break;
   case 'Blatt':g.moveTo(-s*.45,0);g.quadraticCurveTo(0,-s*.36,s*.45,0);g.quadraticCurveTo(0,s*.36,-s*.45,0);g.moveTo(-s*.45,0);g.lineTo(s*.3,0);g.moveTo(-s*.45,0);g.lineTo(-s*.58,s*.1);break;
   case 'Anker':g.moveTo(0,-s*.42);g.lineTo(0,s*.4);g.moveTo(-s*.22,-s*.24);g.lineTo(s*.22,-s*.24);g.moveTo(-s*.36,s*.1);g.quadraticCurveTo(-s*.3,s*.44,0,s*.42);g.quadraticCurveTo(s*.3,s*.44,s*.36,s*.1);g.moveTo(s*.07,-s*.5);g.arc(0,-s*.5,s*.07,0,7);break;
   case 'Dreizack':g.moveTo(0,-s*.1);g.lineTo(0,s*.5);g.moveTo(-s*.3,-s*.45);g.quadraticCurveTo(-s*.3,-s*.1,0,-s*.1);g.quadraticCurveTo(s*.3,-s*.1,s*.3,-s*.45);g.moveTo(0,-s*.1);g.lineTo(0,-s*.5);break;
   case 'Taube':g.moveTo(-s*.45,s*.05);g.quadraticCurveTo(-s*.1,-s*.1,s*.15,-s*.05);g.quadraticCurveTo(s*.32,-s*.22,s*.44,-s*.12);g.lineTo(s*.3,-s*.02);g.quadraticCurveTo(s*.1,s*.25,-s*.2,s*.2);g.closePath();g.moveTo(-s*.05,-s*.03);g.quadraticCurveTo(0,-s*.4,-s*.28,-s*.38);g.moveTo(-s*.1,s*.3);g.lineTo(-s*.2,s*.45);break;
   case 'Adler':g.moveTo(0,-s*.12);g.quadraticCurveTo(-s*.3,-s*.5,-s*.5,-s*.18);g.moveTo(0,-s*.12);g.quadraticCurveTo(s*.3,-s*.5,s*.5,-s*.18);g.moveTo(0,-s*.25);g.lineTo(0,s*.3);g.moveTo(-s*.14,s*.44);g.lineTo(0,s*.3);g.lineTo(s*.14,s*.44);g.moveTo(s*.07,-s*.3);g.arc(0,-s*.3,s*.07,0,7);break;
   case 'Chi-Rho':g.moveTo(-s*.32,-s*.34);g.lineTo(s*.32,s*.34);g.moveTo(s*.32,-s*.34);g.lineTo(-s*.32,s*.34);g.moveTo(0,-s*.47);g.lineTo(0,s*.47);g.moveTo(s*.23,-s*.34);g.arc(s*.1,-s*.34,s*.13,0,Math.PI*1.5,true);break;
   case 'Stern':for(let k=0;k<4;k++){const a=k*Math.PI/4;g.moveTo(Math.cos(a)*s*.45,Math.sin(a)*s*.45);g.lineTo(-Math.cos(a)*s*.45,-Math.sin(a)*s*.45);}break;
  }}
 function symbol(g,name,x,y,s,style,rot=0){g.save();g.translate(x,y);g.rotate(rot);g.lineCap='round';g.lineJoin='round';
  if(style==='carved'){g.lineWidth=Math.max(1.4,s*.09);g.strokeStyle='rgba(236,204,150,.45)';g.translate(.8,.8);path(g,name,s);g.stroke();g.translate(-.8,-.8);g.strokeStyle='rgba(48,26,10,.78)';path(g,name,s);g.stroke();}
  else if(style==='graffito'){g.lineWidth=Math.max(1.1,s*.06);g.strokeStyle='rgba(70,52,34,.55)';g.translate(.7,.7);path(g,name,s);g.stroke();g.translate(-.7,-.7);g.strokeStyle='rgba(255,246,222,.72)';path(g,name,s);g.stroke();}
  else if(style==='painted'){g.lineWidth=Math.max(1.4,s*.1);g.strokeStyle='rgba(120,40,20,.78)';path(g,name,s);g.stroke();}
  else if(style==='mosaic'){g.fillStyle='rgba(222,206,170,.55)';g.fillRect(-s*.62,-s*.62,s*1.24,s*1.24);g.strokeStyle='rgba(120,90,55,.55)';g.lineWidth=Math.max(1,s*.05);g.setLineDash([s*.07,s*.04]);g.strokeRect(-s*.58,-s*.58,s*1.16,s*1.16);g.lineWidth=Math.max(1.8,s*.1);g.setLineDash([s*.075,s*.035]);g.lineCap='butt';g.strokeStyle='rgba(70,50,35,.8)';path(g,name,s*.92);g.stroke();g.setLineDash([]);}
  else if(style==='pendant'){const r=s*.46;const gr=g.createRadialGradient(-r*.3,-r*.3,1,0,0,r);gr.addColorStop(0,'#f2d38c');gr.addColorStop(1,'#9c6a2a');g.fillStyle=gr;g.beginPath();g.arc(0,0,r,0,7);g.fill();g.strokeStyle='#5a3a16';g.lineWidth=1;g.stroke();g.lineWidth=Math.max(1.2,s*.07);g.strokeStyle='rgba(60,36,12,.9)';path(g,name,s*.62);g.stroke();}
  else if(style==='card'){g.lineWidth=Math.max(2,s*.08);g.strokeStyle='#5a2a14';path(g,name,s);g.stroke();}
  else if(style==='gold'){g.lineWidth=Math.max(2,s*.1);g.strokeStyle='#8a5a1c';path(g,name,s);g.stroke();}
  g.restore();}
 function load(src){return new Promise(res=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>res(null);i.src=src;});}
 const shuffle=(a,R=Math.random)=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

 window.BonusGames.register({
  id:'zeichen',title:'Das geheime Zeichen',kicker:'Bonusspiel · Auf dem Forum',scene:'house',
  spot:[69,39,'Kritzeleien am Pfeiler'],
  intro:{text:'Auf dem Forum sind Zeichen versteckt – eingeritzt in Holz, gemalt, als Kritzelei an einer Mauer, im Mosaik oder auf einem Anhänger. Präge dir die Vorlagen ein und finde sie im Gewimmel wieder.',
   controls:['Zu Beginn jeder Runde siehst du die gesuchten Zeichen einige Sekunden lang.','Dann <b>tippe</b> im Bild auf die Stellen, an denen du sie entdeckst.','Vorsicht: Manche Formen sehen nur ähnlich aus. Falsche Tipps kosten nichts.','Ab Runde 3 musst du dir die Zeichen merken.'],start:'Aufs Forum'},
  setup(ctx){
   const view=ctx.canvas({maxDpr:2}),g=view.g;const imgs={};let ready=false;
   Promise.all([load(IMG.bg),load(IMG.blur),load(IMG.people)]).then(([bg,blur,people])=>{imgs.bg=bg;imgs.blur=blur;imgs.people=people;ready=true;prepare();});
   let tf={sc:1,ox:0,oy:0},bgc=null;
   let round=-1,phase='idle',targets=[],decoys=[],found=0,phaseT=0,fx=[],walkers=[],crosser=null,crossT=4,pigeons=[],done=false,foundTypes=[];
   const iw=1536,ih=1024;
   const P=(u,v)=>({x:tf.ox+u*iw*tf.sc,y:tf.oy+v*ih*tf.sc});
   const symSize=()=>Math.max(22,iw*tf.sc*.026);
   function fit(){const W=view.W,H=view.H;const cover=Math.max(W/iw,H/ih),need=Math.min(H/(ih*.66),W/(iw*.95));const sc=Math.min(cover,need);
    let ox=W/2-iw*sc*.5,oy=H/2-ih*sc*.615;if(iw*sc>=W)ox=Math.min(0,Math.max(W-iw*sc,ox));if(ih*sc>=H)oy=Math.min(0,Math.max(H-ih*sc,oy));tf={sc,ox,oy};}
   view.resize=()=>{fit();prepare();};
   /* Hintergrund + feste Zeichen dieser Runde vorzeichnen */
   function prepare(){if(!ready||!view.W)return;fit();bgc=document.createElement('canvas');bgc.width=Math.round(view.W*view.dpr);bgc.height=Math.round(view.H*view.dpr);const o=bgc.getContext('2d');o.scale(view.dpr,view.dpr);
    if(imgs.blur)o.drawImage(imgs.blur,-20,-20,view.W+40,view.H+40);else{o.fillStyle='#c9b48a';o.fillRect(0,0,view.W,view.H);}
    if(imgs.bg)o.drawImage(imgs.bg,tf.ox,tf.oy,iw*tf.sc,ih*tf.sc);
    const s=symSize();[...targets,...decoys].forEach(it=>{if(it.slot==null||it.found)return;const [u,v,st]=SLOTS[it.slot];const p=P(u,v);symbol(o,it.name,p.x,p.y,s*(st==='mosaic'?.85:1),st,it.rot);});}
   /* Passanten, Tauben, Stoff */
   function initLife(){const R=Math.random;
    walkers=[{spr:'frau2',u:.4,v:.555,h:.13,dir:1,speed:.018,min:.35,max:.58,pause:0},{spr:'schreiber',u:.54,v:.55,h:.125,dir:-1,speed:.014,min:.36,max:.6,pause:0}];
    walkers.forEach(w=>{w.bob=R()*6;});
    crosser=null;crossT=3;
    pigeons=Array.from({length:5},(_,i)=>({u:.2+R()*.6,v:.8+R()*.12,tu:0,tv:0,st:'peck',t:R()*3,fly:0,flip:R()<.5}));}
   function drawSprite(name,x,feetY,h,flip,bob=0){const im=imgs.people;if(!im)return null;const [sx,sw]=SPR[name];const w=h*sw/300;g.save();g.translate(x,feetY);if(flip)g.scale(-1,1);g.drawImage(im,sx,0,sw,300,-w/2,-h+bob,w,h);g.restore();return {x:x-w/2,y:feetY-h+bob,w,h};}
   function pendantPos(w){const p=P(w.u,w.v),h=w.h*ih*tf.sc,[,sw,[px,py]]=SPR[w.spr];const wpx=h*sw/300;const bob=w.pause>0?0:Math.sin(w.bob*2)*h*.012;return {x:p.x+(w.dir<0?-1:1)*(px-.5)*wpx,y:p.y-h+bob+py*h};}
   function pigeon(x,y,s,flip,st,t){g.save();g.translate(x,y);if(flip)g.scale(-1,1);
    if(st==='fly'){const f=Math.sin(t*28)*.8;g.fillStyle='#8a8f96';g.beginPath();g.ellipse(0,0,s*.5,s*.22,0,0,7);g.fill();g.fillStyle='#a9aeb4';g.beginPath();g.moveTo(-s*.1,0);g.quadraticCurveTo(-s*.2,-s*(.2+f*.6),s*.25,-s*(.1+f*.7));g.lineTo(s*.2,0);g.fill();g.fillStyle='#6d737a';g.beginPath();g.arc(s*.45,-s*.1,s*.16,0,7);g.fill();}
    else{const peck=st==='peck'?Math.max(0,Math.sin(t*6))*s*.18:0;g.fillStyle='#00000030';g.beginPath();g.ellipse(0,s*.26,s*.4,s*.08,0,0,7);g.fill();g.fillStyle='#8a8f96';g.beginPath();g.ellipse(0,0,s*.45,s*.26,-.1,0,7);g.fill();g.fillStyle='#a9aeb4';g.beginPath();g.ellipse(-s*.05,-s*.05,s*.3,s*.14,-.2,0,7);g.fill();
     g.fillStyle='#5f8a7a';g.beginPath();g.arc(s*.34,-s*.16+peck,s*.13,0,7);g.fill();g.fillStyle='#6d737a';g.beginPath();g.arc(s*.4,-s*.24+peck,s*.14,0,7);g.fill();g.fillStyle='#d9a441';g.beginPath();g.moveTo(s*.52,-s*.24+peck);g.lineTo(s*.64,-s*.2+peck);g.lineTo(s*.52,-s*.18+peck);g.fill();
     g.strokeStyle='#c46a5a';g.lineWidth=1.2;g.beginPath();g.moveTo(-s*.05,s*.2);g.lineTo(-s*.05,s*.3);g.moveTo(s*.08,s*.2);g.lineTo(s*.08,s*.3);g.stroke();}
    g.restore();}
   function cloth(t){const a=P(.005,.405),b=P(.165,.405),h=ih*tf.sc*.05;const n=6;for(let k=0;k<n;k++){const x0=a.x+(b.x-a.x)*k/n,x1=a.x+(b.x-a.x)*(k+1)/n;const sw=Math.sin(t*2.2+k*.9)*h*.18;g.fillStyle=k%2?'#efe2c4':'#a8432a';g.beginPath();g.moveTo(x0,a.y);g.lineTo(x1,a.y);g.quadraticCurveTo(x1+sw*.5,a.y+h*.6,x1+sw,a.y+h);g.lineTo(x0+sw,a.y+h*.92);g.quadraticCurveTo(x0+sw*.5,a.y+h*.5,x0,a.y);g.fill();}}

   /* Runden */
   const bar=ctx.layer('zeichen-bar');const cards=ctx.layer('zeichen-cards');cards.hidden=true;
   const again=ctx.layer('zeichen-again','<button type="button">Vorlage noch einmal ansehen</button>');again.hidden=true;
   again.querySelector('button').onclick=()=>{if(phase==='search'&&!ROUNDS[round].memo)showCards(1800,true);};
   function mini(name,style,size=64){const c=document.createElement('canvas');c.width=size*2;c.height=size*2;c.style.width=c.style.height=size+'px';const o=c.getContext('2d');o.scale(2,2);symbol(o,name,size/2,size/2,size*.62,style);return c;}
   function showCards(ms,peek){const R=ROUNDS[round];cards.innerHTML=`<div class="zeichen-cardbox"><p>${peek?'Die gesuchten Zeichen':R.memo?'Merke dir diese Zeichen gut!':'Diese Zeichen suchst du'}</p><div class="zeichen-row"></div><div class="zeichen-sand"><i style="animation-duration:${ms}ms"></i></div></div>`;
    const row=cards.querySelector('.zeichen-row');targets.forEach(t=>{const d=document.createElement('span');d.className='zeichen-card';d.append(mini(t.name,'card'));row.append(d);});
    cards.hidden=false;phase=peek?'search':'show';ctx.after(ms,()=>{cards.hidden=true;if(!peek)beginSearch();});}
   function nextRound(){round++;if(round>=ROUNDS.length){finish();return;}const R=ROUNDS[round];
    const names=[];const pool=shuffle([...TARGETS]);for(let i=0;i<R.n;i++)names.push(pool[i%4]);
    const slots=shuffle([...SLOTS.keys()]);
    const onWalker=R.memo?1:0; // ab Runde 3 hängt ein Zeichen an einer laufenden Figur
    targets=names.map((name,i)=>({name,slot:i<onWalker?null:slots.pop(),walker:i<onWalker?i:null,found:false,rot:(Math.random()-.5)*.5}));
    const dnames=shuffle(names.map(n=>DECOY[n])).slice(0,Math.min(5,R.n+1));
    decoys=dnames.map((name,i)=>({name,slot:slots.pop(),decoy:true,rot:(Math.random()-.5)*.5}));
    if(R.memo)decoys.push({name:DECOY[names[0]],walker:1,decoy:true});
    found=0;prepare();renderBar();ctx.setTask(`Runde ${round+1} von ${ROUNDS.length}${R.memo?' · aus dem Gedächtnis':''}`);again.hidden=true;showCards(R.show,false);}
   function beginSearch(){phase='search';again.hidden=ROUNDS[round].memo;}
   function renderBar(){bar.innerHTML=targets.map((t,i)=>`<span class="zeichen-slot${t.found?' got':''}" data-i="${i}"></span>`).join('');
    bar.querySelectorAll('.zeichen-slot').forEach((el,i)=>{if(targets[i].found)el.append(mini(targets[i].name,'gold',34));});}
   function hitList(){const s=symSize(),r=Math.max(34,s*1.35);const out=[];
    [...targets,...decoys].forEach(it=>{if(it.found)return;let p;if(it.slot!=null){const [u,v]=SLOTS[it.slot];p=P(u,v);}else{const w=walkers[it.walker];if(!w)return;p=pendantPos(w);}out.push({it,p,r:it.slot!=null?r:r*1.1});});return out;}
   ctx.on(view.canvas,'pointerdown',e=>{const rect=view.canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;
    // Tauben flattern auf
    pigeons.forEach(pg=>{const p=P(pg.u,pg.v);if(pg.st!=='fly'&&Math.hypot(p.x-x,p.y-y)<40)startFly(pg);});
    if(phase!=='search'||done||ctx.paused)return;
    const hits=hitList().map(h=>({...h,d:Math.hypot(h.p.x-x,h.p.y-y)})).filter(h=>h.d<h.r).sort((a,b)=>(a.it.decoy?1:0)-(b.it.decoy?1:0)||a.d-b.d);
    const hit=hits[0];
    if(hit&&!hit.it.decoy){hit.it.found=true;found++;const idx=targets.indexOf(hit.it);fx.push({k:'ring',x:hit.p.x,y:hit.p.y,t:0},{k:'fly',x:hit.p.x,y:hit.p.y,t:0,name:hit.it.name,i:idx});prepare();
     ctx.after(750,()=>{renderBar();bar.children[idx]?.classList.add('pop');});
     if(found===targets.length){phase='between';ctx.after(900,()=>{ctx.say(round<ROUNDS.length-1?'Alle Zeichen dieser Runde gefunden!':'Geschafft!',1500);});ctx.after(2300,nextRound);}}
    else{fx.push({k:'dust',x,y,t:0,parts:Array.from({length:9},()=>({a:Math.random()*6.3,v:18+Math.random()*26}))});
     if(hit&&hit.it.decoy){const real=Object.keys(DECOY).find(k=>DECOY[k]===hit.it.name);ctx.say(`Das ist ${ART[hit.it.name]} – ähnlich, aber kein ${real==='Taube'?'Taubenbild':real==='Chi-Rho'?'Chi-Rho':real}.`,2200);}}});
   function startFly(pg){pg.st='fly';pg.fly=0;pg.fu=pg.u;pg.fv=pg.v;pg.tu=.1+Math.random()*.8;pg.tv=.8+Math.random()*.12;pg.flip=pg.tu<pg.u;}
   function finish(){done=true;phase='end';again.hidden=true;
    ctx.win({title:'Alle Zeichen entdeckt.',lines:[`${ROUNDS.reduce((a,r)=>a+r.n,0)} Zeichen in ${ROUNDS.length} Runden gefunden`],
     html:'<div class="bonus-history"><h4>Einordnung</h4><p>Einige christliche Symbole sind aus der Antike überliefert. Wie genau sie im Alltag verwendet wurden, lässt sich jedoch nicht immer sicher rekonstruieren.</p></div>',backLabel:'Zurück ins Wohnviertel'});}

   function update(dt,t){
    walkers.forEach(w=>{if(w.pause>0){w.pause-=dt;return;}w.u+=w.dir*w.speed*dt;w.bob+=dt*3.2;if(w.u>w.max){w.u=w.max;w.dir=-1;w.pause=.8+Math.random()*1.6;}if(w.u<w.min){w.u=w.min;w.dir=1;w.pause=.8+Math.random()*1.6;}});
    if(crosser){crosser.u+=crosser.dir*crosser.speed*dt;crosser.bob+=dt*3.4;if(crosser.u>1.25||crosser.u<-.25){crosser=null;crossT=6+Math.random()*5;}}
    else if(phase==='search'){crossT-=dt;if(crossT<=0){const names=['soldat','haendler','mann','dame','junge','frau'];const dir=Math.random()<.5?1:-1;crosser={spr:names[Math.floor(Math.random()*names.length)],u:dir>0?-.2:1.2,v:1.1,h:.46,dir,speed:.11,bob:0};}}
    pigeons.forEach(pg=>{pg.t+=dt;if(pg.st==='fly'){pg.fly+=dt/1.6;const e=Math.min(1,pg.fly);pg.u=pg.fu+(pg.tu-pg.fu)*e;pg.v=pg.fv+(pg.tv-pg.fv)*e-Math.sin(e*Math.PI)*.25;if(e>=1){pg.st='peck';pg.t=0;}}
     else{if(pg.st==='peck'&&pg.t>2+Math.random()*2){pg.st='walk';pg.t=0;pg.wd=Math.random()<.5?1:-1;pg.flip=pg.wd<0;}if(pg.st==='walk'){pg.u+=pg.wd*.02*dt;if(pg.t>1.5){pg.st='peck';pg.t=0;}if(pg.u<.05||pg.u>.95)pg.wd*=-1;}
      if(Math.random()<dt*.04)startFly(pg);}});
    // Passant läuft durch Tauben: sie fliegen auf
    if(crosser)pigeons.forEach(pg=>{if(pg.st!=='fly'&&Math.abs(pg.u-crosser.u)<.05)startFly(pg);});
    fx.forEach(f=>f.t+=dt);fx=fx.filter(f=>f.t<1.2);
   }
   function draw(t){if(!view.W)return;const W=view.W,H=view.H;
    if(!bgc){g.fillStyle='#c9b48a';g.fillRect(0,0,W,H);g.fillStyle='#5a3a16';g.font='20px Georgia';g.textAlign='center';g.fillText('Das Forum wird geladen …',W/2,H/2);return;}
    g.drawImage(bgc,0,0,W,H);
    cloth(t);
    const pgS=Math.max(16,ih*tf.sc*.042);pigeons.forEach(pg=>{if(pg.st==='fly')return;const p=P(pg.u,pg.v);pigeon(p.x,p.y,pgS,pg.flip,pg.st,pg.t);});
    const s=symSize();
    walkers.forEach((w,i)=>{const p=P(w.u,w.v),h=w.h*ih*tf.sc;const bob=w.pause>0?0:Math.sin(w.bob*2)*h*.012;drawSprite(w.spr,p.x,p.y,h,w.dir<0,bob);
     const it=[...targets,...decoys].find(q=>q.walker===i&&!q.found);if(it){const pp=pendantPos(w);symbol(g,it.name,pp.x,pp.y,Math.max(16,h*.11),'pendant');}});
    // Händler am Stand wiegt sich leicht
    {const p=P(.075,.705),h=.24*ih*tf.sc;g.save();g.translate(p.x,p.y);g.rotate(Math.sin(t*1.3)*.015);drawSprite('haendler',0,0,h,false,Math.sin(t*1.3)*h*.006);g.restore();}
    if(crosser){const p=P(crosser.u,crosser.v),h=crosser.h*ih*tf.sc;drawSprite(crosser.spr,p.x,p.y,h,crosser.dir<0,Math.sin(crosser.bob*2)*h*.01);}
    pigeons.forEach(pg=>{if(pg.st!=='fly')return;const p=P(pg.u,pg.v);pigeon(p.x,p.y,pgS,pg.flip,'fly',t);});
    // Effekte
    fx.forEach(f=>{if(f.k==='ring'){const e=f.t/1.1;g.strokeStyle=`rgba(230,184,90,${1-e})`;g.lineWidth=3;g.beginPath();g.arc(f.x,f.y,s*.6+e*s*1.2,0,7);g.stroke();const gl=g.createRadialGradient(f.x,f.y,0,f.x,f.y,s*1.4);gl.addColorStop(0,`rgba(255,236,170,${.55*(1-e)})`);gl.addColorStop(1,'rgba(255,236,170,0)');g.fillStyle=gl;g.fillRect(f.x-s*1.4,f.y-s*1.4,s*2.8,s*2.8);}
     else if(f.k==='fly'&&f.t<.75){const e=f.t/.75,ee=e*e*(3-2*e);const slot=bar.children[f.i];const br=slot?.getBoundingClientRect(),cr=view.canvas.getBoundingClientRect();const tx=br?br.left-cr.left+br.width/2:20,ty=br?br.top-cr.top+br.height/2:20;symbol(g,f.name,f.x+(tx-f.x)*ee,f.y+(ty-f.y)*ee-Math.sin(e*Math.PI)*40,s*(1-e*.3),'gold');}
     else if(f.k==='dust'){const e=f.t/1.2;f.parts.forEach(q=>{g.fillStyle=`rgba(214,196,160,${.7*(1-e)})`;g.beginPath();g.arc(f.x+Math.cos(q.a)*q.v*e,f.y+Math.sin(q.a)*q.v*e*.6-e*8,3+e*6,0,7);g.fill();});}});
   }
   ctx.loop({update,draw});
   ctx.stage.__debug={targets:()=>targets,decoys:()=>decoys,P,SLOTS,walkers:()=>walkers,pendantPos,phase:()=>phase};
   initLife();
   return {start(){round=-1;done=false;fx=[];initLife();nextRound();}};
  }
 });
})();
