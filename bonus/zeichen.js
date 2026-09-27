'use strict';
(()=>{
 if(!window.BonusGames)return;
 const symbols=['fish','anchor','dove','chi-rho'],names=['Fisch','Anker','Taube','Chi-Rho'];
 const files={board:'codeboard.png'},ART={dir:'assets/bonus/secret-code/',files,available:Object.keys(files)};
 const RECORD_KEY='im-zeichen-der-wende:secret-code-record-v1';
 const time=seconds=>`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
 function readRecord(){try{const n=Number(localStorage.getItem(RECORD_KEY));return Number.isSafeInteger(n)&&n>=0?n:0;}catch(e){return 0;}}
 function createModel(random=Math.random,clock=null){
  const s={sequence:[],index:0,phase:'idle',active:-1,remaining:0,step:0,completed:0,elapsed:0};let started=0;
  function measure(dt=0){s.elapsed=clock?Math.max(0,clock()-started):s.elapsed+dt;}
  function next(){const n=s.sequence.length,blocked=n>1&&s.sequence[n-1]===s.sequence[n-2]?s.sequence[n-1]:-1;
   const choices=[0,1,2,3].filter(i=>i!==blocked);s.sequence.push(choices[Math.min(choices.length-1,Math.max(0,Math.floor(random()*choices.length)))]);
   s.phase='playback';s.step=-1;s.index=0;s.active=-1;s.remaining=.6;
  }
  function input(i){if(s.phase!=='input'||!Number.isInteger(i)||i<0||i>3)return false;measure();s.active=i;s.remaining=.3;
   if(i!==s.sequence[s.index]){s.phase='ended';return false;}
   s.index++;if(s.index===s.sequence.length){s.completed=s.sequence.length;s.phase='success';s.remaining=1;}return true;
  }
  function tick(dt){if(s.phase==='idle'||s.phase==='ended')return;measure(dt);s.remaining-=dt;if(s.remaining>0)return;
   if(s.phase==='playback'){s.step++;if(s.step>=s.sequence.length*2){s.phase='input';s.active=-1;}else{s.active=s.step%2===0?s.sequence[s.step/2]:-1;s.remaining=s.active<0?.3:.75;}}
   else if(s.phase==='success')next();else s.active=-1;
  }
  return {s,start(){if(s.phase==='idle'){started=clock?clock():0;next();}},input,tick};
 }
 window.BonusGames.register({id:'zeichen',title:'Das geheime Zeichen',kicker:'Ein Code der Gemeinschaft',art:ART,createModel,
  intro:{text:'Merke dir den geheimen Code und wiederhole ihn. Nach jeder erfolgreichen Runde kommt ein weiteres Zeichen hinzu. Wie lange kannst du dir die Folge merken? Ein Fehler beendet deinen Durchlauf.',controls:['Dasselbe Zeichen erscheint höchstens zweimal hintereinander.'],start:'Code lernen'},
  setup(ctx){
   let m,record=readRecord(),initialRecord=record,last='';ctx.assets?.(ART);
   const root=ctx.layer('code-game',`<div class="code-board"><img class="code-board-art" src="${ART.dir+files.board}" alt="Codebrett: Fisch oben links, Anker oben rechts, Taube unten links, Chi-Rho unten rechts" draggable="false">${symbols.map((_,i)=>`<button type="button" class="code-symbol code-symbol-${i}" data-symbol="${i}" data-state="normal" aria-label="${names[i]}" disabled></button>`).join('')}</div><div class="code-instructions"><p class="code-kicker">Vor der verborgenen Tür</p><h3 class="code-round">Folge: 1 Zeichen</h3><div class="code-stats"><p class="code-series"></p><p class="code-time"></p><p class="code-record"></p></div><p class="code-status" role="status" aria-live="polite"></p><p class="code-record-notice" role="status"></p><p class="code-hint">Erst die Zeichen ansehen.<br>Dann die Folge nachtippen.</p><div class="code-result" hidden><h3>Durchlauf beendet</h3><p class="code-result-score"></p><div class="bonus-actions"><button type="button" class="code-restart primary">Noch einmal</button><button type="button" class="code-back">Zurück</button></div></div></div>`);
   const buttons=[...root.querySelectorAll('[data-symbol]')],status=root.querySelector('.code-status'),result=root.querySelector('.code-result');
   function render(){const s=m.s;
    if(s.completed>record){record=s.completed;try{localStorage.setItem(RECORD_KEY,String(record));}catch(e){}}
    const key=[s.phase,s.active,s.index,s.sequence.length,s.completed,Math.floor(s.elapsed),record].join();if(key===last)return;last=key;
    const round=`Folge: ${s.sequence.length||1} Zeichen`;ctx.setTask(s.phase==='ended'?'Durchlauf beendet':round);root.querySelector('.code-round').textContent=round;root.dataset.phase=s.phase;ctx.stage.parentNode.querySelector('.bonus-pause').disabled=s.phase==='ended';
    root.querySelector('.code-series').textContent=`Serie: ${s.completed} Zeichen`;
    root.querySelector('.code-time').textContent=`Zeit: ${time(s.elapsed)}`;
    root.querySelector('.code-record').textContent=`Rekord: ${record} Zeichen`;
    root.querySelector('.code-record-notice').textContent=s.completed>initialRecord&&(s.phase==='success'||s.phase==='ended')?'Neuer Rekord!':'';
    status.textContent=s.phase==='ended'?'':s.phase==='success'?'Richtig! Ein Zeichen kommt hinzu.':s.phase==='input'?`Du bist dran · ${s.index} von ${s.sequence.length}`:'Schau genau hin …';
    root.querySelector('.code-hint').hidden=s.phase==='ended';result.hidden=s.phase!=='ended';
    root.querySelector('.code-result-score').textContent=`Geschafft: ${s.completed} Zeichen`;
    buttons.forEach((b,i)=>{b.disabled=s.phase!=='input';b.dataset.state=s.active===i?(s.phase==='ended'?'error':'active'):'normal';});
   }
   function reset(){m=createModel(Math.random,()=>performance.now()/1000);initialRecord=record;last='';render();}
   buttons.forEach((b,i)=>ctx.on(b,'click',()=>{if(ctx.running&&!ctx.paused){m.input(i);render();if(m.s.phase==='ended')root.querySelector('.code-restart').focus({preventScroll:true});}}));
   ctx.on(root.querySelector('.code-restart'),'click',()=>{if(ctx.running&&!ctx.paused){reset();m.start();render();}});
   ctx.on(root.querySelector('.code-back'),'click',()=>ctx.stage.parentNode.querySelector('.bonus-leave').click());
   ctx.loop({update(dt){m.tick(dt);render();}});reset();return {start(){m.start();render();}};
  }
 });
})();
