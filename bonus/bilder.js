'use strict';
/* Bonusspiel 8: Zerbrochene Bilder – Schiebepuzzle nach dem Rätsel „Das Zeichen auf dem Schild“.
   Bilder aus der Reise; weitere Bilder erscheinen erst, wenn der Ort im Hauptspiel gelöst ist (keine Vorwegnahme).
   „Tauschen“ ist die leichte, „Schieben“ die knifflige Variante; 3×3 oder 4×4. Kein Zeitdruck. */
(()=>{
 if(!window.BonusGames)return;
 const DIR='assets/bonus/bilder-',KEY='im-zeichen-der-wende:bonus-bilder';
 const PICS=[
  {id:'schild',name:'Das Zeichen auf dem Schild',era:'312',need:'vision',info:'Christliche Autoren berichten Jahre später: Vor der Schlacht an der Milvischen Brücke ließ Konstantin ein Christuszeichen auf die Schilde malen.'},
  {id:'stadt',name:'Die geöffnete Stadt',era:'ab 313',need:'change',info:'Nach 313 dürfen Christen ihren Glauben offen leben. Beschlagnahmter Besitz wird zurückgegeben, neue Kirchen entstehen.'},
  {id:'mosaik',name:'Konstantin im Mosaik',era:'Glaube und Herrschaft',need:'motives',info:'Warum förderte Konstantin die Christen? Persönlicher Glaube und politische Ziele lassen sich bei ihm kaum trennen.'},
  {id:'konzil',name:'Das Konzil von Nicäa',era:'325',need:'council',info:'325 lässt Konstantin die Bischöfe in Nicäa zusammenkommen. Ein Streit in der Kirche soll die Einheit des Reiches nicht gefährden.'}];
 const done=()=>{try{const v=JSON.parse(localStorage.getItem(KEY));return Array.isArray(v)?v.filter(x=>typeof x==='string'):[];}catch(e){return [];}};
 const markDone=id=>{try{const d=done();if(!d.includes(id)){d.push(id);localStorage.setItem(KEY,JSON.stringify(d));}}catch(e){}};

 window.BonusGames.register({
  id:'bilder',title:'Zerbrochene Bilder',kicker:'Bonusspiel · Erinnerungen in Stücken',scene:'camp',
  intro:{text:'Bilder aus deiner Reise sind in Stücke zerfallen. Setze sie wieder zusammen – so lange du willst, ohne Zeitdruck. Mit jedem gelösten Ort kommen neue Bilder dazu.',
   controls:['Oben ein <b>Bild</b> wählen.','<b>Tauschen</b> (leicht): zwei Teile nacheinander antippen – sie wechseln den Platz.','<b>Schieben</b> (knifflig): ein Teil neben der Lücke antippen – es rutscht hinein.','<b>Vorlage</b> zeigt das ganze Bild, solange du willst.'],
   start:'Puzzle beginnen'},
  setup(ctx){
   const esc=ctx.esc,solved=()=>ctx.solved||[];
   const open=p=>solved().includes(p.need);
   const ui=ctx.layer('bilder-game',`
    <div class="bilder-pics" role="group" aria-label="Bild wählen"></div>
    <div class="bilder-main">
     <div class="bilder-side">
      <div class="bilder-opt" role="group" aria-label="Spielart"><button type="button" data-mode="swap" aria-pressed="true">Tauschen · leicht</button><button type="button" data-mode="slide" aria-pressed="false">Schieben · knifflig</button></div>
      <div class="bilder-opt" role="group" aria-label="Größe"><button type="button" data-n="3" aria-pressed="true">3 × 3</button><button type="button" data-n="4" aria-pressed="false">4 × 4</button></div>
      <button type="button" class="bilder-peek" aria-pressed="false">Vorlage zeigen</button>
      <p class="bilder-moves">Züge: <b>0</b></p>
     </div>
     <div class="bilder-frame"><div class="bilder-board"></div><img class="bilder-ref" alt="" hidden draggable="false"></div>
    </div>
    <div class="bilder-done" hidden></div>`);
   const picsEl=ui.querySelector('.bilder-pics'),board=ui.querySelector('.bilder-board'),ref=ui.querySelector('.bilder-ref'),movesEl=ui.querySelector('.bilder-moves b'),doneEl=ui.querySelector('.bilder-done'),peekBtn=ui.querySelector('.bilder-peek');
   let pic=PICS[0],N=3,mode='swap',tiles=[],sel=null,moves=0,finished=false;
   const src=p=>DIR+p.id+'.webp';
   const neighbors=i=>{const r=Math.floor(i/N),c=i%N,o=[];if(r)o.push(i-N);if(r<N-1)o.push(i+N);if(c)o.push(i-1);if(c<N-1)o.push(i+1);return o;};
   function renderPics(){const d=done();picsEl.innerHTML=PICS.map(p=>open(p)
    ?`<button type="button" class="bilder-pic${p===pic?' on':''}" data-id="${p.id}" aria-pressed="${p===pic}"><img src="${src(p)}" alt="" draggable="false"><span>${esc(p.name)}</span>${d.includes(p.id)?'<i aria-label="schon gelöst">✓</i>':''}</button>`
    :`<button type="button" class="bilder-pic locked" disabled><span class="bilder-lock" aria-hidden="true">?</span><span>Noch verborgen</span></button>`).join('');
    picsEl.querySelectorAll('.bilder-pic[data-id]').forEach(b=>b.onclick=()=>{pic=PICS.find(p=>p.id===b.dataset.id);newGame();});}
   function shuffle(){tiles=[...Array(N*N).keys()];
    if(mode==='swap'){for(let i=tiles.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[tiles[i],tiles[j]]=[tiles[j],tiles[i]];}}
    else{let blank=N*N-1,prev=-1;for(let k=0;k<(N===3?80:220);k++){const nb=neighbors(blank).filter(x=>x!==prev);const nx=nb[Math.floor(Math.random()*nb.length)];[tiles[blank],tiles[nx]]=[tiles[nx],tiles[blank]];prev=blank;blank=nx;}}
    if(tiles.every((t,i)=>t===i))shuffle();}
   function newGame(){finished=false;sel=null;moves=0;movesEl.textContent='0';doneEl.hidden=true;ui.classList.remove('whole');ref.src=src(pic);ref.alt='Vorlage: '+pic.name;shuffle();renderPics();draw();ctx.setTask(pic.name+' · '+pic.era);}
   function draw(){board.style.setProperty('--n',N);board.innerHTML='';const step=100/(N-1);
    tiles.forEach((t,i)=>{const b=document.createElement('button');b.type='button';const blank=mode==='slide'&&t===N*N-1&&!finished;
     b.className='bilder-tile'+(blank?' blank':'')+(sel===i?' sel':'');
     if(!blank){b.style.backgroundImage=`url("${src(pic)}")`;b.style.backgroundSize=`${N*100}% ${N*100}%`;b.style.backgroundPosition=`${(t%N)*step}% ${Math.floor(t/N)*step}%`;}
     b.setAttribute('aria-label',blank?'Lücke':`Teil ${t+1}, Platz ${i+1}`+(sel===i?', ausgewählt':''));
     if(blank)b.tabIndex=-1;b.onclick=()=>tap(i);board.append(b);});}
   function tap(i){if(finished||!ctx.running||ctx.paused)return;
    if(mode==='swap'){if(sel===null){sel=i;draw();board.children[i]?.focus({preventScroll:true});return;}if(sel!==i){[tiles[sel],tiles[i]]=[tiles[i],tiles[sel]];moves++;}sel=null;}
    else{const blank=tiles.indexOf(N*N-1);if(!neighbors(blank).includes(i)){ctx.say('Nur Teile direkt neben der Lücke lassen sich schieben.',1600);return;}[tiles[blank],tiles[i]]=[tiles[i],tiles[blank]];moves++;}
    movesEl.textContent=String(moves);draw();
    if(tiles.every((t,k)=>t===k))complete();}
   function complete(){finished=true;markDone(pic.id);ui.classList.add('whole');draw();renderPics();
    const avail=PICS.filter(open),d=done(),next=avail.find(p=>!d.includes(p.id));
    doneEl.innerHTML=`<div class="bilder-done-card"><p class="bilder-kicker">${esc(pic.era)}</p><h3>${esc(pic.name)}</h3><p>${esc(pic.info)}</p><p class="bilder-count">Geschafft in ${moves} Zügen.</p><div class="bilder-actions"></div></div>`;
    const a=doneEl.querySelector('.bilder-actions');
    if(next)ctx.btn('Nächstes Bild',()=>{pic=next;newGame();},'primary',a);
    ctx.btn('Noch einmal mischen',()=>newGame(),next?'':'primary',a);
    doneEl.hidden=false;
    if(!next){const hidden=PICS.length-avail.length;ctx.after(ctx.reduced?300:1400,()=>ctx.win({title:hidden?'Alle bisherigen Bilder sind wieder ganz':'Alle Bilder sind wieder ganz',lines:[`${avail.length} von ${PICS.length} Bildern zusammengesetzt.`,hidden?'Weitere Bilder erscheinen, wenn du im Spiel neue Orte löst.':'Du hast alle Bilder deiner Reise gefunden.']}));}
    a.querySelector('button')?.focus({preventScroll:true});}
   ui.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;ui.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));newGame();});
   ui.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{N=+b.dataset.n;ui.querySelectorAll('[data-n]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));newGame();});
   peekBtn.onclick=()=>{ref.hidden=!ref.hidden;peekBtn.setAttribute('aria-pressed',String(!ref.hidden));peekBtn.textContent=ref.hidden?'Vorlage zeigen':'Vorlage verbergen';};
   newGame();
   return {start(){ctx.setTask(pic.name+' · '+pic.era);},debug:{solve(){tiles=[...Array(N*N).keys()];if(mode==='swap'){[tiles[0],tiles[1]]=[tiles[1],tiles[0]];sel=0;tap(1);}},state:()=>({pic:pic.id,N,mode,tiles:[...tiles]})}};
  }
 });
})();
