const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),{webcrypto}=require('node:crypto');
(async()=>{
 const rows=new Map();let calls=0,fail=false,collide=0;
 const window={};
 const c={window,crypto:webcrypto,TextEncoder,TextDecoder,Uint8Array,URLSearchParams,AbortController,setTimeout,clearTimeout,atob,btoa,location:{protocol:'https:',hostname:'im-zeichen-der-wende.vercel.app'},
 fetch:async(url,options)=>{calls++;if(fail)throw Error('offline');const b=JSON.parse(options.body);if(b.action==='save'){if(collide>0){collide--;return {ok:false,status:409,json:async()=>({})};}assert.match(b.p_id,/^[a-f0-9]{64}$/);assert.ok(!JSON.stringify(b).includes('Meine private Antwort'));rows.set(b.p_id,b.p_payload);return {ok:true,json:async()=>({expires_at:'2027-01-01'})};}return {ok:true,json:async()=>rows.get(b.p_id)||null};}};
 vm.createContext(c);vm.runInContext(fs.readFileSync('data/game-data.js','utf8'),c);vm.runInContext(fs.readFileSync('continuation.js','utf8'),c);
 const s={version:1,started:true,scene:'house',unlocked:['gate','house','forum'],inventory:['flint'],solved:[],seals:[],notes:[],seen:[],evidence:[],drafts:{},hints:{},flags:{},progress:0};
 const id=Object.keys(window.GAME.puzzles)[0],p=window.GAME.puzzles[id];
 s.drafts[id]={values:p.rows.map(()=>null),reason:'Meine private Antwort'};
 const a=await window.WendeContinuation.save(s),b=await window.WendeContinuation.save(s);
 assert.notEqual(a.code,b.code);assert.match(a.code,/^[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/);
 const loaded=await window.WendeContinuation.load(a.code.toLowerCase().replaceAll('-',' '));
 assert.equal(JSON.stringify(loaded.state),JSON.stringify(s));
 // Kid-friendly input: O->0, I/L->1, lowercase, spaces instead of dash
 const typed=a.code.replace(/0/g,'O').replace(/1/g,'l').toLowerCase().replace('-',' ');
 assert.equal(JSON.stringify((await window.WendeContinuation.load(typed)).state),JSON.stringify(s));
 // Collision on the server -> client retries with a new code
 collide=2;const c2=await window.WendeContinuation.save(s);assert.equal(JSON.stringify((await window.WendeContinuation.load(c2.code)).state),JSON.stringify(s));
 // Bonusspiele reisen mit; alte Codes ohne Bonus bleiben gültig
 const bon=await window.WendeContinuation.save(s,{found:['tiber','zeichen'],won:['tiber']});
 const lb=await window.WendeContinuation.load(bon.code);assert.equal(JSON.stringify(lb.bonus),JSON.stringify({found:['tiber','zeichen'],won:['tiber']}));
 assert.equal((await window.WendeContinuation.load(a.code)).bonus,undefined);
 await assert.rejects(()=>window.WendeContinuation.save(s,{found:['<script>'],won:[]}));
 const before=calls;await assert.rejects(()=>window.WendeContinuation.load('123'));assert.equal(calls,before);
 await assert.rejects(()=>window.WendeContinuation.load('0000-0000-0000-0000-0000-0000'));
 await assert.rejects(()=>window.WendeContinuation.load('ZZZZ-ZZZZ'));await assert.rejects(()=>window.WendeContinuation.load('UUUU-UUUU'));
 const first=rows.values().next().value;first.data=(first.data[0]==='A'?'B':'A')+first.data.slice(1);
 await assert.rejects(()=>window.WendeContinuation.load(a.code));
 fail=true;await assert.rejects(()=>window.WendeContinuation.save(s));
 assert.equal(s.scene,'house');assert.equal(s.drafts[id].reason,'Meine private Antwort');
 console.log('PASS: bonus progress roundtrip, 8-char codes, lookalike normalization, collision retry, encrypted roundtrip, independent codes, normalized input, invalid/missing/tampered codes, offline failure, state preservation');
})().catch(e=>{console.error(e);process.exitCode=1;});
