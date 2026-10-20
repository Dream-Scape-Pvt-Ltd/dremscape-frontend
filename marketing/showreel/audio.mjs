// Renders the soundtrack (src/score.js: music stems from music.mjs + interface sounds + air) in headless Chromium,
// then normalises it to -14 LUFS / -1 dBTP.
//   node music.mjs                         first: the score's stems (out/stems/*.wav)
//   node audio.mjs                         -> out/soundtrack.wav
//   node audio.mjs music|sfx <refPeak>     stems for mix checks (out/soundtrack.raw.<mode>.wav)
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const mode = ['music', 'sfx'].includes(process.argv[2]) ? process.argv[2] : null;
mkdirSync(join(here, 'out'), { recursive: true });
const f32 = (file) => spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-f', 'f32le', '-ac', '2', '-ar', '48000', '-'], { maxBuffer: 1 << 28 }).stdout;
const stemDir = join(here, 'out/stems');
if (!existsSync(join(stemDir, 'stems.json'))) { console.error('no stems: run `node music.mjs` first'); process.exit(1); }
const FILES = {}, stems = JSON.parse(readFileSync(join(stemDir, 'stems.json'), 'utf8')).stems;
for (const k of stems) FILES[k] = f32(join(stemDir, k + '.wav'));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.route('https://media.local/**', (route) => {               // the PCM is served over a routed origin (too big for evaluate)
  const name = decodeURIComponent(new URL(route.request().url()).pathname.slice(1));
  route.fulfill(name ? { body: FILES[name], contentType: 'application/octet-stream' } : { body: '<!doctype html><title>mix</title>', contentType: 'text/html' });
});
await page.goto('https://media.local/');
await page.evaluate(async ({ stems, m, ref }) => {
  window.STEMS = {};
  for (const k of stems) window.STEMS[k] = new Float32Array(await (await fetch('/' + k)).arrayBuffer());
  if (m) { window.__AUDIO_MODE = m; window.__REF_PEAK = ref || undefined; }
}, { stems, m: mode, ref: Number(process.argv[3] || 0) });
await page.addScriptTag({ content: readFileSync(join(here, 'src/timeline.js'), 'utf8') });
await page.addScriptTag({ content: readFileSync(join(here, 'src/score.js'), 'utf8') });
const res = await page.evaluate(() => window.renderAudio());
await browser.close();

const pcm = Buffer.from(res.pcm, 'base64'), hdr = Buffer.alloc(44);
hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write('WAVEfmt ', 8); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22);
hdr.writeUInt32LE(res.sr, 24); hdr.writeUInt32LE(res.sr * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34); hdr.write('data', 36); hdr.writeUInt32LE(pcm.length, 40);
const raw = join(here, `out/soundtrack.raw${mode ? '.' + mode : ''}.wav`);
writeFileSync(raw, Buffer.concat([hdr, pcm]));
console.log('raw peak', res.peak.toFixed(4), (res.frames / res.sr).toFixed(2) + 's');
if (mode) process.exit(0);
const target = 'I=-14:TP=-1.0:LRA=11';
const m = spawnSync('ffmpeg', ['-hide_banner', '-i', raw, '-af', `loudnorm=${target}:print_format=json`, '-f', 'null', '-'], { encoding: 'utf8' });
const j = JSON.parse(m.stderr.slice(m.stderr.lastIndexOf('{'), m.stderr.lastIndexOf('}') + 1));
const af = `loudnorm=${target}:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
const r = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', raw, '-af', af, '-ar', '48000', '-c:a', 'pcm_s16le', join(here, 'out/soundtrack.wav')]);
if (r.status !== 0) { console.error(String(r.stderr)); process.exit(1); }
console.log(`soundtrack.wav (measured ${j.input_i} LUFS -> -14 LUFS)`);
