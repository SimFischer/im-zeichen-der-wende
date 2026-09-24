'use strict';
(() => {
 const G=window.GAME, $=s=>document.querySelector(s), KEY='im-zeichen-der-wende:v1';
 const fresh=()=>({version:1,started:false,scene:'gate',unlocked:['gate','house','forum'],inventory:[],solved:[],seals:[],notes:[],seen:[],evidence:[],drafts:{},hints:{},flags:{},progress:0});
 let state=fresh(), storageOK=true, selected=null, activePuzzle=null, modalMode='', returnFocus=null, toastTimer, holdTimer, held=false;
 try { const s=JSON.parse(localStorage.getItem(KEY)); if(s&&s.version===1){state={...fresh(),...s}; for(const k of ['unlocked','inventory','solved','seals','notes','seen','evidence']) if(!Array.isArray(state[k]))state[k]=fresh()[k]; for(const k of ['drafts','hints','flags'])if(!state[k]||typeof state[k]!=='object'||Array.isArray(state[k]))state[k]={}; if(!G.scenes.some(x=>x.id===state.scene))state.scene='gate';} }catch(e){storageOK=false;}
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const scene=()=>G.scenes.find(s=>s.id===state.scene);
 const has=id=>state.solved.includes(id), own=id=>state.inventory.includes(id);
 // Erst Informationen sammeln (Gespräche, Gegenstände), dann öffnet sich das Rätsel zur Überprüfung.
 const infoSpots=sc=>sc.id==='archive'?[]:sc.hotspots.map((h,i)=>({h,i})).filter(({h})=>h[3]==='talk');
 const missingInfo=sc=>infoSpots(sc).filter(({i})=>!state.seen.includes(sc.id+':'+i));
 const puzzleLocked=(sc,id)=>!has(id)&&missingInfo(sc).length>0;
 function refreshSpots(){const sc=scene(),miss=missingInfo(sc),total=infoSpots(sc).length,opened=[];
  document.querySelectorAll('#hotspots .hotspot').forEach(b=>{const i=+b.dataset.index,h=sc.hotspots[i];if(!h)return;b.classList.toggle('seen',state.seen.includes(sc.id+':'+i));
   if(h[3]!=='puzzle')return;const lockedNow=puzzleLocked(sc,h[4]),was=b.classList.contains('locked');b.classList.toggle('locked',lockedNow);
   const cap=b.querySelector('.hs-cap');if(cap)cap.textContent=has(h[4])?'Rätsel gelöst':lockedNow?`erst Hinweise sammeln · ${total-miss.length}/${total}`:'Rätsel · jetzt prüfen';
   const pin=b.querySelector('.pin');if(pin)pin.textContent=has(h[4])?'✓':lockedNow?'🔒':'✦';
   if(was&&!lockedNow){b.classList.add('unlocked-now');opened.push(h[0]);}});
  if(opened.length)toast(`Du hast genug erfahren. Überprüfe jetzt dein Wissen: ${opened[0]}.`);
  $('#objective').textContent=objective();}
 const add=(key,value)=>{if(!state[key].includes(value))state[key].push(value);};
 const save=()=>{state.progress=state.solved.length;try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}catch(e){storageOK=false;toast('Speichern ist in diesem Browser nicht möglich. Lass diesen Tab geöffnet.');}};
 function toast(text){$('#toast').textContent=text;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),5500);}
 function open(title,html,kicker='Die Stadtchronik',mode='info') {if(!$('#modal').open)returnFocus=document.activeElement;modalMode=mode;$('#modal').dataset.mode=mode;$('#modal-title').textContent=title;$('#modal-kicker').textContent=kicker;$('#modal-content').innerHTML=html;if(!$('#modal').open)$('#modal').showModal();$('#modal').scrollTop=0;$('#close').focus();}
 function close(){ $('#modal').close();activePuzzle=null;modalMode='';if(returnFocus?.isConnected)returnFocus.focus();refreshSpots(); }
 $('#close').onclick=close;$('#modal').addEventListener('cancel',e=>{e.preventDefault();close();});
 function button(text,fn,cls='primary',parent=$('#modal-content')){const b=document.createElement('button');b.textContent=text;b.className=cls;b.onclick=fn;parent.append(b);return b;}
 function actions(){const n=document.createElement('div');n.className='actions';$('#modal-content').append(n);return n;}
 // Kleine Schnittstelle für die optionalen Bonusspiele (bonusgames.js). Kein Zugriff auf den Spielstand.
 window.WendeUI={open,close,button,actions,toast};
 function info(title,body){activePuzzle=null;open(title,`<p class="intro-copy">${esc(body)}</p>`);button('Zurück in die Szene',close,'primary',actions());}
 function unlock(){
  if(has('conflict')&&has('sources'))add('unlocked','office');
  if(has('cases'))add('unlocked','temple');
  if(has('sacrifice')||state.unlocked.includes('archive'))add('unlocked','vestibule');
  if(state.flags.archiveScrollsRead||has('archive'))add('unlocked','archive');
  // Bereits abgeschlossene Archive aus älteren Spielständen bleiben abgeschlossen.
  if(has('archive')&&!state.flags.archiveScrollsReceived)state.flags.archiveScrollsDeposited=true;
  if(has('archive')&&state.flags.archiveScrollsDeposited)add('unlocked','camp');
  if(has('vision'))add('unlocked','city');
  if(has('change'))add('unlocked','motives');
  if(has('motives'))add('unlocked','council');
  if(has('council'))add('unlocked','basilica');
 }
 function objective(){
  const id=state.scene;
  if(id==='vestibule')return !state.flags.archiveScrollsReceived?'Sprich mit dem Archivar. Er hat einen Auftrag für dich.':!state.flags.archiveScrollsRead?'Lies die Schriftrollen, bevor du sie ins Archiv bringst.':!own('light')?'Entzünde die Öllampe: Kombiniere sie im Botenbeutel mit dem Feuerstein.':'Wähle den Archivschlüssel im Botenbeutel und gehe ins Archiv.';
  if(id==='archive'&&has('archive')&&!state.flags.archiveScrollsDeposited)return 'Das Licht ist wieder an. Lege die Schriftrollen auf dem freien Regalplatz ab.';
  if(id==='gate')return state.seals.length===6?'Alle Siegel gefunden. Die Chronik wartet in der Basilika.':'Erkunde die Erinnerungen. Finde sechs Erkenntnis-Siegel für die Chronik.';
  if(id==='archive'&&!own('light'))return 'Kombiniere Öllampe und Feuerstein im Botenbeutel.';if(id==='archive'&&!has('archive')&&G.minigames?.archive)return 'Tippe in die Dunkelheit, um mit der Lampe zu suchen.';
  if(id==='archive'&&state.evidence.length<4&&!has('archive'))return 'Untersuche die vier Spuren im Licht deiner Lampe.';
  {const p=scene().hotspots.find(h=>h[3]==='puzzle'&&!has(h[4]));if(p&&puzzleLocked(scene(),p[4])){const all=infoSpots(scene()).length,miss=missingInfo(scene()).length;return `Sammle zuerst Informationen: Sprich mit den Menschen und untersuche die Dinge (${all-miss}/${all}). Dann öffnet sich: ${p[0]}.`;}}
  if(id==='camp'&&!has('map312'))return 'Beschrifte das Kartenbrett, um Konstantins Zelt zu öffnen.';
  if(id==='basilica'&&!state.flags.sealsPlaced)return 'Setze deine sechs Erkenntnis-Siegel in die große Mechanik.';
  const p=scene().hotspots.find(h=>h[3]==='puzzle'&&!has(h[4]));
  if(p)return `Du weißt genug. Überprüfe dein Wissen: ${p[0]}.`;
  return 'Diese Erinnerung ist erschlossen. Folge einem Weg (➜) oder nutze die Stadtkarte.';
 }
 function render(){endTalk();unlock();if(state.scene==='archive'&&!has('archive')&&!state.flags.archiveScrollsRead)state.scene='vestibule';const s=scene();$('#scene-name').textContent=s.name;$('#era').textContent=s.era;
  const art=$('#art');art.style.backgroundImage=`url('assets/backgrounds/v3-${s.art||s.id}.png')`;$('#app').style.setProperty('--scene-img',`url('assets/backgrounds/v3-${s.art||s.id}.png')`);art.style.backgroundSize='contain';art.style.backgroundPosition='center';
  const archDark=s.id==='archive'&&!has('archive');art.style.filter=archDark?'brightness(.07) saturate(.4)':'';$('#scene').classList.toggle('archive-dark',archDark);
  $('#world-change').className=state.flags.galerius?'open':'';
  if(s.id==='house'&&state.flags.galerius)$('#era').textContent='Nach 311 · die Hauskirche ist wieder offen';
  $('#hotspots').innerHTML='';s.hotspots.forEach((h,i)=>{const b=document.createElement('button');b.className='hotspot hs-'+h[3];b.dataset.index=i;b.style.left=h[1]+'%';b.style.top=h[2]+'%';b.dataset.hotspot=h[4]||h[3];const done=h[3]==='puzzle'&&has(h[4]);if(done)b.classList.add('done');if(state.seen.includes(s.id+':'+i))b.classList.add('seen');const cap=h[3]==='puzzle'?'<small class="hs-cap"></small>':'';b.innerHTML=`<span class="pin" aria-hidden="true">${done?'✓':h[3]==='take'?'＋':h[3]==='talk'?'i':'·'}</span><span class="label">${esc(h[0])}${cap}</span>`;if(h[3]==='take'){b.querySelector('.pin').remove();b.setAttribute('aria-label',h[0]+' aufnehmen');}if(h[3]==='deposit')b.hidden=!has('archive')||!!state.flags.archiveScrollsDeposited;b.onclick=()=>interact(h,i);$('#hotspots').append(b);});
  window.Adventure.scene(s,state);refreshSpots();document.querySelectorAll('#hotspots .unlocked-now').forEach(b=>b.classList.remove('unlocked-now'));renderExits(s);window.BonusGames?.update(state);$('#objective').textContent=objective();renderInventory();save();
 }
 function travel(id,via){
  if(!state.unlocked.includes(id)){toast(G.exitHints?.[id]||'Dieser Weg ist noch versperrt. Finde zuerst weitere Spuren.');return;}
  if(id==='archive'&&!has('archive')){if(!state.flags.archiveScrollsRead){enter('vestibule');toast('Lies zuerst die Schriftrollen des Archivars.');return;}if(!own('light')){toast('Vor dem Eintritt brauchst du eine brennende Öllampe. Kombiniere Öllampe und Feuerstein im Botenbeutel.');return;}}
  if(id==='archive'&&!state.flags.archiveUnlocked){if(!own('key')){toast('Der Archivschlüssel fehlt. Untersuche den Seilzug im Tempelbezirk.');return;}if(selected!=='key'){toast(via==='map'?'Wähle zuerst den Archivschlüssel im Botenbeutel und tippe dann das Archiv auf der Karte an.':'Die Archivtür ist verschlossen. Wähle den Archivschlüssel im Botenbeutel und tippe dann erneut auf den Weg.');close();$('#inventory').hidden=false;$('#inventory-toggle').setAttribute('aria-expanded','true');return;}state.flags.archiveUnlocked=true;selected=null;}
  if(id==='office'&&!state.flags.passShown){if(!own('pass')){toast('Der Botenpass fehlt.');return;}state.flags.passShown=true;toast('Du zeigst den Botenpass. Der Schreiber lässt dich ein.');}
  enter(id);
 }
 function renderExits(s){(G.exits?.[s.id]||[]).forEach(([target,x,y,label])=>{const dest=G.scenes.find(z=>z.id===target);if(!dest)return;const open=state.unlocked.includes(target);const b=document.createElement('button');b.type='button';b.className='exit'+(open?'':' locked')+(x<18?' edge-left':x>82?' edge-right':'');b.style.left=(x<18?1.5:x>82?98.5:x)+'%';b.style.top=y+'%';b.dataset.exit=target;b.setAttribute('aria-label',(open?'Gehe zu: ':'Noch versperrt: ')+dest.name);b.innerHTML=`<span class="exit-arrow" aria-hidden="true">${open?'➜':'🔒'}</span><span class="label">${esc(label)}${label.includes(dest.name.split(' ').pop())?'':`<small>${esc(dest.name)}</small>`}</span>`;b.onclick=()=>travel(target,'walk');$('#hotspots').append(b);});}
 document.addEventListener('click',e=>{const sc=e.target.closest?.('#scene');if(!sc||!sc.classList.contains('archive-dark')||e.target.closest('.exit'))return;if(own('light'))openPuzzle('archive');else info('Zu dunkel','Du siehst nichts. Öffne den Botenbeutel und kombiniere die Öllampe mit dem Feuerstein. Beide findest du im Wohnviertel und am Stadttor.');});
 function enter(id){if(!state.unlocked.includes(id))return;close();state.scene=id;selected=null;$('#inventory').hidden=true;$('#inventory-toggle').setAttribute('aria-expanded','false');render();if(id==='archive'&&own('light')&&!has('archive')&&G.minigames?.archive){add('seen','intro:archive');save();setTimeout(()=>openPuzzle('archive'),500);return;}if(!state.seen.includes('intro:'+id)){add('seen','intro:'+id);save();info(scene().name,scene().intro);}}
 // Kleine Animation: der Gegenstand fliegt aus der Szene in den Botenbeutel.
 function flyToBag(id){const from=document.querySelector(`.hotspot[data-hotspot="${id}"]`)?.getBoundingClientRect(),to=$('#inventory-toggle')?.getBoundingClientRect();if(!from||!to||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const img=document.createElement('img');img.src=`assets/inventory/${id}.svg`;img.alt='';img.className='fly-item';img.style.left=(from.left+from.width/2-32)+'px';img.style.top=(from.top+from.height/2-32)+'px';document.body.append(img);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{img.style.transform=`translate(${to.left+to.width/2-from.left-from.width/2}px,${to.top+to.height/2-from.top-from.height/2}px) scale(.45)`;img.style.opacity='.2';}));
  setTimeout(()=>{img.remove();$('#inventory-toggle')?.classList.add('bag-bump','has-new');setTimeout(()=>$('#inventory-toggle')?.classList.remove('bag-bump'),450);},750);}
 function interact(h,i){endTalk();const lockedBefore=type0=>type0==='puzzle'&&puzzleLocked(scene(),h[4]);const wasLocked=lockedBefore(h[3]);add('seen',state.scene+':'+i);save();const [label,x,y,type,id]=h;
  if(type==='puzzle'&&wasLocked){const miss=missingInfo(scene()).map(({h})=>h[0]);info('Erst Informationen sammeln',`Bevor du „${label}“ überprüfen kannst, brauchst du mehr Wissen. Sprich mit den Menschen und untersuche die Dinge hier. Noch offen: ${miss.join(', ')}.`);return;}
  if(state.scene==='archive'&&own('light')&&!has('archive')&&G.minigames?.archive&&type!=='exit'){openPuzzle('archive');return;}if(state.scene==='archive'&&!own('light')){info('Zu dunkel','Du erkennst nur Umrisse. Öffne den Botenbeutel. Wähle die Öllampe und dann den Feuerstein, um sie zu entzünden. Beide findest du im Wohnviertel beziehungsweise am Stadttor.');return;}
  if(id==='archivist'){meetArchivist();return;}
  if(type==='reading'){if(!state.flags.archiveScrollsReceived){meetArchivist();return;}readArchiveScrolls();return;}
  if(type==='deposit'){depositArchiveScrolls();return;}
  if(type==='talk'){const t=G.talks[id];if(window.Adventure.cast[id]!==undefined)talk(id,t,h);else info(t[0],t[1]);return;}
  if(type==='take'){if(own(id)||['lamp','flint'].includes(id)&&own('light')){toast('Diesen Gegenstand hast du bereits.');return;}flyToBag(id,state.scene+':'+i);add('inventory',id);save();render();toast(G.items[id]+' in den Botenbeutel gelegt.');return;}
  if(type==='gate'){info('Sechs leere Siegelplätze',`Diese Mechanik ist mit der Chronik in der Basilika verbunden. Du hast ${state.seals.length} von sechs Erkenntnis-Siegeln gefunden. Beginne im Wohnviertel und auf dem Forum.`);return;}
  if(type==='evidence'){add('evidence',id);save();info(G.evidence[id][0],`Im Licht wird die Spur sichtbar. Überlege, welche Maßnahme sie erklärt: ${G.evidence[id][1]}. Die Spur ist jetzt für die Schubladen festgehalten.`);render();return;}
  if(type==='finalgate'){sealLock();return;}
  if(type==='puzzle')openPuzzle(id);
 }
 function meetArchivist(){
  if(state.flags.archiveScrollsDeposited){info('Der Archivar','Danke! Die Schriftrollen liegen sicher im erhellten Archiv.');return;}
  open('Der Archivar','<p class="intro-copy">Diese Schriftrollen sollen ins Archiv. Sie berichten von den Maßnahmen gegen Christen ab 303. Lies sie vorher sorgfältig: Ihr Inhalt hilft dir, die Spuren im dunklen Raum zu verstehen.</p><p>Mit deiner brennenden Öllampe findest du den Weg. Ordne die vier Spuren richtig zu, um das Licht wiederherzustellen. Dann kannst du die Schriftrollen auf dem freien Regalplatz ablegen.</p>','Vor der Archivtür');
  button(state.flags.archiveScrollsReceived?'Schriftrollen lesen':'Schriftrollen übernehmen und lesen',()=>{state.flags.archiveScrollsReceived=true;add('inventory','scrolls');save();render();readArchiveScrolls();},'primary',actions());
 }
 function readArchiveScrolls(){
  const t=G.texts.archive;let page=0;
  function show(){open('Die Schriftrollen des Archivars',`<article class="reading-panel"><h3>${esc(t.title)}</h3><p>${esc(t.body[page])}</p></article><p class="muted">Schriftrolle ${page+1} von ${t.body.length}</p>`,'Auftrag für das Archiv');const a=actions();
   if(page>0)button('Zurück',()=>{page--;show();},'',a);
   if(page<t.body.length-1)button('Nächste Schriftrolle',()=>{page++;show();},'primary',a);
   else button('Gelesen – zum Archiv bringen',()=>{state.flags.archiveScrollsRead=true;add('seen','text:archive');save();close();render();toast('Die Schriftrollen sind im Botenbeutel. Du kannst sie dort und im Notizbuch nachlesen.');},'primary',a);
  }show();
 }
 function depositArchiveScrolls(){
  if(!has('archive'))return locked('Stelle zuerst das Licht im Archiv wieder her.');
  if(state.flags.archiveScrollsDeposited)return;
  if(!own('scrolls'))return locked('Hole zuerst die Schriftrollen beim Archivar ab.');
  state.inventory=state.inventory.filter(id=>id!=='scrolls');state.flags.archiveScrollsDeposited=true;save();render();
  complete('archive');
  const notice=document.createElement('p');notice.className='clue';notice.textContent='Die Schriftrollen sind sicher auf dem Regalplatz abgelegt. Der Auftrag des Archivars ist erfüllt.';$('#modal-content').prepend(notice);
 }
 function endTalk(){const b=document.querySelector('#speech');if(!b)return;b.remove();document.querySelector('#scene').classList.remove('talking');document.querySelectorAll('.hotspot.speaking').forEach(h=>h.classList.remove('speaking'));if(talkReturn?.isConnected)talkReturn.focus();talkReturn=null;refreshSpots();}
 let talkReturn=null;
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('#speech'))endTalk();});
 // Gespräche erscheinen als Sprechblase direkt in der großen Szene, kein eigenes Fenster.
 function talk(id,t,h){
  const sentences=t[1].match(/[^.!?]+[.!?]+(?:[“”»«])?|[^.!?]+$/g)||[t[1]];const chunks=[];sentences.forEach(x=>{const last=chunks[chunks.length-1];if(last&&(last+x).length<170)chunks[chunks.length-1]=last+x;else chunks.push(x);});let page=0;
  const x=h?.[1]??50;const onRight=x>50;
  endTalk();talkReturn=document.activeElement;
  const sceneEl=$('#scene');sceneEl.classList.add('talking');
  document.querySelector(`.hotspot[data-hotspot="${id}"]`)?.classList.add('speaking');
  const bubble=document.createElement('section');bubble.id='speech';bubble.className='speech-bubble in-scene '+(onRight?'left':'right');bubble.setAttribute('role','dialog');bubble.setAttribute('aria-label','Gespräch mit '+t[0]);
  if(onRight)bubble.style.right=Math.min(100-x+9,56)+'%';else bubble.style.left=Math.min(x+9,56)+'%';
  sceneEl.append(bubble);
  function show(){
   bubble.innerHTML=`<button type="button" class="speech-close" aria-label="Gespräch beenden">✕</button><span class="speaker">${esc(t[0])}</span><p aria-live="polite">${esc(chunks[page].trim())}</p><span class="dialogue-progress">${page+1} / ${chunks.length}</span><div class="actions"></div>`;
   bubble.querySelector('.speech-close').onclick=endTalk;
   const a=bubble.querySelector('.actions');
   if(page>0)button('Zurück',()=>{page=Math.max(0,page-1);show();},'',a);
   const main=page+1<chunks.length?button('Weiter zuhören',()=>{page+=1;show();},'primary',a):button('Weiter erkunden',endTalk,'primary',a);
   main.focus();
  }show();
 }
 function sealLock(){
  if(state.seals.length<6){info('Die Mechanik wartet','Noch fehlen Erkenntnis-Siegel. Erkunde die offenen Orte auf der Stadtkarte.');return;}
  let chosen=null;const placed=state.flags.sealSockets||[];
  open('Das Siegelrad','<p>Sechs Erkenntnisse halten die Chronik zusammen. Wähle ein Siegel und setze es in die passende Vertiefung.</p><div class="seal-lock"><div class="seal-rack"></div><div class="seal-wheel"></div></div><p id="seal-message" role="status"></p>','Die Basilika','puzzle');
  G.seals.forEach((name,i)=>{const pick=button(name,()=>{chosen=name;document.querySelectorAll('.seal-rack button').forEach(b=>b.setAttribute('aria-pressed',String(b===pick)));},'seal found',$('.seal-rack'));pick.disabled=placed.includes(name);
   const socket=button(placed.includes(name)?'✓ '+name:name,()=>{if(!chosen){$('#seal-message').textContent='Wähle zuerst ein Siegel aus deinem Beutel.';return;}if(chosen!==name){$('#seal-message').textContent='Die Gravur passt noch nicht. Suche die Vertiefung mit derselben Erkenntnis.';return;}
    if(!placed.includes(name))placed.push(name);state.flags.sealSockets=placed;socket.textContent='✓ '+name;socket.classList.add('fitted');socket.disabled=true;pick.disabled=true;chosen=null;save();$('#seal-message').textContent='Das Siegel rastet ein.';
    if(placed.length===6){state.flags.sealsPlaced=true;save();render();info('Die sechs Siegel greifen ineinander','Die Zeitmechanik ist frei. Ordne zuerst die Ereignisse; danach kannst du die Argumentationsbrücke bauen.');}
   },'seal-socket',$('.seal-wheel'));socket.dataset.seal=name;socket.style.left=(50+33*Math.cos(i*Math.PI/3))+'%';socket.style.top=(50+33*Math.sin(i*Math.PI/3))+'%';socket.disabled=placed.includes(name);if(socket.disabled)socket.classList.add('fitted');
  });if(placed.length===6)button('Zur Zeitmechanik',()=>{state.flags.sealsPlaced=true;save();close();render();},'primary',actions());
 }
 function renderInventory(){const inv=$('#inventory');
  inv.innerHTML=`<div class="bag" role="dialog" aria-label="Botenbeutel"><button type="button" class="bag-close" aria-label="Botenbeutel schließen">✕</button><div class="bag-handle" aria-hidden="true"></div><div class="bag-flap"><span>Botenbeutel</span></div><div class="bag-inner"><div class="items"></div></div><p class="inv-help">Gegenstand antippen, dann das Ziel in der Szene. Zum Kombinieren zwei Gegenstände nacheinander antippen.</p></div>`;
  const grid=inv.querySelector('.items'),list=state.inventory.filter(id=>G.items[id]);
  list.forEach(id=>{const b=button('',()=>selectItem(id),'item-card',grid);b.innerHTML=`<img src="assets/inventory/${id}.${id==='flint'?'png':'svg'}" alt=""><span>${esc(G.items[id])}</span>`;b.setAttribute('aria-pressed',String(selected===id));if(selected===id)b.classList.add('selected');});
  for(let k=list.length;k<Math.max(6,Math.ceil(list.length/3)*3);k++){const e=document.createElement('span');e.className='slot-empty';e.setAttribute('aria-hidden','true');grid.append(e);}
  inv.querySelector('.bag-close').onclick=()=>toggleBag(false);
  inv.onclick=e=>{if(e.target===inv)toggleBag(false);};
  const pill=$('#selected-item');pill.innerHTML=selected?`<img src="assets/inventory/${selected}.${selected==='flint'?'png':'svg'}" alt="">${esc(G.items[selected])}<button type="button" aria-label="Auswahl aufheben">✕</button>`:'';
  if(selected)pill.querySelector('button').onclick=()=>{selected=null;renderInventory();};
 }
 function toggleBag(show){const el=$('#inventory');if(show===undefined)show=el.hidden;el.hidden=!show;$('#inventory-toggle').setAttribute('aria-expanded',String(show));if(show)$('#inventory-toggle').classList.remove('has-new');}
 function selectItem(id){if(id==='scrolls'){toggleBag(false);readArchiveScrolls();return;}if(selected===id){selected=null;renderInventory();return;}
  if(selected&&[selected,id].includes('lamp')&&[selected,id].includes('flint')){state.inventory=state.inventory.filter(x=>!['lamp','flint'].includes(x));add('inventory','light');selected=null;save();render();toast('Die Öllampe brennt. Jetzt kannst du im Archiv sehen.');if(state.scene==='archive'&&!has('archive')&&G.minigames?.archive){toggleBag(false);setTimeout(()=>openPuzzle('archive'),900);}return;}
  selected=id;renderInventory();toggleBag(false);toast(G.items[id]+' ist gewählt. Tippe jetzt das Ziel in der Szene an. Zum Kombinieren öffne den Beutel und tippe einen zweiten Gegenstand an.');
 }
 $('#inventory-toggle').onclick=()=>toggleBag();document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#inventory').hidden)toggleBag(false);});
 function showMap(){activePuzzle=null;
  const P=G.mapLayout||{};const order=G.scenes.map(s=>s.id);const pt=id=>P[id]||[50,50];
  const road=order.map(id=>pt(id)).map(([x,y])=>`${x*16},${y*9}`).join(' ');
  const opened=order.filter(id=>state.unlocked.includes(id));
  const roadOpen=order.slice(0,Math.max(1,order.findLastIndex?order.findLastIndex(id=>state.unlocked.includes(id))+1:opened.length)).map(id=>pt(id)).map(([x,y])=>`${x*16},${y*9}`).join(' ');
  const trees=[[5,40],[7,46],[12,90],[16,93],[40,92],[44,95],[60,93],[95,45],[97,52],[92,90],[26,8],[58,6],[74,90],[38,32],[56,34]];
  open('Wege durch die Erinnerungen',`<p class="map-lead">Jeder Ort zeigt eine andere Zeit. Tippe auf einen geöffneten Ort, um dorthin zu reisen.</p><div class="parchment-map"><svg class="pm-art" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
   <defs><radialGradient id="pm-bg" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="#f6e7c4"/><stop offset=".7" stop-color="#e8d19f"/><stop offset="1" stop-color="#c9a468"/></radialGradient>
   <pattern id="pm-grain" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#8a6a3a" opacity=".12"/><circle cx="4.5" cy="5" r=".6" fill="#8a6a3a" opacity=".1"/></pattern></defs>
   <rect width="1600" height="900" fill="url(#pm-bg)"/><rect width="1600" height="900" fill="url(#pm-grain)"/>
   <g fill="#b89b6a" opacity=".35"><path d="M0 250q120-90 260-30t180 10v-230H0z"/><path d="M1600 820q-140 30-260-20t-160 100h420z"/></g>
   <path d="M1290 -20C1230 170 1370 300 1300 450S1180 700 1330 920" fill="none" stroke="#7fa7a0" stroke-width="70" stroke-linecap="round"/>
   <path d="M1290 -20C1230 170 1370 300 1300 450S1180 700 1330 920" fill="none" stroke="#a9c9c0" stroke-width="18" stroke-dasharray="40 30" opacity=".7"/>
   <path d="M1180 385h210" stroke="#7a5230" stroke-width="30"/><path d="M1180 385h210" stroke="#caa878" stroke-width="18"/>
   <path d="M130 820C90 520 150 180 520 110S1120 70 1180 300 1150 760 820 840 230 900 130 820z" fill="#d8bd87" fill-opacity=".45" stroke="#8a6a3a" stroke-width="10" stroke-dasharray="26 8"/>
   <polyline points="${road}" fill="none" stroke="#b08c58" stroke-width="16" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="2 22" opacity=".9"/>
   <polyline points="${roadOpen}" fill="none" stroke="#7a5230" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="18 12"/>
   ${trees.map(([x,y])=>`<g transform="translate(${x*16} ${y*9})"><ellipse cx="0" cy="12" rx="16" ry="5" fill="#6b5a32" opacity=".3"/><path d="M0-26C16-26 22-6 12 6H-12C-22-6-16-26 0-26z" fill="#6f8a4a" stroke="#4a5e2e" stroke-width="3"/><path d="M0 6v10" stroke="#5a3a1c" stroke-width="4"/></g>`).join('')}
   <g transform="translate(95 105)" stroke="#6b4a1c" fill="#6b4a1c"><circle r="52" fill="none" stroke-width="3"/><circle r="40" fill="none" stroke-width="1.5"/><path d="M0-62L10 0 0 62-10 0z" fill="#8a5a2e"/><path d="M-62 0L0-10 62 0 0 10z" fill="#b8955a"/><text y="-68" text-anchor="middle" font-size="26" stroke="none" font-family="Georgia">N</text></g>
   <text x="1325" y="160" transform="rotate(-78 1325 160)" font-size="30" font-style="italic" fill="#3f6b62" font-family="Georgia" letter-spacing="6">Fluss</text>
   <rect x="8" y="8" width="1584" height="884" fill="none" stroke="#6b4a1c" stroke-width="6"/><rect x="20" y="20" width="1560" height="860" fill="none" stroke="#6b4a1c" stroke-width="2"/>
  </svg><div class="pm-places"></div></div>`,'Stadtkarte','map');
  const layer=$('.pm-places');
  G.scenes.forEach((s,index)=>{const accessible=state.unlocked.includes(s.id),here=s.id===state.scene,[x,y]=pt(s.id);const b=document.createElement('button');b.type='button';b.className='pm-place'+(accessible?'':' locked')+(here?' here':'');b.style.left=x+'%';b.style.top=y+'%';b.disabled=!accessible;
   b.setAttribute('aria-label',`${index+1}. ${s.name} – ${accessible?(here?'du bist hier':s.era):'noch verschlossen'}`);
   b.innerHTML=`<span class="pm-medal" style="background-image:url('assets/backgrounds/v3-${s.art||s.id}.png')"><span class="pm-num">${accessible?index+1:'🔒'}</span></span><span class="pm-label"><b>${esc(s.name)}</b><small>${here?'Du bist hier':accessible?esc(s.era):'Noch verschlossen'}</small></span>${here?'<span class="pm-here" aria-hidden="true">▼</span>':''}`;
   b.onclick=()=>travel(s.id,'map');layer.append(b);});
 }
 $('#map').onclick=showMap;
 function showJournal(){activePuzzle=null;let html='<p>Deine gesicherten Erkenntnisse und eigenen Gedanken. Alles bleibt auf diesem Gerät.</p>';
  state.notes.forEach(id=>{const n=G.notes[id];if(n)html+=`<article class="journal"><h3>${esc(n[0])}</h3><p>${esc(n[1])}</p></article>`;});
  ['motives','council','bridge'].forEach(id=>{const d=state.drafts[id];if(d?.reason)html+=`<article class="journal"><h3>${esc(G.puzzles[id].title)} · Deine Begründung</h3><p class="personal">${esc(d.reason)}</p><p class="muted">Eigener Text – nicht automatisch fachlich bewertet.</p></article>`;});
  if(!state.notes.length)html+='<p class="clue">Die Seiten füllen sich, wenn du die Erinnerungen erschließt.</p>';
  const read=Object.keys(G.texts||{}).filter(k=>state.seen.includes('text:'+k));if(read.length){html+='<h3 class="journal-section">Gelesene Fachtexte</h3>';read.forEach(k=>{html+=`<details class="journal-text"><summary>📜 ${esc(G.texts[k].title)}</summary>${readingHtml(G.texts[k],false)}</details>`;});}
  html+=window.BonusGames?.journalHtml()||'';
  open('Das Notizbuch',html,'Gesammelt unterwegs','journal');window.BonusGames?.bindJournal($('#modal-content'));const a=actions();button('Als Text herunterladen',exportNotes,'primary',a);button('Drucken',()=>window.print(),'',a);
 }
 $('#notebook').onclick=showJournal;
 function exportNotes(){let text='IM ZEICHEN DER WENDE\n\n';state.notes.forEach(id=>{if(G.notes[id])text+=G.notes[id].join('\n')+'\n\n';});for(const id of ['motives','council','bridge'])if(state.drafts[id]?.reason)text+='Eigene Begründung – '+G.puzzles[id].title+'\n'+state.drafts[id].reason+'\n\n';const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='Meine-Stadtchronik.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function hint(){const id=activePuzzle||scene().hotspots.find(h=>h[3]==='puzzle'&&!has(h[4]))?.[4];if(!id){info('Die Öllampe','Sprich mit den Menschen, sammle Gegenstände und öffne die Stadtkarte. Neue Wege entstehen durch deine Erkenntnisse.');return;}
  const p=G.puzzles[id];let level=state.hints[id]||0;if(level<3)level++;state.hints[id]=level;save();
  if(activePuzzle&&$('#hint-box')){$('#hint-box').hidden=false;$('#hint-box').textContent=`Hinweis ${level}/3: ${p.hints[level-1]}`;return;}
  info(`Öllampe · Hinweis ${level}/3`,p.hints[level-1]);
 }
 $('#hint').onclick=hint;
 function locked(message){info('Hier fehlt noch etwas',message);}
 const classicMode=new Set();
 document.addEventListener('minigame-win',e=>{if(G.puzzles[e.detail])complete(e.detail);});
 function readingHtml(t,withButton){return `<article class="reading-panel"><h3>${esc(t.title)}</h3>${t.body.map(x=>`<p>${esc(x)}</p>`).join('')}${t.source?`<blockquote class="source-quote"><p>${esc(t.source.text)}</p><cite>${esc(t.source.ref)}</cite></blockquote>`:''}${withButton?'<button type="button" class="primary to-puzzle">← Zurück zum Rätsel</button>':''}</article>`;}
 function openPuzzle(id){
  if(id==='vision'&&!has('map312'))return locked('Die Karte am Lager muss zuerst richtig beschriftet sein.');
  if(id==='archive'&&state.evidence.length<4&&!(G.minigames?.archive&&!classicMode.has('archive')))return locked('Untersuche erst die Schriftrolle, die versiegelte Tür, das Kirchenmodell und die Kette.');
  if(['timeline','bridge'].includes(id)&&!state.flags.sealsPlaced)return locked('Setze zuerst die sechs Siegel in die große Mechanik.');
  if(id==='bridge'&&!has('timeline'))return locked('Ordne zuerst die Ereignisse in der Zeitmechanik.');
  activePuzzle=id;const p=G.puzzles[id];let d=state.drafts[id];if(!d||!Array.isArray(d.values))d=state.drafts[id]={values:p.rows.map(()=>null),reason:''};
  const steps=G.steps?.[id];const stepsSeen=state.seen.includes('steps:'+id);const text=G.texts?.[id];open(p.title,`${text?readingHtml(text,true):''}<div class="puzzle-head"><p>${esc(p.prompt)}</p><div class="puzzle-help-buttons">${text?`<button type="button" id="puzzle-text" aria-expanded="false"${state.seen.includes('textunlock:'+id)?'':' hidden'}>📜 Fachtext</button>`:''}<button id="puzzle-hint" aria-label="Hinweis zum Rätsel">♧ Hinweis</button></div></div>${steps?`<details class="puzzle-steps"${has(id)||state.seen.includes('steps:'+id)?'':' open'}><summary>So funktioniert's</summary><ol>${steps.map(t=>`<li>${esc(t)}</li>`).join('')}</ol></details>`:''}<p id="hint-box" class="clue" hidden></p><div id="puzzle-work" class="${p.type}"></div><div id="feedback" role="status" aria-live="polite"></div>`,'Erinnerung · '+scene().era,'puzzle');activePuzzle=id;$('#puzzle-hint').onclick=hint;if(steps&&!stepsSeen){add('seen','steps:'+id);save();}if(text){const mc=$('#modal-content');const setTab=t=>{mc.dataset.tab=t;$('#puzzle-text')?.setAttribute('aria-expanded',String(t==='read'));if(t==='read'){add('seen','text:'+id);save();}$('#modal').scrollTop=0;};$('#puzzle-text').onclick=()=>setTab('read');mc.querySelector('.to-puzzle').onclick=()=>setTab('solve');setTab('solve');}
  const work=$('#puzzle-work');
  const mg=G.minigames?.[id];
  if(mg&&!classicMode.has(id)&&window.MiniGames?.[mg.type]){$('#modal').dataset.mode='minigame';$('#modal-title').textContent=mg.title;$('.puzzle-head p').textContent=mg.prompt||'';$('.puzzle-steps')?.remove();window.MiniGames[mg.type](id,mg,work);const a=actions();button('Zurück in die Szene',close,'',a);return;}
  if(window.Adventure.renderPuzzle(id,p,d,work,save)){
  }else if(p.type==='gears'){
   work.classList.add('gears');p.rows.forEach((r,i)=>{const g=document.createElement('section');g.className='gear';g.innerHTML=`<h3>${esc(r.label)}</h3>`;const b=button(d.values[i]===null?'Zahnrad drehen':r.options[d.values[i]],()=>{d.values[i]=d.values[i]===null?0:(d.values[i]+1)%r.options.length;g.style.setProperty('--rotation',((d.values[i]+1)*120)+'deg');b.textContent=r.options[d.values[i]];b.setAttribute('aria-label',r.label+': '+r.options[d.values[i]]);save();},'',g);g.append(Object.assign(document.createElement('small'),{textContent:'Antippen zum Drehen'}));work.append(g);});
  }else{
   if(p.type==='map')work.innerHTML='<div class="schematic" aria-label="Schematische Karte: Fluss mit Brücke bei der Stadt"><span>Stadt ▥</span><span>Fluss ≋ · Übergang ═</span><span>Zwei Heere ⚑</span></div>';
   if(p.type==='balance')work.innerHTML='<div class="balance-title"><span>Glaube</span>⚖<span>Politik</span></div>';
   const unique=[...new Set(p.rows.flatMap(r=>r.options))];let token=null;
   const rack=document.createElement('div');rack.className='rack';rack.setAttribute('aria-label','Bausteine auswählen');work.append(rack);
   unique.forEach(value=>{const b=button(value,()=>{token=value;rack.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#placement-help').textContent='Gewählt: '+value+' – tippe jetzt auf einen passenden Platz.';},'',rack);b.setAttribute('aria-pressed','false');});
   const help=document.createElement('p');help.id='placement-help';help.className='muted';help.textContent='Tippe zuerst einen Baustein oben an, dann einen Platz darunter. Du kannst jeden Platz neu belegen.';work.append(help);
   const slots=document.createElement('div');slots.className='slots';work.append(slots);
   p.rows.forEach((r,i)=>{const slot=document.createElement('div');slot.className='slot';slot.innerHTML=`<span class="slot-label" id="row-${i}">${esc(r.label)}</span>`;const b=button(d.values[i]===null?'＋ Baustein einsetzen':r.options[d.values[i]],()=>{if(token===null){toast('Wähle zuerst einen Baustein oben aus.');return;}const index=r.options.indexOf(token);if(index<0){toast('Dieser Baustein passt zu einem anderen Teil des Mechanismus.');return;}d.values[i]=index;b.textContent=token;b.className='filled';slot.querySelector('.row-feedback')?.remove();save();},d.values[i]===null?'':'filled',slot);b.id='slot-'+i;b.setAttribute('aria-describedby','row-'+i);b.setAttribute('aria-label','Platz: '+r.label);slots.append(slot);});
  }
  if(['balance','bridge','council'].includes(p.type)){
   const label=document.createElement('label');label.className='reason-label';label.htmlFor='reason';label.textContent=p.type==='balance'?'Begründe eine Karte und wäge ab: Welche Rolle könnten Glaube und Politik zusammen spielen?':p.type==='bridge'?'Deine eigene Begründung der Wende (mindestens zwei Sätze):':'Deine Erklärung (optional, auch mündlich möglich):';work.append(label);const t=document.createElement('textarea');t.id='reason';t.maxLength=4000;t.value=d.reason||'';t.placeholder='Ich begründe meine Einordnung so …';t.oninput=()=>{d.reason=t.value;$('#confirm-reflection')?.remove();save();};work.append(t);
   const note=document.createElement('p');note.className='muted';note.textContent='Dein Text wird gespeichert. Die App beurteilt offene Begründungen nicht automatisch. Besprich sie mit deiner Gruppe oder Lehrkraft.';work.append(note);
  }
  const a=actions();button(p.type==='balance'?'Einordnung reflektieren':'Mechanismus prüfen',()=>check(id),'primary',a);button('Zurück in die Szene',close,'',a);
  if(has(id)){$('#feedback').className='feedback success';$('#feedback').textContent='Diese Erinnerung hast du bereits erschlossen. Du kannst deine Einordnung erneut ansehen und ändern.';}
 }
 function check(id){const p=G.puzzles[id],d=state.drafts[id],fb=$('#feedback');fb.className='feedback';
  if(d.values.some((v,i)=>!Number.isInteger(v)||v<0||v>=p.rows[i].options.length)){fb.textContent='Der Mechanismus ist noch unvollständig. Belege alle Plätze.';fb.scrollIntoView({block:'nearest'});return;}
  const errors=[];p.rows.forEach((r,i)=>{const good=r.answer.includes(d.values[i]);const b=$('#slot-'+i);if(b){b.classList.toggle('correct',good);b.classList.toggle('wrong',!good);b.parentElement.querySelector('.row-feedback')?.remove();if(!good){const n=document.createElement('p');n.className='row-feedback';n.textContent=r.feedback;b.parentElement.append(n);}}if(!good)errors.push(r.feedback);});
  if(errors.length){fb.textContent=errors.join('\n\n');const tb=$('#puzzle-text');if(tb&&tb.hidden){tb.hidden=false;tb.classList.add('pulse');add('seen','textunlock:'+id);save();const n=document.createElement('p');n.className='text-offer';n.innerHTML='Noch nicht ganz. Frag noch einmal die Personen in der Szene – oder lies oben im <strong>📜 Fachtext</strong> nach.';fb.prepend(n);}fb.scrollIntoView({block:'nearest'});return;}
  if(['balance','bridge'].includes(p.type)&&d.reason.trim().length<30){fb.textContent='Deine Bausteine sind gesetzt. Formuliere jetzt eine eigene Begründung mit mindestens 30 Zeichen. Die Länge ist nur eine Eingabehilfe, keine fachliche Bewertung.';$('#reason').focus();return;}
  if(p.type==='balance'){
   fb.className='feedback success';fb.innerHTML='<strong>Deine Einordnung ist gespeichert.</strong><p>Prüfe deine Begründung an diesen Perspektiven: Einheit und stabile Ordnung lassen sich politisch erklären. Persönliche religiöse Überzeugung verweist auf Glauben. Förderung christlicher Gemeinden kann beides verbinden. Auch beim Zeichen und beim Sieg sind verschiedene Deutungen möglich; die Vision ist später berichtet.</p><p>Ist deine Einordnung nachvollziehbar begründet? Besprich besonders eine Karte, die auch anders liegen könnte.</p>';
   if(!$('#confirm-reflection')){const b=button('Ich habe meine Begründung geprüft – Siegel nehmen',()=>complete(id),'primary',fb);b.id='confirm-reflection';}return;
  }
  complete(id);
 }
 function complete(id){const p=G.puzzles[id];const already=has(id);add('solved',id);if(p.seal)add('seals',p.seal);if(p.reward&&!own(p.reward)){add('inventory',p.reward);$('#inventory-toggle').classList.add('has-new');}if(G.notes[id])add('notes',id);unlock();save();render();activePuzzle=null;
  if(id==='archive'&&!state.flags.archiveScrollsDeposited){info('Das Archiv ist erhellt','Du hast alle Spuren zugeordnet und das Licht wiederhergestellt. Lege nun die Schriftrollen auf dem freien Regalplatz ab.');return;}
  if(id==='archive'&&!state.flags.galerius){state.flags.galerius=true;add('notes','galerius');save();render();open('Eine Nachricht verändert die Stadt',`<p class="eyebrow">Zeitsprung · 311</p><p class="intro-copy">Ein Bote verkündet: „Galerius beendet die staatliche Verfolgung weitgehend.“ Die Hauskirche kann wieder geöffnet werden. Der Wandel beginnt schon vor Konstantins Sieg.</p><p>Auf der Stadtkarte ist jetzt das Militärlager erreichbar.</p>`,'Das Tor zum neuen Jahrhundert');button('Die Nachricht weitertragen',close,'primary',actions());return;}
  if(id==='bridge'){state.flags.finished=true;save();open('Die Chronik ist wieder offen',`<div class="ending"><span>✧</span><h3>Im Zeichen der Wende</h3><p>Du hast die Erinnerungen zusammengefügt: von unterschiedlichen Verfolgungen über rechtliche Absicherung bis zur gezielten Förderung des Christentums.</p></div><p style="margin-top:20px">Die Entwicklung geschah in mehreren Schritten. Sie machte 313 nicht alle anderen Religionen illegal.</p><p><strong>Besprecht zum Abschluss:</strong> Welche Veränderung rechtfertigt den Begriff „Wende“ am stärksten? Belegt eure Antwort mit zwei Ereignissen.</p>`,'Die Stadtchronik · vollständig');const a=actions();button('Mein Notizbuch öffnen',showJournal,'primary',a);button('Stadt weiter erkunden',close,'',a);return;}
  const sum=G.summaries?.[id];const fallback=G.notes[id]?.[1]||(id==='map312'?'Die Karte ist vollständig. Konstantins Zelt ist jetzt zugänglich.':'Die Zeitfolge stimmt. Die Argumentationsbrücke ist jetzt zugänglich.');
  const sealHtml=p.seal?`<div class="seal-award${already?'':' fresh'}">${sealMedal(p.seal,true)}<div class="seal-award-text"><span class="seal-kicker">Erkenntnis-Siegel gesichert</span><strong>„${esc(p.seal)}“</strong><span class="seal-count">${state.seals.length} von 6 Siegeln</span><div class="seal-row">${G.seals.map(n=>`<span class="mini-seal${state.seals.includes(n)?' got':''}" title="${esc(n)}">${state.seals.includes(n)?esc(G.sealInfo?.[n]?.sym||'✦'):''}</span>`).join('')}</div></div></div>`:'';
  const body=sum?`<section class="learned"><h3>Das hast du herausgefunden</h3><ul>${sum.learned.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section><div class="merke"><span>Merke</span><p>${esc(sum.merke)}</p></div>`:`<p class="intro-copy">${esc(fallback)}</p>`;
  const extra=`${p.reward?`<p class="reward-line"><img src="assets/inventory/${p.reward}.svg" alt=""> Neu in deinem Botenbeutel: <strong>${esc(G.items[p.reward])}</strong></p>`:''}${sum?.next?`<p class="next-line">➜ ${esc(sum.next)}</p>`:''}`;
  open(already?'Erinnerung erneut erschlossen':'Der Mechanismus öffnet sich',sealHtml+body+extra,'Eine neue Spur','reward');const a=actions();button('Weiter erkunden',close,'primary',a);button('Stadtkarte ansehen',showMap,'',a);
 }
 function sealMedal(name,big){const inf=G.sealInfo?.[name]||{sym:'✦',color:'#6b4b1f'};return `<svg class="seal-medal${big?' big':''}" viewBox="0 0 120 120" role="img" aria-label="Siegel ${esc(name)}"><defs><radialGradient id="wax-${esc(name)}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#f7dc93"/><stop offset=".55" stop-color="#d5a24a"/><stop offset="1" stop-color="#8a5f1c"/></radialGradient></defs><path d="M60 4c7 0 9 6 15 7s11-3 16 2 2 11 5 16 10 5 12 12-4 10-4 16 6 10 4 17-9 7-12 12 0 12-5 16-11 0-16 2-8 8-15 8-9-6-15-7-11 3-16-2-2-11-5-16-10-5-12-12 4-10 4-16-6-10-4-17 9-7 12-12 0-12 5-16 11 0 16-2 8-8 15-8z" fill="url(#wax-${esc(name)})" stroke="#6e4a14" stroke-width="2"/><circle cx="60" cy="60" r="38" fill="none" stroke="#fff3c4" stroke-width="2" opacity=".7"/><circle cx="60" cy="60" r="33" fill="${inf.color}" opacity=".92"/><text x="60" y="${name.length>4?57:60}" text-anchor="middle" dominant-baseline="middle" font-size="26" fill="#fff3d0">${esc(inf.sym)}</text><text x="60" y="80" text-anchor="middle" font-size="${name.length>6?11:13}" font-weight="700" letter-spacing="1" fill="#fff3d0" font-family="Georgia,serif">${esc(name.toUpperCase())}</text></svg>`;}
 function reset(){open('Ein neues Spiel beginnen?','<p>Der Spielstand auf diesem Gerät wird ersetzt. Lade bei Bedarf zuerst dein Notizbuch herunter.</p>','Spielmenü');const a=actions();button('Neues Spiel starten',()=>{try{localStorage.removeItem(KEY);}catch(e){}window.BonusGames?.reset();state=fresh();state.started=true;selected=null;activePuzzle=null;close();render();info(G.scenes[0].name,G.scenes[0].intro);},'danger',a);button('Abbrechen',menu,'',a);}

 function continuationMenu(){
  activePuzzle=null;
  open('Spielstand mitnehmen','<p>Speichere deinen aktuellen Stand online und öffne ihn mit dem Code auf einem anderen Gerät. Jeder neue Code bewahrt genau diesen Stand für 90 Tage; spätere Änderungen bleiben zunächst auf diesem Gerät.</p><p>Der Spielstand wird verschlüsselt gespeichert. Wer deinen Code kennt, kann ihn laden. Bewahre ihn privat auf.</p><div id="continuation-actions" class="actions"></div><label for="continuation-code">Fortsetzungscode</label><input id="continuation-code" type="text" maxlength="40" autocomplete="off" autocorrect="off" autocapitalize="characters" spellcheck="false" placeholder="XXXX-XXXX" style="display:block;width:100%;box-sizing:border-box;font:inherit;font-size:1.4em;letter-spacing:.15em;text-align:center;padding:12px;margin:12px 0"><p id="continuation-status" role="status" aria-live="polite"></p><div id="continuation-preview"></div>','Auf einem anderen Gerät weiterspielen','continuation');
  const box=$('#continuation-code'),status=$('#continuation-status'),preview=$('#continuation-preview'),a=$('#continuation-actions');
  const valid=()=>box.isConnected;
  const saving=button('Stand speichern und Code erhalten',async()=>{
   saving.disabled=true;loading.disabled=true;status.textContent='Spielstand wird gespeichert …';preview.replaceChildren();
   try{
    save();const result=await window.WendeContinuation.save(JSON.parse(JSON.stringify(state)),window.BonusGames?.exportProgress());
    if(!valid())return;box.value=result.code;
    status.textContent='Gespeichert! Code notieren oder kopieren. Gültig bis '+new Date(result.expiresAt).toLocaleDateString('de-DE')+'.';
    button('Code kopieren',async()=>{try{await navigator.clipboard.writeText(result.code);status.textContent='Code kopiert. Bewahre ihn privat auf.';}catch(e){box.focus();box.select();status.textContent='Bitte den markierten Code kopieren.';}},'',preview);
   }catch(e){if(valid())status.textContent=e.message||'Speichern fehlgeschlagen. Dein lokaler Stand bleibt erhalten.';}
   finally{if(valid()){saving.disabled=false;loading.disabled=false;}}
  },'primary',a);
  const loading=button('Code laden',async()=>{
   loading.disabled=true;saving.disabled=true;status.textContent='Gespeicherten Stand suchen …';preview.replaceChildren();
   try{
    const found=await window.WendeContinuation.load(box.value);if(!valid())return;
    status.textContent='Stand gefunden: '+G.scenes.find(s=>s.id===found.state.scene).name+' · '+found.state.solved.length+' gelöste Rätsel'+(found.bonus?.found?.length?' · '+found.bonus.found.length+' entdeckte Bonusspiele':'')+' · gespeichert am '+new Date(found.savedAt).toLocaleString('de-DE')+'.';
    const p=document.createElement('p');p.textContent='Beim Übernehmen wird dein aktueller Stand auf diesem Gerät ersetzt. Du kannst ihn vorher mit einem eigenen Code sichern.';preview.append(p);
    button('Diesen Stand übernehmen',()=>{
     try{
      const next={...fresh(),...found.state,started:true};
      localStorage.setItem(KEY,JSON.stringify(next));
      window.BonusGames?.mergeProgress(found.bonus);
      state=next;selected=null;activePuzzle=null;close();render();toast('Spielstand geladen. Du kannst hier weiterspielen.');
     }catch(e){status.textContent='Dein Browser konnte den Stand nicht speichern. Der bisherige Spielstand bleibt erhalten.';}
    },'primary',preview);
   }catch(e){if(valid())status.textContent=e.message||'Laden fehlgeschlagen. Dein lokaler Stand bleibt erhalten.';}
   finally{if(valid()){loading.disabled=false;saving.disabled=false;}}
  },'',a);
  box.addEventListener('input',()=>{preview.replaceChildren();status.textContent='';});
  button('Zurück zum Spielmenü',menu,'',actions());
 }

 function menu(){activePuzzle=null;open('Im Zeichen der Wende',`<p class="eyebrow">Ein historisches Point-and-Click-Adventure</p><p class="intro-copy">Eine verschlossene Chronik. Sechs fehlende Siegel. Und eine Stadt, deren Geschichte sich grundlegend verändert.</p><p>Du bist Bote oder Botin. Untersuche Gegenstände, sprich mit Menschen und verbinde ihre Spuren. Stadtkarte, Botenbeutel und Notizbuch begleiten dich.</p>${!storageOK?'<p class="save-warning">Speichern ist gerade nicht verfügbar. Lass diesen Tab geöffnet.</p>':''}`,'Willkommen','menu');const a=actions();button(state.started?'Spiel fortsetzen':'Die Stadt betreten',()=>{state.started=true;save();close();render();if(!state.seen.includes('intro:gate')){add('seen','intro:gate');save();info('Das Stadttor',G.scenes[0].intro);}},'primary',a);if(state.started)button('Neues Spiel',reset,'',a);button('Spielstand speichern / Code laden',continuationMenu,'',a);button('So spielst du',()=>info('So spielst du','Grüne Markierungen (i) informieren: Sprich mit den Menschen und untersuche die Dinge. Rätsel sind terrakottafarben (✦) – sie öffnen sich erst, wenn du dort genug erfahren hast (🔒 zeigt, wie viel noch fehlt). Beige Namensschilder kennzeichnen Gegenstände zum Mitnehmen. Bonusspiele schaltest du durch gelöste Rätsel frei und startest sie im Notizbuch. Kombinieren: Gegenstand wählen, dann Ziel antippen. Die Öllampe gibt drei gestufte Hilfen.'),'',a);}
 const title=$('#title');title.addEventListener('pointerdown',()=>{held=false;clearTimeout(holdTimer);holdTimer=setTimeout(()=>{held=true;teacher();},5000);});for(const e of ['pointerup','pointercancel','pointerleave'])title.addEventListener(e,()=>clearTimeout(holdTimer));title.addEventListener('contextmenu',e=>e.preventDefault());title.onclick=()=>{if(!held)menu();held=false;};title.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.shiftKey){e.preventDefault();teacher();}});
 function teacher(){activePuzzle=null;open('Lehrkraftmodus','<p class="clue">Lokaler Testzugang, kein geschützter Adminbereich. Änderungen betreffen nur dieses Gerät. Zum Zurücksetzen einzelner Rätsel bleiben bereits geöffnete Orte zugänglich.</p><h3>Ort direkt öffnen</h3><div class="teacher-scenes"></div><h3>Rätsel gelöst / ungelöst</h3><div class="teacher-grid"></div><h3>Gegenstände hinzufügen</h3><div id="teacher-items" class="teacher-scenes"></div>','Spieltitel 5 Sekunden halten · alternativ Umschalt + Enter','teacher');
  G.scenes.forEach(s=>button(s.name,()=>{add('unlocked',s.id);enter(s.id);},'',$('.teacher-scenes')));
  Object.entries(G.puzzles).forEach(([id,p])=>{const label=document.createElement('label'),c=document.createElement('input');c.type='checkbox';c.checked=has(id);c.onchange=()=>{if(c.checked){add('solved',id);if(p.seal)add('seals',p.seal);if(p.reward)add('inventory',p.reward);if(G.notes[id])add('notes',id);if(id==='archive'){state.flags.archiveScrollsDeposited=true;state.inventory=state.inventory.filter(x=>x!=='scrolls');state.flags.galerius=true;add('notes','galerius');}}else{state.solved=state.solved.filter(x=>x!==id);state.notes=state.notes.filter(x=>x!==id);if(p.seal){state.seals=state.seals.filter(x=>x!==p.seal);state.flags.sealsPlaced=false;state.flags.sealSockets=[];}if(id==='archive'){state.flags.galerius=false;state.notes=state.notes.filter(x=>x!=='galerius');}if(id==='bridge')state.flags.finished=false;}render();};label.append(c,document.createTextNode(p.title));$('.teacher-grid').append(label);});
  Object.entries(G.items).forEach(([id,name])=>button(name,()=>{add('inventory',id);render();toast(name+' hinzugefügt.');},'',$('#teacher-items')));
  const a=actions();button('Alle sechs Siegel geben',()=>{state.seals=[...G.seals];save();toast('Alle sechs Siegel vorhanden.');},'',a);button('Finale direkt testen',()=>{state.seals=[...G.seals];state.flags.sealsPlaced=true;add('unlocked','basilica');enter('basilica');},'primary',a);button('Spielstand löschen',reset,'danger',a);
 }
 const full=$('#fullscreen');
 function fullState(){const on=!!(document.fullscreenElement||document.webkitFullscreenElement||document.body.classList.contains('focus-mode'));full.setAttribute('aria-pressed',String(on));full.setAttribute('aria-label',on?'Vollbild verlassen':'Vollbild einschalten');full.innerHTML=on?'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>':'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';full.title=on?'Vollbild verlassen':'Vollbild';}
 full.onclick=async()=>{try{if(document.fullscreenElement||document.webkitFullscreenElement){const exit=document.exitFullscreen||document.webkitExitFullscreen;await exit.call(document);}else if(document.body.classList.contains('focus-mode')){document.body.classList.remove('focus-mode');}else{const root=document.documentElement,request=root.requestFullscreen||root.webkitRequestFullscreen;if(request)await request.call(root);else{document.body.classList.add('focus-mode');toast('Ansicht maximiert. Für Vollbild in Safari: Teilen → Zum Home-Bildschirm.');}}}catch(e){toast('Der Browser erlaubt Vollbild hier nicht. Öffne das Spiel direkt oder füge es in Safari zum Home-Bildschirm hinzu.');}fullState();};
 document.addEventListener('fullscreenchange',fullState);document.addEventListener('webkitfullscreenchange',fullState);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('focus-mode')){document.body.classList.remove('focus-mode');fullState();}});
 render();menu();
})();

document.querySelector('#inventory-toggle')?.addEventListener('click',e=>e.currentTarget.classList.remove('has-new'));
