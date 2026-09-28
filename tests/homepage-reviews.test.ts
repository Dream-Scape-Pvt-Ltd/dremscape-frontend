import test from 'node:test';
import assert from 'node:assert/strict';
import {collectHomepageReviews,type PublishedReview} from '../src/lib/homepage-reviews.ts';

const review=(id:string,overrides:Partial<PublishedReview>={}):PublishedReview=>({id,reviewer_name:'Test traveller',reviewer_country:'Nepal',rating_overall:5,title:'A test story',content:'Published review content.',is_published:true,created_at:'2026-09-01T12:00:00Z',...overrides});
const trips=[{slug:'everest',title:'Everest journey'},{slug:'manaslu',title:'Manaslu journey'}];

test('homepage reviews omit unpublished and invalid endorsements and keep actual trip attribution',async()=>{
  const result=await collectHomepageReviews(trips,async slug=>slug==='everest'?[
    review('published'),review('moderation',{is_published:false}),review('invalid',{rating_overall:6}),review('anonymous',{reviewer_name:''}),review('empty',{content:' '}),
  ]:[]);
  assert.deepEqual(result.reviews.map(row=>row.id),['published']);
  assert.equal(result.reviews[0].trip_title,'Everest journey');
  assert.equal(result.reviews[0].trip_slug,'everest');
  assert.equal(result.unavailable,false);
});

test('homepage chooses newest stories across journeys and deduplicates review ids',async()=>{
  const result=await collectHomepageReviews(trips,async slug=>slug==='everest'?[
    review('older'),review('newest',{created_at:'2026-09-25T12:00:00Z'}),review('shared',{created_at:'2026-09-20T12:00:00Z'}),
  ]:[review('shared',{created_at:'2026-09-20T12:00:00Z'}),review('recent',{created_at:'2026-09-22T12:00:00Z'})]);
  assert.deepEqual(result.reviews.map(row=>row.id),['newest','recent','shared']);
});

test('review fetch concurrency is bounded and one failed journey does not hide other stories',async()=>{
  let active=0,max=0;
  const journeys=Array.from({length:9},(_,index)=>({slug:`trip-${index}`,title:`Trip ${index}`}));
  const result=await collectHomepageReviews(journeys,async slug=>{
    active++;max=Math.max(max,active);
    await new Promise(resolve=>setTimeout(resolve,5));active--;
    if(slug==='trip-0')throw new Error('Unavailable');
    return [review(slug)];
  });
  assert.ok(max<=4);assert.ok(max>1);
  assert.equal(result.reviews.length,3);assert.equal(result.unavailable,false);
});

test('empty and unavailable review feeds are distinct and never generate sample reviews',async()=>{
  const empty=await collectHomepageReviews([],async()=>{throw new Error('Should not read');});
  assert.deepEqual(empty,{reviews:[],unavailable:false});
  const outage=await collectHomepageReviews(trips,async()=>{throw new Error('Unavailable');});
  assert.deepEqual(outage,{reviews:[],unavailable:true});
});
