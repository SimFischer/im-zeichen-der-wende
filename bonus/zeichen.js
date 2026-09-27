'use strict';
(()=>{
 if(!window.BonusGames)return;
 const symbols=['fish','anchor','dove','chi-rho'],names=['Fisch','Anker','Taube','Chi-Rho'];
 const files={board:'codeboard.png'};
 for(const s of symbols)for(const mode of ['normal'])files[s+'-'+mode]=s+'-'+mode+'.png';
 const ART={dir:'assets/bonus/secret-code/',files,available:Object.keys(files)};
 function createModel(random=Math.random){
  const s={sequence:[],index:0,phase:'idle',active:-1,remaining:0,step:0,errors:0,rounds:5};
  function show(){s.phase='playback';s.step=-1;s.index=0;s.active=-1;s.remaining=.6;}
  function next(){s.sequence.push(Math.min(3,Math.floor(random()*4)));show();}
  function input(i){if(s.phase!=='input')return false;s.active=i;s.remaining=.3;if(i!==s.sequence[s.index]){s.errors++;s.phase='error';s.remaining=1.2;return false;}s.index++;if(s.index===s.sequence.length){s.phase='success';s.remaining=1;}return true;}
  function tick(dt){if(s.phase==='idle'||s.phase==='won')return;s.remaining-=dt;if(s.remaining>0)return;
   if(s.phase==='playback'){s.step++;if(s.step>=s.sequence.length*2){s.phase='input';s.active=-1;}else{s.active=s.step%2===0?s.sequence[s.step/2]:-1;s.remaining=s.active<0?.3:.75;}}
   else if(s.phase==='error')show();else if(s.phase==='success'){s.active=-1;if(s.sequence.length===s.rounds)s.phase='won';else next();}else s.active=-1;
  }
  return {s,start:next,input,tick,replay:()=>{if(s.phase==='input')show();}};
 }
 window.BonusGames.register({id:'zeichen',title:'Das geheime Zeichen',kicker:'Ein Code der Gemeinschaft',art:ART,createModel,
  intro:{text:'Merke dir den geheimen Code und gib ihn richtig wieder. In dieser erfundenen Spielsituation erkennen sich Mitglieder einer christlichen Gemeinschaft an einer Zeichenfolge.',controls:['Vier Zeichen: Fisch, Anker, Taube und Chi-Rho.','Erst zuschauen, dann die leuchtende Folge nachtippen. Jede Runde kommt ein Zeichen dazu.','Fünf Runden führen zum Ziel. Bei einem Fehler wird dieselbe Folge erneut gezeigt.'],start:'Code lernen'},
  setup(ctx){
   const m=createModel();ctx.assets?.(ART);
   const root=ctx.layer('code-game',`<div class="code-instructions"><p class="code-kicker">Zeichen der Gemeinschaft</p><h3>Erst schauen.<br>Dann erinnern.</h3><p class="code-status" role="status"></p><p>Fünf Folgen öffnen dir den Weg.<br>Fehler kosten keinen Fortschritt.</p><button type="button" class="code-replay">Folge erneut zeigen</button><p class="code-history">Die Zeichen haben historische Bezüge. Ein solcher festgelegter Geheimcode ist nicht belegt.</p></div><div class="code-board"><img class="code-board-art" src="${ART.dir+files.board}" alt="Bronzenes Codebrett im Fackellicht">${symbols.map((s,i)=>`<button type="button" class="code-symbol code-symbol-${i}" data-symbol="${i}" aria-label="${names[i]}" disabled><img src="${ART.dir+files[s+'-normal']}" alt="" draggable="false"></button>`).join('')}<span class="code-effect" aria-hidden="true" hidden></span></div>`);
   const buttons=[...root.querySelectorAll('[data-symbol]')],status=root.querySelector('.code-status'),replay=root.querySelector('.code-replay'),effect=root.querySelector('.code-effect');let won=false,last='';
   function render(){const s=m.s,key=[s.phase,s.active,s.index,s.sequence.length].join();if(key===last)return;last=key;ctx.setTask(`Runde ${s.sequence.length || 1} von ${s.rounds} · ${s.phase==='input'?'Du bist dran':'Merke dir die Folge'}`);status.textContent=s.phase==='error'?'Fast! Schau dir dieselbe Folge noch einmal an.':s.phase==='success'?'Richtig!':s.phase==='input'?`Du bist dran. ${s.index} von ${s.sequence.length} Zeichen.`:'Schau genau hin …';replay.disabled=s.phase!=='input';
    buttons.forEach((b,i)=>{b.disabled=s.phase!=='input';const mode=s.active===i?(s.phase==='error'?'error':'active'):'normal';b.dataset.state=mode;b.querySelector('img').src=ART.dir+files[symbols[i]+'-normal'];});
    const feedback=['error','success'].includes(s.phase);effect.hidden=!feedback;if(feedback){effect.textContent=s.phase==='success'?'✓':'↻';effect.dataset.kind=s.phase;}
    if(s.phase==='won'&&!won){won=true;ctx.win({title:'Der Code ist gelöst!',lines:['Du hast fünf Zeichenfolgen sicher wiedergegeben.','Eine Gemeinschaft kann durch gemeinsame Zeichen Zusammenhalt zeigen.']});}
   }
   buttons.forEach((b,i)=>ctx.on(b,'click',()=>{if(ctx.running&&!ctx.paused){m.input(i);render();}}));ctx.on(replay,'click',()=>{if(ctx.running&&!ctx.paused){m.replay();render();}});
   ctx.loop({update(dt){m.tick(dt);render();}});return {start(){m.start();render();}};
  }
 });
})();
