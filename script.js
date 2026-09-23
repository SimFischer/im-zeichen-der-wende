'use strict';
(() => {
 const G=window.GAME, $=s=>document.querySelector(s), KEY='im-zeichen-der-wende:v1';
 const fresh=()=>({version:1,started:false,scene:'gate',unlocked:['gate','house','forum'],inventory:[],solved:[],seals:[],notes:[],seen:[],evidence:[],drafts:{},hints:{},flags:{},progress:0});
 let state=fresh(), storageOK=true, selected=null, activePuzzle=null, modalMode='', returnFocus=null, toastTimer, holdTimer, held=false;
 try { const s=JSON.parse(localStorage.getItem(KEY)); if(s&&s.version===1){state={...fresh(),...s}; for(const k of ['unlocked','inventory','solved','seals','notes','seen','evidence']) if(!Array.isArray(state[k]))state[k]=fresh()[k]; for(const k of ['drafts','hints','flags'])if(!state[k]||typeof state[k]!=='object'||Array.isArray(state[k]))state[k]={}; if(!G.scenes.some(x=>x.id===state.scene))state.scene='gate';} }catch(e){storageOK=false;}
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const scene=()=>G.scenes.find(s=>s.id===state.scene);
 const has=id=>state.solved.includes(id), own=id=>state.inventory.includes(id);
 const add=(key,value)=>{if(!state[key].includes(value))state[key].push(value);};
 const save=()=>{state.progress=state.solved.length;try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}catch(e){storageOK=false;toast('Speichern ist in diesem Browser nicht möglich. Lass diesen Tab geöffnet.');}};
 function toast(text){$('#toast').textContent=text;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),5500);}
 function open(title,html,kicker='Die Stadtchronik',mode='info') {if(!$('#modal').open)returnFocus=document.activeElement;modalMode=mode;$('#modal').dataset.mode=mode;$('#modal-title').textContent=title;$('#modal-kicker').textContent=kicker;$('#modal-content').innerHTML=html;if(!$('#modal').open)$('#modal').showModal();$('#modal').scrollTop=0;$('#close').focus();}
 function close(){ $('#modal').close();activePuzzle=null;modalMode='';if(returnFocus?.isConnected)returnFocus.focus(); }
 $('#close').onclick=close;$('#modal').addEventListener('cancel',e=>{e.preventDefault();close();});
 function button(text,fn,cls='primary',parent=$('#modal-content')){const b=document.createElement('button');b.textContent=text;b.className=cls;b.onclick=fn;parent.append(b);return b;}
 function actions(){const n=document.createElement('div');n.className='actions';$('#modal-content').append(n);return n;}
 function info(title,body){activePuzzle=null;open(title,`<p class="intro-copy">${esc(body)}</p>`);button('Zurück in die Szene',close,'primary',actions());}
 function unlock(){
  if(has('conflict')&&has('sources'))add('unlocked','office');
  if(has('cases'))add('unlocked','temple');
  if(has('sacrifice'))add('unlocked','archive');
  if(has('archive'))add('unlocked','camp');
  if(has('vision'))add('unlocked','city');
  if(has('change'))add('unlocked','motives');
  if(has('motives'))add('unlocked','council');
  if(has('council'))add('unlocked','basilica');
 }
 function objective(){
  const id=state.scene;
  if(id==='gate')return state.seals.length===6?'Alle Siegel gefunden. Die Chronik wartet in der Basilika.':'Erkunde die Erinnerungen. Finde sechs Erkenntnis-Siegel für die Chronik.';
  if(id==='archive'&&!own('light'))return 'Kombiniere Öllampe und Feuerstein im Botenbeutel.';
  if(id==='archive'&&state.evidence.length<4)return 'Untersuche die vier Spuren im Licht deiner Lampe.';
  if(id==='camp'&&!has('map312'))return 'Beschrifte das Kartenbrett, um Konstantins Zelt zu öffnen.';
  if(id==='basilica'&&!state.flags.sealsPlaced)return 'Setze deine sechs Erkenntnis-Siegel in die große Mechanik.';
  const p=scene().hotspots.find(h=>h[3]==='puzzle'&&!has(h[4]));
  if(p)return `Erkunde den Ort. Untersuche: ${p[0]}.`;
  return 'Diese Erinnerung ist erschlossen. Folge einem Weg (➜) oder nutze die Stadtkarte.';
 }
 function render(){endTalk();unlock();const s=scene();$('#scene-name').textContent=s.name;$('#era').textContent=s.era;
  const art=$('#art');art.style.backgroundImage=`url('assets/backgrounds/v3-${s.id}.png')`;$('#app').style.setProperty('--scene-img',`url('assets/backgrounds/v3-${s.id}.png')`);art.style.backgroundSize='contain';art.style.backgroundPosition='center';
  art.style.filter=s.id==='archive'&&!own('light')?'brightness(.28) saturate(.65)':'';
  $('#world-change').className=state.flags.galerius?'open':'';
  if(s.id==='house'&&state.flags.galerius)$('#era').textContent='Nach 311 · die Hauskirche ist wieder offen';
  $('#hotspots').innerHTML='';s.hotspots.forEach((h,i)=>{const b=document.createElement('button');b.className='hotspot';b.style.left=h[1]+'%';b.style.top=h[2]+'%';b.dataset.hotspot=h[4]||h[3];const done=h[3]==='puzzle'&&has(h[4]);if(done)b.classList.add('done');if(state.seen.includes(s.id+':'+i))b.classList.add('seen');b.innerHTML=`<span class="pin" aria-hidden="true">${done?'✓':'·'}</span><span class="label">${esc(h[0])}</span>`;b.onclick=()=>interact(h,i);$('#hotspots').append(b);});
  window.Adventure.scene(s,state);renderExits(s);$('#objective').textContent=objective();renderInventory();save();
 }
 function travel(id,via){
  if(!state.unlocked.includes(id)){toast(G.exitHints?.[id]||'Dieser Weg ist noch versperrt. Finde zuerst weitere Spuren.');return;}
  if(id==='archive'&&!state.flags.archiveUnlocked){if(!own('key')){toast('Der Archivschlüssel fehlt. Untersuche den Seilzug im Tempelbezirk.');return;}if(selected!=='key'){toast(via==='map'?'Wähle zuerst den Archivschlüssel im Botenbeutel und tippe dann das Archiv auf der Karte an.':'Die Archivtür ist verschlossen. Wähle den Archivschlüssel im Botenbeutel und tippe dann erneut auf den Weg.');close();$('#inventory').hidden=false;$('#inventory-toggle').setAttribute('aria-expanded','true');return;}state.flags.archiveUnlocked=true;selected=null;}
  if(id==='office'&&!state.flags.passShown){if(!own('pass')){toast('Der Botenpass fehlt.');return;}state.flags.passShown=true;toast('Du zeigst den Botenpass. Der Schreiber lässt dich ein.');}
  enter(id);
 }
 function renderExits(s){(G.exits?.[s.id]||[]).forEach(([target,x,y,label])=>{const dest=G.scenes.find(z=>z.id===target);if(!dest)return;const open=state.unlocked.includes(target);const b=document.createElement('button');b.type='button';b.className='exit'+(open?'':' locked')+(x<18?' edge-left':x>82?' edge-right':'');b.style.left=(x<18?1.5:x>82?98.5:x)+'%';b.style.top=y+'%';b.dataset.exit=target;b.setAttribute('aria-label',(open?'Gehe zu: ':'Noch versperrt: ')+dest.name);b.innerHTML=`<span class="exit-arrow" aria-hidden="true">${open?'➜':'🔒'}</span><span class="label">${esc(label)}${label.includes(dest.name.split(' ').pop())?'':`<small>${esc(dest.name)}</small>`}</span>`;b.onclick=()=>travel(target,'walk');$('#hotspots').append(b);});}
 function enter(id){if(!state.unlocked.includes(id))return;close();state.scene=id;selected=null;$('#inventory').hidden=true;$('#inventory-toggle').setAttribute('aria-expanded','false');render();if(!state.seen.includes('intro:'+id)){add('seen','intro:'+id);save();info(scene().name,scene().intro);}}
 // Kleine Animation: der Gegenstand fliegt aus der Szene in den Botenbeutel.
 function flyToBag(id){const from=document.querySelector(`.hotspot[data-hotspot="${id}"]`)?.getBoundingClientRect(),to=$('#inventory-toggle')?.getBoundingClientRect();if(!from||!to||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const img=document.createElement('img');img.src=`assets/inventory/${id}.svg`;img.alt='';img.className='fly-item';img.style.left=(from.left+from.width/2-32)+'px';img.style.top=(from.top+from.height/2-32)+'px';document.body.append(img);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{img.style.transform=`translate(${to.left+to.width/2-from.left-from.width/2}px,${to.top+to.height/2-from.top-from.height/2}px) scale(.45)`;img.style.opacity='.2';}));
  setTimeout(()=>{img.remove();$('#inventory-toggle')?.classList.add('bag-bump','has-new');setTimeout(()=>$('#inventory-toggle')?.classList.remove('bag-bump'),450);},750);}
 function interact(h,i){endTalk();add('seen',state.scene+':'+i);save();const [label,x,y,type,id]=h;
  if(state.scene==='archive'&&!own('light')){info('Zu dunkel','Du erkennst nur Umrisse. Öffne den Botenbeutel. Wähle die Öllampe und dann den Feuerstein, um sie zu entzünden. Beide findest du im Wohnviertel beziehungsweise am Stadttor.');return;}
  if(type==='talk'){const t=G.talks[id];if(window.Adventure.cast[id]!==undefined)talk(id,t,h);else info(t[0],t[1]);return;}
  if(type==='take'){if(own(id)||['lamp','flint'].includes(id)&&own('light')){toast('Diesen Gegenstand hast du bereits.');return;}flyToBag(id,state.scene+':'+i);add('inventory',id);save();render();toast(G.items[id]+' in den Botenbeutel gelegt.');return;}
  if(type==='gate'){info('Sechs leere Siegelplätze',`Diese Mechanik ist mit der Chronik in der Basilika verbunden. Du hast ${state.seals.length} von sechs Erkenntnis-Siegeln gefunden. Beginne im Wohnviertel und auf dem Forum.`);return;}
  if(type==='evidence'){add('evidence',id);save();info(G.evidence[id][0],`Im Licht wird die Spur sichtbar. Überlege, welche Maßnahme sie erklärt: ${G.evidence[id][1]}. Die Spur ist jetzt für die Schubladen festgehalten.`);render();return;}
  if(type==='finalgate'){sealLock();return;}
  if(type==='puzzle')openPuzzle(id);
 }
 function endTalk(){const b=document.querySelector('#speech');if(!b)return;b.remove();document.querySelector('#scene').classList.remove('talking');document.querySelectorAll('.hotspot.speaking').forEach(h=>h.classList.remove('speaking'));if(talkReturn?.isConnected)talkReturn.focus();talkReturn=null;}
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
 function selectItem(id){if(selected===id){selected=null;renderInventory();return;}
  if(selected&&[selected,id].includes('lamp')&&[selected,id].includes('flint')){state.inventory=state.inventory.filter(x=>!['lamp','flint'].includes(x));add('inventory','light');selected=null;save();render();toast('Die Öllampe brennt. Jetzt kannst du im Archiv sehen.');return;}
  selected=id;renderInventory();toggleBag(false);toast(G.items[id]+' ist gewählt. Tippe jetzt das Ziel in der Szene an. Zum Kombinieren öffne den Beutel und tippe einen zweiten Gegenstand an.');
 }
 $('#inventory-toggle').onclick=()=>toggleBag();document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#inventory').hidden)toggleBag(false);});
 function showMap(){activePuzzle=null;open('Wege durch die Erinnerungen','<p>Jeder Ort zeigt eine andere Zeit. Du kannst zu geöffneten Orten zurückkehren.</p><div class="map-grid city-map"><svg class="city-paths" viewBox="0 0 1000 680" aria-hidden="true"><path d="M40 520Q300 540 260 300T450 70M260 300Q570 460 780 250T940 420M450 70L720 80L780 250M450 70L540 240L530 460L760 570L950 580" fill="none" stroke="#d6bc83" stroke-width="25"/><path d="M0 590Q300 370 640 580T1000 600" fill="none" stroke="#789f94" stroke-width="34"/></svg></div>','Stadtkarte','map');
  G.scenes.forEach((s,index)=>{const accessible=state.unlocked.includes(s.id),b=button(s.name,()=>travel(s.id,'map'),'map-place',$('.map-grid'));const positions=[[13,77],[26,45],[45,16],[54,40],[72,16],[79,43],[93,65],[53,72],[76,88],[25,16],[93,90]];b.style.left=positions[index][0]+'%';b.style.top=positions[index][1]+'%';b.disabled=!accessible;b.innerHTML=`<strong>${esc(s.name)}</strong><small>${accessible?(s.id===state.scene?'Du bist hier':esc(s.era)):'Noch nicht zugänglich · weitere Spuren finden'}</small>`;});
 }
 $('#map').onclick=showMap;
 function showJournal(){activePuzzle=null;let html='<p>Deine gesicherten Erkenntnisse und eigenen Gedanken. Alles bleibt auf diesem Gerät.</p>';
  state.notes.forEach(id=>{const n=G.notes[id];if(n)html+=`<article class="journal"><h3>${esc(n[0])}</h3><p>${esc(n[1])}</p></article>`;});
  ['motives','council','bridge'].forEach(id=>{const d=state.drafts[id];if(d?.reason)html+=`<article class="journal"><h3>${esc(G.puzzles[id].title)} · Deine Begründung</h3><p class="personal">${esc(d.reason)}</p><p class="muted">Eigener Text – nicht automatisch fachlich bewertet.</p></article>`;});
  if(!state.notes.length)html+='<p class="clue">Die Seiten füllen sich, wenn du die Erinnerungen erschließt.</p>';
  const read=Object.keys(G.texts||{}).filter(k=>state.seen.includes('text:'+k));if(read.length){html+='<h3 class="journal-section">Gelesene Fachtexte</h3>';read.forEach(k=>{html+=`<details class="journal-text"><summary>📜 ${esc(G.texts[k].title)}</summary>${readingHtml(G.texts[k],false)}</details>`;});}
  open('Das Notizbuch',html,'Gesammelt unterwegs','journal');const a=actions();button('Als Text herunterladen',exportNotes,'primary',a);button('Drucken',()=>window.print(),'',a);
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
 function readingHtml(t,withButton){return `<article class="reading-panel"><h3>${esc(t.title)}</h3>${t.body.map(x=>`<p>${esc(x)}</p>`).join('')}${t.source?`<blockquote class="source-quote"><p>${esc(t.source.text)}</p><cite>${esc(t.source.ref)}</cite></blockquote>`:''}${withButton?'<button type="button" class="primary to-puzzle">Weiter zum Rätsel →</button>':''}</article>`;}
 function openPuzzle(id){
  if(id==='vision'&&!has('map312'))return locked('Die Karte am Lager muss zuerst richtig beschriftet sein.');
  if(id==='archive'&&state.evidence.length<4)return locked('Untersuche erst die Schriftrolle, die versiegelte Tür, das Kirchenmodell und die Kette.');
  if(['timeline','bridge'].includes(id)&&!state.flags.sealsPlaced)return locked('Setze zuerst die sechs Siegel in die große Mechanik.');
  if(id==='bridge'&&!has('timeline'))return locked('Ordne zuerst die Ereignisse in der Zeitmechanik.');
  activePuzzle=id;const p=G.puzzles[id];let d=state.drafts[id];if(!d||!Array.isArray(d.values))d=state.drafts[id]={values:p.rows.map(()=>null),reason:''};
  const steps=G.steps?.[id];const stepsSeen=state.seen.includes('steps:'+id);const text=G.texts?.[id];const firstRead=text&&!state.seen.includes('text:'+id)&&!has(id);open(p.title,`${text?`<div class="puzzle-tabs" role="tablist"><button type="button" role="tab" data-tab="read">📜 Fachtext lesen</button><button type="button" role="tab" data-tab="solve">🧩 Rätsel lösen</button></div>${readingHtml(text,true)}`:''}<div class="puzzle-head"><p>${esc(p.prompt)}</p><button id="puzzle-hint" aria-label="Hinweis zum Rätsel">♧ Hinweis</button></div>${steps?`<details class="puzzle-steps"${has(id)||state.seen.includes('steps:'+id)?'':' open'}><summary>So funktioniert's</summary><ol>${steps.map(t=>`<li>${esc(t)}</li>`).join('')}</ol></details>`:''}<p id="hint-box" class="clue" hidden></p><div id="puzzle-work" class="${p.type}"></div><div id="feedback" role="status" aria-live="polite"></div>`,'Erinnerung · '+scene().era,'puzzle');activePuzzle=id;$('#puzzle-hint').onclick=hint;if(steps&&!stepsSeen){add('seen','steps:'+id);save();}if(text){const mc=$('#modal-content');const setTab=t=>{mc.dataset.tab=t;mc.querySelectorAll('.puzzle-tabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===t)));if(t==='read'){add('seen','text:'+id);save();}$('#modal').scrollTop=0;};mc.querySelectorAll('.puzzle-tabs button').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));mc.querySelector('.to-puzzle').onclick=()=>setTab('solve');setTab(firstRead?'read':'solve');}
  const work=$('#puzzle-work');
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
  if(errors.length){fb.textContent=errors.join('\n\n');fb.scrollIntoView({block:'nearest'});return;}
  if(['balance','bridge'].includes(p.type)&&d.reason.trim().length<30){fb.textContent='Deine Bausteine sind gesetzt. Formuliere jetzt eine eigene Begründung mit mindestens 30 Zeichen. Die Länge ist nur eine Eingabehilfe, keine fachliche Bewertung.';$('#reason').focus();return;}
  if(p.type==='balance'){
   fb.className='feedback success';fb.innerHTML='<strong>Deine Einordnung ist gespeichert.</strong><p>Prüfe deine Begründung an diesen Perspektiven: Einheit und stabile Ordnung lassen sich politisch erklären. Persönliche religiöse Überzeugung verweist auf Glauben. Förderung christlicher Gemeinden kann beides verbinden. Auch beim Zeichen und beim Sieg sind verschiedene Deutungen möglich; die Vision ist später berichtet.</p><p>Ist deine Einordnung nachvollziehbar begründet? Besprich besonders eine Karte, die auch anders liegen könnte.</p>';
   if(!$('#confirm-reflection')){const b=button('Ich habe meine Begründung geprüft – Siegel nehmen',()=>complete(id),'primary',fb);b.id='confirm-reflection';}return;
  }
  complete(id);
 }
 function complete(id){const p=G.puzzles[id];const already=has(id);add('solved',id);if(p.seal)add('seals',p.seal);if(p.reward&&!own(p.reward)){add('inventory',p.reward);$('#inventory-toggle').classList.add('has-new');}if(G.notes[id])add('notes',id);unlock();save();render();activePuzzle=null;
  if(id==='archive'&&!state.flags.galerius){state.flags.galerius=true;add('notes','galerius');save();render();open('Eine Nachricht verändert die Stadt',`<p class="eyebrow">Zeitsprung · 311</p><p class="intro-copy">Ein Bote verkündet: „Galerius beendet die staatliche Verfolgung weitgehend.“ Die Hauskirche kann wieder geöffnet werden. Der Wandel beginnt schon vor Konstantins Sieg.</p><p>Auf der Stadtkarte ist jetzt das Militärlager erreichbar.</p>`,'Das Tor zum neuen Jahrhundert');button('Die Nachricht weitertragen',close,'primary',actions());return;}
  if(id==='bridge'){state.flags.finished=true;save();open('Die Chronik ist wieder offen',`<div class="ending"><span>✧</span><h3>Im Zeichen der Wende</h3><p>Du hast die Erinnerungen zusammengefügt: von unterschiedlichen Verfolgungen über rechtliche Absicherung bis zur gezielten Förderung des Christentums.</p></div><p style="margin-top:20px">Die Entwicklung geschah in mehreren Schritten. Sie machte 313 nicht alle anderen Religionen illegal.</p><p><strong>Besprecht zum Abschluss:</strong> Welche Veränderung rechtfertigt den Begriff „Wende“ am stärksten? Belegt eure Antwort mit zwei Ereignissen.</p>`,'Die Stadtchronik · vollständig');const a=actions();button('Mein Notizbuch öffnen',showJournal,'primary',a);button('Stadt weiter erkunden',close,'',a);return;}
  open(already?'Erinnerung erneut erschlossen':'Der Mechanismus öffnet sich',`<p class="intro-copy">${esc(G.notes[id]?.[1]|| (id==='map312'?'Die Karte ist vollständig. Konstantins Zelt ist jetzt zugänglich.':'Die Zeitfolge stimmt. Die Argumentationsbrücke ist jetzt zugänglich.'))}</p>${p.seal?`<div class="seals"><span class="seal found">${esc(p.seal)}</span></div><p>Erkenntnis-Siegel „${esc(p.seal)}“ gesichert.</p>`:''}${p.reward?`<p>In deinem Botenbeutel: <strong>${esc(G.items[p.reward])}</strong>.</p>`:''}`,'Eine neue Spur');const a=actions();button('Weiter erkunden',close,'primary',a);button('Stadtkarte ansehen',showMap,'',a);
 }
 function reset(){open('Ein neues Spiel beginnen?','<p>Der Spielstand auf diesem Gerät wird ersetzt. Lade bei Bedarf zuerst dein Notizbuch herunter.</p>','Spielmenü');const a=actions();button('Neues Spiel starten',()=>{try{localStorage.removeItem(KEY);}catch(e){}state=fresh();state.started=true;selected=null;activePuzzle=null;close();render();info(G.scenes[0].name,G.scenes[0].intro);},'danger',a);button('Abbrechen',menu,'',a);}
 function menu(){activePuzzle=null;open('Im Zeichen der Wende',`<p class="eyebrow">Ein historisches Point-and-Click-Adventure</p><p class="intro-copy">Eine verschlossene Chronik. Sechs fehlende Siegel. Und eine Stadt, deren Geschichte sich grundlegend verändert.</p><p>Du bist Bote oder Botin. Untersuche Gegenstände, sprich mit Menschen und verbinde ihre Spuren. Stadtkarte, Botenbeutel und Notizbuch begleiten dich.</p>${!storageOK?'<p class="save-warning">Speichern ist gerade nicht verfügbar. Lass diesen Tab geöffnet.</p>':''}`,'Willkommen','menu');const a=actions();button(state.started?'Spiel fortsetzen':'Die Stadt betreten',()=>{state.started=true;save();close();render();if(!state.seen.includes('intro:gate')){add('seen','intro:gate');save();info('Das Stadttor',G.scenes[0].intro);}},'primary',a);if(state.started)button('Neues Spiel',reset,'',a);button('So spielst du',()=>info('So spielst du','Tippe markierte Gegenstände und Personen an. Kombinieren: Gegenstand wählen, dann Ziel antippen. Bausteine setzen: erst Baustein, dann Platz. Die Öllampe gibt drei gestufte Hilfen.'),'',a);}
 const title=$('#title');title.addEventListener('pointerdown',()=>{held=false;clearTimeout(holdTimer);holdTimer=setTimeout(()=>{held=true;teacher();},5000);});for(const e of ['pointerup','pointercancel','pointerleave'])title.addEventListener(e,()=>clearTimeout(holdTimer));title.addEventListener('contextmenu',e=>e.preventDefault());title.onclick=()=>{if(!held)menu();held=false;};title.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.shiftKey){e.preventDefault();teacher();}});
 function teacher(){activePuzzle=null;open('Lehrkraftmodus','<p class="clue">Lokaler Testzugang, kein geschützter Adminbereich. Änderungen betreffen nur dieses Gerät. Zum Zurücksetzen einzelner Rätsel bleiben bereits geöffnete Orte zugänglich.</p><h3>Ort direkt öffnen</h3><div class="teacher-scenes"></div><h3>Rätsel gelöst / ungelöst</h3><div class="teacher-grid"></div><h3>Gegenstände hinzufügen</h3><div id="teacher-items" class="teacher-scenes"></div>','Spieltitel 5 Sekunden halten · alternativ Umschalt + Enter','teacher');
  G.scenes.forEach(s=>button(s.name,()=>{add('unlocked',s.id);enter(s.id);},'',$('.teacher-scenes')));
  Object.entries(G.puzzles).forEach(([id,p])=>{const label=document.createElement('label'),c=document.createElement('input');c.type='checkbox';c.checked=has(id);c.onchange=()=>{if(c.checked){add('solved',id);if(p.seal)add('seals',p.seal);if(p.reward)add('inventory',p.reward);if(G.notes[id])add('notes',id);if(id==='archive'){state.flags.galerius=true;add('notes','galerius');}}else{state.solved=state.solved.filter(x=>x!==id);state.notes=state.notes.filter(x=>x!==id);if(p.seal){state.seals=state.seals.filter(x=>x!==p.seal);state.flags.sealsPlaced=false;state.flags.sealSockets=[];}if(id==='archive'){state.flags.galerius=false;state.notes=state.notes.filter(x=>x!=='galerius');}if(id==='bridge')state.flags.finished=false;}render();};label.append(c,document.createTextNode(p.title));$('.teacher-grid').append(label);});
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
