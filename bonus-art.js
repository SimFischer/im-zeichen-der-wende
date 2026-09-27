'use strict';
window.BonusArt=(()=>{
 const cache=new Map();
 function load(art){const imgs={};const ready=Promise.all(art.available.map(key=>{
  const url=art.dir+art.files[key];
  if(!cache.has(url))cache.set(url,new Promise(resolve=>{const im=new Image();let done=false;const finish=v=>{if(done)return;done=true;clearTimeout(timer);resolve(v);};const timer=setTimeout(()=>finish(null),12000);im.onload=()=>finish(im);im.onerror=()=>finish(null);im.src=url;}));
  return cache.get(url).then(im=>{if(im)imgs[key]=im;});
 }));return {imgs,ready};}
 function draw(g,im,x,y,w,h,frame=0,columns=1){if(!im)return;const sw=im.width/columns,sh=im.height,s=Math.min(w/sw,h/sh);g.drawImage(im,frame*sw,0,sw,sh,x+(w-sw*s)/2,y+(h-sh*s)/2,sw*s,sh*s);}
 return {load,draw};
})();
