# Dreamscape Treks — "One Trail" (15 s motion showreel)

A 1920×1080, 60 fps, 120 BPM motion-design film built entirely from `window.seek(t)`: no CSS animation, no timers, no carried state. The first frame and the last frame are the same lockup, so it loops. Beat table and the facts it draws on: [storyboard.md](storyboard.md).

One gold line is the through-line. It is the ridge of the logo, then the site's dotted trail, a card's edge, a chart line, the edge of a wipe, and a ribbon behind the type, and every shot grows out of the one before it (no cuts, no fades).

```bash
cd marketing/showreel-motion
node build.mjs [--4k]       # inline font + photo + traced logo/letters/landscape + engine -> dist/motion[-4k].html
node audio.mjs              # score + sample-based sound design -> out/soundtrack.wav (-14 LUFS); `music|sfx <refPeak>` for stems
node render.mjs --scale 2 --html dist/motion-4k.html --out out/dreamscape-one-trail-4k.mp4 --also-1080p
node preview.mjs <dir> beats          # one frame per beat; or give times: 1.2 4.25 ...
node qa.mjs <dir>                     # every 60 fps frame at 480x270, for frame-to-frame diff checks
```

Needs Node 20+, Chromium (Playwright from the repo's `node_modules`), ffmpeg with libx264/aac and Python 3 + Pillow only for `tools/prep-landscape.py`.

- `src/core.js` – easing (exponential, critically-damped, spring), DOM helper, polygon resample/morph utilities.
- `src/scenes1.js` – lockup, kinetic type, the gold line (`lineState`), push through the O, circle → triangle → mark morph with iris wipe.
- `src/scenes2.js` – the mark extruded as 14 paper-cut slices, then the layered Dreamscape landscape built inside its silhouette (2D → 3D).
- `src/scenes3.js` – chart card, odometer, photo reveal, HIMALAYA knock-out and the push through the A, 3D DREAMSCAPE, hand-off to the end title.
- `src/timeline.js` – hit times and the sound-design cue sheet (each cue mirrors a visual event; the odometer ticks are computed from the same curve).
- `../sfx-bank/` – CC0 interface sound samples and the shared score engine (`engine.js`) used by this film and by `../showreel`.
- `assets/` – Plus Jakarta Sans, the traced logo (`logo.json`, per-letter outlines in `letters.json`), the Dreamscape landscape split into depth layers and recoloured to the brand palette (`landscape.json`, from `public/images/dreamscape-landscape-vector.svg` via `tools/prep-landscape.py`), and a duotone grade of `public/images/trek-memories/sunlit-summits.jpg`.
