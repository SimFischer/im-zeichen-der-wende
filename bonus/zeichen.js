'use strict';
(()=>{
 if(!window.BonusGames)return;
 const symbols=['fish','anchor','dove','chi-rho'],names=['Fisch','Anker','Taube','Chi-Rho'];
 const files={board:'codeboard.png'};
 const ART={dir:'assets/bonus/secret-code/',files,available:Object.keys(files)};
 function createModel(random=Math.random){
  const s={sequence:[],index:0,phase:'idle',active:-1,remaining:0,step:0,errors:0,rounds:5,replaying:false};
  function show(replaying=false){s.phase='playback';s.step=-1;s.index=0;s.active=-1;s.remaining=.6;s.replaying=replaying;}
  function next(){s.sequence.push(Math.min(3,Math.floor(random()*4)));show();}
  function input(i){if(s.phase!=='input'||!Number.isInteger(i)||i<0||i>3)return false;s.active=i;s.remaining=.3;if(i!==s.sequence[s.index]){s.errors++;s.phase='error';s.remaining=1.2;return false;}s.index++;if(s.index===s.sequence.length){s.phase='success';s.remaining=1;}return true;}
  function tick(dt){if(s.phase==='idle'||s.phase==='won')return;s.remaining-=dt;if(s.remaining>0)return;
   if(s.phase==='playback'){s.step++;if(s.step>=s.sequence.length*2){s.phase='input';s.active=-1;}else{s.active=s.step%2===0?s.sequence[s.step/2]:-1;s.remaining=s.active<0?.3:.75;}}
   else if(s.phase==='error')show(true);else if(s.phase==='success'){s.active=-1;if(s.sequence.length===s.rounds)s.phase='won';else next();}else s.active=-1;
  }
  return {s,start:()=>{if(s.phase==='idle')next();},input,tick,replay:()=>{if(s.phase==='input')show(true);}};
 }
 window.BonusGames.register({id:'zeichen',title:'Das geheime Zeichen',kicker:'Ein Code der Gemeinschaft',art:ART,createModel,
  intro:{text:'Hinter der verschlossenen Tür wartet die christliche Gemeinde auf dich. Nur wer den geheimen Zeichencode kennt, darf eintreten – mögliche Verfolger sollen draußen bleiben. Merke dir die Folge und öffne dir den Weg zum Treffen.',controls:['Vier Zeichen: Fisch, Anker, Taube und Chi-Rho.','Sieh dir zuerst die leuchtende Folge an und tippe sie danach in derselben Reihenfolge.','Jede Runde kommt ein Zeichen hinzu. Fünf geschaffte Runden öffnen dir die Tür.','Bei einem Fehler wird dieselbe Folge erneut gezeigt.'],start:'Code lernen'},
  setup(ctx){
   const m=createModel();ctx.assets?.(ART);
   const root=ctx.layer('code-game',`<div class="code-board"><img class="code-board-art" src="${ART.dir+files.board}" alt="Codebrett: Fisch oben links, Anker oben rechts, Taube unten links, Chi-Rho unten rechts" draggable="false">${symbols.map((_,i)=>`<button type="button" class="code-symbol code-symbol-${i}" data-symbol="${i}" data-state="normal" aria-label="${names[i]}" disabled></button>`).join('')}</div><div class="code-instructions"><p class="code-kicker">Vor der verborgenen Tür</p><h3 class="code-round">Runde 1 von 5</h3><div class="code-progress" aria-label="0 von 5 Runden geschafft">${Array.from({length:5},()=>'<span aria-hidden="true"></span>').join('')}</div><p class="code-status" role="status" aria-live="polite"></p><p class="code-hint">Erst die Zeichen ansehen.<br>Dann die Folge nachtippen.</p><p class="code-input-progress"></p><button type="button" class="code-replay" disabled>Folge erneut zeigen</button></div>`);
   const buttons=[...root.querySelectorAll('[data-symbol]')],status=root.querySelector('.code-status'),replay=root.querySelector('.code-replay'),progress=root.querySelector('.code-progress');let won=false,last='';
   function render(){const s=m.s,key=[s.phase,s.active,s.index,s.sequence.length,s.replaying].join();if(key===last)return;last=key;
    const round=`Runde ${s.sequence.length || 1} von ${s.rounds}`;ctx.setTask(round);root.querySelector('.code-round').textContent=round;root.dataset.phase=s.phase;
    status.textContent=s.phase==='error'?'Noch nicht ganz – schau dir die Folge noch einmal an.':s.phase==='success'?'Richtig! Die Tür öffnet sich ein Stück.':s.phase==='input'?'Du bist dran.':s.phase==='won'?'Der Weg ist frei!':s.replaying?'Die Folge wird erneut gezeigt.':'Schau genau hin …';replay.disabled=s.phase!=='input';
    root.querySelector('.code-input-progress').textContent=s.phase==='input'?`${s.index} von ${s.sequence.length} Zeichen eingegeben`:'Jede Runde kommt ein Zeichen hinzu.';
    const completed=Math.max(0,s.sequence.length-(['success','won'].includes(s.phase)?0:1));progress.setAttribute('aria-label',`${completed} von 5 Runden geschafft`);[...progress.children].forEach((dot,i)=>{dot.className=i<completed?'done':i===s.sequence.length-1?'current':'';});
    buttons.forEach((b,i)=>{b.disabled=s.phase!=='input';b.dataset.state=s.active===i?(s.phase==='error'?'error':'active'):'normal';});
    if(s.phase==='won'&&!won){won=true;ctx.win({title:'Die Tür steht dir offen!',lines:['Du hast alle fünf Zeichenfolgen richtig wiedergegeben.','Die Gemeinde heißt dich willkommen.']});}
   }
   buttons.forEach((b,i)=>ctx.on(b,'click',()=>{if(ctx.running&&!ctx.paused){m.input(i);render();}}));ctx.on(replay,'click',()=>{if(ctx.running&&!ctx.paused){m.replay();render();}});
   ctx.loop({update(dt){m.tick(dt);render();}});return {start(){m.start();render();}};
  }
 });
})();
