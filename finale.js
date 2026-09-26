'use strict';
/* Die Endsequenz nach der Argumentationsbrücke.
   Ablauf: Oberfläche blendet aus → die geschlossene Chronik erscheint → die sechs Siegel rasten nacheinander ein →
   die Chronik öffnet sich → Kamerafahrt in das Bild der Chronik → kurzer Rückblick auf sechs Orte →
   zurück zur offenen Chronik → „Die Chronik spricht wieder.“ → „Abenteuer abgeschlossen“ mit zwei Aktionen.
   Alles mit opacity/transform; jederzeit überspringbar; bei reduzierter Bewegung ohne Kamerafahrten. */
window.Finale=(()=>{
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const reduced=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 const F='assets/finale/';
 // Mittelpunkte der gedruckten Medaillonfelder in der offenen Chronik (in % des Bildes)
 const SLOTS=[18,31,44,57,70,83];
 const PLACES=[
  {img:'assets/backgrounds/v3-house.png',name:'Im Wohnviertel',era:'Spuren früher Konflikte'},
  {img:'assets/backgrounds/v3-forum.png',name:'Stimmen auf dem Forum',era:'1. Jahrhundert'},
  {img:'assets/backgrounds/v3-archive.png',name:'Diokletians Archiv',era:'ab 303'},
  {img:'assets/backgrounds/v3-camp.png',name:'Am Tiber',era:'312'},
  {img:'assets/minigames/open-city/open-city.png',name:'Die geöffnete Stadt',era:'313 und danach'},
  {img:'assets/minigames/council/council-scene.png',name:'Die Beratung von Nicäa',era:'325'}];
 let el=null,timers=[],restoreFocus=null,app=null,wasInert=false;
 function clear(){timers.forEach(clearTimeout);timers=[];}
 function at(ms,fn){const owner=el;timers.push(setTimeout(()=>{if(el===owner&&owner?.isConnected)fn();},ms));}
 function stop(){clear();el?.remove();el=null;document.body.classList.remove('finale-on');if(app)app.inert=wasInert;app=null;restoreFocus?.focus?.({preventScroll:true});restoreFocus=null;}
 function play({seals=[],names=[],onExplore,onNewGame,onJournal,onEnd}={}){
  stop();restoreFocus=document.activeElement;app=document.querySelector('#app');wasInert=!!app?.inert;if(app)app.inert=true;const G=window.GAME||{};const S=window.Seals;const list=names.length?names:(G.seals||[]);
  // Der Produktionsbogen ist anders sortiert als die Siegel im Spiel. Nach Bedeutung zuordnen.
  const crops={Konflikt:[15,48],Quelle:[495,48],Wende:[975,48],Anzeige:[15,568],Staat:[495,568],'312':[975,568]};
  const medal=n=>{const p=crops[n];return p?`<span class="seal-medallion" aria-hidden="true"><svg viewBox="${p[0]} ${p[1]} 460 460" focusable="false"><image href="${F}siegelmedaillons-sheet.png" width="1448" height="1086"/></svg></span>`:S?S.medal(n,{decorative:true}):`<span class="seal-medallion">${esc(n)}</span>`;};
  el=document.createElement('section');el.id='finale';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Abschluss: Die Chronik der Wende');
  el.innerHTML=`<div class="fn-bg" aria-hidden="true"></div>
   <div class="fn-camera">
    <div class="fn-book">
     <img class="fn-closed" src="${F}chronicle-closed.webp" alt="Die verschlossene Chronik" draggable="false">
     <div class="fn-open"><img src="${F}chronik-finale-vollstaendig.png" alt="Die geöffnete Chronik mit sechs Siegelfeldern" draggable="false">
      ${list.map((n,i)=>`<span class="fn-slot" style="left:${SLOTS[i]}%">${medal(n)}</span>`).join('')}</div>
    </div>
    <div class="fn-seals" role="list" aria-label="Die sechs Siegel">${list.map((n,i)=>`<span class="fn-seal" role="listitem" style="--i:${i}">${medal(n)}<small>${esc(n)}</small></span>`).join('')}</div>
   </div>
   <div class="fn-memories" aria-hidden="true">${PLACES.map((p,i)=>`<figure class="fn-memory" style="--i:${i}"><div class="fn-pic" style="background-image:url('${p.img}')"></div><figcaption><b>${esc(p.name)}</b><span>${esc(p.era)}</span></figcaption></figure>`).join('')}</div>
   <div class="fn-text" aria-live="polite"><p class="fn-line1">Die Chronik spricht wieder.</p><p class="fn-line2">Du hast die Erinnerungen der Stadt zusammengefügt.</p>
    <div class="fn-end" hidden><strong>Abenteuer abgeschlossen</strong><div class="fn-reward"><img src="${F}bonusspiele-hinweis.png" alt="" draggable="false"><p><b>Deine Belohnung</b>Alle Bonusspiele sind jetzt im Notizbuch freigeschaltet.</p></div><div class="fn-actions"></div></div></div>
   <button type="button" class="fn-skip">Überspringen</button>`;
  document.body.append(el);document.body.classList.add('finale-on');
  const actions=el.querySelector('.fn-actions');
  const btn=(t,cls,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.className=cls;b.onclick=fn;actions.append(b);return b;};
  const first=btn('Stadt weiter erkunden','primary',()=>{stop();onExplore?.();});
  btn('Neues Spiel','',()=>{stop();onNewGame?.();});
  if(onJournal)btn('Notizbuch öffnen','fn-small',()=>{stop();onJournal();});
  const phase=p=>{el.dataset.phase=p;};
  let ended=false;
  function end(){if(ended)return;ended=true;clear();phase('end');el.querySelector('.fn-end').hidden=false;onEnd?.();el.classList.add('done');el.querySelector('.fn-skip').hidden=true;first.focus?.({preventScroll:true});}
  el.querySelector('.fn-skip').onclick=end;
  el.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();end();}if(e.key==='Tab'){const buttons=[...el.querySelectorAll('button')].filter(b=>!b.hidden&&!b.closest('[hidden]'));const i=buttons.indexOf(document.activeElement);e.preventDefault();buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus();}});
  el.querySelector('.fn-skip').focus?.({preventScroll:true});
  if(reduced()){el.classList.add('still');phase('open');at(400,()=>phase('memories-static'));at(1200,()=>phase('speak'));at(2000,end);return el;}
  phase('intro');
  at(500,()=>phase('closed'));
  list.forEach((_,i)=>at(1500+i*520,()=>el.querySelectorAll('.fn-seal')[i]?.classList.add('lit')));
  const t0=1500+list.length*520+400;
  at(t0,()=>phase('open'));
  at(t0+1300,()=>phase('zoom'));
  PLACES.forEach((_,i)=>at(t0+2200+i*2200,()=>{phase('memories');el.querySelectorAll('.fn-memory').forEach((m,k)=>m.classList.toggle('on',k===i));}));
  const t1=t0+2200+PLACES.length*2200;
  at(t1,()=>{el.querySelectorAll('.fn-memory').forEach(m=>m.classList.remove('on'));phase('return');});
  at(t1+1200,()=>phase('speak'));
  at(t1+3400,end);
  return el;
 }
 return {play,stop,PLACES};
})();
