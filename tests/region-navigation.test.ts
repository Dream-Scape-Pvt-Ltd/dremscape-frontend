import test from 'node:test';
import assert from 'node:assert/strict';
import {regionCollectionHref} from '../src/lib/region-navigation.ts';
test('trip breadcrumb returns to its public region rather than an unavailable destination id',()=>{
  const trip={slug:'everest-base-camp-cho-la',title:'Everest Base Camp & Cho La',destination_slug:'everest-khumbu',destination_name:'Everest & Khumbu'};
  assert.equal(regionCollectionHref(trip),'/treks?kind=treks&region=everest');
  assert.equal(regionCollectionHref({...trip,slug:'upper-mustang',title:'Upper Mustang',destination_slug:'annapurna-mustang',destination_name:'Annapurna & Mustang'}),'/treks?kind=treks&region=mustang');
  assert.equal(regionCollectionHref({...trip,slug:'unknown',title:'A new route',destination_slug:'unknown',destination_name:'New region'}),'/treks');
});
