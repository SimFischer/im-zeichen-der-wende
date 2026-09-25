/* Quellenkritik und Begründungen: fachliche Eindeutigkeit und keine Freitext-Pflicht.
   Run: node tests/sources-and-reasons.cjs */
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++;};
const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,'data/game-data.js'),'utf8'),c);
const G=c.window.GAME,P=G.puzzles;

/* 1. Schild/Vision: Kategorien sind klar getrennt, jede Aussage hat genau eine Kategorie. */
const q=G.minigames.vision.quiz;
ok(q.choices.join('|')==='gut feststellbar|später berichtet|nicht sicher feststellbar','Three source categories');
ok(Array.isArray(q.legend)&&q.legend.length===3&&q.legend.every(t=>t.length>20),'Every category is defined for students');
for(const it of q.items){
 ok(it.ok.length===1,'Unambiguous vision statement: '+it.text);
 for(let k=0;k<3;k++)if(!it.ok.includes(k)){const w=it.wrong?.[k];ok(typeof w==='string'&&w.length>40,'Subject feedback for every wrong category: '+it.text+' → '+q.choices[k]);ok(!/^\s*falsch/i.test(w),'No bare "Falsch": '+it.text);}
}
const report=q.items.find(it=>/Vision oder einen Traum/.test(it.text));
ok(report&&report.ok[0]===1,'Vision report statement → später berichtet');
ok(/erzählen|berichten/.test(report.text)&&/später/.test(report.text),'Report statement names its later source (not the event as fact)');
ok(/Dass es die Berichte gibt, ist sicher/.test(report.wrong[0]),'Existence of a source is not confused with the truth of its content');
ok(!q.items.some(it=>/^Spätere christliche Autoren berichten/.test(it.text)),'Old ambiguous shield/vision statement removed');
const really=q.items.find(it=>/tatsächlich/.test(it.text));ok(really&&really.ok[0]===2,'"tatsächlich gesehen" → nicht sicher feststellbar');
q.items.filter(it=>/Maxentius/.test(it.text)).forEach(it=>ok(it.ok[0]===0,'Battle/victory → gut feststellbar'));
// Klassische Fassung (Sortierrätsel) stimmt mit dem Minispiel überein.
ok(P.vision.rows.length===q.items.length,'Classic vision rows match quiz');
P.vision.rows.forEach((r,i)=>{ok(r.label===q.items[i].text,'Same wording classic/minigame: '+r.label);ok(r.answer.join()===q.items[i].ok.join(),'Same category classic/minigame: '+r.label);});

/* 2. Echo der Quellen: Mehrdeutige Aussagen werden nicht als eindeutig falsch bewertet. */
const e=G.minigames.sources;
const multi=['Nero ließ Rom absichtlich anzünden.','Die Christen hatten den Brand gelegt.'];
multi.forEach(t=>{const it=e.items.find(x=>x.text===t);ok(it&&it.ok.includes(1)&&it.ok.includes(2),'Ambiguous claim accepts „unsicher“ and „nicht sicher feststellbar“: '+t);});
ok(!e.items.some(it=>/^Wir kennen die genaue Zahl/.test(it.text)),'Old ambiguous number statement removed');
const rep=e.items.find(it=>/antike Berichte/.test(it.text));ok(rep&&rep.ok.join()==='0'&&/nicht jedes Detail/.test(rep.why),'Report existence ≠ every detail true');
for(const it of e.items)ok(it.why&&it.why.length>10,'Explanation for every Echo statement: '+it.text);
P.sources.rows.forEach(r=>{const it=e.items.find(x=>x.text===r.label);if(it)ok(r.answer.slice().sort().join()===it.ok.slice().sort().join(),'Classic sources row consistent: '+r.label);});

/* 3. Keine Freitextantwort als Fortschrittsbedingung. */
const texts=JSON.stringify([P,G.steps,G.minigames]);
for(const w of ['Textfeld','Schreibe danach','Formuliere danach','mit eigenen Worten','mindestens 30 Zeichen','Begründe anschließend'])ok(!texts.includes(w),'No free-text instruction: '+w);
const code=['script.js','adventure.js','minigames.js','scenegames.js','argbridge.js'].map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
ok(!/textarea/i.test(code),'No textarea anywhere in the game code');
ok(!/reason\.trim\(\)\.length/.test(code),'No text-length condition for progress');
ok((code.match(/type="text"/g)||[]).length===1&&/id="continuation-code" type="text"/.test(code),'Only text input: continuation code (not a puzzle)');
ok(/it\.wrong\?\.\[k\]/.test(fs.readFileSync(path.join(root,'minigames.js'),'utf8')),'Slider quiz shows category-specific feedback');

/* 4. Begründungen als Auswahl: mehrere richtige, fachliche Rückmeldung für falsche. */
for(const id of ['motives','bridge']){const r=P[id].reasons;
 ok(r&&r.q&&r.options.length>=3&&r.options.length<=4,'3–4 reason options: '+id);
 ok(id==='bridge'?r.options.filter(o=>o.ok).length===1:r.options.filter(o=>o.ok).length>=2,id==='bridge'?'Bridge: exactly one best summary (Inschrift)':'Several correct reasons: '+id);ok(r.options.some(o=>!o.ok),'At least one oversimplification: '+id);
 r.options.forEach(o=>{ok(typeof o.why==='string'&&o.why.length>30,'Feedback for option: '+o.text);ok(!/^\s*falsch/i.test(o.why),'No bare "Falsch": '+o.text);ok(o.text.length<=4000,'Fits save format');});
 ok(new Set(r.options.map(o=>o.text)).size===r.options.length,'Distinct options: '+id);
}
console.log(JSON.stringify({status:'PASS',file:'sources-and-reasons',checks}));
