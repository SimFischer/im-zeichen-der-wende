// Run: npm install --no-save linkedom; node tests/bonus-unlocks.cjs
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom'),root=path.resolve(__dirname,'..');
const {window}=parseHTML('<html><body><dialog id="modal"></dialog><div id="journal"></div></body></html>');
window.HTMLElement.prototype.focus=function(){};
const storage=new Map();let opened=0;
window.WendeUI={open:(title,html)=>{opened++;window.document.querySelector('#modal').innerHTML=html;},close(){}};
const ctx={window,document:window.document,console,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout,clearTimeout,clearInterval,matchMedia:()=>({matches:true})};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(root+'/bonusgames.js','utf8'),ctx);
for(const f of fs.readdirSync(root+'/bonus').filter(f=>f.endsWith('.js')))vm.runInContext(fs.readFileSync(root+'/bonus/'+f,'utf8'),ctx);
const B=window.BonusGames,journal=window.document.querySelector('#journal');
const milestones=['conflict','sources','cases','archive','map312','vision','change','bridge'];
const games=['zeichen','rombrennt','amphoren','katakomben','schildwall','tiber','wagen','circus'];
for(let n=0;n<=8;n++){
 B.update({solved:milestones.slice(0,n)});journal.innerHTML=B.journalHtml();
 assert.equal(journal.querySelectorAll('.bonus-replay').length,n);
 assert.equal(journal.querySelectorAll('.bonus-unknown').length,8-n);
 for(let k=n;k<8;k++){const before=opened;B.start(games[k]);assert.equal(opened,before,'Locked game cannot start');}
}
B.update({solved:['sources']});journal.innerHTML=B.journalHtml();assert.equal(journal.querySelector('.bonus-replay').dataset.bonusStart,'rombrennt','Free choice of early chapters');
// Exercise the journal click and real common game window without invoking a canvas game.
B.games.rombrennt.setup=()=>({});B.bindJournal(journal);journal.querySelector('.bonus-replay').click();assert.equal(opened,1);assert.ok(window.document.querySelector('.bonus-introcard'));
B.reset();B.update({solved:[]});journal.innerHTML=B.journalHtml();assert.equal(journal.querySelectorAll('.bonus-unknown').length,8);
assert.equal(B.decorate,undefined,'No scene discovery entry point');
console.log('PASS: eight milestones, locked start protection, journal launch and fresh-game reset');
