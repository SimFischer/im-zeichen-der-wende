const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom'),root=path.resolve(__dirname,'..');
const {window}=parseHTML('<dialog id="modal"><div id="work"></div></dialog>'),document=window.document;
const timers=new Map(),frames=new Map(),observers=new Set(),keys=new Set();let next=0,checks=0;
const check=(v,msg)=>{assert.ok(v,msg);checks++;};
window.setTimeout=(fn)=>{timers.set(++next,fn);return next;};window.clearTimeout=id=>timers.delete(id);
window.requestAnimationFrame=fn=>{frames.set(++next,fn);return next;};window.cancelAnimationFrame=id=>frames.delete(id);
// Initialize linkedom's event target before replacing its listener methods.
window.addEventListener('test-init',()=>{});
window.addEventListener=(type,fn)=>{if(type==='keydown')keys.add(fn);};window.removeEventListener=(type,fn)=>keys.delete(fn);
window.ResizeObserver=class {constructor(){observers.add(this);}observe(){}disconnect(){observers.delete(this);}};
window.HTMLElement.prototype.focus=function(){};
window.HTMLCanvasElement.prototype.getContext=()=>({});
const ctx={window,document,console,matchMedia:()=>({matches:false,addEventListener(){},removeEventListener(){}}),setTimeout:window.setTimeout,clearTimeout:window.clearTimeout,performance:{now:()=>0}};vm.createContext(ctx);
for(const f of ['data/game-data.js','chronicle.js','minigames.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
const G=window.GAME,work=document.querySelector('#work');
for(let i=0;i<3;i++){
 window.MiniGames.classify('sources',G.minigames.sources,work);check(frames.size===1&&keys.size===1,'one animation and one key listener per opening');
 const stale=[...frames.values()][0];window.MiniGames.stop();check(!frames.size&&!keys.size&&!timers.size,'close clears global resources');stale(100);check(!frames.size,'stale frame cannot revive a loop');
}
window.MiniGames.darkroom('archive',G.minigames.archive,work);check(observers.size===1,'archive observes size');window.MiniGames.stop();check(!observers.size&&!frames.size,'archive observer disconnected');
window.MiniGames.lock('conflict',G.minigames.conflict,work);
for(const [i,r] of G.minigames.conflict.rings.entries()){const el=work.querySelectorAll('.ring')[i];while(el.getAttribute('aria-valuetext')!==r.options[r.answer])work.querySelector(`.down[data-i="${i}"]`).click();}
work.querySelector('.door-handle').click();check(timers.size>=2,'door schedules finite animations');window.MiniGames.stop();check(!timers.size,'door timers cancelled on close');
const p=G.puzzles.timeline,d={values:p.rows.map(()=>null),reason:''},flags={};let saved=0;
let stop=window.Chronicle.timeline({p,d,work,flags,save:()=>saved++,onComplete(){},onJournal(){}});
const put=(value,slot)=>{work.querySelector(`[data-event="${value}"]`).click();work.querySelector('#slot-'+slot).click();};
put(0,0);window.Chronicle.checkTimeline();check(flags.timelineAttempts[0]===1,'first wrong attempt belongs to element');stop();
stop=window.Chronicle.timeline({p,d,work,flags,save:()=>saved++,onComplete(){},onJournal(){}});put(0,1);window.Chronicle.checkTimeline();check(flags.timelineAttempts[0]===2,'second attempt survives reopen and movement');check(work.querySelector('[data-ring="1"] .ring-feedback').textContent.includes('Notizbuch'),'second attempt gives no answer');
put(p.rows[0].answer[0],0);window.Chronicle.checkTimeline();check(flags.timelineLocks.includes(0),'correct partial answer locks');stop();
stop=window.Chronicle.timeline({p,d,work,flags,save:()=>saved++,onComplete(){},onJournal(){}});check(work.querySelector('#slot-0').disabled,'locked partial answer survives reopen');check(d.values[1]===0,'unsolved draft survives');stop();
let completed=0;const args={p,d,work,cfg:G.minigames.timeline,flags,save:()=>saved++,onComplete:()=>completed++,onJournal(){}};
stop=window.Chronicle.timeline(args);
p.rows.forEach((r,i)=>{if(!flags.timelineLocks.includes(i))put(r.answer[0],i);});window.Chronicle.checkTimeline();
check(flags.timelineLocks.length===6&&work.querySelector('.timeline-continue').hidden,'All rings lock but the existing transfer question remains required');
work.querySelector('[data-gap="3"]').click();check(!flags.timelineTransfer&&!completed,'Wrong transfer cannot complete the puzzle');
check(!work.querySelector('.transfer-feedback').textContent.includes('303'),'Wrong transfer does not give the correct interval');stop();
stop=window.Chronicle.timeline(args);check(!!work.querySelector('.machine-transfer'),'Transfer resumes after reopen');
work.querySelector('[data-gap="0"]').click();check(flags.timelineTransfer,'Correct transfer persists');
for(const [id,fn] of [...timers]){timers.delete(id);fn();}work.querySelector('.timeline-continue').click();check(completed===1,'Completion after machine and transfer');stop();
for(const f of ['scenegames.js','argbridge.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
window.MiniGames.konzil('council',G.minigames.council,work);work.querySelector('.council-answer[data-i="'+G.minigames.council.rounds[0].options.findIndex(o=>o.ok)+'"]').click();check(timers.size>0,'Council schedules its next round');window.MiniGames.stop();check(!timers.size,'Closing a scene game clears its timers');
window.MiniGames.argbridge('bridge',G.minigames.bridge,work);work.querySelector('.ab-plate[data-ok="true"]').click();check(timers.size>0,'Bridge schedules its next arch');window.MiniGames.stop();check(!timers.size,'Closing the bridge clears its timers');
let seen=0;const endArgs={root:work,seals:G.seals.map(n=>'<span>'+n+'</span>'),replay:true,onSeen:()=>seen++,onExplore(){},onReset(){}};
stop=window.Chronicle.finale(endArgs);check(timers.size>0,'finale starts one finite schedule');window.Chronicle.finish();window.Chronicle.finish();check(seen===1&&!timers.size,'skip is idempotent and cancels timers');stop();
stop=window.Chronicle.finale(endArgs);stop();check(!timers.size,'interrupted finale leaves no timers');
console.log('PASS: '+checks+' timer, listener, observer, draft, lock, feedback and finale lifecycle checks');
