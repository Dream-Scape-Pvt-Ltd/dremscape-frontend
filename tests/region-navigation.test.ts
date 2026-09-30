import test from 'node:test';
import assert from 'node:assert/strict';
import {regionCollectionHref} from '../src/lib/region-navigation.ts';
import {previewTrips} from '../src/lib/catalog.ts';
import {nepalZones,zoneForTrip} from '../src/lib/nepal-zones.ts';
test('trip breadcrumb returns to its Nepal trekking region rather than an unavailable destination id',()=>{
  const trip={slug:'everest-base-camp-cho-la',title:'Everest Base Camp & Cho La',destination_slug:'everest-khumbu',destination_name:'Everest & Khumbu'};
  assert.equal(regionCollectionHref(trip),'/treks?kind=treks&zone=eastern');
  assert.equal(regionCollectionHref({...trip,slug:'upper-mustang',title:'Upper Mustang',destination_slug:'annapurna-mustang',destination_name:'Annapurna & Mustang'}),'/treks?kind=treks&zone=western');
  assert.equal(regionCollectionHref({...trip,slug:'unknown',title:'A new route',destination_slug:'unknown',destination_name:'New region'}),'/treks');
});
test('preview trek ideas give every Nepal region something to explore',()=>{
  const covered=new Set(previewTrips.map(zoneForTrip));
  for(const zone of nepalZones)assert.ok(covered.has(zone.value),`${zone.label} should have a preview route`);
});
test('breadcrumb follows reassigned CMS geography even when the old route name remains',()=>{
  const trip={slug:'everest-base-camp-cho-la',title:'Everest Base Camp & Cho La',destination_slug:'khaptad',destination_name:'Khaptad National Park'};
  assert.equal(regionCollectionHref(trip),'/treks?kind=treks&zone=far-western');
});
