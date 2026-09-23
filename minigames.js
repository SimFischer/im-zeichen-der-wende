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
    <div class="racer-overlay"><h3>${esc(cfg.title)}</h3><p>${esc(cfg.intro)}</p><ul><li><b>Sammle</b> Schriftrollen mit <b>richtigen</b> Aussagen.</li><li><b>Weiche</b> Rollen mit falschen Aussagen aus.</li><li>Karren, Amphoren und Marschkolonnen bremsen dich nur – Leben gibt es keine.</li><li>Steuerung: ◀ ▶ unten, Pfeiltasten, A / D oder links/rechts ins Bild tippen.</li></ul><button type="button" class="primary racer-start">Losreiten</button></div>
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
  canvas.addEventListener('pointerdown',e=>{const r=canvas.getBoundingClientRect();move(e.clientX-r.left<r.width/2?-1:1);});
  work.querySelectorAll('.racer-speed button').forEach(b=>b.onclick=()=>{speedMul=+b.dataset.speed;work.querySelectorAll('.racer-speed button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));b.blur();});
  const pb=work.querySelector('.racer-pause');pb.onclick=()=>{if(!running)return;paused=!paused;pb.textContent=paused?'▶':'❚❚';pb.setAttribute('aria-label',paused?'Weiter':'Pause');say(paused?'Pause':'Weiter geht’s!','',1200);};
  work.querySelector('.racer-start').onclick=()=>{overlay.hidden=true;running=true;spawnT=.4;last=performance.now();canvas.focus?.();};
  function finish(){overlay.hidden=false;overlay.innerHTML=`<h3>Die Botschaft ist angekommen!</h3><p>${esc(cfg.win)}</p><ul class="racer-summary">${[...collected].map(x=>`<li>✓ ${esc(x)}</li>`).join('')}</ul><button type="button" class="primary racer-done">Weiter</button>`;overlay.querySelector('.racer-done').onclick=()=>document.dispatchEvent(new CustomEvent('minigame-win',{detail:id}));}
  work.__racer={ents:()=>ents,lane:()=>lane};
  requestAnimationFrame(t0=>{last=t0;resize();requestAnimationFrame(loop);});
  return true;
 }
 return {racer};
})();
