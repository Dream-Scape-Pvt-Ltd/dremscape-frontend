# Dreamscape Treks — "Your Trail" (32.5 s, with voiceover)

A calm, voice-led brand film built from the site's own trek photographs, its real journey finder, and its own words. Every frame is drawn by `window.seek(t)` (no CSS animation, no timers); the soundtrack is written in code to the same timeline.

## Script (voice: Kokoro-82M `am_michael`, generated offline)

| Time | Picture | Voice |
|---|---|---|
| 0.0 | Last light on the peaks, slow push | *Some trails you walk.* |
| 2.5 | Whip pan to three trekkers, arms up | *Some trails stay with you.* |
| 5.0 | Tilt up into Kathmandu at night, **Since 2005**, *Our team · Thamel, Kathmandu* | *Since 2005, our team in Kathmandu has planned journeys through the Himalaya.* |
| 10.0 | Whip pan to sunrise on the range | |
| 12.5 | The photo racks out of focus; the site's finder rises. Camera leans in: Destination → **Nepal**, Difficulty → **Normal**, **Find my trek** | *Tell us where you want to go, and how hard you want to climb.* |
| 17.5 | The button becomes a gold dot; an iris opens on walkers resting on a ridge; the dot draws a route toward the range. **Shaped around you.** | *We'll shape the route around you.* |
| 20.0 | Whip pan to *Make the trail your own*: 01 Share your idea · 02 Talk through the route · 03 Review a personal proposal, beside a summit photo | *Share your idea. Talk it through. Get a plan that's yours.* |
| 25.0 | The photo opens to full frame; the lockup assembles | *Dreamscape Treks. Himalaya, and beyond.* |
| 29.4 | **Plan my journey →** · dreamscapetreks.com | |

All copy is the site's own (hero, finder options, tailor-made steps, photo captions, address). Photos: `public/images/trek-memories/` (together-in-the-mountains, last-light, nightfall-over-valley, home-slide-2, a-pause-on-the-ridge, prayer-flags-and-friends), graded by `tools/prep-photos.py`.

## Music

D major, 96 BPM, 13 bars of 2.5 s; every scene change sits on a bar line and every finder click on a beat. Felt piano motif over low strings (bars 1-5), a soft pulse under the website moment (6-10, kick on 1 and 3, shaker, muted plucks), a short build with toms and a reversed swell into the logo, which lands on D (bar 11), then the motif rings out. The music ducks about 7-10 dB under every voice line; measured voice-over-music in the speech band is 10-23 dB.

## Build

```bash
cd marketing/film-your-trail
python3 tools/prep-photos.py assets/            # grade photos (already done; assets are committed)
# voiceover (already done; assets/vo is committed) — see tools/voiceover.py for the one-time model setup
node build.mjs [--4k]                           # -> dist/film[-4k].html
node audio.mjs                                  # score + voice + sound design -> out/soundtrack.wav (-14 LUFS); `music|vo|sfx <refPeak>` for stems
node render.mjs --scale 2 --html dist/film-4k.html --out out/dreamscape-your-trail-4k.mp4 --also-1080p --dur 32.5
node preview.mjs <dir> beats | <times...>       # stills
node qa.mjs <dir>                               # every 60 fps frame at 480x270, for pop / hold checks
```

- `src/engine.js` picture · `src/score.js` music, voice mix and ducking · `src/timeline.js` voice placement, cuts, clicks, sound cues.
- Voice: Kokoro-82M (Apache-2.0) via `kokoro-onnx`, weights from the npm package `kokoro-q8-shards`, voice styles from `kokoro-js`; the model is not committed.
- Sound effects: CC0 samples from `../sfx-bank`.
