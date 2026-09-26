import test from 'node:test';
import assert from 'node:assert/strict';
import {trips} from '../src/lib/catalog.ts';
import {matchTrips,parseQuery,searchSite} from '../src/lib/search.ts';

const expedition={...trips[0],slug:'island-peak',title:'Island Peak Climb',category_name:'Mountain Expedition',category_slug:'mountain-expedition',tags:'',duration_days:19,starting_price_usd:'3200'};
const data={
  trips:[...trips,expedition],
  destinations:[{slug:'bhutan',name:'Bhutan',country:'BHUTAN'},{slug:'nepal-himalayas',name:'Nepal Himalayas',short:'Solukhumbu',country:'NEPAL'}],
  guides:[{slug:'slow-khumbu',title:'The Art of Slow Trekking in the Khumbu'}],
};
const slugs=(query:string)=>searchSite(query,data).trips.map(t=>t.slug);

test('partial words, typos and shorthand find the right trek',()=>{
  assert.equal(slugs('ever')[0],'everest-base-camp-cho-la');
  assert.equal(slugs('annapurana')[0],'annapurna-circuit-tilicho');
  assert.equal(slugs('EBC')[0],'everest-base-camp-cho-la');
  assert.equal(slugs('mustang trek')[0],'upper-mustang');
});
test('climbing words find expeditions, not treks',()=>{
  assert.deepEqual(slugs('peak climbing'),['island-peak']);
});
test('days and budget filter the treks',()=>{
  assert.deepEqual(parseQuery('12 days under $2,000').constraints,{maxPrice:2000,days:12});
  const found=slugs('12 days under 2000');
  assert.ok(found.length>0);
  assert.ok(found.every(slug=>['upper-mustang','manaslu-wild-circuit'].includes(slug)));
});
test('short and long pick trek lengths',()=>{
  assert.deepEqual(slugs('short trek'),[]);
  assert.deepEqual(slugs('long treks').sort(),['annapurna-circuit-tilicho','everest-base-camp-cho-la','manaslu-wild-circuit']);
});
test('the four difficulty levels and their everyday words are searchable',()=>{
  assert.deepEqual(slugs('normal trek'),['upper-mustang']);
  assert.ok(slugs('strenuous').length>0&&!slugs('strenuous').includes('upper-mustang'));
  assert.deepEqual(slugs('extreme'),[]);
});
test('destinations and journal stories are searched too',()=>{
  assert.equal(searchSite('bhut',data).destinations[0].slug,'bhutan');
  assert.equal(searchSite('solukhumbu',data).destinations[0].slug,'nepal-himalayas');
  assert.equal(searchSite('slow trekking',data).guides[0].slug,'slow-khumbu');
});
test('falls back to partial matches instead of nothing',()=>{
  const result=searchSite('everest yoga',data);
  assert.equal(result.partial,true);
  assert.ok(result.trips.length>0);
});
test('an empty catalogue query keeps every trek',()=>{
  assert.equal(matchTrips(trips,'').length,trips.length);
});
