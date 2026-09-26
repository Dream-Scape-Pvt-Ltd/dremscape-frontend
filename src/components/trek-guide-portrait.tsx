/** A guide's photo, or their initials when no photo has been added yet. */
export default function TrekGuidePortrait({name,photo,size='card'}:{name:string;photo?:string;size?:'card'|'profile'|'small'}) {
  const initials=name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]?.toUpperCase()).join('');
  return <span className={`guide-portrait guide-portrait-${size}`}>{photo?<img src={photo} alt={`${name}, trekking guide`} loading={size==='profile'?'eager':'lazy'}/>:<span className="guide-initials" aria-hidden="true">{initials}</span>}</span>;
}
