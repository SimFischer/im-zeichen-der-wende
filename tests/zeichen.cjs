const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
let game;vm.runInNewContext(fs.readFileSync('bonus/zeichen.js','utf8'),{window:{BonusGames:{register:g=>game=g}}});
const ready=m=>{let guard=0;while(m.s.phase!=='input'&&guard++<20000)m.tick(.1);assert.equal(m.s.phase,'input');};
for(const random of [()=>0,()=>.3,()=>.999999,Math.random]){
 const m=game.createModel(random);m.tick(10);assert.equal(m.s.elapsed,0);m.start();m.start();assert.equal(m.s.sequence.length,1);assert.equal(m.input(0),false);
 for(let n=1;n<=35;n++){ready(m);assert.equal(m.s.sequence.length,n);assert.equal(m.s.completed,n-1);
  for(let i=2;i<n;i++)assert(!(m.s.sequence[i]===m.s.sequence[i-1]&&m.s.sequence[i]===m.s.sequence[i-2]),'no triple repeats');
  for(const invalid of [-1,4,NaN,1.5,'2'])assert.equal(m.input(invalid),false);
  for(const symbol of m.s.sequence)assert(m.input(symbol));assert.equal(m.s.completed,n);assert.equal(m.s.phase,'success');
 }
 ready(m);assert.equal(m.s.sequence.length,36);m.input(m.s.sequence[0]);m.input((m.s.sequence[1]+1)%4);assert.equal(m.s.phase,'ended');assert.equal(m.s.completed,35);
 const elapsed=m.s.elapsed;m.tick(100);assert.equal(m.s.elapsed,elapsed);assert.equal(m.input(0),false);
}
let now=100;const m=game.createModel(()=>0,()=>now);m.start();ready(m);now=184;m.input(1);assert.equal(m.s.elapsed,84);now=300;m.tick(10);assert.equal(m.s.elapsed,84);
const fresh=game.createModel();assert.equal(fresh.s.completed,0);assert.equal(fresh.s.elapsed,0);assert.equal(fresh.s.sequence.length,0);
console.log('PASS secret code: 35 growing rounds, no triples, input lock, first-error end, completed score, clock freeze, fresh run');
