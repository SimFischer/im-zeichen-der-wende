'use strict';
/* Bonusspiel 7: Über den Tiber! – Flussüberquerung in strikter Draufsicht.
   Rasterbewegung, klar vorhersehbar. Ins Wasser fallen = kurzer Platscher, zurück zum letzten Ufer.
   Spielt nur mit dem Ort am Tiber; keine Behauptung, dass so eine Überquerung Teil der Schlacht war. */
(()=>{
 if(!window.BonusGames)return;
 const COLS=11;
 const QUIPS=['„Sehr überzeugender Angriff.“','„Vielleicht doch die Brücke?“','„Der Tiber gehört offensichtlich Maxentius.“','„Das war … fast geplant.“'];
 // Zeilen von unten (Start-Ufer) nach oben (Ziel-Ufer). Wasserzeilen: Richtung, Tempo, Treibgut
 const CROSSINGS=[
  [{bank:true},{dir:1,sp:.9,items:[[0,3,'stamm'],[5,3,'stamm'],[10,2,'brett']]},{dir:-1,sp:.8,items:[[1,3,'floss'],[7,3,'floss']]},{dir:1,sp:1.1,items:[[0,4,'stamm'],[7,3,'stamm']]},{dir:-1,sp:.7,items:[[2,3,'stamm'],[8,3,'stamm']]},{dir:1,sp:1,items:[[3,3,'floss'],[9,2,'brett']]},{bank:true,goal:true}],
  [{bank:true},{dir:-1,sp:1.1,items:[[0,3,'stamm'],[6,2,'brett',1],[10,2,'stamm']]},{dir:1,sp:.9,items:[[2,3,'floss'],[8,2,'brett',1]]},{dir:-1,sp:1.3,items:[[1,3,'stamm'],[7,3,'stamm']]},{island:true},{dir:1,sp:1,items:[[0,2,'brett',1],[4,3,'stamm'],[10,2,'brett']]},{dir:-1,sp:1.2,items:[[3,3,'floss'],[9,3,'stamm']]},{bank:true,goal:true}],
  [{bank:true},{dir:1,sp:1.3,items:[[0,3,'stamm'],[6,3,'stamm']]},{dir:-1,sp:1,stop:true,items:[[2,4,'floss'],[9,2,'brett']]},{dir:1,sp:1.5,items:[[1,2,'brett',1],[5,3,'stamm'],[10,2,'stamm']]},{island:true},{dir:-1,sp:1.2,items:[[0,3,'stamm'],[6,2,'brett',1]]},{dir:1,sp:.8,stop:true,items:[[3,4,'floss'],[10,2,'brett']]},{dir:-1,sp:1.4,items:[[2,3,'stamm'],[8,3,'stamm']]},{bank:true,goal:true}]];
 const LOOP=COLS+5;

 window.BonusGames.register({
  id:'tiber',title:'Über den Tiber!',kicker:'Bonusspiel · Lager am Tiber, 312',scene:'camp',
  spot:[15,57,'Treibholz am Ufer'],
  intro:{text:'Ein Bote aus dem Lager soll ans andere Ufer. Auf dem Tiber treiben Stämme, Bretter und kleine Flöße. Spring von einem zum nächsten – immer ein Feld weit.',
   controls:['Kurz <b>wischen</b>: ein Feld nach oben, unten, links oder rechts. Oder die großen Pfeiltasten<span class="mg-keys"> bzw. Pfeiltasten/WASD</span>.','Auf Holz treibst du mit. Ins Wasser fallen ist nicht schlimm: Es geht am letzten Ufer weiter.','Drei kurze Überquerungen, die letzten mit Insel.'],start:'Ans Ufer'},
  setup(ctx){
   const view=ctx.canvas({maxDpr:2}),g=view.g;
   const pad=ctx.layer('bonus-pad','<button type="button" class="up" data-d="up" aria-label="Nach oben">▲</button><button type="button" class="left" data-d="left" aria-label="Nach links">◀</button><button type="button" class="right" data-d="right" aria-label="Nach rechts">▶</button><button type="button" class="down" data-d="down" aria-label="Nach unten">▼</button>');
   const quip=ctx.layer('tiber-quip','<span class="schild-face" aria-hidden="true"></span><p></p>');quip.hidden=true;
   let cross,rows,P,splash,safeRow,falls,flowT,won,drops,tip;
   function start(n){cross=n;rows=CROSSINGS[n].map(r=>r.bank||r.island?{...r}:{...r,off:0,items:r.items.map(([x,len,kind,tips])=>({x,len,kind,tips:!!tips,tip:0,sink:0}))});
    P={r:0,c:5,x:5,y:0,move:null,dir:'up'};safeRow=0;splash=null;ctx.setTask(`Überquerung ${n+1} von 3`);if(n>0)ctx.say(`Überquerung ${n+1} von 3${rows.some(r=>r.island)?' – mit Insel':''}`,1800);}
   function reset(){falls=0;flowT=0;won=false;drops=[];start(0);}
   const water=r=>!rows[r].bank&&!rows[r].island;
   const cell=()=>{const n=rows.length;const padW=(pad.offsetWidth||180)+28;return Math.floor(Math.max(34,Math.min(view.W/(COLS+.4),(view.H-8)/n,(view.W-padW)/COLS)));};
   function itemX(row,it){let x=(it.x+row.off)%LOOP;if(x<0)x+=LOOP;return x-2.5;} // Anzeige-Lage in Zellen
   function under(r,x){const row=rows[r];return row.items.find(it=>{if(it.sink>0)return false;const ix=itemX(row,it);const cx=x+.5;return cx>=ix-.2&&cx<=ix+it.len+.2||cx+LOOP>=ix-.2&&cx+LOOP<=ix+it.len+.2;});}
   /* Eingabe */
   function input(d){if(!ctx.running||ctx.paused||splash||P.move||won)return;const [dx,dy]={up:[0,1],down:[0,-1],left:[-1,0],right:[1,0]}[d];const nr=P.r+dy,nc=Math.round(P.x)+dx;
    if(nr<0||nr>=rows.length||nc<0||nc>=COLS){return;}P.dir=d;P.move={fr:P.r,fx:P.x,tr:nr,tx:water(nr)&&dy!==0?P.x+(dx):nc,t:0};if(dy===0&&water(P.r))P.move.tx=P.x+dx;}
   pad.querySelectorAll('button').forEach(b=>ctx.on(b,'pointerdown',e=>{e.preventDefault();input(b.dataset.d);}));
   let sw=null;
   ctx.on(view.canvas,'pointerdown',e=>{sw={x:e.clientX,y:e.clientY,id:e.pointerId,used:false};try{view.canvas.setPointerCapture(e.pointerId);}catch(_){}});
   ctx.on(view.canvas,'pointermove',e=>{if(!sw||sw.used||e.pointerId!==sw.id)return;const dx=e.clientX-sw.x,dy=e.clientY-sw.y;if(Math.hypot(dx,dy)<22)return;sw.used=true;input(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));});
   ctx.on(view.canvas,'pointerup',()=>{sw=null;});ctx.on(view.canvas,'pointercancel',()=>{sw=null;});
   const KM={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};
   ctx.on(window,'keydown',e=>{const d=KM[e.key];if(!d||!ctx.running)return;e.preventDefault();if(!e.repeat)input(d);});
   function fall(){if(splash)return;falls++;splash={t:0,x:P.x,r:P.r};for(let k=0;k<14;k++)drops.push({x:P.x+.5,y:P.r+.5,vx:(Math.random()-.5)*3,vy:(Math.random()-.5)*3,t:0});
    quip.querySelector('p').textContent='Legionär: '+QUIPS[falls%QUIPS.length];quip.hidden=false;clearTimeout(quip._t);quip._t=setTimeout(()=>{if(quip.isConnected)quip.hidden=true;},2600);}
   function update(dt,t){flowT+=dt;
    rows.forEach(row=>{if(row.bank||row.island)return;let f=1;if(row.stop){const ph=(t+row.dir)%5;f=ph<1.3?0:1;}row.f=f;row.off+=row.dir*row.sp*f*dt;
     row.items.forEach(it=>{if(it.sink>0){it.sink-=dt;if(it.sink<=0)it.tip=0;}});});
    drops.forEach(d=>{d.t+=dt;d.x+=d.vx*dt;d.y+=d.vy*dt;});drops=drops.filter(d=>d.t<.8);
    if(splash){splash.t+=dt;if(splash.t>.9){splash=null;P.r=safeRow;P.x=P.c=Math.max(0,Math.min(COLS-1,Math.round(P.x)));P.move=null;}return;}
    if(won)return;
    if(P.move){P.move.t+=dt/.16;const m=P.move;const e=Math.min(1,m.t);
     // während des Sprungs treibt das Ziel weiter
     if(water(m.tr))m.tx+=rows[m.tr].dir*rows[m.tr].sp*(rows[m.tr].f??1)*dt;
     P.x=m.fx+(m.tx-m.fx)*e;P.y=m.fr+(m.tr-m.fr)*e;
     if(e>=1){P.r=m.tr;P.x=water(P.r)?m.tx:Math.round(m.tx);P.move=null;P.y=P.r;
      if(!water(P.r)){safeRow=P.r;if(rows[P.r].goal){won=true;ctx.after(700,()=>{if(cross<2){start(cross+1);won=false;}else finish();});}}
      else if(!under(P.r,P.x))fall();}}
    else if(water(P.r)){const row=rows[P.r];P.x+=row.dir*row.sp*(row.f??1)*dt;const it=under(P.r,P.x);if(!it){fall();return;}
     if(P.x<-.45||P.x>COLS-.55){fall();return;}
     if(it.tips){it.tip+=dt;if(it.tip>1.25&&it.sink<=0){it.sink=1.6;ctx.say('Das Brett kippt!',1000);fall();}}}
    rows.forEach(row=>{if(row.items)row.items.forEach(it=>{if(it.tips&&!(water(P.r)&&rows[P.r]===row&&under(P.r,P.x)===it)&&it.sink<=0)it.tip=Math.max(0,it.tip-dt*.8);});});
   }
   function finish(){won=true;ctx.setTask('Am anderen Ufer.');ctx.win({title:'Geschafft.',html:'<p style="text-align:center">Für die eigentliche Geschichte ist allerdings die <b>Milvische Brücke</b> entscheidend.</p><p class="muted" style="text-align:center">Das Spiel spielt nur mit dem Ort am Tiber. Eine solche Überquerung war nicht Teil der Schlacht von 312.</p>',backLabel:'Zurück ins Lager'});}
   /* Zeichnen */
   function draw(t){if(!view.W||!rows)return;const W=view.W,H=view.H,n=rows.length,s=cell();const padW=(pad.offsetWidth||180)+20;const ox=Math.max(8,Math.min((W-COLS*s)/2,W-COLS*s-padW)),oy=(H-n*s)/2;const Y=r=>oy+(n-1-r)*s;
    g.fillStyle='#2e4a42';g.fillRect(0,0,W,H);
    rows.forEach((row,r)=>{const y=Y(r);
     if(row.bank||row.island){g.fillStyle=row.island?'#8a9a5a':'#b89a64';g.fillRect(0,y,W,s);g.fillStyle=row.island?'#6f8a4a':'#a8864e';for(let k=0;k<30;k++){const x=((k*97+r*31)%100)/100*W;g.fillRect(x,y+((k*13)%10)/10*s,3,2);}
      // Schilf und Steine
      for(let k=0;k<8;k++){const x=((k*137+r*53)%100)/100*W;g.strokeStyle='#5f7a3a';g.lineWidth=2;g.beginPath();g.moveTo(x,y+s*(row.goal?.95:.05));g.lineTo(x+4,y+s*(row.goal?.55:.45));g.stroke();}
      if(row.goal){const bx=W*.6,bw=W*.34;g.fillStyle='#8a7e68';g.fillRect(bx,y+s*.1,bw,s*.42);g.fillStyle='#6f6454';g.fillRect(bx,y+s*.1,bw,s*.08);g.fillStyle='#35606a';for(let k=0;k<4;k++){const ax=bx+bw*(k+.5)/4;g.beginPath();g.moveTo(ax-bw/10,y+s*.52);g.lineTo(ax-bw/10,y+s*.36);g.arc(ax,y+s*.36,bw/10,Math.PI,0);g.lineTo(ax+bw/10,y+s*.52);g.fill();}g.fillStyle='#f3e4c5';g.font=`600 ${Math.round(s*.22)}px Georgia,serif`;g.textAlign='center';g.fillText('Ziel-Ufer',W*.25,y+s*.62);}
      if(row.island){g.fillStyle='#8f887c';g.beginPath();g.ellipse(ox+s*2.5,y+s*.5,s*.3,s*.2,0,0,7);g.fill();g.fillStyle='#4f6a2a';g.beginPath();g.arc(ox+s*8.3,y+s*.45,s*.32,0,7);g.fill();}
      return;}
     const wg=g.createLinearGradient(0,y,0,y+s);wg.addColorStop(0,'#3f6f78');wg.addColorStop(1,'#335c64');g.fillStyle=wg;g.fillRect(0,y,W,s);
     g.strokeStyle='rgba(200,230,230,.25)';g.lineWidth=2;for(let k=0;k<6;k++){const x=((k*s*2.1+flowT*row.dir*row.sp*s*1.2)%(W+s*2)+W+s*2)%(W+s*2)-s;g.beginPath();g.moveTo(x,y+s*(.3+(k%3)*.2));g.quadraticCurveTo(x+s*.3,y+s*(.25+(k%3)*.2),x+s*.6,y+s*(.3+(k%3)*.2));g.stroke();}
     row.items.forEach(it=>{for(const shift of [0,-LOOP,LOOP]){const ix=itemX(row,it)+shift;if(ix>COLS+1||ix+it.len<-1)continue;const x=ox+ix*s,w=it.len*s;const sinkA=it.sink>0?Math.min(1,it.sink):0;const wob=it.tips&&it.tip>.4?Math.sin(t*30)*s*.03*it.tip:0;
      g.save();g.translate(0,wob);g.globalAlpha=it.sink>0?.35:1;
      if(it.kind==='stamm'){g.fillStyle='#7a5230';g.beginPath();g.roundRect?g.roundRect(x+2,y+s*.18,w-4,s*.64,s*.3):g.rect(x+2,y+s*.18,w-4,s*.64);g.fill();g.strokeStyle='#4a321c';g.lineWidth=2;g.stroke();g.strokeStyle='#9a7040';g.beginPath();g.moveTo(x+s*.3,y+s*.38);g.lineTo(x+w-s*.4,y+s*.36);g.moveTo(x+s*.5,y+s*.6);g.lineTo(x+w-s*.3,y+s*.62);g.stroke();g.fillStyle='#b08a5a';g.beginPath();g.ellipse(x+w-s*.12,y+s*.5,s*.1,s*.3,0,0,7);g.fill();}
      else if(it.kind==='brett'){g.fillStyle=it.tips?'#a8864e':'#9a7a4a';g.fillRect(x+3,y+s*.26,w-6,s*.48);g.strokeStyle='#5a3a1c';g.lineWidth=2;g.strokeRect(x+3,y+s*.26,w-6,s*.48);for(let k=1;k<it.len;k++){g.beginPath();g.moveTo(x+k*s,y+s*.26);g.lineTo(x+k*s,y+s*.74);g.stroke();}if(it.tips){g.fillStyle='#5a3a1c';g.font=`${Math.round(s*.2)}px Georgia`;g.textAlign='center';g.fillText('~',x+w/2,y+s*.56);}}
      else{g.fillStyle='#8a6a3e';for(let k=0;k<it.len*2;k++){g.fillRect(x+3+k*(w-6)/(it.len*2),y+s*.12,(w-6)/(it.len*2)-2,s*.76);}g.strokeStyle='#c9a86b';g.lineWidth=3;g.beginPath();g.moveTo(x+4,y+s*.3);g.lineTo(x+w-4,y+s*.3);g.moveTo(x+4,y+s*.7);g.lineTo(x+w-4,y+s*.7);g.stroke();if(row.stop&&row.f===0){g.fillStyle='#f3e4c5';g.font=`${Math.round(s*.2)}px Georgia`;g.textAlign='center';g.fillText('hält an',x+w/2,y-2);}}
      g.restore();}});});
    // Spielfeldgrenzen: außerhalb abgedunkelt
    g.fillStyle='rgba(18,28,26,.5)';g.fillRect(0,0,Math.max(0,ox),H);g.fillRect(ox+COLS*s,0,W-ox-COLS*s,H);g.strokeStyle='rgba(243,220,166,.35)';g.lineWidth=2;g.strokeRect(ox,oy,COLS*s,n*s);
    // Spielfigur (Draufsicht)
    if(!splash){const px=ox+(P.x+.5)*s,py=Y(P.y)+s*.5;const hop=P.move?Math.sin(Math.min(1,P.move.t)*Math.PI)*s*.12:0;const rot={up:0,down:Math.PI,left:-Math.PI/2,right:Math.PI/2}[P.dir];
     g.fillStyle='#00000040';g.beginPath();g.ellipse(px,py+s*.08,s*.28,s*.12,0,0,7);g.fill();g.save();g.translate(px,py-hop);g.rotate(rot);g.scale(1.45+hop/s,1.45+hop/s);
     g.fillStyle='#3a6a8a';g.beginPath();g.ellipse(0,s*.04,s*.24,s*.19,0,0,7);g.fill();g.fillStyle='#8a5a2e';g.fillRect(-s*.24,-s*.02,s*.16,s*.2);g.fillStyle='#c89a6e';g.beginPath();g.arc(0,-s*.06,s*.12,0,7);g.fill();g.fillStyle='#3a2616';g.beginPath();g.arc(0,-s*.02,s*.11,Math.PI*.1,Math.PI*.9,true);g.fill();g.restore();}
    drops.forEach(d=>{g.fillStyle=`rgba(210,235,245,${1-d.t/.8})`;g.beginPath();g.arc(ox+d.x*s,Y(d.y-.5)+s*.5,s*.07*(1+d.t),0,7);g.fill();});
    if(splash){const x=ox+(splash.x+.5)*s,y=Y(splash.r)+s*.5,e=splash.t/.9;g.strokeStyle=`rgba(230,245,250,${1-e})`;g.lineWidth=3;for(let k=0;k<3;k++){g.beginPath();g.ellipse(x,y,s*(.2+e*.6+k*.12),s*(.1+e*.3+k*.06),0,0,7);g.stroke();}g.fillStyle='#fff';g.font=`${Math.round(s*.5)}px sans-serif`;g.textAlign='center';g.globalAlpha=1-e;g.fillText('💦',x,y-s*.4);g.globalAlpha=1;}
   }
   ctx.loop({update,draw});
   ctx.stage.__debug={P:()=>P,rows:()=>rows,under,itemX:(r,it)=>itemX(rows[r],it),cross:()=>cross,input,falls:()=>falls,won:()=>won};
   reset();
   return {start(){reset();}};
  }
 });
})();
