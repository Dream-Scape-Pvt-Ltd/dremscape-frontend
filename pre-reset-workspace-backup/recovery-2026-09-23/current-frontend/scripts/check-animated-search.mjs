import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const width of [1440,1024,768,390,320]){
 await page.setViewportSize({width,height:900});
 for(const route of ['/','/about','/contact','/blog','/destinations']){
 await page.goto(`http://127.0.0.1:3000${route}`);
 await page.getByRole('button',{name:'Search journeys',exact:true}).click();
 await page.waitForTimeout(450);
 assert.equal(await page.locator('#nav-search-input').evaluate(el=>el===document.activeElement),true);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${route} overflow ${width}`);
 assert(await page.locator('#journey-search').evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight}));
 if(route==='/'&&[1440,390].includes(width))await page.screenshot({path:`test-results/animated-search-${width}.png`});
 await page.keyboard.press('Escape');
 assert.equal(await page.getByRole('button',{name:'Search journeys',exact:true}).evaluate(el=>el===document.activeElement),true);
 assert.equal(await page.locator('#journey-search').getAttribute('inert'),'');
 }
 console.log(`Search panel layout and keyboard passed at ${width}px`);
}
await page.getByRole('button',{name:'Search journeys',exact:true}).click();await page.locator('#nav-search-input').fill('Everest');await page.locator('#nav-search-input').press('Enter');await page.waitForURL('**/treks?q=Everest');assert.equal(await page.getByRole('searchbox',{name:'Search treks',exact:true}).inputValue(),'Everest');
await page.getByRole('button',{name:'Search journeys',exact:true}).click();await page.getByRole('button',{name:'Menu',exact:true}).click();assert.equal(await page.locator('#journey-search').getAttribute('inert'),'');assert(await page.locator('#main-navigation').isVisible());await page.keyboard.press('Escape');
await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'Search journeys',exact:true}).click();assert.equal(await page.locator('#journey-search').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');assert.equal(await page.locator('#journey-search').evaluate(el=>el.getAnimations({subtree:true}).length),0);
assert.deepEqual(errors,[]);console.log('Search submission, menu exclusivity and reduced motion passed');await browser.close();
