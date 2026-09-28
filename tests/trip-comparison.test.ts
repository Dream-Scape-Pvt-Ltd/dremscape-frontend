import test from 'node:test';
import assert from 'node:assert/strict';
import {matchesTripMetrics} from '../src/lib/trip-comparison.ts';
import {trips} from '../src/lib/catalog.ts';
test('budget and altitude bands include their boundaries and reject missing prices',()=>{
 const trip={...trips[0],starting_price_usd:'1500',altitude_max_meters:4000};
 assert.equal(matchesTripMetrics(trip,'under-1500',''),false);
 assert.equal(matchesTripMetrics(trip,'1500-2500','4000-5500'),true);
 assert.equal(matchesTripMetrics({...trip,starting_price_usd:'0'},'under-1500',''),false);
 assert.equal(matchesTripMetrics({...trip,altitude_max_meters:0},'','under-4000'),false);
 assert.equal(matchesTripMetrics({...trip,starting_price_usd:'2500',altitude_max_meters:5500},'1500-2500','4000-5500'),true);
});
