const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
let game;vm.runInNewContext(fs.readFileSync('bonus/zeichen.js','utf8'),{window:{BonusGames:{register:g=>game=g}}});
const m=game.createModel(()=>.3),advance=()=>{for(let i=0;i<300&&m.s.phase!=='input'&&m.s.phase!=='won';i++)m.tick(.1);};
m.start();assert.equal(m.s.sequence.length,1);assert.equal(m.input(1),false);assert.equal(m.s.index,0);advance();
assert.equal(m.s.phase,'input');m.input(2);assert.equal(m.s.phase,'error');advance();assert.equal(m.s.sequence.length,1);assert.equal(m.s.errors,1);
m.replay();assert.equal(m.s.phase,'playback');advance();
for(let n=1;n<=5;n++){assert.equal(m.s.sequence.length,n);for(const symbol of m.s.sequence)assert(m.input(symbol));assert.equal(m.s.phase,'success');advance();}
assert.equal(m.s.phase,'won');assert.equal(game.createModel().s.phase,'idle');console.log('PASS secret code: playback lock, growing sequence, errors, replay, five-round victory, fresh session');
