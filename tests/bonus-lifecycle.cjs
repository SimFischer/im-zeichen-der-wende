// Real registered game setups, DOM inputs and common lifecycle; canvas painting is stubbed.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),{parseHTML}=require('linkedom');
const {window}=parseHTML('<html><body><dialog id="modal"><div id="content"></div></dialog></body></html>');
const doc=window.document,storage=new Map(),rafs=new Map(),timers=new Map();let serial=0,now=0;
window.HTMLElement.prototype.focus=function(){};window.HTMLElement.prototype.getBoundingClientRect=()=>({width:900,height:550,left:0,top:0});
const gradient={addColorStop(){}};const g=new Proxy({measureText:()=>({width:20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,createPattern:()=>({})},{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});
const create=doc.createElement.bind(doc);doc.createElement=n=>{const el=create(n);if(n==='canvas')el.getContext=()=>g;return el;};
window.WendeUI={open(title,html){doc.querySelector('#modal').innerHTML=html;},close(){window.BonusGames.stop();doc.querySelector('#modal').innerHTML='';}};
const env={window,document:doc,console,performance:{now:()=>now},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},matchMedia:()=>({matches:true}),ResizeObserver:class{observe(){ }disconnect(){}},requestAnimationFrame:f=>{const id=++serial;rafs.set(id,f);return id;},cancelAnimationFrame:id=>rafs.delete(id),setTimeout:(f,ms)=>{const id=++serial;timers.set(id,{f,t:now+ms});return id;},clearTimeout:id=>timers.delete(id),setInterval:()=>0,clearInterval(){}};
vm.createContext(env);vm.runInContext(fs.readFileSync('bonusgames.js','utf8'),env);for(const id of ['zeichen','tiber','katakomben','circus','bilder'])vm.runInContext(fs.readFileSync('bonus/'+id+'.js','utf8'),env);
window.BonusArt={draw(){}};const B=window.BonusGames;B.update({solved:['conflict','archive','vision','change','bridge','motives','council']});
const $=s=>doc.querySelector(s),click=s=>{const b=$(s);assert(b&&!b.disabled,'enabled control '+s);b.click();};
function frame(){now+=50;const queue=[...rafs];rafs.clear();queue.forEach(([,f])=>f(now));for(const [id,t]of [...timers])if(t.t<=now){timers.delete(id);t.f();}}
function start(id){delete window.BonusArt;B.start(id);window.BonusArt={draw(){}};click('.bonus-introcard .primary');frame();}
function close(id){window.WendeUI.close();assert.equal(rafs.size,0,'no animation left after close');assert.equal(timers.size,0,'no timers left after close');delete window.BonusArt;B.start(id);window.BonusArt={draw(){}};assert($('.bonus-introcard'));window.WendeUI.close();}
start('zeichen');
assert.equal(doc.querySelectorAll('.code-board img').length,1,'only the original board, no duplicated symbols');
assert.equal(doc.querySelectorAll('.code-symbol img,.code-effect').length,0,'no symbol or centre image overlay');
assert.equal($('.code-board').children.length,5,'board and four transparent hit areas only');

click('.bonus-pause');const pausedStatus=$('.code-status').textContent;for(let i=0;i<30;i++)frame();assert.equal($('.code-status').textContent,pausedStatus);click('.bonus-pausecard .primary');
close('zeichen');start('zeichen');assert.equal($('.code-round').textContent,'Folge: 1 Zeichen');
function hear(){let seq=[],prev=-1,guard=0;while($('.code-symbol').disabled&&guard++<2000){frame();const active=$('.code-game').dataset.phase==='playback'?[...doc.querySelectorAll('.code-symbol')].findIndex(b=>b.dataset.state==='active'):-1;if(active>=0&&active!==prev)seq.push(active);prev=active;}assert(guard<2000);return seq;}
for(let n=1;n<=7;n++){const seq=hear();assert.equal(seq.length,n);for(const i of seq)click('[data-symbol="'+i+'"]');assert.equal($('.code-series').textContent,'Serie: '+n+' Zeichen');}
const seq=hear();assert.equal(seq.length,8);click('[data-symbol="'+((seq[0]+1)%4)+'"]');assert(!$('.code-result').hidden);assert.equal($('.code-result-score').textContent,'Geschafft: 7 Zeichen');assert($('.code-record-notice').textContent);const stopped=$('.code-time').textContent;for(let i=0;i<40;i++)frame();assert.equal($('.code-time').textContent,stopped);
assert.equal(storage.get('im-zeichen-der-wende:secret-code-record-v1'),'7');click('.code-restart');assert($('.code-result').hidden);assert.equal($('.code-series').textContent,'Serie: 0 Zeichen');assert.equal($('.code-time').textContent,'Zeit: 00:00');assert.equal($('.code-record').textContent,'Rekord: 7 Zeichen');
close('zeichen');start('zeichen');assert.equal($('.code-record').textContent,'Rekord: 7 Zeichen');const again=hear();click('[data-symbol="'+((again[0]+1)%4)+'"]');assert.equal($('.code-result-score').textContent,'Geschafft: 0 Zeichen');assert.equal($('.code-record-notice').textContent,'');click('.code-back');assert.equal(rafs.size,0);assert.equal(timers.size,0);
start('tiber');const twin=B.games.tiber.createModel();const advance=()=>{twin.tick(.05);frame();};
for(let row=7;row>=0;row--){let guard=0;while(row!==4&&row!==0&&!twin.support(twin.s.x,row)&&guard++<2000)advance();assert(guard<2000);click('[data-dir="up"]');twin.input('up');for(let i=0;i<3;i++)advance();}
assert($('.bonus-endcard'),'Tiber full crossing in DOM');close('tiber');
start('katakomben');const km=B.games.katakomben.createModel();
function walk(x,y){let route;const q=[[km.s.x,km.s.y,[]]],seen=new Set();while(q.length){const [a,b,path]=q.shift(),key=a+','+b;if(seen.has(key))continue;seen.add(key);if(a===x&&b===y){route=path;break;}for(const [d,dx,dy]of [['up',0,-1],['down',0,1],['left',-1,0],['right',1,0]])if(km.passable(a+dx,b+dy))q.push([a+dx,b+dy,[...path,d]]);}assert(route);for(const d of route){click('[data-dir="'+d+'"]');km.input(d);if(km.s.active!==null){const c=km.clues[km.s.active];click('[data-answer="'+((c.correct+1)%3)+'"]');assert($('.cat-feedback').textContent);click('[data-answer="'+c.correct+'"]');km.answer(c.correct);click('.cat-continue');km.resume();}}}
km.clues.forEach(c=>walk(c.x,c.y));walk(13,1);assert($('.bonus-endcard'));close('katakomben');
start('circus');for(let i=0;i<20000&&!$('.bonus-endcard');i++)frame();assert($('.bonus-endcard'),'seven complete simulated race laps');close('circus');
start('bilder');for(const id of ['schild','stadt','mosaik','konzil']){click('.bilder-pic[data-id="'+id+'"]');for(let place=0;place<9;place++){const bs=[...doc.querySelectorAll('.bilder-tile')],target=bs.findIndex(b=>b.getAttribute('aria-label').startsWith('Teil '+(place+1)+','));if(target!==place){bs[place].click();doc.querySelectorAll('.bilder-tile')[target].click();}}assert($('.bilder-done').textContent.includes('Geschafft'));}
for(let i=0;i<10;i++)frame();assert($('.bonus-endcard'));close('bilder');
assert.equal(B.progress().won.length,4);console.log('PASS all five games: DOM inputs, endless records, victories, restart/open/close, timer and animation cleanup, persistence');
