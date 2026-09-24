'use strict';
/* Bonusspiel 8: Belade den Wagen! – Stapelpuzzle mit echten Gegenständen.
   Keine Reihen verschwinden: Es zählt, wie gut die Ladung liegt. Danach „Fahrprobe“:
   Schlecht gestützte oder zu hoch gestapelte Stücke kippen herunter. Wertung ohne Punkte. */
(()=>{
 if(!window.BonusGames)return;
 const GW=8,GH=7,MARK=5,SPAWNROWS=3,COUNT=14;
 // Grundformen (Zellen relativ, y nach oben) und Zeichnung im Grund-Rechteck
 const TYPES={
  amphore:{name:'Amphore',cells:[[0,0],[0,1]]},
  korb2:{name:'Korb mit zwei Amphoren',cells:[[0,0],[1,0],[0,1],[1,1]]},
  kiste:{name:'Holzkiste',cells:[[0,0],[1,0]]},
  kiste2:{name:'große Kiste',cells:[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]]},
  sack:{name:'Sack',cells:[[0,0]]},
  langkorb:{name:'länglicher Korb',cells:[[0,0],[1,0],[2,0]]},
  buendel:{name:'Bündel',cells:[[0,0],[1,0]]},
  fass:{name:'kleines Fass',cells:[[0,0]]},
  stuhl:{name:'Stuhl',cells:[[0,0],[1,0],[0,1]],rare:true},
  sandale:{name:'Sandale',cells:[[0,0]],rare:true},
  taube:{name:'Taube',cells:[[0,0]],rare:true}};
 const BAG=['amphore','korb2','kiste','kiste2','sack','langkorb','buendel','fass','amphore','kiste','langkorb','sack','buendel','korb2'];
 function rotCells(cells,r){let c=cells.map(([x,y])=>[x,y]);for(let k=0;k<r;k++)c=c.map(([x,y])=>[y,-x]);const mx=Math.min(...c.map(p=>p[0])),my=Math.min(...c.map(p=>p[1]));return c.map(([x,y])=>[x-mx,y-my]);}
 const bbox=cells=>({w:Math.max(...cells.map(p=>p[0]))+1,h:Math.max(...cells.map(p=>p[1]))+1});

 function art(g,type,w,h,t){ // Zeichnung in einem w×h Rechteck (0,0 oben links)
  g.save();const s=Math.min(w,h);
  switch(type){
   case 'amphore':{const cx=w/2;g.fillStyle='#b5673a';g.beginPath();g.moveTo(cx-s*.14,h*.04);g.lineTo(cx+s*.14,h*.04);g.quadraticCurveTo(cx+s*.16,h*.2,cx+s*.38,h*.3);g.quadraticCurveTo(cx+s*.46,h*.7,cx+s*.06,h*.96);g.lineTo(cx-s*.06,h*.96);g.quadraticCurveTo(cx-s*.46,h*.7,cx-s*.38,h*.3);g.quadraticCurveTo(cx-s*.16,h*.2,cx-s*.14,h*.04);g.fill();g.strokeStyle='#7a3a1a';g.lineWidth=1.5;g.stroke();g.strokeStyle='#8a4a24';g.lineWidth=s*.07;g.beginPath();g.moveTo(cx-s*.14,h*.1);g.quadraticCurveTo(cx-s*.36,h*.1,cx-s*.32,h*.28);g.moveTo(cx+s*.14,h*.1);g.quadraticCurveTo(cx+s*.36,h*.1,cx+s*.32,h*.28);g.stroke();g.strokeStyle='#e0b07a88';g.lineWidth=s*.05;g.beginPath();g.moveTo(cx-s*.3,h*.5);g.quadraticCurveTo(cx,h*.54,cx+s*.3,h*.5);g.stroke();break;}
   case 'korb2':{g.fillStyle='#b5673a';[w*.3,w*.7].forEach(x=>{g.beginPath();g.ellipse(x,h*.32,s*.18,s*.22,0,0,7);g.fill();g.fillRect(x-s*.06,h*.04,s*.12,h*.14);});g.fillStyle='#b08a4e';g.beginPath();g.moveTo(w*.04,h*.42);g.lineTo(w*.96,h*.42);g.lineTo(w*.9,h*.98);g.lineTo(w*.1,h*.98);g.closePath();g.fill();g.strokeStyle='#6b4a22';g.lineWidth=1.5;g.stroke();for(let k=1;k<5;k++){g.beginPath();g.moveTo(w*.06,h*(.42+k*.11));g.lineTo(w*.94,h*(.42+k*.11));g.stroke();}break;}
   case 'kiste':case 'kiste2':{g.fillStyle='#8a6a3e';g.fillRect(w*.03,h*.05,w*.94,h*.92);g.strokeStyle='#4a321c';g.lineWidth=2;g.strokeRect(w*.03,h*.05,w*.94,h*.92);g.beginPath();g.moveTo(w*.03,h*.05);g.lineTo(w*.97,h*.97);g.moveTo(w*.97,h*.05);g.lineTo(w*.03,h*.97);g.stroke();g.fillStyle='#6b4a2a';g.fillRect(w*.03,h*.05,w*.94,h*.1);g.fillRect(w*.03,h*.87,w*.94,h*.1);g.fillStyle='#b8b8b0';[[.08,.1],[.92,.1],[.08,.92],[.92,.92]].forEach(([a,b])=>{g.beginPath();g.arc(w*a,h*b,s*.04,0,7);g.fill();});break;}
   case 'sack':{g.fillStyle='#c9a86b';g.beginPath();g.moveTo(w*.2,h*.95);g.quadraticCurveTo(w*.02,h*.5,w*.3,h*.25);g.lineTo(w*.4,h*.1);g.lineTo(w*.6,h*.1);g.lineTo(w*.7,h*.25);g.quadraticCurveTo(w*.98,h*.5,w*.8,h*.95);g.closePath();g.fill();g.strokeStyle='#7a5a2c';g.lineWidth=1.5;g.stroke();g.beginPath();g.moveTo(w*.33,h*.24);g.lineTo(w*.67,h*.24);g.stroke();break;}
   case 'langkorb':{g.fillStyle='#b08a4e';g.beginPath();g.roundRect?g.roundRect(w*.02,h*.15,w*.96,h*.8,h*.3):g.rect(w*.02,h*.15,w*.96,h*.8);g.fill();g.strokeStyle='#6b4a22';g.lineWidth=1.5;g.stroke();for(let k=1;k<9;k++){g.beginPath();g.moveTo(w*k/9,h*.18);g.lineTo(w*k/9,h*.92);g.stroke();}g.fillStyle='#c98a3e';for(let k=0;k<5;k++){g.beginPath();g.arc(w*(.15+k*.18),h*.2,h*.14,Math.PI,0);g.fill();}break;}
   case 'buendel':{g.strokeStyle='#8a6a3e';g.lineWidth=h*.14;for(let k=0;k<5;k++){g.beginPath();g.moveTo(w*.04,h*(.18+k*.16));g.lineTo(w*.96,h*(.2+k*.15));g.stroke();}g.strokeStyle='#c9a86b';g.lineWidth=h*.1;g.beginPath();g.moveTo(w*.3,h*.08);g.lineTo(w*.3,h*.95);g.moveTo(w*.7,h*.08);g.lineTo(w*.7,h*.95);g.stroke();break;}
   case 'fass':{g.fillStyle='#7a5230';g.beginPath();g.ellipse(w/2,h/2,w*.4,h*.47,0,0,7);g.fill();g.strokeStyle='#3b2a1c';g.lineWidth=3;g.beginPath();g.moveTo(w*.14,h*.3);g.lineTo(w*.86,h*.3);g.moveTo(w*.14,h*.7);g.lineTo(w*.86,h*.7);g.stroke();break;}
   case 'stuhl':{g.strokeStyle='#6b4a2a';g.lineWidth=s*.12;g.beginPath();g.moveTo(w*.12,h*.05);g.lineTo(w*.12,h*.95);g.moveTo(w*.12,h*.55);g.lineTo(w*.9,h*.55);g.moveTo(w*.85,h*.55);g.lineTo(w*.85,h*.95);g.stroke();g.fillStyle='#a8432a';g.fillRect(w*.14,h*.47,w*.72,h*.08);break;}
   case 'sandale':{g.fillStyle='#8a5a2e';g.beginPath();g.ellipse(w/2,h*.6,w*.4,h*.2,0,0,7);g.fill();g.strokeStyle='#5a3a1c';g.lineWidth=2;g.beginPath();g.moveTo(w*.3,h*.45);g.lineTo(w*.5,h*.6);g.lineTo(w*.7,h*.45);g.stroke();break;}
   case 'taube':{g.fillStyle='#8a8f96';g.beginPath();g.ellipse(w/2,h*.6,w*.35,h*.22,0,0,7);g.fill();g.fillStyle='#6d737a';g.beginPath();g.arc(w*.8,h*.45,h*.13,0,7);g.fill();g.fillStyle='#a9aeb4';const f=Math.sin((t||0)*20)*.2;g.beginPath();g.moveTo(w*.4,h*.55);g.quadraticCurveTo(w*.3,h*(.1+f),w*.7,h*(.25+f));g.lineTo(w*.6,h*.55);g.fill();break;}
  }
  g.restore();}

 window.BonusGames.register({
  id:'wagen',title:'Belade den Wagen!',kicker:'Bonusspiel · Lager am Tiber, 312',scene:'camp',
  spot:[57,69,'Vorratsfässer'],
  intro:{text:'Der Versorgungswagen muss beladen werden. Nacheinander kommen Amphoren, Körbe, Kisten, Säcke und Bündel. Staple sie so, dass alles gut aufliegt – bis zur markierten Höhe. Danach macht der Wagen eine Fahrprobe.',
   controls:['<b>Links/rechts ziehen</b>: das Stück verschieben.','<b>Antippen</b>: drehen. <b>Nach unten wischen</b>: schneller absetzen.<span class="mg-keys"> (Pfeiltasten, ↑ drehen, Leertaste absetzen)</span>','Was über der Markierung liegt oder in der Luft hängt, kann bei der Fahrt herunterfallen.'],start:'Aufladen'},
  setup(ctx){
   const view=ctx.canvas({maxDpr:2}),g=view.g;
   let grid,items,cur,queue,stepT,phase,drive,spawned,fallT,fly,pigeonMsg;
   function reset(){grid=Array.from({length:GH+SPAWNROWS+2},()=>Array(GW).fill(null));items=[];cur=null;spawned=0;phase='play';drive=null;fly=[];
    queue=[...BAG].sort(()=>Math.random()-.5);// seltene, lustige Stücke einmischen
    const rare=['sandale','stuhl','taube'][Math.floor(Math.random()*3)];queue.splice(4+Math.floor(Math.random()*6),0,rare);if(Math.random()<.5)queue.splice(9,0,'taube');
    stepT=0;next();}
   const L=()=>{const W=view.W,H=view.H;const c=Math.floor(Math.min((H-20)/(GH+SPAWNROWS+2.2),W*.62/GW));const gx=W/2-GW*c/2,gy=H-c*2.2;return {c,gx,gy};}; // gy = Unterkante Ladefläche
   function fits(cells,px,py){return cells.every(([x,y])=>{const X=px+x,Y=py+y;return X>=0&&X<GW&&Y>=0&&(Y>=grid.length||!grid[Y][X]);});}
   function next(){if(spawned>=COUNT+queue.filter(q=>q==='taube').length&&false)return;
    const type=queue.shift();if(!type||items.length>=COUNT){startDrive();return;}
    if(type==='taube'){fly.push({t:0});ctx.say('Eine Taube! … und schon ist sie wieder weg.',1600);next();return;}
    const cells=rotCells(TYPES[type].cells,0),bb=bbox(cells);const px=Math.floor((GW-bb.w)/2),py=GH+1;
    if(!fits(cells,px,py)){startDrive();return;}
    cur={type,r:0,cells,px,py};spawned++;ctx.setTask(`Stück ${items.length+1} von ${COUNT}: ${TYPES[type].name}`);
    if(type==='stuhl')ctx.say('Ein Stuhl?! Na gut, der muss wohl auch mit.',1800);if(type==='sandale')ctx.say('Eine einzelne Sandale … wem gehört die?',1800);}
   function move(dx){if(!cur)return false;if(fits(cur.cells,cur.px+dx,cur.py)){cur.px+=dx;return true;}return false;}
   function rotate(){if(!cur)return;const r=(cur.r+1)%4,cells=rotCells(TYPES[cur.type].cells,r);for(const k of [0,-1,1,-2]){if(fits(cells,cur.px+k,cur.py)){cur.r=r;cur.cells=cells;cur.px+=k;return;}}}
   function lock(){const it={type:cur.type,r:cur.r,cells:cur.cells.map(([x,y])=>[cur.px+x,cur.py+y]),px:cur.px,py:cur.py,bb:bbox(cur.cells),id:items.length};it.cells.forEach(([x,y])=>{if(grid[y])grid[y][x]=it;});items.push(it);cur=null;
    if(it.cells.some(([,y])=>y>=MARK))ctx.say('Das liegt über der Markierung – vorsichtig!',1500);next();}
   function drop(){if(!cur)return;while(fits(cur.cells,cur.px,cur.py-1))cur.py--;lock();}
   /* Eingabe */
   let pt=null;
   ctx.on(view.canvas,'pointerdown',e=>{pt={x0:e.clientX,y0:e.clientY,t:performance.now(),moved:false,id:e.pointerId,col:null};try{view.canvas.setPointerCapture(e.pointerId);}catch(_){}});
   ctx.on(view.canvas,'pointermove',e=>{if(!pt||e.pointerId!==pt.id||phase!=='play'||ctx.paused)return;const dy=e.clientY-pt.y0,dx=e.clientX-pt.x0;
    if(dy>60&&Math.abs(dy)>Math.abs(dx)*1.4&&performance.now()-pt.t<450&&!pt.dropped){pt.dropped=true;pt.moved=true;drop();return;}
    if(Math.abs(dx)>10)pt.moved=true;if(!pt.moved||!cur)return;const {c,gx}=L();const r=view.canvas.getBoundingClientRect();const col=Math.floor((e.clientX-r.left-gx)/c);const bb=bbox(cur.cells);const target=Math.max(0,Math.min(GW-bb.w,col-Math.floor(bb.w/2)));
    let guard=10;while(cur.px!==target&&guard--){if(!move(Math.sign(target-cur.px)))break;}});
   ctx.on(view.canvas,'pointerup',e=>{if(pt&&!pt.moved&&performance.now()-pt.t<350&&phase==='play'&&!ctx.paused)rotate();pt=null;});
   ctx.on(view.canvas,'pointercancel',()=>{pt=null;});
   let soft=false;
   ctx.on(window,'keydown',e=>{if(!ctx.running||phase!=='play')return;const k=e.key;if(['ArrowLeft','a','A'].includes(k)){move(-1);e.preventDefault();}else if(['ArrowRight','d','D'].includes(k)){move(1);e.preventDefault();}else if(['ArrowUp','w','W'].includes(k)){if(!e.repeat)rotate();e.preventDefault();}else if(['ArrowDown','s','S'].includes(k)){soft=true;e.preventDefault();}else if(k===' '){if(!e.repeat)drop();e.preventDefault();}});
   ctx.on(window,'keyup',e=>{if(['ArrowDown','s','S'].includes(e.key))soft=false;});
   /* Fahrprobe */
   function startDrive(){if(phase!=='play')return;phase='drive';cur=null;ctx.setTask('Der Wagen fährt los …');ctx.say('Der Wagen fährt los …',2000);
    // Stabilität prüfen (Kaskade)
    const alive=new Set(items);const falls=[];let changed=true;
    const at=(x,y)=>{for(const it of alive)if(it.cells.some(([a,b])=>a===x&&b===y))return it;return null;};
    while(changed){changed=false;for(const it of [...alive].sort((a,b)=>Math.min(...a.cells.map(c=>c[1]))-Math.min(...b.cells.map(c=>c[1])))){
      const bottoms=it.cells.filter(([x,y])=>!it.cells.some(([a,b])=>a===x&&b===y-1));const sup=bottoms.filter(([x,y])=>y===0||(at(x,y-1)&&at(x,y-1)!==it)).length;const ratio=sup/bottoms.length;
      const above=it.cells.filter(([,y])=>y>=MARK).length;const fullyAbove=above===it.cells.length;
      it.ratio=ratio;
      if(ratio===0||ratio<.5||fullyAbove||(above>0&&ratio<1)){alive.delete(it);falls.push(it);changed=true;}}}
    items.forEach(it=>{it.falls=falls.includes(it);it.fallDelay=.9+Math.random()*1.4;it.fx=0;it.fy=0;it.frot=0;it.vx=-(1.5+Math.random()*2);it.vy=-2-Math.random()*2;});
    drive={t:0,x:0,ok:items.length-falls.length,total:items.length};}
   function update(dt,t){fly.forEach(f=>f.t+=dt);fly=fly.filter(f=>f.t<2);
    if(phase==='play'&&cur){stepT+=dt;const iv=soft?.05:.7;if(stepT>=iv){stepT=0;if(fits(cur.cells,cur.px,cur.py-1))cur.py--;else lock();}}
    if(phase==='drive'){drive.t+=dt;drive.x=Math.max(0,drive.t-1)*Math.min(1,Math.max(0,drive.t-1)*.6)*.9;
     items.forEach(it=>{if(!it.falls||drive.t<it.fallDelay)return;it.vy+=9*dt;it.fx+=it.vx*dt;it.fy+=it.vy*dt;it.frot+=it.vx*.8*dt;});
     if(drive.t>5.6&&phase==='drive'){phase='end';ctx.win({title:'Fahrprobe beendet.',lines:[`Ladung angekommen: ${drive.ok} von ${drive.total} Gegenständen`],html:`<div class="schild-comment"><span class="amph-face" aria-hidden="true"></span><p><b>Der Händler:</b> „Gut gestapelt. Hoffentlich bleibt das bis zur nächsten Straße so.“</p></div>`,backLabel:'Zurück ins Lager'});}}
   }
   /* Zeichnen */
   // art zeichnet im Rechteck (0,0)-(w,h); verschieben auf Mitte
   const artC=(type,w,h,t)=>{g.translate(-w/2,-h/2);art(g,type,w,h,t);g.translate(w/2,h/2);};
   function drawPiece(type,r,cells,px,py,gx,gy,c,alpha,t){const bb=bbox(cells),base=bbox(TYPES[type].cells);g.save();g.globalAlpha=alpha;g.translate(gx+px*c+bb.w*c/2,gy-py*c-bb.h*c/2);g.rotate(r*Math.PI/2);artC(type,base.w*c,base.h*c,t);g.restore();}
   function draw(t){if(!view.W)return;const W=view.W,H=view.H,{c,gx,gy}=L();
    // Hintergrund: Lagerweg in der Dämmerung
    const sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#3a4a66');sky.addColorStop(.6,'#8a6a5a');sky.addColorStop(1,'#b89a6a');g.fillStyle=sky;g.fillRect(0,0,W,H);
    const tent=(x,y,w,h,c1)=>{g.fillStyle=c1;g.beginPath();g.moveTo(x-w/2,y);g.lineTo(x,y-h);g.lineTo(x+w/2,y);g.fill();g.fillStyle='#2a1a10';g.beginPath();g.moveTo(x-w*.07,y);g.lineTo(x,y-h*.45);g.lineTo(x+w*.07,y);g.fill();};
    tent(W*.12,H*.62,W*.2,H*.2,'#8c3a22');tent(W*.88,H*.62,W*.2,H*.22,'#9a6034');tent(W*.72,H*.6,W*.14,H*.14,'#7a2a18');
    g.fillStyle='#8a7050';g.fillRect(0,H*.62,W,H*.38);g.fillStyle='#a8865a';g.fillRect(0,gy+c*1.5,W,H);
    const dx=drive?drive.x*W*.12+(phase==='drive'?Math.sin(t*25)*2:0):0,dy=drive&&phase==='drive'?Math.abs(Math.sin(t*9))*3:0;
    g.save();g.translate(dx,-dy);
    // Maultier
    const mx=gx+GW*c+c*.6,my=gy+c*.2;g.fillStyle='#6b4a2a';g.beginPath();g.ellipse(mx+c*1.2,my-c*.9,c*.95,c*.5,0,0,7);g.fill();g.beginPath();g.ellipse(mx+c*2.3,my-c*1.5,c*.35,c*.28,-.5,0,7);g.fill();g.fillRect(mx+c*1.9,my-c*1.6,c*.3,c*.6);g.strokeStyle='#4a321c';g.lineWidth=c*.16;const leg=phase==='drive'?Math.sin(t*10)*.3:0;[[.5,leg],[.8,-leg],[1.6,-leg],[1.9,leg]].forEach(([a,l])=>{g.beginPath();g.moveTo(mx+c*a,my-c*.6);g.lineTo(mx+c*a+Math.sin(l)*c*.3,my+c*.25);g.stroke();});g.fillStyle='#4a321c';g.beginPath();g.moveTo(mx+c*2.4,my-c*1.8);g.lineTo(mx+c*2.55,my-c*2.2);g.lineTo(mx+c*2.6,my-c*1.75);g.fill();
    g.strokeStyle='#5a3a1c';g.lineWidth=c*.12;g.beginPath();g.moveTo(gx+GW*c,gy-c*.2);g.lineTo(mx+c*.6,my-c*.8);g.stroke();
    // Wagen: Ladefläche, Bordwände, Räder
    g.fillStyle='#6b4a2a';g.fillRect(gx-c*.25,gy,GW*c+c*.5,c*.45);g.strokeStyle='#3b2a1c';g.lineWidth=2;g.strokeRect(gx-c*.25,gy,GW*c+c*.5,c*.45);
    g.fillStyle='#7a5230';g.fillRect(gx-c*.25,gy-c*1.2,c*.22,c*1.2);g.fillRect(gx+GW*c+c*.03,gy-c*1.2,c*.22,c*1.2);
    [gx+c*1.5,gx+GW*c-c*1.5].forEach(wx=>{const wr=c*1.05;g.fillStyle='#5a3a1c';g.beginPath();g.arc(wx,gy+c*.9,wr,0,7);g.fill();g.fillStyle='#8a6a3e';g.beginPath();g.arc(wx,gy+c*.9,wr*.8,0,7);g.fill();g.strokeStyle='#5a3a1c';g.lineWidth=c*.14;const rot=drive?drive.x*6:0;for(let k=0;k<6;k++){const a=rot+k*Math.PI/3;g.beginPath();g.moveTo(wx,gy+c*.9);g.lineTo(wx+Math.cos(a)*wr*.8,gy+c*.9+Math.sin(a)*wr*.8);g.stroke();}g.fillStyle='#3b2a1c';g.beginPath();g.arc(wx,gy+c*.9,c*.18,0,7);g.fill();});
    // Markierung der Höhe
    const my2=gy-MARK*c;g.strokeStyle='#f3dca6';g.lineWidth=2;g.setLineDash([8,6]);g.beginPath();g.moveTo(gx-c*.6,my2);g.lineTo(gx+GW*c+c*.6,my2);g.stroke();g.setLineDash([]);g.fillStyle='#f3dca6';g.font=`600 ${Math.round(Math.max(12,c*.32))}px Georgia,serif`;g.textAlign='right';g.fillText('Ladehöhe',gx-c*.7,my2+c*.12);
    if(phase==='play'){g.strokeStyle='rgba(243,220,166,.12)';g.lineWidth=1;for(let x=0;x<=GW;x++){g.beginPath();g.moveTo(gx+x*c,gy);g.lineTo(gx+x*c,gy-GH*c);g.stroke();}}
    // Ladung
    items.forEach(it=>{const wob=phase==='drive'&&!it.falls&&it.ratio<1?Math.sin(t*14+it.id)*.05:0;g.save();if(it.falls&&drive&&drive.t>=it.fallDelay){g.translate(it.fx*c,it.fy*c);const cx=gx+it.px*c+it.bb.w*c/2,cy=gy-it.py*c-it.bb.h*c/2;g.translate(cx,cy);g.rotate(it.frot);g.translate(-cx,-cy);}else if(wob||(it.falls&&phase==='drive')){const cx=gx+it.px*c+it.bb.w*c/2,cy=gy-it.py*c;g.translate(cx,cy);g.rotate(wob||Math.sin(t*20+it.id)*.08);g.translate(-cx,-cy);}
     drawPiece(it.type,it.r,it.cells.map(([x,y])=>[x-it.px,y-it.py]),it.px,it.py,gx,gy,c,1,t);g.restore();});
    g.restore();
    // aktuelles Stück mit Landevorschau
    if(cur&&phase==='play'){let gy2=cur.py;while(fits(cur.cells,cur.px,gy2-1))gy2--;g.save();g.fillStyle='rgba(243,220,166,.18)';cur.cells.forEach(([x,y])=>g.fillRect(gx+(cur.px+x)*c+2,gy-(gy2+y+1)*c+2,c-4,c-4));g.restore();
     drawPiece(cur.type,cur.r,cur.cells,cur.px,cur.py,gx,gy,c,1,t);}
    fly.forEach(f=>{const e=f.t/2;g.save();g.translate(gx+GW*c/2+e*W*.4,gy-(GH+1)*c-e*H*.5);g.scale(c/40,c/40);art(g,'taube',50,40,t);g.restore();});
   }
   ctx.loop({update,draw});
   ctx.stage.__debug={cur:()=>cur,items:()=>items,move,rotate,drop,fits,phase:()=>phase,drive:()=>drive,GW};
   reset();
   return {start(){reset();}};
  }
 });
})();
