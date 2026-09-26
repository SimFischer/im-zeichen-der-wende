'use strict';
/* Die Argumentationsbrücke – Abschlussrätsel in der Basilika.
   Eine steinerne Brücke mit vier offenen Bögen. Jeder Bogen trägt einen Satzanfang.
   Phase A: Bogen für Bogen die passende Inschriftplatte antippen – der Bogen rastet ein.
   Phase B: Irrtums-Plaketten prüfen – zu einfache Aussagen antippen und mit „zu einfach“ markieren.
   Phase C: die Inschrift wählen, die über der fertigen Brücke steht.
   Kein Freitext. Ein Sieg meldet sich wie alle Minispiele mit „minigame-win“; die gewählte Inschrift
   wird zusätzlich als „minigame-choice“ gemeldet (Notizbuch).
   Grafiken: assets/minigames/argument-bridge/ – nur Dateien aus cfg.art.available werden geladen,
   sonst zeichnet das Modul Brücke, Platten und Symbole selbst (keine 404-Fehler). */
(()=>{
 if(!window.MiniGames)window.MiniGames={};
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const later=(root,ms,fn)=>setTimeout(()=>{if(root.isConnected)fn();},ms);

 /* Kleine Symbolmedaillons (48er-Raster, als Relieflinien). */
 const ICON={
  chains:'<rect x="7" y="18" width="19" height="11" rx="5.5"/><rect x="22" y="19" width="19" height="11" rx="5.5" transform="rotate(-18 31.5 24.5)"/>',
  edict:'<path d="M15 12 H33 V35 H15 Z"/><path d="M12 12 H36 M12 35 H36"/><path d="M19 19 H29 M19 24 H29"/><circle cx="31" cy="31" r="4.2"/>',
  basilica:'<path d="M24 5 V11 M21 7.5 H27"/><path d="M9 22 L24 12 L39 22 Z"/><path d="M13 22 V35 M19 22 V35 M29 22 V35 M35 22 V35 M8 36 H40"/><path d="M22 35 V29 A2 2 0 0 1 26 29 V35"/>',
  turn:'<path d="M7 33 H41 M7 28 H41"/><path d="M10 33 A6.5 6.5 0 0 1 23 33 M25 33 A6.5 6.5 0 0 1 38 33"/><path d="M13 19 A13 8 0 0 1 35 17"/><path d="M31 12.5 L35.5 17 L30 19.5"/>',
  crown:'<path d="M11 33 L9 15 L18 23 L24 12 L30 23 L39 15 L37 33 Z"/><path d="M11 37 H37"/>',
  people:'<circle cx="15" cy="18" r="4"/><circle cx="33" cy="18" r="4"/><circle cx="24" cy="14.5" r="4.5"/><path d="M8 35 C8 26 22 26 22 35 M26 35 C26 26 40 26 40 35 M15 33 C15 22 33 22 33 31"/>',
  flame:'<path d="M24 37 C13 35 13 24 19 18 C19 23 22 25 22 25 C21 18 25 13 28 10 C29 18 37 22 34 30 C32 35 28 37 24 37 Z"/>',
  temple:'<path d="M8 20 L24 11 L40 20 Z"/><path d="M12 21 V34 M18 21 V34 M24 21 V34 M30 21 V34 M36 21 V34 M8 35 H40"/>',
  heart:'<path d="M24 36 C10 27 11 14 18.5 14 C22 14 24 17.5 24 17.5 C24 17.5 26 14 29.5 14 C37 14 38 27 24 36 Z"/>',
  name:'<path d="M9 16 H30 L38 24 L30 32 H9 Z"/><circle cx="15" cy="24" r="2.2"/><path d="M20 24 H30"/>'
 };
 const ICONS_ORDER=['chains','edict','basilica','turn','crown','people','flame','temple','heart','name'];
 function icon(name,art){
  if(art?.icons){const i=ICONS_ORDER.indexOf(name);return `<span class="ab-icon ab-icon-art" style="background-position:${(i%5)*25}% ${Math.floor(i/5)*100}%" aria-hidden="true"></span>`;}
  return `<svg class="ab-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><circle cx="24" cy="24" r="22.5" fill="url(#ab-medal) #7b5226" stroke="#3c250b" stroke-width="1.2"/><circle cx="24" cy="24" r="19.5" fill="none" stroke="#f3d58c" stroke-opacity=".45"/>
   <g fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="#1e1206" stroke-opacity=".55" stroke-width="3.4" transform="translate(.8 1.1)">${ICON[name]||''}</g><g stroke="url(#ab-relief) #f0cf7e" stroke-width="2.6">${ICON[name]||''}</g></g></svg>`;
 }

 /* Die Brücke als Relief: 4 Bögen (je 250 breit), Pfeiler, Zwickel, Fahrbahn mit Brüstung. */
 const AW=250,CY=250,RI=90,RO=116;
 function bridgeSvg(){
  let piers='',arches='';
  for(let i=0;i<=4;i++){const x=i*AW;piers+=`<path d="M${x-20} ${CY} H${x+20} V440 H${x-20} Z"/><path d="M${x-26} ${CY-8} H${x+26} V${CY+6} H${x-26} Z" class="ab-cornice"/>`;}
  for(let i=0;i<4;i++){const cx=i*AW+AW/2;let stones='';const n=11;
   for(let k=0;k<n;k++){const a0=Math.PI*(1-k/n),a1=Math.PI*(1-(k+1)/n);const p=(r,a)=>`${(cx+r*Math.cos(a)).toFixed(1)} ${(CY-r*Math.sin(a)).toFixed(1)}`;
    const key=k===(n-1)/2;const ro=key?RO+10:RO;
    stones+=`<path class="ab-stone${key?' ab-key':''}" style="--d:${(key?n:Math.abs(k-(n-1)/2))*45}ms" d="M${p(RI,a0)} L${p(ro,a0)} A${ro} ${ro} 0 0 0 ${p(ro,a1)} L${p(RI,a1)} A${RI} ${RI} 0 0 1 ${p(RI,a0)} Z"/>`;}
   const x0=i*AW,x1=x0+AW;
   arches+=`<g class="ab-arch" data-arch="${i}">
    <path class="ab-wall" fill-rule="evenodd" d="M${x0} 122 H${x1} V${CY} H${x0} Z M${cx-RO} ${CY} A${RO} ${RO} 0 0 1 ${cx+RO} ${CY} Z"/>
    <g class="ab-stones">${stones}</g>
    <path class="ab-deck" d="M${x0} 100 H${x1} V122 H${x0} Z"/>
    <path class="ab-rail" d="M${x0} 86 H${x1} V100 H${x0} Z"/>
    <g class="ab-balusters">${[1,2,3,4,5,6,7].map(k=>`<rect x="${x0+k*AW/8-3}" y="88" width="6" height="11" rx="2"/>`).join('')}</g>
    <path class="ab-ghost" d="M${cx-RO} ${CY} A${RO} ${RO} 0 0 1 ${cx+RO} ${CY} M${cx-RI} ${CY} A${RI} ${RI} 0 0 1 ${cx+RI} ${CY} M${x0} 100 H${x1}"/>
   </g>`;}
  return `<svg class="ab-bridge-art" viewBox="-30 30 1060 410" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
   <defs>
    <linearGradient id="ab-stone-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eadbb6"/><stop offset=".55" stop-color="#c4a878"/><stop offset="1" stop-color="#8f7048"/></linearGradient>
    <linearGradient id="ab-pier-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9c8058"/><stop offset=".45" stop-color="#d8c296"/><stop offset="1" stop-color="#7d6242"/></linearGradient>
    <radialGradient id="ab-medal" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#b8843f"/><stop offset=".65" stop-color="#7b5226"/><stop offset="1" stop-color="#4a2f12"/></radialGradient>
    <linearGradient id="ab-relief" x1="0" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="#fff2c0"/><stop offset=".5" stop-color="#e2b25a"/><stop offset="1" stop-color="#a06a22"/></linearGradient>
   </defs>
   <ellipse cx="500" cy="436" rx="560" ry="14" fill="#000" opacity=".35"/>
   <g class="ab-piers" fill="url(#ab-pier-g)" stroke="#5a4428" stroke-width="2">${piers}</g>
   ${arches}
  </svg>`;
 }

 function argbridge(id,cfg,work){
  const A=cfg.art||{},has=k=>(A.available||[]).includes(k),url=k=>A.dir+A[k];
  const art={scene:has('scene'),segments:has('segments'),tokens:has('tokens'),icons:has('icons')};
  const N=cfg.arches.length;
  const artVars=[art.scene&&`--ab-scene:url('${url('scene')}')`,art.segments&&`--ab-segments:url('${url('segments')}')`,art.tokens&&`--ab-tokens:url('${url('tokens')}')`,art.icons&&`--ab-icons:url('${url('icons')}')`].filter(Boolean).join(';');
  work.innerHTML=`<div class="scene-game argbridge-game${Object.entries(art).filter(([,v])=>v).map(([k])=>' art-'+k).join('')}" style="${artVars}">
   <div class="sg-stage ab-stage">
    <div class="sg-bg ab-bg" aria-hidden="true"></div>
    <div class="ab-top"><div class="ab-progress" aria-hidden="true">${cfg.arches.map(()=>'<i></i>').join('')}</div><p class="sg-voice ab-voice" role="status" aria-live="polite"></p></div>
    <div class="ab-bridge-wrap"><div class="ab-bridge">
     ${bridgeSvg()}
     ${cfg.arches.map((a,i)=>`<div class="ab-head" data-head="${i}" style="--i:${i}"><span>${esc(a.head)}</span></div><div class="ab-opening" data-opening="${i}" style="--i:${i}"></div>`).join('')}
     <div class="ab-inscription" hidden><span></span></div>
     <div class="ab-light" aria-hidden="true"></div>
    </div></div>
    <div class="ab-tray" role="group"></div>
   </div></div>`;
  window.Seals?.ensureDefs?.();
  const root=work.querySelector('.scene-game'),stage=root.querySelector('.ab-stage'),voice=root.querySelector('.ab-voice'),tray=root.querySelector('.ab-tray');
  const pips=[...root.querySelectorAll('.ab-progress i')];
  let phase='arches',cur=0,found=0,busy=false;
  const say=(t,k='')=>{voice.textContent=t;voice.className='sg-voice ab-voice '+k;voice.classList.remove('pop');void voice.offsetWidth;voice.classList.add('pop');};
  const arch=i=>root.querySelector(`.ab-arch[data-arch="${i}"]`),opening=i=>root.querySelector(`[data-opening="${i}"]`),head=i=>root.querySelector(`[data-head="${i}"]`);
  const plate=(o,cls,extra='')=>`<button type="button" class="ab-plate ${cls}"${extra}>${icon(o.icon,art)}<span class="ab-plate-text">${esc(o.text)}</span></button>`;

  /* ---------- Phase A: Bögen ---------- */
  function showArch(){
   busy=false;const a=cfg.arches[cur];
   for(let i=0;i<N;i++){arch(i).classList.toggle('active',i===cur);head(i).classList.toggle('active',i===cur);}
   tray.className='ab-tray phase-arches';tray.setAttribute('aria-label','Inschriftplatten für den Bogen „'+a.head+'“');
   tray.innerHTML=`<p class="ab-ask"><span class="ab-step">Bogen ${cur+1} von ${N}</span><strong>${esc(a.head)}</strong></p><div class="ab-plates">${shuffle([{...a.right,ok:true},...a.wrong.map(w=>({...w,ok:false}))]).map(o=>plate(o,'',` data-ok="${o.ok}" aria-label="${esc(a.head+' '+o.text)}"`)).join('')}</div>`;
   tray.querySelectorAll('.ab-plate').forEach(b=>b.onclick=()=>choose(b));
   if(cur===0)say(cfg.start,'ask');
  }
  function choose(b){
   if(busy||b.disabled)return;const a=cfg.arches[cur];const text=b.querySelector('.ab-plate-text').textContent;
   if(b.dataset.ok==='true'){
    busy=true;b.classList.add('rise');tray.querySelectorAll('.ab-plate').forEach(x=>x.disabled=true);
    const i=cur;arch(i).classList.remove('active');arch(i).classList.add('built');head(i).classList.remove('active');head(i).classList.add('built');pips[i].className='done';
    opening(i).innerHTML=`<div class="ab-set" title="${esc(a.head+' '+a.right.text)}">${icon(a.right.icon,art)}<span>${esc(a.short)}</span></div>`;
    opening(i).setAttribute('aria-label',a.head+' '+a.right.text);
    say(a.right.why,'good');
    later(root,1500,()=>{cur++;if(cur<N)showArch();else toSimplify();});
   }else{
    const w=a.wrong.find(x=>x.text===text);b.classList.add('cracked');b.disabled=true;b.insertAdjacentHTML('beforeend','<span class="ab-crack" aria-hidden="true"></span>');
    say(w?.why||'Diese Platte trägt den Bogen nicht.','hint');
   }
  }

  /* ---------- Phase B: zu einfache Aussagen ---------- */
  function toSimplify(){
   phase='simplify';busy=false;root.classList.add('bridge-built');const S=cfg.simplify;const need=S.items.filter(x=>x.simple).length;
   tray.className='ab-tray phase-simplify';tray.setAttribute('aria-label','Irrtums-Plaketten');
   tray.innerHTML=`<p class="ab-ask"><span class="ab-step">Zu einfach?</span><span class="ab-count" aria-live="polite">${'<i></i>'.repeat(need)}</span></p><div class="ab-plaques">${S.items.map((x,k)=>`<button type="button" class="ab-plaque" data-k="${k}" aria-pressed="false"><span class="ab-plaque-text">${esc(x.text)}</span><span class="ab-mark" aria-hidden="true"></span></button>`).join('')}</div>`;
   say(S.q,'ask');
   tray.querySelectorAll('.ab-plaque').forEach(b=>b.onclick=()=>{
    if(b.disabled)return;const x=S.items[+b.dataset.k];b.disabled=true;
    if(x.simple){b.classList.add('simple');b.setAttribute('aria-pressed','true');b.querySelector('.ab-mark').textContent='zu einfach';found++;tray.querySelectorAll('.ab-count i')[found-1]?.classList.add('on');say(S.found+' '+x.why,'good');
     if(found===need){tray.querySelectorAll('.ab-plaque').forEach(p=>p.disabled=true);later(root,2200,toFinal);}}
    else{b.classList.add('sound');b.querySelector('.ab-mark').textContent='trägt';say(x.why,'hint');}
   });
  }

  /* ---------- Phase C: Inschrift ---------- */
  function toFinal(){
   phase='final';busy=false;const F=cfg.final;
   tray.className='ab-tray phase-final';tray.setAttribute('aria-label','Inschriften');
   tray.innerHTML=`<p class="ab-ask"><span class="ab-step">Die Inschrift</span></p><div class="ab-tablets">${shuffle(F.options.map((o,k)=>({o,k}))).map(({o,k})=>`<button type="button" class="ab-tablet" data-k="${k}">${esc(o.text)}</button>`).join('')}</div>`;
   say(F.q,'ask');
   tray.querySelectorAll('.ab-tablet').forEach(b=>b.onclick=()=>{
    if(b.disabled||busy)return;const o=F.options[+b.dataset.k];
    if(o.ok){busy=true;b.classList.add('right');tray.querySelectorAll('.ab-tablet').forEach(x=>x.disabled=true);
     const ins=root.querySelector('.ab-inscription');ins.hidden=false;ins.querySelector('span').textContent=o.text;root.classList.add('inscribed');say(o.why,'good');
     document.dispatchEvent(new CustomEvent('minigame-choice',{detail:{id,text:o.text}}));
     later(root,2600,finish);}
    else{b.classList.add('cracked');b.disabled=true;say(o.why,'hint');}
   });
  }
  function finish(){phase='done';const o=document.createElement('div');o.className='sg-finale';
   o.innerHTML=`<div class="sg-scroll ab-scroll"><h3>${esc(cfg.winTitle)}</h3><ol class="ab-chain">${cfg.arches.map(a=>`<li>${icon(a.right.icon,art)}<span><b>${esc(a.head)}</b> ${esc(a.right.text)}</span></li>`).join('')}</ol><p>${esc(cfg.win)}</p><button type="button" class="primary sg-next">Weiter</button></div>`;
   stage.append(o);o.querySelector('.sg-next').onclick=()=>document.dispatchEvent(new CustomEvent('minigame-win',{detail:id}));o.querySelector('.sg-next').focus?.({preventScroll:true});}

  root.__debug={phase:()=>phase,arch:()=>cur,found:()=>found};
  showArch();return true;
 }
 window.MiniGames.argbridge=argbridge;
 window.ArgBridge={icons:ICONS_ORDER,icon,bridgeSvg};
})();
