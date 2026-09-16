import test from 'node:test';
import assert from 'node:assert/strict';
import { filterTrips, trips, unwrapList } from '../src/lib/catalog.ts';
test('catalog filters combine region, category and duration',()=>{
  assert.equal(filterTrips(trips,'annapurna','treks','medium').length,2);
  assert.equal(filterTrips(trips,'everest','treks','short').length,0);
  assert.equal(filterTrips(trips,'','tours','').length,0);
  assert.equal(filterTrips(trips,'','','').length,4);
});
test('Django wrapped pagination is decoded and errors are rejected',()=>{
  assert.deepEqual(unwrapList({success:true,data:{count:4,results:trips}}),trips);
  assert.deepEqual(unwrapList({success:true,data:[]}),[]);
  assert.throws(()=>unwrapList({success:false,error:{message:'Unavailable'}}));
  assert.throws(()=>unwrapList({unexpected:true}));
});
