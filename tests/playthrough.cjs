/* Run: npm install --no-save linkedom; node tests/playthrough.cjs
   DOM integration tests; no claim to emulate Safari or physical touch. */
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const {parseHTML}=require(process.env.WENDE_TEST_DOM||'linkedom');
const root=path.resolve(__dirname,'..'), KEY='im-zeichen-der-wende:v1';
const storage=new Map();let checks=0;
function boot(raw){if(raw!==undefined)storage.set(KEY,raw);const {window}=parseHTML(fs.readFileSync(path.join(root,'index.html'),'utf8'));const document=window.document;
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 document.querySelector('#modal').showModal=function(){this.open=true;};document.querySelector('#modal').close=function(){this.open=false;};
 window.HTMLElement.prototype.focus=function(){};window.HTMLElement.prototype.scrollIntoView=function(){};
 const timers=[];const context={window,document,localStorage,console,Blob,URL,setTimeout:(f,t)=>{timers.push({f,t});return timers.length;},clearTimeout:()=>{}};vm.createContext(context);
 for(const f of ['data/game-data.js','script.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context,{filename:f});
 return {window,document,timers};}
let env=boot();const $=s=>env.document.querySelector(s), all=s=>[...env.document.querySelectorAll(s)], state=()=>JSON.parse(storage.get(KEY));
function ok(v,msg){assert.ok(v,msg);checks++;}
function click(selector){const n=$(selector);ok(n,'Element exists: '+selector);if(n.disabled)throw Error('Disabled '+selector);n.click();}
function textButton(text,scope='#modal-content'){const b=all(scope+' button').find(n=>n.textContent===text);ok(b,'Button exists: '+text);ok(!b.disabled,'Enabled: '+text);b.click();}
function close(){click('#close');}
function travel(id){click('#map');const name=env.window.GAME.scenes.find(s=>s.id===id).name;const b=all('.map-place').find(n=>n.querySelector('strong').textContent===name);ok(b&&!b.disabled,'Reachable '+id);b.click();if($('#modal').open&&$('#modal-title').textContent===name)close();ok(state().scene===id,'Scene entered '+id);}
function spot(id){click('[data-hotspot="'+id+'"]');}
function solve(id){const p=env.window.GAME.puzzles[id];ok($('#modal-title').textContent===p.title,'Puzzle opened '+id);
 if(p.type==='gears'){p.rows.forEach((r,i)=>{for(let j=0;j<=r.answer[0];j++)all('.gear button')[i].click();});}
 else p.rows.forEach((r,i)=>{textButton(r.options[r.answer[0]],'.rack');click('#slot-'+i);});
 if($('#reason')){$('#reason').value='Glaube kann die Förderung erklären. Politische Einheit und Stabilität können zugleich eine Rolle spielen.';$('#reason').oninput();}
 textButton(p.type==='balance'?'Einordnung reflektieren':'Mechanismus prüfen');if(p.type==='balance')textButton('Ich habe meine Begründung geprüft – Siegel nehmen');ok(state().solved.includes(id),'Solved '+id);if($('#modal').open)close();}
textButton('Die Stadt betreten');close();spot('flint');ok(state().inventory.includes('flint'),'Take flint');
click('#map');ok(all('.map-place').filter(n=>!n.disabled).length===3,'Only initial three places');close();
travel('house');spot('lamp');spot('conflict');textButton('Mechanismus prüfen');ok(!state().solved.includes('conflict'),'Incomplete puzzle blocked');click('#puzzle-hint');ok($('#hint-box').textContent.includes('1/3'),'First staged hint');click('#puzzle-hint');click('#puzzle-hint');click('#puzzle-hint');ok($('#hint-box').textContent.includes('3/3'),'Hints capped');solve('conflict');
travel('forum');spot('sources');textButton('unsicher','.rack');for(let i=0;i<5;i++)click('#slot-'+i);textButton('Mechanismus prüfen');ok(!state().solved.includes('sources'),'Wrong source assignments blocked');ok($('#feedback').textContent.includes('Quellenproblem'),'Explanatory feedback');close();
env=boot();textButton('Spiel fortsetzen');ok(state().scene==='forum','Resume scene');spot('sources');ok(all('.slot .filled').length===5,'Partial drafts restored');solve('sources');
travel('office');spot('cases');solve('cases');travel('temple');spot('sacrifice');solve('sacrifice');
// Archive requires key selection; first map attempt only explains lock.
click('#map');all('.map-place').find(n=>n.querySelector('strong').textContent==='Diokletians Archiv').click();ok(state().scene==='temple','Archive does not open without selected key');textButton('Archivschlüssel','#inventory');travel('archive');spot('scroll');ok($('#modal-title').textContent==='Zu dunkel','Darkness blocks evidence');close();
click('#inventory-toggle');textButton('Öllampe','#inventory');textButton('Feuerstein','#inventory');ok(state().inventory.includes('light'),'Lamp combination');ok(!state().inventory.includes('lamp'),'Combination consumes lamp');click('#inventory-toggle');
spot('archive');ok(!state().solved.includes('archive'),'Archive requires evidence');close();for(const id of ['scroll','door','church','chain']){spot(id);close();}spot('archive');solve('archive');ok(state().flags.galerius,'311 event fired');ok(state().notes.includes('galerius'),'311 journal');
travel('house');ok($('#era').textContent.includes('wieder offen'),'House visibly reopened');travel('camp');spot('vision');ok($('#modal-title').textContent==='Hier fehlt noch etwas','Tent locked before map');close();spot('map312');solve('map312');spot('vision');solve('vision');travel('city');spot('change');solve('change');travel('motives');spot('motives');solve('motives');ok(state().seals.length===6,'Six unique seals');travel('council');spot('council');solve('council');travel('basilica');spot('timeline');ok($('#modal-title').textContent==='Hier fehlt noch etwas','Final requires placed seals');close();spot('finalgate');close();spot('bridge');ok($('#modal-title').textContent==='Hier fehlt noch etwas','Bridge gated by timeline');close();spot('timeline');solve('timeline');spot('bridge');solve('bridge');ok(state().flags.finished,'Finale reached naturally');ok(state().solved.length===12,'All 12 puzzles solved');
click('#notebook');ok($('#modal-content').textContent.includes('Deine Begründung'),'Own reasoning in notebook');close();
env=boot();textButton('Spiel fortsetzen');ok(state().flags.finished&&state().seals.length===6,'Completed save reload');
// Actual event entry to teacher mode via long-press timer.
$('#title').dispatchEvent(new env.window.Event('pointerdown'));env.timers.findLast(t=>t.t===5000).f();ok($('#modal-title').textContent==='Lehrkraftmodus','Long-press entry');const checkbox=all('.teacher-grid input')[0];checkbox.checked=false;checkbox.onchange();ok(!state().solved.includes('conflict')&&!state().seals.includes('Konflikt'),'Teacher unsolve removes seal');textButton('Alle sechs Siegel geben');ok(state().seals.length===6,'Teacher all seals');textButton('Finale direkt testen');ok(state().scene==='basilica','Teacher finale');
close();$('#title').dispatchEvent(new env.window.Event('pointerdown'));env.timers.findLast(t=>t.t===5000).f();textButton('Spielstand löschen');textButton('Neues Spiel starten');ok(state().solved.length===0&&state().inventory.length===0&&state().notes.length===0,'New game clears state');ok(state().unlocked.length===3,'New game relocks');
// Corrupt storage must not crash startup.
env=boot('{broken');ok($('#modal-title').textContent==='Im Zeichen der Wende','Corrupt storage recovery');
console.log(JSON.stringify({status:'PASS',checks,puzzles:12,scenes:11,covered:['natural full playthrough','negative gates','partial resume','localStorage reload','three hint levels','inventory combination','311 event','six seals','own reasoning persistence','teacher long press','teacher unsolve','teacher finale','reset','corrupt save recovery'],notCovered:['physical iPad touch','Safari rendering','real 35–45 minute classroom duration']},null,2));
