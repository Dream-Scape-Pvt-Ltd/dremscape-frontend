import homeSources from '../../scripts/figma-assets.json';
import destinationSources from '../../scripts/destination-assets.json';
const sources = { ...homeSources, ...destinationSources };
export function asset(name: keyof typeof sources | string) {
  if(name.startsWith('/images/trek-memories/')) return name;
  const url = (sources as Record<string, string>)[name];
  if (!url) throw new Error(`Unknown design asset: ${name}`);
  return `/images/${name}.${url.split('.').pop()}`;
}
