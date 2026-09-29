import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';

const base='http://127.0.0.1:3000';
const sources=JSON.parse(await readFile('scripts/trek-photo-sources.json','utf8'));
for(const source of sources){const hash=b=>createHash('sha256').update(b).digest('hex');assert.equal(hash(await readFile(source.output)),hash(await readFile('C:/Users/ACER/OneDrive/Desktop/dream scape project picture/'+source.source)),'Original photo must be preserved');}
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/blog');await page.locator('.memory-hero-main img').waitFor();assert.equal(await page.locator('.journal-card').count(),3);assert.equal(await page.locator('.memory-tile').count(),6);
  await page.getByRole('button',{name:'View all 18 photographs'}).click();assert.equal(await page.locator('.memory-tile').count(),18);
  const first=page.locator('.memory-tile').first();await first.click();await page.getByRole('dialog').waitFor();await page.locator('#memory-viewer-title').getByText('The people beside you',{exact:true}).waitFor();await page.keyboard.press('ArrowRight');await page.locator('#memory-viewer-title').getByText('A moment at the top',{exact:true}).waitFor();
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>!!document.activeElement?.closest('.memory-viewer')),true);await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);assert.equal(await first.evaluate(e=>e===document.activeElement),true);assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
  await page.getByRole('group',{name:'Memory categories'}).getByRole('button',{name:'Mountain light'}).click();assert.equal(await page.locator('.memory-tile').count(),3);
  await page.getByRole('searchbox',{name:'Search stories'}).fill('quieter');assert.equal(await page.locator('.journal-card').count(),1);await page.locator('.journal-card').click();await page.locator('.article-prose').waitFor();assert.equal(await page.locator('.story-memory').count(),4);await page.locator('.memory-open').first().click();await page.getByRole('button',{name:'Close memory'}).click();
  for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:950});for(const route of ['/blog','/blog/finding-your-own-pace','/blog/the-spaces-between-the-peaks','/blog/a-mountain-photo-journal']){assert.equal((await page.goto(base+route)).status(),200);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${route} overflow at ${width}`);assert.equal(await page.getByRole('heading',{level:1}).count(),1);}}
  await mkdir('test-results',{recursive:true});
  async function revealAll(){await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,75));}});await page.waitForFunction(()=>Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0));await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(900);}
  await page.goto(base+'/blog');await revealAll();await page.screenshot({path:'test-results/memories-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.goto(base+'/blog');await revealAll();await page.screenshot({path:'test-results/memories-mobile.png',fullPage:true});
  await page.goto(base+'/blog/the-spaces-between-the-peaks');await revealAll();await page.screenshot({path:'test-results/memories-story-mobile.png',fullPage:true});
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/blog');assert.equal(await page.locator('.memory-hero-main img').evaluate(e=>getComputedStyle(e).animationName),'none');assert.equal(await page.locator('.memory-reveal[data-enter="waiting"]').count(),0);
  await page.goto(base+'/');assert.equal(await page.locator('#journal img[src*="trek-memories"]').count(),3);
  assert.deepEqual(errors,[]);console.log('PASS: 18 original files preserved, three illustrated stories, filters, full-screen viewer, keyboard/focus restoration, images, five viewport widths and reduced motion.');
}finally{await browser.close();}
