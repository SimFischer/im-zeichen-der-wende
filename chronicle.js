'use strict';
/* Physical chronicle and finale. Draft option indices and the v1 save format stay intact. */
window.Chronicle=(()=>{
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 let checkTimeline=()=>{},finish=()=>{};
 function scope(){let alive=true;const timers=new Set();return {
  after(ms,fn){const t=setTimeout(()=>{timers.delete(t);if(alive)fn();},ms);timers.add(t);},
  stop(){alive=false;timers.forEach(clearTimeout);timers.clear();}
 };}
 const gear=(cls='')=>`<img class="chronicle-gear ${cls}" src="assets/puzzles/bronze-gear.svg" alt="" aria-hidden="true">`;
 function timeline({p,d,work,cfg,flags,save,onComplete,onJournal}){
  const life=scope();let chosen=null,completed=false;
  const valid=i=>Number.isInteger(d.values[i])&&p.rows[i].answer.includes(d.values[i]);
  const locks=new Set((Array.isArray(flags.timelineLocks)?flags.timelineLocks:[]).filter(i=>Number.isInteger(i)&&i>=0&&i<p.rows.length&&valid(i)));
  if(!flags.timelineAttempts||typeof flags.timelineAttempts!=='object'||Array.isArray(flags.timelineAttempts))flags.timelineAttempts={};
  const attempts=flags.timelineAttempts;
  const options=p.rows[0].options;
  work.dataset.mechanism='timeline';
  work.innerHTML=`<p class="touch-instruction">Wähle eine Ereignistafel und dann einen Jahresring. Verriegelte Tafeln bleiben an ihrem Platz.</p><button type="button" class="chronicle-journal">Zeitspuren im Notizbuch nachlesen</button>
   <section class="chronicle-machine" aria-label="Chronikmaschine mit sechs Jahresringen">
    <div class="machine-crown" aria-hidden="true">${gear('large')}${gear('small')}<span>CHRONICA</span>${gear('reverse')}</div>
    <div class="machine-rings">${p.rows.map((r,i)=>`<section class="year-socket" data-ring="${i}"><div class="ring-rim" aria-hidden="true"></div><h3>${esc(r.label)}</h3><button type="button" id="slot-${i}" class="year-plate" aria-label="Jahresring ${esc(r.label)}"></button><span class="ring-latch" aria-hidden="true"></span><p class="ring-feedback" aria-live="polite"></p></section>`).join('')}</div>
    <div class="machine-drive" aria-hidden="true">${gear()}<span class="drive-rail"></span>${gear('reverse')}<span class="drive-lever"></span></div>
    <div class="tablet-rack rack" role="group" aria-label="Ereignistafeln">${options.map((t,i)=>`<button type="button" class="event-tablet" data-event="${i}" aria-pressed="false">${esc(t)}</button>`).join('')}</div>
    <p class="machine-status" role="status">Die Chronik wartet auf ihre Zeitspuren.</p>
   </section>`;
  const machine=work.querySelector('.chronicle-machine'),status=work.querySelector('.machine-status');
  const rings=[...work.querySelectorAll('.year-socket')],buttons=[...work.querySelectorAll('[data-event]')];
  work.querySelector('.chronicle-journal').onclick=onJournal;
  function persist(){flags.timelineLocks=[...locks];save();}
  function refresh(){
   rings.forEach((el,i)=>{const b=el.querySelector('button'),v=d.values[i],locked=locks.has(i);b.textContent=v===null?'Tafel einsetzen':options[v];b.disabled=locked;b.setAttribute('aria-label',p.rows[i].label+': '+(v===null?'Tafel einsetzen':options[v])+(locked?' · verriegelt':''));el.classList.toggle('locked',locked);el.classList.toggle('filled',v!==null);});
   buttons.forEach((b,i)=>{const locked=[...locks].some(k=>d.values[k]===i);b.disabled=locked;b.classList.toggle('placed',d.values.includes(i));b.setAttribute('aria-pressed',String(chosen===i));});
  }
  buttons.forEach((b,i)=>b.onclick=()=>{if(completed||b.disabled)return;chosen=chosen===i?null:i;refresh();status.textContent=chosen===null?'Wähle eine Ereignistafel.':'Gewählt: '+options[i]+'. Tippe jetzt auf einen Jahresring.';});
  rings.forEach((el,i)=>el.querySelector('button').onclick=()=>{
   if(completed||locks.has(i))return;
   if(chosen===null){status.textContent='Wähle zuerst eine Ereignistafel aus der Holzablage.';return;}
   // A physical tablet exists only once. Moving it releases its previous socket.
   d.values.forEach((v,k)=>{if(v===chosen&&k!==i&&!locks.has(k)){d.values[k]=null;rings[k].querySelector('.ring-feedback').textContent='';rings[k].classList.remove('wrong');}});
   d.values[i]=chosen;chosen=null;el.classList.remove('engaged','wrong');void el.offsetWidth;el.classList.add('engaged');el.querySelector('.ring-feedback').textContent='';persist();refresh();status.textContent='Die Tafel gleitet in die Fassung. Prüfe ihre Zeitspur.';
  });
  function solved(){
   if(completed)return;completed=true;chosen=null;machine.classList.add('running');refresh();
   status.textContent='Alle sechs Jahresringe greifen ineinander. Die Chronikmaschine erwacht.';
   const advance=document.createElement('button');advance.type='button';advance.className='primary timeline-continue';advance.textContent='Zur Argumentationsbrücke';advance.disabled=true;advance.onclick=()=>{if(!advance.disabled){advance.disabled=true;onComplete();}};machine.append(advance);
   if(cfg&&!flags.timelineTransfer){advance.hidden=true;const transfer=document.createElement('section');transfer.className='machine-transfer';transfer.innerHTML=`<h3>Das Band der Wende</h3><p>${esc(cfg.question)}</p><div class="transfer-rings">${cfg.years.slice(1).map((y,i)=>`<button type="button" data-gap="${i}">${cfg.years[i].year} – ${y.year}</button>`).join('')}</div><p class="transfer-feedback" role="status"></p>`;machine.append(transfer);
    transfer.querySelectorAll('[data-gap]').forEach(b=>b.onclick=()=>{const right=+b.dataset.gap===cfg.gapAnswer;transfer.querySelector('.transfer-feedback').textContent=right?cfg.gapRight:'Diese Verbindung erklärt den Beginn des Wandels noch nicht. Vergleiche Verfolgung und rechtliche Veränderung in deinen Zeitspuren.';if(right){flags.timelineTransfer=true;save();b.classList.add('correct');transfer.querySelectorAll('button').forEach(x=>x.disabled=true);advance.hidden=false;advance.focus({preventScroll:true});}});
   }
   // Give the mechanism time to move, with an immediate static equivalent for reduced motion.
   life.after(reduced()?0:1800,()=>{advance.disabled=false;advance.focus({preventScroll:true});});
  }
  checkTimeline=()=>{
   if(completed)return;
   let wrong=0,empty=0;const tried=new Set();
   rings.forEach((el,i)=>{
    if(locks.has(i))return;const v=d.values[i],fb=el.querySelector('.ring-feedback');
    if(v===null){empty++;fb.textContent='Hier fehlt noch eine Tafel.';return;}
    if(valid(i)){locks.add(i);el.classList.remove('wrong');fb.textContent='Verriegelt.';}
    else{wrong++;if(!tried.has(v)){attempts[v]=Math.min(99,(Number(attempts[v])||0)+1);tried.add(v);}el.classList.add('wrong');fb.textContent=attempts[v]>1?'Sieh noch einmal in deine Zeitspuren im Notizbuch.':'Diese Zeitspur passt noch nicht zu diesem Jahr.';}
   });
   persist();refresh();
   if(!wrong&&!empty)solved();else status.textContent=wrong?'Die Mechanik hakt noch. Prüfe die unverriegelten Zeitspuren.':'Setze die übrigen Ereignistafeln ein.';
  };
  refresh();if(locks.size===p.rows.length)solved();
  return ()=>{life.stop();checkTimeline=()=>{};};
 }
 function finale({root,seals,replay,onSeen,onExplore,onReset}){
  const life=scope();let ended=false;
  const memories=[['house','Wohnviertel'],['forum','Forum'],['office','Amtsstube'],['archive','Verfolgung · 303'],['camp','Am Tiber · 312'],['city','Die geöffnete Stadt · 313'],['council','Nicäa'],['basilica','Die Chronik']];
  root.innerHTML=`<section class="finale-stage" aria-label="Abschluss des Abenteuers">
   <div class="finale-room" aria-hidden="true"></div><div class="finale-light" aria-hidden="true"></div><div class="finale-dust" aria-hidden="true"></div>
   <div class="finale-seals">${seals.map((s,i)=>`<span style="--seal-order:${i}">${s}</span>`).join('')}</div>
   <div class="finale-book" aria-hidden="true"><div class="book-leaf left"><span>Die Erinnerungen</span></div><div class="book-leaf right"><span>der Stadt</span></div><div class="book-cover"><span>CHRONICA</span><b>☧</b></div></div>
   <div class="finale-gears" aria-hidden="true">${gear()}${gear('reverse')}</div>
   <div class="finale-memories" aria-hidden="true">${memories.map(([id,title])=>`<figure><img src="${window.GAME?.scenes.find(s=>s.id===id)?.image||`assets/backgrounds/v3-${id}.png`}" alt=""><figcaption>${esc(title)}</figcaption></figure>`).join('')}</div>
   <div class="finale-caption" role="status">Das letzte Element rastet ein.</div>
   <div class="finale-end" hidden><p class="ending-line">Die Chronik spricht wieder.</p><h3>Im Zeichen der Wende</h3><p>Du hast die Erinnerungen der Stadt zusammengefügt.</p><strong>Abenteuer abgeschlossen</strong><div class="finale-actions"><button type="button" class="primary finale-explore">Stadt weiter erkunden</button><button type="button" class="finale-reset">Neues Spiel</button></div></div>
   <button type="button" class="finale-skip">Zur Abschlussansicht</button>
  </section>`;
  const stage=root.querySelector('.finale-stage'),caption=stage.querySelector('.finale-caption'),end=stage.querySelector('.finale-end');
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  function conclude(){if(ended)return;ended=true;life.stop();stage.classList.add('complete','book-open');stage.querySelectorAll('.finale-seals>span').forEach(s=>s.classList.add('lit'));stage.querySelector('.finale-memories').hidden=true;caption.hidden=true;stage.querySelector('.finale-skip').hidden=true;end.hidden=false;onSeen();end.querySelector('button').focus({preventScroll:true});}
  finish=conclude;
  stage.querySelector('.finale-skip').onclick=conclude;
  stage.querySelector('.finale-explore').onclick=onExplore;
  stage.querySelector('.finale-reset').onclick=onReset;
  function motionChange(e){if(e.matches)conclude();}
  media.addEventListener?.('change',motionChange);
  if(!replay||media.matches)conclude();else{
   stage.querySelector('.finale-skip').focus({preventScroll:true});
   stage.querySelectorAll('.finale-seals>span').forEach((s,i)=>life.after(700+i*450,()=>s.classList.add('lit')));
   life.after(3500,()=>{stage.classList.add('awakening');caption.textContent='Sechs Erkenntnisse. Eine gemeinsame Chronik.';});
   life.after(5100,()=>{stage.classList.add('book-open');caption.textContent='Die Erinnerungen kehren zurück.';});
   memories.forEach((_,i)=>life.after(6800+i*1550,()=>{stage.querySelectorAll('.finale-memories figure').forEach((f,k)=>f.classList.toggle('visible',k===i));stage.classList.add('remembering');}));
   life.after(19800,conclude);
  }
  return ()=>{life.stop();media.removeEventListener?.('change',motionChange);finish=()=>{};};
 }
 return {timeline,finale,checkTimeline:()=>checkTimeline(),finish:()=>finish()};
})();
