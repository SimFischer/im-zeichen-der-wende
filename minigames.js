'use strict';
/* Minispiele. Jedes Spiel meldet einen Sieg mit
   document.dispatchEvent(new CustomEvent('minigame-win',{detail:id})).
   Inhalte (Aussagen, richtig/falsch, Erklärungen) stehen in data/game-data.js unter GAME.minigames. */
window.MiniGames=(()=>{
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

 /* ---------- Die Kurierfahrt: Spurwechsel-Rennen im Stil von Road Fighter ---------- */
 function racer(id,cfg,work){
  const goal=cfg.goal||6;
  work.innerHTML=`<div class="racer">
   <div class="racer-hud"><div class="racer-goal"><span class="racer-label">Botschaften</span><span class="racer-dots">${Array.from({length:goal},()=>'<i></i>').join('')}</span></div><div class="racer-speed" role="group" aria-label="Tempo"><button type="button" data-speed="0.75" aria-pressed="true">Ruhig</button><button type="button" data-speed="1" aria-pressed="false">Normal</button><button type="button" data-speed="1.3" aria-pressed="false">Schnell</button></div><button type="button" class="racer-pause" aria-label="Pause">❚❚</button></div>
   <div class="racer-stage"><canvas aria-label="Spielfeld: römische Straße mit drei Spuren"></canvas>
    <div class="racer-banner" aria-live="polite"></div>
    <div class="racer-overlay"><h3>${esc(cfg.title)}</h3><p>${esc(cfg.intro)}</p><ul><li><b>Sammle</b> Schriftrollen mit <b>richtigen</b> Aussagen.</li><li><b>Weiche</b> Rollen mit falschen Aussagen aus.</li><li>Karren, Amphoren und Marschkolonnen bremsen dich nur – Leben gibt es keine.</li><li>Steuerung: links oder rechts ins Bild tippen, wischen oder ◀ ▶ unten<span class="mg-keys"> (am PC auch Pfeiltasten)</span>.</li></ul><button type="button" class="primary racer-start">Losreiten</button></div>
   </div>
   <div class="racer-controls"><button type="button" class="racer-left" aria-label="Nach links">◀</button><div class="racer-log" aria-live="polite"></div><button type="button" class="racer-right" aria-label="Nach rechts">▶</button></div>
  </div>`;
  const canvas=work.querySelector('canvas'),ctx=canvas.getContext('2d'),stage=work.querySelector('.racer-stage');
  const banner=work.querySelector('.racer-banner'),overlay=work.querySelector('.racer-overlay'),dots=[...work.querySelectorAll('.racer-dots i')],log=work.querySelector('.racer-log');
  let W=0,H=0,dpr=1,lane=1,laneX=1,running=false,paused=false,last=0,speedMul=.75,slowUntil=0,shake=0,t=0,spawnT=0,score=0,won=false,roadY=0;
  let ents=[];const collected=new Set();let bannerTimer=null;
  const truths=cfg.statements.filter(s=>s.ok),lies=cfg.statements.filter(s=>!s.ok);
  function resize(){const r=stage.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);W=r.width;H=r.height;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
  const ro=new ResizeObserver(resize);ro.observe(stage);
  const road=()=>{const rw=Math.min(W*.9,H*1.5);return{x:(W-rw)/2,w:rw,lw:rw/3};};
  const laneCenter=l=>{const r=road();return r.x+r.lw*(l+.5);};
  function say(html,kind,ms=3200){banner.innerHTML=html;banner.className='racer-banner show '+(kind||'');clearTimeout(bannerTimer);bannerTimer=setTimeout(()=>banner.className='racer-banner',ms);}
  function pickScroll(){const open=truths.filter(s=>!collected.has(s.text));const useTrue=open.length&&Math.random()<.55;const pool=useTrue?open:lies;return pool[Math.floor(Math.random()*pool.length)];}
  function spawn(){const r=road();const kinds=['cart','amphora','legion','puddle'];
   const busy=new Set();const rowY=-H*.25;
   if(Math.random()<.6){const s=pickScroll();const l=Math.floor(Math.random()*3);busy.add(l);ents.push({type:'scroll',lane:l,y:rowY,h:Math.max(90,H*.26),s});}
   const n=Math.random()<.35?2:1;for(let k=0;k<n;k++){const free=[0,1,2].filter(x=>!busy.has(x));if(free.length<=1&&busy.size)break;const l=free[Math.floor(Math.random()*free.length)];busy.add(l);const type=kinds[Math.floor(Math.random()*kinds.length)];ents.push({type,lane:l,y:rowY-(k*H*.05),h:type==='legion'?H*.2:type==='puddle'?H*.08:H*.13});}
  }
  function hit(e){const px=laneCenter(laneX),py=H*.8,pw=road().lw*.34,ph=H*.13;const ex=laneCenter(e.lane),ew=e.type==='scroll'?road().lw*.9:road().lw*.62;return Math.abs(px-ex)<(pw+ew)/2*.8&&Math.abs(py-(e.y+e.h/2))<(ph+e.h)/2*.8;}
  function update(dt){
   t+=dt;const base=H*.26*speedMul*(t<slowUntil?.4:1);roadY=(roadY+base*dt)%80;
   laneX+=(lane-laneX)*Math.min(1,dt*14);
   spawnT-=dt*speedMul;if(spawnT<=0){spawn();spawnT=1.9+Math.random()*.6;}
   for(const e of ents)e.y+=base*dt;
   for(const e of ents){if(e.done||!hit(e))continue;
    if(e.type==='scroll'){e.done=true;
     if(e.s.ok){if(!collected.has(e.s.text)){collected.add(e.s.text);score=collected.size;dots.forEach((d,i)=>d.classList.toggle('on',i<score));log.innerHTML=`<span class="ok">✓</span> ${esc(e.s.text)}`;say(`<b>Richtig!</b> ${esc(e.s.text)}`,'good',2200);}}
     else{if(score>0){const lastTrue=[...collected].pop();collected.delete(lastTrue);score=collected.size;dots.forEach((d,i)=>d.classList.toggle('on',i<score));}log.innerHTML=`<span class="bad">✗</span> ${esc(e.s.text)}`;say(`<b>Falsch:</b> „${esc(e.s.text)}“<br>${esc(e.s.why)}`,'bad',5200);slowUntil=t+1.2;}
     if(score>=goal&&!won){won=true;running=false;finish();}
    }else{e.done=true;slowUntil=t+1.4;shake=.35;say(e.type==='legion'?'Eine Marschkolonne – du musst warten.':e.type==='cart'?'Ein Ochsenkarren versperrt den Weg.':e.type==='puddle'?'Eine Pfütze – dein Pferd scheut.':'Amphoren auf der Straße!','',1500);}
   }
   ents=ents.filter(e=>e.y<H+40&&!(e.done&&e.type==='scroll'));shake=Math.max(0,shake-dt);
  }
  /* --- Zeichnen --- */
  function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
  function wrap(text,maxW){const words=text.split(' ');const lines=[];let cur='';for(const w of words){const test=cur?cur+' '+w:w;if(ctx.measureText(test).width>maxW&&cur){lines.push(cur);cur=w;}else cur=test;}if(cur)lines.push(cur);return lines;}
  function draw(){if(!W)return;const r=road();ctx.save();if(shake)ctx.translate((Math.random()-.5)*8*shake,0);
   ctx.fillStyle='#8aa35a';ctx.fillRect(0,0,W,H);
   for(let y=-80+roadY;y<H;y+=80){for(const side of [0,1]){const x=side?r.x+r.w+ (W-r.x-r.w)/2:r.x/2;ctx.fillStyle='#4f6b33';ctx.beginPath();ctx.ellipse(x+(side?10:-10),y+20,Math.min(18,r.x*.2),34,0,0,7);ctx.fill();ctx.fillStyle='#3e5728';ctx.beginPath();ctx.ellipse(x+(side?10:-10),y+14,Math.min(10,r.x*.12),24,0,0,7);ctx.fill();}}
   ctx.fillStyle='#cdb68a';ctx.fillRect(r.x-10,0,r.w+20,H);ctx.fillStyle='#e0cfa6';ctx.fillRect(r.x,0,r.w,H);
   ctx.strokeStyle='#b99f70';ctx.lineWidth=1.5;for(let y=-80+roadY;y<H;y+=40){ctx.beginPath();ctx.moveTo(r.x,y);ctx.lineTo(r.x+r.w,y);ctx.stroke();const off=((Math.round((y-roadY)/40))%2)*r.lw/4;for(let x=r.x+off;x<r.x+r.w;x+=r.lw/2){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+40);ctx.stroke();}}
   ctx.setLineDash([18,18]);ctx.strokeStyle='#fff6dd';ctx.lineWidth=3;for(const l of [1,2]){ctx.beginPath();ctx.moveTo(r.x+r.lw*l,roadY-40);ctx.lineTo(r.x+r.lw*l,H);ctx.stroke();}ctx.setLineDash([]);
   for(const e of ents){const cx=laneCenter(e.lane),y=e.y;
    if(e.type==='scroll'){const w=r.lw*.94,h=e.h;ctx.fillStyle='#00000030';rr(cx-w/2+4,y+6,w,h,10);ctx.fill();ctx.fillStyle='#f6e6c2';rr(cx-w/2,y,w,h,10);ctx.fill();ctx.strokeStyle='#8a6a3a';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#d9bf86';rr(cx-w/2-6,y-6,w+12,12,6);ctx.fill();ctx.stroke();rr(cx-w/2-6,y+h-6,w+12,12,6);ctx.fill();ctx.stroke();
     let fs=Math.max(15,Math.min(24,r.lw*.1));ctx.font=`600 ${fs}px 'Wende Garamond','EB Garamond',Garamond,Georgia,serif`;let lines=wrap(e.s.text,w-18);while(lines.length*fs*1.15>h-16&&fs>13){fs--;ctx.font=`600 ${fs}px 'Wende Garamond','EB Garamond',Garamond,Georgia,serif`;lines=wrap(e.s.text,w-18);}
     ctx.fillStyle='#2b2012';ctx.textAlign='center';ctx.textBaseline='middle';const top=y+h/2-(lines.length-1)*fs*1.15/2;lines.forEach((ln,i)=>ctx.fillText(ln,cx,top+i*fs*1.15));}
    else if(e.type==='cart'){const w=r.lw*.55,h=e.h;ctx.fillStyle='#3a2a1a';for(const s of [-1,1])for(const yy of [.2,.8]){rr(cx+s*w/2-(s>0?0:8),y+h*yy-10,8,20,3);ctx.fill();}ctx.fillStyle='#8a5a2e';rr(cx-w/2,y,w,h,6);ctx.fill();ctx.strokeStyle='#5a3a1a';ctx.lineWidth=2;ctx.stroke();ctx.strokeStyle='#6e4522';for(let k=1;k<4;k++){ctx.beginPath();ctx.moveTo(cx-w/2+4,y+h*k/4);ctx.lineTo(cx+w/2-4,y+h*k/4);ctx.stroke();}ctx.fillStyle='#e8d8b0';ctx.beginPath();ctx.ellipse(cx,y+h+14,w*.22,14,0,0,7);ctx.fill();ctx.fillStyle='#b9a27a';ctx.beginPath();ctx.ellipse(cx,y+h+26,w*.13,8,0,0,7);ctx.fill();}
    else if(e.type==='amphora'){for(const [dx,dy] of [[-.18,.2],[.18,.3],[0,.65]]){const ax=cx+dx*r.lw,ay=y+dy*e.h;ctx.fillStyle='#b8643a';ctx.beginPath();ctx.ellipse(ax,ay,r.lw*.1,r.lw*.13,0,0,7);ctx.fill();ctx.strokeStyle='#6e3419';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#8d4a26';ctx.beginPath();ctx.ellipse(ax,ay-r.lw*.12,r.lw*.035,r.lw*.03,0,0,7);ctx.fill();}}
    else if(e.type==='legion'){for(let k=0;k<3;k++)for(const dx of [-.14,.14]){const lx=cx+dx*r.lw,ly=y+k*e.h/3+14;ctx.fillStyle='#a3342a';ctx.beginPath();ctx.ellipse(lx,ly,r.lw*.09,r.lw*.07,0,0,7);ctx.fill();ctx.fillStyle='#c9a24a';ctx.beginPath();ctx.arc(lx,ly,r.lw*.045,0,7);ctx.fill();ctx.fillStyle='#b3261e';ctx.fillRect(lx-2,ly-r.lw*.045,4,r.lw*.09);ctx.strokeStyle='#6b4a1a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(lx+r.lw*.09,ly-18);ctx.lineTo(lx+r.lw*.09,ly+14);ctx.stroke();}}
    else if(e.type==='puddle'){ctx.fillStyle='#6f9aa6cc';ctx.beginPath();ctx.ellipse(cx,y+e.h/2,r.lw*.3,e.h/2,0,0,7);ctx.fill();ctx.strokeStyle='#dff1f5';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(cx-8,y+e.h/2-3,r.lw*.12,e.h/6,0,3.4,5.6);ctx.stroke();}
   }
   const px=laneCenter(laneX),py=H*.8,s=r.lw*.34;ctx.fillStyle='#00000033';ctx.beginPath();ctx.ellipse(px+4,py+6,s*.42,s*.95,0,0,7);ctx.fill();
   ctx.fillStyle='#7a4a24';ctx.beginPath();ctx.ellipse(px,py,s*.36,s*.85,0,0,7);ctx.fill();ctx.fillStyle='#5a3418';ctx.beginPath();ctx.ellipse(px,py-s*.95,s*.18,s*.3,0,0,7);ctx.fill();ctx.fillStyle='#2b1a0e';ctx.fillRect(px-2,py-s*.75,4,s*.4);
   const leg=Math.sin(t*14)*s*.15;ctx.fillStyle='#5a3418';for(const [dx,dy,ph] of [[-.3,-.45,1],[.3,-.45,-1],[-.3,.5,-1],[.3,.5,1]]){ctx.beginPath();ctx.ellipse(px+dx*s,py+dy*s+leg*ph,s*.08,s*.16,0,0,7);ctx.fill();}
   ctx.fillStyle='#1f4a40';ctx.beginPath();ctx.ellipse(px,py+s*.05,s*.3,s*.36,0,0,7);ctx.fill();ctx.fillStyle='#e0b58a';ctx.beginPath();ctx.arc(px,py-s*.12,s*.15,0,7);ctx.fill();ctx.fillStyle='#e7bc74';ctx.fillRect(px+s*.18,py,s*.14,s*.22);
   ctx.restore();
  }
  function loop(now){if(!canvas.isConnected){ro.disconnect();removeEventListener('keydown',key);return;}
   const dt=Math.min(.05,(now-last)/1000||0);last=now;if(running&&!paused)update(dt);draw();requestAnimationFrame(loop);}
  function move(d){if(!running||paused)return;lane=Math.max(0,Math.min(2,lane+d));}
  function key(e){if(!canvas.isConnected)return;if(['ArrowLeft','a','A'].includes(e.key)){move(-1);e.preventDefault();}if(['ArrowRight','d','D'].includes(e.key)){move(1);e.preventDefault();}if(e.key===' '&&running){paused=!paused;e.preventDefault();}}
  addEventListener('keydown',key);
  work.querySelector('.racer-left').onclick=()=>move(-1);work.querySelector('.racer-right').onclick=()=>move(1);
  let sx=null;canvas.addEventListener('pointerdown',e=>{sx=e.clientX;});
  canvas.addEventListener('pointerup',e=>{if(sx===null)return;const dx=e.clientX-sx;sx=null;if(Math.abs(dx)>30){move(dx<0?-1:1);return;}const r=canvas.getBoundingClientRect();move(e.clientX-r.left<r.width/2?-1:1);});
  work.querySelectorAll('.racer-speed button').forEach(b=>b.onclick=()=>{speedMul=+b.dataset.speed;work.querySelectorAll('.racer-speed button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));b.blur();});
  const pb=work.querySelector('.racer-pause');pb.onclick=()=>{if(!running)return;paused=!paused;pb.textContent=paused?'▶':'❚❚';pb.setAttribute('aria-label',paused?'Weiter':'Pause');say(paused?'Pause':'Weiter geht’s!','',1200);};
  work.querySelector('.racer-start').onclick=()=>{overlay.hidden=true;running=true;spawnT=.4;last=performance.now();canvas.focus?.();};
  function finish(){overlay.hidden=false;overlay.innerHTML=`<h3>Die Botschaft ist angekommen!</h3><p>${esc(cfg.win)}</p><ul class="racer-summary">${[...collected].map(x=>`<li>✓ ${esc(x)}</li>`).join('')}</ul><button type="button" class="primary racer-done">Weiter</button>`;overlay.querySelector('.racer-done').onclick=()=>document.dispatchEvent(new CustomEvent('minigame-win',{detail:id}));}
  work.__racer={ents:()=>ents,lane:()=>lane};
  requestAnimationFrame(t0=>{last=t0;resize();requestAnimationFrame(loop);});
  return true;
 }

 const win=id=>document.dispatchEvent(new CustomEvent('minigame-win',{detail:id}));
 const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const dotsHtml=(n,label)=>`<div class="racer-goal"><span class="racer-label">${esc(label)}</span><span class="racer-dots">${Array.from({length:n},()=>'<i></i>').join('')}</span></div>`;
 const speedHtml=(opts)=>`<div class="racer-speed" role="group" aria-label="Tempo">${opts.map((o,i)=>`<button type="button" data-speed="${o[1]}" aria-pressed="${i===0}">${esc(o[0])}</button>`).join('')}</div>`;
 function bindSpeed(root,fn){root.querySelectorAll('.racer-speed button').forEach(b=>b.onclick=()=>{root.querySelectorAll('.racer-speed button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));fn(+b.dataset.speed);b.blur();});}
 function startScreen(stage,cfg,rules,btn,onStart){const o=document.createElement('div');o.className='racer-overlay';o.innerHTML=`<h3>${esc(cfg.title)}</h3><p>${esc(cfg.intro)}</p><ul>${rules.map(r=>`<li>${r}</li>`).join('')}</ul><button type="button" class="primary racer-start">${esc(btn)}</button>`;stage.append(o);o.querySelector('.racer-start').onclick=()=>{o.hidden=true;onStart();};return o;}
 function winScreen(o,id,title,text,list){o.hidden=false;o.innerHTML=`<h3>${esc(title)}</h3><p>${esc(text)}</p>${list?`<ul class="racer-summary">${list.map(x=>`<li>✓ ${esc(x)}</li>`).join('')}</ul>`:''}<button type="button" class="primary racer-done">Weiter</button>`;o.querySelector('.racer-done').onclick=()=>win(id);o.querySelector('.racer-done').focus();}

 /* ---------- Zuordnen gegen die Zeit: „echo“ (Sprechblase + Zeitleiste) oder „stamp“ (Akten rutschen über den Tisch) ---------- */
 function classify(id,cfg,work){
  const goal=cfg.goal,skin=cfg.skin;
  work.innerHTML=`<div class="racer mg-classify skin-${skin}"><div class="racer-hud">${dotsHtml(goal,cfg.counter||'Punkte')}${speedHtml([['Ruhig',1],['Normal',.75],['Schnell',.55]])}</div>
   <div class="racer-stage mg-stage"${cfg.bg?` style="background-image:url('${cfg.bg}')"`:''}><div class="mg-scene">${skin==='echo'?`<img class="echo-portrait" src="${cfg.portrait||''}" alt=""><div class="echo-bubble"><p class="mg-text"></p><div class="mg-timer"><i></i></div></div>`:`<div class="desk"><div class="desk-edge">Tischkante</div><article class="file"><span class="file-tab">Akte</span><p class="mg-text"></p><span class="file-stamp"></span></article></div><div class="mg-timer"><i></i></div>`}</div><div class="racer-banner" aria-live="polite"></div></div>
   <div class="mg-choices">${cfg.choices.map((c,i)=>`<button type="button" data-i="${i}" class="mg-choice c${i}">${cfg.icons?`<span class="mg-ico">${cfg.icons[i]}</span>`:''}${esc(c)}</button>`).join('')}</div></div>`;
  const stage=work.querySelector('.mg-stage'),text=work.querySelector('.mg-text'),bar=work.querySelector('.mg-timer i'),banner=work.querySelector('.racer-banner'),dots=[...work.querySelectorAll('.racer-dots i')],file=work.querySelector('.file'),stampEl=work.querySelector('.file-stamp');
  let mul=1,score=0,queue=shuffle(cfg.items),cur=null,left=0,total=0,running=false,locked=false,last=0,bt=null,done=[];
  bindSpeed(work,v=>mul=v);
  const say=(h,k,ms=3800)=>{banner.innerHTML=h;banner.className='racer-banner show '+(k||'');clearTimeout(bt);bt=setTimeout(()=>banner.className='racer-banner',ms);};
  function next(){if(!queue.length)queue=shuffle(cfg.items.filter(x=>!done.includes(x)));cur=queue.shift();total=left=cfg.time*mul;text.textContent=cur.text;locked=false;
   if(file){file.classList.remove('stamped','fall','ok','bad');stampEl.textContent='';file.style.transition='none';file.style.transform='translateX(60vw)';void file.offsetWidth;file.style.transition='';}
   stage.classList.remove('flash-good','flash-bad');}
  function resolve(choice){if(locked||!running)return;locked=true;const good=choice!==null&&cur.ok.includes(choice);
   if(file){stampEl.textContent=choice===null?'':cfg.choices[choice];file.classList.add('stamped',good?'ok':'bad');}
   stage.classList.add(good?'flash-good':'flash-bad');
   if(good){score++;done.push(cur);dots.forEach((d,i)=>d.classList.toggle('on',i<score));say(`<b>Richtig!</b> ${esc(cur.why||'')}`,'good',2600);}
   else if(choice===null){queue.push(cur);say(`<b>${skin==='stamp'?'Die Akte ist vom Tisch gefallen!':'Zu langsam!'}</b> Richtig wäre: ${esc(cur.ok.map(i=>cfg.choices[i]).join(' / '))}. ${esc(cur.why||'')}`,'bad',5200);if(file)file.classList.add('fall');}
   else{queue.push(cur);say(`<b>Nicht ganz.</b> Richtig: ${esc(cur.ok.map(i=>cfg.choices[i]).join(' / '))}. ${esc(cur.why||'')}`,'bad',5200);}
   if(score>=goal){running=false;setTimeout(()=>winScreen(ov,id,cfg.winTitle,cfg.win,done.map(x=>x.text)),1200);return;}
   setTimeout(next,good?1300:3000);}
  work.querySelectorAll('.mg-choice').forEach(b=>b.onclick=()=>resolve(+b.dataset.i));
  function key(e){if(!work.isConnected){removeEventListener('keydown',key);return;}const n=+e.key;if(n>=1&&n<=cfg.choices.length&&running)resolve(n-1);}
  addEventListener('keydown',key);
  function loop(now){if(!work.isConnected)return;const dt=Math.min(.1,(now-last)/1000||0);last=now;
   if(running&&!locked){left-=dt;const f=Math.max(0,left/total);bar.style.width=(f*100)+'%';bar.style.background=f<.3?'#b3261e':f<.6?'#d99a2b':'#2d7a67';
    if(file){const r=file.parentElement.clientWidth,w=file.offsetWidth;const x=(r/2-w/2-6)*(2*f-1)-(1-f)*w*.35;file.style.transform=`translateX(${x}px) rotate(${(1-f)*-3}deg)`;}if(left<=0)resolve(null);}
   requestAnimationFrame(loop);}
  const ov=startScreen(stage,cfg,cfg.rules,cfg.startLabel||'Los geht’s',()=>{running=true;next();last=performance.now();});
  requestAnimationFrame(loop);return true;
 }

 /* ---------- Archiv im Dunkeln: mit dem Lichtkegel Spuren finden und zuordnen ---------- */
 function darkroom(id,cfg,work){
  const spots=cfg.spots,goal=spots.length;
  work.innerHTML=`<div class="racer mg-dark"><div class="racer-hud">${dotsHtml(goal,'Spuren')}<span class="mg-tip">Bewege das Licht mit Maus oder Finger. Tippe auf etwas, das im Licht auffällt.</span></div>
   <div class="racer-stage dark-stage"><img src="${cfg.image}" alt="" draggable="false"><canvas></canvas><div class="dark-spots"></div><div class="racer-banner" aria-live="polite"></div><div class="dark-dialog" hidden></div></div></div>`;
  const stage=work.querySelector('.dark-stage'),canvas=stage.querySelector('canvas'),ctx=canvas.getContext('2d'),dots=[...work.querySelectorAll('.racer-dots i')],dlg=stage.querySelector('.dark-dialog'),banner=stage.querySelector('.racer-banner'),layer=stage.querySelector('.dark-spots');
  let W=0,H=0,lx=.5,ly=.5,found=new Set(),bt=null,running=false;
  const say=(h,k,ms=3800)=>{banner.innerHTML=h;banner.className='racer-banner show '+(k||'');clearTimeout(bt);bt=setTimeout(()=>banner.className='racer-banner',ms);};
  spots.forEach((sp,i)=>{const b=document.createElement('button');b.type='button';b.className='dark-spot';b.style.left=sp.x+'%';b.style.top=sp.y+'%';b.setAttribute('aria-label',sp.name);b.onclick=e=>{e.stopPropagation();pick(i);};layer.append(b);});
  function paint(){const r=stage.getBoundingClientRect();if(!r.width)return;const d=Math.min(2,devicePixelRatio||1);if(W!==r.width||H!==r.height){W=r.width;H=r.height;canvas.width=W*d;canvas.height=H*d;ctx.setTransform(d,0,0,d,0,0);}
   ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,W,H);ctx.fillStyle='rgba(8,6,4,.94)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='destination-out';const R=Math.min(W,H)*.2,x=lx*W,y=ly*H;const g=ctx.createRadialGradient(x,y,R*.2,x,y,R);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.7,'rgba(0,0,0,.85)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,R,0,7);ctx.fill();
   ctx.globalCompositeOperation='source-over';ctx.fillStyle='rgba(255,190,90,.10)';ctx.beginPath();ctx.arc(x,y,R,0,7);ctx.fill();
   layer.querySelectorAll('.dark-spot').forEach((b,i)=>{const sp=spots[i];const dist=Math.hypot((sp.x/100-lx)*W,(sp.y/100-ly)*H);b.classList.toggle('lit',dist<R*.75);b.classList.toggle('found',found.has(i));});}
  const ro=new ResizeObserver(paint);ro.observe(stage);
  function move(e){const r=stage.getBoundingClientRect();lx=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));ly=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));paint();}
  stage.addEventListener('pointermove',move);stage.addEventListener('pointerdown',e=>{move(e);if(running&&e.target===canvas)say('Hier ist nichts Besonderes. Leuchte weiter herum.','',1800);});
  function pick(i){if(!running||!dlg.hidden)return;const sp=spots[i];if(found.has(i)){say(`Diese Spur hast du schon: ${esc(sp.name)}.`,'',1600);return;}
   const b=layer.children[i];if(!b.classList.contains('lit')){say('Zu dunkel – leuchte erst mit der Lampe dorthin.','',1800);return;}
   dlg.hidden=false;dlg.innerHTML=`<h4>${esc(sp.name)}</h4><p>${esc(sp.look)}</p><p class="dark-q">Welche Maßnahme von 303 erklärt diese Spur?</p><div class="dark-opts">${cfg.measures.map((m,k)=>`<button type="button" data-k="${k}">${esc(m)}</button>`).join('')}</div>`;
   dlg.querySelectorAll('button').forEach(x=>x.onclick=()=>{const k=+x.dataset.k;if(k===sp.answer){found.add(i);dots.forEach((d,j)=>d.classList.toggle('on',j<found.size));dlg.hidden=true;say(`<b>Richtig!</b> ${esc(sp.why)}`,'good',3500);paint();if(found.size>=goal)setTimeout(final,1200);}else{x.disabled=true;x.classList.add('wrong');say(`<b>Passt nicht.</b> ${esc(sp.hint)}`,'bad',3500);}});}
  function final(){dlg.hidden=false;const f=cfg.final;dlg.innerHTML=`<h4>Alle vier Spuren gesichert</h4><p class="dark-q">${esc(f.q)}</p><div class="dark-opts">${f.options.map((m,k)=>`<button type="button" data-k="${k}">${esc(m)}</button>`).join('')}</div>`;
   dlg.querySelectorAll('button').forEach(x=>x.onclick=()=>{if(+x.dataset.k===f.answer){dlg.hidden=true;running=false;winScreen(ov,id,cfg.winTitle,cfg.win,spots.map(s=>s.name+': '+cfg.measures[s.answer]));}else{x.disabled=true;x.classList.add('wrong');say(esc(f.why),'bad',4200);}});}
  const ov=startScreen(stage,cfg,cfg.rules,'Lampe hochhalten',()=>{running=true;paint();});
  requestAnimationFrame(paint);return true;
 }

 /* ---------- Schiebepuzzle mit anschließender Einordnung ---------- */
 function slider(id,cfg,work){
  const N=3,img=cfg.image;
  work.innerHTML=`<div class="racer mg-slider"><div class="racer-hud"><div class="racer-goal"><span class="racer-label">Züge: <b class="mg-moves">0</b></span></div><div class="racer-speed" role="group" aria-label="Schwierigkeit"><button type="button" data-mode="swap" aria-pressed="true">Tauschen (leicht)</button><button type="button" data-mode="slide" aria-pressed="false">Schieben (knifflig)</button></div><button type="button" class="racer-pause mg-peek">Vorlage zeigen</button></div>
   <div class="racer-stage slider-stage"><div class="slider-wrap"><div class="slider-board"></div><img class="slider-peek" src="${img}" alt="Vorlage" hidden></div><div class="racer-banner" aria-live="polite"></div></div></div>`;
  const stage=work.querySelector('.slider-stage'),board=work.querySelector('.slider-board'),movesEl=work.querySelector('.mg-moves'),banner=stage.querySelector('.racer-banner'),peek=work.querySelector('.slider-peek');
  let mode='swap',tiles=[],sel=null,moves=0,solved=false,bt=null;
  const say=(h,k,ms=3000)=>{banner.innerHTML=h;banner.className='racer-banner show '+(k||'');clearTimeout(bt);bt=setTimeout(()=>banner.className='racer-banner',ms);};
  function setup(){moves=0;movesEl.textContent=0;sel=null;tiles=[...Array(N*N).keys()];
   if(mode==='swap'){do{tiles=shuffle(tiles);}while(tiles.every((t,i)=>t===i));}
   else{let blank=N*N-1,prev=-1;for(let k=0;k<80;k++){const nb=neighbors(blank).filter(x=>x!==prev);const nx=nb[Math.floor(Math.random()*nb.length)];[tiles[blank],tiles[nx]]=[tiles[nx],tiles[blank]];prev=blank;blank=nx;}}
   draw();}
  const neighbors=i=>{const r=Math.floor(i/N),c=i%N,o=[];if(r)o.push(i-N);if(r<N-1)o.push(i+N);if(c)o.push(i-1);if(c<N-1)o.push(i+1);return o;};
  function draw(){board.innerHTML='';tiles.forEach((t,i)=>{const b=document.createElement('button');b.type='button';b.className='tile'+(mode==='slide'&&t===N*N-1&&!solved?' blank':'')+(sel===i?' sel':'');if(!(mode==='slide'&&t===N*N-1&&!solved)){b.style.backgroundImage=`url("${img}")`;b.style.backgroundPosition=`${(t%N)*50}% ${Math.floor(t/N)*50}%`;}b.setAttribute('aria-label','Teil '+(t+1));b.onclick=()=>tap(i);board.append(b);});}
  function tap(i){if(solved)return;
   if(mode==='swap'){if(sel===null){sel=i;draw();return;}if(sel!==i){[tiles[sel],tiles[i]]=[tiles[i],tiles[sel]];moves++;}sel=null;}
   else{const blank=tiles.indexOf(N*N-1);if(!neighbors(blank).includes(i)){say('Nur Teile neben der Lücke lassen sich schieben.','',1500);return;}[tiles[blank],tiles[i]]=[tiles[i],tiles[blank]];moves++;}
   movesEl.textContent=moves;draw();if(tiles.every((t,k)=>t===k)){solved=true;draw();board.classList.add('done');say('<b>Das Zeichen ist wieder vollständig!</b>','good',2500);setTimeout(quiz,1600);}}
  work.querySelectorAll('.racer-speed button').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;work.querySelectorAll('.racer-speed button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));solved=false;board.classList.remove('done');setup();});
  work.querySelector('.mg-peek').onclick=()=>{peek.hidden=!peek.hidden;};
  function quiz(){const q=cfg.quiz;let i=0,ok=0;const box=document.createElement('div');box.className='racer-overlay slider-quiz';stage.append(box);
   function show(){const it=q.items[i];box.innerHTML=`<h3>${esc(q.title)}</h3><p>${esc(q.intro)}</p><p class="quiz-count">Aussage ${i+1} von ${q.items.length}</p><blockquote class="quiz-item">${esc(it.text)}</blockquote><div class="dark-opts">${q.choices.map((c,k)=>`<button type="button" data-k="${k}">${esc(c)}</button>`).join('')}</div><p class="quiz-fb" aria-live="polite"></p>`;
    box.querySelectorAll('.dark-opts button').forEach(x=>x.onclick=()=>{const k=+x.dataset.k,fb=box.querySelector('.quiz-fb');if(it.ok.includes(k)){fb.className='quiz-fb good';fb.textContent='Richtig. '+it.why;box.querySelectorAll('.dark-opts button').forEach(y=>y.disabled=true);x.classList.add('right');setTimeout(()=>{i++;if(i<q.items.length)show();else{box.remove();winScreen(ov,id,cfg.winTitle,cfg.win);}},1900);}else{x.disabled=true;x.classList.add('wrong');fb.className='quiz-fb bad';fb.textContent='Noch nicht. '+it.hint;}});}
   show();}
  const ov=startScreen(stage,cfg,cfg.rules,'Puzzle beginnen',()=>{});
  setup();return true;
 }

 /* ---------- Türschloss mit drei Drehwalzen ---------- */
 function lock(id,cfg,work){
  const rings=cfg.rings;const pos=rings.map(r=>Math.floor(Math.random()*r.options.length));
  rings.forEach((r,i)=>{if(pos[i]===r.answer)pos[i]=(pos[i]+1)%r.options.length;});
  work.innerHTML=`<div class="racer mg-lock"><div class="lock-stage racer-stage"><div class="door-frame"><div class="door-light" aria-hidden="true"></div><div class="door"><div class="door-planks" aria-hidden="true"></div><div class="door-plate">
    <div class="lock-rings">${rings.map((r,i)=>`<div class="lock-col"><span class="lock-q">${esc(r.question)}</span><button type="button" class="ring-btn up" data-i="${i}" data-d="-1" aria-label="${esc(r.question)}: nach oben drehen">▲</button><div class="ring" data-i="${i}" role="spinbutton" tabindex="0" aria-label="${esc(r.question)}"><div class="ring-track"></div><span class="ring-pin" aria-hidden="true"></span></div><button type="button" class="ring-btn down" data-i="${i}" data-d="1" aria-label="${esc(r.question)}: nach unten drehen">▼</button></div>`).join('<span class="lock-arrow" aria-hidden="true">➜</span>')}</div>
    <div class="lock-bolt" aria-hidden="true"><i></i></div></div>
    <button type="button" class="door-handle" aria-label="Am Türgriff ziehen">Am Griff ziehen</button></div></div>
   <div class="racer-banner" aria-live="polite"></div></div>
   <p class="lock-sentence" aria-live="polite"></p></div>`;
  const stage=work.querySelector('.lock-stage'),banner=stage.querySelector('.racer-banner'),sentence=work.querySelector('.lock-sentence');let bt=null,opened=false;
  const say=(h,k,ms=4200)=>{banner.innerHTML=h;banner.className='racer-banner show '+(k||'');clearTimeout(bt);bt=setTimeout(()=>banner.className='racer-banner',ms);};
  const ringEls=[...work.querySelectorAll('.ring')];
  function draw(){ringEls.forEach((el,i)=>{const r=rings[i],n=r.options.length,tr=el.querySelector('.ring-track');tr.innerHTML=[-1,0,1].map(o=>{const k=(pos[i]+o+n)%n;return `<span class="ring-word${o===0?' current':''}">${esc(r.options[k])}</span>`;}).join('');el.setAttribute('aria-valuetext',r.options[pos[i]]);});
   sentence.innerHTML=cfg.sentence.map((part,i)=>part+(i<rings.length?` <b>${esc(rings[i].options[pos[i]])}</b>`:'')).join(' ');}
  function turn(i,d){if(opened)return;const n=rings[i].options.length;pos[i]=(pos[i]+d+n)%n;const el=ringEls[i];el.classList.remove('ok','bad','spin-up','spin-down');void el.offsetWidth;el.classList.add(d>0?'spin-down':'spin-up');draw();}
  work.querySelectorAll('.ring-btn').forEach(b=>b.onclick=()=>turn(+b.dataset.i,+b.dataset.d));
  ringEls.forEach((el,i)=>{let sy=null;el.addEventListener('pointerdown',e=>{sy=e.clientY;el.setPointerCapture?.(e.pointerId);});el.addEventListener('pointerup',e=>{if(sy===null)return;const dy=e.clientY-sy;sy=null;if(Math.abs(dy)>18)turn(i,dy<0?1:-1);else turn(i,1);});el.addEventListener('keydown',e=>{if(e.key==='ArrowUp'){turn(i,-1);e.preventDefault();}if(e.key==='ArrowDown'){turn(i,1);e.preventDefault();}});});
  work.querySelector('.door-handle').onclick=()=>{if(opened)return;const wrong=[];ringEls.forEach((el,i)=>{const ok=pos[i]===rings[i].answer;el.classList.remove('ok','bad');void el.offsetWidth;el.classList.add(ok?'ok':'bad');if(!ok)wrong.push(rings[i]);});
   stage.classList.remove('rattle');void stage.offsetWidth;
   if(wrong.length){stage.classList.add('rattle');say(`<b>Die Tür klemmt.</b> ${wrong.length===1?'Eine Walze sitzt':'Noch '+wrong.length+' Walzen sitzen'} nicht richtig.<br>${esc(wrong[0].hint)}`,'bad',5200);return;}
   opened=true;stage.classList.add('unlocked');say('<b>Klick – klick – klick!</b> Der Riegel gleitet zurück …','good',2200);
   setTimeout(()=>stage.classList.add('open'),900);
   setTimeout(()=>{const o=document.createElement('div');o.className='racer-overlay door-win';stage.append(o);winScreen(o,id,cfg.winTitle,cfg.win);},3000);};
  draw();return true;
 }

 /* ---------- Stempel des Statthalters: Akte fährt über den Tisch, Stempel in die Hand nehmen, abstempeln ---------- */
 function stamp(id,cfg,work){
  const goal=cfg.goal;
  const seal=(c,i)=>`<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="1.5"/><path id="arc${id}${i}" d="M18 50a32 32 0 0 1 64 0" fill="none"/><text font-size="11" font-weight="700" letter-spacing="2" fill="currentColor"><textPath href="#arc${id}${i}" startOffset="50%" text-anchor="middle">${esc(c.latin)}</textPath></text><text x="50" y="62" text-anchor="middle" font-size="22" fill="currentColor">${esc(c.sym)}</text><text x="50" y="80" text-anchor="middle" font-size="7.5" font-weight="700" fill="currentColor">SPQR</text></svg>`;
  work.innerHTML=`<div class="racer mg-stamp"><div class="racer-hud">${dotsHtml(goal,'Akten')}${speedHtml([['Ruhig',1],['Normal',.75],['Schnell',.55]])}</div>
   <div class="racer-stage stamp-stage"><div class="stamp-desk"><div class="stamp-pile" aria-hidden="true"></div><div class="stamp-edge" aria-hidden="true">▼ Tischkante</div><article class="stamp-file" tabindex="0" aria-label="Akte abstempeln"><span class="file-tab">Akte</span><p class="mg-text"></p><div class="stamp-marks"></div></article></div><div class="stamp-hand" aria-hidden="true"></div><div class="racer-banner" aria-live="polite"></div></div>
   <div class="stamp-rack" role="group" aria-label="Stempel">${cfg.choices.map((c,i)=>`<button type="button" class="stamp-tool" data-i="${i}" aria-pressed="false"><span class="stamp-knob"></span><span class="stamp-face">${seal(c,i)}</span><span class="stamp-name">${esc(c.label)}</span></button>`).join('')}</div>
   <p class="stamp-status" aria-live="polite">Nimm einen Stempel in die Hand.</p></div>`;
  const stage=work.querySelector('.stamp-stage'),desk=work.querySelector('.stamp-desk'),file=work.querySelector('.stamp-file'),text=file.querySelector('.mg-text'),marks=file.querySelector('.stamp-marks'),hand=work.querySelector('.stamp-hand'),banner=stage.querySelector('.racer-banner'),dots=[...work.querySelectorAll('.racer-dots i')],status=work.querySelector('.stamp-status'),pile=work.querySelector('.stamp-pile');
  let mul=1,held=null,queue=shuffle(cfg.items),cur=null,x=0,speed=0,running=false,state='idle',last=0,bt=null,score=0,done=[];
  bindSpeed(work,v=>mul=v);
  const say=(h,k,ms=4200)=>{banner.innerHTML=h;banner.className='racer-banner show '+(k||'');clearTimeout(bt);bt=setTimeout(()=>banner.className='racer-banner',ms);};
  function next(){if(!queue.length)queue=shuffle(cfg.items.filter(v=>!done.includes(v)));cur=queue.shift();text.textContent=cur.text;marks.innerHTML='';file.className='stamp-file';x=desk.clientWidth+10;speed=(desk.clientWidth+file.offsetWidth)/(cfg.time/mul);state='move';place();}
  function place(){file.style.transform=`translateX(${x}px) rotate(${state==='move'?-2:0}deg)`;const f=Math.max(0,Math.min(1,(x+file.offsetWidth)/(desk.clientWidth+file.offsetWidth)));desk.style.setProperty('--danger',f<.3?1:0);}
  function pick(i){held=held===i?null:i;work.querySelectorAll('.stamp-tool').forEach((b,k)=>{b.classList.toggle('held',k===held);b.setAttribute('aria-pressed',String(k===held));});
   hand.innerHTML=held===null?'':`<span class="stamp-face big">${seal(cfg.choices[held],'h'+held)}</span>`;hand.classList.toggle('on',held!==null);stage.classList.toggle('holding',held!==null);
   status.innerHTML=held===null?'Nimm einen Stempel in die Hand.':`In der Hand: <b>${esc(cfg.choices[held].label)}</b> – tippe jetzt auf die Akte.`;}
  work.querySelectorAll('.stamp-tool').forEach(b=>b.onclick=()=>pick(+b.dataset.i));
  stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();hand.style.left=(e.clientX-r.left)+'px';hand.style.top=(e.clientY-r.top)+'px';});
  stage.addEventListener('pointerleave',()=>hand.classList.add('away'));stage.addEventListener('pointerenter',()=>hand.classList.remove('away'));
  function hit(e){if(!running||state!=='move')return;if(held===null){say('Nimm zuerst unten einen Stempel in die Hand.','',2200);return;}
   const r=file.getBoundingClientRect(),sr=stage.getBoundingClientRect();const px=e?e.clientX-r.left:r.width*.7,py=e?e.clientY-r.top:r.height*.55;
   hand.style.left=(r.left-sr.left+px)+'px';hand.style.top=(r.top-sr.top+py)+'px';hand.classList.remove('press');void hand.offsetWidth;hand.classList.add('press');
   const good=cur.ok.includes(held);
   setTimeout(()=>{if(good){const m=document.createElement('span');m.className='stamp-print';m.style.left=Math.max(10,Math.min(r.width-80,px-40))+'px';m.style.top=Math.max(4,Math.min(r.height-80,py-40))+'px';m.style.transform=`rotate(${Math.random()*24-12}deg)`;m.innerHTML=seal(cfg.choices[held],'p'+Math.random().toString(36).slice(2));marks.append(m);
     state='done';score++;done.push(cur);dots.forEach((d,i)=>d.classList.toggle('on',i<score));say(`<b>Richtig gestempelt!</b> ${esc(cur.why)}`,'good',2600);
     setTimeout(()=>{file.classList.add('filed');const c=document.createElement('i');pile.append(c);},900);
     if(score>=goal){running=false;setTimeout(()=>winScreen(ov,id,cfg.winTitle,cfg.win,done.map(v=>v.text)),1800);}else setTimeout(next,1700);}
    else{file.classList.remove('shake');void file.offsetWidth;file.classList.add('shake');say(`<b>Der Schreiber hält deine Hand fest:</b> „${esc(cfg.choices[held].label)}“ passt hier nicht. ${esc(cur.hint||cfg.hint||'')}`,'bad',4200);}},180);}
  file.addEventListener('click',e=>hit(e));file.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){hit();e.preventDefault();}});
  function key(e){if(!work.isConnected){removeEventListener('keydown',key);return;}const n=+e.key;if(n>=1&&n<=cfg.choices.length&&running){pick(n-1);}}
  addEventListener('keydown',key);
  function loop(now){if(!work.isConnected)return;const dt=Math.min(.1,(now-last)/1000||0);last=now;
   if(running&&state==='move'){x-=speed*dt;place();if(x<-file.offsetWidth*.55){state='fall';file.classList.add('fall');queue.push(cur);say(`<b>Die Akte ist vom Tisch gefallen!</b> Richtig wäre: ${esc(cur.ok.map(i=>cfg.choices[i].label).join(' / '))}. ${esc(cur.why)}`,'bad',5200);setTimeout(()=>{if(running)next();},2600);}}
   else if(state==='done'&&!file.classList.contains('filed')){}
   requestAnimationFrame(loop);}
  const ov=startScreen(stage,cfg,cfg.rules,'Erste Akte holen',()=>{running=true;next();last=performance.now();});
  requestAnimationFrame(loop);return true;
 }

 /* ---------- Die beiden Seilzüge: Holzklötze an Haken hängen, am Hebel ziehen ---------- */
 function ropes(id,cfg,work){
  const val={};cfg.lines.forEach((l,li)=>l.slots.forEach((_,si)=>val[li+'-'+si]=null));
  work.innerHTML=`<div class="racer mg-ropes"><div class="racer-stage rope-stage"><div class="rope-beam" aria-hidden="true"></div>
   ${cfg.lines.map((l,li)=>`<section class="rope-line" data-l="${li}"><h4>${esc(l.title)}</h4><div class="rope-row"><span class="pulley" aria-hidden="true"></span><div class="rope" aria-hidden="true"></div><div class="hooks">${l.slots.map((sl,si)=>`<button type="button" class="hook" data-k="${li}-${si}" aria-label="${esc(l.title)}, ${esc(sl)}: Haken"><span class="hook-label">${si+1}. ${esc(sl)}</span><span class="hook-iron" aria-hidden="true"></span><span class="block-slot"></span></button>`).join('')}</div><span class="pulley" aria-hidden="true"></span></div></section>`).join('')}
   <div class="rope-chest" aria-hidden="true"><span class="chest-lid"></span><span class="chest-key">🗝</span></div>
   <div class="racer-banner" aria-live="polite"></div></div>
   <div class="rope-bottom"><div class="crate" role="group" aria-label="Holzklötze in der Kiste"><span class="crate-label">Kiste mit Holzklötzen</span><div class="crate-blocks">${cfg.blocks.map((b,i)=>`<button type="button" class="wood" data-b="${i}" aria-pressed="false">${esc(b)}</button>`).join('')}</div></div>
   <button type="button" class="lever" aria-label="Am Hebel ziehen"><span class="lever-arm" aria-hidden="true"></span><span>Am Hebel ziehen</span></button></div>
   <p class="stamp-status rope-status" aria-live="polite">Nimm einen Holzklotz aus der Kiste und häng ihn an einen Haken.</p></div>`;
  const stage=work.querySelector('.rope-stage'),banner=stage.querySelector('.racer-banner'),status=work.querySelector('.rope-status');let held=null,bt=null,phase='ropes';
  const say=(h,k,ms=4500)=>{banner.innerHTML=h;banner.className='racer-banner show '+(k||'');clearTimeout(bt);bt=setTimeout(()=>banner.className='racer-banner',ms);};
  function setHeld(i){held=held===i?null:i;work.querySelectorAll('.wood[data-b]').forEach(b=>{const on=+b.dataset.b===held;b.classList.toggle('held',on);b.setAttribute('aria-pressed',String(on));});status.innerHTML=held===null?'Nimm einen Holzklotz aus der Kiste und häng ihn an einen Haken.':`In der Hand: <b>${esc(cfg.blocks[held])}</b> – tippe auf einen Haken.`;}
  work.querySelectorAll('.wood[data-b]').forEach(b=>b.onclick=()=>setHeld(+b.dataset.b));
  work.querySelectorAll('.hook').forEach(h=>h.onclick=()=>{if(phase!=='ropes')return;const k=h.dataset.k,slot=h.querySelector('.block-slot');
   if(held===null){if(val[k]!==null){val[k]=null;slot.innerHTML='';h.classList.remove('filled','ok','bad');status.textContent='Klotz zurück in die Kiste gelegt.';}else say('Nimm zuerst einen Holzklotz aus der Kiste.','',2000);return;}
   val[k]=held;slot.innerHTML=`<span class="wood hanging">${esc(cfg.blocks[held])}</span>`;h.classList.add('filled');h.classList.remove('ok','bad');setHeld(held);});
  work.querySelector('.lever').onclick=()=>{
   if(phase==='compare')return;
   const empty=Object.values(val).filter(v=>v===null).length;if(empty){say(`Es hängen noch nicht alle Klötze. <b>${empty}</b> Haken sind leer.`,'bad',2600);return;}
   const lever=work.querySelector('.lever');lever.classList.remove('pulled');void lever.offsetWidth;lever.classList.add('pulled');
   let wrong=null;cfg.lines.forEach((l,li)=>{let lineOk=true;l.slots.forEach((_,si)=>{const k=li+'-'+si,h=work.querySelector(`.hook[data-k="${k}"]`);const ok=cfg.blocks[val[k]]===l.answer[si];h.classList.remove('ok','bad');void h.offsetWidth;h.classList.add(ok?'ok':'bad');if(!ok){lineOk=false;if(!wrong)wrong={l,si};}});work.querySelector(`.rope-line[data-l="${li}"]`).classList.toggle('pulling',lineOk);});
   if(wrong){stage.classList.remove('jam');void stage.offsetWidth;stage.classList.add('jam');say(`<b>Das Seil verklemmt sich.</b> Bei „${esc(wrong.l.title)}“ hängt am Haken „${esc(wrong.l.slots[wrong.si])}“ der falsche Klotz. ${esc(cfg.hint)}`,'bad',5200);return;}
   phase='compare';say('<b>Beide Seile laufen!</b> Die Rollen drehen sich …','good',2400);
   setTimeout(()=>{const q=cfg.compare;const o=document.createElement('div');o.className='racer-overlay rope-compare';o.innerHTML=`<h3>${esc(q.title)}</h3><p>${esc(q.q)}</p><div class="dark-opts one-col">${q.options.map((t,k)=>`<button type="button" class="wood sign" data-k="${k}">${esc(t)}</button>`).join('')}</div><p class="quiz-fb" aria-live="polite"></p>`;stage.append(o);
    o.querySelectorAll('button').forEach(b=>b.onclick=()=>{if(+b.dataset.k===q.answer){o.remove();stage.classList.add('chest-open');say('<b>Die Truhe öffnet sich!</b> Darin liegt der Archivschlüssel.','good',3000);setTimeout(()=>{const w=document.createElement('div');w.className='racer-overlay';stage.append(w);winScreen(w,id,cfg.winTitle,cfg.win);},2400);}else{b.disabled=true;b.classList.add('wrong');const fb=o.querySelector('.quiz-fb');fb.className='quiz-fb bad';fb.textContent=q.why;}});},2200);};
  return true;
 }
 return {racer,classify,darkroom,slider,lock,stamp,ropes};
})();
