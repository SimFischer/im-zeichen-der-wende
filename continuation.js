/* Private, immutable continuation snapshots. No account required. */
(() => {
 'use strict';
 const MAX=180000, enc=new TextEncoder(), dec=new TextDecoder();
 const hex=b=>Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');
 // Short codes: 8 characters, Crockford Base32 (no I, L, O, U) = 40 bits.
 const ALPHA='0123456789ABCDEFGHJKMNPQRSTVWXYZ';
 const normalize=s=>String(s).replace(/[\s-]/g,'').toUpperCase();
 const normalizeShort=s=>normalize(s).replace(/O/g,'0').replace(/[IL]/g,'1');
 const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
 const b64=b=>{let s='';for(const x of b)s+=String.fromCharCode(x);return btoa(s);};
 // Legacy 24-hex codes (first version).
 async function legacyKeys(code){
  const hash=await crypto.subtle.digest('SHA-256',enc.encode('wende-lookup-v1:'+code));
  const keyBytes=await crypto.subtle.digest('SHA-256',enc.encode('wende-encryption-v1:'+code));
  return {id:hex(new Uint8Array(hash)),key:await crypto.subtle.importKey('raw',keyBytes,'AES-GCM',false,['encrypt','decrypt'])};
 }
 // Short codes: slow PBKDF2 so a leaked store cannot be brute-forced cheaply.
 async function keys(code){
  const base=await crypto.subtle.importKey('raw',enc.encode(code),'PBKDF2',false,['deriveBits']);
  const bits=new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc.encode('wende-short-v2'),iterations:200000},base,512));
  return {id:hex(bits.slice(0,32)),key:await crypto.subtle.importKey('raw',bits.slice(32),'AES-GCM',false,['encrypt','decrypt'])};
 }
 function newCode(){return Array.from(crypto.getRandomValues(new Uint8Array(8)),x=>ALPHA[x&31]).join('');}
 async function rpc(name,body){
  const base=location.hostname==='simfischer.github.io'?'https://im-zeichen-der-wende.vercel.app':'';
  if(location.protocol!=='https:'&&location.hostname!=='localhost')throw Error('Bitte öffne die Online-Version der App.');
  const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),20000);
  try{
   const r=await fetch(base+'/api/continuation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:name==='wende_save_snapshot'?'save':'load',...body}),signal:controller.signal});
   if(r.status===409){const e=Error('collision');e.collision=true;throw e;}
   if(!r.ok)throw Error('Online-Speichern oder Laden ist gerade nicht möglich. Bitte später erneut versuchen.');
   return await r.json();
  }catch(e){if(e.name==='AbortError')throw Error('Die Verbindung dauert zu lange. Dein lokaler Spielstand bleibt erhalten.');throw e;}
  finally{clearTimeout(timer);}
 }
 function validate(value){
  const G=window.GAME;
  if(!value||value.app!=='im-zeichen-der-wende'||value.format!==1||!value.state||value.state.version!==1)throw Error('Dieser Spielstand gehört nicht zu dieser App-Version.');
  const s=value.state;
  if(!G.scenes.some(x=>x.id===s.scene)||typeof s.started!=='boolean')throw Error('Der Spielstand ist beschädigt.');
  for(const k of ['unlocked','inventory','solved','seals','notes','seen','evidence'])
   if(!Array.isArray(s[k])||s[k].length>1000||s[k].some(v=>typeof v!=='string'||v.length>200))throw Error('Der Spielstand ist beschädigt.');
  for(const k of ['drafts','hints','flags'])if(!s[k]||typeof s[k]!=='object'||Array.isArray(s[k]))throw Error('Der Spielstand ist beschädigt.');
  const allowed={unlocked:G.scenes.map(x=>x.id),inventory:Object.keys(G.items),solved:Object.keys(G.puzzles),seals:G.seals,notes:Object.keys(G.notes),evidence:Object.keys(G.evidence)};
  for(const [k,ids] of Object.entries(allowed))if(s[k].some(id=>!ids.includes(id)))throw Error('Der Spielstand enthält unbekannte Inhalte.');
  if(!s.unlocked.includes(s.scene))throw Error('Der gespeicherte Ort ist nicht freigeschaltet.');
  for(const [id,d] of Object.entries(s.drafts)){
   const p=G.puzzles[id];
   if(!p||!d||!Array.isArray(d.values)||d.values.length!==p.rows.length||d.values.some((v,i)=>v!==null&&(!Number.isInteger(v)||v<0||v>=p.rows[i].options.length))||typeof d.reason!=='string'||d.reason.length>4000)throw Error('Die gespeicherten Antworten sind beschädigt.');
  }
  function safe(v,depth=0){if(depth>20)throw Error('Spielstand zu komplex.');if(v&&typeof v==='object')for(const k of Object.keys(v)){if(['__proto__','constructor','prototype'].includes(k))throw Error('Ungültiger Spielstand.');safe(v[k],depth+1);}}
  safe(s);
  // Optional: entdeckte/geschaffte Bonusspiele (ältere Codes haben das Feld nicht)
  if(value.bonus!==undefined){const b=value.bonus;if(!b||typeof b!=='object'||Array.isArray(b))throw Error('Der Spielstand ist beschädigt.');
   for(const k of ['found','won'])if(!Array.isArray(b[k])||b[k].length>50||b[k].some(v=>typeof v!=='string'||!/^[a-z]{2,20}$/.test(v)))throw Error('Der Spielstand ist beschädigt.');
   for(const k of Object.keys(b))if(!['found','won'].includes(k))throw Error('Der Spielstand ist beschädigt.');}
  return value;
 }
 window.WendeContinuation={
  async save(state,bonus){
   if(!crypto?.subtle)throw Error('Bitte öffne die App über ihre HTTPS-Adresse.');
   const payload={app:'im-zeichen-der-wende',format:1,savedAt:new Date().toISOString(),state};
   if(bonus)payload.bonus={found:[...(bonus.found||[])],won:[...(bonus.won||[])]};
   validate(payload);
   const raw=enc.encode(JSON.stringify(payload));if(raw.length>MAX)throw Error('Der Spielstand ist zu groß für einen Fortsetzungscode.');
   for(let attempt=0;;attempt++){
    const code=newCode(),k=await keys(code),iv=crypto.getRandomValues(new Uint8Array(12));
    const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},k.key,raw);
    try{
     const result=await rpc('wende_save_snapshot',{p_id:k.id,p_payload:{v:1,iv:b64(iv),data:b64(new Uint8Array(cipher))}});
     return {code:code.slice(0,4)+'-'+code.slice(4),savedAt:payload.savedAt,expiresAt:result.expires_at};
    }catch(e){if(!e.collision||attempt>=4)throw e.collision?Error('Speichern fehlgeschlagen. Bitte erneut versuchen.'):e;}
   }
  },
  async load(input){
   const long=normalize(input),short=normalizeShort(input);let k;
   if(/^[A-F0-9]{24}$/.test(long))k=await legacyKeys(long);
   else if(/^[0-9A-HJKMNP-TV-Z]{8}$/.test(short))k=await keys(short);
   else throw Error('Bitte den Code mit 8 Zeichen vollständig eingeben (z. B. K7M2-9QXA).');
   const result=await rpc('wende_load_snapshot',{p_id:k.id});
   if(!result)throw Error('Code nicht gefunden oder nach 90 Tagen abgelaufen. Prüfe den Code.');
   try{
    if(result.v!==1||typeof result.data!=='string'||result.data.length>250000)throw Error();
    const raw=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(result.iv)},k.key,bytes(result.data));
    if(raw.byteLength>MAX)throw Error();
    return validate(JSON.parse(dec.decode(raw)));
   }catch(e){throw Error('Dieser Spielstand konnte nicht sicher gelesen werden. Prüfe den Code.');}
  }
 };
})();
