const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async()=>{
 const browser = await chromium.launch({headless:true});
 const page = await browser.newPage();
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 fs.mkdirSync('validation',{recursive:true});
 const report=[];
 for(const [name,width,height] of [['desktop',1440,1000],['tablet',768,1024],['mobile',390,844],['small-mobile',320,740]]){
  await page.setViewportSize({width,height});
  await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(async()=>{await document.fonts.ready; for(const image of document.images){image.loading='eager';} await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
  assert.equal(await page.locator('h1').count(),1);
  const result=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),missingAnchors:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.querySelector(a.getAttribute('href'))).map(a=>a.hash),whatsapp:[...document.querySelectorAll('a[href*="wa.me"]')].every(a=>new URL(a.href).pathname==='/5551991128739'&&new URL(a.href).searchParams.get('text')?.startsWith('Olá, Simone!')),faq:document.querySelectorAll('.faq-list details').length}));
  assert.ok(result.scrollWidth<=width,`${name}: horizontal overflow`);assert.deepEqual(result.brokenImages,[]);assert.deepEqual(result.missingAnchors,[]);assert.ok(result.whatsapp);assert.equal(result.faq,8);
  await page.screenshot({path:`validation/${name}.png`,fullPage:true});
  await page.screenshot({path:`validation/${name}-hero.png`});
  if(width<=1024){
   await page.locator('.menu-toggle').click();assert.ok(await page.locator('#mobile-menu').evaluate(el=>el.open));assert.equal(await page.evaluate(()=>getComputedStyle(document.body).overflow),'hidden');
   await page.keyboard.press('Escape');assert.equal(await page.locator('#mobile-menu').evaluate(el=>el.open),false);
   await page.locator('.menu-toggle').click();await page.locator('#mobile-menu a[href="#produtos"]').click();assert.equal(await page.locator('#mobile-menu').evaluate(el=>el.open),false);
   await page.locator('.menu-toggle').click();await page.mouse.click(2,300);assert.equal(await page.locator('#mobile-menu').evaluate(el=>el.open),false);
  }
  await page.locator('.faq-list summary').first().click();assert.ok(await page.locator('.faq-list details').first().evaluate(el=>el.open));
  await page.locator('[data-gallery="0"]').click();assert.ok(await page.locator('.lightbox').evaluate(el=>el.open));
  await page.keyboard.press('ArrowRight');assert.ok((await page.locator('.lightbox figcaption').textContent()).startsWith('2 /'));
  await page.keyboard.press('ArrowLeft');assert.ok((await page.locator('.lightbox figcaption').textContent()).startsWith('1 /'));
  await page.keyboard.press('Escape');assert.equal(await page.locator('.lightbox').evaluate(el=>el.open),false);
  await page.waitForFunction(()=>!document.body.classList.contains('modal-open'));
  report.push({name,...result,menu:width<=1024?'passed':'desktop',faqInteraction:'passed',lightboxKeyboard:'passed'});
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto('http://127.0.0.1:4173');await page.emulateMedia({reducedMotion:'no-preference'});
 await page.waitForTimeout(5200);assert.ok(await page.locator('.contact-bubble').evaluate(el=>el.classList.contains('is-visible')));
 await page.waitForTimeout(3100);assert.equal(await page.locator('.contact-bubble').evaluate(el=>el.classList.contains('is-visible')),false);
 await page.locator('.whatsapp-float').hover();assert.ok(await page.locator('.contact-bubble').evaluate(el=>el.classList.contains('is-visible')));
 await page.mouse.move(700,100);await page.locator('#contato').scrollIntoViewIfNeeded();assert.equal(await page.locator('.back-top').evaluate(el=>el.hidden),false);
 assert.deepEqual(errors,[]);
 const schema=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());assert.equal(schema['@graph'][1].mainEntity.length,8);
 fs.writeFileSync('validation/results.json',JSON.stringify({viewports:report,errors,floatingBubble:'5 seconds visible, 3 seconds duration, hover passed',schema:'LocalBusiness and 8 FAQ entries passed'},null,2));
 console.log(JSON.stringify(report,null,2));console.log('All checks passed');await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
