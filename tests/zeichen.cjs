/* Bonusspiel „Das geheime Zeichen“: Szene, vier Runden, Rückmeldungen, kein Freitext, eigener Fortschritt.
   Run: npm install --no-save linkedom; node tests/zeichen.cjs */
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom'),root=path.resolve(__dirname,'..');
let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++;};
function boot(avail){
 const {window}=parseHTML('<html><body><dialog id="modal"></dialog></body></html>');
 window.HTMLElement.prototype.focus=function(){};
 const storage=new Map(),timers=[];
 window.WendeUI={open:(t,html)=>{window.document.querySelector('#modal').innerHTML=html;},close(){}};
 const ctx={window,document:window.document,console,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},requestAnimationFrame:()=>1,cancelAnimationFrame(){},
  setTimeout:f=>{timers.push(f);return timers.length;},clearTimeout(){},setInterval:()=>0,clearInterval(){},matchMedia:()=>({matches:false}),ResizeObserver:class{observe(){}disconnect(){}}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(root+'/bonusgames.js','utf8'),ctx);vm.runInContext(fs.readFileSync(root+'/bonus/zeichen.js','utf8'),ctx);
 const B=window.BonusGames;if(avail)B.games.zeichen.art.available=avail;
 B.update({solved:['conflict']});B.start('zeichen',true);
 const $=s=>window.document.querySelector(s),all=s=>[...window.document.querySelectorAll(s)];
 const flush=()=>{while(timers.length)timers.shift()();};
 return {window,B,$,all,flush,storage};
}
const txt=el=>el.textContent.replace(/\s+/g,' ').trim();

const {B,$,all,flush,storage}=boot();
const game=B.games.zeichen;
ok(game.title==='Das geheime Zeichen','Game registered');
const src=fs.readFileSync(root+'/bonus/zeichen.js','utf8');
ok(!/leute\.webp/.test(src)&&!/drawSprite|walkers|crosser/.test(src),'No small walking sprite figures any more');
ok(!all('#modal textarea,#modal input').length,'No text input');
$('.bonus-introcard .primary').click();
const stage=$('.bonus-stage'),dbg=stage.__debug;
ok($('.zs-scene img.zs-bg').getAttribute('src')==='assets/backgrounds/v3-forum.png','Transition scene: forum painting with figures in the picture');
ok(/Chronistin/.test($('.zs-bg').getAttribute('alt'))&&/rotem Mantel/.test($('.zs-bg').getAttribute('alt')),'Figures described as part of the scene');
ok(!all('.zs-overlay').length&&!/secret-signs/.test($('.zs-root').innerHTML),'No missing asset requested');
// Runde 1
ok(dbg.round()===1&&dbg.phase()==='intro','Round 1: introduction');
ok(/Zeichen, um sich zu erkennen/.test(txt($('.zs-say'))),'Guide explains the purpose');
ok(all('.zs-board .zs-slot').length===3&&all('.zs-slot small').map(txt).join()==='Fisch,Anker,Taube','Wooden board shows three target signs');
ok(!all('.zs-mark').length,'Nothing to tap before the search starts');
$('.zs-go .primary').click();
// Runde 2
ok(dbg.round()===2&&dbg.phase()==='search','Round 2: search');
const marks=all('.zs-mark');ok(marks.length===3&&!marks.some(m=>m.classList.contains('shown')),'Three embedded signs, not highlighted');
const lay=dbg.layout;ok(lay.slots.length>=12&&new Set(lay.slots.map(s=>s.m)).size>=6,'Many places with different materials (wood, stone, cloth, clay, lamp, wax tablet)');
dbg.placed().forEach((p,k)=>{const s=lay.slots[p.slot];ok(marks[k].style.left===s.x+'%'&&marks[k].classList.contains('m-'+s.m),'Sign placed on '+s.on);});
ok(/width:8\.6%;min-width:60px/.test(fs.readFileSync(root+'/bonusgames.css','utf8')),'Generous touch targets (≥ 60 px)');
marks.forEach((m,i)=>{m.click();ok(m.classList.contains('found')&&m.disabled,'Found '+m.dataset.name);ok(all('.zs-slot.got').length===i+1,'Board fills up');ok(/Gut entdeckt/.test(txt($('.zs-say'))),'Short confirmation');});
flush();
// Runde 3
ok(dbg.round()===3&&dbg.phase()==='judge','Round 3: Christian or just similar');
const r3=all('.zs-mark');ok(r3.length===7&&r3.every(m=>m.classList.contains('shown')),'Seven visible signs');
ok(['Adler','Lorbeer','Rosette'].every(n=>r3.some(m=>m.dataset.name===n)),'Non-Christian look-alikes present');
const eagle=r3.find(m=>m.dataset.name==='Adler');eagle.click();
ok(eagle.classList.contains('other')&&/römischen Legionen/.test(txt($('.zs-say')))&&$('.zs-bubble').classList.contains('hint'),'Subtle, subject feedback for a non-Christian sign');
ok(!/^Falsch/.test(txt($('.zs-say'))),'No bare "Falsch"');
['Fisch','Anker','Taube','Chi-Rho'].forEach((n,i)=>{r3.find(m=>m.dataset.name===n).click();ok(all('.zs-seal.got').length===i+1,'Counted: '+n);});
ok(/Konstantin/.test(txt($('.zs-say'))),'Chi-Rho explained as used openly mainly from Constantine on');
flush();
// Runde 4
ok(dbg.round()===4&&dbg.phase()==='question','Round 4: final question');
ok(/Warum waren solche Zeichen hilfreich/.test(txt($('.zs-say'))),'Guide asks why');
const ans=all('.zs-answer');ok(ans.length===4&&!all('#modal textarea,#modal input').length,'Four choices, no free text');
const wrong=ans.find(b=>/Staatsreligion/.test(b.textContent));wrong.click();
ok(wrong.classList.contains('tried')&&/Ende des 4. Jahrhunderts/.test(txt($('.zs-say'))),'Wrong answer: explanation');
ok(!B.progress().won.includes('zeichen'),'Not won yet');
ans.find(b=>/ohne immer offen aufzutreten/.test(b.textContent)).click();flush();
ok(B.progress().won.includes('zeichen')&&/entschlüsselt/.test(txt($('.bonus-endcard'))),'Win saved in bonus progress');
ok(!storage.has('im-zeichen-der-wende:v1'),'Main game save untouched');

/* Neue Grafiken werden verwendet, sobald sie eingetragen sind */
{const {$}=boot(['scene','characters','symbols','panel']);$('.bonus-introcard .primary').click();$('.zs-go .primary').click();
 ok($('.zs-bg').getAttribute('src')==='assets/bonus/secret-signs/secret-signs-scene.png','New scene used when available');
 ok($('.zs-overlay[src="assets/bonus/secret-signs/secret-signs-characters.png"]'),'Character layer used when available');
 ok($('.zs-root').classList.contains('art-panel')&&$('.zs-mark .zs-sheet'),'Panel and symbol sheet switch on');}
console.log(`PASS: Das geheime Zeichen – ${checks} Prüfungen`);
