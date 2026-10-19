// Renders the soundtrack (src/audio.js) to out/soundtrack.wav via an OfflineAudioContext inside headless Chromium.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(here, 'out'), { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.goto('about:blank');
await page.addScriptTag({ content: readFileSync(join(here, 'src/timeline.js'), 'utf8') });
await page.addScriptTag({ content: readFileSync(join(here, 'src/audio.js'), 'utf8') });
const res = await page.evaluate(() => window.renderAudio());
await browser.close();

const pcm = Buffer.from(res.pcm, 'base64');
const hdr = Buffer.alloc(44);
hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write('WAVEfmt ', 8);
hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22); hdr.writeUInt32LE(res.sr, 24);
hdr.writeUInt32LE(res.sr * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34); hdr.write('data', 36); hdr.writeUInt32LE(pcm.length, 40);
writeFileSync(join(here, 'out/soundtrack.wav'), Buffer.concat([hdr, pcm]));
console.log('soundtrack.wav', (res.frames / res.sr).toFixed(3) + 's', 'raw peak', res.peak.toFixed(3));
