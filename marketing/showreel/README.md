# Dreamscape Treks — 15 s showreel

A 1920×1080, 60 fps, 120 BPM marketing film built entirely from `window.seek(t)` (no CSS animation, no timers, no carried state). Story and beat table: [storyboard.md](storyboard.md). Final file: `out/dreamscape-showreel.mp4`.

```bash
cd marketing/showreel
node build.mjs     # inline font + photos + traced logo + engine  ->  dist/showreel.html
node audio.mjs     # soundtrack (Web Audio, OfflineAudioContext)  ->  out/soundtrack.wav
node render.mjs    # 60 fps x 3 sub-frames, ffmpeg tmix blend, mux ->  out/dreamscape-showreel.mp4
node preview.mjs <dir> beats          # one frame per beat to <dir>
node preview.mjs <dir> 1.2 4.25 ...   # arbitrary times
```

Needs Node 20+, Chromium (Playwright from the repo's `node_modules`) and ffmpeg with libx264/aac.

- `src/template.html` – the real UI rebuilt as vector layers (HTML/SVG), inlined font + photos.
- `src/engine.js` – camera, springs, token morphs, cursor, every scene as a function of time.
- `src/timeline.js` – hit / click times shared by picture and sound.
- `src/audio.js` – the synth.
- `assets/` – Plus Jakarta Sans (from `@fontsource-variable`), three 2048×1536 site photos (byte-for-byte copies of `public/images/trek-memories/`), and the logo traced to vector from `design-assets/logo-export`.
