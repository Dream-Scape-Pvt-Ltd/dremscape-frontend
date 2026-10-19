// Decodes bank files with ffmpeg to 48 kHz mono float32 and returns { 'pack/cue': base64 } for injection into the audio page.
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export function loadBank() {
  const out = {};
  for (const pack of readdirSync(here, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    for (const f of readdirSync(join(here, pack.name)).filter((n) => n.endsWith('.mp3'))) {
      const r = spawnSync('ffmpeg', ['-v', 'error', '-i', join(here, pack.name, f), '-f', 'f32le', '-ac', '1', '-ar', '48000', '-'], { maxBuffer: 1 << 26 });
      if (r.status !== 0 || !r.stdout.length) throw new Error('decode failed: ' + pack.name + '/' + f);
      out[`${pack.name}/${f.replace(/\.mp3$/, '')}`] = r.stdout.toString('base64');
    }
  }
  return out;
}
