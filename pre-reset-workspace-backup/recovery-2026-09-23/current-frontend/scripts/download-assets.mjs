import { readFile, mkdir, writeFile } from 'node:fs/promises';
const assets = JSON.parse(await readFile(new URL(process.argv[2] === 'destinations' ? './destination-assets.json' : './figma-assets.json', import.meta.url), 'utf8'));
await mkdir(new URL('../public/images/', import.meta.url), { recursive: true });
await mkdir(new URL('../public/svg/', import.meta.url), { recursive: true });
for (const [name, url] of Object.entries(assets)) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${name}: ${response.status}`);
  const ext = url.split('.').pop();
  const folder = ext === 'svg' ? 'svg' : 'images';
  await writeFile(new URL(`../public/${folder}/${name}.${ext}`, import.meta.url), Buffer.from(await response.arrayBuffer()));
  console.log(name);
}

