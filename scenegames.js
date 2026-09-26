'use strict';
/* Szenen-Rätsel im Stil eines gezeichneten Adventures:
   – citychange: „Vorher und Nachher“ in der geöffneten Stadt (313)
   – konzil:     „Beratung im Konzil“ (Nicäa 325), mehrere Gesprächsrunden
   – chronik:    „Die Zeitmechanik“ als große Chronik mit sechs Jahresabschnitten
   Inhalte stehen in data/game-data.js unter GAME.minigames. Ein Sieg meldet sich wie alle
   Minispiele mit document.dispatchEvent(new CustomEvent('minigame-win',{detail:id})).
   Grafiken kommen aus assets/minigames/…; fehlt eine Datei, schaltet .sg-no-art auf einen
   neutralen gezeichneten Ersatz um. Bedienung: antippen und ablegen (Tippen – Tippen)
   oder ziehen mit Pointer Events. Kein Hover nötig. */
(()=>{
 if(!window.MiniGames)window.MiniGames={};
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const win=id=>document.dispatchEvent(new CustomEvent('minigame-win',{detail:id}));
 const SHEET=[1672,941];

 /* Ausschnitt aus einem Bogen mit mehreren Grafiken – als CSS-Hintergrund, skaliert mit dem Element. */
 function sprite(url,[x,y,w,h],cls='',label=''){
  const [SW,SH]=SHEET;const px=SW===w?0:x/(SW-w)*100,py=SH===h?0:y/(SH-h)*100;
  return `<span class="sg-sprite ${cls}" role="img" aria-label="${esc(label)}" style="aspect-ratio:${w}/${h};background-image:url('${url}');background-size:${SW/w*100}% ${SH/h*100}%;background-position:${px}% ${py}%"></span>`;
 }
 /* Prüfen, ob eine Grafik geladen werden kann; sonst neutraler Ersatz. */
 function probe(root,urls){
  if(typeof Image==='undefined')return;
  urls.forEach(u=>{const im=new Image();im.onerror=()=>{if(root.isConnected)root.classList.add('sg-no-art');};im.src=u;});
 }
 const pending=new Set(),previousStop=window.MiniGames.stop;
 window.MiniGames.stop=()=>{pending.forEach(clearTimeout);pending.clear();previousStop?.();};
 const later=(root,ms,fn)=>{const t=setTimeout(()=>{pending.delete(t);if(root.isConnected)fn();},ms);pending.add(t);return t;};

 /* Antippen-und-Ablegen oder Ziehen. cards: Elemente mit data-card, targets: Elemente mit data-target. */
 function placement(root,{cardSel,targetSel,onDrop,onSelect}){
  let chosen=null,drag=null,skipClick=0;
  const select=c=>{chosen=c;root.querySelectorAll(cardSel).forEach(x=>{x.classList.toggle('chosen',x===c);x.setAttribute('aria-pressed',String(x===c));});root.classList.toggle('sg-choosing',!!c);onSelect?.(c);};
  root.addEventListener('pointerdown',e=>{
   const c=e.target.closest?.(cardSel);if(!c||c.disabled||c.classList.contains('placed'))return;
   drag={card:c,x:e.clientX,y:e.clientY,id:e.pointerId,moved:false,ghost:null};
  });
  root.addEventListener('pointermove',e=>{
   if(!drag||e.pointerId!==drag.id)return;
   const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
   if(!drag.moved&&Math.hypot(dx,dy)<12)return;
   if(!drag.moved){drag.moved=true;select(drag.card);const r=drag.card.getBoundingClientRect(),rr=root.getBoundingClientRect();
    const g=drag.card.cloneNode(true);g.classList.remove('chosen','lifted','shake');g.classList.add('sg-ghost');g.style.width=r.width+'px';g.style.height=r.height+'px';g.style.left=(r.left-rr.left)+'px';g.style.top=(r.top-rr.top)+'px';root.append(g);drag.ghost=g;drag.card.classList.add('lifted');try{root.setPointerCapture(e.pointerId);}catch(_){}}
   drag.ghost.style.transform=`translate(${dx}px,${dy}px) rotate(-3deg)`;
   const over=document.elementFromPoint?.(e.clientX,e.clientY)?.closest?.(targetSel);
   root.querySelectorAll(targetSel).forEach(t=>t.classList.toggle('over',t===over));
   e.preventDefault();
  });
  const end=e=>{
   if(!drag||e.pointerId!==drag.id)return;const d=drag;drag=null;
   if(d.moved){skipClick=Date.now();d.ghost?.remove();d.card.classList.remove('lifted');root.querySelectorAll(targetSel).forEach(t=>t.classList.remove('over'));
    const t=document.elementFromPoint?.(e.clientX,e.clientY)?.closest?.(targetSel);select(null);if(t)onDrop(d.card,t);}
  };
  root.addEventListener('pointerup',end);root.addEventListener('pointercancel',e=>{if(drag){drag.ghost?.remove();drag.card.classList.remove('lifted');drag=null;}});
  // Tippen – Tippen (auch Tastatur über click)
  root.addEventListener('click',e=>{
   if(Date.now()-skipClick<400)return;
   const c=e.target.closest?.(cardSel);if(c&&!c.classList.contains('placed')){select(chosen===c?null:c);return;}
   const t=e.target.closest?.(targetSel);if(t&&chosen){const c2=chosen;select(null);onDrop(c2,t);}
  });
  return {select,get chosen(){return chosen;}};
 }

 /* ================= 1. Die geöffnete Stadt: Vorher und Nachher ================= */
 function citychange(id,cfg,work){
  const A=cfg.art||{};
  const icon=c=>{
   if(c.sheet)return sprite(A[c.sheet],c.rect,'sg-icon',c.text);
   return `<span class="sg-icon sg-svg" aria-hidden="true">${ICONS[c.icon]||''}</span>`;
  };
  const cards=shuffle(cfg.cards.map((c,i)=>({...c,i})));
  work.innerHTML=`<div class="scene-game city-game" style="--bg:url('${A.bg}')">
   <div class="sg-stage">
    <div class="sg-bg" aria-hidden="true"></div>
    <section class="city-board before" data-target="vorher" aria-label="Tafel: Vor dem Wandel"><header><span>Vor dem Wandel</span><small>bis 311</small></header><div class="city-slots"></div></section>
    <section class="city-board after" data-target="danach" aria-label="Tafel: Nach dem Wandel"><header><span>Nach dem Wandel</span><small>ab 311 / 313</small></header><div class="city-slots"></div></section>
    <button type="button" class="city-altar" data-target="falsch" aria-label="Am Altar ablegen: Stimmt so nicht"><span class="altar-fire" aria-hidden="true"></span><span class="altar-plaque">Stimmt so nicht</span></button>
    <div class="city-rope" role="group" aria-label="Wachstafeln zum Zuordnen">${cards.map(c=>`<button type="button" class="city-card${c.text.length>40?' long':''}" data-card="${c.i}" aria-pressed="false">${icon(c)}<span class="sg-text">${esc(c.text)}</span></button>`).join('')}</div>
    <p class="sg-voice" role="status" aria-live="polite">${esc(cfg.start)}</p>
   </div></div>`;
  const root=work.querySelector('.scene-game'),voice=root.querySelector('.sg-voice');
  probe(root,[A.bg,...new Set(cfg.cards.filter(c=>c.sheet).map(c=>A[c.sheet]))]);
  let done=0;const total=cfg.cards.length;
  const say=(t,k='')=>{voice.textContent=t;voice.className='sg-voice '+k;voice.classList.remove('pop');void voice.offsetWidth;voice.classList.add('pop');};
  placement(root,{cardSel:'.city-card',targetSel:'[data-target]',onDrop(card,t){
   const c=cfg.cards[+card.dataset.card],side=t.dataset.target;
   if(c.side===side){
    card.classList.add('placed');card.classList.remove('chosen');card.disabled=true;
    if(side==='falsch'){t.classList.add('has-card');t.querySelector('.altar-plaque').textContent='Stimmt so nicht ✓';card.classList.add('struck');t.append(card);say(cfg.falseRight,'good');}
    else{t.querySelector('.city-slots').append(card);say(c.why||'Richtig.','good');}
    root.classList.remove('sg-choosing');done++;
    if(done===total){root.classList.add('solved');later(root,1400,finish);}
   }else{
    card.classList.remove('shake');void card.offsetWidth;card.classList.add('shake');
    say(c.side==='falsch'?cfg.falseWrong:side==='falsch'?cfg.notFalse:(c.wrong||'Überlege noch einmal: vor oder nach dem Wandel?'),'bad');
   }
  }});
  function finish(){const o=document.createElement('div');o.className='sg-finale';o.innerHTML=`<div class="sg-scroll"><h3>${esc(cfg.winTitle)}</h3><p>${esc(cfg.win)}</p><button type="button" class="primary sg-next">Weiter</button></div>`;root.querySelector('.sg-stage').append(o);o.querySelector('.sg-next').onclick=()=>win(id);}
  root.__debug={cards:cfg.cards};
  return true;
 }
 const ICONS={
  'decree':'<svg viewBox="0 0 64 64"><rect x="12" y="12" width="40" height="40" rx="3" fill="#efe0bd" stroke="#6b4a22" stroke-width="3"/><path d="M8 12h48M8 52h48" stroke="#6b4a22" stroke-width="5" stroke-linecap="round"/><path d="M20 22h24M20 29h24M20 36h14" stroke="#6b4a22" stroke-width="2.5"/><circle cx="42" cy="43" r="6" fill="#a8322a" stroke="#5a1a10" stroke-width="2"/></svg>',
  'door-shut':'<svg viewBox="0 0 64 64"><path d="M14 58V22a18 18 0 0 1 36 0v36z" fill="#6b4424" stroke="#3b2412" stroke-width="3"/><path d="M32 6v52M14 30h36" stroke="#3b2412" stroke-width="2.5"/><path d="M8 38h48" stroke="#2a1a0c" stroke-width="7" stroke-linecap="round"/><circle cx="40" cy="46" r="2.5" fill="#d9a441"/></svg>',
  'scroll-cross':'<svg viewBox="0 0 64 64"><rect x="12" y="14" width="40" height="36" rx="3" fill="#efe0bd" stroke="#6b4a22" stroke-width="3"/><path d="M20 24h24M20 32h24M20 40h16" stroke="#8c422a" stroke-width="2.5"/><path d="M8 8l48 48M56 8L8 56" stroke="#8c2a1a" stroke-width="5" stroke-linecap="round" opacity=".85"/></svg>'
 };

 /* ================= 2. Beratung im Konzil ================= */
 function konzil(id,cfg,work){
  const A=cfg.art||{};const P=cfg.people;
  work.innerHTML=`<div class="scene-game council-game" style="--bg:url('${A.bg}')">
   <div class="sg-stage">
    <div class="sg-bg" aria-hidden="true"></div>
    <div class="council-round" aria-live="polite"></div>
    <div class="council-people">${P.map((p,i)=>`<figure class="council-person" data-p="${i}" style="--x:${p.x}%;--h:${p.h||1}">${sprite(A.people,p.rect,'council-figure',p.name)}<figcaption>${esc(p.name)}</figcaption></figure>`).join('')}</div>
    <div class="council-bubble" role="status" aria-live="polite"><span class="who"></span><p></p></div>
    <div class="council-answers" role="group" aria-label="Antworten"></div>
   </div></div>`;
  const root=work.querySelector('.scene-game'),bubble=root.querySelector('.council-bubble'),answers=root.querySelector('.council-answers'),roundEl=root.querySelector('.council-round');
  probe(root,[A.bg,A.people]);
  let r=0,busy=false;
  const people=[...root.querySelectorAll('.council-person')];
  function speak(pi,text,kind=''){people.forEach((f,k)=>{f.classList.toggle('speaking',k===pi);});const p=P[pi];bubble.querySelector('.who').textContent=p.name;bubble.querySelector('p').textContent=text;bubble.className='council-bubble show '+kind+(p.x>50?' right':' left');bubble.style.setProperty('--x',p.x+'%');bubble.classList.remove('pop');void bubble.offsetWidth;bubble.classList.add('pop');}
  function react(pi,cls){const f=people[pi];f.classList.remove('nod','shake');void f.offsetWidth;f.classList.add(cls);}
  function show(){const R=cfg.rounds[r];busy=false;roundEl.innerHTML=cfg.rounds.map((_,k)=>`<i class="${k<r?'done':k===r?'now':''}"></i>`).join('')+`<span>Beratung ${r+1} von ${cfg.rounds.length}</span>`;
   speak(R.who,R.q);answers.innerHTML='';
   shuffle(R.options.map((o,i)=>({o,i}))).forEach(({o,i})=>{const b=document.createElement('button');b.type='button';b.className='council-answer';b.dataset.i=i;b.textContent=o.text;b.onclick=()=>answer(i,b);answers.append(b);});}
  function answer(i,b){if(busy)return;const R=cfg.rounds[r],o=R.options[i];
   if(o.ok){busy=true;b.classList.add('right');react(R.who,'nod');speak(o.by??R.who,o.reply,'good');answers.querySelectorAll('button').forEach(x=>x.disabled=true);
    later(root,2600,()=>{r++;if(r<cfg.rounds.length)show();else finish();});}
   else{b.classList.add('tried');b.disabled=true;const by=o.by??R.who;react(by,'shake');speak(by,o.reply,'think');}}
  function finish(){people.forEach(f=>f.classList.add('agree'));roundEl.innerHTML=cfg.rounds.map(()=>'<i class="done"></i>').join('')+'<span>Die Beratung ist beendet</span>';answers.innerHTML='';
   const o=document.createElement('div');o.className='sg-finale';o.innerHTML=`<div class="sg-scroll"><h3>${esc(cfg.winTitle)}</h3><p class="sg-synth">${esc(cfg.synthesis)}</p><p>${esc(cfg.win)}</p><button type="button" class="primary sg-next">Weiter</button></div>`;root.querySelector('.sg-stage').append(o);o.querySelector('.sg-next').onclick=()=>win(id);}
  root.__debug={round:()=>r,rounds:cfg.rounds};
  show();return true;
 }

 /* ================= 4. Das Mosaik der Motive ================= */
 function mosaic(id,cfg,work){
  const A=cfg.art||{};const BINS=cfg.bins; // 0 Glaube · 1 Politik · 2 beides
  const cards=shuffle(cfg.cards.map((c,i)=>({...c,i})));
  work.innerHTML=`<div class="scene-game mosaic-game" style="--bg:url('${A.bg}')">
   <div class="sg-stage">
    <div class="sg-bg" aria-hidden="true"></div>
    <div class="motive-relief"><div class="motive-picture"><img src="assets/puzzles/motive-relief.svg" alt="Motivrelief des Kaisers">${cfg.cards.map((_,i)=>`<span class="missing-tessera tessera-${i}" aria-hidden="true"></span>`).join('')}</div><p>Mehrere Motive.<br>Ein Gesamtbild.</p></div>
    <section class="mosaic-field left" data-target="0" aria-label="Mosaikbereich ${esc(BINS[0])}"><button type="button" class="mosaic-target">${esc(BINS[0])}</button><div class="wg-slots"></div></section>
    <section class="mosaic-field mid" data-target="2" aria-label="Zusammenspiel: ${esc(BINS[2])}"><button type="button" class="mosaic-target">${esc(BINS[2])}</button><div class="wg-slots"></div></section>
    <section class="mosaic-field right" data-target="1" aria-label="Mosaikbereich ${esc(BINS[1])}"><button type="button" class="mosaic-target">${esc(BINS[1])}</button><div class="wg-slots"></div></section>
    <div class="wg-rack" role="group" aria-label="Karten mit möglichen Beweggründen">${cards.map(c=>`<button type="button" class="wg-card" data-card="${c.i}" aria-pressed="false"><span class="sg-text">${esc(c.text)}</span></button>`).join('')}</div>
    <div class="wg-reasons" hidden role="group" aria-label="Begründungen"></div>
    <p class="sg-voice" role="status" aria-live="polite">${esc(cfg.start)}</p>
   </div></div>`;
  const root=work.querySelector('.scene-game'),voice=root.querySelector('.sg-voice');
  probe(root,[A.bg]);
  let placed=0,phase='place';
  const say=(t,k='')=>{voice.textContent=t;voice.className='sg-voice '+k;voice.classList.remove('pop');void voice.offsetWidth;voice.classList.add('pop');};
  placement(root,{cardSel:'.wg-card',targetSel:'.mosaic-field',onDrop(card,t){
   if(phase!=='place')return;const c=cfg.cards[+card.dataset.card],bin=+t.dataset.target;
   if(c.ok.includes(bin)){
    card.classList.add('placed');card.classList.remove('chosen');card.disabled=true;root.classList.remove('sg-choosing');
    t.querySelector('.wg-slots').append(card);root.querySelector('.tessera-'+card.dataset.card)?.classList.add('laid');placed++;if(placed===cfg.cards.length)root.classList.add('assembled');
    say(bin===c.best?c.why:(c.alt||c.why),bin===c.best?'good':'ask');
    if(placed===cfg.cards.length)later(root,1600,reasons);
   }else{card.classList.remove('shake');void card.offsetWidth;card.classList.add('shake');say(c.wrong?.[bin]||'Überlege noch einmal: Glaube, Politik – oder beides?','bad');}
  }});
  function reasons(){phase='reason';root.classList.add('assembled');const box=root.querySelector('.wg-reasons');root.querySelector('.wg-rack').hidden=true;box.hidden=false;
   say(cfg.reasons.q,'ask');
   box.innerHTML=shuffle(cfg.reasons.options.map((o,k)=>({o,k}))).map(({o,k})=>`<button type="button" class="wg-reason" data-k="${k}">${esc(o.text)}</button>`).join('');
   box.querySelectorAll('.wg-reason').forEach(b=>b.onclick=()=>{if(phase!=='reason'||b.disabled)return;const o=cfg.reasons.options[+b.dataset.k];
    if(o.ok){phase='done';b.classList.add('right');box.querySelectorAll('button').forEach(x=>x.disabled=true);say(o.why,'good');document.dispatchEvent(new CustomEvent('minigame-choice',{detail:{id,text:o.text}}));later(root,2200,finish);}
    else{b.classList.add('tried');b.disabled=true;say(o.why,'bad');}});}
  function finish(){const o=document.createElement('div');o.className='sg-finale';o.innerHTML=`<div class="sg-scroll"><h3>${esc(cfg.winTitle)}</h3><p>${esc(cfg.win)}</p><button type="button" class="primary sg-next">Weiter</button></div>`;root.querySelector('.sg-stage').append(o);o.querySelector('.sg-next').onclick=()=>win(id);}
  root.__debug={phase:()=>phase,placed:()=>placed,cards:cfg.cards};
  return true;
 }
 Object.assign(window.MiniGames,{citychange,konzil,mosaic});
})();
