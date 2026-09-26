'use strict';
/* Rätsel-Nahansichten. Jedes Rätsel ist eine gemalte Bühne im Seitenverhältnis 16:9 (1600 × 900):
   – Bild = Gegenstand oder Umgebung (assets/puzzles/…)
   – HTML = Aufgaben, Aussagen, Beschriftungen, Rückmeldungen
   – unsichtbare Tippflächen (.w-hit) liegen über den gemalten Dingen
   – CSS = Zustände, Glanz, kleine Mechanik
   Ein Sieg meldet sich mit document.dispatchEvent(new CustomEvent('minigame-win',{detail:id})).
   Inhalte (Aussagen, richtig/falsch, Erklärungen) stehen in data/game-data.js unter GAME.minigames. */
window.MiniGames=(()=>{
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const win=id=>document.dispatchEvent(new CustomEvent('minigame-win',{detail:id}));
 const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const later=(root,ms,fn)=>setTimeout(()=>{if(root.isConnected)fn();},ms);
 const reduced=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 const P='assets/puzzles/';
 /* Aufräumen beim Schließen: globale Listener abmelden, Bühnen entfernen (beendet Timer und Animationsschleifen). */
 const live=new Set();const track=fn=>{live.add(fn);return fn;};
 function stop(){live.forEach(f=>{try{f();}catch(e){}});live.clear();document.querySelectorAll('#modal .scene-game').forEach(r=>r.remove());}
 const ART={
  door:P+'door/door-closeup.webp',
  roll:P+'forum/parchment-roll.webp',chronistin:P+'forum/chronistin.webp',
  desk:P+'office/desk.webp',stamps:['eagle','chirho','temple','scales'].map(n=>P+'office/stamp-'+n+'.webp'),
  beam:P+'sacrifice/beam.webp',base:P+'sacrifice/base.webp',board:P+'sacrifice/board.webp',hook:P+'sacrifice/hook.webp',lever:P+'sacrifice/lever.webp',
  cabinet:P+'archive/cabinet.webp',
  map:P+'camp/map-board.webp',pawn:P+'camp/pawn.webp',shield:P+'camp/chi-rho-shield.webp'
 };
 const BG={house:'assets/backgrounds/v3-house.png',forum:'assets/backgrounds/v3-forum.png',office:'assets/backgrounds/v3-office.png',temple:'assets/backgrounds/v3-temple.png',archive:'assets/backgrounds/v3-archive.png',camp:'assets/backgrounds/v3-camp.png'};

 /* Gemeinsamer Bühnenaufbau. blur: Hintergrund nur als unscharfe Umgebung. */
 function stage(work,cls,bg,inner,{blur=true}={}){
  document.querySelector('#modal')?.style.setProperty('--mg-backdrop',`url('${bg}')`);
  work.innerHTML=`<div class="scene-game world ${cls}" style="--bg:url('${bg}')"><div class="sg-stage"><div class="sg-bg${blur?' w-blur':''}" aria-hidden="true"></div>${inner}<p class="w-voice" role="status" aria-live="polite"></p></div></div>`;
  const root=work.querySelector('.scene-game');const v=root.querySelector('.w-voice');let t=null;
  root.say=(html,kind='',ms=0)=>{v.innerHTML=html;v.className='w-voice '+kind;v.classList.remove('pop');void v.offsetWidth;v.classList.add('pop');clearTimeout(t);if(ms)t=setTimeout(()=>{if(v.isConnected&&v.innerHTML===html)v.innerHTML='';},ms);};
  return root;
 }
 const pulse=(el,cls)=>{if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);};
 /* Abschluss als Pergamentrolle auf der Bühne. */
 function finale(root,id,title,text,{btn='Weiter',list=null}={}){
  const o=document.createElement('div');o.className='w-finale';
  o.innerHTML=`<div class="w-roll"><h3>${esc(title)}</h3><p>${esc(text)}</p>${list?`<ul class="w-list">${list.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}<button type="button" class="primary w-next">${esc(btn)}</button></div>`;
  root.querySelector('.sg-stage').append(o);const b=o.querySelector('.w-next');b.onclick=()=>win(id);b.focus?.({preventScroll:true});return o;
 }
 /* Einführung als Pergamentrolle mit Startknopf. */
 function intro(root,cfg,rules,btn,onStart){
  const o=document.createElement('div');o.className='w-intro';
  o.innerHTML=`<div class="w-roll"><h3>${esc(cfg.title)}</h3><p>${esc(cfg.intro)}</p><ul>${rules.map(r=>`<li>${r}</li>`).join('')}</ul><button type="button" class="primary w-start">${esc(btn)}</button></div>`;
  root.querySelector('.sg-stage').append(o);o.querySelector('.w-start').onclick=()=>{o.remove();root.classList.remove('w-before');onStart();};root.classList.add('w-before');return o;
 }
 const studs=(n,label)=>`<div class="w-studs" aria-label="${esc(label)}"><span>${esc(label)}</span>${Array.from({length:n},()=>'<i></i>').join('')}</div>`;
 const setStuds=(root,k)=>root.querySelectorAll('.w-studs i').forEach((d,i)=>d.classList.toggle('on',i<k));

 /* ================= 1. Wohnviertel · Türmechanik mit drei Walzen ================= */
 function lock(id,cfg,work){
  const rings=cfg.rings;const pos=rings.map(r=>Math.floor(Math.random()*r.options.length));
  rings.forEach((r,i)=>{if(pos[i]===r.answer)pos[i]=(pos[i]+1)%r.options.length;});
  const RN=['I','II','III','IV'];
  const root=stage(work,'door-game',BG.house,`
   <div class="door-light" aria-hidden="true"></div>
   <div class="door-leaf">
    <img class="w-img door-art" src="${ART.door}" alt="Nahansicht der Tür: Messingschloss mit Walzen und Türring" draggable="false">
    <div class="door-drums">${rings.map((r,i)=>`<div class="drum" data-i="${i}" role="spinbutton" tabindex="0" aria-label="Walze ${RN[i]}: ${esc(r.question)}"><span class="drum-no" aria-hidden="true">${RN[i]}</span><div class="drum-roll" aria-hidden="true"></div><button type="button" class="w-hit drum-up" data-i="${i}" data-d="-1" aria-label="Walze ${RN[i]} nach oben drehen"></button><button type="button" class="w-hit drum-down" data-i="${i}" data-d="1" aria-label="Walze ${RN[i]} nach unten drehen"></button></div>`).join('')}</div>
    <span class="door-bolt" aria-hidden="true"></span>
    <button type="button" class="w-hit door-ring" aria-label="Am Türring ziehen"></button>
    <span class="ring-tag" aria-hidden="true">Am Ring ziehen</span>
   </div>
   <aside class="door-note m-parch" aria-live="polite"></aside>`);
  const leaf=root.querySelector('.door-leaf'),note=root.querySelector('.door-note');let opened=false;
  const drums=[...root.querySelectorAll('.drum')];
  function draw(){
   drums.forEach((el,i)=>{const r=rings[i],n=r.options.length;el.querySelector('.drum-roll').innerHTML=[-1,0,1].map(o=>`<span class="dw ${o<0?'prev':o>0?'next':'cur'}">${esc(r.options[(pos[i]+o+n)%n])}</span>`).join('');el.setAttribute('aria-valuetext',r.options[pos[i]]);});
   note.innerHTML=`<h3>Die Inschrift der Walzen</h3>${rings.map((r,i)=>`<div class="dn-row"><span class="dn-q">${RN[i]} · ${esc(r.question)}</span><span class="dn-s">${esc(cfg.sentence[i].replace(/^→\s*/,''))} <b>${esc(r.options[pos[i]])}</b></span></div>`).join('<span class="dn-arrow" aria-hidden="true">↓</span>')}`;
  }
  function turn(i,d){if(opened)return;const n=rings[i].options.length;pos[i]=(pos[i]+d+n)%n;const el=drums[i];el.classList.remove('ok','bad','roll-up','roll-down');void el.offsetWidth;el.classList.add(d>0?'roll-down':'roll-up');draw();}
  root.querySelectorAll('.drum-up,.drum-down').forEach(b=>b.onclick=()=>turn(+b.dataset.i,+b.dataset.d));
  drums.forEach((el,i)=>{let sy=null;
   el.addEventListener('pointerdown',e=>{sy=e.clientY;});
   el.addEventListener('pointerup',e=>{if(sy===null)return;const dy=e.clientY-sy;sy=null;if(Math.abs(dy)>24){e.preventDefault();turn(i,dy<0?1:-1);el.dataset.swiped=Date.now();}});
   el.addEventListener('click',e=>{if(Date.now()-(+el.dataset.swiped||0)<400)e.stopPropagation();},true);
   el.addEventListener('keydown',e=>{if(e.key==='ArrowUp'){turn(i,-1);e.preventDefault();}if(e.key==='ArrowDown'){turn(i,1);e.preventDefault();}});});
  root.querySelector('.door-ring').onclick=()=>{if(opened)return;const wrong=[];
   drums.forEach((el,i)=>{const ok=pos[i]===rings[i].answer;el.classList.remove('ok','bad');void el.offsetWidth;if(!ok){el.classList.add('bad');wrong.push(rings[i]);}});
   if(wrong.length){pulse(leaf,'rattle');root.say(`<b>Die Tür klemmt.</b> ${wrong.length===1?'Eine Walze sitzt':'Noch '+wrong.length+' Walzen sitzen'} nicht richtig. ${esc(wrong[0].hint)}`,'bad');return;}
   opened=true;root.classList.add('unlocked');
   drums.forEach((el,i)=>later(root,i*220,()=>el.classList.add('ok','locked')));
   root.say('<b>Klick – klick – klick!</b> Die Walzen rasten ein, der Riegel gleitet zurück …','good');
   later(root,800,()=>leaf.classList.add('bolt-drawn'));
   later(root,1250,()=>pulse(leaf,'jolt'));
   later(root,1700,()=>root.classList.add('open'));
   later(root,reduced()?900:3200,()=>{root.say('');finale(root,id,cfg.winTitle,cfg.win);});};
  root.__debug={pos,rings,turn,ring:()=>root.querySelector('.door-ring').click()};
  draw();return true;
 }

 /* ================= 2. Forum · Die Chronistin ruft Aussagen zu ================= */
 function classify(id,cfg,work){
  const goal=cfg.goal;
  const root=stage(work,'forum-game',BG.forum,`
   <img class="w-img forum-chronistin" src="${ART.chronistin}" alt="Die Chronistin mit ihrer Schreibtafel" draggable="false">
   ${studs(goal,cfg.counter||'Belege')}
   <div class="w-speed" role="group" aria-label="Tempo"><span>Tempo</span>${[['Ruhig',1],['Normal',.75],['Schnell',.55]].map((o,i)=>`<button type="button" data-speed="${o[1]}" aria-pressed="${i===0}">${o[0]}</button>`).join('')}</div>
   <div class="forum-roll"><img class="w-img" src="${ART.roll}" alt="" draggable="false"><p class="forum-text mg-text" aria-live="polite"></p><div class="forum-wick" aria-hidden="true"><i></i></div></div>
   <div class="forum-boxes" role="group" aria-label="Quellenfächer">${cfg.choices.map((c,i)=>`<button type="button" class="forum-box m-wood mg-choice" data-i="${i}"><span class="fb-ico" aria-hidden="true">${esc(cfg.icons?.[i]||'')}</span><span class="fb-label">${esc(c)}</span></button>`).join('')}</div>`,{blur:false});
  const roll=root.querySelector('.forum-roll'),text=root.querySelector('.forum-text'),bar=root.querySelector('.forum-wick i'),boxes=[...root.querySelectorAll('.forum-box')];
  let mul=1,score=0,queue=shuffle(cfg.items),cur=null,left=0,total=0,running=false,locked=false,last=0,done=[];
  root.querySelectorAll('.w-speed button').forEach(b=>b.onclick=()=>{root.querySelectorAll('.w-speed button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));mul=+b.dataset.speed;b.blur();});
  function next(){if(!queue.length)queue=shuffle(cfg.items.filter(x=>!done.includes(x)));cur=queue.shift();total=left=cfg.time*mul;text.textContent=cur.text;locked=false;roll.classList.remove('filed','ok','bad');pulse(roll,'unroll');boxes.forEach(b=>b.classList.remove('ok','bad'));}
  function resolve(choice){if(locked||!running)return;locked=true;const good=choice!==null&&cur.ok.includes(choice);const box=boxes[choice];
   if(good){score++;done.push(cur);setStuds(root,score);roll.classList.add('filed','ok');pulse(box,'w-ok');box.classList.add('ok');root.say(`<b>Richtig.</b> ${esc(cur.why||'')}`,'good');}
   else{queue.push(cur);pulse(roll,'w-bad');roll.classList.add('bad');if(box)pulse(box,'w-bad');
    root.say(choice===null?`<b>Die Chronistin ist schon weiter.</b> Richtig wäre: ${esc(cur.ok.map(i=>cfg.choices[i]).join(' / '))}. ${esc(cur.why||'')}`:`<b>Nicht ganz.</b> Richtig: ${esc(cur.ok.map(i=>cfg.choices[i]).join(' / '))}. ${esc(cur.why||'')}`,'bad');}
   if(score>=goal){running=false;later(root,1400,()=>{root.say('');finale(root,id,cfg.winTitle,cfg.win,{list:done.map(x=>x.text)});});return;}
   later(root,good?1600:3400,next);}
  boxes.forEach(b=>b.onclick=()=>resolve(+b.dataset.i));
  function key(e){if(!work.isConnected){removeEventListener('keydown',key);return;}const n=+e.key;if(n>=1&&n<=cfg.choices.length&&running)resolve(n-1);}
  addEventListener('keydown',key);track(()=>removeEventListener('keydown',key));
  function loop(now){if(!root.isConnected)return;const dt=Math.min(.1,(now-last)/1000||0);last=now;
   if(running&&!locked){left-=dt;const f=Math.max(0,left/total);bar.style.transform=`scaleX(${f})`;bar.classList.toggle('late',f<.3);if(left<=0)resolve(null);}
   requestAnimationFrame(loop);}
  intro(root,cfg,cfg.rules,cfg.startLabel||'Los geht’s',()=>{running=true;next();last=performance.now();});
  root.__debug={resolve,cur:()=>cur,score:()=>score,start:()=>root.querySelector('.w-start')?.click()};
  requestAnimationFrame(loop);return true;
 }

 /* ================= 3. Amtsstube · Der Stempel des Statthalters ================= */
 function stamp(id,cfg,work){
  const goal=cfg.goal;
  const seal=(c,k)=>`<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="1.5"/><path id="arc${id}${k}" d="M18 50a32 32 0 0 1 64 0" fill="none"/><text font-size="11" font-weight="700" letter-spacing="2" fill="currentColor"><textPath href="#arc${id}${k}" startOffset="50%" text-anchor="middle">${esc(c.latin)}</textPath></text><text x="50" y="68" text-anchor="middle" font-size="36" font-weight="700" fill="currentColor">${esc(c.sym)}</text><text x="50" y="86" text-anchor="middle" font-size="7.5" font-weight="700" fill="currentColor">SPQR</text></svg>`;
  // Die vier gemalten Stempel: links zwei, rechts zwei neben der Akte
  const SPOTS=[[6.5,40],[18,46],[72,46],[83.5,40]];
  const root=stage(work,'office-game',BG.office,`
   <img class="w-img office-desk" src="${ART.desk}" alt="Der Amtsschreibtisch des Statthalters mit Papieren, Tinte und Siegelwachs" draggable="false">
   ${studs(goal,cfg.counter||'Akten')}
   <div class="office-pile" aria-hidden="true"></div>
   <article class="office-file m-parch case-file" aria-live="polite"><header><span class="of-kind">Fallakte · Sachverhalt</span><span class="of-no"></span></header><p class="of-text mg-text"></p><footer aria-hidden="true">Amtsstube des Statthalters</footer><div class="of-marks"></div></article>
   ${cfg.choices.map((c,i)=>`<button type="button" class="office-stamp stamp-tool" data-i="${i}" style="left:${SPOTS[i][0]}%;top:${SPOTS[i][1]}%"><img class="w-img" src="${ART.stamps[i]}" alt="" draggable="false">${ART.stamps[i].includes('chirho')?`<span class="os-face" aria-hidden="true">${seal(c,'f'+i)}</span>`:''}<span class="os-plate">${esc(c.label)}</span></button>`).join('')}`);
  const file=root.querySelector('.office-file'),text=root.querySelector('.of-text'),marks=root.querySelector('.of-marks'),pile=root.querySelector('.office-pile'),tools=[...root.querySelectorAll('.office-stamp')];
  let queue=shuffle(cfg.items),cur=null,running=false,busy=false,score=0,done=[];
  function next(){if(!queue.length)queue=shuffle(cfg.items.filter(v=>!done.includes(v)));cur=queue.shift();text.textContent=cur.text;marks.innerHTML='';file.classList.remove('filed');pulse(file,'slide-in');file.querySelector('.of-no').textContent='Nr. '+(done.length+1);busy=false;}
  function press(i){if(!running||busy)return;busy=true;const t=tools[i],c=cfg.choices[i],good=cur.ok.includes(i);
   const fr=file.getBoundingClientRect(),tr=t.getBoundingClientRect();const dx=fr.left+fr.width*.62-(tr.left+tr.width/2),dy=fr.top+fr.height*.55-(tr.top+tr.height*.78);
   t.style.setProperty('--dx',dx+'px');t.style.setProperty('--dy',dy+'px');t.classList.add('lift');
   later(root,reduced()?60:420,()=>{t.classList.add('press');
    later(root,160,()=>{
     if(good){const m=document.createElement('span');m.className='of-print';m.style.transform=`rotate(${Math.random()*20-10}deg)`;m.innerHTML=seal(c,'p'+Math.random().toString(36).slice(2));marks.append(m);
      score++;done.push(cur);setStuds(root,score);root.say(`<b>Richtig gestempelt.</b> ${esc(cur.why)}`,'good');pulse(file,'w-ok');}
     else{pulse(file,'w-bad');root.say(`<b>Der Schreiber hält deine Hand fest:</b> „${esc(c.label)}“ passt hier nicht. ${esc(cur.hint||cfg.hint||'')}`,'bad');}
     later(root,260,()=>{t.classList.remove('press');t.classList.remove('lift');});
     if(good){later(root,1100,()=>{file.classList.add('filed');pile.append(document.createElement('i'));});
      if(score>=goal){running=false;later(root,2000,()=>{root.say('');finale(root,id,cfg.winTitle,cfg.win,{list:done.map(v=>v.text)});});}else later(root,2000,next);}
     else later(root,500,()=>{busy=false;});
    });});
  }
  tools.forEach(t=>t.onclick=()=>press(+t.dataset.i));
  function key(e){if(!work.isConnected){removeEventListener('keydown',key);return;}const n=+e.key;if(n>=1&&n<=cfg.choices.length&&running)press(n-1);}
  addEventListener('keydown',key);track(()=>removeEventListener('keydown',key));
  intro(root,cfg,cfg.rules,'Erste Akte holen',()=>{running=true;next();});
  root.__debug={press,cur:()=>cur,score:()=>score,start:()=>root.querySelector('.w-start')?.click(),busy:()=>busy};
  return true;
 }

 /* ================= 4. Kontrollstelle · Die beiden Seilzüge ================= */
 function ropes(id,cfg,work){
  const val={};cfg.lines.forEach((l,li)=>l.slots.forEach((_,si)=>val[li+'-'+si]=null));
  const HOOK_Y=[27,44,61,78];
  const lineHtml=(l,li)=>`<section class="rope-line" data-l="${li}"><span class="rope-pulley" aria-hidden="true"></span><span class="rope-cord" aria-hidden="true"></span>
   <header class="rope-sign m-wood"><b>${esc(l.title.split(' · ')[0])}</b><small>${esc(l.title.split(' · ')[1]||'')}</small></header>
   ${l.slots.map((sl,si)=>`<button type="button" class="rope-hook hook" data-k="${li}-${si}" style="top:${HOOK_Y[si]}%" aria-label="${esc(l.title)}, Schritt ${si+1}: ${esc(sl)}"><img class="w-img" src="${ART.hook}" alt="" draggable="false"><span class="hook-tag">${si+1} · ${esc(sl)}</span><span class="block-slot"></span></button>`).join('')}</section>`;
  const board=(b,i,extra='')=>`<button type="button" class="rope-board wood" data-b="${i}" aria-pressed="false"${extra}><span class="rb-text">${esc(b)}</span></button>`;
  const root=stage(work,'rope-game',BG.temple,`
   <img class="w-img rope-beam" src="${ART.beam}" alt="" draggable="false">
   <span class="rope-post left" aria-hidden="true"></span><span class="rope-post right" aria-hidden="true"></span>
   <img class="w-img rope-base" src="${ART.base}" alt="" draggable="false">
   ${lineHtml(cfg.lines[0],0)}${lineHtml(cfg.lines[1],1)}
   <div class="rope-crate m-wood" role="group" aria-label="Holztafeln in der Kiste"><span class="crate-label">Holztafeln</span><div class="crate-boards">${cfg.blocks.map((b,i)=>board(b,i)).join('')}</div></div>
   <div class="rope-chest" aria-hidden="true"><span class="chest-lid"></span><span class="chest-body"></span><span class="chest-lock"></span><img class="chest-key" src="assets/inventory/key.svg" alt=""></div>
   <button type="button" class="rope-lever lever" aria-label="Am Hebel ziehen"><img class="w-img" src="${ART.lever}" alt="" draggable="false"><span class="lever-tag">Am Hebel ziehen</span></button>`);
  const status=root.say;let held=null,phase='ropes';
  function setHeld(i){held=held===i?null:i;root.querySelectorAll('.crate-boards .rope-board').forEach(b=>{const on=+b.dataset.b===held;b.classList.toggle('held',on);b.setAttribute('aria-pressed',String(on));});root.classList.toggle('holding',held!==null);
   if(held!==null)status(`In der Hand: <b>${esc(cfg.blocks[held])}</b> – tippe auf einen Haken.`);}
  root.querySelectorAll('.crate-boards .rope-board').forEach(b=>b.onclick=()=>setHeld(+b.dataset.b));
  root.querySelectorAll('.rope-hook').forEach(h=>h.onclick=()=>{if(phase!=='ropes')return;const k=h.dataset.k,slot=h.querySelector('.block-slot');
   if(held===null){if(val[k]!==null){val[k]=null;slot.innerHTML='';h.classList.remove('filled','ok','bad');status('Tafel zurück in die Kiste gelegt.');}else status('Nimm zuerst eine Holztafel aus der Kiste.');return;}
   val[k]=held;slot.innerHTML=`<span class="rope-board hanging"><span class="rb-text">${esc(cfg.blocks[held])}</span></span>`;h.classList.add('filled');h.classList.remove('ok','bad');pulse(slot.firstElementChild,'swing');setHeld(held);status('Die Tafel hängt. Nimm die nächste.');});
  root.querySelector('.rope-lever').onclick=()=>{
   if(phase!=='ropes')return;
   const empty=Object.values(val).filter(v=>v===null).length;if(empty){status(`Es hängen noch nicht alle Tafeln. <b>${empty}</b> Haken sind leer.`,'bad');return;}
   const lever=root.querySelector('.rope-lever');pulse(lever,'pulled');
   let wrong=null;cfg.lines.forEach((l,li)=>{let lineOk=true;l.slots.forEach((_,si)=>{const k=li+'-'+si,h=root.querySelector(`.rope-hook[data-k="${k}"]`);const ok=cfg.blocks[val[k]]===l.answer[si];h.classList.remove('ok','bad');void h.offsetWidth;if(!ok){h.classList.add('bad');lineOk=false;if(!wrong)wrong={l,si};}});root.querySelector(`.rope-line[data-l="${li}"]`).classList.toggle('taut',lineOk);});
   if(wrong){pulse(root.querySelector('.sg-stage'),'jam');status(`<b>Das Seil verklemmt sich.</b> Bei „${esc(wrong.l.title)}“ hängt am Haken „${esc(wrong.l.slots[wrong.si])}“ die falsche Tafel. ${esc(cfg.hint)}`,'bad');return;}
   phase='compare';root.classList.add('running');status('<b>Beide Seile spannen sich!</b> Die Rollen drehen sich – ein letzter Riegel hält die Truhe.','good');
   later(root,1800,()=>{const q=cfg.compare;const o=document.createElement('div');o.className='rope-riddle';o.innerHTML=`<p class="rr-q m-parch"><b>${esc(q.title)}</b>${esc(q.q)}</p><div class="rr-opts">${q.options.map((t,k)=>board(t,k,` data-k="${k}"`)).join('')}</div>`;root.querySelector('.sg-stage').append(o);
    o.querySelectorAll('.rope-board').forEach(b=>b.onclick=()=>{if(+b.dataset.k===q.answer){o.remove();phase='done';root.classList.add('chest-open');status('<b>Der Riegel springt auf.</b> In der Truhe liegt der Archivschlüssel.','good');later(root,reduced()?400:1600,()=>{root.say('');finale(root,id,cfg.winTitle,cfg.win,{btn:'Archivschlüssel nehmen'});});}
     else{b.disabled=true;pulse(b,'w-bad');status(esc(q.why),'bad');}});});};
  status('Nimm eine Holztafel aus der Kiste und häng sie an einen Haken.');
  root.__debug={val,cfg,lever:()=>root.querySelector('.rope-lever').click()};
  return true;
 }

 /* ================= 5. Archiv · Dunkelheit, Lampe und Archivmechanismus ================= */
 function darkroom(id,cfg,work){
  const spots=cfg.spots,goal=spots.length;
  // Vier Schubladen des gemalten Schranks (in % des Schrankbildes) · Mitte = Verriegelung
  const DRAWERS=[[22.9,18.6,18.8,12.9],[68,18.6,17.4,12.9],[22.9,49.3,18.8,13.4],[68,49.3,17.4,13.4]];
  const root=stage(work,'archive-game',BG.archive,`
   <div class="dark-room"><img class="w-img dark-art" src="${cfg.image}" alt="" draggable="false"><canvas aria-hidden="true"></canvas><div class="dark-spots"></div></div>
   ${studs(goal,'Spuren')}
   <div class="cab-view" hidden><div class="cabinet"><img class="w-img" src="${ART.cabinet}" alt="Der Archivschrank mit Schubladen und Verriegelung" draggable="false">
    ${cfg.measures.map((m,k)=>`<button type="button" class="w-hit cab-drawer" data-k="${k}" style="left:${DRAWERS[k][0]}%;top:${DRAWERS[k][1]}%;width:${DRAWERS[k][2]}%;height:${DRAWERS[k][3]}%" aria-label="Schublade: ${esc(m)}"><span class="cab-face" aria-hidden="true" style="background-position:${DRAWERS[k][0]/(100-DRAWERS[k][2])*100}% ${DRAWERS[k][1]/(100-DRAWERS[k][3])*100}%;background-size:${10000/DRAWERS[k][2]}% ${10000/DRAWERS[k][3]}%"></span></button>`).join('')}
    <span class="cab-core" aria-hidden="true"></span></div>
    ${cfg.measures.map((m,k)=>`<button type="button" class="cab-tag m-parch ${k%2?'right':'left'}" data-k="${k}" style="top:${DRAWERS[k][1]+2}%">${esc(m)}</button>`).join('')}
    <div class="cab-hand m-parch" aria-live="polite"></div></div>`,{blur:false});
  const room=root.querySelector('.dark-room'),canvas=room.querySelector('canvas'),ctx=canvas.getContext('2d'),layer=room.querySelector('.dark-spots'),cab=root.querySelector('.cab-view'),hand=root.querySelector('.cab-hand');
  let W=0,H=0,lx=.5,ly=.5,found=new Set(),running=false,holding=null,phase='search';
  spots.forEach((sp,i)=>{const b=document.createElement('button');b.type='button';b.className='dark-spot';b.style.left=sp.x+'%';b.style.top=sp.y+'%';b.setAttribute('aria-label',sp.name);b.onclick=e=>{e.stopPropagation();pick(i);};layer.append(b);});
  function paint(){const r=room.getBoundingClientRect();if(!r.width)return;const d=Math.min(2,devicePixelRatio||1);if(W!==r.width||H!==r.height){W=r.width;H=r.height;canvas.width=W*d;canvas.height=H*d;ctx.setTransform(d,0,0,d,0,0);}
   ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,W,H);ctx.fillStyle='rgba(8,6,4,.94)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='destination-out';const R=Math.min(W,H)*.22,x=lx*W,y=ly*H;const g=ctx.createRadialGradient(x,y,R*.2,x,y,R);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.7,'rgba(0,0,0,.85)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,R,0,7);ctx.fill();
   ctx.globalCompositeOperation='source-over';ctx.fillStyle='rgba(255,190,90,.10)';ctx.beginPath();ctx.arc(x,y,R,0,7);ctx.fill();
   layer.querySelectorAll('.dark-spot').forEach((b,i)=>{const sp=spots[i];const dist=Math.hypot((sp.x/100-lx)*W,(sp.y/100-ly)*H);b.classList.toggle('lit',dist<R*.75);b.classList.toggle('found',found.has(i));});}
  const ro=typeof ResizeObserver==='function'?new ResizeObserver(()=>{if(!root.isConnected){ro.disconnect();return;}paint();}):null;ro?.observe(room);if(ro)track(()=>ro.disconnect());
  function move(e){const r=room.getBoundingClientRect();lx=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));ly=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));paint();}
  room.addEventListener('pointermove',move);room.addEventListener('pointerdown',e=>{move(e);if(running&&e.target===canvas)root.say('Hier ist nichts Besonderes. Leuchte weiter herum.','',1800);});
  function showCabinet(on){cab.hidden=!on;root.classList.toggle('at-cabinet',on);}
  function pick(i){if(!running||phase!=='search')return;const sp=spots[i];if(found.has(i)){root.say(`Diese Spur hast du schon: ${esc(sp.name)}.`,'',1600);return;}
   const b=layer.children[i];if(!b.classList.contains('lit')){root.say('Zu dunkel – leuchte erst mit der Lampe dorthin.','',1800);return;}
   holding=i;phase='file';hand.innerHTML=`<b>${esc(sp.name)}</b><span>${esc(sp.look)}</span><em>Welche Maßnahme von 303 erklärt diese Spur? Lege sie in die passende Schublade.</em>`;showCabinet(true);root.say('');}
  function file(k){if(phase!=='file')return;const sp=spots[holding];const drawer=root.querySelector(`.cab-drawer[data-k="${k}"]`),tag=root.querySelector(`.cab-tag[data-k="${k}"]`);
   if(k===sp.answer){found.add(holding);setStuds(root,found.size);drawer.classList.add('open');tag.classList.add('filled');root.say(`<b>Die Schublade nimmt die Spur auf.</b> ${esc(sp.why)}`,'good');phase='busy';
    later(root,1300,()=>{drawer.classList.remove('open');drawer.classList.add('done');pulse(drawer,'w-ok');});
    later(root,2300,()=>{if(found.size>=goal){final();}else{phase='search';showCabinet(false);paint();}});}
   else{pulse(drawer,'w-bad');pulse(tag,'w-bad');root.say(`<b>Die Schublade klemmt.</b> ${esc(sp.hint)}`,'bad');}}
  root.querySelectorAll('.cab-drawer,.cab-tag').forEach(b=>b.onclick=()=>file(+b.dataset.k));
  function final(){phase='final';const f=cfg.final;hand.innerHTML=`<b>Alle vier Spuren liegen im Schrank.</b><em>${esc(f.q)}</em>`;root.classList.add('core-ready');
   const box=document.createElement('div');box.className='cab-final';box.innerHTML=f.options.map((m,k)=>`<button type="button" class="m-parch" data-k="${k}">${esc(m)}</button>`).join('');cab.append(box);
   box.querySelectorAll('button').forEach(x=>x.onclick=()=>{if(+x.dataset.k===f.answer){box.remove();running=false;root.classList.add('core-turn');root.say('<b>Die Verriegelung dreht sich.</b> Im ganzen Archiv wird es hell.','good');
     later(root,1200,()=>{showCabinet(false);root.classList.add('lit-up');});later(root,reduced()?1400:2800,()=>{root.say('');finale(root,id,cfg.winTitle,cfg.win,{list:spots.map(s=>s.name+': '+cfg.measures[s.answer])});});}
    else{x.disabled=true;pulse(x,'w-bad');root.say(esc(f.why),'bad');}});}
  intro(root,cfg,cfg.rules,'Lampe hochhalten',()=>{running=true;paint();});
  root.__debug={pick,file,spots,light:(x,y)=>{lx=x;ly=y;paint();},phase:()=>phase,final:()=>root.querySelector('.cab-final')};
  requestAnimationFrame(paint);return true;
 }

 /* ================= 6. Tiber · Das Zeichen auf dem Schild ================= */
 function slider(id,cfg,work){
  const N=3,img=ART.shield;
  const root=stage(work,'shield-game',BG.camp,`
   <div class="shield-side">
    <div class="w-plaque m-wood"><span>Züge</span><b class="mg-moves">0</b></div>
    <div class="w-speed vertical" role="group" aria-label="Schwierigkeit"><button type="button" data-mode="swap" aria-pressed="true">Tauschen · leicht</button><button type="button" data-mode="slide" aria-pressed="false">Schieben · knifflig</button></div>
    <button type="button" class="shield-peek" aria-pressed="false">Vorlage zeigen</button>
   </div>
   <div class="shield-frame"><div class="slider-board"></div><img class="w-img slider-peek" src="${img}" alt="Vorlage: bemalter Schild mit Christusmonogramm" hidden></div>`);
  const board=root.querySelector('.slider-board'),movesEl=root.querySelector('.mg-moves'),peek=root.querySelector('.slider-peek');
  let mode='swap',tiles=[],sel=null,moves=0,solved=false;
  const neighbors=i=>{const r=Math.floor(i/N),c=i%N,o=[];if(r)o.push(i-N);if(r<N-1)o.push(i+N);if(c)o.push(i-1);if(c<N-1)o.push(i+1);return o;};
  function setup(){moves=0;movesEl.textContent=0;sel=null;tiles=[...Array(N*N).keys()];
   if(mode==='swap'){do{tiles=shuffle(tiles);}while(tiles.every((t,i)=>t===i));}
   else{let blank=N*N-1,prev=-1;for(let k=0;k<80;k++){const nb=neighbors(blank).filter(x=>x!==prev);const nx=nb[Math.floor(Math.random()*nb.length)];[tiles[blank],tiles[nx]]=[tiles[nx],tiles[blank]];prev=blank;blank=nx;}if(tiles.every((t,i)=>t===i))return setup();}
   draw();}
  function draw(){board.innerHTML='';tiles.forEach((t,i)=>{const b=document.createElement('button');b.type='button';const blank=mode==='slide'&&t===N*N-1&&!solved;b.className='tile'+(blank?' blank':'')+(sel===i?' sel':'');if(!blank){b.style.backgroundImage=`url("${img}")`;b.style.backgroundPosition=`${(t%N)*50}% ${Math.floor(t/N)*50}%`;}b.setAttribute('aria-label','Teil '+(t+1));b.onclick=()=>tap(i);board.append(b);});}
  function tap(i){if(solved)return;
   if(mode==='swap'){if(sel===null){sel=i;draw();return;}if(sel!==i){[tiles[sel],tiles[i]]=[tiles[i],tiles[sel]];moves++;}sel=null;}
   else{const blank=tiles.indexOf(N*N-1);if(!neighbors(blank).includes(i)){root.say('Nur Teile neben der Lücke lassen sich schieben.','',1500);return;}[tiles[blank],tiles[i]]=[tiles[i],tiles[blank]];moves++;}
   movesEl.textContent=moves;draw();if(tiles.every((t,k)=>t===k)){solved=true;draw();root.classList.add('shield-whole');root.say('<b>Das Zeichen ist wieder vollständig.</b>','good');later(root,reduced()?600:2200,quiz);}}
  root.querySelectorAll('.w-speed button').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;root.querySelectorAll('.w-speed button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));solved=false;root.classList.remove('shield-whole');setup();});
  root.querySelector('.shield-peek').onclick=e=>{peek.hidden=!peek.hidden;e.currentTarget.setAttribute('aria-pressed',String(!peek.hidden));e.currentTarget.textContent=peek.hidden?'Vorlage zeigen':'Vorlage verbergen';};
  function quiz(){const q=cfg.quiz;let i=0;root.classList.add('quiz');const box=document.createElement('div');box.className='shield-quiz';root.querySelector('.sg-stage').append(box);root.say('');
   function show(){const it=q.items[i];box.innerHTML=`<div class="sq-head m-parch"><h3>${esc(q.title)}</h3>${i===0?`<p>${esc(q.intro)}</p>`:''}<p class="quiz-count">Aussage ${i+1} von ${q.items.length}</p><blockquote class="quiz-item">${esc(it.text)}</blockquote></div><div class="sq-opts">${q.choices.map((c,k)=>`<button type="button" class="m-wax" data-k="${k}"><b>${esc(c)}</b>${q.legend?.[k]?`<small>${esc(q.legend[k])}</small>`:''}</button>`).join('')}</div>`;
    box.querySelectorAll('.sq-opts button').forEach(x=>x.onclick=()=>{const k=+x.dataset.k;if(it.ok.includes(k)){root.say('<b>Richtig.</b> '+esc(it.why),'good');box.querySelectorAll('.sq-opts button').forEach(y=>y.disabled=true);x.classList.add('right');later(root,2000,()=>{i++;if(i<q.items.length)show();else{box.remove();root.say('');finale(root,id,cfg.winTitle,cfg.win);}});}else{x.disabled=true;pulse(x,'w-bad');root.say('<b>Noch nicht.</b> '+esc(it.wrong?.[k]||it.hint),'bad');}});}
   show();}
  intro(root,cfg,cfg.rules,'Puzzle beginnen',()=>{});
  root.__debug={tiles:()=>tiles,solve:()=>{mode='swap';tiles=[...Array(N*N).keys()];[tiles[0],tiles[1]]=[tiles[1],tiles[0]];sel=0;tap(1);},tap};
  setup();return true;
 }

 /* ================= 7. Tiber · Das Kartenbrett von 312 ================= */
 function battlemap(id,cfg,work){
  const rows=window.GAME.puzzles[id].rows;const val=rows.map(()=>null);const tags=[...new Set(rows.flatMap(r=>r.options))];let held=null,done=false;
  const root=stage(work,'map-game',BG.camp,`
   <div class="map-board"><img class="w-img" src="${ART.map}" alt="Illustriertes Kartenbrett: Stadt, Fluss mit Brücken, Heerlager und Fahnen" draggable="false">
    ${cfg.pins.map((pn,i)=>`<button type="button" class="map-spot bm-pin" data-i="${i}" style="left:${pn[1]}%;top:${pn[2]}%"><span class="ms-q">${esc(pn[0])}</span><span class="ms-socket" aria-hidden="true"></span></button>`).join('')}
    <small class="map-note">Spielskizze – keine genaue Karte der Schlacht</small></div>
   <div class="map-tray m-wood" role="group" aria-label="Marker mit Beschriftungen"><span class="mt-title">Marker</span>${shuffle(tags).map(t=>`<button type="button" class="map-marker bm-tag" data-t="${esc(t)}" aria-pressed="false"><img class="w-img" src="${ART.pawn}" alt="" draggable="false"><span class="mm-label">${esc(t)}</span></button>`).join('')}</div>
   <button type="button" class="map-check m-bronze bm-check">Karte prüfen</button>`);
  const pins=[...root.querySelectorAll('.map-spot')],markers=[...root.querySelectorAll('.map-marker')],tray=root.querySelector('.map-tray');
  cfg.pins.forEach((pn,i)=>{pins[i].dataset.row=rows.findIndex(x=>x.label===pn[0]);});
  const markerFor=t=>markers.find(m=>m.dataset.t===t);
  function place(m,target){const from=m.getBoundingClientRect();target.append(m);const to=m.getBoundingClientRect();if(!reduced()&&from.width){m.animate?.([{transform:`translate(${from.left-to.left}px,${from.top-to.top}px)`},{transform:'none'}],{duration:420,easing:'cubic-bezier(.3,1.3,.5,1)'});}}
  function refresh(){pins.forEach(p=>{const v=val[+p.dataset.row];p.classList.toggle('filled',v!==null);});markers.forEach(m=>m.classList.toggle('placed',val.includes(m.dataset.t)));}
  function hold(t){held=held===t?null:t;markers.forEach(m=>m.setAttribute('aria-pressed',String(m.dataset.t===held)));root.classList.toggle('holding',held!==null);if(held)root.say(`Marker <b>${esc(held)}</b> in der Hand – tippe auf die passende Stelle der Karte.`);}
  markers.forEach(m=>m.onclick=e=>{e.stopPropagation();if(done)return;if(m.classList.contains('placed')&&held===null){const r=val.indexOf(m.dataset.t);if(r>=0){val[r]=null;place(m,tray);refresh();root.say('Marker zurück auf das Brett gelegt.');}return;}hold(m.dataset.t);});
  pins.forEach(p=>p.onclick=()=>{if(done)return;const r=+p.dataset.row;p.classList.remove('ok','bad');
   if(held===null){if(val[r]!==null){const m=markerFor(val[r]);val[r]=null;place(m,tray);refresh();}else root.say('Nimm zuerst rechts einen Marker.','',2000);return;}
   const prev=val.indexOf(held);if(prev>=0)val[prev]=null;if(val[r]!==null)place(markerFor(val[r]),tray);val[r]=held;const m=markerFor(held);place(m,p);pulse(m,'w-snap');held=null;markers.forEach(x=>x.setAttribute('aria-pressed','false'));root.classList.remove('holding');root.say('Der Marker rastet ein. Nimm den nächsten.');refresh();});
  root.querySelector('.map-check').onclick=()=>{if(done)return;if(val.some(v=>v===null)){root.say(`Es fehlen noch <b>${val.filter(v=>v===null).length}</b> Marker.`,'bad');return;}
   let wrong=null;pins.forEach(p=>{const r=+p.dataset.row,ok=rows[r].answer.map(a=>rows[r].options[a]).includes(val[r]);p.classList.remove('ok','bad');void p.offsetWidth;p.classList.add(ok?'ok':'bad');if(!ok&&!wrong)wrong=rows[r];});
   if(wrong){root.say('<b>Da stimmt etwas nicht.</b> Frag noch einmal den Boten: Wer kämpfte wo gegen wen, und wann?','bad');return;}
   done=true;root.classList.add('won');root.say('<b>Die Karte ist vollständig.</b> Die Wachen geben den Weg zum Zelt frei.','good');later(root,reduced()?600:2200,()=>{root.say('');finale(root,id,cfg.winTitle,cfg.win);});};
  root.say('Nimm rechts einen Marker und stecke ihn an die passende Stelle der Karte.');
  root.__debug={val,rows,pins,markers};
  refresh();return true;
 }
 return {classify,darkroom,slider,lock,stamp,ropes,battlemap,stop,_:{stage,finale,intro,esc,shuffle,later,pulse,reduced,studs,setStuds,ART}};
})();
