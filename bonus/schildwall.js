'use strict';
/* Bonusspiel: Schildwall – Pfeilregen an der Milvischen Brücke (312).
   Ein Trupp aus fünf Legionären steht als geschlossene Formation am Tiberufer. Pfeilsalven kommen
   von links, von oben oder von rechts. Man wählt nur die gemeinsame Abwehrrichtung – alle Schilde
   folgen gemeinsam. Passt die Richtung beim Einschlag, prallen die Pfeile ab; sonst gibt es einen
   Treffer. Nach drei Treffern ist die Runde vorbei. Gemessen wird die Überlebenszeit.
   Keine Verletzten, kein Blut: ein Treffer lässt die Formation nur wanken.

   Grafiken: assets/bonus/shieldwall/ – nur Dateien aus ART.available werden geladen (keine 404-Fehler).
   Ohne eigenes Hintergrundbild dient der Ausschnitt mit Tiber, Brücke und Rom aus dem Lager-Gemälde
   (v3-camp.png) als Kulisse; Trupp, Pfeile und Vordergrund werden gezeichnet.
   Bestzeit (längste Überlebenszeit): localStorage unter BEST_KEY. */
(()=>{
 if(!window.BonusGames)return;
 const ART={dir:'assets/bonus/shieldwall/',files:{bg:'shieldwall-bg.png',squad:'shieldwall-squad.png',left:'shieldwall-shields-left.png',up:'shieldwall-shields-up.png',right:'shieldwall-shields-right.png',arrows:'shieldwall-arrows.png',hit:'shieldwall-hit.png',ui:'shieldwall-ui.png',bridge:'shieldwall-bridge-silhouette.png',banners:'shieldwall-banners.png',impact:'shieldwall-impact.png',gameover:'shieldwall-gameover.png'},available:[]};
 const FALLBACK_BG='assets/backgrounds/v3-camp.png';
 const FALLBACK_CROP=[0,.04,.31,.5]; // Tiber, Milvische Brücke und Rom im Lager-Gemälde (Anteile x,y,w,h)
 const BEST_KEY='im-zeichen-der-wende:schildwall-best-v1';
 const loadBest=()=>{try{const v=JSON.parse(localStorage.getItem(BEST_KEY));const ms=v&&v.ms;return Number.isFinite(ms)&&ms>0&&ms<36e5?ms:null;}catch(e){return null;}};
 const saveBest=ms=>{try{localStorage.setItem(BEST_KEY,JSON.stringify({ms:Math.round(ms)}));}catch(e){}};
 const fmt=ms=>{if(ms==null)return '–';const s=ms/1000,m=Math.floor(s/60),r=s-m*60;return `${m}:${r<10?'0':''}${r.toFixed(1).replace('.',',')}`;};
 const DIRS=['left','up','right'];
 const LIVES=3;
 /* Schwierigkeit über die Zeit: Abstand der Salven, Flugzeit, Warnzeit, Chance auf eine schnelle Doppelsalve */
 function pace(t){const k=Math.min(1,t/90);return {gap:2.3-1.35*k,fly:1.55-.6*k,double:t<20?0:Math.min(.45,(t-20)/120)};}

 window.BonusGames.register({
  id:'schildwall',title:'Schildwall',kicker:'Bonusspiel · An der Milvischen Brücke, 312',scene:'camp',
  spot:[91,43,'Übungsschilde'],
  intro:{text:'Oktober 312, an der Milvischen Brücke vor Rom. Dein Trupp hält die Stellung, während Pfeile heranfliegen. Richte die Schilde gemeinsam aus – so lange wie möglich.',
   controls:['Drei große Knöpfe: <b>↖ Links</b>, <b>↑ Oben</b>, <b>↗ Rechts</b><span class="mg-keys"> – am PC die Pfeiltasten</span>.','Der ganze Trupp hebt die Schilde gemeinsam in diese Richtung.','Leuchtende Bögen am Himmel zeigen, woher die nächste Salve kommt.','Drei Treffer – dann ist die Runde vorbei. Gemessen wird deine Zeit.'],start:'Schilde hoch!'},
  setup(ctx){
   const has=k=>ART.available.includes(k),src=k=>ART.dir+ART.files[k];
   const view=ctx.canvas({maxDpr:2}),g=view.g;const imgs={};
   const loadImg=(key,url)=>{if(typeof Image==='undefined')return;const im=new Image();im.onload=()=>{imgs[key]=im;bgc=null;};im.src=url;};
   if(has('bg'))loadImg('bg',src('bg'));else loadImg('camp',FALLBACK_BG);
   Object.keys(ART.files).filter(k=>k!=='bg'&&has(k)).forEach(k=>loadImg(k,src(k)));
   const best0=loadBest();
   const hud=ctx.layer('sw-hud'+(has('ui')?' art-ui':''),`<div class="sw-tablet" role="timer"><span class="sw-label">Zeit</span><span class="sw-time">0:00,0</span><span class="sw-bestline">Bestzeit <b class="sw-best">${fmt(best0)}</b></span></div><div class="sw-lives" aria-label="Verbleibende Treffer: ${LIVES}">${'<span class="sw-life"></span>'.repeat(LIVES)}</div><div class="sw-waves" aria-live="polite">Abgewehrt: <b>0</b></div>`);
   const pad=ctx.layer('sw-pad',`<button type="button" data-d="left" aria-label="Schilde nach links"><span aria-hidden="true">↖</span>Links</button><button type="button" data-d="up" aria-label="Schilde nach oben"><span aria-hidden="true">↑</span>Oben</button><button type="button" data-d="right" aria-label="Schilde nach rechts"><span aria-hidden="true">↗</span>Rechts</button>`);
   const timeEl=hud.querySelector('.sw-time'),bestEl=hud.querySelector('.sw-best'),livesEl=hud.querySelector('.sw-lives'),wavesEl=hud.querySelector('.sw-waves b');
   const note=ctx.stage.querySelector('.bonus-introcard .bonus-note');if(note)note.insertAdjacentHTML('beforebegin',`<p class="rom-best-note">${best0?`Deine längste Zeit: <b>${fmt(best0)}</b>`:'Noch keine Bestzeit – die erste Runde setzt sie.'}</p>`);

   let S;
   function reset(){S={dir:'up',tilt:{left:0,up:1,right:0},clock:0,lives:LIVES,waves:0,blocked:0,volleys:[],next:1.6,fx:[],shake:0,flinch:0,phase:'play',result:null,lastShown:-1};
    renderLives();wavesEl.textContent='0';timeEl.textContent=fmt(0);setDir('up',true);}
   function renderLives(){livesEl.querySelectorAll('.sw-life').forEach((e,i)=>e.classList.toggle('lost',i>=S.lives));livesEl.setAttribute('aria-label','Verbleibende Treffer: '+S.lives);}
   function setDir(d,silent){if(!DIRS.includes(d)||!S||S.phase!=='play')return;S.dir=d;pad.querySelectorAll('button').forEach(b=>{const on=b.dataset.d===d;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));});}

   /* Eingabe: sofort beim Berühren (pointerdown), kein Warten auf „click“ */
   pad.querySelectorAll('button').forEach(b=>{ctx.on(b,'pointerdown',e=>{e.preventDefault();if(ctx.running&&!ctx.paused)setDir(b.dataset.d);});ctx.on(b,'click',()=>{if(ctx.running&&!ctx.paused)setDir(b.dataset.d);});ctx.on(b,'contextmenu',e=>e.preventDefault());});
   const KM={ArrowLeft:'left',ArrowUp:'up',ArrowRight:'right',a:'left',w:'up',d:'right'};
   ctx.on(window,'keydown',e=>{const d=KM[e.key];if(!d||!ctx.running)return;e.preventDefault();setDir(d);});

   /* Salven */
   function spawn(){const p=pace(S.clock);const last=S.volleys.length?S.volleys[S.volleys.length-1].dir:null;
    let dir=DIRS[Math.floor(Math.random()*3)];if(S.clock<8&&dir===last)dir=DIRS[(DIRS.indexOf(dir)+1+Math.floor(Math.random()*2))%3];
    const n=Math.round(5+Math.min(4,S.clock/20));
    const v={dir,t:0,fly:p.fly,n,arrows:Array.from({length:n},(_,i)=>({o:(i-(n-1)/2)/(n-1||1),d:Math.random()*.12,wob:Math.random()*6})),done:false};
    S.volleys.push(v);S.waves++;
    let gap=p.gap;if(Math.random()<p.double){const w=DIRS.filter(x=>x!==dir)[Math.floor(Math.random()*2)];S.volleys.push({...v,dir:w,t:-Math.max(.55,p.fly*.55),arrows:v.arrows.map(a=>({...a,d:Math.random()*.12})),done:false});S.waves++;gap+=.5;}
    S.next=gap;}
   function impact(v){v.done=true;const ok=S.dir===v.dir;
    if(ok){S.blocked++;wavesEl.textContent=String(S.blocked);S.fx.push({k:'block',dir:v.dir,t:0});}
    else{S.lives--;renderLives();S.flinch=.45;S.shake=.35;S.fx.push({k:'hit',dir:v.dir,t:0});livesEl.classList.remove('pop');void livesEl.offsetWidth;livesEl.classList.add('pop');
     ctx.say(S.lives>0?(v.dir==='up'?'Von oben! Schilde hoch!':v.dir==='left'?'Von links! Schilde nach links!':'Von rechts! Schilde nach rechts!'):'Der Trupp muss zurückweichen.',1400,'bad');
     if(S.lives<=0)gameOver();}}
   function gameOver(){S.phase='over';const ms=Math.round(S.clock*1000);timeEl.textContent=fmt(ms);const old=loadBest();const record=old==null||ms>old;if(record){saveBest(ms);bestEl.textContent=fmt(ms);}
    S.result={ms,record,previous:old,blocked:S.blocked};pad.querySelectorAll('button').forEach(b=>b.disabled=true);
    ctx.after(1300,()=>ctx.win({title:'',lines:[`Durchgehalten: ${fmt(ms)}`,`Abgewehrte Salven: ${S.blocked}`,record?(old==null?'Das ist deine erste Bestzeit.':`Neue Bestzeit! Vorher: ${fmt(old)}`):`Bestzeit: ${fmt(old)}`],
     html:`<div class="schild-banner"><span>${record?'FORMATIO TENET':'RECEPTUI!'}</span></div><p class="schild-sub">${record?'Neue Bestzeit – die Formation hat gehalten!':'Der Trupp zieht sich geordnet zurück.'}</p><div class="bonus-history"><h4>Zur Einordnung</h4><p>Am 28. Oktober 312 siegte Konstantin an der Milvischen Brücke über Maxentius. Über den Ablauf der Schlacht wissen wir wenig; diese Szene ist erfunden. Dass Konstantins Soldaten ein christliches Zeichen auf den Schilden trugen, berichtet erst später Laktanz.</p></div>`,backLabel:'Zurück ins Lager'}));}

   function update(dt){if(!S||S.phase!=='play'){if(S){S.fx.forEach(f=>f.t+=dt);S.fx=S.fx.filter(f=>f.t<1);}return;}
    S.clock+=dt;const tenth=Math.floor(S.clock*10);if(tenth!==S.lastShown){S.lastShown=tenth;timeEl.textContent=fmt(S.clock*1000);}
    DIRS.forEach(d=>{S.tilt[d]+=((S.dir===d?1:0)-S.tilt[d])*Math.min(1,dt*18);});
    S.next-=dt;if(S.next<=0)spawn();
    S.volleys.forEach(v=>{v.t+=dt;if(!v.done&&v.t>=v.fly)impact(v);});S.volleys=S.volleys.filter(v=>v.t<v.fly+.9);
    S.fx.forEach(f=>f.t+=dt);S.fx=S.fx.filter(f=>f.t<1);S.flinch=Math.max(0,S.flinch-dt);S.shake=Math.max(0,S.shake-dt);}

   /* ---------- Zeichnen ---------- */
   let bgc=null;view.resize=()=>{bgc=null;};
   const geo=()=>{const W=view.W,H=view.H;const u=Math.min(W/16,H/9);return {W,H,u,cx:W/2,feet:H*.8,sq:H>W?W*.74:Math.min(W*.6,u*10)};};
   function renderBg(){const {W,H}=geo();bgc=document.createElement('canvas');bgc.width=Math.round(W*view.dpr);bgc.height=Math.round(H*view.dpr);const o=bgc.getContext('2d');o.scale(view.dpr,view.dpr);
    const sky=o.createLinearGradient(0,0,0,H*.62);sky.addColorStop(0,'#2a2438');sky.addColorStop(.55,'#8a4a36');sky.addColorStop(1,'#d88a4a');o.fillStyle=sky;o.fillRect(0,0,W,H);
    if(imgs.bg){const s=Math.max(W/imgs.bg.width,H/imgs.bg.height);o.drawImage(imgs.bg,(W-imgs.bg.width*s)/2,(H-imgs.bg.height*s)/2,imgs.bg.width*s,imgs.bg.height*s);}
    else if(imgs.camp){const im=imgs.camp,[cx,cy,cw,ch]=W>H?[0,.04,.52,.5]:FALLBACK_CROP,sx=cx*im.width,sy=cy*im.height,sw=cw*im.width,sh=ch*im.height;let dw=Math.max(W,H*.64*sw/sh),dh=dw*sh/sw;const y0=Math.min(0,H*.52-dh*.76); // Brücke (bei 76 % des Ausschnitts) knapp über der Formation
     o.save();o.filter='saturate(.85) brightness(.8) blur(1px)';o.drawImage(im,sx,sy,sw,sh,(W-dw)/2,y0,dw,dh);o.restore();const bottom=y0+dh;
     const dusk=o.createLinearGradient(0,0,0,bottom);dusk.addColorStop(0,'rgba(120,50,40,.45)');dusk.addColorStop(1,'rgba(230,140,70,.28)');o.fillStyle=dusk;o.fillRect(0,0,W,bottom);
     const fade=o.createLinearGradient(0,H*.56,0,Math.min(bottom,H*.66));fade.addColorStop(0,'rgba(90,70,50,0)');fade.addColorStop(1,'rgba(90,70,50,1)');o.fillStyle=fade;o.fillRect(0,H*.56,W,H*.12);}
    else{o.fillStyle='#3a3040';o.beginPath();o.moveTo(0,H*.5);for(let x=0;x<=W;x+=W/10)o.lineTo(x,H*.45-Math.abs(Math.sin(x*.01))*H*.08);o.lineTo(W,H*.62);o.lineTo(0,H*.62);o.fill();
     o.fillStyle='#3b5566';o.fillRect(0,H*.52,W,H*.08);o.fillStyle='#4a4238';for(let k=0;k<5;k++){const bx=W*.1+k*W*.08;o.beginPath();o.moveTo(bx,H*.5);o.lineTo(bx+W*.08,H*.5);o.lineTo(bx+W*.08,H*.56);o.arc(bx+W*.04,H*.56,W*.032,0,Math.PI,true);o.fill();}}
    // Vordergrund: zertretenes Ufer, Standarten des Heeres
    const gr=o.createLinearGradient(0,H*.6,0,H);gr.addColorStop(0,'#6b5438');gr.addColorStop(1,'#3e2e1c');o.fillStyle=gr;o.beginPath();o.moveTo(0,H*.62);for(let x=0;x<=W;x+=W/16)o.lineTo(x,H*.6+Math.sin(x*.02)*H*.01);o.lineTo(W,H);o.lineTo(0,H);o.fill();
    for(let k=0;k<70;k++){o.fillStyle=`rgba(${40+Math.random()*30|0},${30+Math.random()*20|0},20,.35)`;o.beginPath();o.ellipse(Math.random()*W,H*.64+Math.random()*H*.36,4+Math.random()*14,2+Math.random()*4,0,0,7);o.fill();}
    [[.07,.52],[.93,.52]].forEach(([fx,fy])=>{const x=W*fx,y=H*.86;o.strokeStyle='#4a321c';o.lineWidth=Math.max(3,W*.004);o.beginPath();o.moveTo(x,y);o.lineTo(x,H*fy-H*.18);o.stroke();o.fillStyle='#8c2a1a';o.fillRect(x+2,H*fy-H*.17,W*.05,H*.11);o.strokeStyle='#d9a441';o.lineWidth=2;o.strokeRect(x+2,H*fy-H*.17,W*.05,H*.11);o.fillStyle='#d9a441';o.beginPath();o.arc(x+2+W*.025,H*fy-H*.115,H*.022,0,7);o.fill();o.fillStyle='#e7c46a';o.beginPath();o.moveTo(x-6,H*fy-H*.18);o.lineTo(x+6,H*fy-H*.18);o.lineTo(x,H*fy-H*.21);o.fill();});
    const vig=o.createRadialGradient(W/2,H*.55,H*.2,W/2,H*.55,H*.95);vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(1,'rgba(20,10,5,.5)');o.fillStyle=vig;o.fillRect(0,0,W,H);}

   /* Herkunft und Ziel einer Salve (Anteile) – links/rechts schräg von oben, oben senkrecht */
   function path(dir,o,{W,H,cx,feet,sq}){const top=feet-sq*.42,spread=sq*.42;
    if(dir==='up')return {x0:cx+o*spread*1.1,y0:-H*.08,x1:cx+o*spread,y1:top-sq*.02};
    const s=dir==='left'?-1:1;return {x0:cx+s*W*.62,y0:H*(.08+o*.05+.08),x1:cx+s*sq*.36+o*sq*.08,y1:top+sq*.08+o*sq*.1};}
   function draw(t){if(!view.W||!S)return;const G=geo();const {W,H,cx,feet,sq}=G;if(!bgc)renderBg();
    const sh=S.shake>0?Math.sin(t*90)*S.shake*10:0;g.save();g.translate(sh,0);g.drawImage(bgc,0,0,W,H);
    // Warnbögen: woher kommt die nächste Salve?
    S.volleys.forEach(v=>{if(v.done||v.t<0)return;const k=Math.min(1,v.t/v.fly);const a=.35+.45*Math.sin(t*14)*(k>.6?1:.4);
     g.save();g.globalAlpha=Math.max(0,a*(1-k*.3));g.strokeStyle='#ffd98a';g.lineWidth=Math.max(4,G.u*.18);g.lineCap='round';g.beginPath();
     if(v.dir==='up')g.arc(cx,feet-sq*.35,sq*.62,-Math.PI*.72,-Math.PI*.28);else if(v.dir==='left')g.arc(cx,feet-sq*.35,sq*.62,-Math.PI*1.05,-Math.PI*.78);else g.arc(cx,feet-sq*.35,sq*.62,-Math.PI*.22,Math.PI*.05);g.stroke();g.restore();});
    drawSquad(G,t);
    // Pfeile
    S.volleys.forEach(v=>{if(v.t<0)return;v.arrows.forEach(a=>{const k=Math.min(1,Math.max(0,(v.t-a.d)/(v.fly-a.d)));if(v.done&&v.t>v.fly+.05)return;const p=path(v.dir,a.o,G);
      const x=p.x0+(p.x1-p.x0)*k,y=p.y0+(p.y1-p.y0)*k-(v.dir==='up'?0:Math.sin(k*Math.PI)*H*.14);const nx=p.x0+(p.x1-p.x0)*Math.min(1,k+.02),ny=p.y0+(p.y1-p.y0)*Math.min(1,k+.02)-(v.dir==='up'?0:Math.sin(Math.min(1,k+.02)*Math.PI)*H*.14);
      arrow(x,y,Math.atan2(ny-y,nx-x),G.u*1.05);});});
    // Effekte
    S.fx.forEach(f=>{const e=f.t;if(f.k==='block'){for(let i=0;i<7;i++){const p=path(f.dir,(i-3)/3,G);const ang=f.dir==='up'?-Math.PI/2+(i-3)*.3:(f.dir==='left'?-Math.PI*.8:-Math.PI*.2)+(i-3)*.18;const d=e*G.u*5;g.save();g.globalAlpha=1-e;arrow(p.x1+Math.cos(ang)*d,p.y1+Math.sin(ang)*d+e*e*G.u*6,ang+e*6,G.u*.9);g.restore();
       g.fillStyle=`rgba(255,230,160,${(1-e)*.9})`;g.beginPath();g.arc(p.x1,p.y1,G.u*.18*(1+e*2),0,7);g.fill();}}
     else if(f.k==='hit'){g.fillStyle=`rgba(160,30,20,${.28*(1-e)})`;g.fillRect(-20,-20,W+40,H+40);}});
    g.restore();
    if(S.phase==='over'){g.fillStyle='rgba(20,10,5,.35)';g.fillRect(0,0,W,H);}
   }
   function arrow(x,y,a,len){if(imgs.arrows){g.save();g.translate(x,y);g.rotate(a);g.drawImage(imgs.arrows,-len,-len*.12,len,len*.24);g.restore();return;}
    g.save();g.translate(x,y);g.rotate(a);g.lineCap='round';
    g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=Math.max(4,len*.09);g.beginPath();g.moveTo(-len,2);g.lineTo(0,2);g.stroke();
    g.strokeStyle='#6a4424';g.lineWidth=Math.max(3,len*.06);g.beginPath();g.moveTo(-len,0);g.lineTo(-len*.02,0);g.stroke();
    g.fillStyle='#2a2a2e';g.strokeStyle='#e0e0e0';g.lineWidth=1;g.beginPath();g.moveTo(len*.2,0);g.lineTo(-len*.06,-len*.1);g.lineTo(-len*.02,0);g.lineTo(-len*.06,len*.1);g.closePath();g.fill();g.stroke();
    g.fillStyle='#b8322a';g.beginPath();g.moveTo(-len,0);g.lineTo(-len*.86,-len*.08);g.lineTo(-len*.76,-len*.08);g.lineTo(-len*.86,0);g.lineTo(-len*.76,len*.08);g.lineTo(-len*.86,len*.08);g.closePath();g.fill();g.restore();}
   /* Der Trupp: fünf Legionäre in zwei Reihen, gemeinsame Schildstellung. Die Schilde werden
      zwischen drei Posen interpoliert (tilt), damit die Formation als Einheit schwenkt. */
   function drawSquad({cx,feet,sq,u},t){
    const art=imgs.squad,shieldArt=imgs[S.dir];
    const fl=S.flinch>0?Math.sin(S.flinch*30)*u*.15:0;
    if(art){const w=sq,h=w*art.height/art.width;g.drawImage(art,cx-w/2+fl,feet-h,w,h);if(shieldArt){g.drawImage(shieldArt,cx-w/2+fl,feet-h,w,h);}return;}
    const men=[[-.3,0,.9],[.3,0,.9],[-.15,.05,.97],[.15,.05,.97],[0,.1,1.03]]; // x, Tiefe, Maßstab (hinten zuerst)
    g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(cx,feet+u*.1,sq*.5,u*.5,0,0,7);g.fill();
    // erst alle Körper, dann alle Schilde: die Schildreihe liegt als geschlossene Wand vor dem Trupp
    for(const pass of ['body','shield'])men.forEach(([ox,dz,s],i)=>{const x=cx+ox*sq+fl,y=feet+dz*u*2,h=sq*.5*s,br=Math.sin(t*2+i)*h*.006;legionary(x,y+br,h,i,pass);});
   }
   function legionary(x,y,h,i,pass){const {left,up,right}=S.tilt;const w=h*.42,ol='#2a1608',lw=Math.max(1.5,h*.012);
    g.save();g.translate(x,y);g.lineJoin='round';g.lineCap='round';g.strokeStyle=ol;g.lineWidth=lw;
    const P=(pts,fill)=>{g.beginPath();pts.forEach(([px,py],k)=>k?g.lineTo(px*w,py*h):g.moveTo(px*w,py*h));g.closePath();g.fillStyle=fill;g.fill();g.stroke();};
    if(pass==='body'){
    // Umhang hinten
    P([[-.34,-.74],[.34,-.74],[.42,-.16],[-.42,-.16]],'#7a1c14');
    // Beine mit Sandalenriemen
    P([[-.2,-.22],[-.07,-.22],[-.08,0],[-.2,0]],'#b8845a');P([[.07,-.22],[.2,-.22],[.2,0],[.08,0]],'#b8845a');
    g.strokeStyle='#4a2a14';for(const sx of [-.14,.14])for(let k=1;k<4;k++){g.beginPath();g.moveTo((sx-.06)*w,-k*h*.045);g.lineTo((sx+.06)*w,-k*h*.045);g.stroke();}g.strokeStyle=ol;
    // Tunika
    P([[-.34,-.5],[.34,-.5],[.38,-.2],[.2,-.18],[0,-.21],[-.2,-.18],[-.38,-.2]],'#b8362a');
    // Kettenhemd mit Schattierung
    const mail=g.createLinearGradient(-w*.3,0,w*.3,0);mail.addColorStop(0,'#6a6862');mail.addColorStop(.45,'#a09c92');mail.addColorStop(1,'#5a5852');
    P([[-.3,-.74],[.3,-.74],[.34,-.38],[-.34,-.38]],mail);g.strokeStyle='#4a4842';g.lineWidth=Math.max(1,h*.005);for(let k=1;k<6;k++){g.beginPath();g.moveTo(-w*.3,-h*.74+k*h*.06);g.lineTo(w*.3,-h*.74+k*h*.06);g.stroke();}g.strokeStyle=ol;g.lineWidth=lw;
    P([[-.35,-.42],[.35,-.42],[.35,-.385],[-.35,-.385]],'#6a4020');
    // Kopf, Wangenklappen, Helm mit Busch
    g.fillStyle='#c8905e';g.beginPath();g.arc(0,-h*.8,h*.07,0,7);g.fill();g.stroke();
    g.fillStyle='#c8a860';g.beginPath();g.arc(0,-h*.83,h*.082,Math.PI,0);g.lineTo(h*.1,-h*.8);g.lineTo(-h*.1,-h*.8);g.closePath();g.fill();g.stroke();
    P([[-.2,-.83],[-.13,-.83],[-.13,-.74],[-.19,-.76]],'#b8984e');P([[.13,-.83],[.2,-.83],[.19,-.76],[.13,-.74]],'#b8984e');
    g.fillStyle='#b8221a';g.beginPath();g.ellipse(0,-h*.935,h*.1,h*.035,0,0,7);g.fill();g.stroke();
    // Speer (Pilum)
    g.strokeStyle='#5a3a1c';g.lineWidth=Math.max(2.5,h*.018);g.beginPath();g.moveTo(w*.46,0);g.lineTo(w*.46-up*w*.12,-h*1.05);g.stroke();
    g.fillStyle='#9a9aa0';g.strokeStyle=ol;g.lineWidth=lw;g.beginPath();g.moveTo(w*.46-up*w*.12,-h*1.14);g.lineTo(w*.42-up*w*.12,-h*1.04);g.lineTo(w*.5-up*w*.12,-h*1.04);g.closePath();g.fill();g.stroke();
    g.restore();return;}
    // Schild (Scutum): drei Posen werden gemischt, damit der Trupp gemeinsam schwenkt
    const pose={x:-left*w*.46+right*w*.46,y:-h*.5-up*h*.44-(left+right)*h*.14,rot:-left*.62+right*.62,sx:1-(left+right)*.3,sy:1-up*.52};
    g.translate(pose.x,pose.y);g.rotate(pose.rot);g.scale(pose.sx,pose.sy);
    const SW=w*1.18,SH=h*.56;
    const face=g.createLinearGradient(-SW/2,0,SW/2,0);face.addColorStop(0,'#6a1a10');face.addColorStop(.35,'#b8362a');face.addColorStop(.6,'#a82e22');face.addColorStop(1,'#5a140c');
    g.fillStyle=face;g.strokeStyle='#e0b45a';g.lineWidth=Math.max(2.5,h*.022);g.beginPath();if(g.roundRect)g.roundRect(-SW/2,-SH/2,SW,SH,SW*.1);else g.rect(-SW/2,-SH/2,SW,SH);g.fill();g.stroke();
    g.strokeStyle=ol;g.lineWidth=lw;g.stroke();
    g.strokeStyle='#e8c47a';g.lineWidth=Math.max(1.5,h*.012);g.beginPath();g.moveTo(-SW*.38,-SH*.3);g.quadraticCurveTo(0,-SH*.1,SW*.38,-SH*.3);g.moveTo(-SW*.38,SH*.3);g.quadraticCurveTo(0,SH*.1,SW*.38,SH*.3);g.moveTo(0,-SH*.42);g.lineTo(0,-SH*.16);g.moveTo(0,SH*.42);g.lineTo(0,SH*.16);g.stroke();
    const boss=g.createRadialGradient(-SW*.04,-SH*.05,1,0,0,SW*.15);boss.addColorStop(0,'#fff0c0');boss.addColorStop(1,'#a8762a');g.fillStyle=boss;g.beginPath();g.ellipse(0,0,SW*.14,SH*.13,0,0,7);g.fill();g.strokeStyle='#6a4414';g.stroke();
    g.fillStyle='rgba(255,240,200,.14)';g.fillRect(-SW*.42,-SH*.46,SW*.12,SH*.92);
    g.restore();}
   ctx.loop({update,draw});
   ctx.stage.__debug={S:()=>S,setDir,update,reset,pace,art:ART,BEST_KEY};
   reset();
   return {start(){reset();}};
  }
 });
 window.BonusGames.games.schildwall.art=ART;
 window.BonusGames.games.schildwall.BEST_KEY=BEST_KEY;
})();
