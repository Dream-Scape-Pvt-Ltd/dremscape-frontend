import {connection} from 'next/server';
import {backend,backendConfigured,publicReadCache} from './backend';
import {listJourneys} from './journeys';
import {collectHomepageReviews,type PublishedReview} from './homepage-reviews';

export async function getHomepageReviews(){
  if(!backendConfigured())return {reviews:[],unavailable:false};
  await connection();
  try {
    const {trips}=await listJourneys();
    return await collectHomepageReviews(trips,async slug=>{
      // The public endpoint returns newest first. Three per trip suffice for the global newest three.
      const page=await backend<{results:PublishedReview[]}>(`trips/${encodeURIComponent(slug)}/reviews/?page_size=3&page=1`,publicReadCache('reviews'));
      if(!Array.isArray(page.results))throw new Error('Reviews unavailable');
      return page.results;
    });
  } catch {return {reviews:[],unavailable:true};}
}
