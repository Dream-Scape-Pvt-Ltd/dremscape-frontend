import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {expeditionPreviewTrips,trips,type Trip} from '../src/lib/catalog.ts';
import {climbingType,matchesCollection,journeyKind} from '../src/lib/navigation.ts';
import {zoneForPlace} from '../src/lib/nepal-zones.ts';
import {scheduledJourneys,departureState} from '../src/lib/departure-calendar.ts';
import type {Departure} from '../src/lib/journeys.ts';

const date=(overrides:Partial<Departure>={}):Departure=>({id:'date-1',start_date:'2030-10-01',end_date:'2030-10-18',price_usd:'1900',max_seats:8,available_seats:5,status:'LIMITED',availability_state:'AVAILABLE',waitlist_enabled:false,is_guaranteed:false,...overrides});
test('combined destination labels do not mix Mustang and Annapurna routes',()=>{
  assert.deepEqual(trips.filter(t=>matchesCollection(t,{kind:'treks',region:'mustang'})).map(t=>t.slug),['upper-mustang']);
  assert.deepEqual(trips.filter(t=>matchesCollection(t,{kind:'treks',region:'annapurna'})).map(t=>t.slug),['annapurna-circuit-tilicho']);
  assert.equal(matchesCollection(trips[2],{region:'langtang'}),false);
});
test('Nepal travel areas keep CMS routes in the right broad group',()=>{
  assert.deepEqual(trips.filter(t=>matchesCollection(t,{kind:'treks',zone:'eastern'})).map(t=>t.slug),['everest-base-camp-cho-la']);
  assert.deepEqual(trips.filter(t=>matchesCollection(t,{kind:'treks',zone:'eastern',region:'Everest'})).map(t=>t.slug),['everest-base-camp-cho-la']);
  assert.deepEqual(trips.filter(t=>matchesCollection(t,{kind:'treks',zone:'eastern',region:'Kanchenjunga'})).map(t=>t.slug),[]);
  assert.deepEqual(trips.filter(t=>matchesCollection(t,{kind:'treks',zone:'western'})).map(t=>t.slug),['annapurna-circuit-tilicho','manaslu-wild-circuit','upper-mustang']);
  assert.equal(matchesCollection({...trips[0],slug:'dolpo-phoksundo',title:'Dolpo & Phoksundo',destination_slug:'dolpo',destination_name:'Dolpo & West Nepal'},{zone:'mid-western'}),true);
  assert.equal(zoneForPlace('Langtang Valley'),'central');
  assert.equal(zoneForPlace('Saipal Himal'),'far-western');
});
test('a changed CMS destination and category replace old title-based collections',()=>{
  const reassigned={...trips[0],destination_slug:'khaptad',destination_name:'Khaptad National Park'};
  assert.equal(matchesCollection(reassigned,{kind:'treks',zone:'eastern'}),false);
  assert.equal(matchesCollection(reassigned,{kind:'treks',zone:'far-western'}),true);
  assert.equal(matchesCollection(reassigned,{kind:'treks',region:'Everest'}),false);
  assert.equal(matchesCollection(reassigned,{kind:'treks',region:'Khaptad'}),true);
  const recategorized={...reassigned,category_slug:'culture-sightseeing',category_name:'Culture & Sightseeing'};
  assert.equal(matchesCollection(recategorized,{kind:'treks'}),false);
  assert.equal(matchesCollection(recategorized,{kind:'tours',tour:'culture'}),true);
  assert.equal(matchesCollection({...recategorized,category_slug:'luxury-tours',category_name:'Luxury Tours'},{kind:'tours',tour:'culture'}),false);
});
test('tour styles and climbing combine with geography without returning ordinary treks',()=>{
  const safari:Trip={...trips[0],slug:'chitwan-jungle-safari',title:'Chitwan Jungle Safari',category_slug:'wildlife-tours',category_name:'Wildlife Tours'};
  assert.equal(journeyKind(safari),'tours');
  assert.equal(matchesCollection(safari,{kind:'tours',tour:'wildlife'}),true);
  assert.equal(matchesCollection(safari,{kind:'tours',tour:'heli'}),false);
  assert.equal(matchesCollection(trips[0],{kind:'tours',tour:'luxury'}),false);
  const climbing={...trips[0],category_slug:'peak-climbing',category_name:'Peak Climbing'};
  assert.equal(matchesCollection(climbing,{kind:'expeditions',region:'everest'}),true);
  assert.equal(matchesCollection(climbing,{kind:'expeditions',region:'annapurna'}),false);
  assert.equal(matchesCollection({...trips[0],destination_slug:'paro',destination_name:'Bhutan',title:'Druk Path',slug:'druk-path'},{country:'bhutan'}),true);
});
test('climbing collections follow the saved CMS category, including after reassignment',()=>{
  const expedition=expeditionPreviewTrips[0];
  assert.equal(climbingType(expedition),'expedition');
  assert.equal(matchesCollection(expedition,{kind:'expeditions',climb:'expedition'}),true);
  assert.equal(matchesCollection(expedition,{kind:'expeditions',climb:'peak'}),false);
  const moved={...expedition,category_slug:'peak-climbing',category_name:'Peak Climbing'};
  assert.equal(climbingType(moved),'peak');
  assert.equal(matchesCollection(moved,{kind:'expeditions',climb:'expedition'}),false);
  assert.equal(matchesCollection(moved,{kind:'expeditions',climb:'peak'}),true);
  assert.equal(matchesCollection(trips[0],{kind:'expeditions'}),false);
});
test('Bhutan place assignments determine country results even when the trip title omits Bhutan',()=>{
  const assigned={...trips[0],title:'Druk Path',slug:'druk-path',destination_name:'Paro',destination_slug:'paro',destination_country:'BHUTAN'};
  assert.equal(matchesCollection(assigned,{country:'bhutan'}),true);
  assert.equal(matchesCollection(assigned,{country:'india'}),false);
  assert.equal(matchesCollection({...assigned,destination_country:'INDIA'},{country:'bhutan'}),false);
});
test('upcoming calendar removes past/cancelled dates and keeps full trips in chronological order',()=>{
  const result=scheduledJourneys([
    {trip:trips[0],departure:date({id:'later',start_date:'2030-11-01'})},
    {trip:trips[0],departure:date({id:'past',start_date:'2030-09-30'})},
    {trip:trips[0],departure:date({id:'cancelled',status:'CANCELLED'})},
    {trip:trips[0],departure:date({id:'full',available_seats:0,status:'SOLD_OUT'})},
  ],'2030-10-01');
  assert.deepEqual(result.map(row=>row.departure.id),['full','later']);
});
test('closed dates cannot advertise bookable seats even when the seat count is positive',()=>{
  assert.equal(departureState(date({status:'SOLD_OUT',available_seats:6})).request,false);
  assert.equal(departureState(date({available_seats:0,waitlist_enabled:true})).label,'Waitlist open');
  assert.equal(departureState(date({available_seats:2})).label,'Few seats left');
  assert.equal(departureState(date({is_guaranteed:true})).label,'Guaranteed departure');
});

registerHooks({resolve(specifier,context,next){
  if(specifier==='next/server')return next('next/server.js',context);
  if(specifier.startsWith('@/'))return next(new URL(`../src/${specifier.slice(2)}.ts`,import.meta.url).href,context);
  if(/^\.\.?\//.test(specifier)&& !/\.\w+$/.test(specifier)&&context.parentURL?.endsWith('.ts'))return next(`${specifier}.ts`,context);
  return next(specifier,context);
}});
test('public departures endpoint reads every calendar page and reports partial failures',async()=>{
  const realFetch=globalThis.fetch,previousUrl=process.env.BACKEND_API_URL;
  process.env.BACKEND_API_URL='http://calendar.test/api/v1';
  const calls:string[]=[];
  globalThis.fetch=(async(input)=>{
    const url=new URL(String(input));calls.push(url.pathname+url.search);
    let data:unknown;
    if(url.pathname==='/api/v1/trips/')data={results:trips.slice(0,2),next:null};
    else if(url.pathname.includes(trips[1].slug))return new Response(JSON.stringify({success:false}),{status:503});
    else data={results:[date({id:url.searchParams.get('page')==='2'?'page-two':'page-one',start_date:'2099-10-01',end_date:'2099-10-18'})],next:url.searchParams.get('page')==='1'?'untrusted-next-url':null};
    return new Response(JSON.stringify({success:true,data}),{headers:{'Content-Type':'application/json'}});
  }) as typeof fetch;
  try{
    const {GET}=await import('../src/app/api/departures/route.ts');
    const response=await GET();const body=await response.json();
    assert.equal(response.status,200);
    assert.equal(response.headers.get('Cache-Control'),'no-store');
    assert.deepEqual(body.departures.map((row:{departure:Departure})=>row.departure.id),['page-one','page-two']);
    assert.deepEqual(body.unavailable,[trips[1].title]);
    assert.ok(calls.some(path=>path.endsWith('page=2')));
    assert.ok(calls.every(path=>!path.includes('/trips/departures/')));
  }finally{globalThis.fetch=realFetch;if(previousUrl===undefined)delete process.env.BACKEND_API_URL;else process.env.BACKEND_API_URL=previousUrl;}
});
