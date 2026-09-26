/* iPad-Qualitätsschicht: Lade-Reihenfolge, Untergrenzen für Schrift und Touchziele, Hochformat, keine verräterischen Symbole.
   Run: node tests/ipad-layout.cjs (Layout selbst wird in Chromium geprüft, siehe TESTREPORT.md) */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++;};
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),css=fs.readFileSync(path.join(root,'ipad.css'),'utf8');
const sheets=[...html.matchAll(/href="([^"]+\.css)"/g)].map(m=>m[1]);
ok(sheets[sheets.length-1]==='ipad.css','ipad.css wird als letzte Stilvorlage geladen');
ok(/--fs-xs:max\(12\.5px/.test(css),'Kleinste Schriftstufe mindestens 12,5 px');
for(const sel of ['#modal #close','#modal .ring-btn','#modal .wood','#modal .bm-tag','#modal .racer-speed button','#modal .door-handle'])ok(new RegExp(sel.replace(/[.#*+?^${}()|[\]\\]/g,'\\$&')+'[^{]*\\{[^}]*min-height:(4[0-9]|5[0-9])px').test(css),'Mindesthöhe für Touchziel: '+sel);
ok(/orientation:portrait[^{]*\{[^]*scene-viewport\{overflow-x:auto/.test(css),'Hochformat: Szene groß und seitlich verschiebbar');
ok(/racer-start\{position:sticky/.test(css),'Startknopf der Minispiele bleibt sichtbar');
ok(html.includes('id="pan-hint"'),'Hinweis zum Wischen im Hochformat');
const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,'data/game-data.js'),'utf8'),c);const G=c.window.GAME;
const falseCard=G.minigames.change.cards.find(x=>x.side==='falsch');ok(falseCard.icon!=='scroll-cross','Die falsche Tafel verrät ihre Lösung nicht durch ein durchgestrichenes Symbol');
ok(Object.keys(G.puzzles).every(id=>G.minigames[id]),'Alle zwölf Rätsel haben eine spielbare Szene');
ok(G.minigames.motives.type==='waage','Die Waage ist eine echte Szene statt eines Formulars');
ok(G.minigames.archive.intro.length<160,'Startkarten sind kurz (Archiv)');
console.log(`PASS: iPad-Qualitätsschicht – ${checks} Prüfungen`);
