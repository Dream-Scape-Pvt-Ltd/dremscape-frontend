import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {trips} from '../src/lib/catalog.ts';

registerHooks({resolve(specifier,context,next){
  if(specifier==='next/server')return next('next/server.js',context);
  if(specifier.startsWith('@/'))return next(new URL(`../src/${specifier.slice(2)}.ts`,import.meta.url).href,context);
  if(/^\.\.?\//.test(specifier)&&!/\.\w+$/.test(specifier)&&context.parentURL?.endsWith('.ts'))return next(`${specifier}.ts`,context);
  return next(specifier,context);
}});

test('a published CMS trek replaces an old preview UUID by matching its slug',async()=>{
  const preview=trips.find(trip=>trip.slug==='manaslu-wild-circuit')!;
  const previousUrl=process.env.BACKEND_API_URL;
  const previousFetch=globalThis.fetch;
  process.env.BACKEND_API_URL='http://cms.test/api/v1';
  const calls:string[]=[];
  globalThis.fetch=(async(input)=>{
    const path=new URL(String(input)).pathname;
    calls.push(path);
    if(path.endsWith(`/${preview.id}/`)||path.includes(`/${preview.id}/departures/`))return new Response(JSON.stringify({success:false,error:{message:'Not found'}}),{status:404});
    const data=path.endsWith('/departures/')?{results:[],next:null}:{...preview,id:'b882a2cf-6d4c-4de5-bddc-cecf571d9130',hero_image_url:'/images/cms-manaslu.jpg',overview:'Approved CMS route',inclusions:[],exclusions:[],packing_list:[],best_seasons:[],gallery_images:[],itinerary_days:[{day_number:1,title:'CMS day one',description:'Edited in CMS',overnight_stay:'Kathmandu',elevation_meters:null,is_acclimatization_day:false}],departures:[]};
    return new Response(JSON.stringify({success:true,data}),{headers:{'Content-Type':'application/json'}});
  }) as typeof fetch;
  try{
    const {getJourney}=await import('../src/lib/journeys.ts');
    const result=await getJourney(preview.id);
    assert.equal(result.demo,false);
    assert.equal(result.journey.overview,'Approved CMS route');
    assert.equal(result.journey.itinerary_days[0]?.title,'CMS day one');
    assert.ok(calls.some(path=>path.endsWith('/manaslu-wild-circuit/')));
  }finally{
    globalThis.fetch=previousFetch;
    if(previousUrl===undefined)delete process.env.BACKEND_API_URL;else process.env.BACKEND_API_URL=previousUrl;
  }
});

test('production without a CMS never exposes preview offers',async()=>{
  const previousMode=process.env.NODE_ENV;
  const previousUrl=process.env.BACKEND_API_URL;
  process.env.NODE_ENV='production';
  delete process.env.BACKEND_API_URL;
  try{
    const {listJourneys,getJourney}=await import('../src/lib/journeys.ts');
    assert.deepEqual(await listJourneys(),{trips:[],demo:false});
    await assert.rejects(getJourney(trips[0].id),{status:404});
  }finally{
    if(previousMode===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=previousMode;
    if(previousUrl===undefined)delete process.env.BACKEND_API_URL;else process.env.BACKEND_API_URL=previousUrl;
  }
});
test('local preview templates stay out of the public list without a CMS',async()=>{
  const previousMode=process.env.NODE_ENV,previousUrl=process.env.BACKEND_API_URL;
  process.env.NODE_ENV='development';
  delete process.env.BACKEND_API_URL;
  try{
    const {listJourneys,getJourney}=await import('../src/lib/journeys.ts');
    assert.deepEqual(await listJourneys(),{trips:[],demo:false});
    const preview=await getJourney('everest-expedition-preview');
    assert.equal(preview.demo,true);
    assert.equal(preview.journey.departures.length,0);
  }finally{
    if(previousMode===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=previousMode;
    if(previousUrl===undefined)delete process.env.BACKEND_API_URL;else process.env.BACKEND_API_URL=previousUrl;
  }
});

test('an empty CMS stays empty and inactive trips cannot reach public lists or detail',async()=>{
  const previousMode=process.env.NODE_ENV,previousUrl=process.env.BACKEND_API_URL,previousFetch=globalThis.fetch;
  process.env.NODE_ENV='production';
  process.env.BACKEND_API_URL='http://cms.test/api/v1';
  const draft={...trips[0],is_active:false,overview:'Unpublished draft',best_seasons:[],inclusions:[],exclusions:[],packing_list:[],gallery_images:[],itinerary_days:[],departures:[]};
  let listItems:typeof draft[]=[];
  globalThis.fetch=(async(input)=>{
    const path=new URL(String(input)).pathname;
    const data=path==='/api/v1/trips/'?{results:listItems,next:null}:path===`/api/v1/trips/${draft.slug}/`?draft:{results:[],next:null};
    return new Response(JSON.stringify({success:true,data}),{headers:{'Content-Type':'application/json'}});
  }) as typeof fetch;
  try{
    const {listJourneys,getJourney}=await import('../src/lib/journeys.ts');
    assert.deepEqual(await listJourneys(),{trips:[],demo:false});
    listItems=[draft];
    assert.deepEqual(await listJourneys(),{trips:[],demo:false});
    await assert.rejects(getJourney(draft.slug),{status:404});
    const {GET:departures}=await import('../src/app/api/departures/route.ts');
    const calendar=await (await departures()).json();
    assert.deepEqual(calendar.departures,[]);
    assert.equal(calendar.demo,false);
  }finally{
    globalThis.fetch=previousFetch;
    if(previousMode===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=previousMode;
    if(previousUrl===undefined)delete process.env.BACKEND_API_URL;else process.env.BACKEND_API_URL=previousUrl;
  }
});

test('a configured but unavailable CMS fails closed in production',async()=>{
  const previousMode=process.env.NODE_ENV,previousUrl=process.env.BACKEND_API_URL,previousFetch=globalThis.fetch;
  process.env.NODE_ENV='production';
  process.env.BACKEND_API_URL='http://offline.test/api/v1';
  globalThis.fetch=(async()=>{throw new TypeError('Network unavailable');}) as typeof fetch;
  try{
    const {listJourneys}=await import('../src/lib/journeys.ts');
    await assert.rejects(listJourneys());
  }finally{
    globalThis.fetch=previousFetch;
    if(previousMode===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=previousMode;
    if(previousUrl===undefined)delete process.env.BACKEND_API_URL;else process.env.BACKEND_API_URL=previousUrl;
  }
});
test('a configured but unavailable CMS also fails closed in local development',async()=>{
  const previousMode=process.env.NODE_ENV,previousUrl=process.env.BACKEND_API_URL,previousFetch=globalThis.fetch;
  process.env.NODE_ENV='development';
  process.env.BACKEND_API_URL='http://offline.test/api/v1';
  globalThis.fetch=(async()=>{throw new TypeError('Network unavailable');}) as typeof fetch;
  try{
    const {listJourneys}=await import('../src/lib/journeys.ts');
    await assert.rejects(listJourneys());
  }finally{
    globalThis.fetch=previousFetch;
    if(previousMode===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=previousMode;
    if(previousUrl===undefined)delete process.env.BACKEND_API_URL;else process.env.BACKEND_API_URL=previousUrl;
  }
});
