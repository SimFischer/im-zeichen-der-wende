'use strict';
/* Minispiele. Jedes Spiel meldet einen Sieg mit
   document.dispatchEvent(new CustomEvent('minigame-win',{detail:id})).
   Inhalte (Aussagen, richtig/falsch, Erklärungen) stehen in data/game-data.js unter GAME.minigames. */
window.MiniGames=(()=>{
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

 const win=id=>document.dispatchEvent(new CustomEvent('minigame-win',{detail:id}));
 const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const dotsHtml=(n,label)=>`<div class="racer-goal"><span class="racer-label">${esc(label)}</span><span class="racer-dots">${Array.from({length:n},()=>'<i></i>').join('')}</span></div>`;
 const speedHtml=(opts)=>`<div class="racer-speed" role="group" aria-label="Tempo">${opts.map((o,i)=>`<button type="button" data-speed="${o[1]}" aria-pressed="${i===0}">${esc(o[0])}</button>`).join('')}</div>`;
 function bindSpeed(root,fn){root.querySelectorAll('.racer-speed button').forEach(b=>b.onclick=()=>{root.querySelectorAll('.racer-speed button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));fn(+b.dataset.speed);b.blur();});}
 function startScreen(stage,cfg,rules,btn,onStart){const o=document.createElement('div');o.className='racer-overlay';o.innerHTML=`<p class="racer-intro">${esc(cfg.intro)}</p><ul>${rules.map(r=>`<li>${r}</li>`).join('')}</ul><button type="button" class="primary racer-start">${esc(btn)}</button>`;stage.append(o);o.querySelector('.racer-start').onclick=()=>{o.hidden=true;onStart();};return o;}
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
   function show(){const it=q.items[i];box.innerHTML=`<h3>${esc(q.title)}</h3>${i===0?`<p>${esc(q.intro)}</p>`:''}<p class="quiz-count">Aussage ${i+1} von ${q.items.length}</p><blockquote class="quiz-item">${esc(it.text)}</blockquote><div class="dark-opts">${q.choices.map((c,k)=>`<button type="button" data-k="${k}"><b>${esc(c)}</b>${q.legend?.[k]?`<small>${esc(q.legend[k])}</small>`:''}</button>`).join('')}</div><p class="quiz-fb" aria-live="polite"></p>`;
    box.querySelectorAll('.dark-opts button').forEach(x=>x.onclick=()=>{const k=+x.dataset.k,fb=box.querySelector('.quiz-fb');if(it.ok.includes(k)){fb.className='quiz-fb good';fb.textContent='Richtig. '+it.why;fb.scrollIntoView?.({block:'nearest'});box.querySelectorAll('.dark-opts button').forEach(y=>y.disabled=true);x.classList.add('right');setTimeout(()=>{i++;if(i<q.items.length)show();else{box.remove();winScreen(ov,id,cfg.winTitle,cfg.win);}},1900);}else{x.disabled=true;x.classList.add('wrong');fb.className='quiz-fb bad';fb.textContent='Noch nicht. '+(it.wrong?.[k]||it.hint);fb.scrollIntoView?.({block:'nearest'});}});}
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
  const seal=(c,i)=>`<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="1.5"/><path id="arc${id}${i}" d="M18 50a32 32 0 0 1 64 0" fill="none"/><text font-size="11" font-weight="700" letter-spacing="2" fill="currentColor"><textPath href="#arc${id}${i}" startOffset="50%" text-anchor="middle">${esc(c.latin)}</textPath></text><text x="50" y="68" text-anchor="middle" font-size="36" font-weight="700" fill="currentColor">${esc(c.sym)}</text><text x="50" y="86" text-anchor="middle" font-size="7.5" font-weight="700" fill="currentColor">SPQR</text></svg>`;
  work.innerHTML=`<div class="racer mg-stamp"><div class="racer-hud">${dotsHtml(goal,'Akten')}</div>
   <div class="racer-stage stamp-stage"><div class="stamp-desk"><div class="stamp-pile" aria-hidden="true"></div><article class="stamp-file case-file" tabindex="0" aria-label="Akte abstempeln"><span class="file-tab case-file-tab">Akte</span><header class="case-file-head"><span class="case-file-kind">Fallakte · Sachverhalt</span><span class="case-file-no"></span></header><p class="mg-text case-file-text"></p><footer class="case-file-foot" aria-hidden="true">Amtsstube des Statthalters</footer><div class="stamp-marks"></div></article></div><div class="stamp-hand" aria-hidden="true"></div><div class="racer-banner" aria-live="polite"></div></div>
   <div class="stamp-rack" role="group" aria-label="Stempel">${cfg.choices.map((c,i)=>`<button type="button" class="stamp-tool" data-i="${i}" aria-pressed="false"><span class="stamp-knob"></span><span class="stamp-face">${seal(c,i)}</span><span class="stamp-name">${esc(c.label)}</span></button>`).join('')}</div>
   <p class="stamp-status" aria-live="polite">Nimm einen Stempel in die Hand.</p></div>`;
  const stage=work.querySelector('.stamp-stage'),desk=work.querySelector('.stamp-desk'),file=work.querySelector('.stamp-file'),text=file.querySelector('.mg-text'),marks=file.querySelector('.stamp-marks'),hand=work.querySelector('.stamp-hand'),banner=stage.querySelector('.racer-banner'),dots=[...work.querySelectorAll('.racer-dots i')],status=work.querySelector('.stamp-status'),pile=work.querySelector('.stamp-pile');
  let mul=1,held=null,queue=shuffle(cfg.items),cur=null,x=0,speed=0,running=false,state='idle',last=0,bt=null,score=0,done=[];
  const say=(h,k,ms=4200)=>{banner.innerHTML=h;banner.className='racer-banner show '+(k||'');clearTimeout(bt);bt=setTimeout(()=>banner.className='racer-banner',ms);};
  function next(){if(!queue.length)queue=shuffle(cfg.items.filter(v=>!done.includes(v)));cur=queue.shift();text.textContent=cur.text;marks.innerHTML='';file.className='stamp-file case-file';file.querySelector('.case-file-no').textContent='Nr. '+(done.length+1);x=desk.clientWidth+10;state='move';place();}
  const center=()=>Math.max(0,(desk.clientWidth-file.offsetWidth)/2);
  function place(){file.style.transform=`translateX(${x}px) rotate(${Math.abs(x-center())>2?-2:0}deg)`;}
  function pick(i){held=held===i?null:i;work.querySelectorAll('.stamp-tool').forEach((b,k)=>{b.classList.toggle('held',k===held);b.setAttribute('aria-pressed',String(k===held));});
   hand.innerHTML=held===null?'':`<span class="stamp-face big">${seal(cfg.choices[held],'h'+held)}</span>`;hand.classList.toggle('on',held!==null);stage.classList.toggle('holding',held!==null);
   status.innerHTML=held===null?'Nimm einen Stempel in die Hand.':`In der Hand: <b>${esc(cfg.choices[held].label)}</b> – tippe jetzt auf die Akte.`;}
  work.querySelectorAll('.stamp-tool').forEach(b=>b.onclick=()=>pick(+b.dataset.i));
  stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();hand.style.left=(e.clientX-r.left)+'px';hand.style.top=(e.clientY-r.top)+'px';});
  stage.addEventListener('pointerleave',()=>hand.classList.add('away'));stage.addEventListener('pointerenter',()=>hand.classList.remove('away'));
  function hit(e){if(!running||state!=='move')return;if(held===null){say('Nimm zuerst unten einen Stempel in die Hand.','',2200);return;}
   const r=file.getBoundingClientRect(),sr=stage.getBoundingClientRect();const px=e?e.clientX-r.left:r.width*.7,py=e?e.clientY-r.top:r.height*.55;
   hand.style.left=(r.left-sr.left+px)+'px';hand.style.top=(r.top-sr.top+py)+'px';hand.classList.remove('press');void hand.offsetWidth;hand.classList.add('press');
   const chosen=held,good=cur.ok.includes(chosen);state='press';
   setTimeout(()=>{if(good){const m=document.createElement('span');m.className='stamp-print';const size=Math.min(128,r.width-16,r.height-16);m.style.width=m.style.height=size+'px';m.style.left=Math.max(8,Math.min(r.width-size-8,px-size/2))+'px';m.style.top=Math.max(8,Math.min(r.height-size-8,py-size/2))+'px';m.style.transform=`rotate(${Math.random()*24-12}deg)`;m.innerHTML=seal(cfg.choices[chosen],'p'+Math.random().toString(36).slice(2));marks.append(m);
     state='done';score++;done.push(cur);dots.forEach((d,i)=>d.classList.toggle('on',i<score));say(`<b>Richtig gestempelt!</b> ${esc(cur.why)}`,'good',2600);
     setTimeout(()=>{file.classList.add('filed');const c=document.createElement('i');pile.append(c);},900);
     if(score>=goal){running=false;setTimeout(()=>{work.querySelector('.mg-stamp').classList.add('is-intro');winScreen(ov,id,cfg.winTitle,cfg.win,done.map(v=>v.text));},1800);}else setTimeout(next,1700);}
    else{state='move';file.classList.remove('shake');void file.offsetWidth;file.classList.add('shake');say(`<b>Der Schreiber hält deine Hand fest:</b> „${esc(cfg.choices[chosen].label)}“ passt hier nicht. ${esc(cur.hint||cfg.hint||'')}`,'bad',4200);}},180);}
  file.addEventListener('click',e=>hit(e));file.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){hit();e.preventDefault();}});
  function key(e){if(!work.isConnected){removeEventListener('keydown',key);return;}const n=+e.key;if(n>=1&&n<=cfg.choices.length&&running){pick(n-1);}}
  addEventListener('keydown',key);
  function loop(now){if(!work.isConnected)return;const dt=Math.min(.1,(now-last)/1000||0);last=now;
   // Kein Zeitdruck: Die Akte gleitet nur in die Tischmitte und bleibt dort liegen.
   if(running&&state==='move'){const c=center();if(Math.abs(x-c)>.5){x+=(c-x)*Math.min(1,dt*7);place();}}
   else if(state==='done'&&!file.classList.contains('filed')){}
   requestAnimationFrame(loop);}
  const wrapper=work.querySelector('.mg-stamp');wrapper.classList.add('is-intro');
  const ov=document.createElement('section');ov.className='racer-overlay stamp-intro';
  ov.innerHTML=`<div class="stamp-intro-copy"><h3>${esc(cfg.title)}</h3><p>${esc(cfg.intro)}</p><ul>${cfg.rules.map(r=>`<li>${r}</li>`).join('')}</ul></div><button type="button" class="primary racer-start">Erste Akte holen</button>`;
  wrapper.append(ov);ov.querySelector('.racer-start').onclick=()=>{ov.hidden=true;wrapper.classList.remove('is-intro');running=true;next();last=performance.now();};
  requestAnimationFrame(loop);return true;
 }

 /* ---------- Die beiden Seilzüge: Holzklötze an Haken hängen, am Hebel ziehen ---------- */
 function ropes(id,cfg,work){
  const val={};cfg.lines.forEach((l,li)=>l.slots.forEach((_,si)=>val[li+'-'+si]=null));
  const lineHtml=(l,li)=>`<section class="rope-line" data-l="${li}"><span class="pulley top" aria-hidden="true"><i></i></span><span class="rope rope-top" aria-hidden="true"></span><header class="rope-sign"><b>${esc(l.title.split(' · ')[0])}</b><small>${esc(l.title.split(' · ')[1]||'')}</small></header><div class="rope-vert"><span class="rope" aria-hidden="true"></span><div class="hooks">${l.slots.map((sl,si)=>`<button type="button" class="hook" data-k="${li}-${si}" aria-label="${esc(l.title)}, Schritt ${si+1}: ${esc(sl)}"><span class="hook-tag">${si+1} · ${esc(sl)}</span><span class="hook-iron" aria-hidden="true"></span><span class="block-slot"></span></button>`).join('')}</div><span class="rope-weight" aria-hidden="true"></span></div></section>`;
  work.innerHTML=`<div class="racer mg-ropes"><div class="racer-stage rope-stage" style="--scene:url('assets/backgrounds/v3-temple.png')"><div class="gallows" aria-hidden="true"><span class="post left"></span><span class="post right"></span><span class="beam"></span></div>
   <div class="rope-cols">${lineHtml(cfg.lines[0],0)}<div class="rope-center"><div class="crate" role="group" aria-label="Holzklötze in der Kiste"><span class="crate-label">Kiste mit Holzklötzen</span><div class="crate-blocks">${cfg.blocks.map((b,i)=>`<button type="button" class="wood" data-b="${i}" aria-pressed="false"><span class="wood-ring" aria-hidden="true"></span>${esc(b)}</button>`).join('')}</div></div><div class="rope-chest" aria-hidden="true"><span class="chest-lid"></span><span class="chest-lock"></span><img class="chest-key" src="assets/inventory/key.svg" alt=""></div><button type="button" class="lever" aria-label="Am Hebel ziehen"><span class="lever-base" aria-hidden="true"></span><span class="lever-arm" aria-hidden="true"></span><span class="lever-text">Am Hebel ziehen</span></button></div>${lineHtml(cfg.lines[1],1)}</div>
   <div class="racer-banner" aria-live="polite"></div></div>
   <p class="stamp-status rope-status" aria-live="polite">Nimm einen Holzklotz aus der Kiste und häng ihn an einen Haken.</p></div>`;
  const stage=work.querySelector('.rope-stage'),banner=stage.querySelector('.racer-banner'),status=work.querySelector('.rope-status');let held=null,bt=null,phase='ropes';
  const say=(h,k,ms=4500)=>{banner.innerHTML=h;banner.className='racer-banner show '+(k||'');clearTimeout(bt);bt=setTimeout(()=>banner.className='racer-banner',ms);};
  function setHeld(i){held=held===i?null:i;work.querySelectorAll('.wood[data-b]').forEach(b=>{const on=+b.dataset.b===held;b.classList.toggle('held',on);b.setAttribute('aria-pressed',String(on));});status.innerHTML=held===null?'Nimm einen Holzklotz aus der Kiste und häng ihn an einen Haken.':`In der Hand: <b>${esc(cfg.blocks[held])}</b> – tippe auf einen Haken.`;}
  work.querySelectorAll('.wood[data-b]').forEach(b=>b.onclick=()=>setHeld(+b.dataset.b));
  work.querySelectorAll('.hook').forEach(h=>h.onclick=()=>{if(phase!=='ropes')return;const k=h.dataset.k,slot=h.querySelector('.block-slot');
   if(held===null){if(val[k]!==null){val[k]=null;slot.innerHTML='';h.classList.remove('filled','ok','bad');status.textContent='Klotz zurück in die Kiste gelegt.';}else say('Nimm zuerst einen Holzklotz aus der Kiste.','',2000);return;}
   val[k]=held;slot.innerHTML=`<span class="wood hanging"><span class="wood-ring" aria-hidden="true"></span>${esc(cfg.blocks[held])}</span>`;h.classList.add('filled');h.classList.remove('ok','bad');setHeld(held);});
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

 /* ---------- Kartenbrett 312: Beschriftungen auf eine gezeichnete Karte stecken ---------- */
 function battlemap(id,cfg,work){
  const rows=window.GAME.puzzles[id].rows;const val=rows.map(()=>null);const tags=[...new Set(rows.flatMap(r=>r.options))];let held=null,done=false,bt=null;
  work.innerHTML=`<div class="racer mg-bmap"><div class="bm-tags" role="group" aria-label="Beschriftungen">${shuffle(tags).map(t=>`<button type="button" class="bm-tag" data-t="${esc(t)}" aria-pressed="false">${esc(t)}</button>`).join('')}</div>
   <div class="racer-stage bm-stage"><svg class="bm-art" viewBox="0 0 1600 900" aria-hidden="true">
    <defs><radialGradient id="bm-bg" cx=".5" cy=".45" r=".8"><stop offset="0" stop-color="#f6e7c4"/><stop offset=".7" stop-color="#e6cd98"/><stop offset="1" stop-color="#c49f62"/></radialGradient><pattern id="bm-hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0v14" stroke="#8a6a3a" stroke-width="1.4" opacity=".35"/></pattern></defs>
    <rect width="1600" height="900" fill="url(#bm-bg)"/>
    <g fill="url(#bm-hatch)" stroke="#8a6a3a" stroke-width="2" opacity=".8"><path d="M40 120q90-70 180-10t160-20 120 60v60H40z"/><path d="M1220 80q70-50 150 0t140-10v90h-290z"/></g>
    <path d="M520-20C470 150 640 250 700 360S640 560 820 640 1020 760 980 920" fill="none" stroke="#6f9d96" stroke-width="95" stroke-linecap="round"/>
    <path d="M520-20C470 150 640 250 700 360S640 560 820 640 1020 760 980 920" fill="none" stroke="#a9ccc3" stroke-width="22" stroke-dasharray="46 34" opacity=".75"/>
    <g><path d="M560 400l290-10" stroke="#5a3a1c" stroke-width="54" stroke-linecap="round"/><path d="M560 400l290-10" stroke="#d9bf8a" stroke-width="36" stroke-linecap="round"/><g fill="#7a5230"><circle cx="630" cy="398" r="8"/><circle cx="705" cy="396" r="8"/><circle cx="780" cy="393" r="8"/></g></g>
    <path d="M200 420L560 400M850 390C960 400 1040 470 1080 560" fill="none" stroke="#8a6a3a" stroke-width="12" stroke-dasharray="4 18" stroke-linecap="round"/>
    <g transform="translate(1180 640)"><path d="M-190 0a190 150 0 1 0 380 0a190 150 0 1 0-380 0" fill="#d7b98a" stroke="#6b4a1c" stroke-width="12" stroke-dasharray="30 10"/>
     <g fill="#b8643a" stroke="#6b3a1c" stroke-width="3"><path d="M-80 20h60v-50h-60z"/><path d="M-90-30l40-30 40 30z"/><path d="M10 40h80v-40h-80z"/><path d="M0 0l50-34 50 34z"/><path d="M-30 90h70v-40h-70z"/><path d="M-40 50l45-26 45 26z"/><circle cx="-110" cy="70" r="22"/></g></g>
    <g transform="translate(260 520)"><g fill="#8a1a12" stroke="#4a0a06" stroke-width="3">${[0,1,2].map(r=>[0,1,2,3].map(c=>`<rect x="${c*44-88}" y="${r*40-40}" width="30" height="24" rx="4"/>`).join('')).join('')}</g><path d="M-120-80v-110" stroke="#5a3a1c" stroke-width="7"/><path d="M-120-190h90l-20 30 20 30h-90z" fill="#b3261e" stroke="#5a0a06" stroke-width="3"/><circle cx="-75" cy="-160" r="14" fill="#e7c27a"/></g>
    <g transform="translate(1020 290)"><g fill="#4a5a7a" stroke="#1a2230" stroke-width="3">${[0,1,2].map(r=>[0,1,2].map(c=>`<rect x="${c*44-66}" y="${r*40-40}" width="30" height="24" rx="4"/>`).join('')).join('')}</g><path d="M90-60v-110" stroke="#5a3a1c" stroke-width="7"/><path d="M90-170h90l-20 30 20 30h-90z" fill="#3a4a6b" stroke="#1a2230" stroke-width="3"/></g>
    <g stroke="#6b3a1c" stroke-width="10" stroke-linecap="round" fill="none"><path d="M420 470Q520 440 560 420"/><path d="M545 408l18 12-22 4"/></g>
    <g transform="translate(1420 160)" stroke="#6b4a1c" fill="#6b4a1c"><circle r="54" fill="none" stroke-width="3"/><path d="M0-66L10 0 0 66-10 0z" fill="#8a5a2e"/><path d="M-66 0L0-10 66 0 0 10z" fill="#b8955a"/><text y="-72" text-anchor="middle" font-size="28" stroke="none" font-family="Georgia">N</text></g>
    <g transform="translate(180 790)"><rect x="-150" y="-50" width="300" height="100" rx="10" fill="#f3e2bd" stroke="#6b4a1c" stroke-width="4"/><text y="-12" text-anchor="middle" font-size="26" font-family="Georgia" fill="#3a2610">Anno Domini</text></g>
    <rect x="8" y="8" width="1584" height="884" fill="none" stroke="#6b4a1c" stroke-width="6"/>
   </svg>
   ${cfg.pins.map((pn,i)=>`<button type="button" class="bm-pin" data-i="${i}" style="left:${pn[1]}%;top:${pn[2]}%"><span class="bm-q">${esc(rows[i].label)}</span><span class="bm-val">＋</span></button>`).join('')}
   <small class="bm-note">Spielskizze – keine genaue Karte der Schlacht</small><div class="racer-banner" aria-live="polite"></div></div>
   <div class="bm-bottom"><p class="stamp-status bm-status" aria-live="polite">Nimm oben eine Beschriftung und stecke sie an die passende Stelle der Karte.</p><button type="button" class="primary bm-check">Karte prüfen</button></div></div>`;
  const stage=work.querySelector('.bm-stage'),banner=stage.querySelector('.racer-banner'),status=work.querySelector('.bm-status');
  const say=(h,k,ms=4200)=>{banner.innerHTML=h;banner.className='racer-banner show '+(k||'');clearTimeout(bt);bt=setTimeout(()=>banner.className='racer-banner',ms);};
  const pins=[...work.querySelectorAll('.bm-pin')];
  cfg.pins.forEach((pn,i)=>{const r=rows.findIndex(x=>x.label===pn[0]);pins[i].dataset.row=r;pins[i].querySelector('.bm-q').textContent=pn[0];});
  function refresh(){pins.forEach(p=>{const r=+p.dataset.row,v=val[r];p.classList.toggle('filled',v!==null);p.querySelector('.bm-val').textContent=v===null?'＋':v;});work.querySelectorAll('.bm-tag').forEach(t=>t.classList.toggle('used',val.includes(t.dataset.t)));}
  work.querySelectorAll('.bm-tag').forEach(t=>t.onclick=()=>{held=held===t.dataset.t?null:t.dataset.t;work.querySelectorAll('.bm-tag').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.t===held)));stage.classList.toggle('holding',held!==null);status.innerHTML=held?`In der Hand: <b>${esc(held)}</b> – tippe auf eine Stelle der Karte.`:'Nimm oben eine Beschriftung und stecke sie an die passende Stelle der Karte.';});
  pins.forEach(p=>p.onclick=()=>{if(done)return;const r=+p.dataset.row;p.classList.remove('ok','bad');
   if(held===null){if(val[r]!==null){val[r]=null;refresh();}else say('Nimm zuerst oben eine Beschriftung.','',2000);return;}
   const prev=val.indexOf(held);if(prev>=0)val[prev]=null;val[r]=held;held=null;work.querySelectorAll('.bm-tag').forEach(x=>x.setAttribute('aria-pressed','false'));stage.classList.remove('holding');status.textContent='Gut. Nimm die nächste Beschriftung.';refresh();});
  work.querySelector('.bm-check').onclick=()=>{if(done)return;if(val.some(v=>v===null)){say(`Es fehlen noch <b>${val.filter(v=>v===null).length}</b> Beschriftungen.`,'bad',2400);return;}
   let wrong=null;pins.forEach(p=>{const r=+p.dataset.row,ok=rows[r].answer.map(a=>rows[r].options[a]).includes(val[r]);p.classList.remove('ok','bad');void p.offsetWidth;p.classList.add(ok?'ok':'bad');if(!ok&&!wrong)wrong=rows[r];});
   if(wrong){say(`<b>Da stimmt etwas nicht.</b> ${esc(wrong.feedback.replace(/^Sachfehler: /,''))}`.replace(/Die Stadt heißt Rom\.|Der Fluss ist der Tiber\.|Der Übergang ist die Milvische Brücke\.|Konstantin gewinnt\.|Konstantins Gegner ist Maxentius\.|Die Schlacht findet 312 statt\./,m=>'Frag noch einmal den Boten: Wer kämpfte wo gegen wen, und wann?'),'bad',4800);return;}
   done=true;stage.classList.add('won');say('<b>Die Karte ist vollständig!</b> Die Wachen geben den Weg zum Zelt frei.','good',2600);setTimeout(()=>{const o=document.createElement('div');o.className='racer-overlay';stage.append(o);winScreen(o,id,cfg.winTitle,cfg.win);},2200);};
  refresh();return true;
 }
 return {classify,darkroom,slider,lock,stamp,ropes,battlemap};
})();
