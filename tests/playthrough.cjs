/* Run: npm install --no-save linkedom; node tests/playthrough.cjs
   Minigames are replaced by a stub (they need canvas/animation); their mechanics are tested in a real browser.
   DOM integration tests; no claim to emulate Safari or physical touch. */
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const {parseHTML}=require(process.env.WENDE_TEST_DOM||'linkedom');
const root=path.resolve(__dirname,'..'), KEY='im-zeichen-der-wende:v1';
const storage=new Map();let checks=0;
function boot(raw,opts={}){if(raw!==undefined)storage.set(KEY,raw);const {window}=parseHTML(fs.readFileSync(path.join(root,'index.html'),'utf8'));const document=window.document;
 const localStorage={getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 document.querySelector('#modal').showModal=function(){this.open=true;};document.querySelector('#modal').close=function(){this.open=false;this.dispatchEvent(new window.Event('close'));};
 window.HTMLElement.prototype.focus=function(){};window.HTMLElement.prototype.scrollIntoView=function(){};
 // Minispiele laufen im echten Browser mit Canvas/Animation. Hier ersetzt ein Platzhalter jedes Spiel;
 // geprüft wird die Einbindung: Das Rätsel öffnet das Spiel, und ein Sieg meldet sich über „minigame-win“.
 window.MiniGames=new Proxy({},{get:(_,type)=>(id,cfg,work)=>{work.innerHTML=`<p class="stub-minigame" data-type="${String(type)}">${cfg.title}</p>`;return true;}});
 const matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
 const timers=[];const context={window,document,localStorage,console,Blob,URL,matchMedia,requestAnimationFrame:()=>0,cancelAnimationFrame:()=>{},setTimeout:(f,t)=>{timers.push({f,t});return timers.length;},clearTimeout:()=>{},setInterval:()=>0,clearInterval:()=>{}};
 window.matchMedia=matchMedia;vm.createContext(context);
 for(const f of ['data/game-data.js','adventure.js','seals.js','finale.js','bonusgames.js',...fs.readdirSync(path.join(root,'bonus')).filter(f=>f.endsWith('.js')).map(f=>'bonus/'+f),'script.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context,{filename:f});
 return {window,document,timers};}
let env=boot();const $=s=>env.document.querySelector(s), all=s=>[...env.document.querySelectorAll(s)], state=()=>JSON.parse(storage.get(KEY));
function ok(v,msg){assert.ok(v,msg);checks++;}
function click(selector){const n=$(selector);ok(n,'Element exists: '+selector);if(n.disabled)throw Error('Disabled '+selector);n.click();}
function textButton(text,scope='#modal-content'){const b=all(scope+' button').find(n=>n.textContent===text);ok(b,'Button exists: '+text);ok(!b.disabled,'Enabled: '+text);b.click();}
function close(){if($('#modal').open)click('#close');}
function endTalk(){const x=$('#speech .speech-close');if(x)x.click();}
function hotspotModel(){all('#hotspots .hotspot:not(.exit)').forEach(h=>ok(h.style.getPropertyValue('--x')&&h.style.getPropertyValue('--y'),'Hotspot mit einem Positionsmodell: '+h.dataset.hotspot));}
function travel(id){click('#map');const name=env.window.GAME.scenes.find(s=>s.id===id).name;const b=all('.pm-place').find(n=>n.querySelector('.pm-label b').textContent===name);ok(b&&!b.disabled,'Reachable '+id);b.click();if($('#modal').open&&$('#modal-title').textContent===name){ok(all('#modal-content .actions button').some(x=>x.textContent==='Szene erkunden')&&!all('#modal-content .actions button').some(x=>x.textContent==='Zurück in die Szene'),'Erstes Betreten: Szene erkunden ('+id+')');close();}ok(state().scene===id,'Scene entered '+id);}
function spot(id){click('[data-hotspot="'+id+'"]');}
// Alle Gespräche und Sachgegenstände eines Ortes ansehen – erst dann öffnet sich das Rätsel.
function explore(){const sc=env.window.GAME.scenes.find(s=>s.id===state().scene);sc.hotspots.forEach(h=>{if(h[3]!=='talk')return;spot(h[4]);endTalk();close();});
 all('#hotspots .hotspot.hs-puzzle').forEach(b=>{const h=sc.hotspots[+b.dataset.index];if(!state().solved.includes(h[4]))ok(!b.classList.contains('locked'),'Puzzle unlocked after exploring: '+h[4]);});}
function solve(id){const p=env.window.GAME.puzzles[id],mg=env.window.GAME.minigames?.[id];
 if(mg){ok($('#modal').dataset.mode==='minigame','Minigame opens for '+id);ok($('#modal-title').textContent===mg.title,'Minigame title '+id);ok(!all('#modal-content button').some(b=>b.textContent==='Ohne Spiel lösen'),'No skip-the-game button for '+id);
  env.document.dispatchEvent(new env.window.CustomEvent('minigame-win',{detail:id}));ok(state().solved.includes(id),'Solved by minigame '+id);close();return;}
 ok($('#modal-title').textContent===p.title,'Puzzle opened '+id);
 if(p.type==='gears'){p.rows.forEach((r,i)=>{for(let j=0;j<=r.answer[0];j++)all('.gear button')[i].click();});}
 else if(['sources','vision','cases','archive','change','motives'].includes(id))p.rows.forEach((r,i)=>{click('#slot-'+i);textButton(r.options[r.answer[0]],'.sorting-trays');});
 else p.rows.forEach((r,i)=>{textButton(r.options[r.answer[0]],'.rack');click('#slot-'+i);});
 ok(!all('#modal-content textarea, #modal-content input[type=text], #modal-content [contenteditable]').length,'No free-text field in puzzle '+id);
 const checkLabel=p.type==='balance'?'Einordnung prüfen':'Mechanismus prüfen';
 if(p.reasons){
  textButton(checkLabel);ok(!state().solved.includes(id),'Reason required before progress: '+id);ok($('#feedback').textContent.includes('Begründung'),'Asks for a reason choice: '+id);
  const bad=p.reasons.options.find(o=>!o.ok);textButton(bad.text,'.reason-choice');textButton(checkLabel);ok(!state().solved.includes(id),'Wrong reason does not unlock '+id);ok($('#feedback').textContent.includes(bad.why),'Subject feedback for wrong reason: '+id);ok(!/^\s*Falsch/.test($('#feedback').textContent),'No bare "Falsch": '+id);
  const good=p.reasons.options.filter(o=>o.ok);ok(good.length>=2,'Several acceptable reasons: '+id);textButton(good[good.length-1].text,'.reason-choice');ok(state().drafts[id].reason===good[good.length-1].text,'Chosen reason saved as text: '+id);
 }
 textButton(checkLabel);if(p.type==='balance')textButton('Verstanden – Siegel nehmen');ok(state().solved.includes(id),'Solved '+id);close();}
textButton('So spielst du');ok(!$('#modal-content').textContent.includes('Briefing'),'No internal briefing in student controls');ok($('#modal-content').textContent.includes('Grüne Markierungen'),'Help explains hotspot kinds');close();click('#title');
textButton('Die Stadt betreten');close();
ok($('#art').style.backgroundImage.includes('v3-gate.png'),'Gate scene');
ok($('[data-hotspot="flint"]').textContent.startsWith('Feuerstein'),'Collectible label matches inventory item');
ok(!!$('.flint-art'),'Visible flint image');ok($('[data-hotspot="flint"]').classList.contains('hs-take'),'Collectible marked as take');ok(/aufnehmen/.test($('[data-hotspot="flint"]').getAttribute('aria-label')||''),'Collectible announced as take');ok($('[data-hotspot="guard"]').classList.contains('hs-talk'),'Person marked as information');
spot('guard');ok(!!$('#speech.speech-bubble'),'Guard talks in a speech bubble in the scene');ok(!$('#modal').open,'No extra window for conversations');
const pages=$('.dialogue-progress').textContent.split('/')[1].trim();ok(+pages>1,'Conversation has several pages');
textButton('Weiter zuhören','#speech');ok($('.dialogue-progress').textContent.startsWith('2 /'),'Conversation advances');textButton('Zurück','#speech');ok($('.dialogue-progress').textContent.startsWith('1 /'),'Conversation returns');endTalk();ok(!$('#speech'),'Conversation closes');
spot('flint');ok($('[data-hotspot="flint"]').hidden,'Picked-up flint disappears');ok(state().inventory.includes('flint'),'Take flint');
click('#map');ok(all('.pm-place').filter(n=>!n.disabled).length===3,'Only initial three places');close();
// Wohnviertel: Das Rätsel bleibt gesperrt, bis alle Gespräche und Gegenstände angesehen sind.
travel('house');spot('lamp');ok($('[data-hotspot="conflict"]').classList.contains('locked'),'Puzzle locked before exploring');ok($('[data-hotspot="conflict"] .hs-cap').textContent.includes('0/5'),'Lock shows progress');
spot('conflict');ok($('#modal-title').textContent==='Erst Informationen sammeln','Locked puzzle explains what is missing');ok(!state().solved.includes('conflict'),'Locked puzzle not opened');close();
spot('resident');endTalk();ok($('[data-hotspot="conflict"] .hs-cap').textContent.includes('1/5'),'Progress counts conversations');
explore();ok($('#objective').textContent.includes('Überprüfe dein Wissen'),'Objective switches to checking');
spot('conflict');click('#puzzle-hint');ok($('#hint-box').textContent.includes('1/3'),'First staged hint');click('#puzzle-hint');click('#puzzle-hint');click('#puzzle-hint');ok($('#hint-box').textContent.includes('3/3'),'Hints capped');solve('conflict');
// Bonusspiele erscheinen nicht als Fundstelle in der Szene; sie werden durch gelöste Rätsel im Notizbuch freigeschaltet.
ok(!$('.bonus-spot'),'No bonus spots in scenes');
{const before=storage.get(KEY);click('#notebook');ok(all('.bonus-replay').length===1,'First bonus game unlocked by first puzzle');ok(storage.get(KEY)===before,'Opening the notebook does not change the save');close();}
travel('forum');explore();spot('sources');solve('sources');
env=boot();textButton('Spiel fortsetzen');ok(state().scene==='forum','Resume scene');ok(state().solved.includes('sources'),'Progress survives reload');
travel('office');explore();spot('cases');solve('cases');travel('temple');explore();spot('sacrifice');solve('sacrifice');
// Archive requires key selection; first map attempt only explains lock.
// Archiv: erst beim Archivar die Schriftrollen lesen, dann mit brennender Lampe hinein, am Ende die Rollen ablegen.
travel('vestibule');spot('archivist');textButton('Schriftrollen übernehmen und lesen');ok(state().flags.archiveScrollsReceived,'Archivist hands over the scrolls');ok(state().inventory.includes('scrolls'),'Scrolls in the bag');
if(!$('#modal').open||!all('#modal-content button').some(b=>/Nächste Schriftrolle|Gelesen/.test(b.textContent)))spot('scrolls');
for(let k=0;k<10&&all('#modal-content button').some(b=>b.textContent==='Nächste Schriftrolle');k++)textButton('Nächste Schriftrolle');
textButton('Gelesen – zum Archiv bringen');ok(state().flags.archiveScrollsRead,'Scrolls read');
click('#map');all('.pm-place').find(n=>n.querySelector('.pm-label b').textContent==='Diokletians Archiv').click();ok(state().scene==='vestibule','Archive needs a burning lamp');close();
click('#inventory-toggle');textButton('Öllampe','#inventory');textButton('Feuerstein','#inventory');ok(state().inventory.includes('light'),'Lamp combination');ok(!state().inventory.includes('lamp'),'Combination consumes lamp');close();
click('#inventory-toggle');textButton('Archivschlüssel','#inventory');travel('archive');ok(state().flags.archiveUnlocked,'Key opens the archive');spot('archive');solve('archive');close();ok(!state().flags.archiveScrollsDeposited,'Scrolls still to deposit');spot('shelf');ok(state().flags.archiveScrollsDeposited,'Scrolls deposited');ok(!state().inventory.includes('scrolls'),'Scrolls left the bag');ok(state().flags.galerius,'311 event fired');ok(state().notes.includes('galerius'),'311 journal');close();
travel('house');ok($('#era').textContent.includes('wieder offen'),'House visibly reopened');travel('camp');explore();spot('vision');ok($('#modal-title').textContent==='Hier fehlt noch etwas','Tent locked before map');close();spot('map312');solve('map312');spot('vision');solve('vision');
travel('city');ok($('#art').style.backgroundImage.includes('open-city.png'),'Geöffnete Stadt zeigt das neue Stadtbild');ok($('#scene').classList.contains('discover'),'Stadt ist eine Entdeckungsszene');ok($('[data-hotspot="change"]').classList.contains('locked'),'Vorher/Nachher erst nach dem Entdecken');spot('sign');ok(!!$('#speech'),'Entdeckte Veränderung erscheint direkt in der Szene');endTalk();ok($('#objective').textContent.includes('Entdeckt: 1 von 5'),'Zähler der entdeckten Veränderungen');explore();spot('change');ok($('#modal-content .stub-minigame').dataset.type==='citychange','Vorher/Nachher-Rätsel öffnet sich');solve('change');ok(state().inventory.includes('decree'),'Belohnung bleibt erhalten');travel('motives');explore();spot('motives');ok($('#modal-content .stub-minigame').dataset.type==='mosaik','Mosaik der Motive öffnet sich');env.document.dispatchEvent(new env.window.CustomEvent('minigame-choice',{detail:{id:'motives',text:env.window.GAME.puzzles.motives.reasons.options.find(o=>o.ok).text}}));ok(state().drafts.motives.reason.startsWith('Glaube und Politik'),'Chosen reason from the mosaic is saved');solve('motives');ok(state().seals.length===6,'Six unique seals');travel('council');explore();spot('council');ok($('#modal-content .stub-minigame').dataset.type==='konzil','Beratung im Konzil öffnet sich');solve('council');travel('basilica');spot('timeline');ok($('#modal-title').textContent==='Hier fehlt noch etwas','Final requires placed seals');close();spot('finalgate');ok($('#modal-title').textContent==='Das Siegelrad','Seal wheel opens');ok(all('.seal-rack .seal-token').length===6&&all('.seal-wheel .seal-socket').length===6,'Six seals and six settings');ok(all('.seal-rack .seal-token.is-owned').length===6,'All owned seals ready in the case');
{const [a,b]=env.window.GAME.seals;$('.seal-wheel [data-seal="'+a+'"]').click();ok(/zuerst ein Siegel/.test($('#seal-message').textContent),'Setting needs a chosen seal');
 $('.seal-rack [data-seal="'+a+'"]').click();ok($('.seal-rack [data-seal="'+a+'"]').classList.contains('is-selected'),'Selected state');$('.seal-wheel [data-seal="'+b+'"]').click();ok(/Gravur passt nicht/.test($('#seal-message').textContent)&&!(state().flags.sealSockets||[]).includes(a),'Wrong setting refused');$('.seal-rack [data-seal="'+a+'"]').click();ok($('.seal-rack [data-seal="'+a+'"]').classList.contains('is-owned'),'Tapping again deselects');}
for(const seal of env.window.GAME.seals){$('.seal-rack [data-seal="'+seal+'"]').click();$('.seal-wheel [data-seal="'+seal+'"]').click();ok(state().flags.sealSockets.includes(seal),'Seal placed: '+seal);ok($('.seal-rack [data-seal="'+seal+'"]').classList.contains('is-placed')&&$('.seal-wheel [data-seal="'+seal+'"]').classList.contains('fitted'),'Placed state shown: '+seal);}
ok(state().flags.sealsPlaced&&$('.seal-chamber').classList.contains('complete'),'All six seals engage');textButton('Zur Zeitmechanik');spot('bridge');ok($('#modal-title').textContent==='Hier fehlt noch etwas','Bridge gated by timeline');close();spot('timeline');ok($('#modal-content .stub-minigame').dataset.type==='chronik','Chronik öffnet sich');solve('timeline');spot('bridge');ok($('#modal-content .stub-minigame').dataset.type==='argbridge','Argumentationsbrücke öffnet die neue Brückenszene');solve('bridge');ok(state().flags.finished,'Finale reached naturally');ok(!!env.document.querySelector('#finale'),'Endsequenz statt normalem Fenster');hotspotModel();env.window.Finale.stop();ok(state().solved.length===12,'All 12 puzzles solved');
click('#notebook');ok($('#modal-content').textContent.includes('Deine gewählte Begründung'),'Chosen reasoning in notebook');ok($('#modal-content').textContent.includes('Freigeschaltet: 7 / 7'),'Notebook lists all bonus games');ok(all('.bonus-replay').length===7&&!all('.bonus-unknown').length,'All seven bonus games unlocked after the finale');close();
env=boot();textButton('Spiel fortsetzen');ok(state().flags.finished&&state().seals.length===6,'Completed save reload');
// Alte Spielstände mit Freitext bleiben gültig: kein Fortschritt geht verloren, der Text erscheint als frühere Notiz.
{const old=state();old.drafts.motives.reason='Mein alter Freitext aus der früheren Version.';env=boot(JSON.stringify(old));textButton('Spiel fortsetzen');ok(state().solved.includes('motives')&&state().seals.length===6,'Legacy free-text save keeps progress');click('#notebook');ok($('#modal-content').textContent.includes('Deine frühere Notiz'),'Legacy text shown as earlier note');close();}
// Alte Bonus-Stände mit entfernten Spielen (Kurierfahrt, Wagen) laden ohne Fehler.
storage.set('im-zeichen-der-wende:bonus-v1',JSON.stringify({found:['kurierfahrt','kurier','wagen'],won:['kurierfahrt','kurier','wagen']}));env=boot(JSON.stringify({version:1,started:true,scene:'city',unlocked:env.window.GAME.scenes.map(x=>x.id),solved:['conflict'],seals:[],inventory:[],notes:[],seen:[],evidence:[],hints:{change:1},drafts:{change:{values:[null,null,null,null,null],reason:''}},flags:{courierDone:true},courier:{best:6,difficulty:'Schnell'}}));textButton('Spiel fortsetzen');ok(state().scene==='city','Legacy save resumes');click('#notebook');ok(!$('#modal-content').textContent.includes('Kurierfahrt'),'Notebook without courier entry');ok(!$('#modal-content').textContent.includes('Belade den Wagen'),'Notebook without wagon entry');ok(all('.bonus-replay').length===1,'Unknown legacy bonus ids are ignored');close();{const p=JSON.parse(storage.get('im-zeichen-der-wende:bonus-v1'));ok(!['kurierfahrt','kurier','wagen'].some(x=>p.won.includes(x)),'Legacy bonus ids dropped on update');}
// Actual event entry to teacher mode via long-press timer.
$('#title').dispatchEvent(new env.window.Event('pointerdown'));env.timers.findLast(t=>t.t===5000).f();ok($('#modal-title').textContent==='Lehrkraftmodus','Long-press entry');const checkbox=all('.teacher-grid input')[0];checkbox.checked=false;checkbox.onchange();ok(!state().solved.includes('conflict')&&!state().seals.includes('Konflikt'),'Teacher unsolve removes seal');textButton('Alle sechs Siegel geben');ok(state().seals.length===6,'Teacher all seals');textButton('Finale direkt testen');ok(state().scene==='basilica','Teacher finale');
close();$('#title').dispatchEvent(new env.window.Event('pointerdown'));env.timers.findLast(t=>t.t===5000).f();textButton('Spielstand löschen');textButton('Neues Spiel starten');ok(state().solved.length===0&&state().inventory.length===0&&state().notes.length===0,'New game clears state');ok(state().unlocked.length===3,'New game relocks');
// Corrupt storage must not crash startup.
env=boot('{broken');ok($('#modal-title').textContent==='Im Zeichen der Wende','Corrupt storage recovery');
ok(!$('#modal-content').textContent.includes('Klasse 7 · geplant'),'Student introduction contains no organizational paragraph');ok(!!$('#fullscreen'),'Fullscreen control exists');
console.log(JSON.stringify({status:'PASS',checks,puzzles:12,scenes:11,covered:['natural full playthrough','explore before puzzle unlocks','minigame integration (stub)','bonus games unlocked by puzzles','negative gates','partial resume','localStorage reload','three hint levels','inventory combination','311 event','six seals','own reasoning persistence','teacher long press','teacher unsolve','teacher finale','reset','corrupt save recovery'],notCovered:['physical iPad touch','Safari rendering','real 35–45 minute classroom duration']},null,2));

// Verify the distinct fullscreen branches, including failure handling and Escape.
(async()=>{
 env=boot();let calls=0;
 env.document.documentElement.requestFullscreen=async()=>{calls++;env.document.fullscreenElement=env.document.documentElement;};
 env.document.exitFullscreen=async()=>{calls++;env.document.fullscreenElement=null;};
 await $('#fullscreen').onclick();ok(calls===1&&$('#fullscreen').getAttribute('aria-pressed')==='true','Native fullscreen enters');
 await $('#fullscreen').onclick();ok(calls===2&&$('#fullscreen').getAttribute('aria-pressed')==='false','Native fullscreen exits');
 delete env.document.documentElement.requestFullscreen;
 await $('#fullscreen').onclick();ok(env.document.body.classList.contains('focus-mode'),'Unsupported native API maximizes view');
 const escape=new env.window.Event('keydown');escape.key='Escape';env.document.dispatchEvent(escape);ok(!env.document.body.classList.contains('focus-mode'),'Escape leaves fallback');
 env.document.documentElement.requestFullscreen=async()=>{throw new Error('Denied by test browser');};
 await $('#fullscreen').onclick();ok($('#toast').textContent.includes('erlaubt Vollbild hier nicht'),'Fullscreen rejection explained');
 ok($('#fullscreen').getAttribute('aria-pressed')==='false','Rejected fullscreen never claims success');
 console.log(JSON.stringify({fullscreen:'PASS',totalChecks:checks}));
})().catch(error=>{console.error(error);process.exitCode=1;});
