const fs=require('fs'),path=require('path'),sharp=require('sharp');
const src=process.argv[2],dst=process.argv[3];
// Explicit, reviewed cuts. No complete reference board is shipped to the game.
async function cut(file,r,key=false){const meta=await sharp(path.join(src,file)).metadata();r=[r[0],r[1],Math.min(r[2],meta.width-r[0]),Math.min(r[3],meta.height-r[1])];let {data,info}=await sharp(path.join(src,file)).extract({left:r[0],top:r[1],width:r[2],height:r[3]}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 if(key){const w=info.width,h=info.height,seen=new Uint8Array(w*h),q=[];const add=i=>{if(i<0||i>=w*h||seen[i])return;seen[i]=1;const p=i*4;if(data[p]>160&&data[p+1]>130&&data[p+2]>85&&data[p]-data[p+2]<140&&data[p+1]-data[p+2]<95){q.push(i);data[p+3]=0;}};for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}for(let j=0;j<q.length;j++){const i=q[j];if(i%w)add(i-1);if(i%w<w-1)add(i+1);add(i-w);add(i+w);}}
 if(key&&/player|squad|chariots/.test(file)){const w=info.width,h=info.height;for(let y=Math.floor(h*.7);y<h;y++)for(let x=0;x<w;x++){const p=(y*w+x)*4;if(data[p]>190&&data[p+1]>160&&data[p+2]>105&&data[p]-data[p+2]<130&&data[p+1]-data[p+2]<90)data[p+3]=0;}
 const seen=new Uint8Array(w*h);let best=[];for(let i=0;i<w*h;i++){if(seen[i]||!data[i*4+3])continue;const q=[i];seen[i]=1;for(let j=0;j<q.length;j++){const n=q[j];for(const v of [n%w?n-1:-1,n%w<w-1?n+1:-1,n-w,n+w])if(v>=0&&v<w*h&&!seen[v]&&data[v*4+3]){seen[v]=1;q.push(v);}}if(q.length>best.length)best=q;}const keep=new Set(best);for(let i=0;i<w*h;i++)if(!keep.has(i))data[i*4+3]=0;}
 return sharp(data,{raw:info}).png().toBuffer();}
async function atlas(dir,name,file,rects,key=true,size=[192,192]){const layers=[];for(let i=0;i<rects.length;i++){const b=await cut(file,rects[i],key);layers.push({input:await sharp(b).resize(size[0]-8,size[1]-8,{fit:'contain',background:'#0000',position:'bottom'}).extend({top:4,bottom:4,left:4,right:4,background:'#0000'}).png().toBuffer(),left:i*size[0],top:0});}const out=path.join(dst,'assets/bonus',dir);fs.mkdirSync(out,{recursive:true});await sharp({create:{width:size[0]*rects.length,height:size[1],channels:4,background:'#0000'}}).composite(layers).png().toFile(path.join(out,name));}
async function crop(dir,name,file,r){const out=path.join(dst,'assets/bonus',dir);fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,name),await cut(file,r));}
const p=(d,n)=>`assets/bonus/${d}/${d}-${n}.png`;
(async()=>{
const d='rome-burns';
await crop(d,d+'-bg.png',p(d,'bg'),[285,3,850,274]);
await atlas(d,d+'-player.png',p(d,'player'),[[8,38,74,120],[83,38,74,120],[158,38,70,120],[215,37,91,121],[307,35,90,123],[401,31,109,128],[523,23,48,133],[568,45,55,115]],true,[112,160]);
await atlas(d,d+'-water-jar.png',p(d,'water-jar'),[[8,99,48,67],[52,96,42,70]],true,[64,96]);
await atlas(d,d+'-fire.png',p(d,'fire'),[[1,104,37,65],[39,83,41,86],[81,65,45,104],[127,65,44,104],[170,33,81,137]],true,[96,160]);
await atlas(d,d+'-smoke.png',p(d,'smoke'),[[6,104,36,57],[43,103,35,61],[78,103,36,61],[115,96,48,67],[166,34,64,131],[229,32,57,132]],true,[96,160]);
await atlas(d,d+'-tiles.png',p(d,'tiles'),[[437,3,138,84],[50,43,113,110],[257,97,30,54]],true,[160,160]);
await atlas(d,d+'-platforms.png',p(d,'platforms'),[[93,96,124,43],[294,100,137,113],[65,157,125,68],[622,57,83,51]],true,[192,128]);
await crop(d,d+'-fg.png',p(d,'fg'),[5,34,361,119]);
await crop(d,d+'-goal.png',p(d,'goal'),[8,36,255,111]);
await atlas(d,d+'-ui.png',p(d,'water-jar'),[[8,99,48,67]],true,[64,96]);
const s='shieldwall';
await crop(s,s+'-bg.png',p(s,'bg'),[290,3,836,312]);
await atlas(s,s+'-squad.png',p(s,'squad'),[[13,41,85,111],[258,41,86,111],[568,41,66,111]],true,[120,160]);
for(const [n,r]of [['left',[7,41,60,108]],['up',[29,41,54,108]],['right',[22,39,84,109]]])await atlas(s,s+'-shields-'+n+'.png',p(s,'shields-'+n),[r],true,[96,144]);
await atlas(s,s+'-arrows.png',p(s,'arrows'),[[19,35,125,22]],true,[160,32]);
await atlas(s,s+'-banners.png',p(s,'banners'),[[12,30,60,152]],true,[80,192]);
await atlas(s,s+'-hit.png',p(s,'hit'),[[5,34,85,96],[94,28,97,105]],true,[128,128]);
await atlas(s,s+'-impact.png',p(s,'impact'),[[7,40,71,94],[85,42,127,92]],true,[160,128]);
await crop(s,s+'-gameover.png',p(s,'gameover'),[5,32,301,173]);
const c='circus';
await crop(c,c+'-bg.png',p(c,'bg'),[410,4,689,175]);
await crop(c,c+'-crowd.png',p(c,'bg'),[490,61,165,100]);
await atlas(c,c+'-chariots.png',p(c,'chariots'),[[7,36,196,116],[207,35,208,120],[418,34,223,122],[640,34,199,122]],true,[256,160]);
await atlas(c,c+'-track.png',p(c,'track'),[[7,37,142,86],[70,76,153,68],[196,37,135,88]],true,[192,128]);
await atlas(c,c+'-dust.png',p(c,'dust'),[[10,47,181,88],[192,31,140,81]],true,[192,112]);
await atlas(c,c+'-ui-icons.png',p(c,'ui-icons'),[[9,42,73,73]],true,[96,96]);
const k='catacombs',sheet='source-sheets/tiber-sheet.png';
await crop(k,k+'-bg.png',sheet,[840,206,580,96]);
await atlas(k,k+'-tiles.png',sheet,[[578,650,75,72],[666,645,102,80],[778,645,93,80],[884,644,122,82],[1021,643,75,82],[568,748,93,70],[679,750,82,67],[1001,749,96,70]],false,[128,128]);
await atlas(k,k+'-player.png',sheet,[[29,661,74,119],[113,662,69,119],[202,660,75,122],[295,660,75,122],[379,660,77,122],[466,659,66,123]],true,[96,144]);
await atlas(k,k+'-objects.png',sheet,[[1145,641,96,62],[1252,643,72,60],[1332,642,72,60],[448,888,109,109],[554,888,90,115],[447,1004,110,47],[639,987,116,87]],true,[128,128]);
await atlas(k,k+'-symbols.png',sheet,[[15,915,117,122],[140,901,73,143],[218,902,101,133],[325,874,98,166]],false,[128,160]);
await crop(k,k+'-exit-ui.png',sheet,[778,890,112,159]);
// Repair the mislabeled Tiber files using the actual Tiber panel supplied in combined-sheet.
const t='tiber',cs='source-sheets/combined-sheet.png';
await crop(t,t+'-bg.png',cs,[1031,573,498,208]);
await atlas(t,t+'-player.png',cs,[[1036,803,53,85],[1090,803,55,85],[1147,800,55,87]],true,[96,144]);
await atlas(t,t+'-player.png',sheet,[[29,661,74,119],[113,662,69,119],[202,660,75,122],[295,660,75,122],[379,660,77,122],[466,659,66,123]],true,[96,144]);
await atlas(t,t+'-platforms.png',cs,[[1280,804,88,33],[1383,796,77,35],[1400,832,64,51],[1271,842,84,48],[1460,829,65,66]],true,[192,96]);
await atlas(t,t+'-decor.png',cs,[[1038,920,59,53],[1100,920,67,75]],true,[96,96]);
await atlas(t,t+'-splash.png',cs,[[1197,923,56,43],[1189,968,77,48],[1315,923,65,69]],true,[96,96]);
await crop(t,t+'-target-bank.png',cs,[1393,921,135,92]);
await atlas(t,t+'-bank-views.png',cs,[[1120,709,55,28],[1400,951,105,30]],false,[192,96]);
await crop(t,t+'-bg.png',cs,[1180,605,345,92]);
const z='secret-signs';
await crop(z,z+'-scene.png',p(z,'scene'),[390,3,699,278]);
await atlas(z,z+'-characters.png',p(z,'characters'),[[304,33,99,126]],true,[144,192]);
await atlas(z,z+'-npc-guide.png',p(z,'characters'),[[304,33,99,126]],true,[144,192]);
await atlas(z,z+'-stall.png',p(z,'stall'),[[5,31,233,146]],true,[320,200]);
await atlas(z,z+'-symbols.png',p(z,'symbols'),[[23,37,62,56],[98,37,65,56],[173,37,62,56],[247,37,62,56],[392,36,60,57]],false,[96,96]);
await crop(z,z+'-panel.png',p(z,'panel'),[291,17,89,61]);
console.log('Prepared clean bonus atlases.');
})();
