// Renders the soundtrack (src/score.js: score + voiceover + sound design) to out/soundtrack.wav in headless Chromium,
// then normalises it to -14 LUFS / -1 dBTP.   node audio.mjs [music|vo|sfx <refPeak>]  writes stems for mix checks.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadBank } from '../sfx-bank/load.mjs';

const here = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(here, 'out'), { recursive: true });
const VO_RAW = {};
for (const f of readdirSync(join(here, 'assets/vo')).filter((n) => n.endsWith('.wav'))) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', join(here, 'assets/vo', f), '-f', 'f32le', '-ac', '1', '-ar', '24000', '-'], { maxBuffer: 1 << 26 });
  VO_RAW[f.replace(/\.wav$/, '')] = r.stdout.toString('base64');
}
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.goto('about:blank');
await page.evaluate(({ bank, vo, m, ref }) => { window.SFX_BANK = bank; window.VO_RAW = vo; if (m) { window.__AUDIO_MODE = m; window.__REF_PEAK = ref || undefined; } },
  { bank: loadBank(), vo: VO_RAW, m: process.argv[2] || null, ref: Number(process.argv[3] || 0) });
await page.addScriptTag({ content: readFileSync(join(here, 'src/timeline.js'), 'utf8') });
await page.addScriptTag({ content: readFileSync(join(here, 'src/score.js'), 'utf8') });
const res = await page.evaluate(() => window.renderAudio());
await browser.close();

const pcm = Buffer.from(res.pcm, 'base64'), hdr = Buffer.alloc(44);
hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write('WAVEfmt ', 8); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22);
hdr.writeUInt32LE(res.sr, 24); hdr.writeUInt32LE(res.sr * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34); hdr.write('data', 36); hdr.writeUInt32LE(pcm.length, 40);
const suffix = process.argv[2] ? '.' + process.argv[2] : '';
const raw = join(here, `out/soundtrack.raw${suffix}.wav`);
writeFileSync(raw, Buffer.concat([hdr, pcm]));
console.log('raw peak', res.peak.toFixed(4), (res.frames / res.sr).toFixed(2) + 's');
if (process.argv[2]) process.exit(0);
const target = 'I=-14:TP=-1.0:LRA=11';
const m = spawnSync('ffmpeg', ['-hide_banner', '-i', raw, '-af', `loudnorm=${target}:print_format=json`, '-f', 'null', '-'], { encoding: 'utf8' });
const j = JSON.parse(m.stderr.slice(m.stderr.lastIndexOf('{'), m.stderr.lastIndexOf('}') + 1));
const af = `loudnorm=${target}:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
const r = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', raw, '-af', af, '-ar', '48000', '-c:a', 'pcm_s16le', join(here, 'out/soundtrack.wav')]);
if (r.status !== 0) { console.error(String(r.stderr)); process.exit(1); }
console.log(`soundtrack.wav (measured ${j.input_i} LUFS -> -14 LUFS)`);
