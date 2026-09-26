/* Focused DOM integration test. Run: npm install --no-save linkedom; node tests/archive-flow.cjs */
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom'),root=path.resolve(__dirname,'..'),KEY='im-zeichen-der-wende:v1';
let raw,env,checks=0;
const initial=()=>({version:1,started:true,scene:'temple',unlocked:['gate','house','forum','office','temple'],inventory:['lamp','flint','key'],solved:['conflict','sources','cases','sacrifice'],seals:[],notes:[],seen:[],evidence:[],drafts:{},hints:{},flags:{},progress:4});
function boot(s){raw=JSON.stringify(s);const {window}=parseHTML(fs.readFileSync(path.join(root,'index.html'),'utf8')),document=window.document,timers=[];
 document.querySelector('#modal').showModal=function(){this.open=true;};document.querySelector('#modal').close=function(){this.open=false;};
 window.HTMLElement.prototype.focus=function(){};window.HTMLElement.prototype.scrollIntoView=function(){};
 const ctx={window,document,console,Blob,URL,localStorage:{getItem:()=>raw,setItem:(k,v)=>raw=v},setTimeout:(f,t)=>{timers.push({f,t});return timers.length;},clearTimeout(){},matchMedia:()=>({matches:true})};vm.createContext(ctx);
 for(const f of ['data/game-data.js','adventure.js','chronicle.js','script.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
 env={window,document,timers};button('Spiel fortsetzen');
}
const $=s=>env.document.querySelector(s),state=()=>JSON.parse(raw);
function ok(v,m){assert.ok(v,m);checks++;}
function click(s){const n=$(s);assert.ok(n,s);n.click();}
function button(text,scope='#modal-content'){const n=[...env.document.querySelectorAll(scope+' button')].find(n=>n.textContent===text);assert.ok(n,text);n.click();}
function close(){click('#close');}
function map(id){click('#map');const name=env.window.GAME.scenes.find(s=>s.id===id).name;const n=[...env.document.querySelectorAll('.pm-place')].find(n=>n.querySelector('b').textContent===name);assert.ok(n&&!n.disabled,id);n.click();}
boot(initial());
ok(state().unlocked.includes('vestibule'),'Archivist opens after rope puzzle');ok(!state().unlocked.includes('archive'),'Archive awaits reading');
click('[data-exit="vestibule"]');close();ok(state().scene==='vestibule','Walk to archivist');
click('[data-hotspot="scrolls"]');ok($('#modal-title').textContent==='Der Archivar','No scrolls without handoff');
button('Schriftrollen übernehmen und lesen');ok(state().inventory.includes('scrolls'),'Handoff puts scrolls in bag');
ok(!state().flags.archiveScrollsRead,'First page is not complete reading');close();
boot(state());click('[data-hotspot="scrolls"]');button('Nächste Schriftrolle');button('Nächste Schriftrolle');button('Gelesen – zum Archiv bringen');
ok(state().flags.archiveScrollsRead,'All scrolls read');ok(state().unlocked.includes('archive'),'Reading unlocks archive');
click('[data-exit="archive"]');ok(state().scene==='vestibule','Unlit lamp blocks entry');
button('Öllampe','#inventory');button('Feuerstein','#inventory');ok(state().inventory.includes('light'),'Combine lamp and flint');
click('[data-exit="archive"]');ok(state().scene==='vestibule','Selected key required');button('Archivschlüssel','#inventory');click('[data-exit="archive"]');
ok(state().scene==='archive','Archive entry with knowledge, lamp and key');ok($('#scene').classList.contains('archive-dark'),'Archive starts dark');ok($('[data-hotspot="shelf"]').hidden,'Cannot deposit in darkness');
// Exercise the same completion event dispatched by the actual darkroom minigame.
env.document.dispatchEvent(new env.window.CustomEvent('minigame-win',{detail:'archive'}));
ok(state().solved.includes('archive'),'Puzzle solved');ok(!$('#scene').classList.contains('archive-dark'),'Light restored');ok(!state().unlocked.includes('camp'),'Camp waits for delivery');close();
boot(state());ok(!$('[data-hotspot="shelf"]').hidden,'Delivery survives reload');click('[data-hotspot="shelf"]');
ok(state().flags.archiveScrollsDeposited,'Scrolls deposited');ok(!state().inventory.includes('scrolls'),'Scrolls removed from bag');ok(state().flags.galerius,'311 event fires');ok(state().unlocked.includes('camp'),'Camp opens');ok($('#modal-content').textContent.includes('sicher auf dem Regalplatz'),'Delivery acknowledged');
close();click('#notebook');ok($('#modal-content').textContent.includes('Die große Verfolgung ab 303'),'Reading retained in notebook');close();
map('vestibule');close();click('[data-hotspot="archivist"]');ok($('#modal-content').textContent.includes('Danke'),'No duplicate delivery');close();
const legacy=initial();legacy.scene='archive';legacy.unlocked.push('archive');legacy.solved.push('archive');legacy.flags.galerius=true;boot(legacy);ok(state().flags.archiveScrollsDeposited&&state().unlocked.includes('camp'),'Completed legacy saves keep access');
const unfinished=initial();unfinished.scene='archive';unfinished.unlocked.push('archive');boot(unfinished);ok(state().scene==='vestibule','Unfinished legacy archive resumes at archivist');ok(state().inventory.includes('key'),'Legacy inventory preserved');
map('house');close();ok(!$('[data-hotspot="lamp"] .pin'),'No plus over lamp');ok($('[data-hotspot="lamp"]').textContent==='Öllampe','No redundant take caption');ok($('[data-hotspot="lamp"]').getAttribute('aria-label')==='Öllampe aufnehmen','Accessible action name');
ok(env.window.GAME.minigames.sacrifice.lines.every(l=>l.slots[0]==='Wer ist betroffen?'),'Both rope paths clarify person slot');
const scenes=env.window.GAME.scenes;for(const s of scenes){ok(fs.existsSync(path.join(root,'assets/backgrounds/v3-'+(s.art||s.id)+'.png')),'Scene art exists '+s.id);for(const exit of env.window.GAME.exits[s.id]||[])ok(scenes.some(s=>s.id===exit[0]),'Exit target exists');}
console.log('PASS: '+checks+' archive, delivery, resume, legacy-save, hotspot and scene checks');
