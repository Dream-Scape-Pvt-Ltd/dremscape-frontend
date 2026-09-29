import homeSources from '../../scripts/figma-assets.json';
import destinationSources from '../../scripts/destination-assets.json';
const sources = { ...homeSources, ...destinationSources };
export function asset(name: keyof typeof sources | string) {
  if(/^https?:\/\//.test(name)) return name;
  if(name.startsWith('/images/trek-memories/')) return name;
  if(name.startsWith('/images/') || name.startsWith('/svg/')) return name;
  const url = (sources as Record<string, string>)[name];
  if (!url) throw new Error(`Unknown design asset: ${name}`);
  const ext = url.split('.').pop();
  if (ext === 'svg') return `/svg/${name}.svg`;
  return `/images/${name}.${ext}`;
}

