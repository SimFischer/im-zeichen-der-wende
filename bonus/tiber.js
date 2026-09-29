'use strict';
(()=>{
 if(!window.BonusGames)return;
 const files={};for(const f of ['tiber-background','bank-start','bank-goal','log-large','log-small','plank','raft','boat-large','rock-large','island-small','player-up','player-down','splash-small','goal-banner'])files[f]=f+'.png';
 files['player-up']='../catacombs/player-down.png';files['player-down']='../catacombs/player-down.png';
 const BEST_KEY='im-zeichen-der-wende:tiber-best-v1';
 const formatTime=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
 function readBest(){try{const n=Number(localStorage.getItem(BEST_KEY));return Number.isFinite(n)&&n>0?n:null;}catch(e){return null;}}
 const ART={dir:'assets/bonus/tiber-topdown/',files,available:Object.keys(files)},WIDTH=512,HEIGHT=432,CELL=48;
 function createModel(){
  const s={x:256,row:8,dir:'up',falls:0,elapsed:0,found:[],won:false,cooldown:0,splash:null,checkpoint:{x:256,row:8},platforms:[]};
  const types=['log-large','plank','boat-large','raft','log-small'];
  [1,2,3,5,6,7].forEach((row,i)=>{for(let k=0;k<4;k++)s.platforms.push({row,x:32+k*160,w:({"log-large":117,"log-small":98,plank:81,raft:73,"boat-large":88})[types[i%5]],speed:(i%2?-1:1)*(16+i*2),type:types[i%5]});});
  s.platforms.forEach((p,i)=>{if([0,8,16].includes(i))p.relic=i;});
  const islands=[{x:128,w:44,type:'island-small'},{x:256,w:44,type:'rock-large'},{x:384,w:44,type:'island-small'}];
  function support(x=s.x,row=s.row){if(row===0||row===8)return true;if(row===4)return islands.find(p=>Math.abs(x-p.x)<p.w/2-8);return s.platforms.find(p=>p.row===row&&Math.abs(x-p.x)<p.w/2-10);}
  function fall(){s.splash={x:s.x,row:s.row,t:.65};s.falls++;s.x=s.checkpoint.x;s.row=s.checkpoint.row;s.cooldown=.65;}
  function check(){if(s.x<12||s.x>WIDTH-12||!support()){fall();return;}const p=support();if(p&&p.relic!==undefined&&!s.found.includes(p.relic))s.found.push(p.relic);if(s.row===4)s.checkpoint={x:s.x,row:4};if(s.row===0)s.won=true;}
  function input(dir){if(s.won||s.cooldown>0)return false;const delta={up:[0,-1],down:[0,1],left:[-CELL,0],right:[CELL,0]}[dir];if(!delta)return false;s.dir=dir;s.x+=delta[0];s.row=Math.max(0,Math.min(8,s.row+delta[1]));s.cooldown=.14;check();return true;}
  function tick(dt){if(s.won)return;s.elapsed+=dt;s.cooldown=Math.max(0,s.cooldown-dt);if(s.splash){s.splash.t-=dt;if(s.splash.t<=0)s.splash=null;}const ride=support();for(const p of s.platforms){p.x+=p.speed*dt;if(p.x>WIDTH+80)p.x-=640;if(p.x<-80)p.x+=640;}if(ride?.speed)s.x+=ride.speed*dt;if(s.cooldown<.5)check();}
  return {s,islands,input,tick,support};
 }
 window.BonusGames.register({id:'tiber',title:'Über den Tiber!',kicker:'Am Fluss vor der Milvischen Brücke',art:ART,createModel,
  intro:{text:'Erreiche das andere Tiberufer. Beobachte die Strömung und springe über Holz, Flöße und Boote. Die Milvische Brücke zeigt dir den Schauplatz.',controls:['Ein Tipp auf einen Richtungspfeil bewegt dich genau einen Schritt. Alternativ Pfeiltasten oder WASD.','Goldene Spielmarken auf Plattformen sind optionale Fundstücke. Die Bestzeit zählt jede erfolgreiche Überquerung.','Plattformen tragen dich mit. Die Felsen in der Mitte sind sichere Zwischenstationen.','Im Wasser geht es mit einem Splash zur letzten sicheren Stelle zurück.'],start:'Ans Ufer'},
  setup(ctx){
   const m=createModel(),imgs=ctx.assets?.(ART)||{};let finished=false,best=readBest();
   const root=ctx.layer('crossing-game',`<aside class="crossing-aside"><h3>Der Weg über den Fluss</h3><img src="${ART.dir}tiber-background.png" alt="Blick auf den Tiber an der Milvischen Brücke"><p>Milvische Brücke · Rom</p><p>Warte auf eine Plattform.<br>Felsen sichern deinen Fortschritt.</p><div class="crossing-pad">${[['up','↑','Nach oben'],['left','←','Nach links'],['down','↓','Nach unten'],['right','→','Nach rechts']].map(([d,a,label])=>`<button type="button" data-dir="${d}" aria-label="${label}">${a}</button>`).join('')}</div><p class="crossing-record"></p><p class="crossing-status" role="status"></p></aside><div class="crossing-board" role="img" aria-label="Tiber von oben: Ziel im Norden, Start im Süden"></div>`);
   const board=root.querySelector('.crossing-board'),canvas=document.createElement('canvas');board.append(canvas);const g=canvas.getContext('2d');
   function size(){const r=board.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);g.setTransform(canvas.width/WIDTH,0,0,canvas.height/HEIGHT,0,0);}
   ctx.observe(board,size);
   const paint=(name,x,y,w,h)=>window.BonusArt.draw(g,imgs[name],x-w/2,y-h/2,w,h);
   function draw(){g.clearRect(0,0,WIDTH,HEIGHT);g.fillStyle='#286a6b';g.fillRect(0,0,WIDTH,HEIGHT);g.strokeStyle='#70b6ad55';g.lineWidth=2;for(let y=52;y<390;y+=18){g.beginPath();for(let x=0;x<=WIDTH;x+=8){const yy=y+Math.sin(x/22+y)*2;if(x===0)g.moveTo(x,yy);else g.lineTo(x,yy);}g.stroke();}
    for(let x=32;x<WIDTH;x+=64){paint('bank-goal',x,22,68,58);paint('bank-start',x,410,68,58);}

    for(const p of m.s.platforms){paint(p.type,p.x,p.row*CELL+24,p.w,42);if(p.relic!==undefined&&!m.s.found.includes(p.relic)){g.fillStyle='#f6d475';g.strokeStyle='#79501e';g.lineWidth=2;g.beginPath();g.arc(p.x,p.row*CELL+24,7,0,Math.PI*2);g.fill();g.stroke();}}
    for(const p of m.islands)paint(p.type,p.x,216,p.w,48);
    paint('goal-banner',256,22,25,40);
    if(m.s.splash)paint('splash-small',m.s.splash.x,m.s.splash.row*CELL+24,64,58);
    g.save();g.translate(m.s.x,m.s.row*CELL+24);g.rotate(({up:Math.PI,left:Math.PI/2,right:-Math.PI/2})[m.s.dir]||0);paint('player-'+(m.s.dir==='down'?'down':'up'),0,0,30,38);g.restore();
   }
   function input(d){if(ctx.running&&!ctx.paused)m.input(d);}
   root.querySelectorAll('[data-dir]').forEach(b=>ctx.on(b,'click',()=>input(b.dataset.dir)));
   ctx.on(document,'keydown',e=>{const d={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'}[e.key];if(d){e.preventDefault();if(!e.repeat)input(d);}});
   let lastFalls=-1;ctx.loop({update(dt){m.tick(dt);root.querySelector('.crossing-record').textContent=`Zeit: ${formatTime(m.s.elapsed)} · Bestzeit: ${best===null?'–':formatTime(best)} · Fundstücke: ${m.s.found.length}/3`;ctx.setTask(`Ziel: Nordufer · ${m.s.checkpoint.row===4?'Felsen erreicht':'Startufer'} · ${m.s.falls} Wasserlandungen`);if(lastFalls!==m.s.falls){lastFalls=m.s.falls;root.querySelector('.crossing-status').textContent=m.s.falls?'Zur sicheren Stelle zurück. Versuch es erneut!':'Von Plattform zu Plattform.';}if(m.s.won&&!finished){finished=true;const newBest=best===null||m.s.elapsed<best;if(newBest){best=m.s.elapsed;try{localStorage.setItem(BEST_KEY,String(best));}catch(e){}}ctx.win({title:'Am anderen Ufer!',lines:[`Zeit: ${formatTime(m.s.elapsed)} · Bestzeit: ${formatTime(best)}${newBest?' · Neue Bestzeit!':''}`,`${m.s.found.length} von 3 optionalen Fundstücken gesammelt.`,`${m.s.falls} Wasserlandungen · Geduld und Beobachtung führen ans Ziel.`]});}},draw});
   return {start(){size();}};
  }
 });
})();
