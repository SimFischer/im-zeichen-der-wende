/* Private, immutable continuation snapshots. No account required. */
(() => {
 'use strict';
 const MAX=180000, enc=new TextEncoder(), dec=new TextDecoder();
 const hex=b=>Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');
 const normalize=s=>String(s).replace(/[\s-]/g,'').toUpperCase();
 const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
 const b64=b=>{let s='';for(const x of b)s+=String.fromCharCode(x);return btoa(s);};
 async function keys(code){
  const hash=await crypto.subtle.digest('SHA-256',enc.encode('wende-lookup-v1:'+code));
  const keyBytes=await crypto.subtle.digest('SHA-256',enc.encode('wende-encryption-v1:'+code));
  return {id:hex(new Uint8Array(hash)),key:await crypto.subtle.importKey('raw',keyBytes,'AES-GCM',false,['encrypt','decrypt'])};
 }
 async function rpc(name,body){
  const base=location.hostname==='simfischer.github.io'?'https://im-zeichen-der-wende.vercel.app':'';
  if(location.protocol!=='https:'&&location.hostname!=='localhost')throw Error('Bitte öffne die Online-Version der App.');
  const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),20000);
  try{
   const r=await fetch(base+'/api/continuation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:name==='wende_save_snapshot'?'save':'load',...body}),signal:controller.signal});
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
  return value;
 }
 window.WendeContinuation={
  async save(state){
   if(!crypto?.subtle)throw Error('Bitte öffne die App über ihre HTTPS-Adresse.');
   const payload={app:'im-zeichen-der-wende',format:1,savedAt:new Date().toISOString(),state};
   validate(payload);
   const raw=enc.encode(JSON.stringify(payload));if(raw.length>MAX)throw Error('Der Spielstand ist zu groß für einen Fortsetzungscode.');
   const code=hex(crypto.getRandomValues(new Uint8Array(12))).toUpperCase(),k=await keys(code),iv=crypto.getRandomValues(new Uint8Array(12));
   const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},k.key,raw);
   const result=await rpc('wende_save_snapshot',{p_id:k.id,p_payload:{v:1,iv:b64(iv),data:b64(new Uint8Array(cipher))}});
   return {code:code.match(/.{4}/g).join('-'),savedAt:payload.savedAt,expiresAt:result.expires_at};
  },
  async load(input){
   const code=normalize(input);if(!/^[A-F0-9]{24}$/.test(code))throw Error('Bitte die sechs Vierergruppen des Codes vollständig eingeben.');
   const k=await keys(code),result=await rpc('wende_load_snapshot',{p_id:k.id});
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