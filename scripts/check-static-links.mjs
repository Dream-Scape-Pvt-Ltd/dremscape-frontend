import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(dir,entry.name)):[path.join(dir,entry.name)]);}
const pages=files(path.join(root,'src','app')).filter(file=>path.basename(file)==='page.tsx');
const routes=pages.map(file=>{
  const parts=path.relative(path.join(root,'src','app'),path.dirname(file)).split(path.sep).filter(part=>part&&!(part.startsWith('(')&&part.endsWith(')')));
  const route='/'+parts.join('/');
  return new RegExp('^'+route.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\\\[\\\[\\\.\\\.\\\.([^/]+)\\\]\\\]/g,'.*').replace(/\\\[([^/]+)\\\]/g,'[^/]+')+'/?$');
});
const sources=files(path.join(root,'src')).filter(file=>/\.(tsx|ts)$/.test(file));
const missing=[];let checked=0;
for(const source of sources){
  const body=fs.readFileSync(source,'utf8');
  for(const match of body.matchAll(/\bhref\s*(?:=|:)\s*(['"])(\/[^'"]*)\1/g)){
    const url=match[2];
    if(url.includes('${')||url.startsWith('/api/')||url.startsWith('/images/')||url.startsWith('/icons/'))continue;
    const route=url.split(/[?#]/)[0]||'/';checked++;
    if(!routes.some(pattern=>pattern.test(route)))missing.push(`${path.relative(root,source)} → ${url}`);
  }
}
console.log(`Checked ${checked} literal internal links against ${routes.length} page routes.`);
if(missing.length){console.error('No matching page route:\n'+missing.join('\n'));process.exitCode=1;}
