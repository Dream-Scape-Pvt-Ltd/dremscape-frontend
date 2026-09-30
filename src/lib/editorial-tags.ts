/** Secondary discovery labels. A journey still has exactly one CMS destination. */
export const editorialTagOptions=[
  {value:'popular-trek',label:'Popular Trek'},
  {value:'restricted-area',label:'Restricted Area'},
  {value:'off-the-beaten-path',label:'Off-the-Beaten-Path'},
  {value:'monsoon-rainshadow',label:'Monsoon / Rainshadow'},
  {value:'short-trek',label:'Short Trek'},
  {value:'family-suitable',label:'Family Suitable'},
  {value:'high-altitude',label:'High-Altitude'},
  {value:'base-camp',label:'Base Camp'},
  {value:'circuit',label:'Circuit'},
  {value:'cultural',label:'Cultural'},
  {value:'remote-wilderness',label:'Remote Wilderness'},
] as const;

export function normalizeEditorialTags(value:unknown):string[]{
  if(!Array.isArray(value))return [];
  const allowed=new Set<string>(editorialTagOptions.map(tag=>tag.value));
  return [...new Set(value.filter((tag):tag is string=>typeof tag==='string'&&allowed.has(tag)))];
}
