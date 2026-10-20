// Downloads the instrument samples into ./samples (not committed; ~95 MB) from the npm registry, pinned:
//   Salamander Grand Piano V3 (Alexander Holm, CC BY 3.0) as packaged by @audio-samples/piano-mp3-*, velocity
//   layers 3-13 plus key-release noises, and GeneralUser GS v1.471 (S. Christian Collins, free for commercial music).
//   node fetch.mjs
import { mkdirSync, mkdtempSync, readdirSync, renameSync, existsSync, rmSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'samples');
const PIANO = [3, 5, 7, 9, 11, 13].map((v) => [`@audio-samples/piano-mp3-velocity${v}@1.0.5`, `piano/v${v}`]);
const PKGS = [...PIANO, ['@audio-samples/piano-mp3-release@1.0.5', 'piano/release'], ['generaluser@1.47.1', 'generaluser']];

const run = (cmd, args, cwd) => {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')}\n${r.stderr}`);
  return r.stdout.trim();
};
for (const [spec, dest] of PKGS) {
  const to = join(out, dest);
  if (existsSync(to)) { console.log('have', dest); continue; }
  const tmp = mkdtempSync(join(tmpdir(), 'mk-'));
  const tgz = run('npm', ['pack', spec, '--silent'], tmp).split('\n').pop();
  run('tar', ['-xzf', tgz], tmp);
  mkdirSync(dirname(to), { recursive: true });
  const pkg = join(tmp, 'package');
  if (dest === 'generaluser') {
    mkdirSync(to, { recursive: true });
    for (const f of ['GeneralUser.sf2', 'LICENSE.txt', 'README.md']) copyFileSync(join(pkg, f), join(to, f));
  } else {
    renameSync(join(pkg, 'audio'), to);
    for (const f of ['LICENSE', 'README.md']) if (existsSync(join(pkg, f))) copyFileSync(join(pkg, f), join(to, f));
  }
  rmSync(tmp, { recursive: true, force: true });
  console.log('got', spec, '->', dest, `(${readdirSync(to).length} files)`);
}
