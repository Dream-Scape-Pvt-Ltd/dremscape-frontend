import type * as Leaflet from 'leaflet';

const OSM='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';
// OpenTopoMap shows contours and trails; standard OpenStreetMap tiles take over if it struggles.
const TOPO={url:'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',options:{subdomains:'abc',maxZoom:17,attribution:`Map data ${OSM}, SRTM · Style &copy; <a href="https://opentopomap.org" target="_blank" rel="noopener noreferrer">OpenTopoMap</a> (CC-BY-SA)`}};
const STANDARD={url:'https://tile.openstreetmap.org/{z}/{x}/{y}.png',options:{maxZoom:19,attribution:OSM}};
const MAX_TOPO_ERRORS=4;

/** Free, keyless base map for when Google Maps is unavailable. */
export function addFreeTiles(L:typeof Leaflet,map:Leaflet.Map){
  let errors=0;
  const topo=L.tileLayer(TOPO.url,TOPO.options).addTo(map);
  topo.on('tileerror',()=>{
    if(++errors!==MAX_TOPO_ERRORS)return;
    map.removeLayer(topo);
    L.tileLayer(STANDARD.url,STANDARD.options).addTo(map);
  });
}

export const roundCoordinate=(value:number)=>Number(value.toFixed(7));
