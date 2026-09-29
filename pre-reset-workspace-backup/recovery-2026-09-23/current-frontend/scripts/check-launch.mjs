import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('test-results',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const width of [1440,768,390,320]){
 await page.setViewportSize({width,height:900});
 for(const route of ['/','/blog','/blog/finding-your-own-pace','/destinations','/destinations/beyond-nepal','/about','/contact','/admin']){
  const response=await page.goto('http://127.0.0.1:3000'+route,{waitUntil:'networkidle'});assert(response.status()<400,`${route} status ${response.status()}`);
  const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,offenders:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+2).slice(0,8).map(e=>e.className)}));
  assert(overflow.scroll<=width+1,`${route} at ${width}: ${JSON.stringify(overflow)}`);
  assert.equal(await page.getByRole('link',{name:'Staff access',exact:true}).count(),0);
  if(route!='/admin'){assert.equal(await page.locator('.footer-landscape img').count(),1);}
  if(route==='/destinations')assert.equal(await page.getByRole('link',{name:'Beyond Nepal',exact:true}).count(),1);
  if((width===1440||width===390)&&['/','/blog','/contact'].includes(route))await page.screenshot({path:`test-results/launch-${width}-${route.replaceAll('/','')||'home'}.png`,fullPage:false});
 }
 console.log(`Passed all eight routes at ${width}px`);
}
assert.deepEqual(errors,[]);await browser.close();
