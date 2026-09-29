const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
 await page.evaluate(async()=>{for(const image of document.images)image.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
 for(const id of ['produtos','chimarrao','velas','atacado','sobre','faq']){
  await page.locator('#'+id).screenshot({path:`validation/review-${id}.jpg`,type:'jpeg',quality:65});
 }
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'validation/mobile-full.jpg',fullPage:true,type:'jpeg',quality:50});
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
