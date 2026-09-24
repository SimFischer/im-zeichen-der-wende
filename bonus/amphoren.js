'use strict';
/* Bonusspiel 4: Amphoren-Chaos – Rette die Ladung!
   Römischer Hafen- und Lagerhausbereich. Der Händler steht groß im Vordergrund und fängt mit
   seinem Korb auf, was vom Lastkran und aus den Regalen fällt. Keine Leben: Falsches bringt nur
   einen Spruch, Zerbrochenes nur Scherben.
   Grafiken: assets/minigames/amphora/ (Hintergrund, Händler als eigene Figur, Gegenstände).
   Fehlt eine Datei, zeichnet das Spiel einen neutralen Ersatz. */
(()=>{
 if(!window.BonusGames)return;
 const ART={dock:'assets/minigames/amphora/amphora-dock.png',merchant:'assets/minigames/amphora/amphora-merchant.png',items:'assets/minigames/amphora/amphora-assets.png'};
 // Ausschnitte im Gegenstandsbogen (Pixel im Original 1672 × 941)
 const SHEET={
  amphoren:[[74,7,211,331],[316,52,141,286],[497,92,148,246],[678,104,141,234],[868,113,142,225],[1054,141,118,197],[1434,140,113,198]],
  krug:[1205,143,190,200],korb:[42,365,252,156],kiste:[990,376,205,151],sack:[1468,640,140,132],fass:[1501,535,99,112],
  fangkorb:[524,377,233,146]};
 const FOOD=['brot','oliven','kohl','kaese'];
 const FUNNY=['sandale','kohl','besen','taube'];
 const TERMS_OK=['Gottesdienstverbot','Schriften vernichten','Kirchen zerstören','Verhaftungen'];
 const TERMS_NO=[['Mailand 313','313 kam die Mailänder Vereinbarung – das Ende der Verfolgung.'],['Konzil 325','325 tagte das Konzil von Nicäa – lange nach der Verfolgung.'],['Nero','Nero regierte im 1. Jahrhundert.']];
 const ROUNDS=[{dur:24,title:'Rette die Amphoren!',task:'Auftrag 1: Rette die Amphoren!'},{dur:24,title:'Sammle Lebensmittel!',task:'Auftrag 2: Sammle Lebensmittel!'},{dur:30,title:'Sammle alles, was zur großen Verfolgung ab 303 gehört.',task:'Auftrag 3: Was gehört zur großen Verfolgung ab 303?'}];
 function load(src){return new Promise(res=>{if(typeof Image==='undefined'){res(null);return;}const i=new Image();i.onload=()=>res(i);i.onerror=()=>res(null);i.src=src;});}

 window.BonusGames.register({
  id:'amphoren',title:'Amphoren-Chaos',kicker:'Bonusspiel · Im Hafenlager',scene:'forum',
  spot:[9,63,'Wackeliger Marktkarren'],
  art:ART,
  intro:{text:'Im Hafenlager gerät die Ladung ins Rutschen! Amphoren, Brot, Oliven, Münzen und Schriftrollen fallen vom Kran und aus den Regalen. Hilf dem Händler, mit seinem großen Korb das Richtige aufzufangen.',
   controls:['<b>Finger</b> waagerecht über das Spielfeld ziehen: Der Händler folgt direkt.','Oder links bzw. rechts neben den Händler tippen<span class="mg-keys"> – am PC auch Pfeiltasten</span>.','Drei kurze Aufträge. Falsch Gefangenes kostet nichts.'],start:'Ans Lager!'},
  setup(ctx){
   const view=ctx.canvas({maxDpr:2}),g=view.g;const imgs={dock:null,merchant:null,items:null};let bgc=null;
   const loaded={dock:false,merchant:false,items:false};
   Promise.all([load(ART.dock),load(ART.merchant),load(ART.items)]).then(([d,m,it])=>{imgs.dock=d;imgs.merchant=m;imgs.items=it;loaded.dock=!!d;loaded.merchant=!!m;loaded.items=!!it;prepare();});
   let items=[],parts=[],round=-1,roundT=0,spawnT=0,bx=.5,tx=.5,squash=0,stats=null,shout=null,ended=false,keyDir=0,walk=0,face=1,crane=0;
   // Maße: Händler 30 % der Spielfeldhöhe, Gegenstände deutlich größer als früher
   const L=()=>{const W=view.W,H=view.H;const ground=H*.93,mh=H*.34;const mw=imgs.merchant?mh*imgs.merchant.width/imgs.merchant.height:mh*.52;const bw=Math.max(120,mw*1.6);return {W,H,ground,mh,mw,bw,bh:bw*146/233,rim:ground-mh*.64,r:Math.max(26,H*.068)};};
   function reset(){items=[];parts=[];round=-1;roundT=0;spawnT=1;bx=tx=.5;squash=0;ended=false;shout=null;stats={amph:0,amphAll:0,food:0,terms:0,termsAll:0,wrong:0};}
   view.resize=()=>prepare();
   function prepare(){if(!view.W)return;const {W,H}=L();bgc=document.createElement('canvas');bgc.width=Math.round(W*view.dpr);bgc.height=Math.round(H*view.dpr);const o=bgc.getContext('2d');o.scale(view.dpr,view.dpr);
    if(imgs.dock){const sc=Math.max(W/imgs.dock.width,H/imgs.dock.height);o.drawImage(imgs.dock,(W-imgs.dock.width*sc)/2,(H-imgs.dock.height*sc)*.85,imgs.dock.width*sc,imgs.dock.height*sc);
     // leichte Abdunklung der oberen Bildhälfte, damit fallende Dinge gut lesbar sind
     o.fillStyle='rgba(40,26,12,.22)';o.fillRect(0,0,W,H);const gr=o.createLinearGradient(0,0,0,H);gr.addColorStop(0,'rgba(30,20,10,.2)');gr.addColorStop(.6,'rgba(30,20,10,0)');o.fillStyle=gr;o.fillRect(0,0,W,H);}
    else{ // neutraler Ersatz: Himmel, Lagerwand, Kai
     const sky=o.createLinearGradient(0,0,0,H*.5);sky.addColorStop(0,'#8fb3c9');sky.addColorStop(1,'#d9c9a3');o.fillStyle=sky;o.fillRect(0,0,W,H);
     o.fillStyle='#b8a47e';o.fillRect(W*.45,H*.08,W*.55,H*.62);for(let k=0;k<4;k++){o.fillStyle='#8a7050';o.fillRect(W*(.5+k*.12),H*.2,W*.06,H*.5);}
     o.fillStyle='#a8906a';o.fillRect(0,H*.7,W,H*.3);o.strokeStyle='#7a6448';o.lineWidth=2;for(let x=0;x<W;x+=70){o.beginPath();o.moveTo(x,H*.7);o.lineTo(x+30,H);o.stroke();}}
   }
   /* Gegenstände */
   function sheet(o,rect,x,y,h,rot=0,alpha=1){if(!imgs.items)return false;const [sx,sy,sw,sh]=rect;const w=h*sw/sh;o.save();o.globalAlpha=alpha;o.translate(x,y);o.rotate(rot);o.drawImage(imgs.items,sx,sy,sw,sh,-w/2,-h/2,w,h);o.restore();return true;}
   function drawItem(it,x,y,t,scale=1){const r=it.r*scale;
    if(it.kind==='amphore'&&sheet(g,SHEET.amphoren[it.v%SHEET.amphoren.length],x,y,r*2.6,it.rot))return;
    if(it.kind==='krug'&&sheet(g,SHEET.krug,x,y,r*2,it.rot))return;
    if(it.kind==='korb'&&sheet(g,SHEET.korb,x,y,r*1.5,it.rot))return;
    if(it.kind==='kiste'&&sheet(g,SHEET.kiste,x,y,r*1.6,it.rot))return;
    if(it.kind==='sack'&&sheet(g,SHEET.sack,x,y,r*1.8,it.rot))return;
    g.save();g.translate(x,y);g.rotate(it.rot||0);
    switch(it.kind){
     case 'amphore':case 'krug':{g.fillStyle='#b5673a';g.beginPath();g.moveTo(-r*.25,-r*1.1);g.lineTo(r*.25,-r*1.1);g.quadraticCurveTo(r*.3,-r*.8,r*.55,-r*.5);g.quadraticCurveTo(r*.7,r*.3,r*.1,r*1.1);g.lineTo(-r*.1,r*1.1);g.quadraticCurveTo(-r*.7,r*.3,-r*.55,-r*.5);g.quadraticCurveTo(-r*.3,-r*.8,-r*.25,-r*1.1);g.fill();g.strokeStyle='#7a3a1a';g.lineWidth=2;g.stroke();break;}
     case 'korb':case 'kiste':case 'sack':{g.fillStyle=it.kind==='sack'?'#c9a86b':'#8a6a3e';g.fillRect(-r*.8,-r*.55,r*1.6,r*1.1);g.strokeStyle='#4a321c';g.lineWidth=2;g.strokeRect(-r*.8,-r*.55,r*1.6,r*1.1);break;}
     case 'brot':{g.fillStyle='#c98a3e';g.beginPath();g.ellipse(0,0,r*.85,r*.7,0,0,7);g.fill();g.strokeStyle='#8a5a22';g.lineWidth=2;g.stroke();for(let k=0;k<8;k++){const a=k*Math.PI/4;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*r*.8,Math.sin(a)*r*.65);g.stroke();}g.fillStyle='#e0a860';g.beginPath();g.ellipse(-r*.25,-r*.25,r*.25,r*.12,-.5,0,7);g.fill();break;}
     case 'oliven':{g.fillStyle='#8a5a2e';g.beginPath();g.ellipse(0,r*.25,r*.95,r*.45,0,0,Math.PI);g.fill();g.fillRect(-r*.95,r*.2,r*1.9,r*.1);g.fillStyle='#5a6a2a';for(let k=0;k<7;k++){g.beginPath();g.ellipse(-r*.6+k*r*.2,r*.12-(k%2)*r*.16,r*.17,r*.12,0,0,7);g.fill();}g.fillStyle='#3a2a18';g.beginPath();g.ellipse(-r*.1,-r*.02,r*.15,r*.11,0,0,7);g.fill();break;}
     case 'kohl':{g.fillStyle='#7a9a4a';g.beginPath();g.arc(0,0,r*.8,0,7);g.fill();g.strokeStyle='#4a6a2a';g.lineWidth=2;g.stroke();g.beginPath();g.arc(-r*.2,0,r*.5,-1,1.4);g.stroke();g.beginPath();g.arc(r*.25,r*.05,r*.45,1.8,4.4);g.stroke();break;}
     case 'kaese':{g.fillStyle='#e8cf7a';g.beginPath();g.moveTo(-r*.85,r*.45);g.lineTo(r*.85,r*.45);g.lineTo(r*.2,-r*.55);g.closePath();g.fill();g.strokeStyle='#a88a3a';g.lineWidth=2;g.stroke();g.fillStyle='#c9ad5a';g.beginPath();g.arc(0,r*.1,r*.1,0,7);g.arc(r*.35,r*.25,r*.07,0,7);g.fill();break;}
     case 'muenzen':{for(let k=0;k<3;k++){const cx=k*r*.36-r*.36,cy=(k%2)*r*.22;const gr=g.createRadialGradient(cx-r*.1,cy-r*.1,1,cx,cy,r*.42);gr.addColorStop(0,'#fbe4a0');gr.addColorStop(1,'#a8742a');g.fillStyle=gr;g.beginPath();g.arc(cx,cy,r*.4,0,7);g.fill();g.strokeStyle='#6e4a14';g.lineWidth=1.5;g.stroke();}break;}
     case 'schriftrolle':{const w=it.label?Math.max(r*3.2,it.tw+r*1.3):r*2.2,h=it.label?r*1.05:r*.9;g.fillStyle='#f1e2bf';g.fillRect(-w/2,-h/2,w,h);g.strokeStyle='#8a6a3a';g.lineWidth=2;g.strokeRect(-w/2,-h/2,w,h);g.fillStyle='#c9a86b';g.beginPath();g.ellipse(-w/2,0,r*.2,h*.62,0,0,7);g.ellipse(w/2,0,r*.2,h*.62,0,0,7);g.fill();g.stroke();
      if(it.label){g.fillStyle='#3a2610';g.font=`700 ${Math.round(r*.56)}px Georgia,serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(it.label,0,1);}else{g.strokeStyle='#8c3a2288';g.beginPath();g.moveTo(-w*.3,-h*.12);g.lineTo(w*.3,-h*.12);g.moveTo(-w*.3,h*.16);g.lineTo(w*.2,h*.16);g.stroke();}break;}
     case 'besen':{g.strokeStyle='#8a6a3e';g.lineWidth=r*.15;g.beginPath();g.moveTo(0,-r*1.3);g.lineTo(0,r*.3);g.stroke();g.fillStyle='#c9a45a';g.beginPath();g.moveTo(-r*.22,r*.2);g.lineTo(r*.22,r*.2);g.lineTo(r*.55,r*1.2);g.lineTo(-r*.55,r*1.2);g.fill();g.strokeStyle='#8a6a2a';g.lineWidth=1.2;for(let k=-2;k<=2;k++){g.beginPath();g.moveTo(k*r*.06,r*.25);g.lineTo(k*r*.22,r*1.15);g.stroke();}break;}
     case 'sandale':{g.fillStyle='#8a5a2e';g.beginPath();g.ellipse(0,0,r*.42,r*.95,0,0,7);g.fill();g.strokeStyle='#5a3a1c';g.lineWidth=r*.11;g.beginPath();g.moveTo(-r*.36,-r*.2);g.lineTo(r*.36,r*.1);g.moveTo(r*.36,-r*.2);g.lineTo(-r*.36,r*.1);g.moveTo(-r*.3,r*.4);g.lineTo(r*.3,r*.4);g.stroke();break;}
     case 'taube':{const f=Math.sin((t||0)*20)*.6;g.fillStyle='#8a8f96';g.beginPath();g.ellipse(0,0,r*.65,r*.38,0,0,7);g.fill();g.fillStyle='#a9aeb4';g.beginPath();g.moveTo(-r*.1,0);g.quadraticCurveTo(-r*.3,-r*(.45+f),r*.3,-r*(.25+f*.8));g.lineTo(r*.2,0);g.fill();g.fillStyle='#6d737a';g.beginPath();g.arc(r*.6,-r*.2,r*.22,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(r*.66,-r*.25,r*.08,0,7);g.fill();g.fillStyle='#222';g.beginPath();g.arc(r*.68,-r*.25,r*.04,0,7);g.fill();g.fillStyle='#d9a441';g.beginPath();g.moveTo(r*.8,-r*.2);g.lineTo(r*.95,-r*.15);g.lineTo(r*.8,-r*.1);g.fill();break;}
    }
    g.restore();}
   function isGood(it){if(round===0)return it.kind==='amphore';if(round===1)return FOOD.includes(it.kind);if(round===2)return it.kind==='schriftrolle'&&!!it.term&&it.ok;return false;}
   function spawn(){const {W,r}=L();const R=Math.random();let kind;
    if(round===0)kind=R<.6?'amphore':R<.88?['brot','korb','krug','kiste','sack'][Math.floor(Math.random()*5)]:FUNNY[Math.floor(Math.random()*FUNNY.length)];
    else if(round===1)kind=R<.55?FOOD[Math.floor(Math.random()*4)]:R<.9?['muenzen','schriftrolle','amphore','krug','sack'][Math.floor(Math.random()*5)]:['sandale','besen','taube'][Math.floor(Math.random()*3)];
    else kind=R<.72?'schriftrolle':R<.88?'amphore':FUNNY[Math.floor(Math.random()*FUNNY.length)];
    const it={kind,v:Math.floor(Math.random()*7),x:W*(.12+Math.random()*.76),y:-r*1.4,vx:(Math.random()-.5)*W*.04,vy:0,rot:(Math.random()-.5)*.6,vr:(Math.random()-.5)*2.4,r,gf:.5+Math.random()*.4,st:'fall',t:0};
    if(kind==='schriftrolle'&&round===2){if(Math.random()<.62){it.term=TERMS_OK[Math.floor(Math.random()*4)];it.ok=true;stats.termsAll++;}else{const n=TERMS_NO[Math.floor(Math.random()*3)];it.term=n[0];it.why=n[1];it.ok=false;}
     it.label=it.term;g.font=`700 ${Math.round(r*.56)}px Georgia,serif`;it.tw=g.measureText(it.label).width;it.vr*=.2;it.rot*=.25;it.gf*=.8;
     it.x=Math.max(it.tw/2+r,Math.min(W-it.tw/2-r,it.x));}
    if(kind==='amphore')stats.amphAll++;
    items.push(it);crane=1;}
   function merchantSay(text,ms=2200){shout={text,t:0,ms:ms/1000};}
   function catchIt(it){const good=isGood(it);it.st='caught';it.t=0;squash=1;
    if(it.kind==='taube'){it.st='flyaway';it.vx=(Math.random()<.5?-1:1)*view.W*.4;it.vy=-view.H*.8;merchantSay('Gurr? … Die wollte wohl nur kurz ausruhen.',2200);return;}
    if(round===0){if(it.kind==='amphore')stats.amph++;else if(FUNNY.includes(it.kind))merchantSay(it.kind==='sandale'?'Eine Sandale? Die ist nicht von mir!':it.kind==='kohl'?'Ein Kohlkopf … auch gut.':'Mein Besen! Danke.',1800);}
    else if(round===1){if(good)stats.food++;else{stats.wrong++;merchantSay(it.kind==='muenzen'?'Münzen sind schön – aber kein Essen!':'Das ist doch kein Essen!',1800);}}
    else if(round===2&&it.kind==='schriftrolle'){if(it.ok){stats.terms++;merchantSay(`„${it.term}“ – ja, das gehört zu 303.`,1800);}else{stats.wrong++;merchantSay('Das gehört doch in eine andere Zeit! '+it.why,3000);}}}
   function breakIt(it){it.st='broken';it.t=0;const n=it.kind==='amphore'||it.kind==='krug'?11:5;for(let k=0;k<n;k++)parts.push({x:it.x,y:L().ground-6,vx:(Math.random()-.5)*view.W*.2,vy:-Math.random()*view.H*.4,rot:Math.random()*6,vr:(Math.random()-.5)*12,s:it.r*(.22+Math.random()*.28),c:it.kind==='amphore'||it.kind==='krug'?'#b5673a':'#c9ad7f',t:0,shard:it.kind==='amphore'||it.kind==='krug'});}
   /* Steuerung: Pointer Events, Finger folgt direkt; Tippen = Schritt */
   let drag=null;
   const relX=e=>{const r=view.canvas.getBoundingClientRect();return (e.clientX-r.left)/(r.width||1);};
   ctx.on(view.canvas,'pointerdown',e=>{drag={id:e.pointerId,sx:relX(e),moved:false};try{view.canvas.setPointerCapture(e.pointerId);}catch(_){}});
   ctx.on(view.canvas,'pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const x=relX(e);if(Math.abs(x-drag.sx)>.01)drag.moved=true;if(drag.moved)tx=Math.max(.07,Math.min(.93,x));});
   ctx.on(view.canvas,'pointerup',e=>{if(drag&&!drag.moved){const x=relX(e);tx=Math.max(.07,Math.min(.93,tx+(x<bx?-.18:.18)));}drag=null;});
   ctx.on(view.canvas,'pointercancel',()=>{drag=null;});
   ctx.on(window,'keydown',e=>{if(!ctx.running)return;if(['ArrowLeft','a','A'].includes(e.key)){keyDir=-1;e.preventDefault();}if(['ArrowRight','d','D'].includes(e.key)){keyDir=1;e.preventDefault();}});
   ctx.on(window,'keyup',e=>{if(['ArrowLeft','a','A','ArrowRight','d','D'].includes(e.key))keyDir=0;});
   function update(dt,t){const {W,H,ground,rim,bw}=L();
    if(!ended){roundT-=dt;if(round<0||roundT<=0){if(round>=ROUNDS.length-1){if(!items.some(i=>i.st==='fall')){ended=true;finish();}}else{round++;roundT=ROUNDS[round].dur;ctx.setTask(ROUNDS[round].task);ctx.say(ROUNDS[round].title,2400);spawnT=1.4;}}
     if(roundT>0){spawnT-=dt;if(spawnT<=0){spawn();spawnT=(round===2?1.35:1.05)*(.8+Math.random()*.5);}}}
    if(keyDir)tx=Math.max(.07,Math.min(.93,tx+keyDir*dt*.9));
    const before=bx;bx+=(tx-bx)*Math.min(1,dt*16);const v=(bx-before)/Math.max(dt,1e-3);if(Math.abs(v)>.02){walk+=dt*Math.min(12,Math.abs(v)*30);face=v>0?1:-1;}
    squash=Math.max(0,squash-dt*4);crane=Math.max(0,crane-dt*1.2);
    const bxp=bx*W;
    items.forEach(it=>{it.t+=dt;
     if(it.st==='fall'){const py=it.y;it.vy=Math.min(it.vy+H*1.05*it.gf*dt,H*.85);it.x+=it.vx*dt;it.y+=it.vy*dt;it.rot+=it.vr*dt;if(it.x<it.r){it.x=it.r;it.vx=Math.abs(it.vx);}if(it.x>W-it.r){it.x=W-it.r;it.vx=-Math.abs(it.vx);}
      if(py<=rim&&it.y>=rim&&Math.abs(it.x-bxp)<bw*.48+it.r*.3){catchIt(it);return;}
      if(it.y>=ground-it.r*.8){it.y=ground-it.r*.8;if(it.kind==='amphore'||it.kind==='krug')breakIt(it);else if(it.kind==='taube'){it.st='flyaway';it.vx=W*.3;it.vy=-H*.6;}else{it.st='ground';it.vy=-it.vy*.3;it.vx*=.5;}}}
     else if(it.st==='ground'){it.vy+=H*1.1*dt;it.y+=it.vy*dt;it.x+=it.vx*dt;if(it.y>ground-it.r*.8){it.y=ground-it.r*.8;it.vy=-it.vy*.3;it.vx*=.8;}}
     else if(it.st==='flyaway'){it.x+=it.vx*dt;it.y+=it.vy*dt;it.vy+=H*.2*dt;}});
    // gelegentliche Zusammenstöße fallender Dinge
    const fall=items.filter(i=>i.st==='fall');for(let a=0;a<fall.length;a++)for(let b=a+1;b<fall.length;b++){const A=fall[a],B=fall[b];const dx=B.x-A.x,dy=B.y-A.y,d=Math.hypot(dx,dy),m=(A.r+B.r)*.85;if(d>0&&d<m){const nx=dx/d,ny=dy/d,push=(m-d)/2;A.x-=nx*push;A.y-=ny*push;B.x+=nx*push;B.y+=ny*push;const va=A.vx;A.vx=B.vx*.8-nx*20;B.vx=va*.8+nx*20;A.vr+=1.5;B.vr-=1.5;}}
    items=items.filter(i=>!(i.st==='caught'&&i.t>.35)&&i.st!=='broken'&&!(i.st==='ground'&&i.t>2.8)&&!(i.st==='flyaway'&&i.y<-120));
    parts.forEach(p=>{p.t+=dt;p.vy+=H*1.4*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;if(p.y>ground){p.y=ground;p.vy*=-.3;p.vx*=.6;p.vr*=.5;}});parts=parts.filter(p=>p.t<2.2);
    if(shout){shout.t+=dt;if(shout.t>shout.ms)shout=null;}
   }
   function finish(){ctx.after(900,()=>ctx.win({title:'Die Ladung ist gerettet.',lines:[`Amphoren gerettet: ${stats.amph} von ${stats.amphAll}`,`Begriffe zur Verfolgung ab 303: ${stats.terms}`],html:'<div class="schild-comment"><span class="amph-face" aria-hidden="true"></span><p><b>Der Händler:</b> „Fast alles noch heil. Das zählt.“</p></div><div class="bonus-history"><h4>Zur Erinnerung</h4><p>Ab 303 ließ Kaiser Diokletian Gottesdienste verbieten, Kirchen zerstören, christliche Schriften vernichten und Geistliche verhaften.</p></div>',backLabel:'Zurück zum Forum'}));}
   function drawMerchant(x,t){const {ground,mh,mw}=L();const bob=Math.abs(Math.sin(walk*2))*mh*.012;
    g.save();g.fillStyle='rgba(20,12,6,.35)';g.beginPath();g.ellipse(x,ground-2,mw*.55,mh*.045,0,0,7);g.fill();g.restore();
    if(imgs.merchant){g.save();g.translate(x,ground-bob);g.scale(face,1);g.rotate(Math.sin(walk*2)*.012);g.drawImage(imgs.merchant,-mw/2,-mh,mw,mh);g.restore();return;}
    // neutraler Ersatz: gezeichnete Figur
    g.save();g.translate(x,ground-bob);g.fillStyle='#6b5a3a';g.fillRect(-mw*.18,-mh*.3,mw*.14,mh*.3);g.fillRect(mw*.04,-mh*.3,mw*.14,mh*.3);g.fillStyle='#e9dcc0';g.beginPath();g.moveTo(-mw*.4,-mh*.3);g.lineTo(mw*.4,-mh*.3);g.lineTo(mw*.3,-mh*.8);g.lineTo(-mw*.3,-mh*.8);g.fill();g.fillStyle='#c89a6e';g.beginPath();g.arc(0,-mh*.88,mh*.09,0,7);g.fill();g.restore();}
   function drawBasket(x){const {rim,bw,bh}=L();const sq=1+squash*.08;g.save();g.translate(x,rim+bh*.3);g.scale(sq,2-sq);
    if(!sheet(g,SHEET.fangkorb,0,0,bh,0)){g.fillStyle='#9a7440';g.beginPath();g.moveTo(-bw/2,-bh*.45);g.lineTo(bw/2,-bh*.45);g.lineTo(bw*.4,bh*.5);g.lineTo(-bw*.4,bh*.5);g.closePath();g.fill();g.strokeStyle='#5a3a1c';g.lineWidth=2;g.stroke();}
    g.restore();}
   function draw(t){if(!view.W)return;const {W,H,ground,mh,rim}=L();
    if(bgc)g.drawImage(bgc,0,0,W,H);else{g.fillStyle='#b8a47e';g.fillRect(0,0,W,H);}
    // Kranlast schwingt, wenn etwas fällt
    parts.forEach(p=>{g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.globalAlpha=Math.min(1,2.2-p.t);g.fillStyle=p.c;g.beginPath();if(p.shard){g.moveTo(-p.s,-p.s*.4);g.lineTo(p.s*.8,-p.s*.6);g.lineTo(p.s*.3,p.s*.6);}else g.arc(0,0,p.s*.6,0,7);g.fill();g.restore();});
    const bxp=bx*W;
    g.save();g.shadowColor='rgba(0,0,0,.55)';g.shadowBlur=10;g.shadowOffsetY=4;items.forEach(it=>{if(it.st!=='caught')drawItem(it,it.x,it.y,t);});g.restore();
    drawMerchant(bxp,t);
    items.forEach(it=>{if(it.st!=='caught')return;const e=Math.min(1,it.t/.35);drawItem(it,it.x+(bxp-it.x)*e,it.y+(rim+10-it.y)*e,t,1-e*.45);});
    drawBasket(bxp);
    if(shout){const a=Math.min(1,shout.t*6,(shout.ms-shout.t)*4);g.save();g.globalAlpha=a;g.font=`${Math.round(Math.max(16,H*.034))}px Georgia,serif`;const lines=wrap(shout.text,W*.36);const lh=Math.max(20,H*.042);const bw2=Math.max(...lines.map(l=>g.measureText(l).width))+28,bh2=lines.length*lh+18;let x=bxp+(bxp>W/2?-bw2-mh*.3:mh*.3),y=ground-mh*1.08-bh2;x=Math.max(8,Math.min(W-bw2-8,x));y=Math.max(8,y);
     g.fillStyle='#f6ead0';g.strokeStyle='#8a6a3e';g.lineWidth=2;g.beginPath();g.roundRect?g.roundRect(x,y,bw2,bh2,12):g.rect(x,y,bw2,bh2);g.fill();g.stroke();g.fillStyle='#3a2610';g.textBaseline='top';lines.forEach((l,i)=>g.fillText(l,x+14,y+9+i*lh));g.restore();}
   }
   function wrap(text,max){const words=text.split(' ');const out=[];let cur='';for(const w of words){const test=cur?cur+' '+w:w;if(g.measureText(test).width>max&&cur){out.push(cur);cur=w;}else cur=test;}if(cur)out.push(cur);return out;}
   ctx.loop({update,draw});
   ctx.stage.__debug={items:()=>items,stats:()=>stats,L,setX:v=>{tx=v;bx=v;},bx:()=>bx,tx:()=>tx,round:()=>round,ended:()=>ended,loaded,art:ART,spawn,catchIt,isGood,setRound:r=>{round=r;}};
   reset();
   return {start(){reset();}};
  }
 });
})();
