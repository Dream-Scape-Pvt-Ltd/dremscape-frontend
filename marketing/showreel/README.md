# Dreamscape Treks — 15 s showreel

A 1920×1080, 60 fps, 120 BPM marketing film built entirely from `window.seek(t)` (no CSS animation, no timers, no carried state). Story and beat table: [storyboard.md](storyboard.md). Finals: `out/dreamscape-showreel-4k.mp4` (3840×2160), `out/dreamscape-showreel-1080p.mp4`, soundtrack `out/dreamscape-showreel-soundtrack.mp3`.

```bash
cd marketing/showreel
node build.mjs [--4k]   # inline font + photos + traced logo + engine -> dist/showreel[-4k].html (--4k Lanczos-upscales the photos)
node audio.mjs          # score + UI sound design (Web Audio, OfflineAudioContext), normalised to -14 LUFS -> out/soundtrack.wav
node audio.mjs music|sfx <refPeak>   # stems for mix analysis
node render.mjs --scale 2 --html dist/showreel-4k.html --out out/dreamscape-showreel-4k.mp4 --also-1080p
                        # 60 fps x 3 sub-frames, chunked ffmpeg tmix blend, mux (omit the flags for plain 1080p)
node preview.mjs <dir> beats          # one frame per beat to <dir>
node preview.mjs <dir> 1.2 4.25 ...   # arbitrary times
```

Needs Node 20+, Chromium (Playwright from the repo's `node_modules`) and ffmpeg with libx264/aac.

- `src/template.html` – the real UI rebuilt as vector layers (HTML/SVG), inlined font + photos.
- `src/engine.js` – camera, springs, token morphs, cursor, every scene as a function of time.
- `src/timeline.js` – hit / click times and the sound-design cue sheet (every cue mirrors a visual event).
- `src/audio.js` – warm D-major score (soft kick on every beat tuned to the chord root, pads, bells, bass) + Apple-style UI sound design: glass taps, ticks, a full keyboard model (key-down/up, shift, space, per-key pan), swipes, whooshes, pops, selection chimes, send and success.
- `assets/` – Plus Jakarta Sans (from `@fontsource-variable`), three 2048×1536 site photos (byte-for-byte copies of `public/images/trek-memories/`), and the logo traced to vector from `design-assets/logo-export`.
