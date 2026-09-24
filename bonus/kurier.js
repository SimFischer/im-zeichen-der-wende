'use strict';
/* Bonusspiel: Die Kurierfahrt von 313.
   Das frühere Spurwechsel-Rennen der geöffneten Stadt (MiniGames.racer, Inhalte in GAME.kurier)
   läuft hier als freiwilliges Bonusspiel. Es verändert den Spielstand nicht. */
(()=>{
 if(!window.BonusGames)return;
 window.BonusGames.register({
  id:'kurier',title:'Die Kurierfahrt von 313',kicker:'Bonusspiel · Nachricht aus Mailand',scene:'city',
  intro:{text:'Die Kaiser haben sich in Mailand geeinigt. Reite mit der Nachricht in die Stadt! Unterwegs liegen Schriftrollen auf der Straße – aber nicht alle sagen die Wahrheit.',
   controls:['<b>Sammle</b> Schriftrollen mit richtigen Aussagen über 311 und 313, <b>weiche</b> falschen aus.','Links oder rechts ins Bild tippen, wischen oder die Pfeile unten<span class="mg-keys"> (am PC Pfeiltasten)</span>.','Karren und Marschkolonnen bremsen nur – Leben gibt es keine. Das Tempo stellst du oben ein.'],start:'Losreiten'},
  setup(ctx){
   const wrap=ctx.layer('kurier-wrap');
   const cfg=window.GAME?.kurier;
   ctx.on(document,'minigame-win',e=>{if(e.detail!=='kurier')return;
    ctx.win({title:'Die Botschaft ist angekommen.',lines:['Sechs richtige Aussagen über die Wende gesammelt'],html:'<div class="bonus-history"><h4>Zur Erinnerung</h4><p>311 beendete Galerius die staatliche Verfolgung weitgehend. 313 wurde vereinbart, dass alle ihre Religion ausüben dürfen – das Christentum wurde aber nicht zur einzigen erlaubten Religion.</p></div>',backLabel:'Zurück zur Stadt'});});
   // Im Hintergrund: Rennen anhalten
   ctx.on(document,'visibilitychange',()=>{const p=wrap.querySelector('.racer-pause');if(document.hidden&&p&&p.textContent!=='▶')p.click();});
   return {
    start(){wrap.innerHTML='';if(!cfg||!window.MiniGames?.racer){wrap.textContent='Das Rennen konnte nicht geladen werden.';return;}
     window.MiniGames.racer('kurier',cfg,wrap);wrap.querySelector('.racer-start')?.click();},
    destroy(){wrap.remove();} // Canvas vom Dokument lösen: die Rennschleife beendet sich selbst
   };
  }
 });
})();
