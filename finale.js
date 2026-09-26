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
 const SLOTS=[21.3,34.3,47.2,60.6,73.4,86.1];
 const PLACES=[
  {img:'assets/backgrounds/v3-house.png',name:'Im Wohnviertel',era:'Spuren früher Konflikte'},
  {img:'assets/backgrounds/v3-forum.png',name:'Stimmen auf dem Forum',era:'1. Jahrhundert'},
  {img:'assets/backgrounds/v3-archive.png',name:'Diokletians Archiv',era:'ab 303'},
  {img:'assets/backgrounds/v3-camp.png',name:'Am Tiber',era:'312'},
  {img:'assets/minigames/open-city/open-city.png',name:'Die geöffnete Stadt',era:'313 und danach'},
  {img:'assets/minigames/council/council-scene.png',name:'Die Beratung von Nicäa',era:'325'}];
 let el=null,timers=[];
 function clear(){timers.forEach(clearTimeout);timers=[];}
 function at(ms,fn){timers.push(setTimeout(()=>{if(el?.isConnected)fn();},ms));}
 function stop(){clear();el?.remove();el=null;document.body.classList.remove('finale-on');}
 function play({seals=[],names=[],onExplore,onNewGame,onJournal}={}){
  stop();const G=window.GAME||{};const S=window.Seals;const list=names.length?names:(G.seals||[]);
  const medal=n=>S?S.medal(n,{decorative:true}):`<span class="seal-medallion">${esc(n)}</span>`;
  el=document.createElement('section');el.id='finale';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Abschluss: Die Chronik der Wende');
  el.innerHTML=`<div class="fn-bg" aria-hidden="true"></div>
   <div class="fn-camera">
    <div class="fn-book">
     <img class="fn-closed" src="${F}chronicle-closed.webp" alt="Die verschlossene Chronik" draggable="false">
     <div class="fn-open"><img src="${F}chronicle-open.webp" alt="Die geöffnete Chronik mit sechs Siegelfeldern" draggable="false">
      ${list.map((n,i)=>`<span class="fn-slot" style="left:${SLOTS[i]}%">${medal(n)}</span>`).join('')}</div>
    </div>
    <div class="fn-seals" role="list" aria-label="Die sechs Siegel">${list.map((n,i)=>`<span class="fn-seal" role="listitem" style="--i:${i}">${medal(n)}<small>${esc(n)}</small></span>`).join('')}</div>
   </div>
   <div class="fn-memories" aria-hidden="true">${PLACES.map((p,i)=>`<figure class="fn-memory" style="--i:${i}"><div class="fn-pic" style="background-image:url('${p.img}')"></div><figcaption><b>${esc(p.name)}</b><span>${esc(p.era)}</span></figcaption></figure>`).join('')}</div>
   <div class="fn-text" aria-live="polite"><p class="fn-line1">Die Chronik spricht wieder.</p><p class="fn-line2">Du hast die Erinnerungen der Stadt zusammengefügt.</p>
    <div class="fn-end"><strong>Abenteuer abgeschlossen</strong><div class="fn-actions"></div></div></div>
   <button type="button" class="fn-skip">Überspringen</button>`;
  document.body.append(el);document.body.classList.add('finale-on');
  const actions=el.querySelector('.fn-actions');
  const btn=(t,cls,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.className=cls;b.onclick=fn;actions.append(b);return b;};
  const first=btn('Stadt weiter erkunden','primary',()=>{stop();onExplore?.();});
  btn('Neues Spiel','',()=>{stop();onNewGame?.();});
  if(onJournal)btn('Notizbuch öffnen','fn-small',()=>{stop();onJournal();});
  const phase=p=>{el.dataset.phase=p;};
  function end(){clear();phase('end');el.classList.add('done');el.querySelector('.fn-skip').hidden=true;first.focus?.({preventScroll:true});}
  el.querySelector('.fn-skip').onclick=end;
  el.addEventListener('keydown',e=>{if(e.key==='Escape')end();});
  el.querySelector('.fn-skip').focus?.({preventScroll:true});
  if(reduced()){el.classList.add('still');phase('open');at(400,()=>phase('memories-static'));at(1200,()=>phase('speak'));at(2000,end);return el;}
  phase('intro');
  at(500,()=>phase('closed'));
  list.forEach((_,i)=>at(1500+i*520,()=>el.querySelectorAll('.fn-seal')[i]?.classList.add('lit')));
  const t0=1500+list.length*520+400;
  at(t0,()=>phase('open'));
  at(t0+1300,()=>phase('zoom'));
  PLACES.forEach((_,i)=>at(t0+2200+i*1150,()=>{phase('memories');el.querySelectorAll('.fn-memory').forEach((m,k)=>m.classList.toggle('on',k===i));}));
  const t1=t0+2200+PLACES.length*1150;
  at(t1,()=>{el.querySelectorAll('.fn-memory').forEach(m=>m.classList.remove('on'));phase('return');});
  at(t1+1200,()=>phase('speak'));
  at(t1+3400,end);
  return el;
 }
 return {play,stop,PLACES};
})();
