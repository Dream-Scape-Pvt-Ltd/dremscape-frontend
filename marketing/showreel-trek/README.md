# Dreamscape Treks — "Step by Step" (24 s motion showreel for trekkers)

A 1920×1080, 60 fps film built entirely from `window.seek(t)` (no CSS animation, no timers, no carried state). It is authored on a 15 s / 120 BPM grid and played 1.6× slower, so it runs 24 s at 75 BPM and every idea has room to be read. The first and the last frame are the same poster, so it loops. Story and beat table: [storyboard.md](storyboard.md).

One gold dot, the trekker, takes one step per beat. Every surface it lands on becomes the next scene: the poster splits into stairs, the stairs carry the words, extrude into 3D, flatten into a chart of the highest peaks, sharpen into the range itself, and the range opens into real photographs.

```bash
cd marketing/showreel-trek
python3 tools/prep-photos.py assets/    # grade the site's trek photos into the film palette (already run; assets/ is committed)
node build.mjs [--4k]                   # inline font + photos + traced logo + engine -> dist/trek[-4k].html
node audio.mjs                          # score + sample-based sound design -> out/soundtrack.wav (-14 LUFS)
node render.mjs --scale 2 --html dist/trek-4k.html --out out/dreamscape-step-by-step-4k.mp4 --also-1080p
node preview.mjs <dir> beats            # one frame per beat; or give output seconds: 3.2 9.6 ...
node qa.mjs <dir>                       # every 60 fps frame at 480x270 for frame-to-frame checks
```

- `src/core.js` easing, polygon utilities · `src/scenes1.js` poster, columns, lockup, kinetic type, the dot · `src/scenes2.js` the 3D staircase · `src/scenes3.js` chart, peaks, sunrise, photo panels, 3D photo letters, end title · `src/timeline.js` hit times and the sound cue sheet.
- Photos are the site's own `public/images/trek-memories/*` field photographs (Langtang valley), graded to the forest / mist / paper palette by `tools/prep-photos.py`.
- Facts on screen: *Nepal treks, shaped around you.*, *Personally planned journeys.*, *Himalaya & Beyond*, *Plan my journey*, and the region names from the Treks menu. The peak heights (Langtang Lirung 7,227 m, Annapurna I 8,091 m, Manaslu 8,163 m, Everest 8,849 m) are standard published figures: check them before publishing.
