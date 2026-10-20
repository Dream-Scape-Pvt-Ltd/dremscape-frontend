# Dreamscape Treks — 15 s showreel

A 1920×1080, 60 fps marketing film built entirely from `window.seek(t)` (no CSS animation, no timers, no carried state). It is authored on a 15 s / 120 BPM grid and played 1.7× slower (25.5 s, about 71 BPM) so every step can be read; the factor is `k` in `src/timeline.js`. Every spring is critically damped (nothing bounces) and the camera glides are soft. Story and beat table: [storyboard.md](storyboard.md). Finals: `out/dreamscape-showreel-4k.mp4` (3840×2160), `out/dreamscape-showreel-1080p.mp4`, soundtrack `out/dreamscape-showreel-soundtrack.mp3`.

```bash
cd marketing/showreel
node build.mjs [--4k]   # inline font + photos + traced logo + engine -> dist/showreel[-4k].html (--4k Lanczos-upscales the photos)
node music.mjs          # the score on real instruments + keystrokes + mouse clicks -> out/stems/*.wav (needs ../music-kit set up)
node audio.mjs          # mix (OfflineAudioContext), normalised to -14 LUFS -> out/soundtrack.wav
node audio.mjs music|sfx <refPeak>   # stems for mix analysis
node render.mjs --scale 2 --html dist/showreel-4k.html --out out/dreamscape-showreel-4k.mp4 --also-1080p   # then rename ...-4k-1080p.mp4 to ...-1080p.mp4
                        # 60 fps x 3 sub-frames, chunked ffmpeg tmix blend, mux (omit the flags for plain 1080p)
node preview.mjs <dir> beats          # one frame per beat to <dir>
node preview.mjs <dir> 1.2 4.25 ...   # arbitrary times
```

Needs Node 20+, Chromium (Playwright from the repo's `node_modules`) and ffmpeg with libx264/aac.

- `src/template.html` – the real UI rebuilt as vector layers (HTML/SVG), inlined font + photos.
- `src/engine.js` – camera, springs, token morphs, cursor, every scene as a function of time.
- `src/timeline.js` – scene changes, click times, the typing schedule ("Langtang Valley" at a person's pace: shift on capitals, a beat before the space, about 11 keys a second) and the three soft air cues. Shared by the picture and the sound.
- `music.mjs` – the score on real instruments from `../music-kit`: Salamander grand piano, GeneralUser GS strings, cello, double bass, harp, timpani and a light kit, in D major with one chord per scene. Each pick in the finder is a piano note in the chord, the three steps are harp notes, and the logo lands on D after a timpani roll and a harp glissando. It also renders every keystroke (switch tick, bottom-out, release, a deeper space bar) and mouse click.
- `src/score.js` – the mix. The music sits in a warm hall and the interface sounds in a small room. The music steps back about 7 dB while the visitor types, so the keys sit about 8 dB clear of it in their band. There is soft air on three real scene changes only.
- `assets/` – Plus Jakarta Sans (from `@fontsource-variable`), three 2048×1536 site photos (byte-for-byte copies of `public/images/trek-memories/`), and the logo traced to vector from `design-assets/logo-export`.
