const fs=require('node:fs');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({reducedMotion:'reduce'});
const results=[];
for(const [width,height] of (process.argv.includes('--mobile')?[[390,844],[320,740]]:[[1366,768],[1536,864],[1920,1080],[768,1024],[390,844],[320,740]])){
 await page.setViewportSize({width,height});
 await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
 await page.evaluate(async()=>{await document.fonts.ready;for(const i of document.images)i.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
 await page.locator('.hero-main figcaption').scrollIntoViewIfNeeded();
 const geometry=await page.evaluate(()=>{
  const caption=document.querySelector('.hero-main figcaption');const range=document.createRange();range.selectNodeContents(caption);const r=range.getBoundingClientRect();
  const clear=[.05,.25,.5,.75,.95].every(f=>{const el=document.elementFromPoint(r.left+r.width*f,r.top+r.height/2);return el===caption||caption.contains(el);});
  const polaroid=document.querySelector('.hero-secondary').getBoundingClientRect();
  return {clear,overflow:document.documentElement.scrollWidth>innerWidth,polaroidLeft:polaroid.left,polaroidRight:polaroid.right,heroHeight:document.querySelector('.hero').offsetHeight};
 });
 assert.ok(geometry.clear,`Caption hidden at ${width}`);assert.ok(!geometry.overflow);assert.ok(geometry.polaroidLeft>=0);
 await page.evaluate(()=>scrollTo(0,0));
 await page.screenshot({path:`validation/hero-update-${width}.jpg`,type:'jpeg',quality:70});
 if(width<761)await page.locator('.hero-art').screenshot({path:`validation/hero-cluster-${width}.jpg`,type:'jpeg',quality:70});
 await page.locator('#atacado').scrollIntoViewIfNeeded();
 await page.screenshot({path:`validation/wholesale-update-${width}.jpg`,type:'jpeg',quality:65});
 const rule=await page.evaluate(()=>{
  const s=JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
  return {text:document.querySelector('#atacado').textContent,message:new URL(document.querySelector('#atacado .button').href).searchParams.get('text'),faq:[...document.querySelectorAll('.faq-list details')].find(el=>el.textContent.includes('Você trabalha com atacado?')).querySelector('p').textContent,schema:s['@graph'][1].mainEntity.find(q=>q.name==='Você trabalha com atacado?').acceptedAnswer.text,old:document.documentElement.innerHTML.includes('25 unidades')};
 });
 assert.ok(!rule.old);assert.ok(rule.text.includes('Múltiplos de 6'));assert.ok(rule.message.includes('6 unidades, em múltiplos de 6'));assert.equal(rule.faq,rule.schema);
 results.push({width,height,...geometry});console.log(results.at(-1));
}
fs.writeFileSync(`validation/hero-wholesale${process.argv.includes('--mobile')?'-mobile':''}-results.json`,JSON.stringify(results,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
