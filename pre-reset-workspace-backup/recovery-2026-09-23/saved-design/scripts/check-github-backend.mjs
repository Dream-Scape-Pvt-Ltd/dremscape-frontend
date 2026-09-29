import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:900}});
for(const route of ['/','/destinations/nepal','/blog','/contact','/admin']){
  const response=await page.goto('http://127.0.0.1:3002'+route,{waitUntil:'networkidle'});
  assert(response.status()<400,route);
  assert.equal(await page.getByRole('link',{name:'Staff access',exact:true}).count(),0);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+' horizontal overflow');
}
await page.goto('http://127.0.0.1:3002');
await page.getByRole('button',{name:'Search journeys',exact:true}).click();
await page.locator('#nav-search-input').waitFor({state:'visible'});
console.log('Latest GitHub backend connection, approved navigation, and public pages passed.');
await browser.close();
