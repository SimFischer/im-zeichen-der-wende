'use strict';
window.Finale=(()=>{
 const F='assets/finale/';
 const STATEMENTS=[
  'Ab 311/313 verbesserte sich die Lage der Christen deutlich.',
  'Unter Konstantin wurde das Christentum abgesichert und gefördert.',
  'Deshalb spricht man von einer Wende, weil sich die Stellung des Christentums grundlegend wandelte.',
  'Christen waren immer und überall verfolgt.',
  '313 war das Christentum sofort die einzige Religion.',
  'Konstantin bekannte sich früh zum Christentum und ließ sich schon kurz nach seinem Sieg taufen.'
 ];
 const PLACES=[
  {img:'assets/backgrounds/v3-forum.png',name:'Rom, 64',era:'Verfolgung nach dem Brand – nicht überall und nicht zu jeder Zeit.'},
  {img:'assets/backgrounds/v3-house.png',name:'Im Wohnviertel',era:'Christliche Gemeinden zwischen Alltag und Misstrauen.'},
  {img:'assets/backgrounds/v3-office.png',name:'Die Amtsstube',era:'Anzeigen und Verfahren bestimmen das Schicksal Einzelner.'},
  {img:'assets/backgrounds/v3-archive.png',name:'Ab 303',era:'Kaiserliche Edikte verschärfen die Verfolgung.'},
  {img:'assets/backgrounds/v3-camp.png',name:'Am Tiber, 312',era:'Konstantins Sieg an der Milvischen Brücke.'},
  {img:'assets/minigames/open-city/open-city.png',name:'Die Wende',era:'Ab 311/313: Duldung, Absicherung und Förderung.'}
 ];
 let el=null,timers=[],restoreFocus=null,app=null,wasInert=false;
 function clear(){timers.forEach(clearTimeout);timers=[];}
 function at(ms,fn){const owner=el;timers.push(setTimeout(()=>{if(el===owner&&owner?.isConnected)fn();},ms));}
 function stop(){clear();el?.remove();el=null;document.body.classList.remove('finale-on');if(app)app.inert=wasInert;app=null;restoreFocus?.focus?.({preventScroll:true});restoreFocus=null;}
 function play({onExplore,onNewGame,onJournal,onEnd,completed=false}={}){
  stop();restoreFocus=document.activeElement;app=document.querySelector('#app');wasInert=!!app?.inert;if(app)app.inert=true;
  const still=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  el=document.createElement('section');el.id='finale';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Die Chronik erwacht');el.dataset.phase='choice';
  el.innerHTML=`<div class="cf-backdrop" aria-hidden="true"></div><div class="cf-challenge"><header><p class="cf-eyebrow">Die Erinnerungen werden Geschichte</p><h1>Die Chronik erwacht</h1><p>Wähle die drei Aussagen, die die Konstantinische Wende am treffendsten zusammenfassen.</p></header><div class="cf-stage"><div class="cf-book"><img class="cf-closed" src="${F}final-chronicle-closed.png" alt="Die verschlossene Chronik"><img class="cf-awakening" src="${F}final-chronicle-awakening.png" alt="Die Chronik erwacht"><img class="cf-open" src="${F}final-chronicle-open.png" alt="Die geöffnete Chronik"><img class="cf-light" src="${F}final-book-light-overlay.png" alt=""><div class="cf-seals" aria-label="Drei Erkenntnisse">${[1,2,3].map(n=>`<img src="${F}final-seal-glow-${n}.png" alt="Erkenntnis ${n}" class="cf-seal">`).join('')}</div></div><p class="cf-feedback" role="status" aria-live="polite">0 von 3 Aussagen gefunden.</p></div><div class="cf-statements">${[0,3,1,4,5,2].map(i=>`<button type="button" class="cf-statement" data-statement="${i}" aria-pressed="false"><span>${STATEMENTS[i]}</span><small class="cf-verdict"></small></button>`).join('')}</div></div><div class="cf-memories">${PLACES.map(p=>`<figure class="cf-memory"><img src="${p.img}" alt="${p.name}"><figcaption><b>${p.name}</b><span>${p.era}</span></figcaption></figure>`).join('')}</div><div class="cf-end" hidden><img class="cf-title" src="${F}final-title-banner.png" alt="Die Konstantinische Wende"><img class="cf-subtitle" src="${F}final-subtitle-panel.png" alt="Von Verfolgung zur Förderung. Ein grundlegender Wandel in der Stellung des Christentums im Römischen Reich."><p>Du hast die Erinnerungen der Stadt zusammengefügt.</p><div class="fn-actions"></div></div><button type="button" class="cf-skip" hidden>Rückblick überspringen</button>`;
  document.body.append(el);document.body.classList.add('finale-on');if(still)el.classList.add('still');
  const root=el,actions=root.querySelector('.fn-actions'),feedback=root.querySelector('.cf-feedback'),skip=root.querySelector('.cf-skip'),challenge=root.querySelector('.cf-challenge');
  const btn=(text,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=()=>{stop();fn?.();};actions.append(b);return b;};
  const first=btn('Stadt weiter erkunden',onExplore);btn('Neues Spiel',onNewGame);if(onJournal)btn('Notizbuch öffnen',onJournal);
  let count=0,ended=false;
  function phase(p){root.dataset.phase=p;}
  function end(){if(ended)return;ended=true;clear();phase('end');challenge.inert=true;root.querySelector('.cf-end').hidden=false;skip.hidden=true;root.querySelectorAll('.cf-memory').forEach(m=>m.classList.remove('on'));onEnd?.();first.focus?.({preventScroll:true});}
  function awaken(){phase('awakening');root.scrollTop=0;root.querySelectorAll('.cf-statement').forEach(b=>b.disabled=true);feedback.textContent='Drei treffende Aussagen. Die Chronik erwacht.';
   at(4200,()=>{phase('open');challenge.inert=true;skip.hidden=false;skip.focus?.({preventScroll:true});});
   at(7000,()=>phase('zoom'));
   PLACES.forEach((_,i)=>at(9800+i*4200,()=>{phase('memories');root.querySelectorAll('.cf-memory').forEach((m,k)=>m.classList.toggle('on',k===i));}));
   at(9800+PLACES.length*4200,end);
  }
  root.querySelectorAll('.cf-statement').forEach(b=>{b.onclick=()=>{if(root.dataset.phase!=='choice'||b.dataset.state==='correct')return;const i=Number(b.dataset.statement);
   if(i>=3){b.dataset.state='wrong';b.querySelector('.cf-verdict').textContent='Nicht treffend genug';feedback.textContent='Nicht treffend genug. Wähle eine andere Aussage.';return;}
   b.dataset.state='correct';b.setAttribute('aria-pressed','true');b.querySelector('.cf-verdict').textContent='✓ Treffend';root.querySelectorAll('.cf-seal')[count].classList.add('lit');count++;root.dataset.hits=String(count);feedback.textContent=`${count} von 3 Aussagen gefunden.`;if(count===3)awaken();
  };});
  skip.onclick=()=>{if(['open','zoom','memories'].includes(root.dataset.phase))end();};
  root.addEventListener('keydown',e=>{if(e.key==='Escape'&&!skip.hidden){e.preventDefault();skip.click();}if(e.key==='Tab'){const buttons=[...root.querySelectorAll('button')].filter(b=>!b.disabled&&!b.hidden&&!b.closest('[hidden]')&&!b.closest('[inert]')&&(root.dataset.phase==='end'?!!b.closest('.cf-end'):!b.closest('.cf-end')));const i=buttons.indexOf(document.activeElement);e.preventDefault();buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus?.();}});
  if(completed)end();else root.querySelector('.cf-statement').focus?.({preventScroll:true});
  return root;
 }
 return {play,stop,PLACES,STATEMENTS};
})();
