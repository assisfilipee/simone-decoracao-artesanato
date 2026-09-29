const fs=require('node:fs');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const results=[];
 for(const [width,height] of (process.env.LAYOUT_SIZES?JSON.parse(process.env.LAYOUT_SIZES):[[1920,1080],[1536,864],[1366,768],[768,1024],[390,844]])){
  await page.setViewportSize({width,height});
  await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
  await page.evaluate(async()=>{await document.fonts.ready;for(const image of document.images)image.loading='eager';await Promise.all([...document.images].map(image=>image.decode().catch(()=>{})));});
  await page.waitForTimeout(1500);
  await page.screenshot({path:`validation/layout-${width}-hero.jpg`,type:'jpeg',quality:65});
  const hero=await page.locator('.hero').evaluate(el=>({height:el.offsetHeight,contentBottom:el.querySelector('.hero-grid').getBoundingClientRect().bottom}));
  const sections=[];
  for(const id of ['produtos','chimarrao','velas','atacado','sobre','faq','contato','inicio']){
   if(width>1024) await page.locator(`.desktop-nav a[href="#${id}"]`).click();
   else{await page.locator('.menu-toggle').click();await page.locator(`#mobile-menu a[href="#${id}"]`).click();}
   if(id==='inicio') await page.waitForFunction(()=>scrollY<2);
   else await page.waitForFunction(id=>Math.abs(document.getElementById(id).getBoundingClientRect().top-document.querySelector('.site-header').getBoundingClientRect().bottom)<2,id,{timeout:15000});
   await page.waitForTimeout(1000);
   const result=await page.locator('#'+id).evaluate(el=>{
    const r=el.getBoundingClientRect(),header=document.querySelector('.site-header').getBoundingClientRect();
    const content=el.querySelector('.container');
    const eyebrow=el.querySelector('.eyebrow');
    return {id:el.id,top:r.top,header:header.bottom,eyebrow:eyebrow?.getBoundingClientRect().top-header.bottom,contentBottom:content.getBoundingClientRect().bottom,overflow:document.documentElement.scrollWidth>innerWidth};
   });
   if(result.overflow)console.log(await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(el=>el.getBoundingClientRect().right>innerWidth+1).map(el=>({tag:el.tagName,cls:el.className,right:el.getBoundingClientRect().right})).slice(0,15)));
   assert.ok(!result.overflow,JSON.stringify({width,...result}));
   if(id!=='inicio')assert.ok(Math.abs(result.top-result.header)<=2,JSON.stringify(result));
   sections.push(result);
   if(['produtos','chimarrao','velas','faq'].includes(id))await page.screenshot({path:`validation/layout-${width}-${id}.jpg`,type:'jpeg',quality:65});
  }
  results.push({width,height,hero,sections});
  console.log(JSON.stringify(results.at(-1)));
 }
 fs.writeFileSync('validation/layout-results.json',JSON.stringify(results,null,2));
 console.log(JSON.stringify(results,null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
