import test from 'node:test';
import assert from 'node:assert/strict';
import {unpersistedTripFields} from '../src/lib/trip-save-verification.ts';

test('trip editor verifies a fresh CMS read and names fields that did not persist',()=>{
  const expected={title:'Rara route',destination:'destination-id',category:'trek-id',duration_days:12,starting_price_usd:1500,single_supplement_usd:null,is_active:false,hero_image_url:'/images/rara.jpg',gallery_images:['/images/rara-2.jpg'],inclusions:['Local guide','Park entry permit'],exclusions:['International flights'],packing_list:['Warm layers'],itinerary_days:[{day_number:1,title:'Walk to the lake',description:'A steady climb',overnight_stay:'Rara',elevation_meters:2990,accommodation_type:'TEAHOUSE',is_acclimatization_day:false,meals_included:[]}]};
  const saved={...expected,destination:{id:'destination-id'},category:{id:'trek-id'},starting_price_usd:'1500.00',single_supplement_usd:'0.00',itinerary_days:[{...expected.itinerary_days[0],id:'day-id'}]};
  assert.deepEqual(unpersistedTripFields(expected,saved),[]);
  assert.deepEqual(unpersistedTripFields(expected,{...saved,category:{id:'tour-id'},gallery_images:[]}),['category','gallery_images']);
  assert.deepEqual(unpersistedTripFields(expected,{...saved,inclusions:['Local guide'],exclusions:[],packing_list:[]}),['inclusions','exclusions','packing_list']);
});

test('itinerary coordinates compare numerically against the API decimal strings',()=>{
  const day={day_number:1,title:'Namche',description:'',overnight_stay:'Namche',elevation_meters:3440,accommodation_type:'TEAHOUSE',is_acclimatization_day:false,meals_included:[],latitude:27.8069,longitude:86.714};
  const expected={itinerary_days:[day]};
  assert.deepEqual(unpersistedTripFields(expected,{itinerary_days:[{...day,latitude:'27.8069000',longitude:'86.7140000'}]}),[]);
  assert.deepEqual(unpersistedTripFields(expected,{itinerary_days:[{...day,latitude:null,longitude:null}]}),['itinerary_days']);
  assert.deepEqual(unpersistedTripFields({itinerary_days:[{...day,latitude:null,longitude:null}]},{itinerary_days:[{...day,latitude:null,longitude:null}]}),[]);
});
