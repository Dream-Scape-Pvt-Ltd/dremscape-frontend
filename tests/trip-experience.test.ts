import test from 'node:test';
import assert from 'node:assert/strict';
import {profilePoints,profileSegments} from '../src/lib/altitude-profile.ts';
import {receiptTripHref} from '../src/lib/booking-navigation.ts';
import {publicReceipt} from '../src/lib/booking-access.ts';
import type {BookingReceipt} from '../src/lib/booking.ts';
const day=(n:number,e:number|null)=>({day_number:n,elevation_meters:e,overnight_stay:`Place ${n}`,title:`Stage ${n}`,is_acclimatization_day:n===3});
test('altitude profile retains real day numbers, zero altitude and acclimatisation, without mutating CMS data',()=>{
  const days=[day(3,3440),day(1,0),day(2,null)];
  assert.deepEqual(profilePoints(days).map(p=>[p.day,p.elevation,p.rest]),[[1,0,false],[3,3440,true]]);
  assert.equal(days[0].day_number,3);
});
test('invalid or duplicate elevations cannot corrupt chart geometry',()=>{
  assert.deepEqual(profilePoints([day(1,NaN),day(2,Infinity),day(3,-1),day(4,9000),day(0,100),day(5,1400),day(5,1500)]).map(p=>p.elevation),[1400]);
  assert.deepEqual(profilePoints([]),[]);
});
test('receipt return links remain on this site and safely handle missing trip details',()=>{
  assert.equal(receiptTripHref('everest-base-camp'),'/treks/everest-base-camp');
  for(const bad of [undefined,null,'//evil.test','https://evil.test','../payment','x?next=bad',42])assert.equal(receiptTripHref(bad),'/treks');
});
test('receipt retains its trip reference while dropping private booking fields',()=>{
  const raw={booking_reference:'DS-1',trip_title:'Everest',trip_slug:'everest',trip_start_date:'2030-10-01',num_travelers:2,currency:'USD',total_amount_usd:'100',deposit_amount_usd:'20',amount_paid_usd:'0',status:'PENDING',access_token:'private',customer_email:'private@example.test',passengers:[{passport_number:'private'}]};
  const receipt=publicReceipt(raw as BookingReceipt);
  assert.equal(receipt.trip_slug,'everest');
  assert.equal('access_token' in receipt,false);assert.equal('customer_email' in receipt,false);assert.equal('passengers' in receipt,false);
  assert.equal(publicReceipt({...raw,trip_slug:'//external.test'}).trip_slug,undefined);
});

test('the chart leaves gaps for unknown nights and preserves a single or sea-level stop',()=>{
  const points=profilePoints([day(1,0),day(2,null),day(3,3440),day(4,3440),day(6,5000)]);
  assert.deepEqual(profileSegments(points).map(segment=>segment.map(p=>p.day)),[[1],[3,4],[6]]);
  assert.deepEqual(profileSegments([]),[]);
  assert.equal(profileSegments(profilePoints([day(1,0)]))[0][0].elevation,0);
});
