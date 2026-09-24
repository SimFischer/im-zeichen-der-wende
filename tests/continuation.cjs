const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),{webcrypto}=require('node:crypto');
(async()=>{
 const rows=new Map();let calls=0,fail=false;
 const window={};
 const c={window,crypto:webcrypto,TextEncoder,TextDecoder,Uint8Array,URLSearchParams,AbortController,setTimeout,clearTimeout,atob,btoa,location:{protocol:'https:',hostname:'im-zeichen-der-wende.vercel.app'},
 fetch:async(url,options)=>{calls++;if(fail)throw Error('offline');const b=JSON.parse(options.body);if(b.action==='save'){assert.match(b.p_id,/^[a-f0-9]{64}$/);assert.ok(!JSON.stringify(b).includes('Meine private Antwort'));rows.set(b.p_id,b.p_payload);return {ok:true,json:async()=>({expires_at:'2027-01-01'})};}return {ok:true,json:async()=>rows.get(b.p_id)||null};}};
 vm.createContext(c);vm.runInContext(fs.readFileSync('data/game-data.js','utf8'),c);vm.runInContext(fs.readFileSync('continuation.js','utf8'),c);
 const s={version:1,started:true,scene:'house',unlocked:['gate','house','forum'],inventory:['flint'],solved:[],seals:[],notes:[],seen:[],evidence:[],drafts:{},hints:{},flags:{},progress:0};
 const id=Object.keys(window.GAME.puzzles)[0],p=window.GAME.puzzles[id];
 s.drafts[id]={values:p.rows.map(()=>null),reason:'Meine private Antwort'};
 const a=await window.WendeContinuation.save(s),b=await window.WendeContinuation.save(s);
 assert.notEqual(a.code,b.code);assert.match(a.code,/^([A-F0-9]{4}-){5}[A-F0-9]{4}$/);
 const loaded=await window.WendeContinuation.load(a.code.toLowerCase().replaceAll('-',' '));
 assert.deepEqual(JSON.parse(JSON.stringify(loaded.state)),s);
 const before=calls;await assert.rejects(()=>window.WendeContinuation.load('123'));assert.equal(calls,before);
 await assert.rejects(()=>window.WendeContinuation.load('0000-0000-0000-0000-0000-0000'));
 const first=rows.values().next().value;first.data=(first.data[0]==='A'?'B':'A')+first.data.slice(1);
 await assert.rejects(()=>window.WendeContinuation.load(a.code));
 fail=true;await assert.rejects(()=>window.WendeContinuation.save(s));
 assert.equal(s.scene,'house');assert.equal(s.drafts[id].reason,'Meine private Antwort');
 console.log('PASS: encrypted roundtrip, independent codes, normalized input, invalid/missing/tampered codes, offline failure, state preservation');
})().catch(e=>{console.error(e);process.exitCode=1;});
