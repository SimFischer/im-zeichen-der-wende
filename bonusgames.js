'use strict';
/* Bonusspiele – gemeinsames System.
   Optionale Spiele, die über unscheinbare Stellen in den Szenen entdeckt werden.
   Sie verändern den Hauptspielstand NICHT: Entdeckt/geschafft wird unter einem eigenen
   localStorage-Schlüssel gespeichert. Keine Punkte, keine Siegel, keine Pflicht.

   Ein Spiel registriert sich mit BonusGames.register({...}) (siehe bonus/*.js).
   setup(ctx) baut das Spiel in ctx.stage auf. Alle Timer, Listener und Animation-Frames
   laufen über ctx und werden beim Schließen des Fensters automatisch beendet. */
window.BonusGames=(()=>{
 const KEY='im-zeichen-der-wende:bonus-v1';
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const ORDER=['zeichen','rombrennt','amphoren','katakomben','schildwall','tiber','wagen','circus'];
 const games={};
 let session=null;

 /* ---------- Fortschritt (nur entdeckt / geschafft) ---------- */
 function load(){try{const v=JSON.parse(localStorage.getItem(KEY));if(v&&Array.isArray(v.found)&&Array.isArray(v.won))return {found:v.found.filter(x=>typeof x==='string'),won:v.won.filter(x=>typeof x==='string')};}catch(e){}return {found:[],won:[]};}
 function store(p){try{localStorage.setItem(KEY,JSON.stringify(p));}catch(e){}}
 function mark(id,key){const p=load();if(!p[key].includes(id)){p[key].push(id);store(p);}}

 function register(def){games[def.id]=def;}

 /* ---------- Unscheinbare Fundstellen in den Szenen ---------- */
 function decorate(scene,state,layer){
  if(!layer)return;const p=load();
  Object.values(games).forEach(g=>{
   if(g.scene!==scene.id)return;
   if(g.when&&!g.when(state))return;
   const [x,y,label]=g.spot;const found=p.found.includes(g.id);
   const b=document.createElement('button');b.type='button';b.className='bonus-spot'+(found?' found':'');
   b.style.left=x+'%';b.style.top=y+'%';b.dataset.bonus=g.id;
   b.setAttribute('aria-label',label+(found?' – Bonusspiel: '+g.title:''));
   b.innerHTML=`<span class="bonus-pin" aria-hidden="true">${found?'✦':'·'}</span><span class="bonus-label">${esc(label)}${found?'<small>Bonusspiel</small>':''}</span>`;
   // Klick nicht an die Szene weiterreichen (z. B. Dunkel-Logik im Archiv).
   b.addEventListener('click',e=>{e.stopPropagation();discover(g.id);});
   layer.append(b);
  });
 }
 function discover(id){const first=!load().found.includes(id);mark(id,'found');start(id,first);}

 /* ---------- Notizbuch: Entdeckte Spiele ---------- */
 function journalHtml(){
  const ids=ORDER.filter(id=>games[id]);if(!ids.length)return '';const p=load();
  return `<h3 class="journal-section bonus-journal-head">Entdeckte Spiele</h3><p class="muted bonus-journal-note">Die Stadt enthält mehr, als für deinen Weg nötig ist. Entdeckte Spiele kannst du hier erneut starten.</p><ul class="bonus-list">${ids.map(id=>p.found.includes(id)?`<li><button type="button" class="bonus-replay" data-bonus-start="${id}"><span class="bonus-check" aria-hidden="true">✓</span>${esc(games[id].title)}${p.won.includes(id)?'<small>geschafft</small>':''}</button></li>`:'<li class="bonus-unknown" aria-label="Noch nicht entdeckt">? ? ?</li>').join('')}</ul>`;
 }
 function bindJournal(root){root.querySelectorAll('[data-bonus-start]').forEach(b=>b.onclick=()=>start(b.dataset.bonusStart,false));}

 /* ---------- Spielfenster ---------- */
 function stop(){
  if(!session)return;const s=session;session=null;
  s.alive=false;cancelAnimationFrame(s.raf);s.timers.forEach(clearTimeout);s.intervals.forEach(clearInterval);
  s.listeners.forEach(([t,type,fn,o])=>t.removeEventListener(type,fn,o));s.observers.forEach(o=>o.disconnect());
  try{s.game?.destroy?.();}catch(e){}
  document.querySelector('#modal')?.classList.remove('bonus-open');
 }
 function start(id,first){
  const g=games[id];if(!g||!window.WendeUI)return;stop();
  const UI=window.WendeUI;
  UI.open(g.title,`<div class="bonus-shell" data-game="${id}"><div class="bonus-bar"><span class="bonus-tag">Bonusspiel</span><span class="bonus-task" aria-live="polite"></span><button type="button" class="bonus-pause" aria-label="Pause">❚❚</button><button type="button" class="bonus-leave">Zurück</button></div><div class="bonus-stage"></div></div>`,g.kicker||'Bonusspiel','bonus');
  const modal=document.querySelector('#modal');modal.classList.add('bonus-open');
  const shell=modal.querySelector('.bonus-shell'),stage=shell.querySelector('.bonus-stage'),task=shell.querySelector('.bonus-task');
  const s=session={id,alive:true,raf:0,timers:[],intervals:[],listeners:[],observers:[],paused:false,running:false,game:null,loops:[],last:0};
  const on=(t,type,fn,o)=>{t.addEventListener(type,fn,o);s.listeners.push([t,type,fn,o]);};
  on(modal,'close',()=>{if(session===s)stop();});
  on(document,'visibilitychange',()=>{if(document.hidden&&s.running)pause(true);});
  shell.querySelector('.bonus-leave').onclick=()=>UI.close();
  const pauseBtn=shell.querySelector('.bonus-pause');pauseBtn.onclick=()=>pause(!s.paused);
  function pause(v){if(!s.running&&v)return;s.paused=v;pauseBtn.setAttribute('aria-label',v?'Weiter':'Pause');pauseBtn.textContent=v?'▶':'❚❚';
   stage.querySelector('.bonus-pausecard')?.remove();
   if(v){const c=card('bonus-pausecard',`<h3>Pause</h3><p>Das Spiel wartet auf dich.</p>`);btn('Weiterspielen',()=>pause(false),'primary',c.querySelector('.bonus-actions'));btn('Zurück in die Szene',()=>UI.close(),'',c.querySelector('.bonus-actions'));}
   s.last=0;}
  function frame(now){if(!s.alive)return;if(!stage.isConnected){stop();return;}
   const dt=s.last?Math.min(.05,(now-s.last)/1000):0;s.last=now;
   for(const l of s.loops){if(l.update&&s.running&&!s.paused)l.update(dt,now/1000);if(l.draw)l.draw(now/1000);}
   s.raf=requestAnimationFrame(frame);}
  function card(cls,html){const c=document.createElement('div');c.className='bonus-card '+cls;c.innerHTML=`<div class="bonus-card-inner">${html}<div class="bonus-actions"></div></div>`;stage.append(c);return c;}
  function btn(text,fn,cls,parent){const b=document.createElement('button');b.type='button';b.textContent=text;b.className=cls||'';b.onclick=fn;parent.append(b);return b;}
  const ctx={
   stage,task,esc,
   get paused(){return s.paused;},get running(){return s.running;},
   reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,
   on,
   after(ms,fn){const t=setTimeout(()=>{if(s.alive)fn();},ms);s.timers.push(t);return t;},
   every(ms,fn){const t=setInterval(()=>{if(s.alive&&!s.paused&&s.running)fn();},ms);s.intervals.push(t);return t;},
   loop(l){s.loops.push(l);return l;},
   observe(el,fn){const o=new ResizeObserver(fn);o.observe(el);s.observers.push(o);return o;},
   /* Canvas mit Pixeldichte-Anpassung. */
   canvas(opts={}){const c=document.createElement('canvas');c.className='bonus-canvas';stage.append(c);const g=c.getContext('2d');const view={canvas:c,g,W:0,H:0,dpr:1,resize:null};
    ctx.observe(stage,()=>{const r=stage.getBoundingClientRect();view.dpr=Math.min(opts.maxDpr||2,window.devicePixelRatio||1);view.W=Math.max(1,r.width);view.H=Math.max(1,r.height);c.width=Math.round(view.W*view.dpr);c.height=Math.round(view.H*view.dpr);c.style.width=view.W+'px';c.style.height=view.H+'px';g.setTransform(view.dpr,0,0,view.dpr,0,0);view.resize?.(view);});
    return view;},
   layer(cls,html=''){const d=document.createElement('div');d.className=cls;d.innerHTML=html;stage.append(d);return d;},
   say(text,ms=2600,kind=''){let b=stage.querySelector('.bonus-say');if(!b){b=ctx.layer('bonus-say');b.setAttribute('role','status');}b.textContent=text;b.className='bonus-say show '+kind;clearTimeout(b._t);b._t=setTimeout(()=>{if(b.isConnected)b.className='bonus-say';},ms);},
   setTask(t){task.textContent=t||'';},
   btn,
   /* Sieg: kurze Abschlussmeldung, Noch einmal, Zurück. */
   win({title,lines=[],html='',backLabel='Zurück in die Szene'}){
    s.running=false;shell.classList.remove('running');mark(id,'won');
    stage.querySelector('.bonus-endcard')?.remove();
    const c=card('bonus-endcard',`${title?`<h3 class="bonus-victory">${esc(title)}</h3>`:''}${lines.length?`<ul class="bonus-lines">${lines.map(l=>`<li>${esc(l)}</li>`).join('')}</ul>`:''}${html}`);
    const a=c.querySelector('.bonus-actions');btn('Noch einmal',()=>start(id,false),'primary',a);btn(backLabel,()=>UI.close(),'',a);
    a.querySelector('.primary').focus({preventScroll:true});
   }
  };
  const intro=g.intro||{};
  const ic=card('bonus-introcard',`${first?'<p class="bonus-found">Du hast ein Bonusspiel entdeckt!</p>':''}<h3>${esc(g.title)}</h3>${intro.text?`<p>${esc(intro.text)}</p>`:''}${intro.controls?`<ul class="bonus-controls">${intro.controls.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}<p class="muted bonus-note">Freiwillig. Dein Spielstand in der Stadt bleibt unverändert.</p>`);
  try{s.game=g.setup(ctx)||{};}catch(e){console.error(e);}
  btn(intro.start||'Los geht’s',()=>{ic.remove();shell.classList.add('running');s.running=true;s.paused=false;s.last=0;s.game?.start?.();},'primary',ic.querySelector('.bonus-actions'));
  btn('Zurück in die Szene',()=>UI.close(),'',ic.querySelector('.bonus-actions'));
  ic.querySelector('.primary').focus({preventScroll:true});
  s.raf=requestAnimationFrame(frame);
 }
 return {register,decorate,journalHtml,bindJournal,start,stop,progress:load,games};
})();
