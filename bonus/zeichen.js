'use strict';
/* Bonusspiel: Das geheime Zeichen.
   Eine Markt- und Forumsszene mit fest im Bild stehenden Figuren. Die Chronistin (links im Bild)
   erklärt, woran sich Christen erkennen konnten. Zeichen sind in Holz, Stein, Stoff, Ton, eine
   Öllampe und eine Wachstafel eingearbeitet – keine schwebenden Figuren, keine Mittelbox.
   Vier Runden: 1 Einführung · 2 Suche in der Szene · 3 christlich oder nur ähnlich? · 4 Abschlussfrage.
   Keine Texteingabe, falsche Tipps kosten nichts.

   Grafiken: assets/bonus/secret-signs/. Nur Dateien aus ART.available werden geladen (keine 404-Fehler).
   Ohne eigene Szene dient das Forum-Gemälde (Figuren sind dort Teil des Bildes) als Übergangslösung. */
(()=>{
 if(!window.BonusGames)return;
 const ART={dir:'assets/bonus/secret-signs/',files:{scene:'secret-signs-scene.png',characters:'secret-signs-characters.png',symbols:'secret-signs-symbols.png',panel:'secret-signs-panel.png',guide:'secret-signs-npc-guide.png',stall:'secret-signs-stall.png'},available:[]};
 const has=k=>ART.available.includes(k),src=k=>ART.dir+ART.files[k];

 /* Szenen-Layout (Anteile in % des Bildes). Bei einer neuen secret-signs-scene.png hier eigene Stellen eintragen. */
 const LAYOUTS={
  forum:{img:'assets/backgrounds/v3-forum.png',ratio:1536/1024,
   guide:{name:'Chronistin',x:23,y:33},
   slots:[
    {x:44.5,y:77.5,m:'wood',on:'in die Holzkiste geritzt'},{x:45.5,y:66.5,m:'cloth',on:'auf das rote Tuch gestickt'},
    {x:7.2,y:66.5,m:'paint',on:'auf eine Amphore gemalt'},{x:93,y:71,m:'stone',on:'in den Steinblock gemeißelt'},
    {x:38.8,y:36.5,m:'stone',on:'am Sockel des Standbilds'},{x:61.3,y:76,m:'wood',on:'auf der kleinen Truhe'},
    {x:29,y:91,m:'scratch',on:'ins Pflaster geritzt'},{x:36.8,y:61.5,m:'stone',on:'auf einer Treppenstufe'},
    {x:57.4,y:57.4,m:'lamp',on:'auf einer Öllampe'},{x:89.5,y:54.5,m:'stone',on:'an der Mauer'},
    {x:14,y:51.2,m:'wood',on:'am Brett des Marktstands'},{x:34.6,y:67.2,m:'tablet',on:'auf einer Wachstafel'},
    {x:84.8,y:71,m:'wood',on:'auf dem Fass'},{x:52.5,y:87,m:'scratch',on:'ins Pflaster geritzt'}]},
  custom:null
 };
 const L=()=>has('scene')&&LAYOUTS.custom?LAYOUTS.custom:{...LAYOUTS.forum,img:has('scene')?src('scene'):LAYOUTS.forum.img};

 /* Zeichen als Linienzeichnung (Raster -50…50). */
 const SYM={
  Fisch:{d:'M-40 0 Q-4 -30 30 10 M-40 0 Q-4 30 30 -10',christ:true,info:'Der Fisch: Die Anfangsbuchstaben von „Jesus Christus, Gottes Sohn, Retter“ ergeben auf Griechisch ICHTHYS – Fisch.'},
  Anker:{d:'M0 -34 V36 M-18 -20 H18 M-31 8 Q-27 38 0 36 Q27 38 31 8 M-36 15 L-31 6 L-24 13 M36 15 L31 6 L24 13 M-6 -40 A6 6 0 1 0 6 -40 A6 6 0 1 0 -6 -40',christ:true,info:'Der Anker: ein Zeichen der Hoffnung, oft an christlichen Grabstätten.'},
  Taube:{d:'M-38 6 Q-8 -8 12 -4 Q26 -18 38 -10 L28 -2 Q10 20 -16 16 Z M-4 -4 Q0 -34 -24 -32 M-8 20 L-16 34',christ:true,info:'Die Taube: ein Zeichen für Frieden und für den Heiligen Geist.'},
  'Chi-Rho':{d:'M-26 -28 L26 28 M26 -28 L-26 28 M0 -40 V40 M0 -40 H8 A11 11 0 0 1 8 -18 H0',christ:true,info:'Das Christusmonogramm aus Chi (X) und Rho (P) – offen verwendet vor allem ab Konstantin.'},
  Adler:{d:'M0 -10 Q-24 -40 -42 -14 M0 -10 Q24 -40 42 -14 M0 -20 V26 M-12 38 L0 26 L12 38 M-6 -26 A6 6 0 1 0 6 -26 A6 6 0 1 0 -6 -26',christ:false,info:'Der Adler ist das Zeichen der römischen Legionen und des Kaisers – kein christliches Zeichen.'},
  Lorbeer:{d:'M-6 36 Q-38 24 -30 -26 M6 36 Q38 24 30 -26 M-33 14 l-10 -3 M-35 0 l-10 -5 M-33 -13 l-9 -8 M-24 26 l-9 3 M33 14 l10 -3 M35 0 l10 -5 M33 -13 l9 -8 M24 26 l9 3',christ:false,info:'Der Lorbeerkranz steht in Rom für Sieg und Ehre – kein christliches Erkennungszeichen.'},
  Rosette:{d:'M0 -32 A32 32 0 1 1 0 32 A32 32 0 1 1 0 -32 M0 0 Q14 -16 0 -32 Q-14 -16 0 0 Q20 -2 28 -16 Q10 -18 0 0 Q20 2 28 16 Q10 18 0 0 Q14 16 0 32 Q-14 16 0 0 Q-20 2 -28 16 Q-10 18 0 0 Q-20 -2 -28 -16 Q-10 -18 0 0',christ:false,info:'Eine Rosette ist ein beliebtes Schmuckornament – kein christliches Zeichen.'}
 };
 const ORDER=['Fisch','Anker','Taube','Chi-Rho','Adler','Lorbeer','Rosette'];
 const SEARCH=['Fisch','Anker','Taube'];
 const QUESTION={q:'Warum waren solche Zeichen hilfreich?',options:[
  {t:'Sie halfen Christen, sich zu erkennen, ohne immer offen aufzutreten.',ok:true,why:'Genau. In Zeiten von Misstrauen und Verfolgung konnten Christen sich so erkennen, ohne sich offen zu zeigen.'},
  {t:'Sie machten das Christentum sofort zur Staatsreligion.',ok:false,why:'Nein. Ein Zeichen macht keine Staatsreligion. Das geschah erst Ende des 4. Jahrhunderts.'},
  {t:'Sie waren für alle Römer verpflichtend.',ok:false,why:'Nein. Niemand musste diese Zeichen benutzen – sie waren ein freiwilliges Erkennungszeichen.'},
  {t:'Sie ersetzten alle Gottesdienste.',ok:false,why:'Nein. Christen feierten weiter Gottesdienste. Die Zeichen halfen nur beim Erkennen.'}]};

 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

 /* Ein Zeichen in einer Machart. Gegenstände (Lampe, Wachstafel) zeichnen ihren Träger mit. */
 function glyph(name,m,cls=''){
  if(has('symbols')){const i=ORDER.indexOf(name);return `<span class="zs-glyph zs-sheet m-${m} ${cls}" style="background-position:${(i%4)*100/3}% ${Math.floor(i/4)*100}%" aria-hidden="true"></span>`;}
  const d=SYM[name].d;
  const carrier=m==='lamp'?'<path class="zs-lamp" d="M-58 18 Q-60 -22 0 -26 Q46 -24 60 -6 L84 -10 Q88 0 80 6 Q58 30 0 30 Q-40 30 -58 18 Z M-58 4 Q-80 -6 -74 -26 Q-64 -18 -54 -10"/><ellipse class="zs-lamp-top" cx="-4" cy="0" rx="40" ry="20"/><path class="zs-flame" d="M84 -12 Q90 -30 82 -44 Q78 -30 76 -14 Z"/>'
   :m==='tablet'?'<rect class="zs-tab-frame" x="-62" y="-46" width="124" height="92" rx="6"/><rect class="zs-tab-wax" x="-50" y="-35" width="100" height="70" rx="3"/>':'';
  const scale=m==='lamp'?.42:m==='tablet'?.62:1;
  return `<svg class="zs-glyph m-${m} ${cls}" viewBox="${m==='lamp'?'-95 -60 190 120':m==='tablet'?'-70 -55 140 110':'-50 -50 100 100'}" aria-hidden="true" focusable="false">${carrier}<g transform="scale(${scale})${m==='lamp'?' translate(-8 0)':''}"><path class="zs-shade" d="${d}"/><path class="zs-line" d="${d}"/></g></svg>`;
 }
 const plain=name=>`<svg class="zs-plain" viewBox="-50 -50 100 100" aria-hidden="true" focusable="false"><path d="${SYM[name].d}"/></svg>`;

 window.BonusGames.register({
  id:'zeichen',title:'Das geheime Zeichen',kicker:'Bonusspiel · Auf dem Markt',scene:'house',
  spot:[69,39,'Kritzeleien am Pfeiler'],
  intro:{text:'Auf dem Markt sind Zeichen versteckt – in Holz geritzt, auf Stoff gestickt, auf Ton gemalt. Die Chronistin zeigt dir, welche Zeichen Christen nutzten, um sich zu erkennen.',
   controls:['<b>Tippe</b> im Bild auf die Stellen, an denen du ein Zeichen entdeckst.','Die gesuchten Zeichen hängen oben auf der Holztafel.','Falsche Tipps kosten nichts.'],start:'Auf den Markt'},
  setup(ctx){
   const lay=L();
   const root=ctx.layer('zs-root'+Object.keys(ART.files).filter(has).map(k=>' art-'+k).join(''),`
    <div class="zs-scene" style="--zs-ratio:${lay.ratio}">
     <img class="zs-bg" src="${esc(lay.img)}" alt="Marktplatz auf dem Forum. Links steht die Chronistin mit einer Schriftrolle, rechts ein Mann in rotem Mantel, dazwischen Kisten, Tücher und Amphoren." draggable="false">
     ${has('stall')?`<img class="zs-overlay" src="${src('stall')}" alt="" draggable="false">`:''}
     ${has('characters')?`<img class="zs-overlay" src="${src('characters')}" alt="" draggable="false">`:''}
     <div class="zs-marks"></div>
     <div class="zs-ripples" aria-hidden="true"></div>
    </div>
    <aside class="zs-board" aria-label="Holztafel mit den gesuchten Zeichen"><span class="zs-rope" aria-hidden="true"></span><strong class="zs-board-title"></strong><div class="zs-board-slots"></div></aside>
    <div class="zs-bubble" role="status" aria-live="polite" style="--gx:${lay.guide.x}%;--gy:${lay.guide.y}%">${has('guide')?`<img class="zs-guide" src="${src('guide')}" alt="">`:''}<span class="zs-who">${esc(lay.guide.name)}</span><p class="zs-say"></p><div class="zs-go"></div></div>
    <div class="zs-answers" role="group" aria-label="Antworten"></div>`);
   const scene=root.querySelector('.zs-scene'),marks=root.querySelector('.zs-marks'),ripples=root.querySelector('.zs-ripples');
   const boardTitle=root.querySelector('.zs-board-title'),boardSlots=root.querySelector('.zs-board-slots');
   const bubble=root.querySelector('.zs-bubble'),sayEl=root.querySelector('.zs-say'),answers=root.querySelector('.zs-answers'),go=root.querySelector('.zs-go');
   let round=0,phase='idle',placed=[],misses=0,foundCount=0;

   function speak(text,kind=''){sayEl.textContent=text;bubble.className='zs-bubble show'+(kind?' '+kind:'');bubble.classList.remove('pop');void bubble.offsetWidth;bubble.classList.add('pop');}
   function board(title,names,got=[]){boardTitle.textContent=title;boardSlots.innerHTML=names.map(n=>`<span class="zs-slot${got.includes(n)?' got':''}" data-name="${esc(n)}">${plain(n)}<small>${esc(n)}</small></span>`).join('');}
   function counter(title,n,total){boardTitle.textContent=title;boardSlots.innerHTML=Array.from({length:total},(_,i)=>`<span class="zs-seal${i<n?' got':''}" aria-hidden="true"></span>`).join('')+`<span class="zs-count">${n} von ${total}</span>`;}
   /* Zeichen in die Szene setzen: jede Stelle wird ein großzügiger Tippbereich */
   function place(names,visible){const slots=shuffle(lay.slots.map((s,i)=>i));placed=names.map((name,k)=>({name,slot:slots[k],done:false}));
    marks.innerHTML='';
    // Gegenstände (Lampe, Wachstafel) stehen immer in der Szene, auch ohne Zeichen
    lay.slots.forEach((s,i)=>{if((s.m==='lamp'||s.m==='tablet')&&!placed.some(p=>p.slot===i))marks.insertAdjacentHTML('beforeend',`<span class="zs-prop m-${s.m}" style="left:${s.x}%;top:${s.y}%" aria-hidden="true">${glyph('Rosette',s.m,'empty')}</span>`);});
    placed.forEach((p,k)=>{const s=lay.slots[p.slot];const b=document.createElement('button');b.type='button';b.className='zs-mark m-'+s.m+(visible?' shown':'');b.dataset.k=k;b.dataset.name=p.name;b.style.left=s.x+'%';b.style.top=s.y+'%';
     b.setAttribute('aria-label',visible?`Zeichen ${s.on}: ${p.name}`:`Stelle ${s.on}`);b.innerHTML=glyph(p.name,s.m);b.onclick=e=>{e.stopPropagation();tap(k,b);};marks.append(b);});}
   function ripple(x,y){const r=document.createElement('span');r.className='zs-ripple';r.style.left=x+'%';r.style.top=y+'%';ripples.append(r);ctx.after(700,()=>r.remove());}

   /* Runde 1 */
   function r1(){round=1;phase='intro';ctx.setTask('Runde 1 von 4 · Die Zeichen');placed=[];marks.innerHTML='';
    board('Gesucht',SEARCH);
    speak('Einige Christen nutzen Zeichen, um sich zu erkennen. Finde die Zeichen, die ich dir auf meiner Tafel zeige.');
    answers.innerHTML='';go.innerHTML='';const b=document.createElement('button');b.type='button';b.className='primary';b.textContent='Ich suche sie';b.onclick=r2;go.append(b);}
   /* Runde 2 */
   function r2(){round=2;phase='search';misses=0;foundCount=0;answers.innerHTML='';go.innerHTML='';ctx.setTask('Runde 2 von 4 · Suche in der Szene');
    place(SEARCH,false);board('Gesucht',SEARCH);speak('Schau dir Holz, Stein, Stoff und Ton genau an.','quiet');}
   /* Runde 3 */
   function r3(){round=3;phase='judge';foundCount=0;answers.innerHTML='';ctx.setTask('Runde 3 von 4 · Christlich oder nur ähnlich?');
    place(ORDER,true);counter('Christliche Zeichen',0,ORDER.filter(n=>SYM[n].christ).length);
    speak('Hier gibt es viele Zeichen. Nicht alle sind christlich. Tippe nur die christlichen an.');}
   /* Runde 4 */
   function r4(){round=4;phase='question';ctx.setTask('Runde 4 von 4 · Zum Schluss');board('Gefunden',ORDER.filter(n=>SYM[n].christ),ORDER);
    speak(QUESTION.q,'ask');answers.innerHTML='';
    shuffle(QUESTION.options.map((o,i)=>({o,i}))).forEach(({o,i})=>{const b=document.createElement('button');b.type='button';b.className='zs-answer';b.dataset.i=i;b.textContent=o.t;b.onclick=()=>answer(i,b);answers.append(b);});}

   function tap(k,b){
    if(ctx.paused||!ctx.running)return;const p=placed[k];if(p.done)return;
    if(phase==='search'){p.done=true;foundCount++;b.classList.add('found');b.disabled=true;b.setAttribute('aria-label','Gefunden: '+p.name);
     board('Gesucht',SEARCH,placed.filter(x=>x.done).map(x=>x.name));root.querySelector(`.zs-slot[data-name="${window.CSS?.escape?window.CSS.escape(p.name):p.name}"]`)?.classList.add('pop');
     speak(`Gut entdeckt: ${p.name === 'Taube'?'die Taube':p.name==='Anker'?'der Anker':'der Fisch'}, ${lay.slots[p.slot].on}.`,'good');
     if(foundCount===SEARCH.length){phase='between';ctx.after(1600,r3);}}
    else if(phase==='judge'){
     if(SYM[p.name].christ){p.done=true;foundCount++;b.classList.add('found');b.disabled=true;counter('Christliche Zeichen',foundCount,ORDER.filter(n=>SYM[n].christ).length);speak(SYM[p.name].info,'good');
      if(foundCount===ORDER.filter(n=>SYM[n].christ).length){phase='between';ctx.after(2600,r4);}}
     else{b.classList.add('other');b.disabled=true;speak(SYM[p.name].info,'hint');}}
   }
   function answer(i,b){if(phase!=='question')return;const o=QUESTION.options[i];
    if(o.ok){phase='done';b.classList.add('right');answers.querySelectorAll('button').forEach(x=>x.disabled=true);speak(o.why,'good');ctx.after(1800,finish);}
    else{b.classList.add('tried');b.disabled=true;speak(o.why,'hint');}}
   function finish(){ctx.win({title:'Die Zeichen sind entschlüsselt.',lines:['Fisch, Anker und Taube in der Szene gefunden','Christliche Zeichen von ähnlichen unterschieden'],
    html:'<div class="bonus-history"><h4>Einordnung</h4><p>Fisch, Anker und Taube sind aus frühchristlichen Grabstätten überliefert. Das Christusmonogramm wurde vor allem ab Konstantin offen verwendet. Wie genau solche Zeichen im Alltag benutzt wurden, lässt sich nicht immer sicher rekonstruieren.</p></div>',backLabel:'Zurück ins Wohnviertel'});}

   // Tipp daneben: dezente Staubwolke, nach mehreren Fehlversuchen ein Hinweis
   ctx.on(scene,'click',e=>{if(phase!=='search'||ctx.paused||!ctx.running)return;const r=scene.getBoundingClientRect();if(!r.width)return;
    ripple((e.clientX-r.left)/r.width*100,(e.clientY-r.top)/r.height*100);misses++;
    if(misses%3===0){const open=[...marks.querySelectorAll('.zs-mark:not(.found)')];const hint=open[0];if(hint){hint.classList.remove('shimmer');void hint.offsetWidth;hint.classList.add('shimmer');}speak('Schau genauer hin – ein Zeichen schimmert kurz auf.','quiet');}});

   ctx.stage.__debug={phase:()=>phase,round:()=>round,placed:()=>placed,layout:lay,art:ART};
   return {start(){r1();}};
  }
 });
 window.BonusGames.games.zeichen.art=ART;
})();
