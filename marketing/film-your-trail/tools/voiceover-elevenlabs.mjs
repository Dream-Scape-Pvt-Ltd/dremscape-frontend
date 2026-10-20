// Voiceover for "Your Trail" from ElevenLabs: one WAV per line, ready for audio.mjs and build.mjs.
//   ELEVENLABS_API_KEY=...  [ELEVENLABS_VOICE_ID=<voice id>]  node tools/voiceover-elevenlabs.mjs [assets/vo-eleven]
//   then: node audio.mjs --vo assets/vo-eleven --out soundtrack-eleven   (or write straight into assets/vo)
// Needs api.elevenlabs.io allowed in the environment's network settings and the key stored as an environment secret.
// Each line is sent with the lines around it (previous_text / next_text) so the read flows like one take.
import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', process.argv[2] || 'assets/vo-eleven');
const KEY = process.env.ELEVENLABS_API_KEY;
const VOICE = process.env.ELEVENLABS_VOICE_ID || 'nPczCjzI2devNBz1zQrb';    // "Brian": a warm, deep American narrator (premade)
const MODEL = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
if (!KEY) { console.error('set ELEVENLABS_API_KEY (environment secret)'); process.exit(1); }

const LINES = [
  ['walk', 'Some trails you walk.'],
  ['stay', 'Some trails stay with you.'],
  ['since', 'Since 2005, our team in Kathmandu has planned journeys through the Himalaya.'],
  ['tell', 'Tell us where you want to go,'],
  ['climb', 'and how hard you want to climb.'],
  ['shape', "We'll shape the route around you."],
  ['idea', 'Share your idea.'],
  ['talk', 'Talk it through.'],
  ['plan', "Get a plan that's yours."],
  ['brand', 'Dreamscape Treks.'],
  ['beyond', 'Himalaya, and beyond.'],
];
mkdirSync(out, { recursive: true });
const meta = [];
for (let i = 0; i < LINES.length; i++) {
  const [id, text] = LINES[i];
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_192`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({
      text, model_id: MODEL,
      previous_text: LINES.slice(Math.max(0, i - 2), i).map((l) => l[1]).join(' ') || undefined,
      next_text: LINES.slice(i + 1, i + 3).map((l) => l[1]).join(' ') || undefined,
      voice_settings: { stability: 0.42, similarity_boost: 0.8, style: 0.18, use_speaker_boost: true },
    }),
  });
  if (!res.ok) { console.error(id, res.status, await res.text()); process.exit(1); }
  const mp3 = join(out, id + '.mp3'), wav = join(out, id + '.wav');
  writeFileSync(mp3, Buffer.from(await res.arrayBuffer()));
  // 48 kHz mono, leading/trailing silence trimmed (40 ms kept before, 90 ms after), level matched to -20 dBFS RMS
  const r = spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', mp3, '-ac', '1', '-ar', '48000',
    '-af', 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.04,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.09,areverse,loudnorm=I=-20:TP=-3:LRA=7',
    '-c:a', 'pcm_s16le', wav]);
  if (r.status !== 0) { console.error(String(r.stderr)); process.exit(1); }
  const d = Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav], { encoding: 'utf8' }).stdout);
  meta.push({ id, text, duration: Math.round(d * 1000) / 1000 }); console.log(id, d.toFixed(2), text);
  spawnSync('rm', [mp3]);
}
writeFileSync(join(out, 'lines.json'), JSON.stringify(meta, null, 1));
console.log('wrote', out);
