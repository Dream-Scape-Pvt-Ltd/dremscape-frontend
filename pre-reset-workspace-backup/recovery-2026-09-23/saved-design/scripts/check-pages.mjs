import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const base='http://127.0.0.1:3000';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 assert.equal((await (await page.request.get(base+'/api/trips')).json()).demo,true,'Run this against the sample preview, not a live customer backend.');
 await page.goto(base+'/contact');assert.equal(await page.locator('.contact-channel[href^="mailto:"]').getAttribute('href'),'mailto:dreamscapetrek@gmail.com');assert.equal(await page.locator('.contact-channel[href*="wa.me"]').count(),0);await page.getByText('+977 98X XXX XXXX',{exact:true}).waitFor();
 await page.goto(base+'/blog');assert.equal(await page.locator('.journal-card').count(),3);await page.getByRole('searchbox',{name:'Search stories'}).fill('does-not-exist');await page.getByRole('heading',{name:'No stories match just yet.'}).waitFor();await page.getByRole('button',{name:'Reset filters'}).click();await page.locator('.journal-card').first().click();await page.locator('.article-prose section').first().waitFor();assert.ok(await page.locator('.article-prose p').count()>=6);
 await page.goto(base+'/gallery');assert.equal(await page.locator('.gallery-tile').count(),9);await page.getByRole('button',{name:'Culture',exact:true}).click();assert.equal(await page.locator('.gallery-tile').count(),2);const first=page.locator('.gallery-tile').first();await first.click();const dialog=page.getByRole('dialog');await dialog.waitFor();const caption=await page.locator('#gallery-caption').innerText();await page.keyboard.press('ArrowRight');assert.notEqual(await page.locator('#gallery-caption').innerText(),caption);await page.keyboard.press('Escape');assert.equal(await dialog.isVisible(),false);assert.equal(await first.evaluate(e=>e===document.activeElement),true);
 await page.goto(base+'/reviews');await page.getByRole('heading',{name:'The first story is still to come.'}).waitFor();assert.equal(await page.getByRole('button',{name:/Share your experience/}).count(),0);
 await page.goto(base+'/admin');await page.getByRole('heading',{name:'Staff access required.'}).waitFor();assert.equal((await page.request.get(base+'/api/admin')).status(),401);
 await page.goto(base+'/payment');await page.getByLabel('Booking reference',{exact:true}).fill('made-up-reference');await page.getByRole('button',{name:'View booking',exact:true}).click();await page.locator('.quiet-panel[role="alert"]').waitFor();assert.equal(await page.locator('.payment-receipt').count(),0);assert.equal(await page.locator('input[autocomplete="cc-number"]').count(),0);
 const routes=['/about','/destinations/everest','/destinations/annapurna','/destinations/manaslu','/destinations/dolpo','/activities','/activities/trekking','/activities/cultural-journeys','/activities/expeditions','/activities/private-journeys','/blog','/blog/finding-your-own-pace','/blog/the-spaces-between-the-peaks','/blog/a-mountain-photo-journal','/gallery','/reviews','/privacy-policy','/terms-conditions','/payment','/admin','/contact'];
 await mkdir('test-results',{recursive:true});
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:950});
  for(const route of routes){const response=await page.goto(base+route);assert.equal(response.status(),200,route);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${route} overflows at ${width}`);assert.equal(await page.getByRole('heading',{level:1}).count(),1,`${route} needs one page title`);}
 }
 for(const route of ['/destinations/unknown','/activities/unknown','/blog/unknown'])assert.equal((await page.request.get(base+route)).status(),404);
 for(const [route,name] of [['/contact','contact-complete'],['/about','about'],['/gallery','gallery'],['/blog','journal'],['/destinations/everest','region']]){await page.goto(base+route);await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=700){window.scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,40));}});await page.waitForTimeout(250);assert.deepEqual(await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)),[]);await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(80);await page.screenshot({path:`test-results/${name}-desktop.png`,fullPage:true,animations:'disabled'});}
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/contact');await page.screenshot({path:'test-results/contact-complete-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS: 21 public/utility page layouts at four widths, contact links/placeholder, articles, gallery filters/keyboard/focus, review empty state, staff access and payment lookup.');
}finally{await browser.close();}
