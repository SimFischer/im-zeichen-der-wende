const { put, get, del } = require('@vercel/blob');
const allowed = new Set(['https://simfischer.github.io','https://im-zeichen-der-wende.vercel.app']);
const recent=new Map();
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('Vary','Origin');
 const origin=req.headers.origin;
 let sameOrigin=false;try{sameOrigin=!!origin&&new URL(origin).host===req.headers.host;}catch(e){}
 if(origin && !allowed.has(origin) && !sameOrigin)return res.status(403).json({error:'Origin not allowed'});
 if(origin)res.setHeader('Access-Control-Allow-Origin',origin);
 res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
 res.setHeader('Access-Control-Allow-Headers','Content-Type');
 if(req.method==='OPTIONS')return res.status(204).end();
 if(req.method!=='POST')return res.status(405).json({error:'Use POST'});
 if(!process.env.BLOB_READ_WRITE_TOKEN)return res.status(503).json({error:'Storage not configured'});
 if(Number(req.headers['content-length']||0)>250000)return res.status(413).json({error:'Too large'});
 // Best-effort per-instance throttling; Vercel Firewall remains the outer abuse limit.
 // Generous limit: a whole class often shares one school IP (NAT).
 const ip=String(req.headers['x-forwarded-for']||'unknown').split(',')[0],now=Date.now();
 for(const [key,v] of recent)if(v.until<now)recent.delete(key);
 const rate=recent.get(ip)||{count:0,until:now+60000};
 if(++rate.count>300)return res.status(429).json({error:'Try again later'});
 recent.set(ip,rate);
 try{
  const b=typeof req.body==='string'?JSON.parse(req.body):req.body;
  if(!b||!['save','load'].includes(b.action)||! /^[a-f0-9]{64}$/.test(b.p_id||''))return res.status(400).json({error:'Invalid request'});
  const path='wende-v1/'+b.p_id+'.json';
  if(b.action==='save'){
   const p=b.p_payload;
   if(!p||p.v!==1||! /^[A-Za-z0-9+/]{16}$/.test(p.iv||'')||typeof p.data!=='string'||p.data.length<24||p.data.length>240100||! /^[A-Za-z0-9+/]+={0,2}$/.test(p.data))return res.status(400).json({error:'Invalid payload'});
   const expires_at=new Date(now+90*86400000).toISOString();
   await put(path,JSON.stringify({expires_at,payload:{v:1,iv:p.iv,data:p.data}}),{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json',token:process.env.BLOB_READ_WRITE_TOKEN});
   return res.status(201).json({expires_at});
  }
  const item=await get(path,{access:'private',useCache:false,token:process.env.BLOB_READ_WRITE_TOKEN});
  if(!item||item.statusCode!==200||!item.stream)return res.status(200).json(null);
  const value=await new Response(item.stream).json();
  if(Date.parse(value.expires_at)<=now){await del(path,{token:process.env.BLOB_READ_WRITE_TOKEN});return res.status(200).json(null);}
  return res.status(200).json(value.payload);
 }catch(e){return res.status(503).json({error:'Storage temporarily unavailable'});}
};
