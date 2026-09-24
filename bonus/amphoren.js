'use strict';
/* Bonusspiel 4: Amphoren-Chaos – Rette den Marktstand!
   Catch-Spiel: Der Händler fängt mit dem Korb, was vom wackelnden Stand fällt.
   Keine Leben: Falsches bringt nur einen Spruch, Zerbrochenes nur Scherben. */
(()=>{
 if(!window.BonusGames)return;
 const IMG={people:'assets/minigames/leute.webp',blur:'assets/minigames/forum-blur.jpg'};
 const HAENDLER=[199,132];
 const FOOD=['brot','oliven','kohl','kaese'];
 const THINGS=['muenzen','schriftrolle','korb','besen','sandale','krug'];
 const FUNNY=['sandale','kohl','besen','taube'];
 const TERMS_OK=['Gottesdienstverbot','Schriften vernichten','Kirchen zerstören','Verhaftungen'];
 const TERMS_NO=[['Mailand 313','313 kam die Mailänder Vereinbarung – das Ende der Verfolgung.'],['Konzil 325','325 tagte das Konzil von Nicäa – lange nach der Verfolgung.'],['Nero','Nero regierte im 1. Jahrhundert.']];
 const ROUNDS=[{dur:24,title:'Rette die Amphoren!',task:'Auftrag 1: Rette die Amphoren!'},{dur:24,title:'Sammle Lebensmittel!',task:'Auftrag 2: Sammle Lebensmittel!'},{dur:30,title:'Sammle alles, was zur großen Verfolgung ab 303 gehört.',task:'Auftrag 3: Was gehört zur großen Verfolgung ab 303?'}];
 const NAMES={brot:'Brot',oliven:'Oliven',kohl:'Kohlkopf',kaese:'Käse',muenzen:'Münzen',schriftrolle:'Schriftrolle',korb:'Korb',besen:'Besen',sandale:'Sandale',krug:'Krug',amphore:'Amphore',taube:'Taube'};
 function load(src){return new Promise(res=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>res(null);i.src=src;});}

 window.BonusGames.register({
  id:'amphoren',title:'Amphoren-Chaos',kicker:'Bonusspiel · Markt am Forum',scene:'forum',
  spot:[9,63,'Wackeliger Marktkarren'],
  intro:{text:'Der Marktstand gerät ins Wanken! Amphoren, Brot, Oliven, Münzen und Schriftrollen purzeln aus den Regalen. Hilf dem Händler, mit seinem großen Korb das Richtige aufzufangen.',
   controls:['<b>Finger</b> waagerecht über das Spielfeld ziehen: Der Händler folgt direkt.','Oder links bzw. rechts neben den Händler tippen<span class="mg-keys"> – am PC auch Pfeiltasten</span>.','Drei kurze Aufträge. Falsch Gefangenes kostet nichts.'],start:'An den Stand!'},
  setup(ctx){
   const view=ctx.canvas({maxDpr:2}),g=view.g;const imgs={};let bgc=null;
   Promise.all([load(IMG.people),load(IMG.blur)]).then(([p,b])=>{imgs.people=p;imgs.blur=b;prepare();});
   let items=[],parts=[],round=-1,roundT=0,spawnT=0,bx=.5,tx=.5,squash=0,wobble=0,stats=null,shout=null,ended=false,keyDir=0,pending=[];
   const L=()=>{const W=view.W,H=view.H;const mh=Math.min(H*.36,W*.22);return {W,H,ground:H*.95,mh,bw:Math.max(84,Math.min(W*.14,mh*.78)),by:H*.95-mh*.46,shelf:H*.2};};
   function reset(){items=[];parts=[];round=-1;roundT=0;spawnT=1;bx=tx=.5;squash=0;ended=false;stats={amph:0,amphAll:0,food:0,terms:0,termsAll:0,wrong:0};pending=[];}
   view.resize=()=>prepare();
   function prepare(){if(!view.W)return;const {W,H,shelf}=L();bgc=document.createElement('canvas');bgc.width=Math.round(W*view.dpr);bgc.height=Math.round(H*view.dpr);const o=bgc.getContext('2d');o.scale(view.dpr,view.dpr);
    if(imgs.blur){const sc=Math.max(W/imgs.blur.width,H/imgs.blur.height);o.drawImage(imgs.blur,(W-imgs.blur.width*sc)/2,(H-imgs.blur.height*sc)/2,imgs.blur.width*sc,imgs.blur.height*sc);}else{o.fillStyle='#d9c49a';o.fillRect(0,0,W,H);}
    o.fillStyle='rgba(243,228,197,.25)';o.fillRect(0,0,W,H);
    const gr=o.createLinearGradient(0,H*.72,0,H);gr.addColorStop(0,'rgba(190,160,115,0)');gr.addColorStop(.3,'#c9ad7f');gr.addColorStop(1,'#a88a5e');o.fillStyle=gr;o.fillRect(0,H*.72,W,H*.28);
    for(let x=-40;x<W;x+=90){o.strokeStyle='rgba(110,85,55,.3)';o.lineWidth=2;o.beginPath();o.moveTo(x,H*.83);o.lineTo(x+60,H*.83);o.moveTo(x+30,H*.92);o.lineTo(x+100,H*.92);o.stroke();}
   }
   /* Marktstand oben (wackelt) */
   function stall(t){const {W,shelf}=L();const a=Math.sin(t*3.1)*.012*(1+wobble*2)+Math.sin(t*7.3)*.004*wobble;g.save();g.translate(W/2,shelf);g.rotate(a);
    const w=W*.92;g.fillStyle='#5a3a1c';g.fillRect(-w/2,-6,w,16);g.fillStyle='#7a5230';g.fillRect(-w/2,-6,w,5);
    for(let k=0;k<12;k++){g.fillStyle=k%2?'#efe2c4':'#a8432a';g.beginPath();const x0=-w/2+k*w/12;g.moveTo(x0,-view.H*.19);g.lineTo(x0+w/12,-view.H*.19);g.lineTo(x0+w/12,-view.H*.11);g.quadraticCurveTo(x0+w/24,-view.H*.09+Math.sin(t*2+k)*2,x0,-view.H*.11);g.fill();}
    g.fillStyle='#4a321c';g.fillRect(-w/2-6,-view.H*.2,10,view.H*.22);g.fillRect(w/2-4,-view.H*.2,10,view.H*.22);
    // Waren im Regal
    for(let k=0;k<9;k++){const x=-w/2+w*(.08+k*.105),kind=['amphore','brot','korb','amphore','krug','oliven','schriftrolle','amphore','muenzen'][k];g.save();g.translate(x,-8);g.rotate(Math.sin(t*4+k)*.03*(1+wobble*3));drawItem({kind,r:view.H*.035,rot:0},0,-view.H*.035,t);g.restore();}
    g.restore();}
   function drawItem(it,x,y,t){const r=it.r;g.save();g.translate(x,y);g.rotate(it.rot||0);
    switch(it.kind){
     case 'amphore':{g.fillStyle='#b5673a';g.beginPath();g.moveTo(-r*.25,-r*1.1);g.lineTo(r*.25,-r*1.1);g.quadraticCurveTo(r*.3,-r*.8,r*.55,-r*.5);g.quadraticCurveTo(r*.7,r*.3,r*.1,r*1.1);g.lineTo(-r*.1,r*1.1);g.quadraticCurveTo(-r*.7,r*.3,-r*.55,-r*.5);g.quadraticCurveTo(-r*.3,-r*.8,-r*.25,-r*1.1);g.fill();g.strokeStyle='#7a3a1a';g.lineWidth=1.5;g.stroke();
      g.strokeStyle='#8a4a24';g.lineWidth=r*.12;g.beginPath();g.moveTo(-r*.25,-r*.95);g.quadraticCurveTo(-r*.6,-r*.9,-r*.5,-r*.55);g.moveTo(r*.25,-r*.95);g.quadraticCurveTo(r*.6,-r*.9,r*.5,-r*.55);g.stroke();g.strokeStyle='#e0b07a88';g.lineWidth=r*.08;g.beginPath();g.moveTo(-r*.45,-r*.1);g.quadraticCurveTo(0,r*.05,r*.45,-r*.1);g.stroke();break;}
     case 'krug':{g.fillStyle='#c07a44';g.beginPath();g.ellipse(0,r*.15,r*.6,r*.7,0,0,7);g.fill();g.fillRect(-r*.25,-r*.75,r*.5,r*.4);g.strokeStyle='#7a3a1a';g.lineWidth=1.3;g.stroke();break;}
     case 'brot':{g.fillStyle='#c98a3e';g.beginPath();g.arc(0,0,r*.8,0,7);g.fill();g.strokeStyle='#8a5a22';g.lineWidth=1.5;g.stroke();for(let k=0;k<8;k++){const a=k*Math.PI/4;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*r*.8,Math.sin(a)*r*.8);g.stroke();}break;}
     case 'oliven':{g.fillStyle='#8a5a2e';g.beginPath();g.ellipse(0,r*.3,r*.85,r*.4,0,0,Math.PI);g.fill();g.fillStyle='#5a6a2a';for(let k=0;k<6;k++){g.beginPath();g.ellipse(-r*.5+k*r*.2,r*.15-(k%2)*r*.15,r*.16,r*.12,0,0,7);g.fill();}g.fillStyle='#3a2a18';g.beginPath();g.ellipse(-r*.1,r*.02,r*.14,r*.1,0,0,7);g.fill();break;}
     case 'kohl':{g.fillStyle='#7a9a4a';g.beginPath();g.arc(0,0,r*.8,0,7);g.fill();g.strokeStyle='#4a6a2a';g.lineWidth=1.5;g.stroke();g.beginPath();g.arc(-r*.2,0,r*.5,-1,1.4);g.stroke();g.beginPath();g.arc(r*.25,r*.05,r*.45,1.8,4.4);g.stroke();break;}
     case 'kaese':{g.fillStyle='#e8cf7a';g.beginPath();g.moveTo(-r*.8,r*.4);g.lineTo(r*.8,r*.4);g.lineTo(r*.2,-r*.5);g.closePath();g.fill();g.strokeStyle='#a88a3a';g.lineWidth=1.3;g.stroke();g.fillStyle='#c9ad5a';g.beginPath();g.arc(0,r*.1,r*.1,0,7);g.arc(r*.35,r*.25,r*.07,0,7);g.fill();break;}
     case 'muenzen':{for(let k=0;k<3;k++){const gr=g.createRadialGradient(-r*.1+k*r*.3-r*.3,-r*.1,1,k*r*.3-r*.3,0,r*.4);gr.addColorStop(0,'#fbe4a0');gr.addColorStop(1,'#a8742a');g.fillStyle=gr;g.beginPath();g.arc(k*r*.3-r*.3,(k%2)*r*.2,r*.38,0,7);g.fill();g.strokeStyle='#6e4a14';g.lineWidth=1;g.stroke();}break;}
     case 'schriftrolle':{const w=it.label?Math.max(r*3,it.tw+r*1.2):r*2;g.fillStyle='#efe2c4';g.fillRect(-w/2,-r*.45,w,r*.9);g.strokeStyle='#8a6a3a';g.lineWidth=1.3;g.strokeRect(-w/2,-r*.45,w,r*.9);g.fillStyle='#c9a86b';g.beginPath();g.ellipse(-w/2,0,r*.18,r*.55,0,0,7);g.ellipse(w/2,0,r*.18,r*.55,0,0,7);g.fill();g.stroke();
      if(it.label){g.fillStyle='#3a2610';g.font=`600 ${Math.round(r*.62)}px Georgia,serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(it.label,0,1);}else{g.strokeStyle='#8c3a2266';g.beginPath();g.moveTo(-w*.3,-r*.1);g.lineTo(w*.3,-r*.1);g.moveTo(-w*.3,r*.15);g.lineTo(w*.2,r*.15);g.stroke();}break;}
     case 'korb':{g.fillStyle='#b08a4e';g.beginPath();g.moveTo(-r*.8,-r*.3);g.lineTo(r*.8,-r*.3);g.lineTo(r*.6,r*.6);g.lineTo(-r*.6,r*.6);g.closePath();g.fill();g.strokeStyle='#6b4a22';g.lineWidth=1.3;g.stroke();for(let k=0;k<3;k++){g.beginPath();g.moveTo(-r*.75,-r*.05+k*r*.22);g.lineTo(r*.75,-r*.05+k*r*.22);g.stroke();}g.beginPath();g.arc(0,-r*.3,r*.55,Math.PI,0);g.stroke();break;}
     case 'besen':{g.strokeStyle='#8a6a3e';g.lineWidth=r*.14;g.beginPath();g.moveTo(0,-r*1.2);g.lineTo(0,r*.3);g.stroke();g.fillStyle='#c9a45a';g.beginPath();g.moveTo(-r*.2,r*.2);g.lineTo(r*.2,r*.2);g.lineTo(r*.5,r*1.1);g.lineTo(-r*.5,r*1.1);g.fill();g.strokeStyle='#8a6a2a';g.lineWidth=1;for(let k=-2;k<=2;k++){g.beginPath();g.moveTo(k*r*.06,r*.25);g.lineTo(k*r*.2,r*1.05);g.stroke();}break;}
     case 'sandale':{g.fillStyle='#8a5a2e';g.beginPath();g.ellipse(0,0,r*.4,r*.9,0,0,7);g.fill();g.strokeStyle='#5a3a1c';g.lineWidth=r*.1;g.beginPath();g.moveTo(-r*.35,-r*.2);g.lineTo(r*.35,r*.1);g.moveTo(r*.35,-r*.2);g.lineTo(-r*.35,r*.1);g.moveTo(-r*.3,r*.4);g.lineTo(r*.3,r*.4);g.stroke();break;}
     case 'taube':{const f=Math.sin((t||0)*20)*.6;g.fillStyle='#8a8f96';g.beginPath();g.ellipse(0,0,r*.6,r*.35,0,0,7);g.fill();g.fillStyle='#a9aeb4';g.beginPath();g.moveTo(-r*.1,0);g.quadraticCurveTo(-r*.3,-r*(.4+f),r*.3,-r*(.2+f*.8));g.lineTo(r*.2,0);g.fill();g.fillStyle='#6d737a';g.beginPath();g.arc(r*.55,-r*.18,r*.2,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(r*.6,-r*.22,r*.07,0,7);g.fill();g.fillStyle='#222';g.beginPath();g.arc(r*.62,-r*.22,r*.035,0,7);g.fill();g.fillStyle='#d9a441';g.beginPath();g.moveTo(r*.72,-r*.18);g.lineTo(r*.86,-r*.14);g.lineTo(r*.72,-r*.1);g.fill();break;}
    }
    g.restore();}
   function isGood(it){if(round===0)return it.kind==='amphore';if(round===1)return FOOD.includes(it.kind);if(round===2)return it.kind==='schriftrolle'&&it.term&&it.ok;return false;}
   function spawn(){const {W,shelf,H}=L();const r=H*.042;const R=Math.random();let kind,it;
    if(round===0)kind=R<.62?'amphore':R<.9?['brot','korb','krug','muenzen'][Math.floor(Math.random()*4)]:FUNNY[Math.floor(Math.random()*FUNNY.length)];
    else if(round===1)kind=R<.55?FOOD[Math.floor(Math.random()*4)]:R<.92?['muenzen','schriftrolle','korb','amphore','krug'][Math.floor(Math.random()*5)]:['sandale','besen','taube'][Math.floor(Math.random()*3)];
    else kind=R<.72?'schriftrolle':R<.9?'amphore':FUNNY[Math.floor(Math.random()*FUNNY.length)];
    it={kind,x:W*(.1+Math.random()*.8),y:shelf,vx:(Math.random()-.5)*W*.05,vy:-H*.1*Math.random(),rot:(Math.random()-.5),vr:(Math.random()-.5)*3,r,gf:.55+Math.random()*.45,st:'fall',t:0};
    if(kind==='schriftrolle'&&round===2){const ok=Math.random()<.62;if(ok){it.term=TERMS_OK[Math.floor(Math.random()*4)];it.ok=true;stats.termsAll++;}else{const n=TERMS_NO[Math.floor(Math.random()*3)];it.term=n[0];it.why=n[1];it.ok=false;}it.label=it.term;g.font=`600 ${Math.round(r*.62)}px Georgia,serif`;it.tw=g.measureText(it.label).width;it.vr*=.25;it.rot*=.3;it.gf*=.8;}
    if(kind==='amphore')stats.amphAll++;
    items.push(it);wobble=1;}
   function merchantSay(text,ms=2200){shout={text,t:0,ms:ms/1000};}
   function catchIt(it){const good=isGood(it);it.st='caught';it.t=0;squash=1;
    if(it.kind==='taube'){it.st='flyaway';it.vx=(Math.random()<.5?-1:1)*view.W*.4;it.vy=-view.H*.8;merchantSay('Gurr? … Die wollte wohl nur kurz ausruhen.',2200);return;}
    if(round===0){if(it.kind==='amphore'){stats.amph++;}else if(FUNNY.includes(it.kind))merchantSay(it.kind==='sandale'?'Eine Sandale? Die ist nicht von mir!':it.kind==='kohl'?'Ein Kohlkopf … auch gut.':'Mein Besen! Danke.',1800);}
    else if(round===1){if(good)stats.food++;else{stats.wrong++;merchantSay(it.kind==='muenzen'?'Münzen sind schön – aber kein Essen!':'Das ist doch kein Essen!',1800);}}
    else if(round===2){if(it.kind==='schriftrolle'){if(it.ok){stats.terms++;merchantSay(`„${it.term}“ – ja, das gehört zu 303.`,1800);}else{stats.wrong++;merchantSay('Das gehört doch in eine andere Zeit! '+it.why,3000);}}}}
   function breakIt(it){it.st='broken';it.t=0;const n=it.kind==='amphore'?9:4;for(let k=0;k<n;k++)parts.push({x:it.x,y:L().ground-4,vx:(Math.random()-.5)*view.W*.18,vy:-Math.random()*view.H*.35,rot:Math.random()*6,vr:(Math.random()-.5)*12,s:it.r*(.18+Math.random()*.25),c:it.kind==='amphore'||it.kind==='krug'?'#b5673a':'#c9ad7f',t:0,shard:it.kind==='amphore'||it.kind==='krug'});}
   /* Steuerung */
   let drag=null;
   ctx.on(view.canvas,'pointerdown',e=>{const r=view.canvas.getBoundingClientRect();const x=(e.clientX-r.left)/r.width;drag={id:e.pointerId,sx:x,moved:false,start:performance.now()};try{view.canvas.setPointerCapture(e.pointerId);}catch(_){}});
   ctx.on(view.canvas,'pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const r=view.canvas.getBoundingClientRect();const x=(e.clientX-r.left)/r.width;if(Math.abs(x-drag.sx)>.01)drag.moved=true;if(drag.moved)tx=Math.max(.06,Math.min(.94,x));});
   ctx.on(view.canvas,'pointerup',e=>{if(drag&&!drag.moved){const r=view.canvas.getBoundingClientRect();const x=(e.clientX-r.left)/r.width;tx=Math.max(.06,Math.min(.94,tx+(x<bx?-.18:.18)));}drag=null;});
   ctx.on(view.canvas,'pointercancel',()=>{drag=null;});
   ctx.on(window,'keydown',e=>{if(!ctx.running)return;if(['ArrowLeft','a','A'].includes(e.key)){keyDir=-1;e.preventDefault();}if(['ArrowRight','d','D'].includes(e.key)){keyDir=1;e.preventDefault();}});
   ctx.on(window,'keyup',e=>{if(['ArrowLeft','a','A','ArrowRight','d','D'].includes(e.key))keyDir=0;});
   function update(dt,t){const {W,H,ground,bw,by}=L();
    if(!ended){roundT-=dt;if(round<0||roundT<=0){if(round>=ROUNDS.length-1){if(!items.some(i=>i.st==='fall')){ended=true;finish();}}else{round++;roundT=ROUNDS[round].dur;ctx.setTask(ROUNDS[round].task);ctx.say(ROUNDS[round].title,2400);spawnT=1.4;}}
     if(roundT>0){spawnT-=dt;if(spawnT<=0){spawn();spawnT=(round===2?1.25:.95)*(.8+Math.random()*.5);}}}
    if(keyDir)tx=Math.max(.06,Math.min(.94,tx+keyDir*dt*.9));
    bx+=(tx-bx)*Math.min(1,dt*18);squash=Math.max(0,squash-dt*4);wobble=Math.max(0,wobble-dt*1.5);
    const bxp=bx*W;
    items.forEach(it=>{it.t+=dt;
     if(it.st==='fall'){const py=it.y;it.vy+=H*1.1*it.gf*dt;it.vy=Math.min(it.vy,H*.9);it.x+=it.vx*dt;it.y+=it.vy*dt;it.rot+=it.vr*dt;if(it.x<it.r){it.x=it.r;it.vx=Math.abs(it.vx);}if(it.x>W-it.r){it.x=W-it.r;it.vx=-Math.abs(it.vx);}
      const rim=by-bw*.08;if(py<=rim&&it.y>=rim&&Math.abs(it.x-bxp)<bw*.5+it.r*.3){catchIt(it);return;}
      if(it.y>=ground-it.r*.8){it.y=ground-it.r*.8;if(it.kind==='amphore'||it.kind==='krug')breakIt(it);else if(it.kind==='taube'){it.st='flyaway';it.vx=W*.3;it.vy=-H*.6;}else{it.st='ground';it.vy=-it.vy*.35;it.vx*=.5;}}}
     else if(it.st==='ground'){it.vy+=H*1.1*dt;it.y+=it.vy*dt;it.x+=it.vx*dt;it.rot+=it.vx*.01*dt;if(it.y>ground-it.r*.8){it.y=ground-it.r*.8;it.vy=-it.vy*.3;it.vx*=.8;}}
     else if(it.st==='flyaway'){it.x+=it.vx*dt;it.y+=it.vy*dt;it.vy+=H*.2*dt;}});
    // gelegentliche Zusammenstöße fallender Dinge
    const fall=items.filter(i=>i.st==='fall');for(let a=0;a<fall.length;a++)for(let b=a+1;b<fall.length;b++){const A=fall[a],B=fall[b];const dx=B.x-A.x,dy=B.y-A.y,d=Math.hypot(dx,dy),m=(A.r+B.r)*.8;if(d>0&&d<m){const nx=dx/d,ny=dy/d,push=(m-d)/2;A.x-=nx*push;A.y-=ny*push;B.x+=nx*push;B.y+=ny*push;const va=A.vx,vb=B.vx;A.vx=vb*.8-nx*20;B.vx=va*.8+nx*20;A.vr+=2;B.vr-=2;}}
    items=items.filter(i=>!(i.st==='caught'&&i.t>.35)&&!(i.st==='broken')&&!(i.st==='ground'&&i.t>2.8)&&!(i.st==='flyaway'&&i.y<-100));
    parts.forEach(p=>{p.t+=dt;p.vy+=H*1.4*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;if(p.y>ground){p.y=ground;p.vy*=-.3;p.vx*=.6;p.vr*=.5;}});parts=parts.filter(p=>p.t<2.2);
    if(shout){shout.t+=dt;if(shout.t>shout.ms)shout=null;}
   }
   function finish(){ctx.after(900,()=>ctx.win({title:'Marktstand gerettet.',lines:[`Amphoren gerettet: ${stats.amph} von ${stats.amphAll}`,`Begriffe zur Verfolgung ab 303: ${stats.terms}`],html:'<div class="schild-comment"><span class="amph-face" aria-hidden="true"></span><p><b>Der Händler:</b> „Fast alles noch heil. Das zählt.“</p></div><div class="bonus-history"><h4>Zur Erinnerung</h4><p>Ab 303 ließ Kaiser Diokletian Gottesdienste verbieten, Kirchen zerstören, christliche Schriften vernichten und Geistliche verhaften.</p></div>',backLabel:'Zurück zum Forum'}));}
   function draw(t){if(!view.W)return;const {W,H,ground,mh,bw,by}=L();
    if(bgc)g.drawImage(bgc,0,0,W,H);else{g.fillStyle='#d9c49a';g.fillRect(0,0,W,H);}
    stall(t);
    parts.forEach(p=>{g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.globalAlpha=Math.min(1,2.2-p.t);g.fillStyle=p.c;g.beginPath();if(p.shard){g.moveTo(-p.s,-p.s*.4);g.lineTo(p.s*.8,-p.s*.6);g.lineTo(p.s*.3,p.s*.6);}else g.arc(0,0,p.s*.6,0,7);g.fill();g.restore();});
    const bxp=bx*W;
    items.forEach(it=>{if(it.st==='caught')return;drawItem(it,it.x,it.y,t);});
    // Händler mit Korb
    const im=imgs.people;const w=mh*HAENDLER[1]/300;g.save();g.translate(bxp,ground);g.fillStyle='#00000040';g.beginPath();g.ellipse(0,0,w*.5,mh*.05,0,0,7);g.fill();
    if(im)g.drawImage(im,HAENDLER[0],0,HAENDLER[1],300,-w/2,-mh,w,mh);g.restore();
    items.forEach(it=>{if(it.st!=='caught')return;const e=Math.min(1,it.t/.35);drawItem({...it,r:it.r*(1-e*.5)},it.x+(bxp-it.x)*e,it.y+(by-it.y)*e+e*10,t);});
    const sq=1+squash*.08;g.save();g.translate(bxp,by);g.scale(sq,2-sq);g.fillStyle='#9a7440';g.beginPath();g.moveTo(-bw/2,-bw*.08);g.lineTo(bw/2,-bw*.08);g.lineTo(bw*.38,bw*.34);g.lineTo(-bw*.38,bw*.34);g.closePath();g.fill();g.strokeStyle='#5a3a1c';g.lineWidth=2;g.stroke();
    g.strokeStyle='#6b4a22';g.lineWidth=1.3;for(let k=0;k<4;k++){g.beginPath();g.moveTo(-bw*.47+k*bw*.02,-bw*.02+k*bw*.09);g.lineTo(bw*.47-k*bw*.02,-bw*.02+k*bw*.09);g.stroke();}
    g.fillStyle='#c9a45a';g.beginPath();g.ellipse(0,-bw*.08,bw/2,bw*.07,0,0,7);g.fill();g.strokeStyle='#5a3a1c';g.stroke();g.restore();
    // Sprechblase des Händlers
    if(shout){const a=Math.min(1,shout.t*6,(shout.ms-shout.t)*4);g.save();g.globalAlpha=a;g.font=`${Math.round(Math.max(15,H*.03))}px Georgia,serif`;const lines=wrap(shout.text,W*.34);const lh=Math.max(18,H*.037);const bw2=Math.max(...lines.map(l=>g.measureText(l).width))+26,bh=lines.length*lh+16;let x=bxp+(bxp>W/2?-bw2-w*.3:w*.3),y=ground-mh*1.05-bh;x=Math.max(8,Math.min(W-bw2-8,x));
     g.fillStyle='#fff8e6';g.strokeStyle='#c9a86b';g.lineWidth=2;g.beginPath();g.roundRect?g.roundRect(x,y,bw2,bh,10):g.rect(x,y,bw2,bh);g.fill();g.stroke();g.fillStyle='#3a2610';g.textBaseline='top';lines.forEach((l,i)=>g.fillText(l,x+13,y+8+i*lh));g.restore();}
   }
   function wrap(text,max){const words=text.split(' ');const out=[];let cur='';for(const w of words){const test=cur?cur+' '+w:w;if(g.measureText(test).width>max&&cur){out.push(cur);cur=w;}else cur=test;}if(cur)out.push(cur);return out;}
   ctx.loop({update,draw});
   ctx.stage.__debug={items:()=>items,stats:()=>stats,L,setX:v=>{tx=v;bx=v;},round:()=>round,ended:()=>ended};
   reset();
   return {start(){reset();}};
  }
 });
})();
