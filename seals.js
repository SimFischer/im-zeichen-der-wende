'use strict';
/* Siegel – gemeinsames visuelles System.
   Ein Modul für alle Darstellungen der sechs Erkenntnis-Siegel:
   Medaillon (Belohnung, Sammlung, Siegelrad), leere Fassung, Sammlungsleiste und das Siegelrad-Relief.
   Nur Darstellung: Der Spielstand (state.seals, state.flags.sealSockets) wird hier nicht verändert.

   Bilddateien (optional): Liegen fertige Illustrationen vor, werden sie unter
   assets/ui/seals/seal-<slug>.png abgelegt und in GAME.sealAssets.available eingetragen
   (z. B. ['konflikt','quelle','wheel-frame']). Solange die Liste leer ist, zeichnet das Modul
   geprägte SVG-Medaillons. So entstehen keine 404-Fehler für fehlende Dateien. */
window.Seals=(()=>{
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const G=()=>window.GAME||{};
 const NAMES=()=>G().seals||['Konflikt','Quelle','Anzeige','Staat','312','Wende'];
 const slug=name=>String(name).toLowerCase().replace(/[^a-z0-9]+/g,'-');
 const DIR='assets/ui/seals/';
 const hasAsset=key=>(G().sealAssets?.available||[]).includes(key);
 const assetPath=key=>DIR+'seal-'+key+(G().sealAssets?.ext||'.png');

 /* Emailfarbe des Mittelfeldes je Siegel: [hell, dunkel]. Rand und Relief sind bei allen gleich. */
 const FIELD={Konflikt:['#9a5a3c','#4a2416'],Quelle:['#a0783c','#4e3514'],Anzeige:['#5f8a72','#223f33'],Staat:['#7a5a8c','#34223f'],'312':['#a0443c','#4a1a18'],Wende:['#4f7196','#1c3350']};

 /* Motive im 100×100-Raster. raise = erhabene Flächen, engrave = eingravierte Linien. */
 const MOTIF={
  Konflikt:{ // zwei gekreuzte Schwerter
   raise:[0,1].map(k=>`<g transform="rotate(${k?-42:42} 50 50)"><path d="M50 22 L54.2 29 L54.2 57 L45.8 57 L45.8 29 Z"/><rect x="38.5" y="57" width="23" height="5" rx="2.4"/><rect x="47.4" y="62" width="5.2" height="9.5" rx="1.4"/><circle cx="50" cy="74.5" r="3.6"/></g>`).join(''),
   engrave:[0,1].map(k=>`<path transform="rotate(${k?-42:42} 50 50)" d="M50 30 V54"/>`).join('')},
  Quelle:{ // Schriftrolle
   raise:'<path d="M33 35 H67 V65 H33 Z"/><rect x="27" y="29" width="46" height="9" rx="4.5"/><rect x="27" y="62" width="46" height="9" rx="4.5"/><circle cx="26" cy="33.5" r="3.4"/><circle cx="74" cy="33.5" r="3.4"/><circle cx="26" cy="66.5" r="3.4"/><circle cx="74" cy="66.5" r="3.4"/>',
   engrave:'<path d="M38 43.5 H62 M38 49.5 H59 M38 55.5 H62"/>'},
  Anzeige:{ // Wachstafel mit Griffel
   raise:'<path fill-rule="evenodd" d="M28 31 H62 V71 H28 Z M33 36 V66 H57 V36 Z"/><path d="M66.5 27.5 L71 29.5 L60 67 L57.5 71.5 L56.8 66 Z"/><circle cx="45" cy="31" r="2.6"/>',
   engrave:'<path d="M37 43 l3 -3 l3 3 l3 -3 l3 3 l3 -3 M37 51 H53 M37 58 l3 -3 l3 3 l3 -3 l3 3"/>'},
  Staat:{ // Säule mit Lorbeer
   raise:'<path d="M35 30 H65 L62 36 H38 Z"/><circle cx="36.5" cy="33" r="3.2"/><circle cx="63.5" cy="33" r="3.2"/><rect x="41" y="36" width="18" height="28"/><rect x="37" y="64" width="26" height="4.5" rx="1"/><rect x="33" y="68.5" width="34" height="5" rx="1"/>'+
    [[26,62,-60],[25,53,-78],[26.5,44,-98],[74,62,60],[75,53,78],[73.5,44,98]].map(([x,y,r])=>`<ellipse cx="${x}" cy="${y}" rx="2.3" ry="5" transform="rotate(${r} ${x} ${y})"/>`).join(''),
   engrave:'<path d="M45.5 39 V61 M50 39 V61 M54.5 39 V61"/><path d="M30 70 Q23 56 29 40 M70 70 Q77 56 71 40" stroke-width="1.4"/>'},
  '312':{ // ovaler Schild mit Christusmonogramm
   raise:'<ellipse cx="50" cy="51" rx="19" ry="24"/>',
   engrave:'<ellipse cx="50" cy="51" rx="15" ry="20"/><path d="M42 41 L58 62 M58 41 L42 62 M50 34 V68 M50 34 H55 A5.2 5.2 0 0 1 55 44.4 H50"/>'},
  Wende:{ // Brücke mit Wendebogen
   raise:'<path fill-rule="evenodd" d="M24 49 H76 V71 H24 Z M29 71 V63 A5.5 5.5 0 0 1 40 63 V71 Z M44.5 71 V61 A5.5 5.5 0 0 1 55.5 61 V71 Z M60 71 V63 A5.5 5.5 0 0 1 71 63 V71 Z"/><rect x="22" y="45" width="56" height="5" rx="1.5"/><path d="M63.5 29 L71 34.5 L62 37.5 Z"/>',
   engrave:'<path d="M31 39 A20 12 0 0 1 66 33.5"/><path d="M24 57 H76" stroke-width="1.2"/>'}
 };

 /* Einmalige, gemeinsam genutzte SVG-Definitionen (Verläufe, Motive, Rand). */
 let defsReady=false,uid=0;
 function rim(){ // leicht unregelmäßiger, handwerklicher Rand
  let d='';const n=56;for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,r=47.6+Math.sin(i*2.7)*.55+Math.sin(i*1.3+1)*.45;d+=(i?'L':'M')+(50+r*Math.cos(a)).toFixed(2)+' '+(50+r*Math.sin(a)).toFixed(2);}return d+'Z';
 }
 function beads(r,count,size){let s='';for(let i=0;i<count;i++){const a=i/count*Math.PI*2;s+=`<circle cx="${(50+r*Math.cos(a)).toFixed(2)}" cy="${(50+r*Math.sin(a)).toFixed(2)}" r="${size}"/>`;}return s;}
 function ensureDefs(){
  if(defsReady&&document.getElementById('seal-defs'))return;defsReady=true;
  const wrap=document.createElement('div');wrap.setAttribute('aria-hidden','true');wrap.className='seal-defs-host';
  wrap.innerHTML=`<svg id="seal-defs" width="0" height="0" focusable="false"><defs>
   <linearGradient id="sg-rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6dc96"/><stop offset=".38" stop-color="#c8924a"/><stop offset=".72" stop-color="#8a5a24"/><stop offset="1" stop-color="#5a3812"/></linearGradient>
   <linearGradient id="sg-rim-in" x1="1" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f1cf82"/><stop offset=".5" stop-color="#a8733a"/><stop offset="1" stop-color="#5e3b14"/></linearGradient>
   <linearGradient id="sg-relief" x1="0" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="#fff2c0"/><stop offset=".45" stop-color="#e2b25a"/><stop offset="1" stop-color="#94621f"/></linearGradient>
   <radialGradient id="sg-sheen" cx=".32" cy=".26" r=".55"><stop offset="0" stop-color="#fff8dc" stop-opacity=".55"/><stop offset="1" stop-color="#fff8dc" stop-opacity="0"/></radialGradient>
   <radialGradient id="sg-socket" cx=".5" cy=".42" r=".62"><stop offset="0" stop-color="#3a2c1a"/><stop offset=".78" stop-color="#241a0f"/><stop offset="1" stop-color="#120c06"/></radialGradient>
   <radialGradient id="sg-stone" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#dcc497"/><stop offset=".7" stop-color="#a88c5c"/><stop offset="1" stop-color="#6a5232"/></radialGradient>
   <radialGradient id="sg-bronze-disc" cx=".42" cy=".36" r=".72"><stop offset="0" stop-color="#b7843f"/><stop offset=".6" stop-color="#7b5226"/><stop offset="1" stop-color="#4a2f12"/></radialGradient>
   ${NAMES().map(n=>{const [a,b]=FIELD[n]||['#8a6a3a','#3a2a12'];return `<radialGradient id="sg-field-${slug(n)}" cx=".4" cy=".34" r=".72"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;}).join('')}
   <path id="sg-rim-path" d="${rim()}"/>
   <g id="sg-beads">${beads(42.3,32,1.25)}</g>
   ${Object.entries(MOTIF).map(([n,m])=>`<g id="sm-raise-${slug(n)}">${m.raise}</g><g id="sm-eng-${slug(n)}" fill="none" stroke-linecap="round" stroke-linejoin="round">${m.engrave}</g>`).join('')}
  </defs></svg>`;
  (document.body||document.documentElement).append(wrap);
 }

 /* Geprägtes Motiv (Schatten, Lichtkante, Relief, Gravur). */
 function motif(name,scale=.86){const s=slug(name);return `<g transform="translate(50 50) scale(${scale}) translate(-50 -50)">
  <use href="#sm-raise-${s}" fill="#1e1206" opacity=".55" transform="translate(1.3 1.7)"/>
  <use href="#sm-raise-${s}" fill="#fff4cc" opacity=".75" transform="translate(-.8 -.9)"/>
  <use href="#sm-raise-${s}" fill="url(#sg-relief)"/>
  <use href="#sm-eng-${s}" stroke="#fff1c2" stroke-width="2.4" opacity=".45" transform="translate(.6 .8)"/>
  <use href="#sm-eng-${s}" stroke="#3e240a" stroke-width="2.2"/></g>`;}

 /* Medaillon als SVG oder – falls vorhanden – als Bild. */
 function medal(name,opts={}){
  ensureDefs();const s=slug(name),cls='seal-medallion'+(opts.cls?' '+opts.cls:'');
  const label=opts.decorative?'aria-hidden="true"':`role="img" aria-label="Siegel ${esc(name)}"`;
  if(hasAsset(s))return `<span class="${cls}" data-seal="${esc(name)}"><img src="${assetPath(s)}" alt="" ${label}></span>`;
  return `<span class="${cls}" data-seal="${esc(name)}"><svg viewBox="0 0 100 100" ${label} focusable="false">
   <ellipse cx="51" cy="53" rx="47" ry="46" fill="#2a1804" opacity=".35"/>
   <use href="#sg-rim-path" fill="url(#sg-rim)" stroke="#4a2e0e" stroke-width="1"/>
   <circle cx="50" cy="50" r="44.6" fill="none" stroke="#fff0c0" stroke-width=".8" opacity=".5"/>
   <use href="#sg-beads" fill="#f3d58c" stroke="#6b4414" stroke-width=".5"/>
   <circle cx="50" cy="50" r="39" fill="url(#sg-rim-in)"/>
   <circle cx="50" cy="50" r="36.4" fill="url(#sg-field-${s})" stroke="#2e1c08" stroke-width="1.4"/>
   <circle cx="50" cy="50" r="35" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="2.5" transform="translate(.8 1)"/>
   ${motif(name)}
   <circle cx="50" cy="50" r="47" fill="url(#sg-sheen)"/>
  </svg></span>`;
 }

 /* Leere Fassung: dunkle Vertiefung mit schwach eingeritztem Motiv. */
 function socket(name,opts={}){
  ensureDefs();const s=slug(name);
  if(hasAsset(s))return `<span class="seal-setting has-art${opts.cls?' '+opts.cls:''}" data-seal="${esc(name)}" aria-hidden="true"><img src="${assetPath(s)}" alt=""></span>`;
  return `<span class="seal-setting${opts.cls?' '+opts.cls:''}" data-seal="${esc(name)}" aria-hidden="true"><svg viewBox="0 0 100 100" focusable="false">
   <circle cx="50" cy="50" r="48" fill="url(#sg-rim-in)" stroke="#3c250b" stroke-width="1.2"/>
   ${[45,135,225,315].map(a=>`<path d="M50 1.5 L55 9 L45 9 Z" fill="#e7bf6c" stroke="#5a3812" stroke-width=".6" transform="rotate(${a} 50 50)"/>`).join('')}
   <circle cx="50" cy="50" r="41" fill="url(#sg-socket)"/>
   <circle cx="50" cy="50" r="41" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="5" transform="translate(-1 -1.4)"/>
   <circle cx="50" cy="50" r="41.5" fill="none" stroke="#f3d58c" stroke-opacity=".35" stroke-width="1"/>
   <g transform="translate(50 50) scale(.7) translate(-50 -50)" opacity=".55"><use href="#sm-raise-${s}" fill="none" stroke="#c9a060" stroke-width="1.3"/><use href="#sm-eng-${s}" stroke="#c9a060" stroke-width="1.1"/></g>
  </svg></span>`;
 }

 /* Siegel mit Zustand: locked (noch nicht erhalten) · owned · selected · placed (eingesetzt). */
 const STATE_TEXT={locked:'fehlt noch',owned:'erhalten',selected:'ausgewählt',placed:'eingesetzt'};
 function token(name,state='owned',opts={}){
  const inner=state==='locked'?socket(name):medal(name,{decorative:true});
  const tag=opts.tag||'div';
  return `<${tag}${tag==='button'?' type="button"':''} class="seal-token is-${state}${opts.cls?' '+opts.cls:''}" data-seal="${esc(name)}" data-state="${state}" aria-label="Siegel ${esc(name)} – ${STATE_TEXT[state]}"${opts.attrs||''}>${inner}<span class="seal-name">${esc(name)}</span>${opts.status!==false?`<span class="seal-state">${STATE_TEXT[state]}</span>`:''}</${tag}>`;
 }

 /* Sammlungsleiste (Belohnung, Notizbuch, Tor). */
 function collection(owned=[],opts={}){
  const placed=opts.placed||[];
  return `<div class="seal-collection${opts.compact?' compact':''}" role="list" aria-label="Siegelsammlung: ${owned.length} von ${NAMES().length}">${NAMES().map(n=>{const st=placed.includes(n)?'placed':owned.includes(n)?'owned':'locked';return `<div role="listitem" class="seal-slot${n===opts.highlight?' just-added':''}">${token(n,st,{status:!opts.compact})}</div>`;}).join('')}</div>`;
 }

 /* Belohnungsinszenierung nach einem Rätsel: Banner, großes Medaillon, Sammlung. */
 function reward(name,{owned=[],fresh=true}={}){
  const info=G().sealInfo?.[name]||{};
  return `<section class="seal-reward${fresh?' fresh':''}" aria-label="${fresh?'Neues Siegel erhalten':'Siegel in deiner Sammlung'}: ${esc(name)}">
   <div class="seal-reward-stage"><span class="seal-reward-light" aria-hidden="true"></span>${medal(name,{cls:'big'})}<span class="seal-reward-glint" aria-hidden="true"></span></div>
   <div class="seal-banner"><span class="seal-banner-kicker">${fresh?'Neues Siegel erhalten':'Siegel bereits in deiner Sammlung'}</span><strong class="seal-banner-name">${esc(name)}</strong>${info.meaning?`<span class="seal-banner-meaning">${esc(info.meaning)}</span>`:''}</div>
   <div class="seal-reward-collection">${collection(owned,{highlight:fresh?name:null,compact:true})}<span class="seal-count">${owned.length} von ${NAMES().length} Siegeln in deiner Sammlung</span></div>
  </section>`;
 }

 /* Das Siegelrad: steinerne Einfassung, Lorbeerkranz, Bronzescheibe mit Speichen, Mittelrosette. */
 function wheelSvg(){
  ensureDefs();
  if(hasAsset('wheel-frame'))return `<img class="seal-wheel-art" src="${assetPath('wheel-frame')}" alt="">`;
  const C=200;let leaves='';
  for(let i=0;i<60;i++){const a=i*6,side=i%2?1:-1;leaves+=`<ellipse cx="${C}" cy="${C-181}" rx="3.4" ry="8.5" transform="rotate(${a} ${C} ${C}) rotate(${side*38} ${C} ${C-181})"/>`;}
  let ribs='';for(let i=0;i<24;i++)ribs+=`<path d="M${C} 6 V20" transform="rotate(${i*15} ${C} ${C})"/>`;
  let bolts='';for(let i=0;i<12;i++){const a=(i*30+15)*Math.PI/180;bolts+=`<circle cx="${(C+157*Math.cos(a)).toFixed(1)}" cy="${(C+157*Math.sin(a)).toFixed(1)}" r="4.2"/>`;}
  let spokes='';for(let i=0;i<6;i++){const sp=`M${C-4.5} 54 Q${C} 50 ${C+4.5} 54 L${C+3} 146 Q${C} 149 ${C-3} 146 Z`;spokes+=`<g transform="rotate(${i*60+30} ${C} ${C})"><path d="${sp}" fill="#000" opacity=".35" transform="translate(2 3)"/><path d="${sp}" fill="url(#sg-rim-in)" stroke="#3c250b" stroke-width=".8"/><path d="M${C-1.5} 58 V142" stroke="#fff0c0" stroke-opacity=".45" stroke-width="1"/><circle cx="${C}" cy="100" r="5.5" fill="url(#sg-relief)" stroke="#5a3812"/></g>`;}
  let petals='';for(let i=0;i<8;i++)petals+=`<ellipse cx="${C}" cy="${C-24}" rx="8" ry="17" transform="rotate(${i*45} ${C} ${C})"/>`;
  return `<svg class="seal-wheel-art" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
   <circle cx="${C+3}" cy="${C+6}" r="197" fill="#000" opacity=".35"/>
   <circle cx="${C}" cy="${C}" r="196" fill="url(#sg-stone)" stroke="#5e4a2c" stroke-width="2"/>
   <g stroke="#6e5a3a" stroke-width="2" opacity=".55">${ribs}</g>
   <circle cx="${C}" cy="${C}" r="186" fill="none" stroke="#fff4d8" stroke-opacity=".4" stroke-width="1.5"/>
   <g class="seal-wreath" fill="url(#sg-relief)" stroke="#6b4414" stroke-width=".7">${leaves}</g>
   <circle cx="${C}" cy="${C}" r="168" fill="url(#sg-rim)" stroke="#3c250b" stroke-width="2"/>
   <g class="seal-ring">
    <circle cx="${C}" cy="${C}" r="150" fill="url(#sg-bronze-disc)" stroke="#2e1c08" stroke-width="2"/>
    <circle cx="${C}" cy="${C}" r="150" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="8" transform="translate(-2 -3)"/>
    <g fill="#f3d58c" stroke="#5a3812" stroke-width="1">${bolts}</g>
    ${spokes}
    <circle cx="${C}" cy="${C}" r="52" fill="url(#sg-rim-in)" stroke="#3c250b" stroke-width="2"/>
    <g class="seal-hub" fill="url(#sg-relief)" stroke="#6b4414" stroke-width="1">${petals}</g>
    <circle cx="${C}" cy="${C}" r="13" fill="url(#sg-rim)" stroke="#3c250b" stroke-width="1.5"/>
   </g>
   <circle cx="${C}" cy="${C}" r="196" fill="url(#sg-sheen)" opacity=".6"/>
  </svg>`;
 }
 /* Position einer Fassung auf dem Rad in Prozent (erste oben, im Uhrzeigersinn). */
 function socketPos(i,n=6){const a=(i*360/n-90)*Math.PI/180,r=25.3;return {left:50+r*Math.cos(a),top:50+r*Math.sin(a)};}

 return {slug,medal,socket,token,collection,reward,wheelSvg,socketPos,ensureDefs,assetPath,dir:DIR,motifs:Object.keys(MOTIF),STATE_TEXT};
})();
