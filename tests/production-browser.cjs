/* Real Chromium/Edge input. Saved milestones isolate each puzzle; playthrough.cjs covers natural gates.
   NODE_PATH points to Playwright if installed outside the repository. */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),KEY='im-zeichen-der-wende:v1';
const server=http.createServer((req,res)=>{const p=decodeURIComponent(req.url.split('?')[0]),file=path.resolve(root,'.'+(p==='/'?'/index.html':p));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');res.end(data);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_BROWSER?{executablePath:process.env.PLAYWRIGHT_BROWSER}:{})});let checks=0;const ok=(x,m)=>{assert.ok(x,m);checks++;};
const out=process.env.WENDE_SCREENSHOTS;if(out)fs.mkdirSync(out,{recursive:true});
try{for(const [width,height,touch] of [[1024,768,true],[1180,820,true],[1366,1024,true],[1440,1000,false]]){
 if(process.env.WENDE_WIDTH&&+process.env.WENDE_WIDTH!==width)continue;const context=await browser.newContext({viewport:{width,height},hasTouch:touch,isMobile:touch,deviceScaleFactor:1}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:'+server.address().port);const G=await page.evaluate(()=>({scenes:GAME.scenes,seals:GAME.seals,puzzles:GAME.puzzles,notes:GAME.notes,minigames:GAME.minigames}));
 const hit=async s=>{const l=typeof s==='string'?page.locator(s):s;await l.waitFor({state:'visible'}).catch(async e=>{if(out)await page.screenshot({path:path.join(out,'failure.png')});console.error('NOT VISIBLE',String(s),await page.locator('.archive-game').evaluate(n=>n.__debug.phase()).catch(()=>''));throw e;});await l.scrollIntoViewIfNeeded();await(touch?l.tap():l.click()).catch(async e=>{if(out)await page.screenshot({path:path.join(out,'failure.png')});console.error('FAILED TARGET',String(s),await page.locator('.archive-game').evaluate(n=>n.__debug.phase()).catch(()=>''));throw e;});};
 const button=t=>hit(page.getByRole('button',{name:t,exact:true}));
 const snap=async name=>{await page.waitForTimeout(750);if(out)await page.screenshot({path:path.join(out,width+'-'+name+'.png'),fullPage:true});};
 const base=scene=>({version:1,started:true,scene,unlocked:G.scenes.map(s=>s.id),inventory:['light','key','scrolls'],solved:Object.keys(G.puzzles).filter(id=>!['timeline','bridge'].includes(id)),seals:G.seals,notes:Object.keys(G.notes).filter(k=>k!=='bridge'),seen:G.scenes.flatMap(s=>['intro:'+s.id,...s.hotspots.map((_,i)=>s.id+':'+i)]),evidence:['scroll','door','church','chain'],drafts:{},hints:{},flags:{archiveScrollsReceived:true,archiveScrollsRead:true,archiveScrollsDeposited:true,sealsPlaced:true},progress:10});
 const load=async s=>{await page.evaluate(([k,s])=>localStorage.setItem(k,JSON.stringify(s)),[KEY,s]);await page.reload();await button('Spiel fortsetzen');};
 const open=async(id,scene)=>{const s=base(scene);s.solved=s.solved.filter(x=>x!==id);await load(s);await hit(id==='archive'?'#scene':'[data-hotspot="'+id+'"]');await page.locator('.scene-game').waitFor();};
 const overflow=async()=>ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&document.querySelector('#modal').scrollWidth<=document.querySelector('#modal').clientWidth+2),'No horizontal overflow '+width);
 for(const [scene,id] of [['camp','messenger'],['motives','advisor']]){await load(base(scene));await hit('[data-hotspot="'+id+'"]');ok(await page.locator('#speech').isVisible(),'First tap opens '+id);await hit('.speech-close');}
 await hit('#inventory-toggle');ok(await page.locator('#inventory').isVisible(),'Inventory opens');await hit('.bag-close');await hit('#map');ok(await page.locator('.pm-place').count()>8,'Scene map available');await hit('#close');
 const seals=base('basilica');seals.flags.sealsPlaced=false;await load(seals);await hit('[data-hotspot="finalgate"]');
 for(const name of G.seals){await hit('.seal-rack .seal-token[data-seal="'+name+'"]');await hit('.seal-socket[data-seal="'+name+'"]');ok(await page.locator('.seal-socket[data-seal="'+name+'"].fitted').count()===1,'First tap seats seal '+name);}
 await snap('seals');await hit('#close');
 await load(base('vestibule'));await hit('[data-hotspot="scrolls"]');for(let i=0;i<3;i++){ok(await page.locator('.scroll-safe p').innerText()===await page.evaluate(i=>GAME.texts.archive.body[i],i),'Unchanged scroll text '+i);await overflow();await snap('scroll-'+i);if(i<2)await hit('.scroll-btn.next');}await hit('#close');
 for(const [id,scene] of [['sources','forum'],['sacrifice','temple'],['archive','archive'],['map312','camp'],['timeline','basilica'],['cases','office'],['vision','camp'],['motives','motives'],['change','city'],['council','council'],['conflict','house']]){
  if(process.env.WENDE_ONLY&&!process.env.WENDE_ONLY.split(',').includes(id))continue;await open(id,scene);if(await page.locator('.w-start').count())await hit('.w-start');await overflow();
  if(id==='sources'){await snap(id);const n=await page.locator('.forum-game').evaluate(n=>n.__debug.cur().ok[0]);await hit('.forum-box[data-i="'+n+'"]');await snap(id+'-feedback');ok(await page.locator('.w-voice').innerText(),'Forum feedback');}
  if(id==='archive'){await hit('.dark-spot:nth-child(3)');ok(await page.locator('.cab-view').isVisible(),'Church opens with first tap, without prior hover');}
  if(id==='map312'){const want={'Stadt':'Rom','Fluss':'Tiber','Übergang':'Milvische Brücke','Späterer Sieger':'Konstantin','Gegner':'Maxentius','Jahr':'312'};for(let i=0;i<G.minigames.map312.pins.length;i++){const pn=G.minigames.map312.pins[i];await hit('.map-tray .map-marker[data-t="'+want[pn[0]]+'"]');await hit('.map-spot[data-i="'+i+'"]');ok(await page.locator('.map-spot[data-i="'+i+'"] .map-pin').count()===1,'First target tap places '+pn[0]);}ok(await page.locator('.map-spot button').count()===0,'No nested map buttons');}
  if(id==='timeline'){await hit('.tm-card[data-card="0"]');await hit('.tm-year[data-target="1"]');ok((await page.locator('.sg-voice').innerText())===G.minigames.timeline.wrongFirst,'First wrong assignment no solution');await hit('.tm-card[data-card="0"]');await hit('.tm-year[data-target="1"]');ok((await page.locator('.sg-voice').innerText())===G.minigames.timeline.wrongAgain,'Second wrong assignment notebook');for(let i=0;i<6;i++){await hit('.tm-card[data-card="'+i+'"]');await hit('.tm-year[data-target="'+i+'"]');}await page.waitForTimeout(1400);ok(await page.locator('.tm-year.filled').count()===6,'Six filled book entries');await page.locator('.tm-book').scrollIntoViewIfNeeded();}
  if(id==='sacrifice'){const c=G.minigames.sacrifice;for(let li=0;li<2;li++)for(let si=0;si<4;si++){await hit('.crate-boards .rope-board[data-b="'+c.blocks.indexOf(c.lines[li].answer[si])+'"]');await hit('.rope-hook[data-k="'+li+'-'+si+'"]');}await hit('.rope-lever');await page.locator('.rope-riddle').waitFor();}
  await snap(id);
  if(width===1024||!touch){
   const c=G.minigames[id];
   if(id==='conflict'){
    await hit('.door-ring');ok(await page.locator('.drum.bad').count()>0,'Wrong door combination');
    for(let i=0;i<c.rings.length;i++)while(await page.locator('.door-game').evaluate((n,i)=>n.__debug.pos[i]!==n.__debug.rings[i].answer,i))await hit('.drum-down[data-i="'+i+'"]');
    await hit('.door-ring');
   }
   if(id==='sources'){
    await page.waitForTimeout(1700);const bad=await page.locator('.forum-game').evaluate(n=>[0,1,2].find(i=>!n.__debug.cur().ok.includes(i)));await hit('.forum-box[data-i="'+bad+'"]');await page.waitForTimeout(3500);
    while(await page.locator('.forum-game').evaluate(n=>n.__debug.score()<GAME.minigames.sources.goal)){
     const choice=await page.locator('.forum-game').evaluate(n=>n.__debug.cur().ok[0]);await hit('.forum-box[data-i="'+choice+'"]');await page.waitForTimeout(1700);
    }
   }
   if(id==='cases'){
    const wrong=await page.locator('.office-game').evaluate(n=>[0,1,2,3].find(i=>!n.__debug.cur().ok.includes(i)));await hit('.office-stamp[data-i="'+wrong+'"]');await page.waitForTimeout(1300);
    while(await page.locator('.office-game').evaluate(n=>n.__debug.score()<GAME.minigames.cases.goal)){
     const choice=await page.locator('.office-game').evaluate(n=>n.__debug.cur().ok[0]);await hit('.office-stamp[data-i="'+choice+'"]');await page.waitForTimeout(2700);
    }
   }
   if(id==='sacrifice'){await hit('.rr-opts [data-k="'+((c.compare.answer+1)%3)+'"]');await hit('.rr-opts [data-k="'+c.compare.answer+'"]');}
   if(id==='archive'){
    for(const i of [2,0,1,3]){if(i!==2)await hit('.dark-spot:nth-child('+(i+1)+')');await hit('.cab-tag[data-k="'+((c.spots[i].answer+1)%4)+'"]');await hit('.cab-drawer[data-k="'+c.spots[i].answer+'"]');await page.waitForTimeout(2450);}
    await hit('.cab-final [data-k="'+((c.final.answer+1)%3)+'"]');await hit('.cab-final [data-k="'+c.final.answer+'"]');
   }
   if(id==='map312')await hit('.map-check');
   if(id==='vision'){
    for(let i=0;i<9;i++){const tiles=await page.locator('.shield-game').evaluate(n=>n.__debug.tiles());if(tiles[i]!==i){await hit('.tile:nth-child('+(i+1)+')');await hit('.tile:nth-child('+(tiles.indexOf(i)+1)+')');}}
    await page.locator('.sq-opts').waitFor();for(const item of c.quiz.items){await hit('.sq-opts [data-k="'+item.ok[0]+'"]');await page.waitForTimeout(2100);}
   }
   if(id==='change'){for(let i=0;i<c.cards.length;i++){await hit('.city-card[data-card="'+i+'"]');await hit('[data-target="'+c.cards[i].side+'"]');}}
   if(id==='motives'){
    for(let i=0;i<c.cards.length;i++){await hit('.mo-card[data-card="'+i+'"]');await hit('.mo-ledge[data-target="'+c.cards[i].best+'"]');}
    await page.locator('.mo-reason').first().waitFor();await hit('.mo-reason[data-k="'+c.reasons.options.findIndex(x=>!x.ok)+'"]');await hit('.mo-reason[data-k="'+c.reasons.options.findIndex(x=>x.ok)+'"]');
   }
   if(id==='council'){for(const r of c.rounds){await hit('.council-answer[data-i="'+r.options.findIndex(x=>!x.ok)+'"]');await hit('.council-answer[data-i="'+r.options.findIndex(x=>x.ok)+'"]');await page.waitForTimeout(2700);}}
   if(id==='timeline'){
    await hit('#close');await page.reload();await button('Spiel fortsetzen');await hit('[data-hotspot="timeline"]');ok(await page.locator('.tm-year.filled').count()===6,'Timeline locks survive real reload');await hit('.tm-gap[data-gap="3"]');await hit('.tm-gap[data-gap="0"]');
   }
   await hit('.w-next,.sg-next');ok(await page.evaluate(([key,id])=>JSON.parse(localStorage.getItem(key)).solved.includes(id),[KEY,id]),'Real puzzle completion '+id);console.log('solved',width,id);
  }
  await hit('#close');
 }
 if((!process.env.WENDE_ONLY||process.env.WENDE_ONLY==='bridge')&&(width===1024||!touch)){
  const s=base('basilica');s.solved=Object.keys(G.puzzles).filter(x=>x!=='bridge');await load(s);await hit('[data-hotspot="bridge"]');const c=G.minigames.bridge;
  for(let i=0;i<c.arches.length;i++){await hit(page.locator('.ab-plate[data-ok="false"]:not(:disabled)').first());await hit('.ab-plate[data-ok="true"]');await page.waitForTimeout(1600);}
  for(let i=0;i<c.simplify.items.length;i++)if(c.simplify.items[i].simple)await hit('.ab-plaque[data-k="'+i+'"]');
  await page.locator('.ab-tablet').first().waitFor();await hit('.ab-tablet[data-k="'+c.final.options.findIndex(x=>!x.ok)+'"]');await hit('.ab-tablet[data-k="'+c.final.options.findIndex(x=>x.ok)+'"]');await hit('.sg-next');
  await page.locator('#finale').waitFor();ok(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).flags.finished,KEY),'Bridge completion triggers gated finale');
  if(width===1024){await page.waitForTimeout(7500);await snap('memory');await page.locator('#finale[data-phase=end]').waitFor();}else await hit('.fn-skip');
  await button('Stadt weiter erkunden');
 }
 const finished=base('basilica');finished.solved=Object.keys(G.puzzles);finished.flags.finished=true;await load(finished);await page.locator('#finale[data-phase=end]').waitFor();ok(await page.locator('.fn-actions button').count()===3,'Three final actions');await snap('ending');await button('Neues Spiel');ok(await page.getByRole('button',{name:'Abbrechen',exact:true}).isVisible(),'Reset confirmation');await button('Abbrechen');await button('Stadt weiter erkunden');
 await page.emulateMedia({reducedMotion:'reduce'});await load(finished);ok(await page.locator('#finale').evaluate(n=>n.getAnimations({subtree:true}).length===0),'Reduced motion no animation');await button('Notizbuch öffnen');ok(await page.locator('.bonus-replay').count()===7,'All seven bonus games in journal');await overflow();
 for(const id of ['zeichen','rombrennt','amphoren','katakomben','schildwall','tiber','circus']){await hit('[data-bonus-start="'+id+'"]');ok(await page.locator('.bonus-shell[data-game="'+id+'"]').isVisible(),'Bonus opens '+id);await hit('.bonus-leave');await hit('#notebook');}
 await hit('#close');const unfinished=base('basilica');unfinished.solved=Object.keys(G.puzzles).filter(x=>!['council','bridge'].includes(x));await load(unfinished);await hit('[data-hotspot="bridge"]');ok(await page.locator('#finale').count()===0&&await page.locator('.scene-game').count()===0,'Missing prerequisite blocks finale');await hit('#close');
 ok(errors.length===0,'No browser errors: '+errors.join(';'));console.log('PASS layout/input',width,height);await context.close();
}console.log(JSON.stringify({status:'PASS',checks,physicalIPad:false}));}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
