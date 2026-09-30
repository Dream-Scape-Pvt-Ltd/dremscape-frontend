/** Compare the trip editor's submitted facts with a fresh CMS read after save. */
const numbers=new Set(['duration_days','starting_price_usd','single_supplement_usd','altitude_max_meters','min_group_size','max_group_size']);
const itineraryFields=['day_number','title','description','overnight_stay','elevation_meters','accommodation_type','is_acclimatization_day','meals_included'] as const;

function same(expected:unknown,actual:unknown,key:string):boolean{
  if(key==='destination'||key==='category'){
    const assigned=actual&&typeof actual==='object'?'id' in actual?(actual as {id:unknown}).id:undefined:actual;
    return String(expected)===String(assigned);
  }
  if(numbers.has(key)){
    if(key==='single_supplement_usd'&&(expected==null||expected==='')&&Number(actual)===0)return true;
    return expected==null||expected===''?actual==null||actual==='' : Number(expected)===Number(actual);
  }
  if(key==='itinerary_days'){
    if(!Array.isArray(expected)||!Array.isArray(actual)||expected.length!==actual.length)return false;
    return expected.every((day,index)=>itineraryFields.every(field=>same(day[field],actual[index]?.[field],field)));
  }
  if(Array.isArray(expected))return Array.isArray(actual)&&JSON.stringify(expected)===JSON.stringify(actual);
  return expected===actual;
}

export function unpersistedTripFields(expected:Record<string,unknown>,actual:Record<string,unknown>):string[]{
  return Object.entries(expected).filter(([key,value])=>!same(value,actual[key],key)).map(([key])=>key);
}
