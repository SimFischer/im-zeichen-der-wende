/* Die Argumentationsbrücke (argbridge.js): drei Phasen, fachliche Rückmeldung, kein Freitext.
   Run: npm install --no-save linkedom; node tests/argbridge.cjs */
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom'),root=path.resolve(__dirname,'..');
let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++;};
function boot(mutate){
 const {window}=parseHTML('<!doctype html><html lang="de"><body><div id="work"></div></body></html>');
 const timers=[],wins=[],choices=[];window.HTMLElement.prototype.focus=function(){};
 window.document.addEventListener('minigame-win',e=>wins.push(e.detail));window.document.addEventListener('minigame-choice',e=>choices.push(e.detail));
 const ctx={window,document:window.document,console,CustomEvent:window.CustomEvent,setTimeout:(f)=>{timers.push(f);return timers.length;},clearTimeout(){}};
 vm.createContext(ctx);for(const f of ['data/game-data.js','argbridge.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
 const G=window.GAME;mutate?.(G);const work=window.document.querySelector('#work');
 const flush=()=>{while(timers.length)timers.shift()();};
 return {window,G,work,wins,choices,flush,$:s=>work.querySelector(s),all:s=>[...work.querySelectorAll(s)]};
}
const txt=el=>el.textContent.replace(/\s+/g,' ').trim();

/* Inhalt */
{const {G}=boot();const c=G.minigames.bridge;
 ok(c.type==='argbridge'&&c.title==='Die Argumentationsbrücke','Bridge uses the new scene game');
 ok(c.prompt.length<120&&!/Formuliere|Textfeld|eigene Begründung/.test(c.prompt),'Short prompt without free-text instruction');
 ok(G.steps.bridge.length===1&&G.steps.bridge[0].length<140,'One short explanation sentence');
 ok(c.arches.map(a=>a.head).join('|')==='Vor Konstantin …|Ab 311/313 …|Unter Konstantin …|Deshalb spricht man von einer Wende, weil …','Four arches with the four sentence starts');
 c.arches.forEach(a=>{ok(a.right&&a.wrong.length===2,'One right, two wrong plates: '+a.head);[a.right,...a.wrong].forEach(o=>{ok(o.why&&o.why.length>20&&!/^\s*falsch/i.test(o.why),'Subject feedback: '+o.text);ok(c.icons.includes(o.icon),'Symbol medallion: '+o.text);});});
 ok(/zeitweise/.test(c.arches[0].right.text)&&/grundlegend/.test(c.arches[1].right.text)&&/abgesichert und gezielt gefördert/.test(c.arches[2].right.text)&&/von zeitweiliger Verfolgung zu Absicherung und Förderung/.test(c.arches[3].right.text),'Core insight kept in the four right plates');
 const S=c.simplify.items;ok(S.filter(x=>x.simple).length===4&&S.filter(x=>!x.simple).length===2,'Four oversimplifications and two sound statements');
 for(const t of ['immer und überall','sofort die einzige Religion','Alle anderen Religionen wurden sofort verboten','innere Motive ganz sicher'])ok(S.some(x=>x.simple&&x.text.includes(t)),'Oversimplification present: '+t);
 const F=c.final.options;ok(F.length===4&&F.filter(o=>o.ok).length===1,'Final: four inscriptions, one best');
 ok(/zeitweiliger Verfolgung hin zu rechtlicher Absicherung und gezielter Förderung/.test(F.find(o=>o.ok).text),'Best inscription states the target insight');
 ok(G.puzzles.bridge.reasons.options===F,'Notebook/classic version use the same inscriptions');
 ok(c.art.dir==='assets/minigames/argument-bridge/'&&['argument-bridge-scene.png','argument-bridge-segments.png','argument-bridge-tokens.png','argument-bridge-icons.png'].every(f=>Object.values(c.art).includes(f)),'Asset paths prepared');
}

/* Durchlauf */
{const {G,work,wins,choices,flush,$,all,window}=boot();const c=G.minigames.bridge;
 ok(window.MiniGames.argbridge('bridge',c,work)===true,'Scene game renders');
 const game=$('.argbridge-game');ok(game&&$('.ab-bridge-art')&&all('.ab-arch').length===4&&all('.ab-head').length===4&&all('.ab-opening').length===4,'Bridge with four arches, heads and openings');
 ok(!all('textarea,input').length,'No text field');
 ok(!/argument-bridge/.test(work.innerHTML),'No asset requested while none is registered');
 ok(/v3-basilica/.test(fs.readFileSync(path.join(root,'argbridge.css'),'utf8')),'Basilica as backdrop');
 for(let i=0;i<4;i++){
  ok(game.__debug.phase()==='arches'&&game.__debug.arch()===i,'Arch '+(i+1)+' active');
  ok($('.ab-arch[data-arch="'+i+'"]').classList.contains('active')&&$('.ab-head[data-head="'+i+'"]').classList.contains('active'),'Active arch highlighted '+(i+1));
  ok(all('.ab-plate').length===3,'Only three plates at a time');ok(txt($('.ab-ask')).includes(c.arches[i].head),'Tray names the sentence start');
  const wrong=$('.ab-plate[data-ok="false"]');const wt=txt(wrong.querySelector('.ab-plate-text'));wrong.click();
  ok(wrong.classList.contains('cracked')&&wrong.disabled&&wrong.querySelector('.ab-crack'),'Wrong plate cracks');
  ok(txt($('.ab-voice'))===c.arches[i].wrong.find(w=>w.text===wt).why&&$('.ab-voice').classList.contains('hint'),'Wrong plate: short subject feedback, no harsh error');
  ok(!$('.ab-arch[data-arch="'+i+'"]').classList.contains('built'),'Arch not built by a wrong plate');
  $('.ab-plate[data-ok="true"]').click();
  ok($('.ab-arch[data-arch="'+i+'"]').classList.contains('built')&&$('.ab-opening[data-opening="'+i+'"] .ab-set'),'Arch '+(i+1)+' locks in with its plate');
  ok(txt($('.ab-voice'))===c.arches[i].right.why,'Short confirmation '+(i+1));
  flush();
 }
 ok(game.__debug.phase()==='simplify'&&game.classList.contains('bridge-built'),'Phase B after four arches');
 const S=c.simplify.items;const sound=all('.ab-plaque').find(b=>!S[+b.dataset.k].simple);sound.click();
 ok(sound.classList.contains('sound')&&!sound.classList.contains('simple')&&game.__debug.found()===0,'Sound statement is not counted as oversimplification');
 all('.ab-plaque').filter(b=>S[+b.dataset.k].simple).forEach((b,n)=>{b.click();ok(b.classList.contains('simple')&&txt(b.querySelector('.ab-mark'))==='zu einfach','Marked as too simple');ok(txt($('.ab-voice')).startsWith('Richtig erkannt: Diese Aussage klingt plausibel, greift die Entwicklung aber zu simpel auf.'),'Feedback for marked simplification');ok(all('.ab-count i.on').length===n+1,'Counter');});
 flush();ok(game.__debug.phase()==='final'&&all('.ab-tablet').length===4,'Phase C: four inscriptions');
 const F=c.final.options;const bad=all('.ab-tablet').find(b=>!F[+b.dataset.k].ok);bad.click();
 ok(bad.classList.contains('cracked')&&txt($('.ab-voice'))===F[+bad.dataset.k].why&&!choices.length,'Wrong inscription: feedback, nothing saved');
 all('.ab-tablet').find(b=>F[+b.dataset.k].ok).click();
 ok(!$('.ab-inscription').hidden&&txt($('.ab-inscription'))===F.find(o=>o.ok).text&&game.classList.contains('inscribed'),'Inscription carved into the bridge');
 ok(choices.length===1&&choices[0].id==='bridge'&&choices[0].text===F.find(o=>o.ok).text,'Chosen inscription reported for the notebook');
 ok(!wins.length,'Not solved before the inscription has settled');flush();
 ok(game.__debug.phase()==='done'&&!$('.sg-finale'),'Completion starts the chronicle finale directly');
 ok(wins.length===1&&wins[0]==='bridge','Win reported once');
}

/* Registrierte Grafiken werden verwendet */
{const {G,work,window,$}=boot(G=>{G.minigames.bridge.art.available=['scene','icons'];});
 window.MiniGames.argbridge('bridge',G.minigames.bridge,work);const g=$('.argbridge-game');
 ok(g.classList.contains('art-scene')&&g.classList.contains('art-icons')&&!g.classList.contains('art-segments'),'Only registered art switches on');
 ok(/argument-bridge-scene\.png/.test(g.getAttribute('style'))&&/argument-bridge-icons\.png/.test(g.getAttribute('style')),'Asset paths used');
 ok($('.ab-icon-art')&&!$('.ab-plate svg.ab-icon'),'Icon sheet replaces drawn medallions');
}
console.log(`PASS: Argumentationsbrücke – ${checks} Prüfungen`);
