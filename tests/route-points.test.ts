import test from 'node:test';
import assert from 'node:assert/strict';
import {routePoints} from '../src/lib/route-points.ts';

const day=(day_number:number,latitude:unknown,longitude:unknown,extra={})=>({day_number,latitude,longitude,overnight_stay:`Stay ${day_number}`,title:`Day ${day_number}`,is_acclimatization_day:false,...extra}) as Parameters<typeof routePoints>[0][number];

test('route points parse API decimal strings and keep day order',()=>{
  const points=routePoints([day(2,'27.8069000','86.7140000',{is_acclimatization_day:true}),day(1,27.687,86.7314)]);
  assert.deepEqual(points,[{day:1,lat:27.687,lng:86.7314,stay:'Stay 1',rest:false},{day:2,lat:27.8069,lng:86.714,stay:'Stay 2',rest:true}]);
});

test('route points drop missing, invalid, out-of-range and duplicate days',()=>{
  const points=routePoints([day(1,null,86),day(2,'',86),day(3,'abc',86),day(4,91,86),day(5,27,181),day(6,27,86),day(6,28,87),day(0,27,86)]);
  assert.deepEqual(points.map(p=>p.day),[6]);
  assert.equal(points[0].lat,27);
});

test('a zero coordinate is a real value',()=>{
  assert.equal(routePoints([day(1,0,0)]).length,1);
});
