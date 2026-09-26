/**
 * Public addresses for content. Each item opens by its UUID in a query
 * parameter (`/treks?id=<uuid>`); the old slug paths redirect here.
 */
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value:unknown):value is string {return typeof value==='string'&&UUID.test(value);}

function withId(path:string,id:string,extra:Record<string,string|undefined>={}){
  const query=new URLSearchParams({id});
  for(const [key,value] of Object.entries(extra))if(value)query.set(key,value);
  return `${path}?${query}`;
}
export const trekHref=(id:string,extra?:{departure?:string})=>withId('/treks',id,extra);
export const guideHref=(id:string)=>withId('/guides',id);
/** Nepal as a whole has its own collection page; every other destination opens by id. */
export const destinationHref=(id:string,slug?:string)=>slug==='nepal'?'/destinations/nepal':withId('/destinations',id);
export const storyHref=(id:string)=>withId('/blog',id);
