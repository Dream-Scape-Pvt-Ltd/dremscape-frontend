import {company} from '@/lib/company';
import {getSiteSettings} from '@/lib/site-settings';
import LocationMap from './location-map';

export default async function ContactMap(){
  const settings=await getSiteSettings();const company={area:settings.area,address:settings.address,mapQuery:settings.map_query,directionsNote:settings.directions_note};
  return <section className="contact-location-section container" aria-labelledby="location-title"><div className="contact-map-card"><div className="contact-map-copy"><span className="location-symbol" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg></span><p className="eyebrow">BEFORE THE MOUNTAINS, A HELLO</p><h2 id="location-title">Meet us<br/><em>in {company.area}.</em></h2><address>{company.address}</address>{company.directionsNote&&<p className="location-note">{company.directionsNote}</p>}<a className="button green" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.mapQuery)}`} target="_blank" rel="noopener noreferrer">Get directions <span aria-hidden="true">↗</span></a></div><div className="contact-map-frame"><LocationMap query={company.mapQuery} area={company.area}/></div></div></section>;
}
