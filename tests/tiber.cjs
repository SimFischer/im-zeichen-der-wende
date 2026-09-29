const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');let def;
vm.runInNewContext(fs.readFileSync('bonus/tiber.js','utf8'),{window:{BonusGames:{register:g=>def=g}}});
let m=def.createModel();assert(m.input('left'));assert.equal(m.s.x,208);assert(!m.input('left'));m.tick(.2);assert.equal(m.s.x,208,'no inertia');m.input('up');assert.equal(m.s.falls,0);const x=m.s.x;m.tick(.1);assert.notEqual(m.s.x,x,'platform carries player');
m=def.createModel();m.s.x=140;m.input('up');assert.equal(m.s.falls,1);assert.equal(m.s.row,8);assert(m.s.splash);
m=def.createModel();m.s.row=1;m.s.x=505;const p=m.s.platforms.find(p=>p.row===1);p.x=505;m.tick(.5);assert.equal(m.s.falls,1,'carried off edge resets');
// A real path using only input and elapsed time. Every landing is collision checked.
m=def.createModel();for(let row=7;row>=0;row--){let attempts=0;while(row!==4&&row!==0&&!m.support(m.s.x,row)&&attempts++<2000)m.tick(.025);assert(attempts<2000,'platform eventually arrives');assert(m.input('up'));m.tick(.15);assert.equal(m.s.row,row);}
assert(m.s.won);assert.equal(m.s.falls,0);assert.equal(m.s.checkpoint.row,4);console.log('PASS Tiber: discrete steps, cooldown, riding, water/edge reset, checkpoint, reachable goal through real inputs');

m=def.createModel();const relic=m.s.platforms.find(p=>p.relic!==undefined);m.s.x=relic.x;m.s.row=relic.row;m.tick(.1);assert.equal(m.s.found.length,1);m.tick(.1);assert.equal(m.s.found.length,1,'collect once');assert(m.s.elapsed>0);m.s.won=true;const stopped=m.s.elapsed;m.tick(5);assert.equal(m.s.elapsed,stopped,'timer stops on win');assert.equal(def.createModel().s.found.length,0);
