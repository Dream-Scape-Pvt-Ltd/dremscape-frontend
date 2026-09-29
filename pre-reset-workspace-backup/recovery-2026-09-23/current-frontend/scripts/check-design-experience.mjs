import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';

await mkdir('test-results',{recursive:true});
const location=JSON.parse(await readFile('src/content/company-location.json','utf8'));
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:960}});
const errors=[];page.on('pageerror',error=>errors.push(error.message));
const routes=['/','/about','/contact','/treks','/destinations','/destinations/nepal','/destinations/beyond-nepal','/blog','/blog/finding-your-own-pace','/gallery','/activities','/reviews','/login','/payment','/privacy-policy'];
for(const width of [1440,1024,768,390,320]){
  await page.setViewportSize({width,height:960});
  for(const route of routes){
    const response=await page.goto(`http://127.0.0.1:3000${route}`);
    assert.equal(response.status(),200,route);
    await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.locator('h1').count(),1,`heading ${route}`);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow ${route} at ${width}`);
    if(width===1440&&['/about','/treks'].includes(route))await page.screenshot({path:`test-results/experience-${route.slice(1)}.png`});
    if(route==='/about'){
      assert.equal(await page.locator('.contact-map-copy address').innerText(),location.address);
      assert.equal(await page.locator('.carousel-slide').count(),5);
      assert(await page.getByRole('button',{name:'Previous trek memories'}).isDisabled());
      await page.getByRole('button',{name:'Next trek memories'}).click();
      await page.waitForFunction(()=>document.querySelector('.carousel-track').scrollLeft>50);
      await page.waitForTimeout(750);
      assert(!(await page.getByRole('button',{name:'Previous trek memories'}).isDisabled()));
      await page.locator('.carousel-track').focus();await page.keyboard.press('ArrowLeft');
      await page.waitForFunction(()=>document.querySelector('.carousel-track').scrollLeft<4);
      if(width===1440||width===390){await page.locator('.memory-carousel').scrollIntoViewIfNeeded();await page.waitForTimeout(700);await page.screenshot({path:`test-results/experience-carousel-${width}.png`});}
    }
    if(route==='/contact')assert.equal(await page.locator('.contact-map-copy address').innerText(),location.address);
  }
  console.log(`Layout and carousel passed at ${width}px`);
}
await page.goto('http://127.0.0.1:3000/about');
await page.route('https://maps.google.com/**',route=>route.abort('failed'));
await page.getByRole('button',{name:'View interactive map'}).click();
await page.getByText('The map could not load here.').waitFor();
assert((await page.getByRole('link',{name:'Get directions'}).getAttribute('href')).includes(encodeURIComponent(location.mapQuery)));
await page.unroute('https://maps.google.com/**');
await page.goto('http://127.0.0.1:3000');
assert.equal(await page.locator('.testimonial-landscape').count(),0);
await page.locator('.footer-landscape').scrollIntoViewIfNeeded();
await page.waitForFunction(()=>document.querySelector('.footer-landscape img').naturalWidth>0);
await page.screenshot({path:'test-results/experience-footer-mobile.png'});
const reduced=await browser.newPage({reducedMotion:'reduce',viewport:{width:390,height:850}});
await reduced.goto('http://127.0.0.1:3000/about');
await reduced.getByRole('button',{name:'Next trek memories'}).click();
assert(await reduced.locator('.carousel-track').evaluate(node=>node.scrollLeft>50));
assert.equal(await reduced.evaluate(()=>document.getAnimations().filter(animation=>animation.playState==='running').length),0);
assert.deepEqual(errors,[]);
await browser.close();
console.log('75 route/viewport checks, carousel controls, reduced motion, shared address and map failure fallback passed.');
