'use strict';
/* Bonusspiel 1: Katakombenlauf – Bring das Licht ans Ziel.
   Draufsicht (leicht schräg) auf eine unterirdische Begräbnisstätte. Keine Verfolger, kein Game Over:
   Leere Lampe = sehr kleiner Lichtkreis, Ölschalen füllen wieder auf. */
(()=>{
 if(!window.BonusGames)return;
 const DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
 const OPP={up:'down',down:'up',left:'right',right:'left'};
 const SYMBOLS=['Fisch','Anker','Taube','Chi-Rho'];
 const FRAG_TEXT=['IN','PA','CE'];

 function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

 /* ---------- Labyrinth erzeugen und prüfen ---------- */
 function build(seed){
  const R=rng(seed),CW=15,CH=10,cols=CW*2+1,rows=CH*2+1;
  const g=Array.from({length:rows},()=>Array(cols).fill(1));
  const seen=new Set(),stack=[[0,0]];seen.add('0,0');g[1][1]=0;
  while(stack.length){const [cx,cy]=stack[stack.length-1];const n=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>[cx+dx,cy+dy,dx,dy]).filter(([x,y])=>x>=0&&y>=0&&x<CW&&y<CH&&!seen.has(x+','+y));
   if(!n.length){stack.pop();continue;}const [x,y,dx,dy]=n[Math.floor(R()*n.length)];seen.add(x+','+y);g[cy*2+1+dy][cx*2+1+dx]=0;g[y*2+1][x*2+1]=0;stack.push([x,y]);}
  // Schleifen: alternative Wege
  const inner=[];for(let r=1;r<rows-1;r++)for(let c=1;c<cols-1;c++)if(g[r][c]===1&&((r%2===1&&c%2===0)||(r%2===0&&c%2===1)))inner.push([c,r]);
  for(let i=inner.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[inner[i],inner[j]]=[inner[j],inner[i]];}
  inner.slice(0,Math.round(inner.length*.11)).forEach(([c,r])=>g[r][c]=0);
  const floor=(c,r)=>r>=0&&c>=0&&r<rows&&c<cols&&g[r][c]===0;
  function bfs(from,block){const d=Array.from({length:rows},()=>Array(cols).fill(-1));const q=[from];d[from[1]][from[0]]=0;
   for(let i=0;i<q.length;i++){const [c,r]=q[i];for(const [dx,dy] of Object.values(DIRS)){const x=c+dx,y=r+dy;if(floor(x,y)&&d[y][x]<0&&!(block&&block(x,y))){d[y][x]=d[r][c]+1;q.push([x,y]);}}}return d;}
  const floors=[];for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if(g[r][c]===0)floors.push([c,r]);
  // Start eher links in der Mitte, Ausgang am weitesten entfernt am Rand
  const start=[1+2*Math.floor(R()*3),1+2*(3+Math.floor(R()*4))];
  let d0=bfs(start);let exit=null,best=-1;
  for(const [c,r] of floors){const edge=c===1||r===1||c===cols-2||r===rows-2;if(edge&&c>cols/2&&d0[r][c]>best){best=d0[r][c];exit=[c,r];}}
  const [ec,er]=exit;const out=ec===cols-2?[cols-1,er]:er===1?[ec,0]:er===rows-2?[ec,rows-1]:[cols-1,er];
  g[out[1]][out[0]]=2;
  const neigh=(c,r)=>Object.values(DIRS).filter(([dx,dy])=>floor(c+dx,r+dy)).length;
  const deadEnds=floors.filter(([c,r])=>neigh(c,r)===1&&!(c===start[0]&&r===start[1])&&!(c===ec&&r===er));
  const reachAll=block=>{const d=bfs(start,block);return floors.every(([c,r])=>block?.(c,r)||d[r][c]>=0);};
  // Gitter: sperrt einen Seitenast, den ein Hebel öffnet (Umweg)
  let grate=null,region=null;
  const corridors=floors.filter(([c,r])=>neigh(c,r)===2&&d0[r][c]>6);
  for(let i=corridors.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[corridors[i],corridors[j]]=[corridors[j],corridors[i]];}
  for(const [c,r] of corridors){const d=bfs(start,(x,y)=>x===c&&y===r);const cut=floors.filter(([x,y])=>d[y][x]<0&&!(x===c&&y===r));
   if(cut.length>=6&&cut.length<=26&&!cut.some(([x,y])=>x===ec&&y===er)){grate=[c,r];region=cut;break;}}
  const inRegion=(c,r)=>region?.some(([x,y])=>x===c&&y===r);
  // Geröll: verschüttete Gänge, die Verbindung bleibt über Umwege erhalten
  const rubble=[];const blocked=(x,y)=>rubble.some(([a,b])=>a===x&&b===y)||(grate&&x===grate[0]&&y===grate[1]);
  for(const [c,r] of floors){if(rubble.length>=3)break;if(neigh(c,r)!==2||d0[r][c]<5||inRegion(c,r)||(grate&&c===grate[0]&&r===grate[1]))continue;if((c===ec&&r===er))continue;
   if(rubble.some(([a,b])=>Math.abs(a-c)+Math.abs(b-r)<8))continue;const test=(x,y)=>blocked(x,y)||(x===c&&y===r);
   const d=bfs(start,test);if(floors.every(([x,y])=>test(x,y)||d[y][x]>=0||inRegion(x,y)))rubble.push([c,r]);}
  rubble.forEach(([c,r])=>g[r][c]=3);if(grate)g[grate[1]][grate[0]]=4;
  const dReach=bfs(start,(x,y)=>g[y][x]===4);
  // Fragmente: eines hinter dem Gitter, zwei in weit entfernten Sackgassen
  const frags=[];
  if(region){let far=region[0],fd=-1;const dg=bfs(grate);region.forEach(([c,r])=>{if(dg[r][c]>fd){fd=dg[r][c];far=[c,r];}});frags.push(far);}
  const ends=deadEnds.filter(([c,r])=>!inRegion(c,r)&&dReach[r][c]>8).sort((a,b)=>dReach[b[1]][b[0]]-dReach[a[1]][a[0]]);
  for(const e of ends){if(frags.length>=3)break;if(frags.every(f=>Math.abs(f[0]-e[0])+Math.abs(f[1]-e[1])>9))frags.push(e);}
  for(const e of ends){if(frags.length>=3)break;if(!frags.includes(e))frags.push(e);}
  // Hebel in einer anderen erreichbaren Sackgasse
  let lever=null;if(grate){const cand=deadEnds.filter(([c,r])=>!inRegion(c,r)&&dReach[r][c]>4&&!frags.some(f=>f[0]===c&&f[1]===r));lever=cand.sort((a,b)=>Math.abs(dReach[a[1]][a[0]]-18)-Math.abs(dReach[b[1]][b[0]]-18))[0]||null;if(!lever){g[grate[1]][grate[0]]=0;grate=null;}}
  // Ölschalen möglichst gleichmäßig verteilt
  const bowls=[];const taken=[start,[ec,er],...frags,...(lever?[lever]:[])];
  for(let k=0;k<11;k++){const src=[...taken,...bowls];let bestT=null,bd=-1;for(const [c,r] of floors){if(g[r][c]!==0)continue;const md=Math.min(...src.map(([x,y])=>Math.abs(x-c)+Math.abs(y-r)));if(md>bd){bd=md;bestT=[c,r];}}if(bestT)bowls.push(bestT);}
  // Orientierungszeichen an Wänden nahe Kreuzungen
  const marks=[];const junctions=floors.filter(([c,r])=>neigh(c,r)>=3&&g[r][c]===0);
  for(let i=junctions.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[junctions[i],junctions[j]]=[junctions[j],junctions[i]];}
  for(const [c,r] of junctions){if(marks.length>=8)break;if(g[r-1]?.[c]===1&&marks.every(m=>Math.abs(m.c-c)+Math.abs(m.r-(r-1))>6))marks.push({c,r:r-1,sym:SYMBOLS[marks.length%4]});}
  return {g,cols,rows,start,exit:out,exitIn:[ec,er],frags,bowls,lever,grate,rubble,marks,floorCount:floors.length,seed};
 }

 /* ---------- Zeichnen: Symbole im Stil antiker Ritzungen/Malereien ---------- */
 function symbol(g,name,x,y,s,col){g.save();g.translate(x,y);g.strokeStyle=col;g.fillStyle=col;g.lineWidth=Math.max(1.2,s*.09);g.lineCap='round';g.lineJoin='round';g.beginPath();
  if(name==='Fisch'){g.moveTo(-s*.5,0);g.quadraticCurveTo(-s*.05,-s*.42,s*.35,s*.12);g.moveTo(-s*.5,0);g.quadraticCurveTo(-s*.05,s*.42,s*.35,-s*.12);g.stroke();}
  else if(name==='Anker'){g.moveTo(0,-s*.45);g.lineTo(0,s*.4);g.moveTo(-s*.22,-s*.25);g.lineTo(s*.22,-s*.25);g.moveTo(-s*.38,s*.12);g.quadraticCurveTo(-s*.3,s*.45,0,s*.42);g.quadraticCurveTo(s*.3,s*.45,s*.38,s*.12);g.stroke();g.beginPath();g.arc(0,-s*.5,s*.08,0,7);g.stroke();}
  else if(name==='Taube'){g.moveTo(-s*.45,s*.05);g.quadraticCurveTo(-s*.1,-s*.1,s*.15,-s*.05);g.quadraticCurveTo(s*.32,-s*.22,s*.42,-s*.12);g.lineTo(s*.3,-s*.02);g.quadraticCurveTo(s*.1,s*.25,-s*.2,s*.2);g.closePath();g.moveTo(-s*.05,-s*.03);g.quadraticCurveTo(0,-s*.4,-s*.28,-s*.38);g.stroke();g.beginPath();g.moveTo(-s*.1,s*.3);g.lineTo(-s*.2,s*.45);g.stroke();}
  else if(name==='Chi-Rho'){g.moveTo(-s*.32,-s*.35);g.lineTo(s*.32,s*.35);g.moveTo(s*.32,-s*.35);g.lineTo(-s*.32,s*.35);g.moveTo(0,-s*.48);g.lineTo(0,s*.48);g.stroke();g.beginPath();g.arc(s*.1,-s*.34,s*.13,Math.PI*.5,Math.PI*2.2);g.stroke();}
  g.restore();}

 function lampArt(g,x,y,s,oil,t){ // kleine Tonlampe mit sichtbarem Ölstand
  g.save();g.translate(x,y);
  g.fillStyle='#f3e4c5e6';g.strokeStyle='#8a6a3a';g.lineWidth=2;g.beginPath();g.ellipse(0,0,s*1.05,s*.72,0,0,7);g.fill();g.stroke();
  // Henkel und Tülle
  g.strokeStyle='#7a3f22';g.lineWidth=s*.09;g.beginPath();g.arc(-s*.62,-s*.02,s*.16,0,7);g.stroke();
  g.fillStyle='#a8582f';g.beginPath();g.moveTo(s*.2,-s*.14);g.quadraticCurveTo(s*.7,-s*.12,s*.78,-s*.03);g.quadraticCurveTo(s*.72,s*.12,s*.2,s*.14);g.fill();
  // Körper
  g.beginPath();g.ellipse(-s*.08,s*.02,s*.52,s*.28,0,0,7);g.fillStyle='#b5703f';g.fill();g.strokeStyle='#6b3419';g.lineWidth=1.5;g.stroke();
  // Aufgeschnittenes Fenster mit Öl
  g.save();g.beginPath();g.ellipse(-s*.1,s*.02,s*.34,s*.17,0,0,7);g.fillStyle='#3a2210';g.fill();g.clip();
  const lvl=s*.17-(s*.34)*Math.max(0,Math.min(1,oil));g.fillStyle='#d9a441';g.fillRect(-s*.5,s*.02+lvl,s,s);g.fillStyle='#f3cf73';g.fillRect(-s*.5,s*.02+lvl,s,Math.max(1,s*.03));g.restore();
  g.beginPath();g.ellipse(-s*.1,s*.02,s*.34,s*.17,0,0,7);g.strokeStyle='#4a2410';g.lineWidth=1.2;g.stroke();
  // Flamme
  const f=(.28+.72*Math.max(0,oil))*(1+.08*Math.sin(t*13)+.05*Math.sin(t*29));const fx=s*.8,fy=-s*.08;
  g.fillStyle=oil>0?'#f6b64a':'#b8642a';g.beginPath();g.moveTo(fx-s*.09*f,fy);g.quadraticCurveTo(fx,fy-s*.62*f,fx+s*.09*f,fy);g.quadraticCurveTo(fx,fy+s*.07,fx-s*.09*f,fy);g.fill();
  if(oil>0){g.fillStyle='#fff1b8';g.beginPath();g.moveTo(fx-s*.04*f,fy);g.quadraticCurveTo(fx,fy-s*.3*f,fx+s*.04*f,fy);g.fill();}
  g.restore();
 }

 function fragPath(g,k,x,y,w,h){ // drei Bruchstücke, die zusammen eine Tafel ergeben
  const P=[[[0,0],[.36,0],[.4,.35],[.33,.62],[.38,1],[0,1]],[[.36,0],[.7,0],[.64,.4],[.7,.7],[.66,1],[.38,1],[.33,.62],[.4,.35]],[[.7,0],[1,0],[1,1],[.66,1],[.7,.7],[.64,.4]]][k];
  g.beginPath();P.forEach(([px,py],i)=>{const X=x+px*w,Y=y+py*h;i?g.lineTo(X,Y):g.moveTo(X,Y);});g.closePath();}
 function drawFragment(g,k,x,y,w,h,alpha=1){g.save();g.globalAlpha=alpha;fragPath(g,k,x,y,w,h);g.fillStyle='#d8ccb0';g.fill();g.strokeStyle='#6d5a3c';g.lineWidth=1.5;g.stroke();
  g.fillStyle='#8c3a22';g.font=`600 ${Math.round(h*.5)}px Georgia,serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(FRAG_TEXT[k],x+w*[.18,.52,.84][k],y+h*.55);g.restore();}

 window.BonusGames.register({
  id:'katakomben',title:'Katakombenlauf',kicker:'Bonusspiel · Unter der Stadt',scene:'archive',
  spot:[34,53,'Alte Grabplatte'],
  when:state=>state.solved.includes('archive'), // im dunklen Archiv noch nicht sichtbar
  intro:{text:'Du erkundest eine unterirdische Begräbnisstätte. Finde den Weg zurück zum Ausgang. Deine Öllampe wird langsam schwächer – kleine Ölschalen in den Gängen füllen sie wieder auf.',
   controls:['<b>Wischen</b> nach oben, unten, links oder rechts: Die Figur geht los, bis sie auf eine Wand trifft.','Du kannst schon vor einer Abzweigung wischen – die Figur biegt dort ab.','Kurz <b>tippen</b> hält an. Alternativ die großen Pfeiltasten<span class="mg-keys"> oder Pfeiltasten/WASD</span>.','Drei Bruchstücke einer Inschrift sind versteckt. Sie sind freiwillig.'],start:'Hinabsteigen'},
  setup(ctx){
   const view=ctx.canvas({maxDpr:2}),g=view.g;
   const dark=document.createElement('canvas'),dg=dark.getContext('2d');
   let M,T=64,oc=null,odpr=1;
   const P={x:0,y:0,tx:0,ty:0,dir:null,queued:null,qT:0,moving:false,from:[0,0],to:[0,0],p:0,face:'right',step:0};
   let oil=1,cam={x:0,y:0},hold=null,visited=new Set(),frags=[],fly=[],bowlsUsed=new Map(),lever=false,grateOpen=0,finishing=0,done=false,seenMarks=new Set(),bumpT=0,motes=[];
   const SPEED=4.3,DRAIN=1/40;
   function reset(){M=build((Math.random()*1e9)|0);P.tx=M.start[0];P.ty=M.start[1];P.x=P.tx;P.y=P.ty;P.dir=null;P.queued=null;P.moving=false;oil=1;visited=new Set([P.tx+','+P.ty]);frags=[];fly=[];bowlsUsed=new Map();lever=false;grateOpen=0;finishing=0;done=false;seenMarks=new Set();
    motes=Array.from({length:34},()=>({x:P.x+(Math.random()-.5)*8,y:P.y+(Math.random()-.5)*8,vx:(Math.random()-.5)*.12,vy:(Math.random()-.5)*.08,a:Math.random()*6}));
    cam.x=(P.x+.5)*T;cam.y=(P.y+.5)*T;layout();ctx.setTask('Finde den Ausgang. Fragmente: 0/3');}
   function layout(){if(!view.W)return;T=Math.round(Math.max(38,Math.min(84,Math.min(view.W/14,view.H/9.4))));odpr=Math.min(1.5,view.dpr);dark.width=Math.round(view.W*view.dpr);dark.height=Math.round(view.H*view.dpr);dg.setTransform(view.dpr,0,0,view.dpr,0,0);if(M){renderStatic();cam.x=(P.x+.5)*T;cam.y=(P.y+.5)*T;}}
   view.resize=()=>{layout();};

   const tile=(c,r)=>M.g[r]?.[c]??1;
   const bowlUsed=i=>bowlsUsed.has(i)&&bowlsUsed.get(i)<45; // nach einer Weile füllt sich eine Schale wieder
   const passable=(c,r)=>{const t=tile(c,r);return t===0||t===2||(t===4&&grateOpen>=1);};

   /* Statische Ebene (Boden, Wände, Nischen, Zeichen) einmal vorzeichnen */
   function renderStatic(){
    const R=rng(M.seed^0x5bd1),W=M.cols*T,H=M.rows*T;oc=document.createElement('canvas');oc.width=Math.round(W*odpr);oc.height=Math.round(H*odpr);const o=oc.getContext('2d');o.scale(odpr,odpr);
    o.fillStyle='#34261b';o.fillRect(0,0,W,H);
    for(let r=0;r<M.rows;r++)for(let c=0;c<M.cols;c++){const t=M.g[r][c],x=c*T,y=r*T;
     if(t!==1){ // Boden aus festgetretenem Tuff
      const v=R()*14|0;o.fillStyle=`rgb(${118+v},${86+v},${56+v*.6})`;o.fillRect(x,y,T,T);
      if(R()<.25){o.fillStyle='#5a3d2426';o.beginPath();o.ellipse(x+R()*T,y+R()*T,T*(.12+R()*.15),T*(.06+R()*.08),R()*3,0,7);o.fill();}
      for(let k=0;k<7;k++){o.fillStyle=R()<.5?'#00000022':'#fff3d012';o.fillRect(x+R()*T,y+R()*T,1+R()*3,1+R()*2);}
      if(tile(c,r-1)===1){const gr=o.createLinearGradient(0,y,0,y+T*.45);gr.addColorStop(0,'#0000006b');gr.addColorStop(1,'#0000');o.fillStyle=gr;o.fillRect(x,y,T,T*.45);}
      if(tile(c-1,r)===1){const gr=o.createLinearGradient(x,0,x+T*.22,0);gr.addColorStop(0,'#00000045');gr.addColorStop(1,'#0000');o.fillStyle=gr;o.fillRect(x,y,T*.22,T);}
     }
     if(t===2){ // Ausgang: Stufen nach oben ins Licht
      for(let k=0;k<4;k++){o.fillStyle=`rgb(${150+k*18},${128+k*16},${96+k*14})`;const hor=M.exit[0]===M.cols-1||M.exit[0]===0;if(hor)o.fillRect(x+k*T/4,y+2,T/4-1,T-4);else o.fillRect(x+2,y+(M.exit[1]===0?(3-k):k)*T/4,T-4,T/4-1);}
     }
     if(t===3){ // Geröll
      for(let k=0;k<11;k++){const rx=x+T*.15+R()*T*.7,ry=y+T*.2+R()*T*.65,rr=T*(.07+R()*.12);o.fillStyle=['#6d604f','#857462','#5a4e40','#9a8a73'][k%4];o.beginPath();o.ellipse(rx,ry,rr,rr*.8,R()*3,0,7);o.fill();o.strokeStyle='#2a221a88';o.lineWidth=1;o.stroke();}
     }
    }
    // Wände: Oberseite (Sandstein/Tuff) und – wo Gang darunter – sichtbare Vorderseite mit Grabnischen
    for(let r=0;r<M.rows;r++)for(let c=0;c<M.cols;c++){if(M.g[r][c]!==1)continue;const x=c*T,y=r*T;const face=r<M.rows-1&&M.g[r+1][c]!==1&&M.g[r+1][c]!==undefined;const top=face?T*.42:T;
     const v=R()*8|0;o.fillStyle=`rgb(${52+v},${38+v},${27+v})`;o.fillRect(x,y,T,top);
     for(let k=0;k<6;k++){o.fillStyle=R()<.5?'#00000026':'#d9b07a0f';o.fillRect(x+R()*T,y+R()*top,1+R()*2,1+R()*2);}
     // Kante zum Gang hin etwas heller (Kalkputz)
     if(tile(c,r-1)!==1&&M.g[r-1]){o.fillStyle='#a07a4c55';o.fillRect(x,y,T,Math.max(2,T*.05));}
     if(tile(c-1,r)!==1){o.fillStyle='#a07a4c40';o.fillRect(x,y,Math.max(2,T*.04),top);}if(tile(c+1,r)!==1){o.fillStyle='#a07a4c40';o.fillRect(x+T-Math.max(2,T*.04),y,Math.max(2,T*.04),top);}
     if(face){const fy=y+top,fh=T-top;const fg=o.createLinearGradient(0,fy,0,fy+fh);fg.addColorStop(0,'#a57a4c');fg.addColorStop(1,'#7a5434');o.fillStyle=fg;o.fillRect(x,fy,T,fh);
      o.fillStyle='#e8c89a55';o.fillRect(x,fy,T,1.5);for(let k=0;k<4;k++){o.fillStyle='#4a2e1a33';o.fillRect(x+R()*T,fy+R()*fh,1+R()*3,1+R()*2);}
      const mark=M.marks.find(m=>m.c===c&&m.r===r);
      if(mark){ // verputzte Platte mit gemaltem Zeichen
       o.fillStyle='#cdbb92';o.fillRect(x+T*.14,fy+fh*.12,T*.72,fh*.74);o.strokeStyle='#7a6440';o.strokeRect(x+T*.14,fy+fh*.12,T*.72,fh*.74);symbol(o,mark.sym,x+T*.5,fy+fh*.5,fh*.62,'#8c3a22');}
      else if(R()<.55){ // Grabnische (loculus), teils mit Platte verschlossen
       const nx=x+T*.12,nw=T*.76,ny=fy+fh*.18,nh=fh*.58;o.fillStyle='#1d140d';o.beginPath();o.moveTo(nx,ny+nh);o.lineTo(nx,ny+nh*.35);o.quadraticCurveTo(nx+nw/2,ny-nh*.1,nx+nw,ny+nh*.35);o.lineTo(nx+nw,ny+nh);o.fill();
       if(R()<.6){o.fillStyle='#bfae88';o.fillRect(nx+2,ny+nh*.3,nw-4,nh*.7);o.strokeStyle='#6d5a3c';o.strokeRect(nx+2,ny+nh*.3,nw-4,nh*.7);o.strokeStyle='#8c3a2299';o.lineWidth=1;o.beginPath();for(let k=0;k<3;k++){const lx=nx+nw*(.18+R()*.2);o.moveTo(lx,ny+nh*(.5+k*.14));o.lineTo(lx+nw*(.25+R()*.3),ny+nh*(.5+k*.14));}o.stroke();}
      }
     }
    }
    // Hebel und Tafel am Start
    if(M.lever){const [c,r]=M.lever;o.fillStyle='#3b2a1c';o.fillRect(c*T+T*.38,r*T+T*.62,T*.24,T*.16);}
   }

   /* Eingaben */
   function input(d){if(done||finishing||!ctx.running||ctx.paused)return;
    if(P.moving&&d===OPP[P.dir]){[P.from,P.to]=[P.to,P.from];P.p=1-P.p;P.dir=d;P.face=d;P.queued=null;return;}
    if(!P.moving){if(!tryGo(d))bump(d);return;}
    P.queued=d;P.qT=1.3;}
   function bump(d){const [dx,dy]=DIRS[d],t=tile(P.tx+dx,P.ty+dy);if(bumpT>0)return;bumpT=1.4;
    if(t===3)ctx.say('Verschüttet. Hier geht es nicht weiter – suche einen anderen Weg.',2400);
    else if(t===4&&grateOpen<1)ctx.say('Ein Gitter versperrt den Gang. Irgendwo muss ein Hebel sein.',2600);}
   function tryGo(d){if(!d)return false;const [dx,dy]=DIRS[d];if(!passable(P.tx+dx,P.ty+dy))return false;P.dir=d;P.face=d;P.moving=true;P.from=[P.tx,P.ty];P.to=[P.tx+dx,P.ty+dy];P.p=0;return true;}
   function stopSoon(){P.queued=null;P.stop=true;}
   // Wischen auf dem Spielfeld
   let sw=null;
   ctx.on(view.canvas,'pointerdown',e=>{sw={x:e.clientX,y:e.clientY,t:performance.now(),moved:false,id:e.pointerId};try{view.canvas.setPointerCapture(e.pointerId);}catch(_){}} );
   ctx.on(view.canvas,'pointermove',e=>{if(!sw||e.pointerId!==sw.id)return;const dx=e.clientX-sw.x,dy=e.clientY-sw.y;if(Math.hypot(dx,dy)<24)return;const d=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');input(d);sw.x=e.clientX;sw.y=e.clientY;sw.moved=true;});
   const endSw=e=>{if(sw&&!sw.moved&&performance.now()-sw.t<300&&e.type==='pointerup')stopSoon();sw=null;};
   ctx.on(view.canvas,'pointerup',endSw);ctx.on(view.canvas,'pointercancel',endSw);
   // Große Richtungstasten
   const pad=ctx.layer('bonus-pad','<button type="button" class="up" data-d="up" aria-label="Nach oben">▲</button><button type="button" class="left" data-d="left" aria-label="Nach links">◀</button><button type="button" class="right" data-d="right" aria-label="Nach rechts">▶</button><button type="button" class="down" data-d="down" aria-label="Nach unten">▼</button>');
   pad.querySelectorAll('button').forEach(b=>{ctx.on(b,'pointerdown',e=>{e.preventDefault();hold=b.dataset.d;b.classList.add('on');input(hold);});const up=()=>{if(hold===b.dataset.d)hold=null;b.classList.remove('on');};ctx.on(b,'pointerup',up);ctx.on(b,'pointercancel',up);ctx.on(b,'pointerleave',up);});
   const KEYS={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right',W:'up',S:'down',A:'left',D:'right'};
   ctx.on(window,'keydown',e=>{const d=KEYS[e.key];if(!d||!ctx.running)return;e.preventDefault();if(!e.repeat){hold=d;input(d);}});
   ctx.on(window,'keyup',e=>{if(KEYS[e.key]===hold)hold=null;});

   /* Spiellogik */
   function arrive(){P.tx=P.to[0];P.ty=P.to[1];P.moving=false;const key=P.tx+','+P.ty;visited.add(key);
    const bi=M.bowls.findIndex(([c,r])=>c===P.tx&&r===P.ty);if(bi>=0&&!bowlUsed(bi)){const low=oil<.3;bowlsUsed.set(bi,0);oil=1;ctx.say(low?'Frisches Öl – die Flamme wird wieder groß.':'Die Lampe ist wieder voll.',1500);}
    const fi=M.frags.findIndex(([c,r])=>c===P.tx&&r===P.ty);if(fi>=0&&!frags.includes(fi)){frags.push(fi);fly.push({k:fi,from:screenOf(P.x,P.y),t:0});ctx.setTask(`Finde den Ausgang. Fragmente: ${frags.length}/3`);ctx.say(`Ein Bruchstück einer Inschrift (${frags.length}/3).`,1800);}
    if(M.lever&&!lever&&P.tx===M.lever[0]&&P.ty===M.lever[1]){lever=true;ctx.say('Der Hebel knarrt. Irgendwo hebt sich ein Gitter.',2800);}
    if(tile(P.tx,P.ty)===2){finishing=.001;P.dir=null;return;}
    if(P.stop){P.stop=false;P.dir=null;return;}
    if(hold&&tryGo(hold))return;
    if(P.queued&&tryGo(P.queued)){P.queued=null;return;}
    if(!tryGo(P.dir))P.dir=null;}
   function screenOf(x,y){return {x:(x+.5)*T-cam.x+view.W/2,y:(y+.5)*T-cam.y+view.H/2};}
   function update(dt,t){
    bumpT=Math.max(0,bumpT-dt);if(P.qT>0){P.qT-=dt;if(P.qT<=0&&!hold)P.queued=null;}
    if(finishing){finishing+=dt;if(finishing>2.2&&!done)finish();}
    else{oil=Math.max(0,oil-DRAIN*dt);
     if(!P.moving&&hold)tryGo(hold);
     if(P.moving){P.p+=dt*SPEED;P.step+=dt*SPEED;if(P.p>=1){P.p=1;P.x=P.to[0];P.y=P.to[1];arrive();}if(P.moving){P.x=P.from[0]+(P.to[0]-P.from[0])*P.p;P.y=P.from[1]+(P.to[1]-P.from[1])*P.p;}}
     // Zeichen in der Nähe kurz benennen (Orientierung)
     for(const m of M.marks){const k=m.c+','+m.r;if(!seenMarks.has(k)&&Math.abs(m.c-P.x)<1.6&&Math.abs(m.r-P.y)<1.8){seenMarks.add(k);ctx.say('An der Wand: '+(m.sym==='Chi-Rho'?'ein Chi-Rho':m.sym==='Taube'?'eine Taube':'ein '+m.sym)+'.',1700);}}}
    if(lever&&grateOpen<1)grateOpen=Math.min(1,grateOpen+dt*1.2);
    for(const [i,v] of bowlsUsed)bowlsUsed.set(i,v+dt);
    fly.forEach(f=>f.t+=dt);
    // Kamera weich nachführen
    const tx=(P.x+.5)*T,ty=(P.y+.5)*T,k=1-Math.pow(.004,dt);cam.x+=(tx-cam.x)*k;cam.y+=(ty-cam.y)*k;
    for(const m of motes){m.x+=m.vx*dt;m.y+=m.vy*dt+Math.sin(t*.7+m.a)*.02*dt;if(Math.abs(m.x-P.x)>5||Math.abs(m.y-P.y)>4){m.x=P.x+(Math.random()-.5)*7;m.y=P.y+(Math.random()-.5)*6;}}
   }
   function finish(){done=true;const pct=Math.round(visited.size/M.floorCount*100);const n=frags.length;
    const plate=`<div class="kat-plate${n===3?' whole':''}" aria-label="Inschrift: ${n===3?'IN PACE':'unvollständig'}">${FRAG_TEXT.map((x,i)=>`<span class="${frags.includes(i)?'':'missing'}">${frags.includes(i)?x:'·'}</span>`).join('')}</div>`;
    const plateText=n===3?'<p>Die drei Bruchstücke passen zusammen: <b>IN PACE</b> – „in Frieden“. Diese kurze Formel steht auf vielen frühchristlichen Grabinschriften.</p>':`<p>Einige Bruchstücke fehlen noch. Beim nächsten Abstieg findest du sie vielleicht – die Gänge verlaufen dann anders.</p>`;
    ctx.win({title:'Du hast den Ausgang gefunden.',lines:[`Erkundete Wege: ${pct} %`,`Gefundene Fragmente: ${n}/3`],html:plate+plateText+'<div class="bonus-history"><h4>Spuren aus der Antike</h4><p>Einige christliche Symbole sind aus der Antike überliefert. Wie genau sie im Alltag verwendet wurden, lässt sich nicht immer sicher rekonstruieren.</p><p style="margin-top:.4em">Katakomben waren vor allem Begräbnisstätten. Christen lebten nicht dort.</p></div>',backLabel:'Zurück ins Archiv'});}

   /* Darstellung */
   function draw(t){if(!M||!oc||!view.W)return;const W=view.W,H=view.H;
    const mw=M.cols*T,mh=M.rows*T;let vx=Math.max(0,Math.min(mw-W,cam.x-W/2)),vy=Math.max(0,Math.min(mh-H,cam.y-H/2));if(mw<W)vx=(mw-W)/2;if(mh<H)vy=(mh-H)/2;
    const off={x:-vx,y:-vy};
    g.fillStyle='#1a130d';g.fillRect(0,0,W,H);
    const sx=Math.max(0,vx),sy=Math.max(0,vy),sw2=Math.min(W,mw-sx),sh2=Math.min(H,mh-sy);
    g.drawImage(oc,sx*odpr,sy*odpr,sw2*odpr,sh2*odpr,sx-vx,sy-vy,sw2,sh2);
    const S=(c,r)=>({x:c*T+off.x,y:r*T+off.y});const inView=(c,r)=>c*T+off.x>-T*2&&c*T+off.x<W+T&&r*T+off.y>-T*2&&r*T+off.y<H+T;
    // Gitter
    if(M.grate&&grateOpen<1){const p=S(...M.grate);g.save();g.globalAlpha=1-grateOpen;g.strokeStyle='#3a342c';g.lineWidth=Math.max(3,T*.07);g.beginPath();for(let k=1;k<6;k++){const lx=p.x+k*T/6;g.moveTo(lx,p.y-grateOpen*T);g.lineTo(lx,p.y+T-grateOpen*T);}g.moveTo(p.x,p.y+T*.3-grateOpen*T);g.lineTo(p.x+T,p.y+T*.3-grateOpen*T);g.moveTo(p.x,p.y+T*.75-grateOpen*T);g.lineTo(p.x+T,p.y+T*.75-grateOpen*T);g.stroke();g.restore();}
    // Hebel
    if(M.lever){const p=S(...M.lever);g.save();g.translate(p.x+T*.5,p.y+T*.7);g.rotate(lever?.7:-.7);g.fillStyle='#6b4a2a';g.fillRect(-T*.05,-T*.42,T*.1,T*.42);g.fillStyle='#8d6a3e';g.beginPath();g.arc(0,-T*.42,T*.08,0,7);g.fill();g.restore();}
    // Ölschalen
    M.bowls.forEach(([c,r],i)=>{if(!inView(c,r))return;const p=S(c,r),used=bowlUsed(i);const cx=p.x+T*.5,cy=p.y+T*.62;
     g.fillStyle='#00000055';g.beginPath();g.ellipse(cx,cy+T*.08,T*.2,T*.07,0,0,7);g.fill();
     g.fillStyle='#a45a30';g.beginPath();g.ellipse(cx,cy,T*.19,T*.1,0,0,Math.PI);g.fill();g.fillStyle=used?'#3b2a1c':'#d4a24a';g.beginPath();g.ellipse(cx,cy,T*.17,T*.06,0,0,7);g.fill();
     if(!used){const f=1+.12*Math.sin(t*9+i)+.06*Math.sin(t*23+i*2);g.fillStyle='#f6b64a';g.beginPath();g.moveTo(cx-T*.05,cy-T*.02);g.quadraticCurveTo(cx,cy-T*.3*f,cx+T*.05,cy-T*.02);g.fill();g.fillStyle='#fff1b8';g.beginPath();g.moveTo(cx-T*.02,cy-T*.02);g.quadraticCurveTo(cx,cy-T*.15*f,cx+T*.02,cy-T*.02);g.fill();}});
    // Fragmente
    M.frags.forEach(([c,r],k)=>{if(frags.includes(k)||!inView(c,r))return;const p=S(c,r);const w=T*1.25,h=w*.36,cx=w*[.18,.52,.84][k];g.save();g.translate(p.x+T*.5,p.y+T*.55);g.rotate(-.2+k*.2);drawFragment(g,k,-cx,-h/2,w,h);g.restore();
     const gl=(Math.sin(t*3+k)+1)/2;g.fillStyle=`rgba(255,244,200,${.25+.5*gl})`;g.beginPath();g.arc(p.x+T*.66,p.y+T*.42,T*.035+gl*T*.02,0,7);g.fill();});
    // Spielfigur (Draufsicht) mit Lampe
    const pp={x:(P.x+.5)*T+off.x,y:(P.y+.5)*T+off.y};const bob=P.moving?Math.sin(P.step*Math.PI*2)*T*.025:0;
    const [fx,fy]=DIRS[P.face]||[1,0];
    g.fillStyle='#00000066';g.beginPath();g.ellipse(pp.x,pp.y+T*.2,T*.22,T*.09,0,0,7);g.fill();
    g.save();g.translate(pp.x,pp.y+bob);
    g.scale(1.2,1.2);g.fillStyle='#2d5a4b';g.beginPath();g.ellipse(0,T*.04,T*.2,T*.17,0,0,7);g.fill();g.strokeStyle='#1b3a30';g.lineWidth=1.5;g.stroke();
    g.fillStyle='#d9c79e';g.beginPath();g.ellipse(-fx*T*.02,T*.02-fy*T*.02,T*.12,T*.05,0,0,7);g.fill();
    g.fillStyle='#c89a6e';g.beginPath();g.arc(fx*T*.03,-T*.08+fy*T*.02,T*.1,0,7);g.fill();g.fillStyle='#3a2616';g.beginPath();g.arc(-fx*T*.02,-T*.1-fy*T*.01,T*.09,0,7);g.fill();
    const lx=fx*T*.24+(fy?T*.1:0),ly=fy*T*.2+(fx?T*.05:0)-T*.02;g.fillStyle='#b5703f';g.beginPath();g.ellipse(lx,ly,T*.07,T*.045,0,0,7);g.fill();
    const fl=(.35+.65*oil)*(1+.1*Math.sin(t*13));g.fillStyle='#f6b64a';g.beginPath();g.moveTo(lx-T*.03,ly-T*.01);g.quadraticCurveTo(lx,ly-T*.17*fl,lx+T*.03,ly-T*.01);g.fill();
    g.restore();
    // Licht und Dunkelheit
    const flick=1+.035*Math.sin(t*11.3)+.025*Math.sin(t*23.7+1)+.015*Math.sin(t*41);
    const rad=T*(1.15+(3.3-1.15)*Math.sqrt(oil))*flick;const lpx=pp.x+fx*T*.18,lpy=pp.y+fy*T*.14;
    const fin=Math.min(1,finishing/1.6);
    dg.globalCompositeOperation='source-over';dg.clearRect(0,0,W,H);dg.fillStyle=`rgba(10,6,4,${.9*(1-fin)})`;dg.fillRect(0,0,W,H);dg.globalCompositeOperation='destination-out';
    const hole=(x,y,r,a=1)=>{const gr=dg.createRadialGradient(x,y,r*.08,x,y,r);gr.addColorStop(0,`rgba(0,0,0,${a})`);gr.addColorStop(.45,`rgba(0,0,0,${a*.9})`);gr.addColorStop(1,'rgba(0,0,0,0)');dg.fillStyle=gr;dg.beginPath();dg.arc(x,y,r,0,7);dg.fill();};
    hole(lpx,lpy,rad);
    M.bowls.forEach(([c,r],i)=>{if(bowlUsed(i)||!inView(c,r))return;const p=S(c,r);hole(p.x+T*.5,p.y+T*.55,T*.9*(1+.06*Math.sin(t*9+i)),.75);});
    {const p=S(...M.exit);hole(p.x+T*.5,p.y+T*.5,T*(2.2+fin*14),.85);}
    dg.globalCompositeOperation='source-over';
    g.drawImage(dark,0,0,W,H);
    // warmer Schein
    g.save();g.globalCompositeOperation='lighter';const wg=g.createRadialGradient(lpx,lpy,0,lpx,lpy,rad*.9);wg.addColorStop(0,`rgba(255,160,60,${.22*(.4+.6*oil)})`);wg.addColorStop(1,'rgba(255,170,70,0)');g.fillStyle=wg;g.fillRect(lpx-rad,lpy-rad,rad*2,rad*2);
    // Tageslicht am Ausgang
    {const p=S(...M.exit);const ex=p.x+T*.5,ey=p.y+T*.5,er=T*(1.6+fin*9);const eg=g.createRadialGradient(ex,ey,0,ex,ey,er);eg.addColorStop(0,`rgba(255,246,214,${.35+fin*.5})`);eg.addColorStop(1,'rgba(255,246,214,0)');g.fillStyle=eg;g.fillRect(ex-er,ey-er,er*2,er*2);}
    g.restore();
    // Staubpartikel im Lichtkegel
    for(const m of motes){const x=(m.x+.5)*T+off.x,y=(m.y+.5)*T+off.y;const d=Math.hypot(x-lpx,y-lpy)/rad;if(d>1)continue;g.fillStyle=`rgba(255,236,190,${(1-d)*.7})`;g.beginPath();g.arc(x,y,1.3,0,7);g.fill();}
    // Ablage mit Fragmenten (oben links)
    const pw=Math.max(96,T*1.9),ph=pw*.36,sx0=14,sy0=14;g.fillStyle='#3b2a1cd9';g.fillRect(sx0-8,sy0-8,pw+16,ph+16);g.strokeStyle='#c9a86b';g.lineWidth=1.5;g.strokeRect(sx0-8,sy0-8,pw+16,ph+16);
    for(let k=0;k<3;k++){if(frags.includes(k))continue;g.save();fragPath(g,k,sx0,sy0,pw,ph);g.setLineDash([4,3]);g.strokeStyle='#c9a86b99';g.lineWidth=1.2;g.stroke();g.restore();}
    // Die Bruchstücke landen an ihrem Platz in der Tafel
    frags.forEach(fi=>{const f=fly.find(q=>q.k===fi);if(f&&f.t<.9){const e=f.t/.9,ee=1-Math.pow(1-e,3);g.save();g.translate((f.from.x-sx0)*(1-ee),(f.from.y-sy0-ph/2)*(1-ee)-Math.sin(e*Math.PI)*50);drawFragment(g,fi,sx0,sy0,pw,ph);g.restore();}else drawFragment(g,fi,sx0,sy0,pw,ph);});
    // Lampe mit Ölstand (unten links)
    const ls=Math.max(30,Math.min(52,T*.7));lampArt(g,ls*1.25+12,H-ls*.95-10,ls,oil,t);
    if(finishing){g.fillStyle=`rgba(255,248,226,${Math.max(0,(finishing-1.4)/.8)*.85})`;g.fillRect(0,0,W,H);}
   }
   ctx.loop({update,draw});
   ctx.stage.__debug={setOil:v=>oil=v,map:()=>M,player:()=>P,frags:()=>frags};
   reset();
   return {start(){reset();}};
  }
 });
})();
