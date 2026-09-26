export function money(value:string|number) {return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(Number(value));}
export function dateLabel(value:string) {return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));}
/** The four difficulty levels, easiest first. */
export const difficultyLevels=[{value:'EASY',label:'Easy'},{value:'NORMAL',label:'Normal'},{value:'DIFFICULT',label:'Difficult'},{value:'EXTREME',label:'Extreme'}] as const;
export function difficulty(value:string) {return difficultyLevels.find(level=>level.value===value)?.label||value;}
export function errorText(body:{error?:string;fields?:unknown}) {
  const details:string[]=[];
  function collect(value:unknown,path:string) {
    if(typeof value==='string') details.push(`${path ? path.replaceAll('_',' ')+': ' : ''}${value}`);
    else if(Array.isArray(value)) value.forEach(v=>collect(v,path));
    else if(value&&typeof value==='object') Object.entries(value).forEach(([k,v])=>collect(v,path ? `${path} ${k}` : k));
  }
  collect(body.fields,'');
  return [body.error||'The request could not be completed.',...details.slice(0,5)].join(' ');
}
