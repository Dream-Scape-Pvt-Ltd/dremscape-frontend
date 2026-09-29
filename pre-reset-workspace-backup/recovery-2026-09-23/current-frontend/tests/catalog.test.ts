import test from 'node:test';
import assert from 'node:assert/strict';
import { filterTrips, unwrapList, type Trip } from '../src/lib/catalog.ts';

const testTrips: Trip[] = [
  { slug:'everest-base-camp-cho-la', title:'Everest Base Camp & Cho La Pass', destination_name:'Everest & Khumbu', destination_slug:'everest', category_name:'Treks', category_slug:'treks', duration_days:16, starting_price_usd:'1890', altitude_max_meters:5545, difficulty_grade:'Challenging', image:'222-242-imgEverestBaseCampChoLaPassTrekkingRoute', tags:'Gokyo Lakes · High Pass · Sherpa Guide' },
  { slug:'annapurna-circuit-tilicho', title:'Annapurna Circuit & Tilicho Lake', destination_name:'Annapurna & Mustang', destination_slug:'annapurna', category_name:'Treks', category_slug:'treks', duration_days:14, starting_price_usd:'1540', altitude_max_meters:5416, difficulty_grade:'Challenging', image:'222-242-imgAnnapurnaCircuitAndTilichoLakeHighGlacialLake', tags:'Thorong La · Glacial Lake · Teahouses' },
  { slug:'manaslu-wild-circuit', title:'Manaslu Wild Circuit & Larkya', destination_name:'Manaslu & Langtang', destination_slug:'manaslu', category_name:'Treks', category_slug:'treks', duration_days:15, starting_price_usd:'1720', altitude_max_meters:5106, difficulty_grade:'Challenging', image:'222-242-imgManasluCircuitLarkyaPassRemoteHimalayas', tags:'Restricted Area · Larkya La · Wild Valley' },
  { slug:'upper-mustang', title:'Upper Mustang & Lo Manthang', destination_name:'Annapurna & Mustang', destination_slug:'annapurna', category_name:'Treks', category_slug:'treks', duration_days:12, starting_price_usd:'2150', altitude_max_meters:3840, difficulty_grade:'Moderate', image:'222-242-imgUpperMustangLoManthangWalledCityRedCliffs', tags:'Walled City · Caves · Tibetan Culture' },
];

test('catalog filters combine region, category and duration',()=>{
  assert.equal(filterTrips(testTrips,'annapurna','treks','medium').length,2);
  assert.equal(filterTrips(testTrips,'everest','treks','short').length,0);
  assert.equal(filterTrips(testTrips,'','tours','').length,0);
  assert.equal(filterTrips(testTrips,'','','').length,4);
});
test('Django wrapped pagination is decoded and errors are rejected',()=>{
  assert.deepEqual(unwrapList({success:true,data:{count:4,results:testTrips}}),testTrips);
  assert.deepEqual(unwrapList({success:true,data:[]}),[]);
  assert.throws(()=>unwrapList({success:false,error:{message:'Unavailable'}}));
  assert.throws(()=>unwrapList({unexpected:true}));
});

