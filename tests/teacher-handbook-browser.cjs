/* NODE_PATH may point to a bundled Playwright; no runtime dependency added.
   PLAYWRIGHT_BROWSER can select an existing Chrome/Edge executable.
   HANDBOOK_OUTPUT is optional and stores screenshots/PDFs for visual QA. */
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=process.env.HANDBOOK_OUTPUT;
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname;
 const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.woff':'font/woff'})[path.extname(file)]||'application/octet-stream');res.end(data);});
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_BROWSER?{executablePath:process.env.PLAYWRIGHT_BROWSER}:{})});
 if(out)fs.mkdirSync(out,{recursive:true});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[],bad=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)bad.push(r.url());});
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  assert.equal(await page.getByRole('link',{name:'Lehrkräftekompendium'}).count(),0,'No handbook in student start menu');
  await page.getByRole('button',{name:'Die Stadt betreten',exact:true}).click();
  await page.getByRole('button',{name:'Szene erkunden',exact:true}).click();
  const title=await page.locator('#title').boundingBox();
  await page.mouse.move(title.x+title.width/2,title.y+title.height/2);
  await page.mouse.down();await page.waitForTimeout(5100);await page.mouse.up();
  await page.getByRole('heading',{name:'Lehrkraftmodus',exact:true}).waitFor();
  assert.equal(await page.getByRole('link',{name:'Lehrkräftekompendium'}).count(),1);
  const saved=await page.evaluate(()=>localStorage.getItem('im-zeichen-der-wende:v1'));
  const [book]=await Promise.all([context.waitForEvent('page'),page.getByRole('link',{name:'Lehrkräftekompendium'}).click()]);
  book.on('pageerror',e=>errors.push(e.message));book.on('response',r=>{if(r.status()>=400)bad.push(r.url());});
  await book.waitForLoadState();
  assert.equal(await page.evaluate(()=>localStorage.getItem('im-zeichen-der-wende:v1')),saved);
  assert.equal(await book.locator('#solution-content').innerHTML(),'');
  const snap=async name=>{if(out)await book.screenshot({path:path.join(out,name+'.png'),fullPage:true});};
  for(const [width,height] of [[1440,1000],[1024,768],[768,1024],[390,844]]){
   await book.setViewportSize({width,height});
   for(const id of ['schnellstart','ablauf','faq','loesungen']){
    await book.locator(`#book-nav a[href="#${id}"]`).click();
    await book.locator('#'+id).waitFor({state:'visible'});
    assert.equal(await book.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'overflow '+width+' '+id);
    if(width===1440||width===768)await snap(width+'-'+id);
   }
  }
  await book.setViewportSize({width:1440,height:1000});
  await book.locator('#book-nav a[href="#faq"]').click();
  await book.locator('#faq-search').fill('Archiv');
  assert.ok(await book.locator('.faq-item:visible').count()>0);
  await book.locator('.faq-item:visible summary').first().click();
  await book.locator('#faq-search').fill('xyzzykeinwort');assert.equal(await book.locator('#faq-empty').isVisible(),true);
  await book.locator('#clear-search').click();
  await book.locator('#book-nav a[href="#loesungen"]').click();await book.locator('#reveal-solutions').click();
  assert.equal(await book.locator('.solution').count(),12);
  await book.locator('[data-puzzle="motives"] summary').click();
  assert.equal(await book.locator('[data-puzzle="motives"] tbody tr').count(),7);
  if(out)await snap('1440-solutions-open');
  const old=await book.locator('details[open]').count();
  await book.evaluate(()=>{window.print=()=>{window.printWasReady=document.body.classList.contains('print-handbook')&&[...document.querySelectorAll('details')].every(d=>d.open);};});
  await book.locator('#print-book').click();assert.ok(await book.evaluate(()=>window.printWasReady));
  assert.equal(await book.locator('details[open]').count(),old);
  await book.evaluate(()=>dispatchEvent(new Event('beforeprint')));await book.emulateMedia({media:'print'});
  assert.equal(await book.locator('#loesungen').isVisible(),false);assert.equal(await book.locator('.book-sidebar').isVisible(),false);
  assert.equal(await book.locator('.faq-item:visible').count(),await book.locator('.faq-item').count());
  if(out)await book.pdf({path:path.join(out,'handbook.pdf'),preferCSSPageSize:true,printBackground:false});
  await book.evaluate(()=>dispatchEvent(new Event('afterprint')));await book.emulateMedia({media:'screen'});
  await book.locator('#print-solutions').check();
  await book.evaluate(()=>dispatchEvent(new Event('beforeprint')));await book.emulateMedia({media:'print'});
  assert.equal(await book.locator('#loesungen').isVisible(),true);
  if(out)await book.pdf({path:path.join(out,'handbook-solutions.pdf'),preferCSSPageSize:true,printBackground:false});
  await book.evaluate(()=>dispatchEvent(new Event('afterprint')));await book.emulateMedia({media:'screen'});
  await book.locator('#hide-solutions').click();assert.equal(await book.locator('#solution-content').innerHTML(),'');
  await book.getByRole('link',{name:'Zurück zur App'}).click();await book.locator('#modal').waitFor();
  assert.equal(await book.evaluate(()=>localStorage.getItem('im-zeichen-der-wende:v1')),saved);
  for(const [width,height] of [[1024,768],[768,1024]]){
   const tablet=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true});
   const touch=await tablet.newPage();
   await touch.goto(`http://127.0.0.1:${server.address().port}/lehrkraefte.html`);
   await touch.locator('#book-nav a[href="#faq"]').tap();
   await touch.locator('.faq-item summary').first().tap();
   assert.equal(await touch.locator('.faq-item[open]').count(),1);
   await touch.locator('#book-nav a[href="#loesungen"]').tap();await touch.locator('#reveal-solutions').tap();
   assert.equal(await touch.locator('.solution').count(),12);
   assert.equal(await touch.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   await tablet.close();
  }
  assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);
  console.log('PASS browser handbook: original-tab preservation, four sections, 1440/1024/768/390px, FAQ, deliberate solutions, print with/without answers, state restoration, app return, no browser or asset errors');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
