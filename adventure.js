'use strict';
// Separate scene art and tactile puzzle interfaces; historical content stays in game-data.js.
window.Adventure = (() => {
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const cast={guard:0,resident:1,merchant:2,rumor:2,chronicler:3,clerk:4,control:5,messenger:6,advisor:7};
 function scene(s,state){
  const el=document.querySelector('#scene');el.dataset.place=s.id;el.classList.toggle('illuminated',state.inventory.includes('light'));el.classList.toggle('changed',!!state.flags.galerius);
  document.querySelector('#actors').innerHTML='';
  document.querySelectorAll('.hotspot').forEach((b,i)=>{
   const h=s.hotspots[i];
   if(cast[h[4]]!==undefined)b.classList.add('person');
   if(h[4]==='flint'){
    b.classList.add('collectible');b.querySelector('.pin').remove();
    b.insertAdjacentHTML('afterbegin','<img src="assets/inventory/flint.png" alt="" class="flint-art">');
    b.hidden=state.inventory.includes('flint')||state.inventory.includes('light');
   }
  });
 }
 function renderPuzzle(id,p,d,work,save){
  work.dataset.mechanism=id;
  if(p.type==='gears')return false;
  const make=(tag,cls,parent=work)=>{const n=document.createElement(tag);n.className=cls;parent.append(n);return n;};
  const btn=(text,fn,parent,cls='')=>{const b=make('button',cls,parent);b.type='button';b.textContent=text;b.onclick=fn;return b;};
  const help=make('p','touch-instruction');help.textContent=['sources','vision','cases','archive','change','motives'].includes(id)?'Tippe eine Karte an. Wähle danach ihr Fach. Du kannst jede Zuordnung ändern.':'Wähle einen Baustein. Tippe danach auf seinen Platz im Mechanismus.';
  const status=make('p','placement-status');status.id='placement-help';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  let active=0;
  const set=(i,j)=>{d.values[i]=j;save();document.querySelector('#confirm-reflection')?.remove();};
  // Cards physically move into labeled trays. Akten use the same reliable touch gesture with a stamp animation.
  if(['sources','vision','cases','archive','change','motives'].includes(id)){
   const frame=make('div','sorting-table '+id);
   if(id==='motives'){const scale=make('div','scale-art',frame);scale.setAttribute('aria-hidden','true');scale.innerHTML='<span class="scale-beam"></span><span class="scale-post"></span><span class="scale-foot"></span>';}
   const desk=make('section','card-desk',frame);const title=make('h3','',desk);title.textContent=id==='cases'?'Auf dem Schreibtisch':id==='archive'?'Gesicherte Spuren':'Noch einzuordnen';
   const pending=make('div','pending-cards',desk);const trays=make('div','sorting-trays',frame);const cards=[];const bins=new Map();
   const options=[...new Set(p.rows.flatMap(r=>r.options))];
   options.forEach((value,j)=>{const tray=make('section','sorting-tray tray-'+j,trays);const b=btn(value,()=>{
    const row=p.rows[active],choice=row.options.indexOf(value);if(choice<0){status.textContent='Dieses Fach gehört zu einer anderen Akte. Wähle ein passendes Fach für die markierte Karte.';return;}
    set(active,choice);const placed=active;refresh();cards[placed].classList.add('just-placed');status.textContent='Abgelegt: '+row.label+' – '+value;
    const next=d.values.findIndex(v=>v===null);if(next>=0)select(next);else select(placed);
   },tray,id==='cases'?'stamp':'tray-handle');b.dataset.choice=value;
    const contents=make('div','tray-cards',tray);bins.set(value,{tray,b,contents});
   });
   p.rows.forEach((r,i)=>{const card=make('div','slot document-card',pending);const b=btn(r.label,()=>select(i),card,'card-face');b.id='slot-'+i;b.setAttribute('aria-label','Karte: '+r.label);const label=make('small','assignment',card);cards.push(card);});
   function select(i){active=i;cards.forEach((c,k)=>{c.classList.toggle('chosen',k===i);c.querySelector('button').setAttribute('aria-pressed',String(k===i));});bins.forEach(({b},key)=>b.disabled=!p.rows[i].options.includes(key));status.textContent='Gewählt: '+p.rows[i].label;}
   function refresh(){cards.forEach((c,i)=>{const value=d.values[i]===null?null:p.rows[i].options[d.values[i]];const target=value?bins.get(value).contents:pending;target.append(c);c.querySelector('.assignment').textContent=value?'Zugeordnet: '+value:'';c.querySelector('button').classList.toggle('filled',value!==null);c.querySelector('button').classList.remove('correct','wrong');c.querySelector('.row-feedback')?.remove();});
    title.textContent=d.values.every(v=>v!==null)?'Alle Karten sind abgelegt – prüfe den Mechanismus.':id==='cases'?'Auf dem Schreibtisch':id==='archive'?'Gesicherte Spuren':'Noch einzuordnen';
    if(id==='motives'){const left=d.values.filter(v=>v===0).length,right=d.values.filter(v=>v===1).length;frame.style.setProperty('--tilt',(right-left)*3+'deg');}
   }
   refresh();select(Math.max(0,d.values.findIndex(v=>v===null)));return true;
  }
  // Tokens and sockets: railway-like ropes, map positions, chronological rings, bridge arches.
  let token=null;const rack=make('div','rack');rack.setAttribute('aria-label','Bausteine auswählen');
  const board=make('div','mechanism-board board-'+id);const slots=[];
  const options=[...new Set(p.rows.flatMap(r=>r.options))];
  options.forEach(value=>btn(value,()=>{token=value;rack.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.textContent===value)));status.textContent='Gewählt: '+value;},rack));
  if(id==='map312'){
   board.innerHTML='<svg class="river-map" viewBox="0 0 900 520" aria-hidden="true"><path fill="#cab98b" d="M0 0h900v520H0z"/><path d="M420-20C180 170 760 250 450 540" fill="none" stroke="#66999a" stroke-width="95"/><path d="M430-20C190 170 770 250 460 540" fill="none" stroke="#a8c6bc" stroke-width="4" stroke-dasharray="22 18"/><path d="M510 170L350 300" stroke="#624c32" stroke-width="56"/><path d="M510 170L350 300" stroke="#d8c196" stroke-width="38"/><g fill="#a27854" stroke="#594b38" stroke-width="4"><path d="M650 90V35h25v25h25V35h25v55z"/><path d="M120 380l45-85 45 85z"/><path d="M720 380l45-85 45 85z"/></g></svg>';
   const note=make('small','map-caption',board);note.textContent='Spielskizze – keine historische Truppenaufstellung';
  }
  let groups=[];
  if(id==='sacrifice'){for(const t of ['Weg A · Das Opfer wird geleistet','Weg B · Das Opfer wird verweigert','Die Veränderung erkennen']){const g=make('section','rope-track',board);make('h3','',g).textContent=t;groups.push(make('div','rope-sockets',g));}}
  p.rows.forEach((r,i)=>{
   const parent=id==='sacrifice'?groups[i<4?0:i<8?1:2]:board;const slot=make('section','slot socket',parent);slot.dataset.socket=String(i);
   make('span','slot-label',slot).textContent=r.label;
   const b=btn(d.values[i]===null?'＋ Einsetzen':r.options[d.values[i]],()=>{if(token===null){status.textContent='Wähle zuerst einen Baustein.';return;}const j=r.options.indexOf(token);if(j<0){status.textContent='Dieser Baustein gehört zu einem anderen Teil.';return;}set(i,j);b.textContent=token;b.className='filled';slot.querySelector('.row-feedback')?.remove();slot.classList.add('engaged');status.textContent='Eingesetzt: '+r.label+' – '+token;},slot,d.values[i]===null?'':'filled');b.id='slot-'+i;b.setAttribute('aria-label','Platz: '+r.label);slots.push(slot);
  });
  if(id==='council'){const echo=make('div','council-link',board);echo.innerHTML='<span>Kirche</span><span aria-hidden="true">⟷</span><span>Reich</span>';}
  return true;
 }
 return {scene,cast,renderPuzzle};
})();
