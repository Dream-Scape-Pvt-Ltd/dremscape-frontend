// Renders the soundtrack (src/audio.js) to out/soundtrack.wav via an OfflineAudioContext inside headless Chromium.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, renameSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(here, 'out'), { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.goto('about:blank');
if (process.argv[2]) await page.evaluate(({ m, ref }) => { window.__AUDIO_MODE = m; window.__REF_PEAK = ref || undefined; }, { m: process.argv[2], ref: Number(process.argv[3] || 0) });
await page.addScriptTag({ content: readFileSync(join(here, 'src/timeline.js'), 'utf8') });
await page.addScriptTag({ content: readFileSync(join(here, 'src/audio.js'), 'utf8') });
const res = await page.evaluate(() => window.renderAudio());
await browser.close();

const pcm = Buffer.from(res.pcm, 'base64');
const hdr = Buffer.alloc(44);
hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write('WAVEfmt ', 8);
hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22); hdr.writeUInt32LE(res.sr, 24);
hdr.writeUInt32LE(res.sr * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34); hdr.write('data', 36); hdr.writeUInt32LE(pcm.length, 40);
const suffix = process.argv[2] ? '.' + process.argv[2] : '';
const raw = join(here, `out/soundtrack.raw${suffix}.wav`), final = join(here, `out/soundtrack${suffix}.wav`);
writeFileSync(raw, Buffer.concat([hdr, pcm]));

// two-pass EBU R128 normalisation to -14 LUFS / -1.5 dBTP (web delivery level)
const target = 'I=-14:TP=-1.5:LRA=9';
const m = spawnSync('ffmpeg', ['-hide_banner', '-i', raw, '-af', `loudnorm=${target}:print_format=json`, '-f', 'null', '-'], { encoding: 'utf8' });
const j = JSON.parse(m.stderr.slice(m.stderr.lastIndexOf('{'), m.stderr.lastIndexOf('}') + 1));
const af = `loudnorm=${target}:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
const r = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', raw, '-af', af, '-ar', '48000', '-c:a', 'pcm_s16le', final]);
if (r.status !== 0) { console.error(String(r.stderr)); process.exit(1); }
console.log('raw peak', res.peak.toFixed(4));
if (process.argv[2]) process.exit(0);   // stems are for mix analysis only (no loudness normalisation)
console.log('soundtrack.wav', (res.frames / res.sr).toFixed(3) + 's', `(measured ${j.input_i} LUFS -> -14 LUFS)`);
